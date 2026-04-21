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

interface SessionState {
  hydrated: boolean;
  archetype: Archetype | null;
  switches: Switch[];
  profile: UserProfile | null;
}

interface SessionCtx extends SessionState {
  setArchetype: (a: Archetype) => void;
  reset: () => void;
  addSwitch: (s: Omit<Switch, "id" | "acceptedAt" | "status">) => Switch;
  removeSwitch: (id: string) => void;
}

const Ctx = createContext<SessionCtx | null>(null);

const STORAGE_KEY = "pocketer.session.v1";

interface Persisted {
  archetype: Archetype | null;
  switches: Switch[];
}

function load(): Persisted {
  if (typeof window === "undefined") return { archetype: null, switches: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { archetype: null, switches: [] };
    const parsed = JSON.parse(raw) as Persisted;
    return {
      archetype: parsed.archetype ?? null,
      switches: Array.isArray(parsed.switches) ? parsed.switches : [],
    };
  } catch {
    return { archetype: null, switches: [] };
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
  });

  useEffect(() => {
    const p = load();
    setState({
      hydrated: true,
      archetype: p.archetype,
      switches: p.switches,
      profile: p.archetype ? getProfile(p.archetype) : null,
    });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    save({ archetype: state.archetype, switches: state.switches });
  }, [state]);

  const setArchetype = useCallback((a: Archetype) => {
    setState((s) => ({ ...s, archetype: a, profile: getProfile(a) }));
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, archetype: null, switches: [], profile: null }));
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
    setState((prev) => ({ ...prev, switches: prev.switches.filter((s) => s.id !== id) }));
  }, []);

  const value = useMemo<SessionCtx>(
    () => ({ ...state, setArchetype, reset, addSwitch, removeSwitch }),
    [state, setArchetype, reset, addSwitch, removeSwitch]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export { ARCHETYPE_SPECS };
