"use client";

import { useMemo } from "react";
import { useSession } from "@/components/session-provider";
import {
  detectLeaks,
  generateTransactions,
  suggestAlternatives,
  totalMonthlyLeakage,
  totalMonthlySavings,
} from "@/lib/engine";
import type { Leak } from "@/lib/engine/types";

export interface ScanResult {
  ready: boolean;
  leaks: Leak[];
  topLeak: Leak | null;
  monthlyLeak: number;
  monthlySavings: number;
}

export function useScan(): ScanResult {
  const { hydrated, archetype } = useSession();
  return useMemo<ScanResult>(() => {
    if (!hydrated || !archetype) {
      return { ready: false, leaks: [], topLeak: null, monthlyLeak: 0, monthlySavings: 0 };
    }
    const txns = generateTransactions(archetype);
    const leaks = detectLeaks(txns);
    return {
      ready: true,
      leaks,
      topLeak: leaks[0] ?? null,
      monthlyLeak: totalMonthlyLeakage(leaks),
      monthlySavings: totalMonthlySavings(leaks),
    };
  }, [hydrated, archetype]);
}

export function useLeak(id: string): { ready: boolean; leak: Leak | null } {
  const { leaks, ready } = useScan();
  const leak = leaks.find((l) => l.id === id) ?? null;
  return { ready, leak };
}

export { suggestAlternatives };
