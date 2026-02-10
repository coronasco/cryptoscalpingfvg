export type Direction = "LONG" | "SHORT" | "NEUTRAL";

export type SetupStatus =
  | "WAITING"
  | "TRIGGERED"
  | "FILLED"
  | "TP1"
  | "TP2"
  | "SL"
  | "EXPIRED"
  | "INVALIDATED";

export type Timeframe = "1m" | "5m" | "15m" | "1h";

export type Bias = Direction;

export interface Candle {
  ts: number; // unix ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  confirmed?: boolean;
}

export interface FVG {
  low: number;
  high: number;
  direction: Exclude<Direction, "NEUTRAL">;
  createdAt: number;
  size: number;
  filledPercent: number;
}

export interface Sweep {
  level: number;
  direction: Exclude<Direction, "NEUTRAL">;
  at: number;
  strength: number;
}

export interface Displacement {
  at: number;
  body: number;
  atrRatio: number;
  direction: Exclude<Direction, "NEUTRAL">;
}

export interface Setup {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  direction: Exclude<Direction, "NEUTRAL">;
  status: SetupStatus;
  score: number;
  createdAt: number;
  updatedAt: number;
  fvgLow: number;
  fvgHigh: number;
  sweepLevel?: number;
  entryPrice: number;
  stopLoss: number;
  tp1: number;
  tp2?: number;
  tp3?: number;
  rrToTp1: number;
  invalidationText: string;
  meta?: Record<string, unknown>;
}

export interface PairSummary {
  id: string;
  symbol: string;
  displaySymbol: string;
  timeframe: Timeframe;
  bias: Bias;
  setupName: string;
  score: number;
  status: SetupStatus;
  entry?: number;
  sl?: number;
  tp1?: number;
  tp2?: number;
  ageMinutes: number;
  direction: Direction;
}
