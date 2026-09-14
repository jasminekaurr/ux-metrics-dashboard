# Plan: Heavier explanatory comments (v1)

**Date:** 2026-09-14  
**Goal:** Add comments beyond file headers; no behavior changes.

## Files

1. `providerCore.js` — merge order, deepMerge, rolling months, DATA_FILE_NAMES
2. `provider.js` — sample + live glob → buildDataFromSources
3. `DataContext.jsx` — upload flow + context API
4. `executivePlaygroundModel.js` — what the model computes
5. `uxLabelTickets.js` — VENN_* helpers
6. Capture scripts missing headers — short top comments
7. `chartTheme.js` — expand header to list exports

## Out of scope

- Logic / API / export changes
- Committing (unless user asks)
