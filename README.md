# UX Metrics Dashboard

Open-source UX impact measurement and delivery intelligence dashboard for design teams.

Track UX impact across delivery health, research coverage, strategic contribution, and design system adoption — with bundled Instagram-themed sample data, optional JSON uploads, or build-time Jira/Figma capture.

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

### 2. Upload or download a JSON snapshot

- Open **Data Settings** in the dashboard (`/#/data`) to upload a snapshot JSON file.
- Or export the current dataset:

```bash
cd dashboard
npm run export:snapshot
```

Snapshot files are written to `sample-data/full-snapshot/`.

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

## Documentation

- [Data format](docs/data-format.md) — JSON schema for all dashboard domains
- [Jira integration](integrations/jira/README.md)
- [Figma integration](integrations/figma/README.md)
- [Contributing](CONTRIBUTING.md)
- [Publishing](PUBLISH.md)
- [Security](SECURITY.md)

## Demo data disclaimer

All sample data is fictional. Product names (Feed, Reels, DMs, Explore, Creator, Stories, Profile), ticket IDs, and narratives are illustrative demo content — not affiliated with or sourced from any real company.

## Contributors

- **Jasmine Kaur** — ideated and built the dashboard
- **Manasi Kulkarni** — ideation, requirement gathering, and planning
- **Akanksha Tanwar** — helped prepare the project for public release

## License

MIT — see [LICENSE](LICENSE).
