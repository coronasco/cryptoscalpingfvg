import { Candle, Direction } from "./types";

function ema(values: number[], period: number) {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const emaValues: number[] = [];
  let prevEma = values[0];
  emaValues.push(prevEma);
  for (let i = 1; i < values.length; i++) {
    const current = values[i] * k + prevEma * (1 - k);
    emaValues.push(current);
    prevEma = current;
  }
  return emaValues;
}

export function computeBias(candles: Candle[]): Direction {
  if (!candles.length) return "NEUTRAL";
  const closes = candles.map((c) => c.close);
  if (closes.length < 30) return "NEUTRAL";

  const ema50 = ema(closes, 50);
  const ema200 = ema(closes, 200);
  const last = closes[closes.length - 1];
  const e50 = ema50[ema50.length - 1];
  const e200 = ema200[ema200.length - 1];

  if (e50 > e200 && last > e50) return "LONG";
  if (e50 < e200 && last < e50) return "SHORT";
  return "NEUTRAL";
}
