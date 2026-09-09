# Data settings (bring your own data)

The live demo does **not** include an in-app Data Settings page. Use the options below to attach your own metrics.

## How data loads

Merge order (later wins):

1. **Bundled sample** — `dashboard/src/data/sample/*.json`
2. **Live capture** — `dashboard/src/data/live/*.json` (gitignored; from `npm run capture:*`)
3. **Browser upload** — optional `localStorage` overrides via `DataContext` / `providerCore` (for forks that re-enable an upload UI)

See [data-format.md](./data-format.md) and [DATA-MANIFEST.json](./DATA-MANIFEST.json) for schemas and which files power which pages.

## Option A — Edit sample JSON

```bash
# Edit files under dashboard/src/data/sample/
cd dashboard
npm run validate:data
npm run dev
```

## Option B — Export / replace a snapshot

```bash
cd dashboard
npm run export:snapshot
# Writes sample-data/full-snapshot/
```

Copy domain files from the snapshot into `dashboard/src/data/sample/`, or distribute `ux-dashboard-snapshot.json` to teammates.

## Option C — Build-time capture (Jira / Figma)

```bash
cd dashboard
cp .env.example .env.local
# Fill in JIRA_* and FIGMA_* values
npm run capture:all
npm run build
```

Capture output lands in `src/data/live/` and overrides sample data when present.

## Option D — Programmatic upload (advanced)

`DataContext` still exposes `applyUpload`, `resetUpload`, and `hasUpload`. Forks can rebuild a Data Settings UI by calling those helpers (the removed page lived at `dashboard/src/pages/DataSettings.jsx` historically).

Uploads are stored under the `localStorage` key `ux-dashboard-data-upload` for that browser only.

## Domain files

| File | Role |
|------|------|
| `months.json` | Month picker slot count (labels roll to current month) |
| `roadmap.json` | Delivery / roadmap metrics |
| `research.json` | Research coverage |
| `analytics.json` | Product analytics KPIs, funnels, adoption |
| `strategic.json` / `strategicContributions.json` | Strategic matrix |
| `projectComponents.json` | Custom vs design-system components (user input) |
| `apex.json` | Design system / Figma analytics |
| `jiraLabelAdoption.json` | Label Venn on Executive Summary |
| `panelHealth.json` / `ubaIASpotlight.json` | Research spotlights |

Files marked `exported_only` in [DATA-MANIFEST.json](./DATA-MANIFEST.json) ship for forward compatibility but are not fully wired to UI yet.

## Related docs

- [Architecture](./ARCHITECTURE.md)
- [Analytics integration](../integrations/analytics/README.md)
- [Jira integration](../integrations/jira/README.md)
- [Figma integration](../integrations/figma/README.md)
