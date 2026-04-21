"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowLeft, ThumbsDown, ThumbsUp } from "lucide-react";
import { Shell } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/category-icon";
import { useLeak, suggestAlternatives } from "@/lib/use-scan";
import { useSession } from "@/components/session-provider";
import type { Alternative } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

export default function LeakDetail() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const router = useRouter();
  const { leak, ready } = useLeak(id);
  const { addSwitch, switches } = useSession();
  const [confirmed, setConfirmed] = useState<Alternative | null>(null);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const alts = useMemo(() => (leak ? suggestAlternatives(leak) : []), [leak]);
  const visible = alts.filter((a) => !skipped.has(a.id));
  const current = visible[0] ?? null;
  const currentSavings = leak && current ? Math.round(current.estSavingsVsLeak(leak)) : 0;

  if (!ready) return <Shell><div className="px-5 pt-16">Loading…</div></Shell>;
  if (!leak) {
    return (
      <Shell>
        <div className="px-5 pt-16">
          <p>Leak not found.</p>
          <Link href="/home" className="text-mint">Back home</Link>
        </div>
      </Shell>
    );
  }

  const alreadySwitched = switches.find((s) => s.leakId === leak.id && s.status === "active");

  function accept() {
    if (!current || !leak) return;
    const s = addSwitch({
      leakId: leak.id,
      alternativeId: current.id,
      alternativeName: current.name,
      projectedMonthlySavings: currentSavings,
    });
    setConfirmed(current);
    setTimeout(() => {
      router.push("/switches");
    }, 1200);
    return s;
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
          className="press inline-flex items-center gap-1 text-sm text-ink-400"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <section className="mt-6">
          <div className="flex items-center gap-3">
            <CategoryIcon category={leak.category} size={48} />
            <div>
              <p className="text-xs font-semibold tracking-widest text-amber-leak">THE LEAK</p>
              <h1 className="text-2xl font-semibold tracking-tight">{leak.merchant}</h1>
            </div>
          </div>

          <Card tone="warm" className="mt-5">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-ink-300">Last 30 days</p>
                <p className="mt-1 text-4xl font-semibold nums">
                  ${Math.round(leak.monthlyProjection)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-300">Orders</p>
                <p className="mt-1 text-4xl font-semibold nums">{leak.occurrences}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink-200">{leak.subhead}</p>
          </Card>
        </section>

        <section className="mt-8">
          <p className="text-xs font-semibold tracking-widest text-mint">THE SWITCH</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
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
                <AltCard alt={current} savings={currentSavings} leakAmount={leak.monthlyProjection} />
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
                <Card tone="mint" className="text-center">
                  <div className="mb-2 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint text-ink-950">
                      <ThumbsUp size={22} />
                    </div>
                  </div>
                  <p className="text-xs font-semibold tracking-widest text-mint">LOCKED IN</p>
                  <p className="mt-2 text-lg font-semibold">{confirmed.name}</p>
                  <p className="mt-1 text-sm text-ink-300">
                    We&apos;ll check back in 7 days to see how it landed.
                  </p>
                </Card>
              </motion.div>
            )}
            {!current && !confirmed && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                <Card className="text-center text-ink-300">
                  <p>No more ideas for this leak. Come back after payday.</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!alreadySwitched && current && !confirmed && (
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={skip}
                className="press flex h-14 w-14 items-center justify-center rounded-full border border-ink-700 text-ink-300"
                aria-label="Not feeling it"
              >
                <ThumbsDown size={22} />
              </button>
              <Button size="lg" block onClick={accept}>
                {current.ctaLabel}
              </Button>
            </div>
          )}

          {alreadySwitched && !confirmed && (
            <Card tone="mint" className="mt-5">
              <p className="text-xs font-semibold tracking-widest text-mint">ALREADY SWITCHED</p>
              <p className="mt-2 text-sm text-ink-200">
                You&apos;re on {alreadySwitched.alternativeName}. Saving ~$
                {alreadySwitched.projectedMonthlySavings}/mo.
              </p>
              <Link href="/switches" className="mt-3 inline-block text-sm font-semibold text-mint">
                See all switches →
              </Link>
            </Card>
          )}
        </section>

        {visible.length > 1 && !confirmed && (
          <section className="mt-10">
            <p className="text-xs font-semibold tracking-widest text-ink-400">
              OTHER ANGLES
            </p>
            <div className="mt-3 space-y-2">
              {visible.slice(1, 5).map((alt) => {
                const s = Math.round(alt.estSavingsVsLeak(leak));
                return (
                  <div
                    key={alt.id}
                    className="flex items-center justify-between rounded-xl border border-ink-800 bg-ink-900 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{alt.name}</p>
                      <p className="text-xs text-ink-400">{alt.blurb}</p>
                    </div>
                    <p
                      className={cn(
                        "nums text-sm font-semibold whitespace-nowrap",
                        s > 0 ? "text-mint" : "text-ink-500"
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
          <section className="mt-10 text-center">
            <p className="text-xs text-ink-500">
              {leak.occurrences} charges averaged ${leak.avgTicket.toFixed(2)} · source: last 30
              days
            </p>
          </section>
        )}
      </div>
    </Shell>
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
    <div className="rounded-2xl border border-mint/30 bg-gradient-to-b from-mint/10 to-ink-900 p-5">
      <p className="text-xs font-medium tracking-widest text-mint">SWITCH TO</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{alt.name}</h3>
      <p className="mt-2 text-sm leading-snug text-ink-200">{alt.blurb}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Stat label="Saves" value={`$${savings}`} accent />
        <Stat label="Per month" value={`$${alt.monthlyCost}`} />
        <Stat label="Prep" value={`${alt.prepMinutes}m`} />
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-ink-950/60 px-4 py-3">
        <span className="text-xs text-ink-300">Annual impact</span>
        <span className="nums text-sm font-semibold text-mint">
          ${(savings * 12).toLocaleString()}/yr
        </span>
      </div>

      {savings > 0 && (
        <p className="mt-3 text-[11px] text-ink-400">
          Cuts your {leakAmount > 0 ? `$${Math.round(leakAmount)}` : "this"} leak by{" "}
          <span className="text-mint">{savingsPct}%</span>
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
      <p className="text-[10px] uppercase tracking-widest text-ink-400">{label}</p>
      <p className={cn("mt-1 nums text-lg font-semibold", accent && "text-mint")}>{value}</p>
    </div>
  );
}
