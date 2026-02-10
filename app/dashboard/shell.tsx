"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bell, Sparkles, Zap, Search, Menu } from "lucide-react";
import { PairSummary, Setup } from "@/lib/engine/types";
import { FiltersBar, FilterState } from "@/components/FiltersBar";
import { PairCard } from "@/components/PairCard";
import { ExecutionPlanCard } from "@/components/ExecutionPlanCard";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import { StatusPill } from "@/components/StatusPill";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Props = {
  pairs: PairSummary[];
};

export default function DashboardShell({ pairs }: Props) {
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [filters, setFilters] = useState<FilterState>({});
  const [activeSymbol, setActiveSymbol] = useState<string | null>(pairs[0]?.symbol ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fvg-plan");
    if (saved === "premium" || saved === "free") setPlan(saved);
  }, []);

  useEffect(() => {
    if (activeSymbol) return;
    if (pairs.length) setActiveSymbol(pairs[0].symbol);
  }, [pairs, activeSymbol]);

  const filtered = useMemo(() => {
    const limited = plan === "free" ? pairs.slice(0, 5) : pairs;
    return limited.filter((p) => {
      if (filters.direction && p.direction !== filters.direction) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.search && !p.displaySymbol.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [filters, pairs, plan]);

  const { data } = useSWR(
    activeSymbol ? `/api/pairs/${activeSymbol}` : null,
    fetcher,
    { refreshInterval: plan === "premium" ? 5000 : 60000 },
  );

  const activeSetup: Setup | undefined = data?.setups?.[0];
  const quality = useMemo(() => {
    const relevant = filtered.filter((p) => ["FILLED", "TP1", "TP2", "SL"].includes(p.status));
    if (!relevant.length) return null;
    const wins = relevant.filter((p) => p.status === "TP1" || p.status === "TP2").length;
    const losses = relevant.filter((p) => p.status === "SL").length;
    const rate = Math.round((wins / Math.max(1, wins + losses)) * 100);
    return { wins, losses, rate };
  }, [filtered]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-7xl flex-col gap-6 px-4 pb-14 pt-10">
      <header className="flex flex-wrap items-center gap-3">
        <button
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-white/80"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5 text-[color:var(--text)]" />
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted-text)]">Dashboard</p>
          <h1 className="text-3xl font-semibold text-[color:var(--text)] tracking-tight">FVG Signals</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white/70 px-4 py-2 text-sm text-[color:var(--muted-text)]">
          <Sparkles className="h-4 w-4 text-[color:var(--neon-magenta)]" />
          Plan: <strong className="text-[color:var(--text)]">{plan}</strong>
          {quality ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-white/80 px-2 py-1 text-[11px] font-semibold text-[color:var(--text)]">
              Winrate {quality.rate}%
            </span>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const next = plan === "free" ? "premium" : "free";
              setPlan(next);
              localStorage.setItem("fvg-plan", next);
            }}
          >
            {plan === "free" ? "Upgrade (mock)" : "Go Free"}
          </Button>
        </div>
      </header>

      <FiltersBar onChange={setFilters} />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="hidden lg:block">
          <SidebarContent
            filtered={filtered}
            activeSymbol={activeSymbol}
            setActiveSymbol={setActiveSymbol}
          />
        </aside>

        <div className="glass rounded-3xl border border-[color:var(--border)] p-6 shadow-xl">
          {activeSetup ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-[#f1f4fa] px-3 py-1 text-sm text-[color:var(--text)]">
                  <Zap className="h-4 w-4 text-[color:var(--neon-cyan)]" />
                  {activeSetup.symbol} • {activeSetup.timeframe}
                </div>
                <StatusPill status={activeSetup.status} />
                <span className="text-sm text-[color:var(--muted-text)]">
                  Entry {formatPrice(activeSetup.entryPrice)} / SL {formatPrice(activeSetup.stopLoss)} / TP1{" "}
                  {formatPrice(activeSetup.tp1)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => activeSymbol && setActiveSymbol(activeSymbol)}
                  className="ml-auto"
                >
                  <ArrowRight className="h-4 w-4" />
                  Open details
                </Button>
              </div>
              <ExecutionPlanCard setup={activeSetup} />
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-[color:var(--muted-text)]">
              <Bell className="h-6 w-6 text-[color:var(--neon-cyan)]" />
              Select a pair to view the execution plan.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -20, opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -16, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-white p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white/80 px-3 py-2">
                <Search className="h-4 w-4 text-[color:var(--muted-text)]" />
                <Input
                  placeholder="Search symbol"
                  className="h-9 border-none shadow-none focus:ring-0"
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                />
              </div>
              <SidebarContent
                filtered={filtered}
                activeSymbol={activeSymbol}
                setActiveSymbol={(s) => {
                  setActiveSymbol(s);
                  setSidebarOpen(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({
  filtered,
  activeSymbol,
  setActiveSymbol,
}: {
  filtered: PairSummary[];
  activeSymbol: string | null;
  setActiveSymbol: (s: string) => void;
}) {
  const deduped = Array.from(new Map(filtered.map((p) => [p.symbol, p])).values());
  return (
    <div className="flex flex-col gap-3">
      {deduped.map((pair, idx) => (
        <PairCard
          key={pair.id ?? `${pair.symbol}-${idx}`}
          pair={pair}
          active={pair.symbol === activeSymbol}
          onSelect={() => setActiveSymbol(pair.symbol)}
        />
      ))}
      {!filtered.length && (
        <div className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-4 text-sm text-[color:var(--muted-text)]">
          No pairs found with current filters.
        </div>
      )}
    </div>
  );
}
