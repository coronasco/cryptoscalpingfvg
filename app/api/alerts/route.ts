import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { alerts } from "@/lib/db/schema";
import { mockSetups } from "@/lib/utils/mock";
import { nanoid } from "nanoid";

const bodySchema = z.object({
  userId: z.string().uuid().optional(),
  symbol: z.string().min(3),
  setupId: z.string().optional(),
  type: z.enum(["ENTRY_TRIGGERED", "INVALIDATED", "TP1_HIT"]),
  channel: z.enum(["WEBPUSH", "EMAIL"]),
  destination: z.any().optional(),
});

const memoryAlerts: any[] = [];

export async function GET() {
  if (!db) return NextResponse.json({ alerts: memoryAlerts });
  const all = await db.select().from(alerts).limit(100);
  return NextResponse.json({ alerts: all });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!db) {
    const item = { id: nanoid(12), ...parsed.data, createdAt: new Date().toISOString() };
    memoryAlerts.push(item);
    return NextResponse.json({ alert: item });
  }

  const inserted = await db
    .insert(alerts)
    .values(parsed.data)
    .returning()
    .then((rows: typeof alerts.$inferSelect[]) => rows[0]);

  return NextResponse.json({ alert: inserted });
}
