import assert from "assert";
import { buildSetups } from "../lib/engine/pipeline";
import { Candle } from "../lib/engine/types";

function makeCandle(ts: number, open: number, high: number, low: number, close: number): Candle {
  return { ts, open, high, low, close, volume: 10 };
}

const candles15m: Candle[] = [
  makeCandle(1, 100, 101, 99, 100.5),
  makeCandle(2, 100.5, 102, 100.4, 101.8),
  makeCandle(3, 101.8, 103.5, 101.7, 103.2),
  makeCandle(4, 103.2, 104, 103.1, 103.6),
  makeCandle(5, 103.6, 106, 103.5, 105.5), // displacement-ish
  makeCandle(6, 105.5, 106, 103.8, 104),
  makeCandle(7, 104, 104.6, 102.2, 102.6), // creates gap vs candle5
  makeCandle(8, 102.6, 103.4, 101.8, 102.9),
  makeCandle(9, 102.9, 103.1, 101.5, 101.8),
  makeCandle(10, 101.8, 102, 100.4, 100.9),
];

const candles1h: Candle[] = Array.from({ length: 60 }).map((_, i) => ({
  ts: i,
  open: 90 + i * 0.3,
  high: 90.4 + i * 0.3,
  low: 89.8 + i * 0.3,
  close: 90.2 + i * 0.3,
  volume: 15,
}));

const candles1m: Candle[] = Array.from({ length: 120 }).map((_, i) => ({
  ts: i,
  open: 100 + i * 0.02,
  high: 100.1 + i * 0.02,
  low: 99.9 + i * 0.02,
  close: 100 + i * 0.02,
  volume: 3,
}));

const setups = buildSetups({
  symbol: "TESTUSDT",
  candles15m,
  candles1h,
  candles1m,
});

assert(setups.length >= 1, "pipeline should return at least one setup");
assert(setups[0].entryPrice > 0, "entry should be computed");

console.log("pipeline.test.ts passed");
