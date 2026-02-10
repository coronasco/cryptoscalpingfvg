import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--neon-cyan)] disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-[color:var(--text)] border border-[color:var(--border)] hover:border-[color:var(--neon-cyan)] hover:shadow-[0_12px_30px_rgba(0,229,255,0.18)]",
  outline:
    "border border-[color:var(--border)] text-[color:var(--text)] hover:border-[color:var(--neon-cyan)] bg-white/70",
  ghost: "text-[color:var(--text)] hover:bg-[rgba(0,0,0,0.04)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  ),
);
Button.displayName = "Button";
