import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { env } from "@/lib/env";
import { fetchKlines } from "@/lib/market/bybit";
import { buildSetups } from "@/lib/engine/pipeline";
import { getPairsWithLatestSetup } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { setups } from "@/lib/db/schema";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (env.CRON_SECRET && secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pairs = await getPairsWithLatestSetup();
  const results: any[] = [];

  for (const pair of pairs) {
    try {
      const [candles15m, candles1h, candles1m] = await Promise.all([
        fetchKlines({ symbol: pair.symbol, interval: "15", limit: 200 }),
        fetchKlines({ symbol: pair.symbol, interval: "60", limit: 200 }),
        fetchKlines({ symbol: pair.symbol, interval: "1", limit: 500 }),
      ]);

      const setupsComputed = buildSetups({
        symbol: pair.symbol,
        candles15m,
        candles1h,
        candles1m,
      });

      results.push({ symbol: pair.symbol, setups: setupsComputed.length });

      if (db && setupsComputed.length) {
        for (const setup of setupsComputed.slice(0, 3)) {
          const safeNumber = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
          const fallbackZero = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
          const sweep = safeNumber(setup.sweepLevel) ?? setup.fvgLow;
          // keep one record per symbol + createdAt to update status over time
          await db
            .delete(setups)
            .where(
              and(eq(setups.symbol, setup.symbol), eq(setups.createdAt, new Date(setup.createdAt))),
            );
          await db.insert(setups).values({
            id: setup.id,
            symbol: setup.symbol,
            timeframe: setup.timeframe,
            direction: setup.direction,
            status: setup.status,
            score: setup.score,
            createdAt: new Date(setup.createdAt),
            updatedAt: new Date(setup.updatedAt),
            fvgLow: setup.fvgLow,
            fvgHigh: setup.fvgHigh,
            sweepLevel: sweep,
            entryPrice: setup.entryPrice,
            stopLoss: setup.stopLoss,
            tp1: setup.tp1,
            tp2: safeNumber(setup.tp2),
            tp3: fallbackZero(setup.tp3),
            rrToTp1: setup.rrToTp1,
            invalidationText: setup.invalidationText,
            meta: setup.meta,
          });
        }
      }
    } catch (err: any) {
      console.error("Recompute error", pair.symbol, err);
      results.push({ symbol: pair.symbol, error: err?.message ?? String(err) });
    }
  }

  return NextResponse.json({ ok: true, results });
}
