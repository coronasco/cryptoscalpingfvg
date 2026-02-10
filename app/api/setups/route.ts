import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { setups } from "@/lib/db/schema";
import { mockSetups } from "@/lib/utils/mock";
import { and, eq, gte, lte } from "drizzle-orm";

const querySchema = z.object({
  direction: z.enum(["LONG", "SHORT"]).optional(),
  status: z
    .enum(["WAITING", "TRIGGERED", "FILLED", "TP1", "TP2", "SL", "EXPIRED", "INVALIDATED"])
    .optional(),
  minScore: z.coerce.number().optional(),
  maxScore: z.coerce.number().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
  const filters = parsed.success ? parsed.data : {};

  if (!db) {
    const list = Object.values(mockSetups).filter((s) => {
      if (filters.direction && s.direction !== filters.direction) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (filters.minScore && s.score < filters.minScore) return false;
      return true;
    });
    return NextResponse.json({ setups: list });
  }

  const rows = await db
    .select()
    .from(setups)
    .where(
      and(
        ...(filters.direction ? [eq(setups.direction, filters.direction)] : []),
        ...(filters.status ? [eq(setups.status, filters.status)] : []),
        ...(filters.minScore ? [gte(setups.score, filters.minScore)] : []),
        ...(filters.maxScore ? [lte(setups.score, filters.maxScore)] : []),
      ),
    );

  return NextResponse.json({ setups: rows });
}
