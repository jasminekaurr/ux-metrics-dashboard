# Dashboard app

React + Vite single-page application for the UX Metrics Dashboard.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build:external   # anonymized labels — used for GitHub Pages
npm run build          # Instagram-themed demo labels
```

Production output is written to `../docs/`.

## Data

| Path | Purpose |
|------|---------|
| `src/data/sample/` | Bundled demo JSON (committed) |
| `src/data/live/` | Capture script output (gitignored) |
| `src/config/orgLabels.js` | Demo vs anonymized label modes |

See [Data format](../docs/data-format.md) for the full JSON schema.

## Capture scripts

Requires `dashboard/.env.local` (copy from `.env.example`):

```bash
npm run capture:jira    # → src/data/live/jiraLabelAdoption.json
npm run capture:figma   # → src/data/live/apex.json
npm run capture:all
```

## Lint

```bash
npm run lint
```
