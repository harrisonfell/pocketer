"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";

// /demo: direct-drop onto Home with heavy_delivery archetype preloaded and
// scan animation pre-played. Intended for investor demos.
export default function DemoEntry() {
  const { hydrated, setArchetype } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    setArchetype("heavy_delivery");
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("pocketer.scanned.v1", "done");
    }
    router.replace("/home");
  }, [hydrated, setArchetype, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center text-ink-400">
      <p className="text-sm">Loading demo…</p>
    </div>
  );
}
