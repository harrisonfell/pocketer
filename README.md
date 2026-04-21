# Pocketer

**Swap one habit. Pocket the difference.**

A mobile-first web prototype. Scans spending, flags the highest-savings "leak,"
proposes a specific cheaper substitute, and lets the user commit to a switch.
Not a budget. Not a dashboard. One number, one CTA.

See [REVIEW.md](./REVIEW.md) for what's built and where this goes next.
See [CRITIQUE.md](./CRITIQUE.md) for the self-critique that drove v2.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 on a phone (or Chrome DevTools @ 390px).

Shortcuts:

- `/` — full landing + scan animation
- `/demo` — investor demo preset (heavy archetype, skips scan)
- `/profile` — cycle archetypes mid-session

## Test

```bash
npm test
```

## Structure

- `app/` — Next.js App Router routes (5 screens + demo + icon/og image)
- `components/` — shared UI (bottom nav, cards, buttons, count-up, etc.)
- `lib/engine/` — transaction generation, leak detection, alternative ranking
- `lib/engine/fixtures/archetypes.ts` — 3 seeded user archetypes
- `lib/engine/alternatives.ts` — static substitutes catalog

## Stack

Next.js 14 · TypeScript · Tailwind · Framer Motion · Vitest · (no backend)
