import { NextResponse } from "next/server";
import { z } from "zod";
import { getPairsWithLatestSetup } from "@/lib/db/queries";

const querySchema = z.object({
  direction: z.enum(["LONG", "SHORT", "NEUTRAL"]).optional(),
  status: z
    .enum(["WAITING", "TRIGGERED", "FILLED", "TP1", "TP2", "SL", "EXPIRED", "INVALIDATED"])
    .optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parse = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
  const filters = parse.success ? parse.data : {};

  const pairs = await getPairsWithLatestSetup();
  const filtered = pairs.filter((p) => {
    if (filters.direction && p.direction !== filters.direction) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });

  return NextResponse.json({ pairs: filtered });
}
