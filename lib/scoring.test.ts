import { describe, expect, it } from "vitest";
import { scoreTransaction, summarize, FIT_LABELS } from "./scoring";
import { generateTransactions } from "./engine/fixtures/archetypes";
import type { Transaction } from "./engine/types";

const now = new Date();
const mkTx = (o: Partial<Transaction> & Pick<Transaction, "category" | "merchant">): Transaction => ({
  id: o.id ?? `tx_${Math.random().toString(36).slice(2, 8)}`,
  amount: o.amount ?? 20,
  timestamp: o.timestamp ?? now.toISOString(),
  ...o,
});

describe("scoreTransaction", () => {
  it("gives utilities a 5 (essential)", () => {
    const tx = mkTx({ category: "utilities", merchant: "ConEd" });
    expect(scoreTransaction(tx, [tx]).value).toBe(5);
  });

  it("gives groceries a 5 (essential)", () => {
    const tx = mkTx({ category: "groceries", merchant: "Trader Joe's" });
    expect(scoreTransaction(tx, [tx]).value).toBe(5);
  });

  it("respects user's 'worth_it' rating over algorithmic score", () => {
    const tx = mkTx({ category: "food_delivery", merchant: "DoorDash" });
    const all = Array.from({ length: 20 }, () =>
      mkTx({ category: "food_delivery", merchant: "DoorDash" })
    );
    // Would otherwise be Habit (1); user override bumps to 4.
    expect(scoreTransaction(tx, all, "worth_it").value).toBe(4);
  });

  it("respects user's 'regret' rating", () => {
    const tx = mkTx({ category: "subscription", merchant: "Netflix" });
    expect(scoreTransaction(tx, [tx], "regret").value).toBe(1);
  });

  it("flags zombie subscriptions as swap-worthy", () => {
    const tx = mkTx({ category: "subscription", merchant: "Adobe CC" });
    expect(scoreTransaction(tx, [tx]).value).toBe(2);
  });

  it("flags very frequent delivery as habit (1)", () => {
    const all = Array.from({ length: 14 }, () =>
      mkTx({ category: "food_delivery", merchant: "DoorDash" })
    );
    expect(scoreTransaction(all[0], all).value).toBe(1);
  });

  it("flags moderate delivery as swap-worthy (2)", () => {
    const all = Array.from({ length: 6 }, () =>
      mkTx({ category: "food_delivery", merchant: "DoorDash" })
    );
    expect(scoreTransaction(all[0], all).value).toBe(2);
  });

  it("occasional delivery is fair (3)", () => {
    const all = Array.from({ length: 2 }, () =>
      mkTx({ category: "food_delivery", merchant: "DoorDash" })
    );
    expect(scoreTransaction(all[0], all).value).toBe(3);
  });
});

describe("summarize", () => {
  it("returns a sensible label for heavy archetype", () => {
    const txns = generateTransactions("heavy_delivery");
    const summary = summarize(txns, {});
    expect(summary.count).toBe(txns.length);
    expect(summary.average).toBeGreaterThanOrEqual(1);
    expect(summary.average).toBeLessThanOrEqual(5);
    expect(Object.values(FIT_LABELS)).toContain(summary.label);
  });

  it("distribution sums to total count", () => {
    const txns = generateTransactions("heavy_delivery");
    const summary = summarize(txns, {});
    const sum = Object.values(summary.distribution).reduce((s, n) => s + n, 0);
    expect(sum).toBe(summary.count);
  });
});
