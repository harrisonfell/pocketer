"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";

// /demo: jump to Home with heavy_delivery, scan animation pre-played.
export default function DemoEntry() {
  const { hydrated, setArchetype } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    setArchetype("heavy_delivery");
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("pocketer.scanned.v2", "done");
    }
    router.replace("/home");
  }, [hydrated, setArchetype, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center text-ink-60 dark:text-snow-60">
      <p className="text-body">Loading demo…</p>
    </div>
  );
}
