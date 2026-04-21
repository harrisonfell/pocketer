import type { Archetype, Transaction, UserProfile } from "../types";

// Deterministic pseudo-random so every load of a given archetype is stable.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DELIVERY_MERCHANTS = [
  { name: "DoorDash", weight: 0.5 },
  { name: "Uber Eats", weight: 0.3 },
  { name: "Grubhub", weight: 0.12 },
  { name: "Postmates", weight: 0.08 },
] as const;

const COFFEE_MERCHANTS = ["Starbucks", "Blue Bottle", "Dunkin", "Local Coffee"];
const GROCERY_MERCHANTS = ["Trader Joe's", "Whole Foods", "Safeway", "Kroger"];
const NOISE_MERCHANTS = [
  { name: "Shell", category: "gas" as const, range: [28, 62] as const },
  { name: "Spotify", category: "subscription" as const, range: [11.99, 11.99] as const },
  { name: "Netflix", category: "subscription" as const, range: [15.49, 15.49] as const },
  { name: "Lyft", category: "rideshare" as const, range: [9, 24] as const },
  { name: "Amazon", category: "retail" as const, range: [12, 78] as const },
  { name: "ConEd", category: "utilities" as const, range: [78, 115] as const },
  { name: "T-Mobile", category: "utilities" as const, range: [65, 65] as const },
];

function pickWeighted<T extends { weight: number }>(rng: () => number, items: readonly T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function daysAgoISO(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

interface ArchetypeSpec {
  profile: UserProfile;
  deliveryOrders: number; // over 90d
  coffeeOrders: number;
  groceryRuns: number;
  avgDeliveryTicket: [number, number];
  seed: number;
}

export const ARCHETYPE_SPECS: Record<Archetype, ArchetypeSpec> = {
  heavy_delivery: {
    profile: {
      archetype: "heavy_delivery",
      displayName: "Jordan",
      hourlyWage: 24,
      monthlyIncome: 4100,
    },
    deliveryOrders: 42, // last 30d will capture ~36
    coffeeOrders: 24,
    groceryRuns: 6,
    avgDeliveryTicket: [14, 38],
    seed: 11,
  },
  mixed_delivery: {
    profile: {
      archetype: "mixed_delivery",
      displayName: "Sam",
      hourlyWage: 28,
      monthlyIncome: 4800,
    },
    deliveryOrders: 18,
    coffeeOrders: 14,
    groceryRuns: 10,
    avgDeliveryTicket: [12, 32],
    seed: 23,
  },
  light_delivery: {
    profile: {
      archetype: "light_delivery",
      displayName: "Riley",
      hourlyWage: 30,
      monthlyIncome: 5100,
    },
    deliveryOrders: 6,
    coffeeOrders: 8,
    groceryRuns: 12,
    avgDeliveryTicket: [11, 28],
    seed: 37,
  },
};

function range(rng: () => number, [min, max]: readonly [number, number]): number {
  return Math.round((min + rng() * (max - min)) * 100) / 100;
}

export function generateTransactions(archetype: Archetype): Transaction[] {
  const spec = ARCHETYPE_SPECS[archetype];
  const rng = mulberry32(spec.seed);
  const txns: Transaction[] = [];
  let idCounter = 0;
  const nextId = () => `tx_${archetype}_${idCounter++}`;

  // Delivery orders distributed across 90 days, biased toward last 30
  for (let i = 0; i < spec.deliveryOrders; i++) {
    // 70% in last 30 days, 30% in days 30-90
    const inRecent = rng() < 0.7;
    const dayOffset = inRecent ? Math.floor(rng() * 30) : 30 + Math.floor(rng() * 60);
    const hour = rng() < 0.6 ? 18 + Math.floor(rng() * 5) : 11 + Math.floor(rng() * 3);
    const minute = Math.floor(rng() * 60);
    const merchant = pickWeighted(rng, DELIVERY_MERCHANTS).name;
    const amount = range(rng, spec.avgDeliveryTicket);
    txns.push({
      id: nextId(),
      merchant,
      amount,
      category: "food_delivery",
      timestamp: daysAgoISO(dayOffset, hour, minute),
    });
  }

  // Coffee
  for (let i = 0; i < spec.coffeeOrders; i++) {
    const dayOffset = Math.floor(rng() * 90);
    const merchant = COFFEE_MERCHANTS[Math.floor(rng() * COFFEE_MERCHANTS.length)];
    txns.push({
      id: nextId(),
      merchant,
      amount: range(rng, [4.25, 7.8]),
      category: "coffee",
      timestamp: daysAgoISO(dayOffset, 8, Math.floor(rng() * 60)),
    });
  }

  // Groceries
  for (let i = 0; i < spec.groceryRuns; i++) {
    const dayOffset = Math.floor(rng() * 90);
    const merchant = GROCERY_MERCHANTS[Math.floor(rng() * GROCERY_MERCHANTS.length)];
    txns.push({
      id: nextId(),
      merchant,
      amount: range(rng, [34, 112]),
      category: "groceries",
      timestamp: daysAgoISO(dayOffset, 17, Math.floor(rng() * 60)),
    });
  }

  // Subscription + noise (fixed schedule for subscriptions)
  for (const n of NOISE_MERCHANTS) {
    if (n.category === "subscription") {
      for (const offset of [3, 33, 63]) {
        txns.push({
          id: nextId(),
          merchant: n.name,
          amount: n.range[0],
          category: n.category,
          timestamp: daysAgoISO(offset, 7, 0),
        });
      }
    } else {
      const count = 2 + Math.floor(rng() * 4);
      for (let i = 0; i < count; i++) {
        const dayOffset = Math.floor(rng() * 90);
        txns.push({
          id: nextId(),
          merchant: n.name,
          amount: range(rng, n.range as unknown as [number, number]),
          category: n.category,
          timestamp: daysAgoISO(dayOffset, 14, Math.floor(rng() * 60)),
        });
      }
    }
  }

  // Sort newest first
  txns.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return txns;
}

export function getProfile(archetype: Archetype): UserProfile {
  return ARCHETYPE_SPECS[archetype].profile;
}
