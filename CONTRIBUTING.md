# Contributing

Thanks for helping improve the UX Metrics Dashboard.

## Development setup

```bash
cd dashboard
npm install
npm run dev
```

## Data changes

- Default demo data lives in `dashboard/src/data/sample/*.json`.
- Month **labels** in the nav are generated at runtime (rolling window ending at the current month); `months.json` controls how many slots exist.
- Regenerate downloadable snapshots with `npm run export:snapshot`.
- Validate bundled data with `npm run validate:data`.
- Keep sample data fictional — no real company names, URLs, or user data.
- Document new fields in [docs/data-format.md](docs/data-format.md) and update [docs/DATA-MANIFEST.json](docs/DATA-MANIFEST.json) when wiring changes.

## Adding a metric

1. Add the field to the relevant JSON file in `dashboard/src/data/sample/`.
2. Document the shape in [docs/data-format.md](docs/data-format.md).
3. Update the page component that renders the metric.
4. Run `npm run lint` and `npm run build:external`.

## Capture scripts

Capture scripts require credentials in `dashboard/.env.local` (never commit this file).

```bash
npm run capture:jira
npm run capture:figma
```

Output is written to `src/data/live/` and overrides sample data at build time.

## Pull requests

- Use focused commits with clear messages.
- Verify `npm run lint` and `npm run build:external` pass locally.
- Do not commit secrets, `.env.local`, or `src/data/live/` output.
- Do not include employer-specific or real production data in sample files.

## Code style

- Match existing patterns in the file you are editing.
- Keep components focused; prefer extending existing utilities over new abstractions.
- Run ESLint before submitting.
