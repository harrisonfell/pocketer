export type Category =
  | "food_delivery"
  | "groceries"
  | "coffee"
  | "rideshare"
  | "subscription"
  | "gas"
  | "utilities"
  | "retail"
  | "other";

export interface Transaction {
  id: string;
  merchant: string;
  amount: number; // positive = spend
  category: Category;
  timestamp: string; // ISO date
  note?: string;
}

export interface Leak {
  id: string;
  merchant: string; // "DoorDash" or grouped label
  category: Category;
  occurrences: number;
  totalSpend: number; // last 30d
  avgTicket: number;
  monthlyProjection: number;
  savingsPotential: number; // dollars per month achievable
  savingsPercent: number; // 0..1
  transactions: Transaction[];
  headline: string; // punchy copy
  subhead: string;
}

export type AlternativeKind =
  | "meal_prep"
  | "grocery_delivery"
  | "home_cooking"
  | "batch_cooking"
  | "subscription_swap"
  | "cancel";

export interface Alternative {
  id: string;
  kind: AlternativeKind;
  name: string;
  blurb: string; // 1-sentence reason this fits
  monthlyCost: number;
  pricePerServing?: number;
  prepMinutes?: number;
  reviewScore?: number; // 0..5
  tags: string[];
  ctaLabel: string; // e.g. "Try Factor for a week"
  estSavingsVsLeak: (leak: Leak) => number; // dollars/month
}

export interface Switch {
  id: string;
  leakId: string;
  alternativeId: string;
  alternativeName: string;
  projectedMonthlySavings: number;
  acceptedAt: string; // ISO
  status: "active" | "dropped" | "completed";
}

export type Archetype = "heavy_delivery" | "mixed_delivery" | "light_delivery";

export interface UserProfile {
  archetype: Archetype;
  displayName: string;
  hourlyWage: number; // for "hours of your paycheck" framing
  monthlyIncome: number;
}
