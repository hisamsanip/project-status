# Canopy · PFMSB Transformation Intelligence

A front-end mockup that turns the **PFMSB 2027 Action Plan (12-Month Roadmap)** deck into an AI-style platform.

**Design concept: "Bioluminescent canopy".** The programme is shown as a night forest where evidence glows. It uses deep moss blacks and a single living lime accent, with editorial serif headlines (Instrument Serif), Inter for the interface and JetBrains Mono for data. Nature shows up in the visuals: maturity is drawn as tree growth rings, and a drifting mycelium-like node network marks the AI surfaces.

## Pages (hash-routed, so they work on GitHub Pages)

| Route | What it does |
| --- | --- |
| `#/` | Marketing landing page: hero, phase flow, platform bento, takeaways, decision CTA |
| `#/app` | Command centre: programme pulse, streamed AI brief, KPIs, timeline, maturity radar |
| `#/app/roadmap` | 12-month Gantt, phase detail with activity status, function × phase focus matrix |
| `#/app/functions` | 12 functions in 4 clusters; a drawer to rescore current and target maturity |
| `#/app/gates` | 5 stage gates with interactive checklists, governance and control rhythm |
| `#/app/evidence` | Drag-and-drop evidence vault with a simulated read → classify → insight pipeline |
| `#/app/assistant` | "Ask Canopy" chat, grounded in the plan, with cited slides and a glossary |
| `#/app/outcomes` | Success at M12 and the proposed KPIs |
| `#/app/risks` | Dependencies and controls, plus the management decisions to approve |

The **M-slider** in the top bar simulates any programme month, and every page re-derives its state from it. Press **⌘K / Ctrl+K** for the command palette. State is saved in `localStorage`, and **Reset** in the sidebar restores the demo data.

Maturity scores and evidence files are illustrative sample data. KPI values are the deck's proposed targets, not actual results. The "AI" is deterministic rules over the plan content (`src/lib/insights.js`, `src/lib/assistant.js`), so it runs fully offline.

## Develop

```bash
cd pfmsb-platform
npm install
npm run dev      # local dev server
npm run build    # writes the static site to ../pfmsb/
```

Stack: React 18, Vite, Framer Motion, Lucide icons, plain CSS with design tokens (`src/styles/base.css`).

```
src/
  data/        plan content from the deck, sample evidence
  lib/         store (context + reducer), hash router, insight + assistant engines
  components/  ui/ (Button, Card, Badge, Ring, Stat, Segmented, Drawer…)
               layout/ (AppShell, Sidebar, Topbar, CommandPalette)
               visual/ (NeuralCanopy canvas, GrowthRings, Radar, PhaseBand, Logo)
  pages/       one file per route
  styles/      base tokens, components, layout, landing, pages
```
