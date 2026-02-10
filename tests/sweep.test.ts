import assert from "assert";
import { detectSweeps } from "../lib/engine/sweep";
import { Candle } from "../lib/engine/types";

const candles: Candle[] = [];
for (let i = 0; i < 20; i++) {
  candles.push({
    ts: i,
    open: 100 + i * 0.2,
    high: 101 + i * 0.2,
    low: 99 + i * 0.2,
    close: 100 + i * 0.2,
    volume: 5,
  });
}
// final candle sweeps high and closes back in
candles.push({
  ts: 21,
  open: 104,
  high: 108,
  low: 103,
  close: 104,
  volume: 8,
});

const sweeps = detectSweeps(candles, 30);
assert(sweeps.some((s) => s.direction === "SHORT"), "should detect bearish sweep");

console.log("sweep.test.ts passed");
