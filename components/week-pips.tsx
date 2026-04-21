"use client";

import { cn } from "@/lib/utils";

// Shows 4 weekly "pips" since a switch was accepted.
// Pip is filled if that week has passed since the start date.
export function WeekPips({ startedISO }: { startedISO: string }) {
  const now = Date.now();
  const started = new Date(startedISO).getTime();
  const daysSince = Math.max(0, (now - started) / 86_400_000);
  const filled = Math.min(4, Math.floor(daysSince / 7) + 1);

  return (
    <div className="mt-2 flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => {
        const isFilled = i < filled;
        return (
          <div
            key={i}
            className={cn(
              "h-1.5 w-5 rounded-full transition-colors",
              isFilled
                ? "bg-baltic dark:bg-icy"
                : "bg-ink-10 dark:bg-white/10"
            )}
          />
        );
      })}
      <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-ink-40 dark:text-snow-60">
        wk {filled}/4
      </span>
    </div>
  );
}
