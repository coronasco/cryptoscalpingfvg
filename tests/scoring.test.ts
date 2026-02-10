import assert from "assert";
import { scoreSetup } from "../lib/engine/scoring";

const score = scoreSetup({
  bias: "LONG",
  fvg: { direction: "LONG", low: 100, high: 102, createdAt: Date.now(), size: 2, filledPercent: 0 },
  sweep: { direction: "LONG", level: 99, at: Date.now(), strength: 0.01 },
  rr: 2.5,
  ageMinutes: 5,
  status: "WAITING",
  displacementStrength: 1.2,
});

assert(score <= 100 && score >= 20, "score within range");
assert(score > 60, "score should reward good alignment");
console.log("scoring.test.ts passed");
