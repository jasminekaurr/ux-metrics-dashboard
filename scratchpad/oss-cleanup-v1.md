# OSS cleanup v1 — comments, CSS, constants, README

**Date:** 2026-09-14  
**Status:** complete

## Locked decisions

- Adopter marker: `@CUSTOMIZE`
- CSS: pragmatic (static → CSS files; dynamic stays inline)

## Done

1. README: Deployment & hosting + Customize (`@CUSTOMIZE`); AGENTS/CONTRIBUTING pointers
2. File headers on `dashboard/src/**` + `@CUSTOMIZE` on adopter touchpoints
3. CSS tokens in index.css; per-page CSS for Dark pages/Venn; removed orphan `App.css`
4. Shared config constants; wired researchInitiatives + fcub JSON; deduped light Venn tickets
5. Comments on provider, DataContext, playground model, label helpers
6. Verified: lint (clean), validate:data, build:external

## Notes

- Do not commit/push unless requested.
- Process log: `scratchpad/swapneel-prompts.md`.
