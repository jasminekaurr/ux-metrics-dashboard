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

Upload `ux-dashboard-snapshot.json` via **Data Settings** in the dashboard, or replace files in `dashboard/src/data/sample/` before building.
