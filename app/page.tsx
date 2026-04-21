"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogoLockup } from "@/components/logo";
import { useSession } from "@/components/session-provider";
import type { Archetype } from "@/lib/engine/types";
import { useEffect, useState } from "react";

const ARCHETYPES: Archetype[] = ["heavy_delivery", "mixed_delivery", "light_delivery"];

export default function Landing() {
  const router = useRouter();
  const { hydrated, archetype, setArchetype } = useSession();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (hydrated && archetype) router.replace("/home");
  }, [hydrated, archetype, router]);

  function connect() {
    setConnecting(true);
    // Weighted toward heavy so demos land well. 70/20/10.
    const r = Math.random();
    const pick: Archetype =
      r < 0.7 ? "heavy_delivery" : r < 0.9 ? "mixed_delivery" : "light_delivery";
    setTimeout(() => {
      setArchetype(pick);
      router.push("/home");
    }, 700);
  }

  return (
    <div className="relative flex min-h-dvh flex-col px-6 pt-14 pb-10 safe-top">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <LogoLockup />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16 flex-1"
      >
        <h1 className="text-display text-ink dark:text-snow">
          We aren&apos;t just
          <br />
          saving money.
          <br />
          <span className="text-baltic dark:text-icy">We&apos;re saving for living.</span>
        </h1>

        <p className="mt-5 text-body text-ink-60 dark:text-snow-60">
          Pocketer sees where your money goes, surfaces one cheaper swap, and
          helps you choose whether to take it. No budgets. No guilt. Just the math,
          and your call.
        </p>

        <ul className="mt-10 space-y-3.5 text-body text-ink-60 dark:text-snow-60">
          <Bullet>You rate what&apos;s worth it. We learn your taste.</Bullet>
          <Bullet>One swap at a time, one habit at a time.</Bullet>
          <Bullet>Private by default. Your spending stays yours.</Bullet>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-3"
      >
        <Button block size="lg" onClick={connect} disabled={connecting}>
          {connecting ? "Reading 90 days…" : "Start your fund today"}
        </Button>
        <p className="text-center text-caption text-ink-40 dark:text-snow-60">
          Demo · synthetic data, no real bank connection.
        </p>
      </motion.div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-baltic dark:bg-icy" />
      <span className="leading-snug">{children}</span>
    </li>
  );
}
