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

  // For empty state, show the top-3 achievable savings across all leaks.
  const previewSavings = useMemo(() => {
    if (switches.length > 0 || !scan.ready) return null;
    const top = scan.leaks
      .map((l) => {
        const alts = suggestAlternatives(l);
        const best = alts.find((a) => a.estSavingsVsLeak(l) > 0);
        return best ? { leak: l, alt: best, savings: Math.round(best.estSavingsVsLeak(l)) } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .slice(0, 3);
    return top;
  }, [scan, switches.length]);

  const previewTotal = previewSavings?.reduce((s, x) => s + x.savings, 0) ?? 0;

  return (
    <Shell>
      <div className="px-5 pb-10 pt-12 safe-top">
        <p className="text-xs font-semibold tracking-widest text-ink-400">YOUR SWITCHES</p>

        {switches.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <Card tone="mint">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-mint">
                STAYING IN YOUR POCKET
              </p>
              <p className="mt-2 text-5xl font-semibold nums leading-none">
                <CountUp to={projected} />
                <span className="ml-1 text-xl font-medium text-ink-300">/mo</span>
              </p>
              <p className="mt-2 text-sm text-ink-300">
                That&apos;s{" "}
                <span className="nums font-semibold text-ink-100">
                  ${(projected * 12).toLocaleString()}
                </span>{" "}
                a year — as long as you keep it going.
              </p>
              <Button
                disabled
                size="md"
                variant="secondary"
                className="mt-4"
                title="Coming soon"
              >
                Auto-redirect to savings → soon
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
              <p className="text-[11px] font-semibold tracking-[0.22em] text-ink-400">
                IF YOU ACCEPTED THE TOP 3
              </p>
              <p className="mt-2 text-5xl font-semibold nums leading-none">
                <CountUp to={previewTotal} />
                <span className="ml-1 text-xl font-medium text-ink-300">/mo</span>
              </p>
              <p className="mt-2 text-sm text-ink-300">
                That&apos;s what&apos;s sitting there, waiting.
              </p>

              {previewSavings && previewSavings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {previewSavings.map(({ leak, alt, savings }) => (
                    <Link
                      key={leak.id}
                      href={`/leak/${encodeURIComponent(leak.id)}`}
                      className="press flex items-center justify-between rounded-xl bg-ink-950/60 px-4 py-3"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="truncate text-sm font-semibold">{alt.name}</p>
                        <p className="truncate text-[11px] text-ink-400">
                          Replaces {leak.merchant}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="nums text-sm font-semibold text-mint">+${savings}</span>
                        <ArrowRight size={14} className="text-ink-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/home" className="mt-4 inline-block w-full">
                <Button block>See the leak</Button>
              </Link>
            </Card>
          </motion.section>
        )}

        {switches.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight">
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
                        <p className="truncate font-semibold">{s.alternativeName}</p>
                        <p className="text-xs text-ink-400">
                          Started{" "}
                          {new Date(s.acceptedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <WeekPips startedISO={s.acceptedAt} />
                      </div>
                      <div className="text-right">
                        <p className="nums text-lg font-semibold text-mint">
                          +${s.projectedMonthlySavings}
                        </p>
                        <p className="text-[10px] text-ink-400">/mo</p>
                      </div>
                      <button
                        onClick={() => removeSwitch(s.id)}
                        className="press ml-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:text-rose-warn"
                        aria-label="Drop switch"
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
