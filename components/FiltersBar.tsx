"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils/cn";

export type FilterState = {
  direction?: "LONG" | "SHORT" | "NEUTRAL";
  status?: string;
  timeframe?: string;
  search?: string;
};

type Props = {
  onChange: (state: FilterState) => void;
  initial?: FilterState;
};

export function FiltersBar({ onChange, initial }: Props) {
  const [state, setState] = useState<FilterState>(initial ?? {});

  useEffect(() => {
    onChange(state);
  }, [state, onChange]);

  const set = (partial: Partial<FilterState>) => setState((s) => ({ ...s, ...partial }));

  return (
    <div className="glass card-hover flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--border)] p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted-text)]">
        <SlidersHorizontal className="h-4 w-4 text-[color:var(--neon-cyan)]" />
        Filters
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "LONG", "SHORT"].map((dir) => (
          <TogglePill
            key={dir}
            active={state.direction === (dir === "ALL" ? undefined : (dir as any))}
            label={dir}
            onClick={() => set({ direction: dir === "ALL" ? undefined : (dir as any) })}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {["WAITING", "TRIGGERED", "FILLED"].map((st) => (
          <TogglePill
            key={st}
            active={state.status === st}
            label={st}
            onClick={() => set({ status: state.status === st ? undefined : st })}
          />
        ))}
      </div>
      <div className="ml-auto flex min-w-[240px] items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white/80 px-3 py-1">
        <Search className="h-4 w-4 text-[color:var(--muted-text)]" />
        <Input
          placeholder="Search symbol"
          className="h-9 border-none shadow-none focus:ring-0"
          value={state.search ?? ""}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>
    </div>
  );
}

function TogglePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "primary" : "outline"}
      className={cn(
        "rounded-full border border-[color:var(--border)] bg-white/80 px-3 py-1 text-xs",
        active && "shadow-[0_0_0_1px_rgba(0,229,255,0.5)]",
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
