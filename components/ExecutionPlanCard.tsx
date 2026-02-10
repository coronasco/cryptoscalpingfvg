"use client";

import { useState, useTransition, useMemo } from "react";
import { motion } from "framer-motion";
import { BellRing, Target, Shield, TrendingUp, TrendingDown, Gauge } from "lucide-react";
import { Setup } from "@/lib/engine/types";
import { formatPrice, formatRR } from "@/lib/utils/format";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils/cn";

type Props = {
  setup: Setup;
};

export function ExecutionPlanCard({ setup }: Props) {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleAlert = () => {
    startTransition(async () => {
      try {
        await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: setup.symbol,
            setupId: setup.id,
            type: "ENTRY_TRIGGERED",
            channel: "WEBPUSH",
          }),
        });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  };

  const rr = formatRR(setup.entryPrice, setup.stopLoss, setup.tp1);
  const rrValue = useMemo(() => parseFloat(rr === "–" ? "0" : rr), [rr]);

  const dirIcon =
    setup.direction === "LONG" ? (
      <TrendingUp className="h-5 w-5 text-[color:var(--neon-green)]" />
    ) : (
      <TrendingDown className="h-5 w-5 text-[color:var(--neon-red)]" />
    );

  return (
    <Card className="border-[color:var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(12,30,80,0.08)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {dirIcon}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted-text)]">Execution plan</p>
            <p className="text-xl font-semibold text-[color:var(--text)]">{setup.symbol}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-xs text-[color:var(--muted-text)]">
          <Gauge className="h-4 w-4 text-[color:var(--neon-cyan)]" />
          R:R {rr}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <PlanRow label="Entry" value={formatPrice(setup.entryPrice)} accent="cyan" icon={<Target className="h-4 w-4" />} />
        <PlanRow label="Stop" value={formatPrice(setup.stopLoss)} accent="red" icon={<Shield className="h-4 w-4" />} />
        <PlanRow label="TP1" value={formatPrice(setup.tp1)} accent="green" icon={<Target className="h-4 w-4" />} />
        {setup.tp2 ? <PlanRow label="TP2" value={formatPrice(setup.tp2)} accent="magenta" icon={<Target className="h-4 w-4" />} /> : null}
        {setup.tp3 ? <PlanRow label="TP3" value={formatPrice(setup.tp3)} accent="magenta" icon={<Target className="h-4 w-4" />} /> : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-[color:var(--border)] bg-gradient-to-r from-[#f7fbff] via-white to-[#f9f6ff] p-4 text-sm text-[color:var(--muted-text)]">
          <div className="flex items-center gap-2 text-[color:var(--text)]">
            <Target className="h-4 w-4 text-[color:var(--neon-cyan)]" />
            Invalidation
          </div>
          <p className="mt-2 leading-relaxed">{setup.invalidationText}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-white/80 p-4">
          <div className="flex items-center justify-between text-xs text-[color:var(--muted-text)]">
            <span className="uppercase tracking-[0.16em]">R:R to TP1</span>
            <span className="font-mono text-sm text-[color:var(--text)]">{rr}</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[color:var(--muted)]">
            <motion.div
              className="h-full rounded-full bg-[color:var(--neon-cyan)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(rrValue * 20, 100)}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={handleAlert}
          disabled={isPending}
          className="shadow-[0_12px_40px_rgba(0,229,255,0.20)] border border-[color:var(--neon-cyan)] bg-white text-[color:var(--text)] hover:-translate-y-[1px]"
        >
          <BellRing className="h-4 w-4 text-[color:var(--neon-cyan)]" />
          Create alert
        </Button>
        {status === "saved" && <span className="text-xs text-[color:var(--neon-green)]">Alert saved (mock).</span>}
        {status === "error" && <span className="text-xs text-[color:var(--neon-red)]">Could not save alert.</span>}
      </div>
    </Card>
  );
}

function PlanRow({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: "cyan" | "green" | "magenta" | "red";
  icon?: React.ReactNode;
}) {
  const map: Record<typeof accent, string> = {
    cyan: "text-[color:var(--neon-cyan)]",
    green: "text-[color:var(--neon-green)]",
    magenta: "text-[color:var(--neon-magenta)]",
    red: "text-[color:var(--neon-red)]",
  };
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white/80 p-3 shadow-[0_8px_24px_rgba(10,30,80,0.05)]">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted-text)]">
        {icon}
        {label}
      </div>
      <p className={cn("mt-1 text-xl font-semibold", map[accent], "font-mono tracking-tight")}>{value}</p>
    </div>
  );
}
