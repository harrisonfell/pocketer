"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Repeat, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/purchases", label: "Purchases", icon: Receipt },
  { href: "/switches", label: "Switches", icon: Repeat },
  { href: "/profile", label: "You", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  if (!pathname || pathname === "/" || pathname.startsWith("/onboarding")) return null;

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-20 safe-bottom border-t border-ink-10 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[color:var(--bg)]/90"
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/home" && pathname.startsWith("/leak"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "press flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-semibold tracking-wide",
                active
                  ? "text-baltic dark:text-icy"
                  : "text-ink-60 dark:text-snow-60"
              )}
              aria-current={active ? "page" : undefined}
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
