# Sample data snapshots

This folder contains downloadable JSON snapshots exported from the dashboard.

## Files

- `full-snapshot/ux-dashboard-snapshot.json` — complete dataset in one file
- `full-snapshot/*.json` — individual domain files matching `dashboard/src/data/sample/`

## Regenerate

```bash
cd dashboard
npm run export:snapshot
```

## Use

- Replace files in `dashboard/src/data/sample/` before building, or
- Follow [Data settings](../docs/DATA-SETTINGS.md) for snapshot export and capture scripts, or
- Merge partial overrides programmatically via `dashboard/src/data/providerCore.js`.

See [Data format](../docs/data-format.md) for schemas and [DATA-MANIFEST.json](../docs/DATA-MANIFEST.json) for which files power which pages.
