"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Repeat, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/switches", label: "Switches", icon: Repeat },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  if (!pathname || pathname === "/" || pathname.startsWith("/onboarding")) return null;

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-20 safe-bottom border-t border-ink-800 bg-ink-950/90 backdrop-blur">
      <div className="grid grid-cols-3">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/home" && pathname.startsWith("/leak"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "press flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium tracking-wide",
                active ? "text-mint" : "text-ink-400"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
