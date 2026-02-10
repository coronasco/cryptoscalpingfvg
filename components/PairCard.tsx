import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, TrendingDown, TrendingUp, Zap, Activity, Layers, CornerRightUp } from "lucide-react";
import { PairSummary } from "@/lib/engine/types";
import { formatPrice } from "@/lib/utils/format";
import { StatusPill } from "./StatusPill";
import { ScoreChip } from "./ScoreChip";
import { cn } from "@/lib/utils/cn";

type Props = {
  pair: PairSummary;
  active?: boolean;
  onSelect?: () => void;
};

export function PairCard({ pair, active, onSelect }: Props) {
  const dirIcon =
    pair.direction === "LONG" ? (
      <TrendingUp className="h-4 w-4 text-[color:var(--neon-green)]" />
    ) : (
      <TrendingDown className="h-4 w-4 text-[color:var(--neon-red)]" />
    );

  return (
    <Link href={`/dashboard/${pair.symbol}`} className="block" onClick={onSelect}>
      <motion.div
        initial={{ opacity: 0.94, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, transition: { duration: 0.18, ease: "easeOut" } }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white/80 p-4 card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--neon-cyan)]",
          active && "neon-ring bg-gradient-to-br from-white via-[#f7fbff] to-[#f4f9ff]",
        )}
      >
        {active && (
          <motion.span
            layout
            className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[color:var(--neon-cyan)]"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          />
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b0d12] text-sm font-semibold text-white">
              {pair.symbol.replace("USDT", "")}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[color:var(--text)] leading-tight">{pair.displaySymbol}</p>
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted-text)]">
                {pair.timeframe}
                <span className="h-1 w-1 rounded-full bg-[color:var(--border)]" />
                {pair.direction}
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[color:var(--muted-text)]" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StatusPill status={pair.status} />
          <ScoreChip score={pair.score} />
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-white px-2 py-1 text-xs text-[color:var(--muted-text)]">
            {dirIcon}
            {pair.direction}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[color:var(--muted-text)]">
            <Clock className="h-3.5 w-3.5" />
            {pair.ageMinutes}m
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[color:var(--muted-text)]">
          <Step icon={<Zap className="h-4 w-4" />} active />
          <Step icon={<Activity className="h-4 w-4" />} active />
          <Step icon={<Layers className="h-4 w-4" />} active />
          <Step icon={<CornerRightUp className="h-4 w-4" />} active={pair.status !== "WAITING"} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[color:var(--text)]">
          <Metric label="Entry" value={formatPrice(pair.entry)} />
          <Metric label="SL" value={formatPrice(pair.sl)} />
          <Metric label="TP1" value={formatPrice(pair.tp1)} />
          <Metric label="TP2" value={formatPrice(pair.tp2)} />
        </div>
      </motion.div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-white/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted-text)]">{label}</p>
      <p className="font-mono text-sm text-[color:var(--text)]">{value}</p>
    </div>
  );
}

function Step({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70",
        active && "border-[color:var(--neon-cyan)] shadow-[0_0_12px_rgba(0,229,255,0.18)]",
      )}
    >
      {icon}
    </span>
  );
}
