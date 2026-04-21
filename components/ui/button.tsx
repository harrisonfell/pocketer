"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "lg" | "md" | "sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

const base =
  "press inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-baltic focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-baltic text-white hover:bg-baltic-hover dark:bg-icy dark:text-ink dark:hover:bg-[color:var(--icy-soft)]",
  secondary:
    "bg-icy text-baltic hover:bg-[color:var(--icy-soft)] dark:bg-white/10 dark:text-snow dark:hover:bg-white/15",
  ghost:
    "bg-transparent text-[color:var(--text)] hover:bg-ink-5 dark:hover:bg-white/10",
  outline:
    "bg-transparent text-baltic border border-baltic/30 hover:bg-baltic/5 dark:text-icy dark:border-icy/30 dark:hover:bg-icy/10",
};

const sizes: Record<Size, string> = {
  lg: "h-14 px-7 text-[17px]",
  md: "h-11 px-5 text-[15px]",
  sm: "h-9 px-4 text-[13px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "lg", block, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          block && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
