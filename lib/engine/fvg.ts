import { Candle, FVG } from "./types";

export function detectFVG(candles: Candle[]): FVG[] {
  const result: FVG[] = [];
  if (candles.length < 3) return result;
  for (let i = 2; i < candles.length; i++) {
    const c1 = candles[i - 2];
    const c3 = candles[i];
    const now = candles[i].ts;

    const price = c3.close;
    const minGap = price * 0.0005; // 0.05% of price as minimum meaningful gap

    if (c1.high < c3.low) {
      const low = c1.high;
      const high = c3.low;
      if (high - low < minGap) continue;
      result.push({
        low,
        high,
        direction: "LONG",
        createdAt: now,
        size: high - low,
        filledPercent: 0,
      });
    }

    if (c1.low > c3.high) {
      const high = c1.low;
      const low = c3.high;
      if (high - low < minGap) continue;
      result.push({
        low,
        high,
        direction: "SHORT",
        createdAt: now,
        size: high - low,
        filledPercent: 0,
      });
    }
  }

  const lastClose = candles[candles.length - 1]?.close;
  if (lastClose) {
    for (const gap of result) {
      if (gap.direction === "LONG") {
        if (lastClose <= gap.high && lastClose >= gap.low) {
          const distance = gap.high - gap.low;
          gap.filledPercent = ((lastClose - gap.low) / distance) * 100;
        }
      } else if (lastClose >= gap.low && lastClose <= gap.high) {
        const distance = gap.high - gap.low;
        gap.filledPercent = ((gap.high - lastClose) / distance) * 100;
      }
    }
  }

  return result;
}
