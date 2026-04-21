import type { Transaction } from "./engine/types";
import type { Rating } from "@/components/session-provider";

export interface RatingStats {
  total: number;
  rated: number;
  worthIt: number;
  meh: number;
  regret: number;
  worthItPct: number; // 0-100
  regretPct: number; // 0-100
}

export function aggregate(
  txns: Transaction[],
  ratings: Record<string, Rating>
): RatingStats {
  let worthIt = 0;
  let meh = 0;
  let regret = 0;
  let rated = 0;
  for (const t of txns) {
    const r = ratings[t.id];
    if (!r) continue;
    rated++;
    if (r === "worth_it") worthIt++;
    else if (r === "meh") meh++;
    else if (r === "regret") regret++;
  }
  return {
    total: txns.length,
    rated,
    worthIt,
    meh,
    regret,
    worthItPct: rated === 0 ? 0 : Math.round((worthIt / rated) * 100),
    regretPct: rated === 0 ? 0 : Math.round((regret / rated) * 100),
  };
}

export function aggregateByMerchant(
  txns: Transaction[],
  ratings: Record<string, Rating>,
  merchantGroup?: (t: Transaction) => string
): Map<string, RatingStats> {
  const groupFn = merchantGroup ?? ((t: Transaction) => t.merchant);
  const groups = new Map<string, Transaction[]>();
  for (const t of txns) {
    const k = groupFn(t);
    const b = groups.get(k) ?? [];
    b.push(t);
    groups.set(k, b);
  }
  const out = new Map<string, RatingStats>();
  for (const [k, list] of groups) {
    out.set(k, aggregate(list, ratings));
  }
  return out;
}
