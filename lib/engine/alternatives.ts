import type { Alternative, Category, Leak } from "./types";

// Food delivery alternatives. Each one is specific and opinionated.
// `replaces` = portion of the leak this alternative realistically displaces.
// Savings = leak.monthlyProjection * replaces - monthlyCost.
interface FoodAlt extends Alternative {
  replaces: number;
}

const FOOD_ALTS: FoodAlt[] = [
  {
    id: "factor_8",
    kind: "meal_prep",
    name: "Factor — 8 meals / week",
    blurb: "Chef-made, no cooking. Cheaper per meal than one DoorDash order.",
    monthlyCost: 109,
    pricePerServing: 13.49,
    prepMinutes: 2,
    reviewScore: 4.5,
    tags: ["no-cook", "fast", "swap-in"],
    ctaLabel: "Try Factor for a week",
    replaces: 0.85,
    estSavingsVsLeak: (leak) => Math.max(0, leak.monthlyProjection * 0.85 - 109),
  },
  {
    id: "cookunity_6",
    kind: "meal_prep",
    name: "CookUnity — 6 meals / week",
    blurb: "Restaurant-tier meals from local chefs. Rotates cuisines.",
    monthlyCost: 89,
    pricePerServing: 13.39,
    prepMinutes: 3,
    reviewScore: 4.4,
    tags: ["variety", "chef-made"],
    ctaLabel: "Start CookUnity",
    replaces: 0.7,
    estSavingsVsLeak: (leak) => Math.max(0, leak.monthlyProjection * 0.7 - 89),
  },
  {
    id: "batch_sunday",
    kind: "batch_cooking",
    name: "Sunday batch cook",
    blurb: "90 min Sunday → weekday lunches handled. Rice, protein, sauce.",
    monthlyCost: 60,
    pricePerServing: 3.2,
    prepMinutes: 90,
    reviewScore: 4.6,
    tags: ["weekend habit", "big savings"],
    ctaLabel: "Try it this Sunday",
    replaces: 0.5,
    estSavingsVsLeak: (leak) => Math.max(0, leak.monthlyProjection * 0.5 - 60),
  },
  {
    id: "pasta_night",
    kind: "home_cooking",
    name: "Pasta night, 2x / week",
    blurb: "One pot. 15 min. Feeds you for lunch the next day.",
    monthlyCost: 32,
    pricePerServing: 2.1,
    prepMinutes: 15,
    reviewScore: 4.8,
    tags: ["cheapest", "5 ingredients"],
    ctaLabel: "Lock in pasta Tuesdays",
    replaces: 0.35,
    estSavingsVsLeak: (leak) => Math.max(0, leak.monthlyProjection * 0.35 - 32),
  },
  {
    id: "freshly_8",
    kind: "meal_prep",
    name: "Freshly — 8 meals / week",
    blurb: "Microwave-only, 3-min dinners. Direct swap for weekday delivery.",
    monthlyCost: 99,
    pricePerServing: 12.49,
    prepMinutes: 3,
    reviewScore: 4.3,
    tags: ["microwave", "weeknights"],
    ctaLabel: "Start Freshly",
    replaces: 0.8,
    estSavingsVsLeak: (leak) => Math.max(0, leak.monthlyProjection * 0.8 - 99),
  },
  {
    id: "cook_once_fri",
    kind: "home_cooking",
    name: "Friday 'nice dinner' in",
    blurb: "Replace one weekend delivery with one ambitious recipe. $14 vs $38.",
    monthlyCost: 56,
    pricePerServing: 7,
    prepMinutes: 45,
    reviewScore: 4.7,
    tags: ["weekend", "feels like a treat"],
    ctaLabel: "Plan Friday dinner",
    replaces: 0.2,
    estSavingsVsLeak: (leak) => Math.max(0, leak.monthlyProjection * 0.2 - 56),
  },
  {
    id: "instacart_prep",
    kind: "grocery_delivery",
    name: "Instacart, weekly",
    blurb: "A $90 weekly order covers what you're currently ordering à la carte.",
    monthlyCost: 320,
    pricePerServing: 4.8,
    prepMinutes: 18,
    reviewScore: 4.2,
    tags: ["full replacement", "needs cooking"],
    ctaLabel: "Plan a weekly order",
    replaces: 1.0,
    estSavingsVsLeak: (leak) => Math.max(0, leak.monthlyProjection - 320),
  },
  {
    id: "amazon_fresh",
    kind: "grocery_delivery",
    name: "Amazon Fresh, biweekly",
    blurb: "Pantry restock without the app-hopping.",
    monthlyCost: 280,
    pricePerServing: 4.4,
    prepMinutes: 20,
    reviewScore: 4.1,
    tags: ["pantry", "prime"],
    ctaLabel: "Set a biweekly order",
    replaces: 0.9,
    estSavingsVsLeak: (leak) => Math.max(0, leak.monthlyProjection * 0.9 - 280),
  },
];

export const ALTERNATIVES: Alternative[] = FOOD_ALTS;

export function alternativesForCategory(category: Category): Alternative[] {
  if (category === "food_delivery") return ALTERNATIVES;
  return [];
}

export function rankAlternatives(leak: Leak): Alternative[] {
  const pool = alternativesForCategory(leak.category);
  // Score: savings (weighted 0.55) + review (0.2) + ease (0.15) + feasibility (0.1 — do savings exist?)
  return [...pool]
    .map((alt) => {
      const savings = alt.estSavingsVsLeak(leak);
      const savingsScore = Math.min(1, savings / Math.max(50, leak.monthlyProjection));
      const reviewScore = (alt.reviewScore ?? 4) / 5;
      const easeScore = 1 - Math.min(1, (alt.prepMinutes ?? 10) / 90);
      const feasibility = savings > 0 ? 1 : 0;
      const score =
        savingsScore * 0.55 + reviewScore * 0.2 + easeScore * 0.15 + feasibility * 0.1;
      return { alt, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.alt);
}

export function getAlternative(id: string): Alternative | undefined {
  return ALTERNATIVES.find((a) => a.id === id);
}

export function alternativeReplaces(alt: Alternative): number {
  return (alt as FoodAlt).replaces ?? 1;
}
