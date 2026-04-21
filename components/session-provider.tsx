"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Archetype, Switch, UserProfile } from "@/lib/engine/types";
import { ARCHETYPE_SPECS, getProfile } from "@/lib/engine/fixtures/archetypes";

export type Rating = "worth_it" | "meh" | "regret";

interface SessionState {
  hydrated: boolean;
  archetype: Archetype | null;
  switches: Switch[];
  profile: UserProfile | null;
  ratings: Record<string, Rating>; // keyed by transaction id
}

interface SessionCtx extends SessionState {
  setArchetype: (a: Archetype) => void;
  reset: () => void;
  addSwitch: (s: Omit<Switch, "id" | "acceptedAt" | "status">) => Switch;
  removeSwitch: (id: string) => void;
  rate: (txId: string, r: Rating | null) => void;
  getRating: (txId: string) => Rating | undefined;
}

const Ctx = createContext<SessionCtx | null>(null);

const STORAGE_KEY = "pocketer.session.v2";

interface Persisted {
  archetype: Archetype | null;
  switches: Switch[];
  ratings: Record<string, Rating>;
}

function seedRatingsForArchetype(a: Archetype): Record<string, Rating> {
  // Give new demos a head-start: pre-rate a few transactions so the Purchases
  // tab + home insights look alive on first visit. Keyed by fixture ids.
  // NOTE: transaction ids are deterministic from the archetype seed.
  if (a === "heavy_delivery") {
    // Heavy user has built up some regret about the delivery habit.
    return {
      "tx_heavy_delivery_0": "regret",
      "tx_heavy_delivery_1": "worth_it",
      "tx_heavy_delivery_2": "regret",
      "tx_heavy_delivery_3": "meh",
      "tx_heavy_delivery_5": "regret",
      "tx_heavy_delivery_8": "regret",
      "tx_heavy_delivery_12": "worth_it",
      "tx_heavy_delivery_15": "meh",
    };
  }
  if (a === "mixed_delivery") {
    return {
      "tx_mixed_delivery_0": "worth_it",
      "tx_mixed_delivery_2": "meh",
      "tx_mixed_delivery_4": "regret",
    };
  }
  return {};
}

function load(): Persisted {
  if (typeof window === "undefined") {
    return { archetype: null, switches: [], ratings: {} };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { archetype: null, switches: [], ratings: {} };
    const parsed = JSON.parse(raw) as Persisted;
    return {
      archetype: parsed.archetype ?? null,
      switches: Array.isArray(parsed.switches) ? parsed.switches : [],
      ratings: parsed.ratings ?? {},
    };
  } catch {
    return { archetype: null, switches: [], ratings: {} };
  }
}

function save(state: Persisted) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    hydrated: false,
    archetype: null,
    switches: [],
    profile: null,
    ratings: {},
  });

  useEffect(() => {
    const p = load();
    setState({
      hydrated: true,
      archetype: p.archetype,
      switches: p.switches,
      profile: p.archetype ? getProfile(p.archetype) : null,
      ratings: p.ratings,
    });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    save({
      archetype: state.archetype,
      switches: state.switches,
      ratings: state.ratings,
    });
  }, [state]);

  const setArchetype = useCallback((a: Archetype) => {
    setState((s) => ({
      ...s,
      archetype: a,
      profile: getProfile(a),
      // Seed ratings on archetype change for a richer demo, but don't blow
      // away ratings the user has already made.
      ratings: { ...seedRatingsForArchetype(a), ...s.ratings },
    }));
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      archetype: null,
      switches: [],
      profile: null,
      ratings: {},
    }));
  }, []);

  const addSwitch = useCallback(
    (s: Omit<Switch, "id" | "acceptedAt" | "status">) => {
      const sw: Switch = {
        ...s,
        id: `sw_${Math.random().toString(36).slice(2, 9)}`,
        acceptedAt: new Date().toISOString(),
        status: "active",
      };
      setState((prev) => ({ ...prev, switches: [sw, ...prev.switches] }));
      return sw;
    },
    []
  );

  const removeSwitch = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      switches: prev.switches.filter((s) => s.id !== id),
    }));
  }, []);

  const rate = useCallback((txId: string, r: Rating | null) => {
    setState((prev) => {
      const next = { ...prev.ratings };
      if (r === null) {
        delete next[txId];
      } else {
        next[txId] = r;
      }
      return { ...prev, ratings: next };
    });
  }, []);

  const getRating = useCallback(
    (txId: string) => state.ratings[txId],
    [state.ratings]
  );

  const value = useMemo<SessionCtx>(
    () => ({
      ...state,
      setArchetype,
      reset,
      addSwitch,
      removeSwitch,
      rate,
      getRating,
    }),
    [state, setArchetype, reset, addSwitch, removeSwitch, rate, getRating]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export { ARCHETYPE_SPECS };
