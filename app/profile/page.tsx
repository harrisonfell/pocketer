"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Shell } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/session-provider";
import { useTheme } from "@/components/theme-provider";
import type { Archetype } from "@/lib/engine/types";
import { ARCHETYPE_SPECS } from "@/lib/engine/fixtures/archetypes";
import { cn } from "@/lib/utils";

const LABELS: Record<Archetype, { title: string; sub: string }> = {
  heavy_delivery: {
    title: "Heavy delivery",
    sub: "35+ orders / month · DoorDash-primary",
  },
  mixed_delivery: {
    title: "Mixed delivery",
    sub: "Cooks sometimes · orders mid-week",
  },
  light_delivery: {
    title: "Light delivery",
    sub: "Mostly cooks · zombie subscriptions",
  },
};

export default function ProfilePage() {
  const { hydrated, archetype, profile, setArchetype, reset } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !archetype) router.replace("/");
  }, [hydrated, archetype, router]);

  if (!archetype || !profile) return null;

  return (
    <Shell>
      <div className="px-5 pb-10 pt-12 safe-top">
        <p className="text-micro text-ink-40 dark:text-snow-60">YOU</p>
        <h1 className="mt-2 text-title1 text-ink dark:text-snow">
          {profile.displayName}
        </h1>
        <p className="mt-1 text-callout text-ink-40 dark:text-snow-60">
          {LABELS[archetype].title}
        </p>

        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label="Take-home / mo"
              value={`$${profile.monthlyIncome.toLocaleString()}`}
            />
            <Stat label="Effective wage" value={`$${profile.hourlyWage}/hr`} />
          </div>
        </Card>

        <section className="mt-8">
          <p className="text-micro text-ink-40 dark:text-snow-60">APPEARANCE</p>
          <Card className="mt-3">
            <div className="grid grid-cols-3 gap-2">
              <ThemeBtn
                active={theme === "light"}
                onClick={() => setTheme("light")}
                icon={<Sun size={16} />}
                label="Light"
              />
              <ThemeBtn
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                icon={<Moon size={16} />}
                label="Dark"
              />
              <ThemeBtn
                active={theme === "system"}
                onClick={() => setTheme("system")}
                icon={<Monitor size={16} />}
                label="Auto"
              />
            </div>
          </Card>
        </section>

        <section className="mt-8">
          <p className="text-micro text-ink-40 dark:text-snow-60">
            DEMO · SWITCH ARCHETYPE
          </p>
          <p className="mt-1 text-caption text-ink-40 dark:text-snow-60">
            Founder tool. Cycle user profiles to preview scenarios.
          </p>
          <div className="mt-4 space-y-3">
            {(Object.keys(ARCHETYPE_SPECS) as Archetype[]).map((a) => (
              <button
                key={a}
                onClick={() => setArchetype(a)}
                className="press block w-full text-left"
              >
                <Card
                  className={cn(
                    "transition-colors",
                    a === archetype
                      ? "border-baltic/40 bg-icy-softer dark:border-icy/40 dark:bg-baltic/15"
                      : ""
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-headline text-ink dark:text-snow">
                        {LABELS[a].title}
                      </p>
                      <p className="text-caption text-ink-60 dark:text-snow-60">
                        {LABELS[a].sub}
                      </p>
                    </div>
                    {a === archetype && (
                      <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-baltic dark:text-icy">
                        ACTIVE
                      </span>
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
          <p className="mt-4 text-center text-caption text-ink-40 dark:text-snow-60">
            Pocketer · prototype v2 · synthetic data only
          </p>
        </section>
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-40 dark:text-snow-60">
        {label}
      </p>
      <p className="mt-1 nums text-title2 text-ink dark:text-snow">{value}</p>
    </div>
  );
}

function ThemeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "press flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-caption font-semibold",
        active
          ? "bg-baltic text-white dark:bg-icy dark:text-ink"
          : "bg-ink-5 text-ink-60 dark:bg-white/5 dark:text-snow-60"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
