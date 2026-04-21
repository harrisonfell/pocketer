# EVAL — honest v1 self-review, before rebuilding v2

## Scored against the brandbook you just shared

### Color palette — **0/10, every token is wrong**
I used mint (`#7EF0C1`), amber (`#FFB547`), and rose (`#FF7A7A`). The brandbook explicitly rejects orange and implicitly rejects every non-blue accent. The "amber leak" pill on Home, the mint accent throughout, the "hero CTA in mint" pattern — all of it has to come out. Not a gradient tweak. A rebuild of every color token.

### Typography — **2/10**
I used system-ui fallback throughout. The brandbook mandates Plus Jakarta Sans with a specific scale (Display 34, Title1 28, Title2 22, Headline 17, Body 16, Callout 15, Caption 13). My headline sizes were closeish (44 / 56 / 32 / 22) but arbitrary, not on the scale, and all rendering in the wrong font. The feel is generic SaaS rather than deliberate.

### Light vs dark mode — **1/10**
I shipped dark-only. The brandbook describes both modes and maps each token to each. Most finance apps default to light; my dark-only bias was a style choice I didn't earn. Fixing.

### Voice & tone — **5/10**
Good:
- "Not a budget. You won't track a single thing" — honest, direct.
- "One change covers most of it" — momentum-framed.
- "You're in good shape. Nothing big enough to swap right now" — honest empty state.

Bad:
- **"QUIET DRAIN"** is quiet *shame*. It names the behavior as bad before the user decides how they feel about it. Violates the non-judgmental rule.
- **"Plug this leak"** is finance-jargon adjacent. "Leak" implies something wrong with the user.
- **"That's 31 hours of your paycheck, gone to DoorDash"** — "gone to" editorializes. Softer: "At your hourly rate, that's about 31 hours."
- Never used a single brandbook-sanctioned tagline ("We aren't just saving money; we're saving for living" / "Start your fund today").

### Logo & iconography — **4/10**
I improvised a pocket/wallet SVG. The brandbook says "do not recreate the logo procedurally" and mandates the founder-provided chevron/pocket mark. You haven't handed me asset files, so I'll build a careful SVG interpretation of a downward-pointing chevron pocket mark — and clearly mark it as a placeholder for the real asset. Safezone, no effects, correct colors.

### Product hierarchy — **7/10, but missing a dimension**
Home is the strongest screen. Leak Detail works. Switches has a good empty-state. But the product only shows *aggregate* (30-day leaks) — there's no surface for the user to engage with *individual* transactions. That's the hole you're now filling: a Purchases tab with a rating system. This is genuinely differentiating and forces the app to respect the user's own judgment rather than deciding for them.

### Micro-interactions — **7/10**
Count-up works, scan animation is good, card reveals are on a sequenced delay. Press states are right. Missing: proper haptic cues, rating-tap feedback, and the "momentum" shape of a streak (it's there but a tiny pip bar; should feel more alive).

### Code quality — **8/10**
Engine is clean, testable, type-safe. 16 passing tests. Category-agnostic architecture proved out with the subscription wedge. Not concerned about this layer.

## Six specific things I'm fixing in v2

1. **Strip every mint/amber/rose class.** Global sed across the codebase, then visual QA. Replace with Baltic / Icy / Ink.
2. **Install Plus Jakarta Sans via `next/font/google`** (or self-host if needed). Apply the brandbook type scale via Tailwind utility classes.
3. **Full light/dark mode** with the exact token mappings from the brandbook.
4. **Rewrite voice**: "QUIET DRAIN" → "SHOWS UP A LOT." "Plug this leak" → "See a cheaper swap." Work a sanctioned tagline into the landing page. Soften the paycheck-hours framing.
5. **New `/purchases` tab** — list of individual transactions, fast 3-emoji rating (worth it / meh / regret), aggregate insight in header, feed-back loop into Home + Leak Detail ("9 of 12 DoorDash orders rated regret").
6. **New logo**: downward-chevron / pocket mark SVG, light/dark variants, proper safezone, app-icon variant. Placeholder until you hand off the real asset.

## What I'm intentionally NOT doing in v2

- Not adding additional wedge categories (coffee, rideshare). The subscription wedge already proved extensibility; more variety without more product depth is just surface area.
- Not redesigning the leak detection math. v1's reconciled-savings model is defensible.
- Not adding real auth / Plaid / commitment flow. The brief was still prototype-scale.

## v2 is a rewrite of surfaces, not a rewrite of product

The engine stays. The routes stay. What changes: everything you look at and read. Plus one new tab that changes the feel from "app that judges your spending" to "app that asks you what you think."

## What I need from you (eventually, not blocking v2)

1. **Real brand assets** — the founder-provided SVG/PNG of the chevron/pocket mark. I'll use a placeholder for now.
2. **Voice sign-off** — once v2 ships, walk through every screen and tell me which lines still feel off. Voice is harder than color and I'll get some wrong.
3. **Light-mode as default vs dark-mode as default** — I'm defaulting to light because finance apps tend to. Tell me if that's wrong for the target demo.
