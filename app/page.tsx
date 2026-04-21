"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
    // Pick an archetype — weighted toward heavy so demos hit hard.
    const pick =
      Math.random() < 0.75
        ? "heavy_delivery"
        : ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    setTimeout(() => {
      setArchetype(pick);
      router.push("/home");
    }, 700);
  }

  return (
    <div className="relative flex min-h-dvh flex-col px-6 pt-20 pb-10 safe-top">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        <div className="mb-8 flex items-center gap-2">
          <LogoMark />
          <span className="text-sm font-semibold tracking-widest text-ink-300">POCKETER</span>
        </div>

        <h1 className="text-[44px] font-semibold leading-[1.02] tracking-tight">
          Swap one habit.
          <br />
          <span className="text-mint">Pocket the difference.</span>
        </h1>

        <p className="mt-5 text-lg leading-snug text-ink-300">
          Pocketer scans where your money quietly leaks — DoorDash, that forgotten subscription,
          the latte habit — and shows you one cheaper swap. Savings go straight into your pocket.
        </p>

        <ul className="mt-10 space-y-4 text-ink-300">
          <Bullet>Not a budget. You won&apos;t track a single thing.</Bullet>
          <Bullet>Not a lecture. We don&apos;t tell you to &quot;stop spending.&quot;</Bullet>
          <Bullet>Just the switch that pays for itself.</Bullet>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="flex flex-col gap-3"
      >
        <Button block size="lg" onClick={connect} disabled={connecting}>
          {connecting ? "Scanning 90 days…" : "Connect (demo)"}
        </Button>
        <p className="text-center text-xs text-ink-500">
          No real bank connection. This is a prototype — synthetic data only.
        </p>
      </motion.div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-mint" />
      <span className="leading-snug">{children}</span>
    </li>
  );
}

function LogoMark() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-ink-950">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h18v4a5 5 0 0 1-5 5h-2l-2 3-2-3H8a5 5 0 0 1-5-5V7z" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </div>
  );
}
