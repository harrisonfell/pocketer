import type { Category, Leak, Transaction } from "./types";

const MIN_OCCURRENCES = 3;
const WINDOW_DAYS = 30;
const MIN_SAVINGS_PERCENT = 0.2;
const MIN_SAVINGS_DOLLARS = 30;

// Only these categories get surfaced as leaks. Groceries, gas, utilities are
// necessary spend — calling them "leaks" would make the product feel like a
// shamey budgeting app.
const LEAKABLE: ReadonlySet<Category> = new Set<Category>([
  "food_delivery",
  "coffee",
  "subscription",
  "rideshare",
]);

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 86_400_000;
}

function withinWindow(tx: Transaction, now: Date, windowDays: number): boolean {
  return daysBetween(new Date(tx.timestamp), now) <= windowDays;
}

// For a given leak, estimate achievable monthly savings based on category.
// Used as the "headline savings" number. Recommendation ranking is separate.
function estimateSavingsPotential(totalMonthly: number, category: Category): {
  dollars: number;
  percent: number;
} {
  switch (category) {
    case "food_delivery": {
      // Realistic: switching to meal prep + occasional cooking saves ~65% on average.
      const percent = 0.65;
      return { dollars: Math.round(totalMonthly * percent), percent };
    }
    case "coffee": {
      const percent = 0.7;
      return { dollars: Math.round(totalMonthly * percent), percent };
    }
    case "subscription": {
      const percent = 1.0;
      return { dollars: Math.round(totalMonthly * percent), percent };
    }
    case "rideshare": {
      const percent = 0.4;
      return { dollars: Math.round(totalMonthly * percent), percent };
    }
    default: {
      const percent = 0.25;
      return { dollars: Math.round(totalMonthly * percent), percent };
    }
  }
}

function merchantGroupKey(tx: Transaction): string {
  // Group all delivery apps together; treat each non-delivery merchant alone.
  if (tx.category === "food_delivery") return "food_delivery__group";
  return `${tx.category}__${tx.merchant}`;
}

function displayMerchant(category: Category, merchants: Set<string>): string {
  if (category === "food_delivery") {
    // Pick the dominant merchant for the headline; the full set goes into copy elsewhere.
    const list = Array.from(merchants);
    if (list.length === 1) return list[0];
    return list[0];
  }
  return Array.from(merchants)[0];
}

function copyForLeak(
  category: Category,
  merchant: string,
  merchants: Set<string>,
  spend: number,
  occurrences: number
): { headline: string; subhead: string } {
  if (category === "food_delivery") {
    const others = Array.from(merchants).filter((m) => m !== merchant);
    const extra =
      others.length > 0
        ? ` Plus ${others.length === 1 ? others[0] : `${others[0]} + ${others.length - 1} more`}.`
        : "";
    return {
      headline: `${merchant} is your #1 spend this month.`,
      subhead: `${occurrences} orders in 30 days.${extra}`,
    };
  }
  if (category === "coffee") {
    return {
      headline: `${merchant}, ${occurrences} times this month.`,
      subhead: `Small tickets add up faster than you'd think.`,
    };
  }
  if (category === "subscription") {
    return {
      headline: `${merchant} — running quietly in the background.`,
      subhead: `When was the last time you actually used it?`,
    };
  }
  return {
    headline: `${merchant} keeps showing up.`,
    subhead: `${occurrences} charges in the last month.`,
  };
}

export interface DetectOptions {
  now?: Date;
  windowDays?: number;
  minOccurrences?: number;
  minSavingsPercent?: number;
  minSavingsDollars?: number;
}

export function detectLeaks(transactions: Transaction[], opts: DetectOptions = {}): Leak[] {
  const now = opts.now ?? new Date();
  const windowDays = opts.windowDays ?? WINDOW_DAYS;
  const minOccurrences = opts.minOccurrences ?? MIN_OCCURRENCES;
  const minPct = opts.minSavingsPercent ?? MIN_SAVINGS_PERCENT;
  const minDollars = opts.minSavingsDollars ?? MIN_SAVINGS_DOLLARS;

  const recent = transactions.filter(
    (t) => withinWindow(t, now, windowDays) && LEAKABLE.has(t.category)
  );

  const groups = new Map<string, Transaction[]>();
  for (const tx of recent) {
    const key = merchantGroupKey(tx);
    const bucket = groups.get(key) ?? [];
    bucket.push(tx);
    groups.set(key, bucket);
  }

  const leaks: Leak[] = [];
  for (const [key, txns] of groups) {
    if (txns.length < minOccurrences) continue;
    const totalSpend = txns.reduce((s, t) => s + t.amount, 0);
    const avgTicket = totalSpend / txns.length;
    // Monthly projection: for a 30d window, totalSpend IS the monthly projection.
    // For shorter windows, linearly extrapolate.
    const monthlyProjection = totalSpend * (30 / windowDays);
    const { dollars, percent } = estimateSavingsPotential(monthlyProjection, txns[0].category);

    const meetsThreshold = percent >= minPct || dollars >= minDollars;
    if (!meetsThreshold) continue;

    const merchantSet = new Set(txns.map((t) => t.merchant));
    const merchant = displayMerchant(txns[0].category, merchantSet);
    const copy = copyForLeak(txns[0].category, merchant, merchantSet, totalSpend, txns.length);

    leaks.push({
      id: `leak_${key}`,
      merchant,
      category: txns[0].category,
      occurrences: txns.length,
      totalSpend: Math.round(totalSpend * 100) / 100,
      avgTicket: Math.round(avgTicket * 100) / 100,
      monthlyProjection: Math.round(monthlyProjection * 100) / 100,
      savingsPotential: dollars,
      savingsPercent: percent,
      transactions: txns,
      headline: copy.headline,
      subhead: copy.subhead,
    });
  }

  // Sort by monthly spend desc so the biggest leak surfaces first.
  leaks.sort((a, b) => b.monthlyProjection - a.monthlyProjection);
  return leaks;
}

export function topLeak(leaks: Leak[]): Leak | undefined {
  return leaks[0];
}

export function totalMonthlyLeakage(leaks: Leak[]): number {
  return leaks.reduce((s, l) => s + l.monthlyProjection, 0);
}

export function totalMonthlySavings(leaks: Leak[]): number {
  return leaks.reduce((s, l) => s + l.savingsPotential, 0);
}
