# UX Metrics Dashboard

Open-source UX impact measurement and delivery intelligence dashboard for design teams.

Track UX impact across delivery health, research coverage, strategic contribution, design system adoption, and product analytics — with bundled sample data, optional JSON overrides, or build-time Jira/Figma capture.

**[Live demo](https://jasminekaurr.github.io/ux-metrics-dashboard/)** · [Data format](docs/data-format.md) · [Contributing](CONTRIBUTING.md) · [Publishing](PUBLISH.md)

> **Live demo vs. source code**
> - **Dashboard (visitors):** [jasminekaurr.github.io/ux-metrics-dashboard](https://jasminekaurr.github.io/ux-metrics-dashboard/) — the interactive app
> - **Repository (developers):** [github.com/jasminekaurr/ux-metrics-dashboard](https://github.com/jasminekaurr/ux-metrics-dashboard) — source code and docs

## Quick start

```bash
cd dashboard
npm install
npm run dev
```

Visit `http://localhost:5173`. The dashboard runs immediately with bundled sample data themed around a fictional Instagram product design team.

For extra-anonymized demo mode (Product Alpha, Product Beta, etc.):

```bash
npm run dev:external
```

## Three ways to use your own data

### 1. Zero-config demo (default)

Clone the repo and run the dev server. All metrics come from `dashboard/src/data/sample/`.

### 2. Edit or replace JSON files

- Edit files in `dashboard/src/data/sample/` directly, or
- Export a snapshot after changes:

```bash
cd dashboard
npm run export:snapshot
```

Snapshot files are written to `sample-data/full-snapshot/`. See [Data format](docs/data-format.md) for schemas — including `analytics.json`, which you can populate from Amplitude, Mixpanel, GA4, or any analytics tool your team uses.

### 3. Live integrations (build-time capture)

Add API keys locally, capture sanitized data, then build:

```bash
cd dashboard
cp .env.example .env.local
# Fill in JIRA_* and FIGMA_* values
npm run capture:all
npm run build
```

Capture scripts write to `dashboard/src/data/live/` (gitignored). The data provider merges `sample → live → upload` at runtime.

### 4. Runtime upload (no rebuild)

Open **Data Settings** in the left nav (`/data`). Upload a full snapshot JSON or individual domain files. Overrides persist in your browser's localStorage for that session.

## Viewing period

The left-nav month picker uses **rolling calendar months** ending at the current month. “Last 3 months” and “Current month” presets are relative to your data window, not hardcoded demo dates.

## Project structure

```
ux-metrics-dashboard/
├── dashboard/              # React + Vite app
│   ├── src/data/sample/    # Default bundled JSON data
│   ├── src/data/live/      # Capture script output (gitignored)
│   └── scripts/            # Capture and export scripts
├── integrations/           # Jira and Figma setup guides
├── sample-data/            # Downloadable snapshot exports
├── docs/                   # Built demo site (GitHub Pages) + data-format.md
├── .github/workflows/      # CI and Pages deploy
├── LICENSE                 # MIT
└── PUBLISH.md              # How to publish and update
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server with Instagram-themed sample data |
| `npm run dev:external` | Dev server with anonymized product labels |
| `npm run build:external` | Production build with anonymized labels (used for GitHub Pages) |
| `npm run capture:jira` | Capture Jira label adoption data |
| `npm run capture:figma` | Capture Figma analytics into `live/apex.json` |
| `npm run capture:all` | Run all capture scripts |
| `npm run export:snapshot` | Export current data to `sample-data/full-snapshot/` |
| `npm run validate:data` | Verify bundled sample JSON files parse and meet minimum shape |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — how data flows to pages
- [Data manifest](docs/DATA-MANIFEST.json) — machine-readable file → route map (for AI tools)
- [AGENTS.md](AGENTS.md) — guide for AI coding agents
- [Data format](docs/data-format.md) — JSON schema, rolling months, user-maintained input, product analytics
- [Jira integration](integrations/jira/README.md)
- [Figma integration](integrations/figma/README.md)
- [Analytics integration](integrations/analytics/README.md)
- [Contributing](CONTRIBUTING.md)
- [Publishing](PUBLISH.md)
- [Security](SECURITY.md)

## Demo data disclaimer

All sample data is fictional. Product names (Feed, Reels, DMs, Explore, Creator, Stories, Profile), ticket IDs, and narratives are illustrative demo content — not affiliated with or sourced from any real company.

## Contributors

- **Jasmine Kaur** — ideated, gathered requirements and built the dashboard
- **Manasi Kulkarni** — ideation, requirement gathering, and planning
- **Preston Jhun** — researched, designed and built the executive summary playground 

## License

MIT — see [LICENSE](LICENSE).
