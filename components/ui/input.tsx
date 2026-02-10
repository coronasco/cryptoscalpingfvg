import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-[color:var(--border)] bg-white/80 px-3 text-sm text-[color:var(--text)] shadow-sm outline-none transition focus:border-[color:var(--neon-cyan)] focus:ring-2 focus:ring-[rgba(0,229,255,0.2)]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
