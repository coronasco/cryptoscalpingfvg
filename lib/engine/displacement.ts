import { Candle, Displacement, Direction } from "./types";

function calcATR(candles: Candle[], period = 14) {
  if (candles.length < period + 1) return 0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const prev = candles[i - 1];
    const highLow = current.high - current.low;
    const highClose = Math.abs(current.high - prev.close);
    const lowClose = Math.abs(current.low - prev.close);
    trs.push(Math.max(highLow, highClose, lowClose));
  }
  const slice = trs.slice(-period);
  return slice.reduce((acc, cur) => acc + cur, 0) / slice.length;
}

export function detectDisplacement(
  candles: Candle[],
  direction: Exclude<Direction, "NEUTRAL">,
  fromTs?: number,
  atrMultiplier = 0.9,
): Displacement | null {
  if (!candles.length) return null;
  const filtered = fromTs ? candles.filter((c) => c.ts >= fromTs) : candles;
  if (filtered.length < 2) return null;

  const atr = calcATR(candles);
  const window = filtered.slice(-20).reverse();
  for (const candle of window) {
    const body = Math.abs(candle.close - candle.open);
    const dir = candle.close > candle.open ? "LONG" : "SHORT";
    if (dir !== direction) continue;
    if (atr === 0) continue;
    const atrRatio = body / atr;
    if (atrRatio >= atrMultiplier) {
      return {
        at: candle.ts,
        body,
        atrRatio,
        direction,
      };
    }
  }
  return null;
}
