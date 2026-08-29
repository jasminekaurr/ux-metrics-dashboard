# Figma integration

Capture Figma Analytics Library data at build time for the design system page.

## Setup

1. Copy `dashboard/.env.example` to `dashboard/.env.local`.
2. Fill in:

```env
FIGMA_ACCESS_TOKEN=your-figma-token
FIGMA_FILE_KEY=your-library-file-key
FIGMA_START_DATE=2026-01-01
FIGMA_END_DATE=2026-04-22
```

Create a personal access token in Figma with Analytics API access. Use the file key from your design system library URL.

## Capture

```bash
cd dashboard
npm run capture:figma
```

This writes `src/data/live/apex.json`.

If the API returns sparse data, the script falls back to bundled sample analytics for team/detachment sections.

## Build with live Figma data

```bash
npm run capture:figma
npm run build
```

Or capture everything:

```bash
npm run capture:all
npm run build
```

## Security

- Never commit `FIGMA_ACCESS_TOKEN`.
- Capture runs at build time only — tokens are not exposed in the browser.
