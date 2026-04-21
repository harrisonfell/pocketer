"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { Shell } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { RatingControl, RatingLabel } from "@/components/rating-control";
import { FitPips, FitBadge, FitRing } from "@/components/fit-score";
import { useSession } from "@/components/session-provider";
import { generateTransactions } from "@/lib/engine";
import { scoreTransaction, summarize, FIT_LABELS } from "@/lib/scoring";
import type { FitScore } from "@/lib/scoring";
import { formatMoney } from "@/lib/utils";
import type { Category, Transaction } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "habit" | "swap" | "unrated" | Category;

const FILTERS: { id: Filter; label: string; cat?: Category }[] = [
  { id: "all", label: "All" },
  { id: "habit", label: "Habit" },
  { id: "swap", label: "Swap-worthy" },
  { id: "unrated", label: "Unrated" },
  { id: "food_delivery", label: "Food delivery", cat: "food_delivery" },
  { id: "subscription", label: "Subscriptions", cat: "subscription" },
  { id: "coffee", label: "Coffee", cat: "coffee" },
];

export default function PurchasesPage() {
  const { hydrated, archetype, ratings } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [detailFor, setDetailFor] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !archetype) router.replace("/");
  }, [hydrated, archetype, router]);

  const txns = useMemo(
    () => (archetype ? last30Days(generateTransactions(archetype)) : []),
    [archetype]
  );

  const summary = useMemo(() => summarize(txns, ratings), [txns, ratings]);

  // Per-tx score, cached via useMemo so it doesn't recompute per row render.
  const scores = useMemo(() => {
    const map = new Map<string, ReturnType<typeof scoreTransaction>>();
    for (const t of txns) {
      map.set(t.id, scoreTransaction(t, txns, ratings[t.id]));
    }
    return map;
  }, [txns, ratings]);

  const filtered = useMemo(() => {
    if (filter === "all") return txns;
    if (filter === "unrated") return txns.filter((t) => !ratings[t.id]);
    if (filter === "habit") {
      return txns.filter((t) => (scores.get(t.id)?.value ?? 3) === 1);
    }
    if (filter === "swap") {
      return txns.filter((t) => (scores.get(t.id)?.value ?? 3) === 2);
    }
    const spec = FILTERS.find((f) => f.id === filter);
    if (spec?.cat) return txns.filter((t) => t.category === spec.cat);
    return txns;
  }, [txns, filter, ratings, scores]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  if (!hydrated)
    return (
      <Shell>
        <div className="px-5 pt-16" />
      </Shell>
    );

  return (
    <Shell>
      <div className="px-5 pb-8 pt-12 safe-top">
        <p className="text-micro text-ink-40 dark:text-snow-60">PURCHASES</p>
        <h1 className="mt-2 text-title1 text-ink dark:text-snow">Last 30 days</h1>

        {/* Headline aggregate — the app's read on your month */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-5"
        >
          <Card tone="icy">
            <div className="flex items-center gap-5">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center text-baltic dark:text-icy">
                <FitRing average={summary.average} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="nums text-[28px] font-extrabold leading-none text-ink dark:text-snow">
                    {summary.average.toFixed(1)}
                  </span>
                  <span className="mt-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-40 dark:text-snow-60">
                    of 5
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-micro text-baltic dark:text-icy">
                  YOUR POCKETER FIT
                </p>
                <p className="mt-1 text-title2 text-ink dark:text-snow">
                  {summary.label}
                </p>
                <p className="mt-1 text-caption text-ink-60 dark:text-snow-60">
                  {summary.count} purchases scored. Taps on any row adjust.
                </p>
              </div>
            </div>

            <DistributionBar dist={summary.distribution} total={summary.count} />
          </Card>
        </motion.div>

        <ScoreLegend />

        {/* Filter chips */}
        <div className="mt-5 -mx-5 overflow-x-auto noscroll px-5">
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

        {/* Transaction list */}
        <section className="mt-5 space-y-6">
          {grouped.map(({ key, label, items }) => (
            <div key={key}>
              <p className="text-micro text-ink-40 dark:text-snow-60">{label}</p>
              <ul className="mt-2 space-y-2">
                {items.map((tx, i) => {
                  const sc = scores.get(tx.id)!;
                  return (
                    <motion.li
                      key={tx.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: Math.min(0.03 * i, 0.2),
                        duration: 0.3,
                      }}
                    >
                      <TxRow
                        tx={tx}
                        score={sc}
                        open={detailFor === tx.id}
                        onToggle={() =>
                          setDetailFor((prev) => (prev === tx.id ? null : tx.id))
                        }
                      />
                    </motion.li>
                  );
                })}
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

function TxRow({
  tx,
  score,
  open,
  onToggle,
}: {
  tx: Transaction;
  score: { value: FitScore; label: string; reason: string };
  open: boolean;
  onToggle: () => void;
}) {
  const dimmed = score.value <= 2; // visually surface habit / swap-worthy
  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5 transition-colors",
        dimmed
          ? "border-ink-10 bg-ink-5/60 dark:border-white/10 dark:bg-white/5"
          : "border-ink-5 bg-white dark:border-white/5 dark:bg-[color:var(--surface)]"
      )}
    >
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

      {/* Score row */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          onClick={onToggle}
          className="press flex items-center gap-2 rounded-full border border-ink-10 bg-white px-2.5 py-1 text-ink-80 dark:border-white/10 dark:bg-white/5 dark:text-snow-80"
          aria-expanded={open}
          aria-label={`Fit score ${score.value} of 5: ${score.label}`}
        >
          <FitPips value={score.value} />
          <span className="text-[11px] font-semibold tracking-wide">
            {score.label}
          </span>
          <Info size={12} className="opacity-50" />
        </button>
        <RatingControl txId={tx.id} />
      </div>

      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.22 }}
          className="mt-3 overflow-hidden text-caption text-ink-60 dark:text-snow-60"
        >
          <span className="text-ink-40 dark:text-snow-60">Why this score:</span>{" "}
          {score.reason}
        </motion.p>
      )}
    </div>
  );
}

function DistributionBar({
  dist,
  total,
}: {
  dist: Record<FitScore, number>;
  total: number;
}) {
  if (total === 0) return null;
  const segments: { value: FitScore; count: number }[] = [
    { value: 5, count: dist[5] },
    { value: 4, count: dist[4] },
    { value: 3, count: dist[3] },
    { value: 2, count: dist[2] },
    { value: 1, count: dist[1] },
  ];
  // Fill intensity: 5 = baltic solid, 1 = baltic 25%.
  const opacity = (v: FitScore) =>
    ({ 5: 1, 4: 0.82, 3: 0.58, 2: 0.36, 1: 0.18 })[v];
  return (
    <div className="mt-4">
      <div className="flex h-2 overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
        {segments.map(({ value, count }) => {
          const pct = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={value}
              style={{
                width: `${pct}%`,
                backgroundColor: `rgba(44, 104, 154, ${opacity(value)})`,
              }}
              title={`${FIT_LABELS[value]}: ${count}`}
              className="dark:!bg-icy"
            />
          );
        })}
      </div>
    </div>
  );
}

function ScoreLegend() {
  return (
    <div className="mt-4 rounded-2xl border border-ink-5 bg-white px-4 py-3 dark:border-white/5 dark:bg-[color:var(--surface)]">
      <p className="text-micro text-ink-40 dark:text-snow-60">
        HOW WE SCORE EACH PURCHASE
      </p>
      <div className="mt-2 grid grid-cols-1 gap-1.5 text-caption text-ink-80 dark:text-snow-80">
        <LegendRow value={5} desc="Essential — staples, rent, utilities." />
        <LegendRow value={4} desc="Worth it — experiences or anything you flagged." />
        <LegendRow value={3} desc="Fair — no strong signal either way." />
        <LegendRow value={2} desc="Swap-worthy — we know a cheaper option." />
        <LegendRow value={1} desc="Habit — high repeat with an easy swap." />
      </div>
    </div>
  );
}

function LegendRow({ value, desc }: { value: FitScore; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <FitPips value={value} />
      <span>{desc}</span>
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
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
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
  for (const g of ordered) {
    g.items.sort((a, b) =>
      new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ? 1 : -1
    );
  }
  return ordered;
}
