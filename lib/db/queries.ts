import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { pairs, setups } from "./schema";
import { PairSummary, Setup } from "../engine/types";
import { mockPairs, mockSetups } from "../utils/mock";

export async function getPairsWithLatestSetup(): Promise<PairSummary[]> {
  if (!db) return mockPairs;

  try {
    const timeout = new Promise<"TIMEOUT">((resolve) => setTimeout(() => resolve("TIMEOUT"), 1200));
    const rowsOrTimeout = (await Promise.race([
      db
        .select({
          id: pairs.id,
          symbol: pairs.symbol,
          displaySymbol: pairs.displaySymbol,
          enabled: pairs.enabled,
          setupId: setups.id,
          status: setups.status,
          direction: setups.direction,
          score: setups.score,
          entry: setups.entryPrice,
          sl: setups.stopLoss,
          tp1: setups.tp1,
          tp2: setups.tp2,
          createdAt: setups.createdAt,
          timeframe: setups.timeframe,
        })
        .from(pairs)
        .leftJoin(setups, eq(pairs.symbol, setups.symbol))
        .where(eq(pairs.enabled, true))
        .orderBy(desc(setups.score), desc(setups.createdAt)),
      timeout,
    ])) as any;

    if (rowsOrTimeout === "TIMEOUT") return mockPairs;

    const rows = rowsOrTimeout;

    const mapped: PairSummary[] = rows.map((row: any) => ({
      id: String(row.id),
      symbol: row.symbol,
      displaySymbol: row.displaySymbol,
      timeframe: (row.timeframe ?? "15m") as any,
      bias: row.direction ?? "NEUTRAL",
      setupName: "Sweep → Displacement → FVG → Retrace",
      score: row.score ?? 0,
      status: (row.status ?? "WAITING") as any,
      entry: row.entry ?? undefined,
      sl: row.sl ?? undefined,
      tp1: row.tp1 ?? undefined,
      tp2: row.tp2 ?? undefined,
      ageMinutes: row.createdAt ? Math.floor((Date.now() - +new Date(row.createdAt)) / 60000) : 0,
      direction: (row.direction ?? "NEUTRAL") as any,
    }));

    if (mapped.length) return mapped;
    return mockPairs;
  } catch {
    return mockPairs;
  }
}

export async function getPairDetails(symbol: string) {
  if (!db) {
    return {
      pair: mockPairs.find((p) => p.symbol === symbol) ?? mockPairs[0],
      setups: [mockSetups[symbol]].filter(Boolean) as Setup[],
    };
  }

  try {
    const timeout = new Promise<"TIMEOUT">((resolve) => setTimeout(() => resolve("TIMEOUT"), 1200));
    const [pair, latestSetups] = await Promise.race([
      Promise.all([
        db
          .select()
          .from(pairs)
          .where(eq(pairs.symbol, symbol))
          .limit(1)
          .then((r) => r[0]),
        db
          .select()
          .from(setups)
          .where(eq(setups.symbol, symbol))
          .orderBy(desc(setups.createdAt))
          .limit(15)
          .then((r) => r as unknown as Setup[]),
      ]),
      timeout,
    ]) as any;

    const fallbackPair =
      pair ??
      ({
        id: 0,
        symbol,
        displaySymbol: `${symbol.replace("USDT", "")}/USDT`,
        enabled: true,
        createdAt: new Date(),
      } as any);

    return {
      pair: fallbackPair,
      setups: Array.isArray(latestSetups) ? latestSetups : [],
    };
  } catch {
    return {
      pair: {
        id: 0,
        symbol,
        displaySymbol: `${symbol.replace("USDT", "")}/USDT`,
        enabled: true,
        createdAt: new Date(),
      } as any,
      setups: [],
    };
  }
}
