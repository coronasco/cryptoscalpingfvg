import { Bias, Direction, FVG, SetupStatus, Sweep } from "./types";

export function scoreSetup(params: {
  bias: Bias;
  fvg: FVG;
  sweep?: Sweep;
  rr: number;
  ageMinutes: number;
  status: SetupStatus;
  displacementStrength?: number;
}) {
  const { bias, fvg, sweep, rr, ageMinutes, displacementStrength = 1 } = params;
  const biasScore = bias === fvg.direction ? 25 : bias === "NEUTRAL" ? 12 : 0;
  const sweepScore = sweep ? Math.min(20, sweep.strength * 120) : 8;
  const displacementScore = Math.min(15, displacementStrength * 15);
  const rrScore = Math.max(0, Math.min(25, rr * 8));
  const freshnessScore = Math.max(0, 15 - ageMinutes * 0.8);

  const total = Math.round(biasScore + sweepScore + displacementScore + rrScore + freshnessScore);
  return Math.max(20, Math.min(100, total));
}
