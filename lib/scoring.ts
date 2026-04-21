import type { Transaction } from "./engine/types";
import type { Rating } from "@/components/session-provider";

/**
 * Pocketer's per-transaction Fit Score (1–5).
 *
 * The score answers one question: "How well does this purchase fit where
 * your money could be going?" It is not a moral grade — it is a repeatability
 * + replaceability read, softened by the user's own rating when present.
 *
 * 5 — Essential. Rent, utilities, groceries. Can't (and shouldn't) swap.
 * 4 — Worth it. Experiences, one-offs, or user marked as "worth it".
 * 3 — Fair.    Occasional treat with no strong signal either way.
 * 2 — Swap-worthy. Repeats with a known cheaper alternative.
 * 1 — Habit.   Very frequent repeats, or user marked as "regret".
 */

export type FitScore = 1 | 2 | 3 | 4 | 5;

export const FIT_LABELS: Record<FitScore, string> = {
  5: "Essential",
  4: "Worth it",
  3: "Fair",
  2: "Swap-worthy",
  1: "Habit",
};

export interface Score {
  value: FitScore;
  label: string;
  reason: string;
}

const ZOMBIE_SUBS = new Set(["Adobe CC", "NY Times", "Peloton App"]);

function sameMonthCount(tx: Transaction, all: Transaction[]): number {
  const cutoff = Date.now() - 30 * 86_400_000;
  return all.filter(
    (t) =>
      t.merchant === tx.merchant &&
      new Date(t.timestamp).getTime() >= cutoff
  ).length;
}

export function scoreTransaction(
  tx: Transaction,
  all: Transaction[],
  userRating?: Rating
): Score {
  // User's own verdict is the strongest signal — respect it.
  if (userRating === "worth_it") {
    return {
      value: 4,
      label: FIT_LABELS[4],
      reason: "You said it's worth it.",
    };
  }
  if (userRating === "regret") {
    return {
      value: 1,
      label: FIT_LABELS[1],
      reason: "You said it's regret.",
    };
  }

  // Essential categories — never flagged as habit.
  if (tx.category === "utilities" || tx.category === "gas") {
    return {
      value: 5,
      label: FIT_LABELS[5],
      reason: "Monthly necessity.",
    };
  }
  if (tx.category === "groceries") {
    return {
      value: 5,
      label: FIT_LABELS[5],
      reason: "Staples — the thing delivery replaces.",
    };
  }

  // Subscriptions — zombie subs score lower.
  if (tx.category === "subscription") {
    if (ZOMBIE_SUBS.has(tx.merchant)) {
      return {
        value: 2,
        label: FIT_LABELS[2],
        reason: "When did you last open it?",
      };
    }
    return {
      value: 3,
      label: FIT_LABELS[3],
      reason: "Monthly charge, your call.",
    };
  }

  // Delivery — heavier the more frequent.
  if (tx.category === "food_delivery") {
    const n = sameMonthCount(tx, all);
    if (n >= 12) {
      return {
        value: 1,
        label: FIT_LABELS[1],
        reason: `${n}× this month — a daily pattern.`,
      };
    }
    if (n >= 5) {
      return {
        value: 2,
        label: FIT_LABELS[2],
        reason: `${n}× this month — cheaper swap exists.`,
      };
    }
    return {
      value: 3,
      label: FIT_LABELS[3],
      reason: "Occasional — no swap needed.",
    };
  }

  // Coffee — similar logic.
  if (tx.category === "coffee") {
    const n = sameMonthCount(tx, all);
    if (n >= 10) {
      return {
        value: 2,
        label: FIT_LABELS[2],
        reason: `${n}× this month — adds up.`,
      };
    }
    return {
      value: 3,
      label: FIT_LABELS[3],
      reason: "Sometimes you need it.",
    };
  }

  // Rideshare — more than a few means pattern.
  if (tx.category === "rideshare") {
    const n = sameMonthCount(tx, all);
    if (n >= 6) {
      return {
        value: 2,
        label: FIT_LABELS[2],
        reason: `${n}× this month — consider a pass.`,
      };
    }
    return {
      value: 3,
      label: FIT_LABELS[3],
      reason: "Practical when needed.",
    };
  }

  // Retail and other — neutral.
  if (tx.amount >= 100) {
    return {
      value: 4,
      label: FIT_LABELS[4],
      reason: "Bigger one-off — experience or object you kept.",
    };
  }
  return {
    value: 3,
    label: FIT_LABELS[3],
    reason: "Nothing flagged.",
  };
}

export interface ScoreSummary {
  average: number; // 1..5
  distribution: Record<FitScore, number>;
  label: string; // the bucket the average falls into
  count: number;
}

export function summarize(
  txns: Transaction[],
  ratings: Record<string, Rating>
): ScoreSummary {
  const dist: Record<FitScore, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const t of txns) {
    const s = scoreTransaction(t, txns, ratings[t.id]);
    dist[s.value]++;
    sum += s.value;
  }
  const average = txns.length > 0 ? sum / txns.length : 0;
  const rounded = Math.max(1, Math.min(5, Math.round(average))) as FitScore;
  return {
    average,
    distribution: dist,
    label: FIT_LABELS[rounded],
    count: txns.length,
  };
}
