import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../lib/db/client";
import { pairs, users } from "../lib/db/schema";

dotenv.config({ path: ".env.local" });

async function main() {
  if (!db) {
    console.error("Database not configured. Set a valid DATABASE_URL (postgres://...) before running seed.");
    process.exit(1);
  }

  const defaultPairs = [
    { symbol: "BTCUSDT", displaySymbol: "BTC/USDT" },
    { symbol: "ETHUSDT", displaySymbol: "ETH/USDT" },
    { symbol: "SOLUSDT", displaySymbol: "SOL/USDT" },
    { symbol: "AVAXUSDT", displaySymbol: "AVAX/USDT" },
    { symbol: "XRPUSDT", displaySymbol: "XRP/USDT" },
    { symbol: "ADAUSDT", displaySymbol: "ADA/USDT" },
  ];

  await db.transaction(async (tx: any) => {
    for (const p of defaultPairs) {
      await tx
        .insert(pairs)
        .values({ ...p, enabled: true })
        .onConflictDoNothing();
    }

    const existingUser =
      (
        await tx
          .select()
          .from(users)
          .where(eq(users.email, "demo@fvg.signals"))
          .limit(1)
      )[0];

    if (!existingUser) {
      await tx.insert(users).values({
        email: "demo@fvg.signals",
        plan: "free",
      });
    }
  });

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
