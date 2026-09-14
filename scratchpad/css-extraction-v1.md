# CSS Extraction Plan v1 — 2026-09-14

## Goals
Pragmatic extraction of static inline styles from Dark pages into co-located CSS files.

## Scope
1. Expand `index.css` with `--font-mono`, `--font-sans`, `.font-mono`
2. Delete unused `App.css`
3. Create page/component CSS files + wire imports
4. Convert largest repeated STATIC style blocks only
5. Replace `const MONO = ...` with `FONT_MONO` from typography.js

## Files to create
- pages/ResearchDark.css
- pages/StrategicDark.css
- pages/APEXDark.css
- pages/ExecutiveSummaryDark.css
- pages/PresentationDark.css (+ import)
- pages/AnalyticsDark.css (+ import)
- pages/RoadmapDark.css (+ import)
- components/LabelAdoptionVennDark.css (+ import)

## Rules
- Static → className (flex layouts, fonts via CSS vars, fixed padding/gap/size)
- Dynamic stays inline (theme map colors, animated nums, conditional widths, charts, tooltips)
- BEM-ish prefixes: rd-, sd-, apex-, esd-, pres-, an-, rm-, lav-
