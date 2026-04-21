"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shell } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/session-provider";
import type { Archetype } from "@/lib/engine/types";
import { ARCHETYPE_SPECS } from "@/lib/engine/fixtures/archetypes";

const LABELS: Record<Archetype, { title: string; sub: string }> = {
  heavy_delivery: { title: "Heavy delivery", sub: "35+ orders / month. DoorDash-primary." },
  mixed_delivery: { title: "Mixed delivery", sub: "Cooks sometimes. Orders mid-week." },
  light_delivery: { title: "Light delivery", sub: "Mostly cooks. Rare delivery nights." },
};

export default function ProfilePage() {
  const { hydrated, archetype, profile, setArchetype, reset } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !archetype) router.replace("/");
  }, [hydrated, archetype, router]);

  if (!archetype || !profile) return null;

  return (
    <Shell>
      <div className="px-5 pb-10 pt-12 safe-top">
        <p className="text-xs font-semibold tracking-widest text-ink-400">PROFILE</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{profile.displayName}</h1>
        <p className="mt-1 text-sm text-ink-400">{LABELS[archetype].title}</p>

        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Take-home / mo" value={`$${profile.monthlyIncome.toLocaleString()}`} />
            <Stat label="Effective wage" value={`$${profile.hourlyWage}/hr`} />
          </div>
        </Card>

        <section className="mt-8">
          <p className="text-xs font-semibold tracking-widest text-ink-400">
            DEMO · SWITCH ARCHETYPE
          </p>
          <p className="mt-1 text-xs text-ink-500">
            For the founder: cycle through user profiles to preview different scenarios.
          </p>
          <div className="mt-4 space-y-3">
            {(Object.keys(ARCHETYPE_SPECS) as Archetype[]).map((a) => (
              <button
                key={a}
                onClick={() => setArchetype(a)}
                className="press block w-full text-left"
              >
                <Card
                  className={
                    a === archetype ? "border-mint/50 bg-mint/5" : ""
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{LABELS[a].title}</p>
                      <p className="text-xs text-ink-400">{LABELS[a].sub}</p>
                    </div>
                    {a === archetype && (
                      <span className="text-xs font-semibold text-mint">ACTIVE</span>
                    )}
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <Button
            variant="ghost"
            block
            onClick={() => {
              reset();
              router.push("/");
            }}
          >
            Reset demo
          </Button>
          <p className="mt-4 text-center text-[11px] text-ink-500">
            Pocketer · prototype v0.1 · synthetic data only
          </p>
        </section>
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-ink-400">{label}</p>
      <p className="mt-1 nums text-xl font-semibold">{value}</p>
    </div>
  );
}
