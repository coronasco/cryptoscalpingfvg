import Link from "next/link";
import { ArrowRight, Zap, Shield, BellRing, Activity } from "lucide-react";

const stats = [
  { label: "Pairs scanned", value: "30+", accent: "cyan" },
  { label: "Median latency", value: "1.2s", accent: "green" },
  { label: "Live setups", value: "12", accent: "magenta" },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 pb-24 pt-20">
        <header className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
              <Zap size={14} className="text-[color:var(--neon-cyan)]" />
              FVG + Sweep Engine
            </span>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-[color:var(--text)]">
              FVG Signals for ruthless scalpers.
            </h1>
            <p className="max-w-2xl text-lg text-[color:var(--muted)]">
              Live Bybit market data, engineered setups, execution-ready entries, and neon‑clean UI. Built for 15m
              sweeps with 1m confirmation.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-full bg-[color:var(--text)] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[rgba(0,229,255,0.22)] transition hover:translate-y-[-1px]"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--text)] transition hover:border-[color:var(--neon-cyan)]"
              >
                View live setups
              </Link>
            </div>
          </div>
          <div className="glass card-hover w-full max-w-sm rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[color:var(--neon-green)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Premium Gate (mock)</p>
                <p className="text-sm text-[color:var(--text)]">Upgrade toggles plan locally.</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-gradient-to-br from-white to-[#f7f9ff] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[color:var(--muted)]">Free</span>
                <span className="text-[color:var(--text)]">5 pairs • 60s refresh</span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-[color:var(--border)] px-3 py-2">
                <span className="text-[color:var(--muted)]">Premium</span>
                <span className="flex items-center gap-2 text-[color:var(--text)]">
                  30 pairs • 5s <BellRing className="h-4 w-4 text-[color:var(--neon-magenta)]" />
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="glass card-hover rounded-2xl border border-[color:var(--border)] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.14em] text-[color:var(--muted)]">{item.label}</p>
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    background:
                      item.accent === "green"
                        ? "var(--neon-green)"
                        : item.accent === "magenta"
                          ? "var(--neon-magenta)"
                          : "var(--neon-cyan)",
                    boxShadow: "0 0 10px rgba(0,229,255,0.55)",
                  }}
                />
              </div>
              <p className="mt-3 text-2xl font-semibold text-[color:var(--text)]">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="glass card-hover grid gap-6 rounded-3xl border border-[color:var(--border)] p-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-[color:var(--muted)]">
              <Activity className="h-4 w-4 text-[color:var(--neon-cyan)]" />
              Engine
            </div>
            <p className="text-xl font-semibold text-[color:var(--text)]">Sweep → Displacement → FVG → Retrace</p>
            <p className="text-[color:var(--muted)]">
              Bias on 1h EMA50/200, setups on 15m, triggers on 1m. Score blends alignment, liquidity, impulse, R:R,
              and age.
            </p>
            <Link href="/dashboard" className="text-sm text-[color:var(--neon-cyan)]">
              View detection rules →
            </Link>
          </div>
          <div className="rounded-2xl border border-[color:var(--border)] bg-gradient-to-br from-white to-[#f5fbff] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Realtime</p>
            <p className="mt-3 text-base text-[color:var(--text)]">
              Bybit WebSocket klines 1m/15m + REST backfill. Incremental recompute per symbol; Redis caches hot data.
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--border)] bg-gradient-to-br from-white to-[#fff7ff] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Alerts</p>
            <p className="mt-3 text-base text-[color:var(--text)]">
              Web push (VAPID) with email fallback (Resend). Triggered on entry, invalidation, or TP1 hits.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
