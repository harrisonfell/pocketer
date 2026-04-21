"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md" | "sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

const base =
  "press inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-mint text-ink-950 hover:bg-mint-hover",
  secondary: "bg-ink-800 text-ink-100 hover:bg-ink-700",
  ghost: "bg-transparent text-ink-200 hover:bg-ink-800",
  danger: "bg-rose-warn/15 text-rose-warn hover:bg-rose-warn/25",
};

const sizes: Record<Size, string> = {
  lg: "h-14 px-7 text-base",
  md: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-xs",
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
