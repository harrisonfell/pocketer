"use client";

import { cn } from "@/lib/utils";

// Shows 4 weekly "pips" since a switch was accepted.
// Pip is filled if that week is in the past relative to accepted date.
export function WeekPips({ startedISO }: { startedISO: string }) {
  const now = Date.now();
  const started = new Date(startedISO).getTime();
  const daysSince = Math.max(0, (now - started) / 86_400_000);
  const filled = Math.min(4, Math.floor(daysSince / 7) + 1); // week 1 starts at day 0

  return (
    <div className="mt-2 flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => {
        const isFilled = i < filled;
        return (
          <div
            key={i}
            className={cn(
              "h-1.5 w-5 rounded-full transition-colors",
              isFilled ? "bg-mint" : "bg-ink-700"
            )}
          />
        );
      })}
      <span className="ml-2 text-[10px] uppercase tracking-widest text-ink-500">
        wk {filled}/4
      </span>
    </div>
  );
}
