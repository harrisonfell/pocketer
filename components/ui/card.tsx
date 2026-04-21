import { cn } from "@/lib/utils";

type Tone = "default" | "icy" | "ink" | "outline";

export function Card({
  children,
  className,
  tone = "default",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    default:
      "bg-white border-ink-5 shadow-soft dark:bg-[color:var(--surface)] dark:border-white/5",
    icy: "bg-icy-softer border-icy/40 dark:bg-baltic/15 dark:border-icy/20",
    ink: "bg-ink text-snow border-transparent shadow-lift",
    outline:
      "bg-transparent border-ink-10 dark:border-white/10",
  };
  return (
    <div
      className={cn(
        "rounded-3xl border p-5 transition-colors",
        tones[tone],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
