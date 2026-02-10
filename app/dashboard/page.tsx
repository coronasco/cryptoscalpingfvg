import { getPairsWithLatestSetup } from "@/lib/db/queries";
import DashboardShell from "./shell";

export default async function DashboardPage() {
  const pairs = await getPairsWithLatestSetup();
  return <DashboardShell pairs={pairs} />;
}

// dynamic to ensure fresh data after recompute
export const dynamic = "force-dynamic";
