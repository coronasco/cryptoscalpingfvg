import crypto from "crypto";
import { detectDisplacement } from "./displacement";
import { computeBias } from "./bias";
import { detectFVG } from "./fvg";
import { detectSweeps } from "./sweep";
import { scoreSetup } from "./scoring";
import { Bias, Candle, Direction, Setup, SetupStatus } from "./types";

function deterministicId(symbol: string, createdAt: number, fvgLow: number, fvgHigh: number) {
  const hex = crypto
    .createHash("sha1")
    .update(`${symbol}-${createdAt}-${fvgLow.toFixed(5)}-${fvgHigh.toFixed(5)}`)
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function findSwing(candles: Candle[], direction: Direction): number | null {
  if (!candles.length) return null;
  const window = candles.slice(-40);
  if (direction === "LONG") {
    return Math.max(...window.map((c) => c.high));
  }
  if (direction === "SHORT") {
    return Math.min(...window.map((c) => c.low));
  }
  return null;
}

function findMajorSwing(candles: Candle[], direction: Direction): number | null {
  if (!candles.length) return null;
  const window = candles.slice(-120);
  if (direction === "LONG") {
    return Math.max(...window.map((c) => c.high));
  }
  if (direction === "SHORT") {
    return Math.min(...window.map((c) => c.low));
  }
  return null;
}

function bufferFromAtr(candles: Candle[]) {
  if (candles.length < 5) return 0.1;
  const slice = candles.slice(-15);
  const ranges = slice.map((c) => c.high - c.low);
  const avg = ranges.reduce((a, b) => a + b, 0) / ranges.length;
  return avg * 0.3; // wider safety buffer for precise SL
}

function deriveStatus({
  direction,
  lastPrice,
  entry,
  sl,
  tp1,
  fvgLow,
  fvgHigh,
  createdAt,
}: {
  direction: Exclude<Direction, "NEUTRAL">;
  lastPrice: number;
  entry: number;
  sl: number;
  tp1: number;
  fvgLow: number;
  fvgHigh: number;
  createdAt: number;
}): SetupStatus {
  if (direction === "LONG") {
    if (lastPrice <= sl) return "SL";
    if (lastPrice >= tp1) return "TP1";
    if (lastPrice >= entry) return "FILLED";
    if (lastPrice >= fvgLow && lastPrice <= fvgHigh) return "TRIGGERED";
  } else {
    if (lastPrice >= sl) return "SL";
    if (lastPrice <= tp1) return "TP1";
    if (lastPrice <= entry) return "FILLED";
    if (lastPrice <= fvgHigh && lastPrice >= fvgLow) return "TRIGGERED";
  }

  const ageMinutes = (Date.now() - createdAt) / 60000;
  if (ageMinutes > 180) return "EXPIRED";
  return "WAITING";
}

export function buildSetups(params: {
  symbol: string;
  candles15m: Candle[];
  candles1h: Candle[];
  candles1m: Candle[];
}): Setup[] {
  const { symbol, candles15m, candles1h, candles1m } = params;
  if (!candles15m.length) return [];

  const bias: Bias = computeBias(candles1h);
  const fvgs = detectFVG(candles15m);
  const sweeps = detectSweeps(candles15m);
  const lastPrice = candles1m.at(-1)?.close ?? candles15m.at(-1)?.close ?? 0;
  const buffer = bufferFromAtr(candles1m);

  const setups: Setup[] = [];
  const recentFvgs = fvgs.slice(-6).reverse(); // prioritize latest gaps

  for (const fvg of recentFvgs) {
    const direction = fvg.direction;
    if (bias !== "NEUTRAL" && bias !== direction) continue;

    const sweep = sweeps.find((s) => s.direction === direction);
    const displacement = detectDisplacement(candles15m, direction, sweep?.at, 0.85);

    const entryPrice = fvg.low + (fvg.size ?? fvg.high - fvg.low) * 0.5; // mid of gap
    const stopLoss = direction === "LONG" ? fvg.low - buffer : fvg.high + buffer;

    const tp1 = findSwing(candles15m, direction) ?? entryPrice * (direction === "LONG" ? 1.01 : 0.99);
    const tp2 = findMajorSwing(candles1h, direction) ?? entryPrice * (direction === "LONG" ? 1.03 : 0.97);

    const rrToTp1 = Math.abs(tp1 - entryPrice) / Math.max(0.0001, Math.abs(entryPrice - stopLoss));
    const ageMinutes = (Date.now() - fvg.createdAt) / 60000;
    const score = scoreSetup({
      bias,
      fvg,
      sweep,
      rr: rrToTp1,
      ageMinutes,
      status: "WAITING",
      displacementStrength: displacement?.atrRatio,
    });

    const status = deriveStatus({
      direction,
      lastPrice,
      entry: entryPrice,
      sl: stopLoss,
      tp1,
      fvgLow: fvg.low,
      fvgHigh: fvg.high,
      createdAt: fvg.createdAt,
    });

    setups.push({
      id: deterministicId(symbol, fvg.createdAt, fvg.low, fvg.high),
      symbol,
      timeframe: "15m",
      direction,
      status,
      score,
      createdAt: fvg.createdAt,
      updatedAt: Date.now(),
      fvgLow: fvg.low,
      fvgHigh: fvg.high,
      sweepLevel: sweep?.level,
      entryPrice,
      stopLoss,
      tp1,
      tp2: tp2 ?? undefined,
      tp3: undefined,
      rrToTp1,
      invalidationText:
        direction === "LONG"
          ? "Invalid if 15m close below FVG low."
          : "Invalid if 15m close above FVG high.",
      meta: {
        bias,
        displacement: displacement?.atrRatio ?? null,
        ageMinutes,
      },
    });
  }

  return setups.sort((a, b) => b.score - a.score);
}
