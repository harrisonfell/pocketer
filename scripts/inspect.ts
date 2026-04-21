import {
  generateTransactions,
  detectLeaks,
  suggestAlternatives,
  totalMonthlyLeakage,
  totalMonthlySavings,
} from "../lib/engine";

for (const a of ["heavy_delivery", "mixed_delivery", "light_delivery"] as const) {
  const txns = generateTransactions(a);
  const leaks = detectLeaks(txns);
  console.log("\n=== " + a + " ===");
  console.log(
    "tx:",
    txns.length,
    "leaks:",
    leaks.length,
    "monthly leak:",
    totalMonthlyLeakage(leaks).toFixed(0),
    "savings:",
    totalMonthlySavings(leaks)
  );
  for (const l of leaks.slice(0, 4)) {
    console.log(
      "  -",
      l.merchant,
      "x" + l.occurrences,
      "$" + l.monthlyProjection.toFixed(0),
      "save:$" + l.savingsPotential
    );
  }
  const top = leaks[0];
  if (top) {
    const alts = suggestAlternatives(top).slice(0, 3);
    console.log(
      "  top alts:",
      alts.map((al) => al.name + " (save $" + Math.round(al.estSavingsVsLeak(top)) + ")")
    );
  }
}
