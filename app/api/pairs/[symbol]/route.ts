import { NextRequest, NextResponse } from "next/server";
import { getPairDetails } from "@/lib/db/queries";

type Params = { params: Promise<{ symbol: string }> } | { params: { symbol: string } };

export async function GET(_req: NextRequest, context: Params) {
  const resolved = "params" in context ? await (context as any).params : undefined;
  const symbol = resolved?.symbol?.toUpperCase?.();
  if (!symbol) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { pair, setups } = await getPairDetails(symbol);
  if (!pair) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const active = setups?.[0];

  return NextResponse.json({
    pair,
    setups,
    keyLevels: active
      ? {
          fvg: { low: active.fvgLow, high: active.fvgHigh },
          sweep: active.sweepLevel,
          tp1: active.tp1,
          tp2: active.tp2,
        }
      : null,
  });
}
