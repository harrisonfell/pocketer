import { Pizza, Coffee, CreditCard, Car, ShoppingBag } from "lucide-react";
import type { Category } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

const MAP: Record<Category, { icon: React.ElementType }> = {
  food_delivery: { icon: Pizza },
  coffee: { icon: Coffee },
  subscription: { icon: CreditCard },
  rideshare: { icon: Car },
  groceries: { icon: ShoppingBag },
  gas: { icon: Car },
  utilities: { icon: CreditCard },
  retail: { icon: ShoppingBag },
  other: { icon: CreditCard },
};

export function CategoryIcon({
  category,
  size = 40,
  className,
  tone = "icy",
}: {
  category: Category;
  size?: number;
  className?: string;
  tone?: "icy" | "ink";
}) {
  const entry = MAP[category] ?? MAP.other;
  const Icon = entry.icon;
  const tones = {
    icy: "bg-icy-softer text-baltic dark:bg-baltic/25 dark:text-icy",
    ink: "bg-ink text-snow dark:bg-white/10 dark:text-icy",
  };
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center rounded-2xl",
        tones[tone],
        className
      )}
    >
      <Icon size={size * 0.5} strokeWidth={2} />
    </div>
  );
}
