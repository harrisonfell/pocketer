# REVIEW — Pocketer v2

v2 is a rewrite of **surfaces** + one new tab. Engine, routes, and product
logic are unchanged from v1. See [EVAL.md](./EVAL.md) for the honest v1
self-review that drove this rewrite.

## What's in v2

### Brand (rebuilt ground-up)
- **Colors:** Baltic (`#2C689A`), Icy (`#B0DBF8`), Ink (`#102231`) exclusively.
  v1's mint/amber/rose are completely gone — 0 occurrences across the codebase.
  White and `#F5F6F8` warm-gray as the only supporting neutrals.
- **Typography:** Plus Jakarta Sans via `next/font/google`. Full brandbook type
  scale applied as Tailwind utilities: `text-display` (34/40 ExtraBold),
  `text-title1` (28/34 Bold), `text-title2` (22/28 Bold), `text-headline`
  (17/22 SemiBold), `text-body` (16/24 Medium), `text-callout` (15/20 Medium),
  `text-caption` (13/18 Medium), `text-micro` (11/14 SemiBold, all-caps label).
- **Light + dark modes.** CSS-var based tokens switch at `.dark` root.
  Profile → Appearance: Light / Dark / Auto. Default is Light (most finance
  apps lead with it).
- **Logo:** downward-chevron pocket mark component, placeholder until the
  founder-provided SVG arrives in `/assets/brand/`.

### Voice (rewritten)
- `QUIET DRAIN` → `SHOWS UP A LOT`
- `Plug this leak` → `See a cheaper swap`
- `gone to DoorDash` → `At your hourly rate, about N hours of work`
- Landing hero is the sanctioned brandbook line: *"We aren't just saving
  money. We're saving for living."*
- Landing CTA is *"Start your fund today."*
- Switches disabled CTA: *"We do the math, you make the call →"* (honest
  placeholder for the manual-at-MVP money movement)

### Purchases tab (new — 4th tab)
- `/purchases` — every last-30d transaction, grouped Today / Yesterday / This
  week / month.
- **Per-row rating:** ✓ worth it / ~ meh / ✕ regret. One tap to rate, tap
  again to unset. Radiogroup semantics, scale-down press feel, persisted to
  localStorage.
- **Header insight:** % worth-it, total rated, stacked rating-bar
  visualization, highest-regret merchant surfaced when enough ratings exist.
- **Filter chips:** All / Unrated / Food delivery / Subscriptions / Coffee.
- **Seeded ratings** for heavy_delivery archetype — demo feels alive instantly
  instead of empty.

### Ratings feed back into the product
- **Home hero** shows an inline chip: *"You rated 5 of 8 as regret"* under
  the top leak's headline.
- **Leak detail** shows a 3-column ministat row breaking down the leak's
  ratings (worth it / meh / regret).
- The signal is one-way for now (user rates → app reflects). The obvious v3
  is two-way: rating history weighting which leaks the detector surfaces first.

## Screen-by-screen

| Route | What it does |
|---|---|
| `/` | Landing. Sanctioned tagline, "Start your fund today" CTA. |
| `/demo` | Investor shortcut — auto-loads heavy_delivery, skips scan. |
| `/home` | Biggest-leak hero with count-up, rating chip, "what that buys," CTA, smaller leaks, "if you take every swap" ink-toned total. |
| `/leak/[id]` | Leak card with rating breakdown, top-pick swap card, skip-to-next flow, other angles. |
| `/purchases` | **NEW.** Header insight + filters + rating rows. |
| `/switches` | Projected savings tile (ink card when populated, outline card with top-3 preview when empty). Week-pip streaks. |
| `/profile` | Theme picker (light/dark/auto), demo archetype cycler, reset. |

## Mocked vs real (unchanged from v1)

| Surface | Today | Needs |
|---|---|---|
| Transactions | 3 seeded synthetic archetypes | Plaid |
| Ratings | localStorage per-browser | Server-side store + sync |
| Auth | none | Required for ratings-as-signal |
| Money movement | Disabled "we do the math, you make the call" | Real redirect infra |
| Brand assets | Placeholder chevron SVG | Founder-provided asset in `/assets/brand/` |

## Three things that are strong in v2

1. **The purchases tab earns its place.** No competitor asks the user what they
   thought of each purchase. It turns Pocketer from "app that judges" into
   "app that asks." Over time, it becomes the data fuel that makes recommendations
   non-generic.
2. **Brand adherence is literal.** No amber, no mint, no orange. Plus Jakarta
   Sans everywhere. Type scale exact. Dark mode mapped to brandbook spec, not
   improvised.
3. **Voice holds under scrutiny.** You can read every string aloud and none of
   them moralize. "Shows up a lot" is an observation; "drain" was a verdict.

## Three things that need the founder's judgment

1. **Rating seed data for heavy_delivery.** I picked 8 ratings to front-load
   so the demo looks populated — biased toward "regret" on DoorDash to make
   the feedback loop visible. If that feels dishonest/scripted, cut the seed
   and live with an empty-state until a real user rates.
2. **Cancel-switch language for subscriptions.** The subscription swap flow
   tells the user "Cancel Adobe CC" but doesn't link them to Adobe's actual
   cancellation page. That gap is intentional (no scraping) but will feel
   lame once real. Need a partnership or a "here's how to cancel" copy.
3. **Rating scale granularity.** Three options (worth / meh / regret) is
   fast but coarse. A 5-star or slider might produce richer data. I went
   with three because tapping 3 buttons is faster than dragging a slider,
   and the feedback loop is about momentum not precision.

## Open questions

- **Does "regret" read harsh?** Brandbook says non-judgmental; "regret" is
  user-assigned, not app-assigned, so I think it passes. But it's a strong
  word. Would *"skip it next time"* / *"wouldn't repeat"* land gentler?
- **Should rating be required before the product shows leaks?** It would
  deepen engagement but slow time-to-value on first open. I kept leaks
  showing even with no ratings — rating just sharpens what you see.
- **Theme: should the Pocketer default be Light or Dark?** I defaulted to
  Light because finance apps skew that way. Target demo might lean dark.

## Next 3 overnight tasks

1. **Ratings → detector feedback loop.** If a user rates 80% of coffee
   purchases as "worth it," the detector should stop suggesting coffee as
   a leak for them. Mechanical change: inside `detectLeaks`, weight the
   `savingsPotential` by `(1 - worthItPct)` or similar. One file, quick win.
2. **Real brand asset integration.** When you hand off the SVG/PNG for the
   logo mark, replace `components/logo.tsx`'s procedural chevron with the
   real asset. Keep the same API.
3. **Coffee + rideshare alternatives.** The detector finds them already;
   no substitutes exist yet. Coffee: "make it at home" / "downgrade size."
   Rideshare: "bus route takes 6 more min" / "walk, 15 min." Each is a
   small content addition that turns a category from informational into
   actionable. Same pattern as the subscription wedge.

## Push notes

Everything pushed to `claude/pocketer-prototype-v1-5pfTH` via the one-time PAT
you provided. **That token still works — you should revoke it now** at
https://github.com/settings/tokens (or the fine-grained equivalent). Future
pushes will need either a fresh token, SSH key, or you running `git push`
from your own machine after cloning.

## v1 → v2 commit log

```
feat(v2): brand rewrite + purchases tab with per-tx ratings
feat(phase6): subscriptions as second wedge category
feat: v3 polish and handoff
feat: v2 iteration from self-critique
feat: v1 copy pass and micro-interactions
feat: core UX shell with 5 screens
feat: recommendation engine core with synthetic data
```
