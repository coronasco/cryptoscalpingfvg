import { Candle, Sweep } from "./types";

export function detectSweeps(candles: Candle[], lookback = 30, threshold = 0.001): Sweep[] {
  const result: Sweep[] = [];
  if (candles.length < 5) return result;

  const window = candles.slice(-lookback);
  const last = window[window.length - 1];
  const prior = window.slice(0, -1);

  const pivotHigh = Math.max(...prior.map((c) => c.high));
  const pivotLow = Math.min(...prior.map((c) => c.low));

  if (last.high > pivotHigh * (1 + threshold) && last.close < pivotHigh) {
    result.push({
      level: pivotHigh,
      direction: "SHORT",
      at: last.ts,
      strength: (last.high - pivotHigh) / pivotHigh,
    });
  }

  if (last.low < pivotLow * (1 - threshold) && last.close > pivotLow) {
    result.push({
      level: pivotLow,
      direction: "LONG",
      at: last.ts,
      strength: (pivotLow - last.low) / pivotLow,
    });
  }

  return result;
}
