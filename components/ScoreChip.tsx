import { cn } from "@/lib/utils/cn";

export function ScoreChip({ score }: { score: number }) {
  const hue = 120 * (score / 100); // 0 red, 120 green
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.14em]",
        "border-[color:var(--border)] bg-white/70 text-[color:var(--text)]",
      )}
      style={{
        boxShadow: `0 0 10px hsla(${hue},80%,70%,0.25)`,
        color: "#0b0d12",
      }}
    >
      <span className="font-mono text-xs">Score</span>
      <span className="font-mono text-xs">{score}</span>
    </span>
  );
}
