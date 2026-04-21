"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, ArrowRight } from "lucide-react";
import { Shell } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import { useSession } from "@/components/session-provider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { WeekPips } from "@/components/week-pips";
import { useScan, suggestAlternatives } from "@/lib/use-scan";

export default function SwitchesPage() {
  const { hydrated, archetype, switches, removeSwitch } = useSession();
  const router = useRouter();
  const scan = useScan();

  useEffect(() => {
    if (hydrated && !archetype) router.replace("/");
  }, [hydrated, archetype, router]);

  const projected = switches.reduce((s, x) => s + x.projectedMonthlySavings, 0);

  // 0-switches preview: top-3 achievable savings with deep links.
  const previewSavings = useMemo(() => {
    if (switches.length > 0 || !scan.ready) return null;
    return scan.leaks
      .map((l) => {
        const alts = suggestAlternatives(l);
        const best = alts.find((a) => a.estSavingsVsLeak(l) > 0);
        return best
          ? { leak: l, alt: best, savings: Math.round(best.estSavingsVsLeak(l)) }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .slice(0, 3);
  }, [scan, switches.length]);

  const previewTotal = previewSavings?.reduce((s, x) => s + x.savings, 0) ?? 0;

  return (
    <Shell>
      <div className="px-5 pb-10 pt-12 safe-top">
        <p className="text-micro text-ink-40 dark:text-snow-60">YOUR SWITCHES</p>

        {switches.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <Card tone="ink">
              <p className="text-micro text-icy">STAYING WITH YOU</p>
              <p className="mt-2 text-display nums text-snow leading-none">
                <CountUp to={projected} />
                <span className="ml-1 text-body text-snow-60">/mo</span>
              </p>
              <p className="mt-2 text-callout text-snow-60">
                That&apos;s{" "}
                <span className="nums font-bold text-snow">
                  ${(projected * 12).toLocaleString()}
                </span>{" "}
                a year, if the swaps stick.
              </p>
              <Button
                disabled
                size="md"
                variant="secondary"
                className="mt-4 bg-white/10 text-snow hover:bg-white/15"
                title="Coming soon"
              >
                We do the math, you make the call →
              </Button>
            </Card>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <Card>
              <p className="text-micro text-ink-40 dark:text-snow-60">
                IF YOU TOOK THE TOP 3
              </p>
              <p className="mt-2 text-display nums text-ink dark:text-snow leading-none">
                <CountUp to={previewTotal} />
                <span className="ml-1 text-body text-ink-40 dark:text-snow-60">/mo</span>
              </p>
              <p className="mt-2 text-callout text-ink-60 dark:text-snow-60">
                Sitting there, waiting.
              </p>

              {previewSavings && previewSavings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {previewSavings.map(({ leak, alt, savings }) => (
                    <Link
                      key={leak.id}
                      href={`/leak/${encodeURIComponent(leak.id)}`}
                      className="press flex items-center justify-between rounded-2xl bg-icy-softer px-4 py-3 dark:bg-baltic/15"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="truncate text-callout font-semibold text-ink dark:text-snow">
                          {alt.name}
                        </p>
                        <p className="truncate text-caption text-ink-60 dark:text-snow-60">
                          Replaces {leak.merchant}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="nums text-callout font-bold text-baltic dark:text-icy">
                          +${savings}
                        </span>
                        <ArrowRight size={14} className="text-ink-40 dark:text-snow-60" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/home" className="mt-4 block">
                <Button block>See the first one</Button>
              </Link>
            </Card>
          </motion.section>
        )}

        {switches.length > 0 && (
          <section className="mt-8">
            <h2 className="text-title2 text-ink dark:text-snow">
              {switches.length} active
            </h2>

            <ul className="mt-4 space-y-3">
              {switches.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Card>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="truncate text-headline text-ink dark:text-snow">
                          {s.alternativeName}
                        </p>
                        <p className="text-caption text-ink-60 dark:text-snow-60">
                          Started{" "}
                          {new Date(s.acceptedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <WeekPips startedISO={s.acceptedAt} />
                      </div>
                      <div className="text-right">
                        <p className="nums text-title2 font-bold text-baltic dark:text-icy">
                          +${s.projectedMonthlySavings}
                        </p>
                        <p className="text-[10px] text-ink-40 dark:text-snow-60">
                          /mo
                        </p>
                      </div>
                      <button
                        onClick={() => removeSwitch(s.id)}
                        className="press ml-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-40 hover:text-ink dark:text-snow-60 dark:hover:text-snow"
                        aria-label="This one didn't stick"
                        title="This one didn't stick"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                </motion.li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Shell>
  );
}
