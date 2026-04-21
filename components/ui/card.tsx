import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  tone = "default",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "default" | "warm" | "mint" }) {
  const tones: Record<string, string> = {
    default: "bg-ink-900 border-ink-800",
    warm: "bg-gradient-to-b from-amber-leak/10 to-ink-900 border-amber-leak/30",
    mint: "bg-gradient-to-b from-mint/10 to-ink-900 border-mint/30",
  };
  return (
    <div
      className={cn("rounded-2xl border p-5", tones[tone], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
