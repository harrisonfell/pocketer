import { BottomNav } from "./bottom-nav";
import { cn } from "@/lib/utils";

export function Shell({
  children,
  className,
  hideNav = false,
}: {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[color:var(--bg)] text-[color:var(--text)]">
      <main className={cn("flex-1 overflow-y-auto pb-4", className)}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
