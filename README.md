# 蒼影のフィルム — Film of the Sea

Steam PC game official site. Visual direction: Mœbius / Chants of Sennaar (《巴别塔圣歌》).

## Quick Start

```bash
cp .env.local.example .env.local    # set your Steam app id
npm install
npm run dev                         # http://localhost:3000
```

The gateway page renders six dim runes in a ruined seascape. Click **观 / 根 / 门** (the three correct ones) to trigger the awakening sequence and transition into the homepage.

If you've completed the ritual once, a quiet "直接进入主页 →" link appears in the top-right corner.

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| 3D | React Three Fiber + Drei + Postprocessing |
| Animation | GSAP |
| Styling | Tailwind CSS |
| State | Zustand (with localStorage persistence) |
| Fonts | Cormorant Garamond + Noto Serif JP + Inter Variable |

## Files of interest

- [app/page.tsx](./app/page.tsx) — gateway entry
- [components/gateway/](./components/gateway/) — opening scene
- [lib/runes.ts](./lib/runes.ts) — rune definitions (swap art here)
- [stores/runePuzzle.ts](./stores/runePuzzle.ts) — puzzle state machine
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) — full task breakdown

## Design palette · 蒼影のフィルム

```
#0f1217  Deep Ink     bg
#27606c  Ocean Blue   structure
#7baaab  Fog Aqua     text/runes (dim)
#c68d5d  Bronze       accent
#e6bd8b  Sand         rune light · CTA
```
