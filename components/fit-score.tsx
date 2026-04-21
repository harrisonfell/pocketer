"use client";

import { cn } from "@/lib/utils";
import type { FitScore as FitValue } from "@/lib/scoring";

// Small inline score pip row. Filled pips = app's fit reading.
export function FitPips({
  value,
  className,
}: {
  value: FitValue;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            i <= value
              ? "bg-baltic dark:bg-icy"
              : "bg-ink-10 dark:bg-white/15"
          )}
        />
      ))}
    </div>
  );
}

export function FitBadge({
  value,
  label,
  className,
}: {
  value: FitValue;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-2.5 py-1",
        value <= 2
          ? "border-ink-10 bg-ink-5 dark:border-white/10 dark:bg-white/5"
          : "border-ink-10 bg-white dark:border-white/10 dark:bg-[color:var(--surface)]",
        className
      )}
      aria-label={`Fit score ${value} of 5: ${label}`}
    >
      <FitPips value={value} />
      <span className="text-[11px] font-semibold tracking-wide text-ink-80 dark:text-snow-80">
        {label}
      </span>
    </div>
  );
}

// Ring-style visualization for the Purchases header.
export function FitRing({
  average,
  size = 96,
  strokeWidth = 8,
}: {
  average: number; // 0..5
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, average / 5));
  const offset = circumference * (1 - pct);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
        style={{
          transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </svg>
  );
}
