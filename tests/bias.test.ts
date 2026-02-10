import assert from "assert";
import { computeBias } from "../lib/engine/bias";
import { Candle } from "../lib/engine/types";

const candles: Candle[] = Array.from({ length: 80 }).map((_, i) => ({
  ts: i,
  open: 100 + i * 0.5,
  high: 100.4 + i * 0.5,
  low: 99.8 + i * 0.5,
  close: 100.2 + i * 0.5,
  volume: 10,
}));

const bias = computeBias(candles);
assert(bias === "LONG", "bias should be LONG for rising closes");

console.log("bias.test.ts passed");
