import { Pizza, Coffee, CreditCard, Car, ShoppingBag } from "lucide-react";
import type { Category } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

const MAP: Record<Category, { icon: React.ElementType; tint: string }> = {
  food_delivery: { icon: Pizza, tint: "bg-amber-leak/15 text-amber-leak" },
  coffee: { icon: Coffee, tint: "bg-amber-leak/15 text-amber-leak" },
  subscription: { icon: CreditCard, tint: "bg-rose-warn/15 text-rose-warn" },
  rideshare: { icon: Car, tint: "bg-ink-700 text-ink-100" },
  groceries: { icon: ShoppingBag, tint: "bg-mint/15 text-mint" },
  gas: { icon: Car, tint: "bg-ink-700 text-ink-100" },
  utilities: { icon: CreditCard, tint: "bg-ink-700 text-ink-100" },
  retail: { icon: ShoppingBag, tint: "bg-ink-700 text-ink-100" },
  other: { icon: CreditCard, tint: "bg-ink-700 text-ink-100" },
};

export function CategoryIcon({
  category,
  size = 40,
  className,
}: {
  category: Category;
  size?: number;
  className?: string;
}) {
  const entry = MAP[category] ?? MAP.other;
  const Icon = entry.icon;
  return (
    <div
      style={{ width: size, height: size }}
      className={cn("flex items-center justify-center rounded-xl", entry.tint, className)}
    >
      <Icon size={size * 0.5} strokeWidth={2} />
    </div>
  );
}
