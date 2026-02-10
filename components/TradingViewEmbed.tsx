"use client";

import { useEffect, useRef } from "react";

type Props = {
  symbol: string;
  interval?: string;
  height?: number;
  levels?: { entry?: number; sl?: number; tp1?: number; tp2?: number };
};

export function TradingViewEmbed({ symbol, interval = "15", height = 360, levels }: Props) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol.includes(":") ? symbol : `BYBIT:${symbol}`,
      interval,
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "en",
      hide_side_toolbar: true,
      withdateranges: false,
      allow_symbol_change: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });
    container.current.appendChild(script);
  }, [symbol, interval]);

  return (
    <div className="relative rounded-2xl border border-[color:var(--border)]" style={{ height }}>
      <div ref={container} className="absolute inset-0 rounded-2xl overflow-hidden" />
      {levels ? (
        <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-2 text-xs font-medium">
          {levels.entry !== undefined && (
            <Chip label="Entry" value={levels.entry} color="var(--neon-cyan)" />
          )}
          {levels.sl !== undefined && <Chip label="SL" value={levels.sl} color="var(--neon-red)" />}
          {levels.tp1 !== undefined && <Chip label="TP1" value={levels.tp1} color="var(--neon-green)" />}
          {levels.tp2 !== undefined && <Chip label="TP2" value={levels.tp2} color="var(--neon-magenta)" />}
        </div>
      ) : null}
    </div>
  );
}

function Chip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white/80 px-3 py-1 shadow-sm"
      style={{ boxShadow: `0 0 12px ${color}33` }}
    >
      <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color }}>
        {label}
      </span>
      <span className="font-mono text-sm text-[color:var(--text)]">{value.toFixed(4)}</span>
    </span>
  );
}
