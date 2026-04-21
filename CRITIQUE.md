# CRITIQUE — Pocketer v1 prototype

Written honestly, not to pitch. The point is to catch what's weak before v2.

## 1. Does the first 10 seconds produce an "ohhhh" moment?

**Partially.** The hero shows `$744` counting up with "DoorDash is your #1 spend this month." and "30 orders in 30 days. Plus Uber Eats + 2 more." That lands. But the gap between the top number and the "what this buys" panel is where the punch actually hits — and it's on a separate component below. The viewer has to scroll. On a 390px iPhone, the `$744` and the first two bullets of "what $744 also buys" should both be visible without scrolling. Right now they aren't, because the hero eats too much vertical space.

**Fix in v2:** tighten hero spacing, shrink headline from `text-[64px]` to `text-[56px]`, and pull "what this buys" up by collapsing the gap. Target: both panels above the fold at 390×844.

## 2. Would a 22-year-old who spends $300/mo on DoorDash feel seen or judged?

**Mostly seen.** The copy is specific ("30 orders in 30 days") and the framing is "here's what else that money could do" rather than "you spend too much." The amber "YOUR BIGGEST LEAK" label is a little clinical — it's the one word that tips toward finance-app shame. Consider a warmer framing like "WHERE YOUR MONEY KEEPS GOING" or "THE QUIET DRAIN." Also, "hours of your paycheck" is great but needs to be phrased as observation, not accusation. Right now: "That's 31.0 hours of your paycheck, gone to DoorDash." The "gone to" is fine; the bigger risk is the number of decimals (31.0 not 31). Rounded would feel less clinical.

**Fix in v2:** round "hours of paycheck" to integer, rephrase pill to "QUIET DRAIN" or similar.

## 3. Is this distinguishable from Cleo / Rocket Money / Copilot at a glance?

Three things that make this visibly different at first glance:

1. **Single biggest-leak hero.** Copilot gives you a dashboard. Cleo gives you a chatbot. Rocket Money gives you a subscription audit. Pocketer gives you one number and one switch. That singular focus is the differentiator; nothing else looks like this at launch.
2. **"What $744 also buys" panel.** This is the delight moment with no competitor analog. It reframes spend emotionally, not numerically — 7 concert tickets, not 30% of dining budget. Nothing in fintech does this.
3. **Switches, not budgets.** The second tab is "Switches," not "Budget" or "Accounts." The mental model on display is action, not observation. One glance at the nav makes the positioning clear.

**What's weak here:** landing page doesn't sell this enough. A new user sees "See where your money's actually going" — same promise as Mint circa 2010. The landing page and the app value diverge.

**Fix in v2:** landing line gets sharper — something that telegraphs *replacement* not *tracking*.

## 4. Weakest screen?

**Switches, by a mile.** It's functional but visually flat compared to Home and Leak Detail. The week pips help, but:
- When you have 0 switches, it's a dead page with only an empty state and "Find a leak."
- When you have 1 switch, the mint hero panel is disproportionately large relative to one row below.
- The disabled "Auto-redirect" CTA is honest but uninspiring.

**Fix in v2:**
- Improve the 0-switches state: show "what you could save if you accepted the top 3" preview card.
- Make the hero mirror the visual weight of the switch list.
- Add a "week kept" milestone badge that fills in over time.

## 5. Single change that would most improve 60-second demo-ability?

**A `/demo` route that auto-loads heavy_delivery and skips onboarding.** Right now an investor has to tap "Connect (demo)" and wait through 900ms of scan animation. That's 6 seconds gone before the reveal. A preset route that drops directly on Home with the scan animation already played would get the hero in front of eyes in under 2s.

Runner-up: the hero number should count up from $0 starting 100ms *after* the page lands, not 0ms. Right now the animation happens before the viewer's eye has focused. A deliberate pause makes the reveal hit harder.

---

## What I'm changing in v2

Priorities, in order:

- [x] Tighten Home hero spacing so the number + "what this buys" sit above the fold at 390×844
- [x] Replace "YOUR BIGGEST LEAK" pill with warmer "QUIET DRAIN"
- [x] Round "hours of paycheck" to integer
- [x] Sharpen landing copy to lean on *swap* not *see*
- [x] Rework Switches: better empty state, smaller hero when list is non-empty
- [x] Add `/demo` route that skips onboarding and jumps to Home
- [x] Delay hero count-up by ~150ms so the reveal lands
