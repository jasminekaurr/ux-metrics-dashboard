# Architecture

Overview of how the UX Metrics Dashboard is structured and how data reaches the UI.

For AI agents: [AGENTS.md](../AGENTS.md) · [DATA-MANIFEST.json](./DATA-MANIFEST.json) · [DATA-SETTINGS.md](./DATA-SETTINGS.md)

## Stack

- **React 19** + **Vite 8** — SPA with hash routing (`HashRouter`)
- **Chart.js** — charts on Research, Analytics, Roadmap, APEX
- **Static deploy** — build output in `docs/` for GitHub Pages (markdown docs in the same folder are preserved; see `scripts/clean-pages-output.mjs`)

## Runtime data pipeline

1. **Bundled sample** — `dashboard/src/data/sample/*.json`
2. **Live capture** — optional `dashboard/src/data/live/*.json` (gitignored)
3. **Browser upload** — optional `localStorage` via `DataContext` (no demo UI; see [DATA-SETTINGS.md](./DATA-SETTINGS.md))

Merge order (later wins): **sample → live → upload**.

## Routes

| Path | Page | Primary data |
|------|------|----------------|
| `/` | Executive Summary | roadmap, research, strategic, projectComponents, analytics, jiraLabelAdoption |
| `/apex` | Design System | apexData, projectComponents |
| `/research` | UX Research | research, panelHealth, ubaIASpotlight |
| `/analytics` | Analytics | analytics |
| `/roadmap` | Roadmap | roadmap |
| `/strategic` | Strategic Contribution | strategicContributions (demo shows 3 cards) |

## Integrations

| Integration | Script | Output |
|-------------|--------|--------|
| Jira labels | `capture:jira` | `live/jiraLabelAdoption.json` |
| Figma analytics | `capture:figma` | `live/apex.json` |

## Build

```bash
cd dashboard
npm run build:external   # anonymized labels; base=/ux-metrics-dashboard/
# Forks: VITE_BASE_PATH=/ npm run build:external
```
