"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Shell } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/category-icon";
import { useLeak, suggestAlternatives } from "@/lib/use-scan";
import { useSession } from "@/components/session-provider";
import type { Alternative } from "@/lib/engine/types";
import { aggregate } from "@/lib/ratings";
import { cn } from "@/lib/utils";

export default function LeakDetail() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const router = useRouter();
  const { leak, ready } = useLeak(id);
  const { addSwitch, switches, ratings } = useSession();
  const [confirmed, setConfirmed] = useState<Alternative | null>(null);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const alts = useMemo(() => (leak ? suggestAlternatives(leak) : []), [leak]);
  const visible = alts.filter((a) => !skipped.has(a.id));
  const current = visible[0] ?? null;
  const currentSavings = leak && current ? Math.round(current.estSavingsVsLeak(leak)) : 0;
  const ratingStats = useMemo(
    () => (leak ? aggregate(leak.transactions, ratings) : null),
    [leak, ratings]
  );

  if (!ready) {
    return (
      <Shell>
        <div className="px-5 pt-16 text-body text-ink-60 dark:text-snow-60">
          Loading…
        </div>
      </Shell>
    );
  }
  if (!leak) {
    return (
      <Shell>
        <div className="px-5 pt-16">
          <p className="text-body text-ink dark:text-snow">Not found.</p>
          <Link href="/home" className="text-baltic dark:text-icy">
            Back home
          </Link>
        </div>
      </Shell>
    );
  }

  const alreadySwitched = switches.find(
    (s) => s.leakId === leak.id && s.status === "active"
  );

  function accept() {
    if (!current || !leak) return;
    addSwitch({
      leakId: leak.id,
      alternativeId: current.id,
      alternativeName: current.name,
      projectedMonthlySavings: currentSavings,
    });
    setConfirmed(current);
    setTimeout(() => router.push("/switches"), 1200);
  }

  function skip() {
    if (!current) return;
    setSkipped((prev) => new Set([...prev, current.id]));
  }

  return (
    <Shell>
      <div className="px-5 pt-10 pb-10 safe-top">
        <button
          onClick={() => router.back()}
          className="press inline-flex items-center gap-1 text-callout text-ink-60 dark:text-snow-60"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <section className="mt-6">
          <div className="flex items-center gap-3">
            <CategoryIcon category={leak.category} size={52} />
            <div>
              <p className="text-micro text-baltic dark:text-icy">
                THE HABIT
              </p>
              <h1 className="text-title1 text-ink dark:text-snow">{leak.merchant}</h1>
            </div>
          </div>

          <Card tone="icy" className="mt-5">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-caption text-ink-60 dark:text-snow-60">
                  Last 30 days
                </p>
                <p className="mt-1 text-title1 nums text-ink dark:text-snow">
                  ${Math.round(leak.monthlyProjection)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-caption text-ink-60 dark:text-snow-60">
                  Orders
                </p>
                <p className="mt-1 text-title1 nums text-ink dark:text-snow">
                  {leak.occurrences}
                </p>
              </div>
            </div>
            <p className="mt-4 text-callout text-ink-60 dark:text-snow-60">
              {leak.subhead}
            </p>

            {ratingStats && ratingStats.rated > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/50 p-3 dark:bg-white/5">
                <Ministat
                  label="Worth it"
                  value={ratingStats.worthIt}
                  of={ratingStats.rated}
                />
                <Ministat
                  label="Meh"
                  value={ratingStats.meh}
                  of={ratingStats.rated}
                />
                <Ministat
                  label="Regret"
                  value={ratingStats.regret}
                  of={ratingStats.rated}
                  emphasize={ratingStats.regret > 0}
                />
              </div>
            )}
          </Card>
        </section>

        <section className="mt-8">
          <p className="text-micro text-baltic dark:text-icy">
            THE SWAP WE&apos;D TRY
          </p>
          <h2 className="mt-2 text-title2 text-ink dark:text-snow">
            One change covers most of it.
          </h2>

          <AnimatePresence mode="wait">
            {current && !confirmed && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10, rotateX: -6 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4"
                style={{ perspective: 900 }}
              >
                <AltCard
                  alt={current}
                  savings={currentSavings}
                  leakAmount={leak.monthlyProjection}
                />
              </motion.div>
            )}
            {confirmed && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4"
              >
                <Card tone="ink" className="text-center">
                  <div className="mb-2 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-icy text-ink">
                      <Check size={22} strokeWidth={2.6} />
                    </div>
                  </div>
                  <p className="text-micro text-icy">LOCKED IN</p>
                  <p className="mt-2 text-headline text-snow">{confirmed.name}</p>
                  <p className="mt-1 text-callout text-snow-60">
                    We&apos;ll check back in 7 days.
                  </p>
                </Card>
              </motion.div>
            )}
            {!current && !confirmed && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <Card className="text-center text-ink-60 dark:text-snow-60">
                  <p>No more ideas for this one. Come back after payday.</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!alreadySwitched && current && !confirmed && (
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={skip}
                className="press flex h-14 w-14 items-center justify-center rounded-full border border-ink-10 text-ink-60 hover:border-ink-20 dark:border-white/10 dark:text-snow-60"
                aria-label="Not feeling it"
              >
                <X size={22} />
              </button>
              <Button size="lg" block onClick={accept}>
                {current.ctaLabel}
              </Button>
            </div>
          )}

          {alreadySwitched && !confirmed && (
            <Card tone="icy" className="mt-5">
              <p className="text-micro text-baltic dark:text-icy">
                YOU&apos;RE ON THIS ONE
              </p>
              <p className="mt-2 text-body text-ink dark:text-snow">
                {alreadySwitched.alternativeName}. About ${" "}
                {alreadySwitched.projectedMonthlySavings}/mo staying with you.
              </p>
              <Link
                href="/switches"
                className="mt-3 inline-block text-callout font-semibold text-baltic dark:text-icy"
              >
                See all switches →
              </Link>
            </Card>
          )}
        </section>

        {visible.length > 1 && !confirmed && (
          <section className="mt-10">
            <p className="text-micro text-ink-40 dark:text-snow-60">
              OTHER ANGLES
            </p>
            <div className="mt-3 space-y-2">
              {visible.slice(1, 5).map((alt) => {
                const s = Math.round(alt.estSavingsVsLeak(leak));
                return (
                  <div
                    key={alt.id}
                    className="flex items-center justify-between rounded-2xl border border-ink-5 bg-white px-4 py-3 dark:border-white/5 dark:bg-[color:var(--surface)]"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-callout font-semibold text-ink dark:text-snow">
                        {alt.name}
                      </p>
                      <p className="truncate text-caption text-ink-60 dark:text-snow-60">
                        {alt.blurb}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "nums text-callout font-semibold whitespace-nowrap",
                        s > 0
                          ? "text-baltic dark:text-icy"
                          : "text-ink-40 dark:text-snow-60"
                      )}
                    >
                      {s > 0 ? `−$${s}/mo` : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!confirmed && (
          <p className="mt-10 text-center text-caption text-ink-40 dark:text-snow-60">
            {leak.occurrences} charges averaged ${leak.avgTicket.toFixed(2)} · last 30 days
          </p>
        )}
      </div>
    </Shell>
  );
}

function Ministat({
  label,
  value,
  of,
  emphasize,
}: {
  label: string;
  value: number;
  of: number;
  emphasize?: boolean;
}) {
  return (
    <div className="text-center">
      <p
        className={cn(
          "text-title2 font-bold nums",
          emphasize ? "text-ink dark:text-snow" : "text-ink-80 dark:text-snow-80"
        )}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-40 dark:text-snow-60">
        {label}
      </p>
    </div>
  );
}

function AltCard({
  alt,
  savings,
  leakAmount,
}: {
  alt: Alternative;
  savings: number;
  leakAmount: number;
}) {
  const savingsPct = Math.round((savings / Math.max(1, leakAmount)) * 100);
  return (
    <div className="rounded-3xl border border-baltic/25 bg-white p-5 shadow-card dark:border-icy/25 dark:bg-[color:var(--surface)]">
      <p className="text-micro text-baltic dark:text-icy">SWAP TO</p>
      <h3 className="mt-2 text-title1 text-ink dark:text-snow">{alt.name}</h3>
      <p className="mt-2 text-callout text-ink-60 dark:text-snow-60">{alt.blurb}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Stat label="Back in pocket" value={`$${savings}`} accent />
        <Stat label="Costs you" value={`$${alt.monthlyCost}`} />
        <Stat label="Prep" value={`${alt.prepMinutes}m`} />
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-icy-softer px-4 py-3 dark:bg-baltic/15">
        <span className="text-caption text-ink-60 dark:text-snow-60">
          In a year
        </span>
        <span className="nums text-callout font-bold text-baltic dark:text-icy">
          ${(savings * 12).toLocaleString()}
        </span>
      </div>

      {savings > 0 && leakAmount > 0 && (
        <p className="mt-3 text-caption text-ink-40 dark:text-snow-60">
          Covers{" "}
          <span className="text-baltic dark:text-icy font-semibold">{savingsPct}%</span>{" "}
          of the ${Math.round(leakAmount)} you&apos;re already spending.
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-40 dark:text-snow-60">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 nums text-headline font-bold",
          accent ? "text-baltic dark:text-icy" : "text-ink dark:text-snow"
        )}
      >
        {value}
      </p>
    </div>
  );
}
