"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { RatingControl, RatingLabel } from "@/components/rating-control";
import { CountUp } from "@/components/count-up";
import { useSession } from "@/components/session-provider";
import { generateTransactions } from "@/lib/engine";
import { aggregate, aggregateByMerchant } from "@/lib/ratings";
import { formatMoney } from "@/lib/utils";
import type { Category, Transaction } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "unrated" | "food_delivery" | "subscription" | "coffee";

const FILTERS: { id: Filter; label: string; cat?: Category }[] = [
  { id: "all", label: "All" },
  { id: "unrated", label: "Unrated" },
  { id: "food_delivery", label: "Food delivery", cat: "food_delivery" },
  { id: "subscription", label: "Subscriptions", cat: "subscription" },
  { id: "coffee", label: "Coffee", cat: "coffee" },
];

export default function PurchasesPage() {
  const { hydrated, archetype, ratings } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (hydrated && !archetype) router.replace("/");
  }, [hydrated, archetype, router]);

  const txns = useMemo(
    () => (archetype ? last30Days(generateTransactions(archetype)) : []),
    [archetype]
  );

  const stats = useMemo(() => aggregate(txns, ratings), [txns, ratings]);
  const byMerchant = useMemo(
    () => aggregateByMerchant(txns, ratings),
    [txns, ratings]
  );

  // Highest-regret merchant — the "your patterns" insight.
  const topRegret = useMemo(() => {
    let best: { merchant: string; regret: number; rated: number } | null = null;
    for (const [m, s] of byMerchant) {
      if (s.rated < 2) continue;
      if (!best || s.regret > best.regret) {
        best = { merchant: m, regret: s.regret, rated: s.rated };
      }
    }
    return best;
  }, [byMerchant]);

  const filtered = useMemo(() => {
    let list = txns;
    if (filter === "unrated") {
      list = txns.filter((t) => !ratings[t.id]);
    } else if (filter !== "all") {
      const spec = FILTERS.find((f) => f.id === filter);
      if (spec?.cat) list = txns.filter((t) => t.category === spec.cat);
    }
    return list;
  }, [txns, filter, ratings]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  if (!hydrated) return <Shell><div className="px-5 pt-16" /></Shell>;

  return (
    <Shell>
      <div className="px-5 pb-8 pt-12 safe-top">
        <p className="text-micro text-ink-40 dark:text-snow-60">PURCHASES</p>
        <h1 className="mt-2 text-title1 text-ink dark:text-snow">
          Last 30 days
        </h1>

        {/* Headline insight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-5"
        >
          <Card tone={stats.rated > 0 ? "icy" : "default"}>
            {stats.rated > 0 ? (
              <>
                <p className="text-micro text-baltic dark:text-icy">
                  HOW YOU&apos;RE FEELING
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-display nums text-ink dark:text-snow">
                    <CountUp to={stats.worthItPct} prefix="" suffix="%" duration={0.9} />
                  </span>
                  <span className="text-callout text-ink-60 dark:text-snow-60">
                    worth it
                  </span>
                </div>
                <p className="mt-1 text-callout text-ink-60 dark:text-snow-60">
                  {stats.rated} of {stats.total} rated · {stats.regret}{" "}
                  {stats.regret === 1 ? "regret" : "regrets"}
                </p>
                <RatingBar stats={stats} />
                {topRegret && topRegret.regret >= 2 && (
                  <p className="mt-4 text-caption text-ink-60 dark:text-snow-60">
                    <span className="text-baltic dark:text-icy font-semibold">
                      {topRegret.merchant}
                    </span>{" "}
                    gets your &quot;regret&quot; tag the most —{" "}
                    {topRegret.regret} of {topRegret.rated}.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-micro text-ink-40 dark:text-snow-60">
                  RATE AS YOU GO
                </p>
                <p className="mt-2 text-headline text-ink dark:text-snow">
                  Tap ✓ / ~ / ✕ on anything below.
                </p>
                <p className="mt-1 text-callout text-ink-60 dark:text-snow-60">
                  We learn what&apos;s worth it to you — and stop suggesting
                  swaps for things you&apos;d actually miss.
                </p>
              </>
            )}
          </Card>
        </motion.div>

        {/* Filter chips */}
        <div className="mt-6 -mx-5 overflow-x-auto noscroll px-5">
          <div className="flex gap-2">
            {FILTERS.map((f) => {
              const active = f.id === filter;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "press shrink-0 rounded-full px-3.5 py-1.5 text-caption font-semibold whitespace-nowrap transition-colors",
                    active
                      ? "bg-ink text-snow dark:bg-icy dark:text-ink"
                      : "bg-ink-5 text-ink-60 dark:bg-white/5 dark:text-snow-60"
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction list, grouped by day */}
        <section className="mt-6 space-y-6">
          {grouped.map(({ key, label, items }) => (
            <div key={key}>
              <p className="text-micro text-ink-40 dark:text-snow-60">{label}</p>
              <ul className="mt-2 space-y-2">
                {items.map((tx, i) => (
                  <motion.li
                    key={tx.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.04 * i, 0.25), duration: 0.3 }}
                  >
                    <TxRow tx={tx} />
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-ink-10 p-8 text-center text-callout text-ink-40 dark:border-white/10 dark:text-snow-60">
              Nothing here for this filter.
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  return (
    <div className="rounded-2xl border border-ink-5 bg-white p-3.5 transition-colors dark:border-white/5 dark:bg-[color:var(--surface)]">
      <div className="flex items-center gap-3">
        <CategoryIcon category={tx.category} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-headline text-ink dark:text-snow">
              {tx.merchant}
            </p>
            <p className="nums text-headline text-ink dark:text-snow shrink-0">
              {formatMoney(tx.amount, { cents: tx.amount < 20 })}
            </p>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="text-caption text-ink-40 dark:text-snow-60">
              {new Date(tx.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              {" · "}
              {new Date(tx.timestamp).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            <RatingLabel txId={tx.id} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-40 dark:text-snow-60">
          How was it?
        </p>
        <RatingControl txId={tx.id} />
      </div>
    </div>
  );
}

function RatingBar({
  stats,
}: {
  stats: { worthIt: number; meh: number; regret: number; rated: number };
}) {
  if (stats.rated === 0) return null;
  const w = (stats.worthIt / stats.rated) * 100;
  const m = (stats.meh / stats.rated) * 100;
  const r = (stats.regret / stats.rated) * 100;
  return (
    <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
      {w > 0 && (
        <div
          style={{ width: `${w}%` }}
          className="bg-baltic dark:bg-icy"
          title={`${stats.worthIt} worth it`}
        />
      )}
      {m > 0 && (
        <div
          style={{ width: `${m}%` }}
          className="bg-baltic/40 dark:bg-icy/40"
          title={`${stats.meh} meh`}
        />
      )}
      {r > 0 && (
        <div
          style={{ width: `${r}%` }}
          className="bg-ink dark:bg-snow"
          title={`${stats.regret} regret`}
        />
      )}
    </div>
  );
}

function last30Days(txns: Transaction[]): Transaction[] {
  const cutoff = Date.now() - 30 * 86_400_000;
  return txns.filter((t) => new Date(t.timestamp).getTime() >= cutoff);
}

interface DayGroup {
  key: string;
  label: string;
  items: Transaction[];
}

function groupByDay(txns: Transaction[]): DayGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = todayStart - 6 * 86_400_000;

  const buckets = new Map<string, DayGroup>();
  for (const t of txns) {
    const ts = new Date(t.timestamp).getTime();
    let key: string;
    let label: string;
    if (ts >= todayStart) {
      key = "today";
      label = "Today";
    } else if (ts >= yesterdayStart) {
      key = "yesterday";
      label = "Yesterday";
    } else if (ts >= weekStart) {
      key = "week";
      label = "This week";
    } else {
      const d = new Date(t.timestamp);
      key = `m_${d.getFullYear()}_${d.getMonth()}`;
      label = d.toLocaleDateString(undefined, { month: "long" });
    }
    const b = buckets.get(key) ?? { key, label, items: [] };
    b.items.push(t);
    buckets.set(key, b);
  }
  const order = ["today", "yesterday", "week"];
  const ordered: DayGroup[] = [];
  for (const k of order) {
    if (buckets.has(k)) ordered.push(buckets.get(k)!);
  }
  for (const [k, v] of buckets) {
    if (!order.includes(k)) ordered.push(v);
  }
  // Newest item first in each bucket
  for (const g of ordered) {
    g.items.sort((a, b) =>
      new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ? 1 : -1
    );
  }
  return ordered;
}
