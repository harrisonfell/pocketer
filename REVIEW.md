# REVIEW — Pocketer prototype v1 (overnight build)

Hand-off doc. Read this before opening the preview.

## What's in the build

### Routes
- `/` — Landing. "Swap one habit. Pocket the difference." One CTA: *Connect (demo)*.
- `/demo` — Auto-loads `heavy_delivery` archetype and skips scan animation. Built for 60-sec investor demos.
- `/home` — Main screen. Shows biggest plug-able leak as a hero ($744 counted up), "What $744 also buys" panel (concert tickets, rent, etc.), "Plug this leak" CTA, smaller leaks, and an annualized savings tile.
- `/leak/[id]` — Leak detail. Top-pick switch card with monthly savings, prep time, annual impact, and a %-of-leak cut indicator. Thumbs-down cycles to the next alternative; primary button accepts it. Other alternatives shown as a ranked list below.
- `/switches` — If empty: "If you accepted the top 3, $X/mo" preview with deep links. If non-empty: projected savings, annualized, and list of active switches each with a 4-week pip streak indicator.
- `/profile` — Demo dev tool. Cycle archetypes: heavy, mixed, light. Reset demo.

### Engine (`/lib/engine/`)
- `detectLeaks()` groups transactions by merchant, filters to a category allowlist (no shaming users for groceries or utilities), applies occurrence + savings thresholds, and returns leaks sorted by *achievable* savings.
- `rankAlternatives()` filters to alternatives that actually save money vs. the specific leak, then scores on savings (60%), review (25%), and ease (15%).
- Each alternative declares a `replaces` factor (0.2–1.0) so savings math is honest: *leak × replaces − altCost*, not a hand-wavy 70%.
- 14 vitest tests covering generator determinism, threshold logic, ranking, and archetype-specific behavior.

## Key product decisions I made

**1. Headline savings reconciles with what alternatives can actually deliver.** A category-based estimate would have said "save $484 on $744 DoorDash" (65%). But if no alternative actually achieves that, we'd be lying. I made `detectLeaks()` call `rankAlternatives()` on each leak and cap the headline savings at the best viable alternative. So the number you see on Home is the number the product can really deliver.

**2. Category allowlist for leaks.** Groceries, gas, utilities, and retail are explicitly *not* leakable categories. Reason: this is habit-replacement, not budgeting. Flagging a user's grocery spending would wreck the "friend who noticed" tone. Only delivery, coffee, subscriptions, and rideshare can produce leaks today.

**3. Light archetype triggers the empty state, not a bogus leak.** Light users spend ~$50/mo on delivery. Meal prep starts at $60/mo, so nothing realistically replaces it. Rather than force-feeding a "save $0/mo" suggestion, the Home screen shows "You're in good shape" and notes the observed spend. This is a strong demo moment — the product's honesty signals trust.

**4. Single biggest leak as the hero.** Copilot/Monarch show dashboards. Cleo shows chatbots. I chose one number, one headline, one CTA. That's the whole positioning: the opposite of a dashboard. The nav only has 3 tabs for the same reason.

**5. "What $744 also buys" as the emotional reframing.** Numbers alone don't move people. 7 concert tickets does. This panel uses demographic-appropriate substitutes (rent, flights home, therapy sessions, gym memberships) — not luxury items that would feel tone-deaf.

**6. Week-pip streak on switches.** Zero shame. No badges, no points, no gamification. Just a quiet 4-pip bar so the user sees week 1/4 → 2/4 → etc. Competitor products don't do this because they don't commit to a single switch; they track everything.

## Mocked vs real

| Surface | Today | Needs |
|---|---|---|
| Transaction data | 3 seeded synthetic archetypes | Plaid integration |
| Auth/session | localStorage, no signup | Auth + server session |
| Leak detection | client-side on synthetic txns | Run server-side on real txns |
| Alternatives DB | 8 food-delivery alts hard-coded | DB + CMS for editorial; real affiliate integrations |
| Accept-switch flow | localStorage, no consequences | Commitment reminders, outcome tracking (did the user actually order less?) |
| Redirect to savings | Disabled CTA ("soon") | Account-link + recurring transfer to a savings vehicle |
| Demo archetype swap | `/profile` dev-tool | Remove from production build |

## Three things that are strong

1. **The Home hero lands.** 56px number, count-up delayed 300ms so the reveal hits, paired with "That's 31 hours of your paycheck" and "What $744 also buys" above the fold at 390×844. This is the product in ~3 seconds.
2. **Savings numbers are defensible.** Every savings claim is backed by a specific alternative's cost math and a replaceability factor. If a founder's friend pokes at "$484 saved," the answer is "Factor 8 meals at $109/mo replaces 85% of the $744 DoorDash, leaving you with $484." That conversation is survivable.
3. **The voice holds.** I did a copy pass on every visible string. No placeholder text. Opinionated, specific, occasionally dry. "QUIET DRAIN" on the leak pill; "One change covers most of it" as the switch header; "Try Factor for a week" not "Learn more."

## Three things that need the founder's judgment

1. **The `replaces` factors are my guesses.** I assigned 0.85 to Factor, 0.5 to Sunday batch cook, 0.35 to pasta night — based on what feels realistic for a DoorDash-reliant user. These should be user-tested or backed by actual consumption data. They drive every dollar figure in the app.
2. **Is the alternative catalog too short / too US-coastal?** Factor, CookUnity, Freshly, Instacart, Amazon Fresh, + 3 home-cooking patterns. Good enough for a prototype aimed at the target demo, but a 22-year-old in Kansas City has a different alternative set than one in Brooklyn.
3. **The landing page promise.** "Swap one habit. Pocket the difference." is a commitment to a very specific UX — one-at-a-time habit replacement. If the founder wants this to eventually be a full spending assistant, the promise drifts. Lock in now or hedge?

## Open questions

- **How aggressive should the push be?** The brief said "occasionally pushy but less than Duolingo." I made it gentle. A real product might need a home-screen nudge (e.g. "It's Thursday — are you going to order tonight?"). I didn't build notifications or re-engagement.
- **Do we want a "streak broken" state?** If a user orders DoorDash while on a Factor switch, do we detect and call it out gently? That's the future the framing implies but I didn't wire.
- **Does "month 2" look different from "month 1"?** First month the Home hero is the leak. After the user has 3 switches, should Home be about their progress instead? I kept it leak-first throughout.

## Phase 6 (bonus) — subscriptions wedge

Added in the last hour as a proof-of-extensibility:

- 3 extra "zombie" subs seeded into every archetype (Adobe CC, NY Times, Peloton App) on top of existing Netflix + Spotify.
- Detector now treats subscriptions as leaks with a 1-occurrence floor (they're recurring by definition), while food/coffee still need 3+ observations.
- `subscriptionAlternativesFor(leak)` generates Cancel (100% savings) + Downgrade (60% savings) options parameterized per subscription, so the CTA reads "Cancel Adobe CC" not "Try Cancel Adobe CC for a week."
- Entire shell rendered subscription leaks without a single page-level change. That's the architecture claim, validated.

**Demo impact:** the light archetype, which previously had no story ($50 delivery → no viable swap), now surfaces $81/mo in forgotten subscriptions with Cancel actions. Much stronger demo when flipping between archetypes.

## Suggested next 3 overnight tasks

1. **Build the /admin aggregate dashboard.** Run 1000 synthetic users through the engine and show distribution of leaks, average savings, acceptance rates by alternative. This becomes the investor slide. Bonus: add sliders to tweak `replaces` factors and see aggregate savings shift in real time.
2. **Refine the accept flow into a real commitment.** Right now "Try Factor for a week" instantly creates a switch. There should be a mid-step — "What would make this stick?" — and a calendar ping. The 4-pip streak is wired but the commitment layer isn't. This is the part that actually separates the product from a spreadsheet.
3. **Add coffee + rideshare as a third and fourth wedge.** The engine detects both already but there are no alternatives yet. Coffee: "make it at home" / "use your office's free one" / "downgrade size." Rideshare: "bus route X takes 6 more minutes" / "walk (15 min)." Once those land, the product has four legitimate wedges for a full launch.

## Decisions I made that deserve a second look

- **Framer Motion CountUp uses real JS animation on every render.** If the user taps back/forward, it re-counts. I wanted the drama; you might prefer `sessionStorage` to only count once per session so returning users don't watch the same reveal.
- **Landing picks archetype weighted 75% heavy.** Biases demos to the best numbers. If that feels dishonest for a real "connect your bank" pitch, flip to uniform random.
- **Hours-of-paycheck uses a hardcoded $24/hr for heavy archetype.** I stored it on the archetype itself. If a founder demos to people earning $60/hr, the "hours" framing might feel off. Consider: let the user enter a rough income during onboarding, or drop the framing entirely for higher earners.
- **I didn't build haptic feedback** beyond CSS `scale(0.98)` on press. iOS Safari's haptic support is limited; I opted not to bolt on a JS shim. Real haptics would be meaningful on the thumbs-up.

## Where the prototype could fall over in a live demo

- If the founder resets the demo mid-flow (Profile → Reset), the scan-animation flag persists in `sessionStorage`, so the next archetype connect skips the scan. Considered fixing; kept it because re-watching the scan mid-demo is awkward.
- The `/demo` route deliberately skips scan animation. If the founder wants to show the scan, use `/` → Connect instead.
- `detectLeaks()` runs synchronously on render via `useScan()`. Fine at 95 transactions. If you ever swap in real data at 10k+ txns, move it to a worker.

## Notes on the push

**The overnight environment could not push to the remote.** Both `git push` (HTTP
proxy) and the GitHub MCP API returned `403 Resource not accessible by
integration` for `harrisonfell/pocketer`. The repo on GitHub is empty.

Everything is committed locally on branch `claude/pocketer-prototype-v1-5pfTH`.
To get a deploy:

```bash
# From the machine that owns the repo's push credentials:
git clone http://127.0.0.1:37655/git/harrisonfell/pocketer   # or via SSH
cd pocketer
git fetch origin claude/pocketer-prototype-v1-5pfTH
git checkout claude/pocketer-prototype-v1-5pfTH
# or just transfer the local state — everything since commit 1e7a9e0 is the build
```

Every phase commit is on the local branch:

1. `feat: recommendation engine core with synthetic data`
2. `feat: core UX shell with 5 screens`
3. `feat: v1 copy pass and micro-interactions`
4. `feat: v2 iteration from self-critique`
5. `feat: v3 polish and handoff`

Once pushed, Vercel preview should build out-of-the-box (Next.js auto-detected,
no env vars required).
