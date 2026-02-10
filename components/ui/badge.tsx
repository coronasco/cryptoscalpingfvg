import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
        className,
      )}
      {...props}
    />
  );
}
