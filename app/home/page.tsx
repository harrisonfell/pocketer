"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Shell } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { CountUp } from "@/components/count-up";
import { useSession } from "@/components/session-provider";
import { useScan } from "@/lib/use-scan";
import { hoursOfPaycheck } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";
import { WhatThatBuys } from "@/components/what-that-buys";
import { ScanLoading } from "@/components/scan-loading";
import { aggregate } from "@/lib/ratings";

const SCAN_FLAG = "pocketer.scanned.v2";

export default function HomePage() {
  const { hydrated, archetype, profile, ratings } = useSession();
  const router = useRouter();
  const scan = useScan();
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    if (hydrated && !archetype) router.replace("/");
    if (hydrated && typeof window !== "undefined") {
      if (window.sessionStorage.getItem(SCAN_FLAG) === "done") {
        setScanComplete(true);
      }
    }
  }, [hydrated, archetype, router]);

  // Aggregate regret stats across the top leak's transactions.
  const topLeakRatings = useMemo(() => {
    if (!scan.topLeak) return null;
    return aggregate(scan.topLeak.transactions, ratings);
  }, [scan.topLeak, ratings]);

  function finishScan() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SCAN_FLAG, "done");
    }
    setScanComplete(true);
  }

  if (!scan.ready) return <Shell><LoadingSkeleton /></Shell>;
  if (!scanComplete) return <Shell><ScanLoading onDone={finishScan} /></Shell>;

  const top = scan.topLeak;
  const secondary = scan.leaks.slice(1, 4).filter((l) => l.savingsPotential > 0);
  const wage = profile?.hourlyWage ?? 24;

  if (!top || top.savingsPotential <= 0) {
    return (
      <Shell>
        <EmptyState
          note={
            top
              ? `We see $${Math.round(top.monthlyProjection)} on ${top.merchant} — not enough to swap.`
              : undefined
          }
        />
      </Shell>
    );
  }

  const hours = Math.round(hoursOfPaycheck(top.monthlyProjection, wage));

  return (
    <Shell>
      <div className="px-5 pb-8 pt-10 safe-top">
        <Header name={profile?.displayName ?? "you"} />

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22 }}
          className="mt-5"
        >
          <p className="text-micro text-baltic dark:text-icy">
            SHOWS UP A LOT · LAST 30 DAYS
          </p>
          <h1 className="mt-2 text-[54px] font-extrabold leading-[0.96] tracking-[-0.02em] nums text-ink dark:text-snow">
            <CountUp to={top.monthlyProjection} delay={0.3} duration={1.2} />
          </h1>
          <p className="mt-3 text-headline text-ink dark:text-snow">
            {top.headline}
          </p>
          <p className="mt-1 text-callout text-ink-60 dark:text-snow-60">
            {top.subhead} At your hourly rate, about{" "}
            <span className="text-ink dark:text-snow font-semibold nums">{hours}</span>{" "}
            hours of work.
          </p>

          {topLeakRatings && topLeakRatings.rated > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink-10 px-3 py-1.5 dark:border-white/10"
            >
              <span className="h-2 w-2 rounded-full bg-baltic dark:bg-icy" />
              <span className="text-caption text-ink-60 dark:text-snow-60">
                You rated{" "}
                <span className="text-ink dark:text-snow font-semibold">
                  {topLeakRatings.regret} of {topLeakRatings.rated}
                </span>{" "}
                as regret
              </span>
            </motion.div>
          )}
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.42 }}
          className="mt-6"
        >
          <WhatThatBuys amount={top.monthlyProjection} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55 }}
          className="mt-3"
        >
          <Link
            href={`/leak/${encodeURIComponent(top.id)}`}
            className="block press"
          >
            <Card tone="icy" className="flex items-center justify-between">
              <div>
                <p className="text-micro text-baltic dark:text-icy">
                  SEE A CHEAPER SWAP
                </p>
                <p className="mt-1 text-headline text-ink dark:text-snow">
                  About ${top.savingsPotential}/mo back in your pocket
                </p>
              </div>
              <ChevronRight className="text-baltic dark:text-icy" size={24} />
            </Card>
          </Link>
        </motion.div>

        {secondary.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.7 }}
            className="mt-10"
          >
            <h2 className="text-micro text-ink-40 dark:text-snow-60">
              ALSO ADDING UP
            </h2>
            <div className="mt-3 space-y-3">
              {secondary.map((leak) => (
                <Link
                  key={leak.id}
                  href={`/leak/${encodeURIComponent(leak.id)}`}
                  className="press block"
                >
                  <Card className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={leak.category} />
                      <div>
                        <p className="text-headline text-ink dark:text-snow">
                          {leak.merchant}
                        </p>
                        <p className="text-caption text-ink-60 dark:text-snow-60">
                          {leak.occurrences} charges · avg ${leak.avgTicket.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-headline nums text-ink dark:text-snow">
                        ${leak.monthlyProjection.toFixed(0)}
                        <span className="text-caption text-ink-40 dark:text-snow-60">
                          /mo
                        </span>
                      </p>
                      <p className="text-caption text-baltic dark:text-icy">
                        save ${leak.savingsPotential}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.85 }}
          className="mt-10"
        >
          <Card tone="ink">
            <p className="text-micro text-icy">IF YOU TAKE EVERY SWAP</p>
            <p className="mt-2 text-title1 nums text-snow">
              <CountUp to={scan.monthlySavings} delay={0.9} duration={1} />
              <span className="text-body text-snow-60">/mo</span>
            </p>
            <p className="mt-1 text-callout text-snow-60">
              <span className="text-snow font-semibold nums">
                ${(scan.monthlySavings * 12).toLocaleString()}
              </span>{" "}
              a year. Three of those and you&apos;ve funded a flight home.
            </p>
          </Card>
        </motion.section>
      </div>
    </Shell>
  );
}

function Header({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-micro text-ink-40 dark:text-snow-60">
        HEY, {name.toUpperCase()}
      </p>
      <Link
        href="/profile"
        className="press flex h-9 w-9 items-center justify-center rounded-full bg-icy text-baltic font-bold dark:bg-baltic/20 dark:text-icy"
      >
        {name.slice(0, 1).toUpperCase()}
      </Link>
    </div>
  );
}

function EmptyState({ note }: { note?: string }) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-8 text-center safe-top">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-icy-softer dark:bg-baltic/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" className="text-baltic dark:text-icy" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="text-title1 text-ink dark:text-snow">You&apos;re steady.</h1>
      <p className="mt-3 text-body text-ink-60 dark:text-snow-60">
        Nothing big enough to swap right now. We&apos;ll keep watching — patterns
        shift after payday.
      </p>
      {note && (
        <p className="mt-4 text-caption text-ink-40 dark:text-snow-60">{note}</p>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-5 pt-12 safe-top">
      <div className="h-3 w-24 rounded-full bg-ink-5 animate-pulse-slow dark:bg-white/5" />
      <div className="mt-6 h-4 w-44 rounded-full bg-ink-5 animate-pulse-slow dark:bg-white/5" />
      <div className="mt-4 h-16 w-64 rounded-xl bg-ink-5 animate-pulse-slow dark:bg-white/5" />
      <div className="mt-4 h-24 w-full rounded-xl bg-ink-5 animate-pulse-slow dark:bg-white/5" />
      <div className="mt-6 h-40 w-full rounded-xl bg-ink-5 animate-pulse-slow dark:bg-white/5" />
    </div>
  );
}
