import assert from "assert";
import { detectFVG } from "../lib/engine/fvg";
import { Candle } from "../lib/engine/types";

const candles: Candle[] = [
  { ts: 1, open: 100, high: 101, low: 99, close: 100.5, volume: 10 },
  { ts: 2, open: 100.5, high: 102, low: 100, close: 101.5, volume: 12 },
  { ts: 3, open: 102, high: 103, low: 102, close: 102.5, volume: 11 },
  { ts: 4, open: 102.5, high: 104, low: 102.4, close: 103.5, volume: 9 },
  { ts: 5, open: 103.5, high: 104, low: 103.4, close: 103.8, volume: 9 },
];

const gaps = detectFVG(candles);
assert(gaps.length >= 1, "should detect at least one FVG");
assert(gaps[0].direction === "LONG", "first FVG should be bullish");

console.log("fvg.test.ts passed");
