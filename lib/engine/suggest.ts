import { rankAlternatives } from "./alternatives";
import type { Alternative, Leak } from "./types";

/**
 * Given a leak, return alternatives ranked by projected fit.
 * This is the public entry point the UI uses.
 */
export function suggestAlternatives(leak: Leak): Alternative[] {
  return rankAlternatives(leak);
}
