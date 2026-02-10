import { notFound } from "next/navigation";
import { getPairDetails } from "@/lib/db/queries";
import { ExecutionPlanCard } from "@/components/ExecutionPlanCard";
import { TradingViewEmbed } from "@/components/TradingViewEmbed";
import { StatusPill } from "@/components/StatusPill";
import { ScoreChip } from "@/components/ScoreChip";
import { formatPrice } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, Zap, Activity, Target, Timer, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Setup } from "@/lib/engine/types";

type Params = { params: { symbol: string } };

export default async function PairPage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolved = await params;
  const symbol = resolved?.symbol ? resolved.symbol.toUpperCase() : "";
  if (!symbol) return notFound();
  const { pair, setups } = await getPairDetails(symbol);
  if (!pair) return notFound();
  const setup = setups?.[0];
  const display = pair.displaySymbol ?? `${symbol.slice(0, -4)}/${symbol.slice(-4)}`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-12 pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-[#0b0d12] text-white flex items-center justify-center text-lg font-semibold shadow-[0_10px_26px_rgba(0,0,0,0.2)]">
          {display.split("/")[0]}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-text)]">Pair</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-[color:var(--text)]">{display}</h1>
            <Badge className="text-[color:var(--text)]">{pair.timeframe ?? "15m"}</Badge>
          </div>
        </div>
        {setup ? <StatusPill status={setup.status} /> : null}
        {setup ? <ScoreChip score={setup.score} /> : null}
        <div className="ml-auto">
          <Link href="/dashboard" className="inline-flex">
            <Button variant="outline" size="sm">
              <span className="text-sm">Back</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted-text)]">
            <Zap className="h-4 w-4 text-[color:var(--neon-cyan)]" />
            Live chart
          </div>
          <div className="flex items-center gap-2 text-xs text-[color:var(--muted-text)]">
            <Timer className="h-4 w-4" />
            15m + 1m overlay
          </div>
        </div>
        <TradingViewEmbed
          symbol={symbol}
          interval="15"
          height={420}
          levels={
            setup
              ? {
                  entry: setup.entryPrice,
                  sl: setup.stopLoss,
                  tp1: setup.tp1,
                  tp2: setup.tp2,
                }
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {setup ? (
            <ExecutionPlanCard setup={setup} />
          ) : (
            <Card className="p-6 text-sm text-[color:var(--muted-text)]">No active setup (mock).</Card>
          )}
        </div>
          <div className="flex flex-col gap-4">
            <Card className="p-4">
            <div className="flex items-center justify-between text-sm text-[color:var(--muted-text)]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[color:var(--neon-green)]" />
                Recent entries
              </div>
              <span className="text-xs text-[color:var(--muted-text)]">last 10</span>
            </div>
            {setups && setups.length ? (
              <div className="mt-3 space-y-2">
                {setups
                  .slice()
                  .sort(
                    (a: Setup, b: Setup) =>
                      new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime(),
                  )
                  .slice(0, 10)
                  .map((s, idx) => (
                    <RecentRow key={`${s.id}-${idx}`} setup={s} />
                  ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[color:var(--muted-text)]">No past entries yet.</p>
            )}
            </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between text-sm text-[color:var(--muted-text)]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[color:var(--neon-magenta)]" />
                Rules
              </div>
              <Badge className="text-[color:var(--text)]">Setup: Sweep • Displacement • FVG • Retrace</Badge>
            </div>
            <div className="grid gap-3">
              <RuleRow label="Bias" value="1h EMA50/200 alignment" />
              <RuleRow label="Sweep" value="Recent liquidity grab on 15m" />
              <RuleRow label="Impulse" value="Candle body > 0.85x ATR" />
              <RuleRow label="Entry" value="Retrace 25–75% into FVG (mid default)" />
              <RuleRow label="Stop" value="Below FVG low or sweep low + 0.1 ATR buffer" />
              <RuleRow label="Targets" value="TP1: nearest opposing swing 15m; TP2: swing 1h" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Level({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-white/70 p-3">
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-text)]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-[color:var(--text)]">{value}</p>
    </div>
  );
}

function RuleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-white/70 px-3 py-2.5 flex items-center gap-4">
      <span className="w-28 shrink-0 text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted-text)]">
        {label}
      </span>
      <span className="flex-1 text-sm text-[color:var(--text)] leading-relaxed">{value}</span>
    </div>
  );
}

function RecentRow({ setup }: { setup: Setup }) {
  const isWin = setup.status === "TP1" || setup.status === "TP2";
  const isLoss = setup.status === "SL";
  const meta =
    setup.status === "SL"
      ? { dot: "bg-[color:var(--neon-red)]", pill: "bg-[rgba(255,59,59,0.16)] text-[color:var(--neon-red)]", label: "Loss" }
      : setup.status === "TP1" || setup.status === "TP2"
        ? { dot: "bg-[color:var(--neon-green)]", pill: "bg-[rgba(57,255,136,0.16)] text-[color:var(--neon-green)]", label: "Win" }
        : setup.status === "FILLED" || setup.status === "TRIGGERED" || setup.status === "WAITING"
          ? { dot: "bg-[#0f172a]", pill: "bg-[#e2e8f0] text-[#0f172a]", label: "Open" }
          : { dot: "bg-[color:var(--muted-text)]", pill: "bg-[rgba(0,0,0,0.05)] text-[color:var(--muted-text)]", label: setup.status };

  const bgColor = isLoss
    ? "bg-[rgba(255,59,59,0.08)]"
    : isWin
      ? "bg-[rgba(57,255,136,0.08)]"
      : "bg-white/70";
  const created = new Date(setup.createdAt);
  const updated = setup.updatedAt ? new Date(setup.updatedAt) : created;
  const ageMinutes = Math.max(0, Math.round((Date.now() - updated.getTime()) / 60000));
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm ${bgColor}`}>
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-text)]">Entry / SL / TP1</span>
          <span className="font-mono text-[13px] text-[color:var(--text)]">
            {formatPrice(setup.entryPrice)} / {formatPrice(setup.stopLoss)} / {formatPrice(setup.tp1)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 text-[11px] text-[color:var(--muted-text)] leading-tight">
        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] ${meta.pill}`}>
          {meta.label}
        </span>
        <span>{updated.toLocaleDateString()} {updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <span className="text-[color:var(--muted-text)]">{ageMinutes}m ago</span>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
