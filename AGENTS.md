# AGENTS.md — AI and maintainer guide

Machine-readable companion: [`docs/DATA-MANIFEST.json`](docs/DATA-MANIFEST.json)  
Human architecture overview: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)  
Data schemas: [`docs/data-format.md`](docs/data-format.md)

## What this repo is

Open-source **UX Metrics Dashboard** — a static React (Vite) app that visualizes design-team impact from JSON data. No backend. Data merges at runtime in the browser.

## Quick commands

```bash
cd dashboard
npm install
npm run dev              # localhost:5173, Instagram-themed sample data
npm run dev:external     # anonymized product labels (Product Alpha, etc.)
npm run lint
npm run validate:data    # check bundled sample JSON
npm run build:external   # production build → ../docs (GitHub Pages)
npm run export:snapshot  # write sample-data/full-snapshot/
npm run capture:jira     # needs dashboard/.env.local
npm run capture:figma
```

## Data flow

```
sample/*.json  →  provider.js  →  buildDataFromSources()  →  DataContext  →  pages
live/*.json    ↗  (gitignored, build-time capture)
localStorage   ↗  (runtime upload via /data → Data Settings)
```

Merge order (later wins): **sample → live → upload**.

Key files:

| File | Role |
|------|------|
| `dashboard/src/data/sample/index.js` | Imports all bundled JSON |
| `dashboard/src/data/provider.js` | Wires sample + optional live glob |
| `dashboard/src/data/providerCore.js` | Merge, rolling months, localStorage |
| `dashboard/src/context/DataContext.jsx` | React provider + upload controls |
| `dashboard/src/data/schema.js` | Upload UI descriptions |

## Page → data wiring

| Route | Component | Primary data keys |
|-------|-----------|-------------------|
| `/` | `ExecutiveSummaryDark.jsx` | `roadmap`, `research`, `strategic`, `projectComponents`, `analytics`, `jiraLabelAdoption` |
| `/apex` | `APEXDark.jsx` | `apexData`, `projectComponents` |
| `/research` | `ResearchDark.jsx` | `research`, `panelHealth`, `ubaIASpotlight` (+ hardcoded initiative cards) |
| `/analytics` | `AnalyticsDark.jsx` | `analytics` |
| `/roadmap` | `RoadmapDark.jsx` | `roadmap` |
| `/strategic` | `StrategicDark.jsx` | `strategic`, `strategicContributions` |
| `/data` | `DataSettings.jsx` | upload/export all `DATA_FILE_NAMES` |

### Label Venn diagram

`LabelAdoptionVennDark.jsx` reads `jiraLabelAdoption` from context. Falls back to `uxLabelTickets.js` sample tickets when capture output is empty. Jira capture: `npm run capture:jira` → `src/data/live/jiraLabelAdoption.json`.

Label taxonomy constants live in `uxLabelTickets.js` (`UX_LABELS`, `LABEL_DEFINITIONS`). Capture script maps Jira labels via `JIRA_LABEL_MAP` in `.env.local` (see `.env.example`).

### Files in snapshot but not fully wired to UI

These are exported/imported for forward compatibility and upload; see `docs/DATA-MANIFEST.json` `wiring` field:

- `executive.json`, `cost.json`, `researchInitiatives.json`, `researchAsks.json`, `fcubComponentVenn.json`

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `JIRA_*` | `.env.local` | Capture scripts only (never bundled) |
| `FIGMA_*` | `.env.local` | Figma capture |
| `VITE_ORG_MODE=external` | build/dev | Anonymize product names |
| `VITE_BASE_PATH` | build | GitHub Pages base path (default `/ux-metrics-dashboard/`) |
| `VITE_JIRA_BROWSE_BASE_URL` | build | Optional Jira link prefix in UI |

## Do not commit

- `dashboard/.env.local`, API tokens
- `dashboard/src/data/live/`
- `node_modules/`
- Employer-specific or real production data
- Internal planning docs

## Safe change patterns

1. **New metric** — add field to relevant `sample/*.json`, document in `docs/data-format.md`, render in page component, run `validate:data` + `lint` + `build:external`.
2. **New data file** — add to `sample/index.js`, `providerCore.js` `DATA_FILE_NAMES`, `schema.js`, `docs/DATA-MANIFEST.json`, validate script.
3. **Integration** — follow `integrations/jira/` or `integrations/figma/`; output to `live/` with same shape as sample JSON.

## Fonts

UI references `"Gt America Mono"` and `"Alliance No. 2"` with system fallbacks. Custom fonts are not bundled; adopters may add their own `@font-face` rules.

## CI

`.github/workflows/ci.yml` runs `npm run lint` and `npm run build:external` in `dashboard/`.
