"use client";

import { motion } from "framer-motion";
import { useSession, type Rating } from "@/components/session-provider";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Rating; label: string; glyph: string }[] = [
  { value: "worth_it", label: "Worth it", glyph: "✓" },
  { value: "meh", label: "Meh", glyph: "~" },
  { value: "regret", label: "Regret", glyph: "✕" },
];

export function RatingControl({
  txId,
  compact = false,
}: {
  txId: string;
  compact?: boolean;
}) {
  const { rate, getRating } = useSession();
  const current = getRating(txId);

  return (
    <div
      className={cn(
        "flex items-center",
        compact ? "gap-1" : "gap-1.5"
      )}
      role="radiogroup"
      aria-label="Rate this purchase"
    >
      {OPTIONS.map((opt) => {
        const active = current === opt.value;
        return (
          <motion.button
            key={opt.value}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              rate(txId, active ? null : opt.value);
            }}
            whileTap={{ scale: 0.9 }}
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            className={cn(
              "press inline-flex items-center justify-center rounded-full border font-semibold transition-all",
              compact ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-[13px]",
              active
                ? "bg-baltic text-white border-baltic shadow-soft dark:bg-icy dark:text-ink dark:border-icy"
                : "bg-transparent text-ink-60 border-ink-10 hover:border-baltic/40 hover:text-ink dark:text-snow-60 dark:border-white/10 dark:hover:border-icy/40 dark:hover:text-icy"
            )}
          >
            {opt.glyph}
          </motion.button>
        );
      })}
    </div>
  );
}

export function RatingLabel({ txId }: { txId: string }) {
  const { getRating } = useSession();
  const r = getRating(txId);
  if (!r) return null;
  const map = {
    worth_it: "worth it",
    meh: "meh",
    regret: "regret",
  } as const;
  return (
    <span className="text-[11px] uppercase tracking-[0.14em] text-baltic dark:text-icy">
      you said: {map[r]}
    </span>
  );
}
