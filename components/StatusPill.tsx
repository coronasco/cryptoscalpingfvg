import { cn } from "@/lib/utils/cn";
import { SetupStatus } from "@/lib/engine/types";
import { Zap, Target, ShieldAlert, Clock } from "lucide-react";

type Props = {
  status: SetupStatus;
};

const palette: Record<SetupStatus, { bg: string; text: string; icon?: React.ReactNode }> = {
  WAITING: { bg: "bg-[#f4f6fb]", text: "text-[#5a6272]", icon: <Clock className="h-3.5 w-3.5" /> },
  TRIGGERED: {
    bg: "bg-[rgba(0,229,255,0.12)]",
    text: "text-[color:var(--neon-cyan)]",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  FILLED: { bg: "bg-[rgba(57,255,136,0.12)]", text: "text-[color:var(--neon-green)]" },
  TP1: { bg: "bg-[rgba(57,255,136,0.12)]", text: "text-[color:var(--neon-green)]", icon: <Target className="h-3.5 w-3.5" /> },
  TP2: { bg: "bg-[rgba(57,255,136,0.12)]", text: "text-[color:var(--neon-green)]", icon: <Target className="h-3.5 w-3.5" /> },
  SL: { bg: "bg-[rgba(255,59,59,0.12)]", text: "text-[color:var(--neon-red)]", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
  EXPIRED: { bg: "bg-[#f1f2f5]", text: "text-[#6b7385]" },
  INVALIDATED: {
    bg: "bg-[rgba(255,61,255,0.12)]",
    text: "text-[color:var(--neon-magenta)]",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
  },
};

export function StatusPill({ status }: Props) {
  const state = palette[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        state.bg,
        state.text,
      )}
    >
      {state.icon}
      {status}
    </span>
  );
}
