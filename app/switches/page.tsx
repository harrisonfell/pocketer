"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Shell } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import { useSession } from "@/components/session-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SwitchesPage() {
  const { hydrated, archetype, switches, removeSwitch } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !archetype) router.replace("/");
  }, [hydrated, archetype, router]);

  const projected = switches.reduce((s, x) => s + x.projectedMonthlySavings, 0);

  return (
    <Shell>
      <div className="px-5 pb-10 pt-12 safe-top">
        <p className="text-xs font-semibold tracking-widest text-ink-400">YOUR SWITCHES</p>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4"
        >
          <Card tone="mint">
            <p className="text-xs font-medium tracking-widest text-mint">
              PROJECTED — THIS MONTH
            </p>
            <p className="mt-2 text-5xl font-semibold nums">
              <CountUp to={projected} />
            </p>
            <p className="mt-2 text-sm text-ink-300">
              staying in your pocket. We&apos;ll redirect this to savings automatically when
              that feature ships.
            </p>
            <Button
              disabled
              size="md"
              variant="secondary"
              className="mt-4"
              title="Coming soon"
            >
              Redirect to savings (soon)
            </Button>
          </Card>
        </motion.section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">
            {switches.length === 0 ? "No switches yet." : `${switches.length} active`}
          </h2>
          {switches.length === 0 && (
            <p className="mt-2 text-ink-300">
              Tap a leak on Home and accept a switch. We&apos;ll track the impact here.
            </p>
          )}

          <ul className="mt-4 space-y-3">
            {switches.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <Card className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{s.alternativeName}</p>
                    <p className="text-xs text-ink-400">
                      Started {new Date(s.acceptedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · active
                    </p>
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
                </Card>
              </motion.li>
            ))}
          </ul>
        </section>

        {switches.length === 0 && (
          <div className="mt-8">
            <Link href="/home">
              <Button block>Find a leak to plug</Button>
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}
