import { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type Props = ComponentProps<"div"> & {
  colorVariant?: "cyan" | "green" | "magenta" | "red" | "muted";
  size?: number;
};

export function NeonIcon({ children, colorVariant = "cyan", size = 36, className, ...props }: Props) {
  const palette: Record<string, string> = {
    cyan: "var(--neon-cyan)",
    green: "var(--neon-green)",
    magenta: "var(--neon-magenta)",
    red: "var(--neon-red)",
    muted: "var(--border)",
  };
  const shadow =
    colorVariant === "muted"
      ? "0 6px 16px rgba(10, 20, 50, 0.06)"
      : `0 0 12px ${palette[colorVariant]}33`;
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white/80",
        className,
      )}
      style={{
        width: size,
        height: size,
        boxShadow: shadow,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
