"use client";

import { motion } from "framer-motion";

interface BuyIdea {
  label: string;
  unit: string;
  unitCost: number;
}

// Stuff the target demo actually cares about.
const CATALOG: BuyIdea[] = [
  { label: "month of rent", unit: "months of rent", unitCost: 1400 },
  { label: "a flight home", unit: "flights home", unitCost: 240 },
  { label: "concert ticket", unit: "concert tickets", unitCost: 95 },
  { label: "gym memberships", unit: "gym memberships", unitCost: 32 },
  { label: "therapy session", unit: "therapy sessions", unitCost: 150 },
  { label: "new running shoes", unit: "pairs of running shoes", unitCost: 110 },
  { label: "a weekend in Joshua Tree", unit: "weekend trips", unitCost: 350 },
  { label: "books", unit: "books", unitCost: 18 },
  { label: "Spotify for a year", unit: "years of Spotify", unitCost: 132 },
  { label: "a massage", unit: "massages", unitCost: 120 },
];

function pickBest(amount: number): { idea: BuyIdea; count: number }[] {
  const out: { idea: BuyIdea; count: number }[] = [];
  const seen = new Set<string>();
  // Prefer ideas where count >= 1 and count <= 12 (feels believable).
  const sorted = [...CATALOG].sort((a, b) => {
    const ca = Math.max(1, Math.floor(amount / a.unitCost));
    const cb = Math.max(1, Math.floor(amount / b.unitCost));
    const aFit = ca >= 1 && ca <= 12 ? 0 : 1;
    const bFit = cb >= 1 && cb <= 12 ? 0 : 1;
    return aFit - bFit;
  });
  for (const idea of sorted) {
    const count = Math.floor(amount / idea.unitCost);
    if (count < 1) continue;
    if (seen.has(idea.label)) continue;
    seen.add(idea.label);
    out.push({ idea, count });
    if (out.length === 4) break;
  }
  return out;
}

export function WhatThatBuys({ amount }: { amount: number }) {
  const picks = pickBest(amount);
  if (picks.length === 0) return null;
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900 p-5">
      <p className="text-xs font-medium tracking-widest text-ink-400">
        WHAT ${Math.round(amount)} ALSO BUYS
      </p>
      <ul className="mt-4 space-y-2.5">
        {picks.map(({ idea, count }, i) => (
          <motion.li
            key={idea.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i + 0.4, duration: 0.35 }}
            className="flex items-baseline gap-3"
          >
            <span className="nums text-xl font-semibold text-mint">{count}</span>
            <span className="text-sm text-ink-200">{count === 1 ? idea.label : idea.unit}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
