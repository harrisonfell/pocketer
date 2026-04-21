"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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

const SCAN_FLAG = "pocketer.scanned.v1";

export default function HomePage() {
  const { hydrated, archetype, profile } = useSession();
  const router = useRouter();
  const scan = useScan();
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    if (hydrated && !archetype) router.replace("/");
    // Only show the full scan animation the first time after connect.
    if (hydrated && typeof window !== "undefined") {
      if (window.sessionStorage.getItem(SCAN_FLAG) === "done") {
        setScanComplete(true);
      }
    }
  }, [hydrated, archetype, router]);

  function finishScan() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SCAN_FLAG, "done");
    }
    setScanComplete(true);
  }

  if (!scan.ready) return <Shell><LoadingSkeleton /></Shell>;
  if (!scanComplete) return <Shell><ScanLoading onDone={finishScan} /></Shell>;

  const top = scan.topLeak;
  const secondary = scan.leaks.slice(1, 4);
  const wage = profile?.hourlyWage ?? 24;

  if (!top) {
    return (
      <Shell>
        <EmptyState />
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
          <p className="text-[11px] font-semibold tracking-[0.22em] text-amber-leak">
            QUIET DRAIN · LAST 30 DAYS
          </p>
          <h1 className="mt-2 text-[56px] font-semibold leading-[0.95] tracking-tight nums">
            <CountUp to={top.monthlyProjection} delay={0.3} duration={1.2} />
          </h1>
          <p className="mt-2 text-[17px] leading-snug text-ink-200">
            {top.headline}{" "}
            <span className="text-ink-400">
              {top.subhead} That&apos;s{" "}
              <span className="text-ink-100 font-semibold nums">{hours}</span> hours of your
              paycheck.
            </span>
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.42 }}
          className="mt-5"
        >
          <WhatThatBuys amount={top.monthlyProjection} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55 }}
          className="mt-4"
        >
          <Link href={`/leak/${encodeURIComponent(top.id)}`} className="block press">
            <Card tone="warm" className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-amber-leak/90">
                  PLUG THIS LEAK
                </p>
                <p className="mt-1 text-base font-semibold">
                  Save ~${top.savingsPotential}/mo — one switch covers most of it
                </p>
              </div>
              <ChevronRight className="text-amber-leak" size={22} />
            </Card>
          </Link>
        </motion.div>

        {secondary.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5 }}
            className="mt-10"
          >
            <h2 className="text-xs font-semibold tracking-widest text-ink-400">
              SMALLER LEAKS
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
                        <p className="font-semibold">{leak.merchant}</p>
                        <p className="text-xs text-ink-400">
                          {leak.occurrences} charges · avg ${leak.avgTicket.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold nums">
                        ${leak.monthlyProjection.toFixed(0)}
                        <span className="text-xs font-normal text-ink-400">/mo</span>
                      </p>
                      <p className="text-[11px] text-mint">save ${leak.savingsPotential}</p>
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
          transition={{ duration: 0.55, delay: 0.65 }}
          className="mt-10"
        >
          <Card tone="mint">
            <p className="text-xs font-medium tracking-wide text-mint">
              IF YOU PLUG ALL OF THEM
            </p>
            <p className="mt-2 text-3xl font-semibold nums">
              <CountUp to={scan.monthlySavings} />/mo
            </p>
            <p className="mt-1 text-sm text-ink-300">
              <span className="text-ink-100 font-semibold nums">
                ${(scan.monthlySavings * 12).toLocaleString()}
              </span>{" "}
              in a year, without touching your lifestyle much.
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
      <p className="text-xs font-medium tracking-widest text-ink-400">
        HEY, {name.toUpperCase()}
      </p>
      <Link
        href="/profile"
        className="press flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 text-sm font-semibold text-ink-200"
      >
        {name.slice(0, 1).toUpperCase()}
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-8 text-center">
      <div className="mb-6 h-20 w-20 rounded-full bg-mint/10 flex items-center justify-center">
        <span className="text-4xl">✓</span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">You&apos;re in good shape.</h1>
      <p className="mt-3 text-ink-300 leading-snug">
        No major leaks detected in the last 30 days. We&apos;ll keep watching —
        most people&apos;s patterns shift after payday.
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-5 pt-12 safe-top">
      <div className="h-3 w-24 rounded-full bg-ink-800 animate-pulse-slow" />
      <div className="mt-6 h-4 w-44 rounded-full bg-ink-800 animate-pulse-slow" />
      <div className="mt-4 h-16 w-64 rounded-xl bg-ink-800 animate-pulse-slow" />
      <div className="mt-4 h-24 w-full rounded-xl bg-ink-800 animate-pulse-slow" />
      <div className="mt-6 h-40 w-full rounded-xl bg-ink-800 animate-pulse-slow" />
    </div>
  );
}
