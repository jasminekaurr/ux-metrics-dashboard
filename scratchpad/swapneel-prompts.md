# Prompt log

### Prompt 1 — 2026-09-14
I have some feedback. That I want you to. Just. Go over the entire repository and fix for my open source project. and this feedback is all from how to make it a better code, cleaner code perspective. So, firstly, add a lot more comments. As a practice, have a comment block on top of each file which summarizes what is happening in each file. And make a section in README, which explains how the deployment is done, how it has been hosted, how I've put it right now, and what alternatives exist. Then have a specific tag of comments for the most editable places, as a helpful comment tag. Decide a theme for it, and then add that tag in README, like, look for this comment tag, or like this label, and then make changes here and to render in your own data, just so that we are making it easy for lazy developers or lazy designers to just put it in. Then there are a lot of pages in components and stuff where inline CSS is used. Let's make CSS files different so that it's cleaner and more organized and it's easier to edit. If there is a global CSS file that can do the job, and some local files do that, so it's just all separate. And do the same practice for JSON files and have separate constant files as well. And if any file feels a little more complicated or requires explanation, make sure, like I mentioned in the beginning, add comments. So, TDR, we want different CSS, JSON, and constant files, so that everything is easy to read. We want heavier comments, and we want a tag specifically for anything that the user needs to change. to put in their own data.

**TL;DR:** Implemented OSS cleanup with `@CUSTOMIZE` tags, file headers, README Deployment + Customize sections, pragmatic CSS (tokens + per-page files), shared config constants, wired researchInitiatives/fcub JSON, and deeper comments on provider/DataContext/playground/label helpers.

**Files changed:**
- `README.md`, `AGENTS.md`, `CONTRIBUTING.md` — Deployment + `@CUSTOMIZE` docs
- `dashboard/src/config/{typography,reuseWeights,strategicQuadrants,apexBands}.js` — NEW constants
- `dashboard/src/pages/*Dark.css`, `LabelAdoptionVennDark.css` — NEW page CSS; deleted orphan `App.css`
- `dashboard/src/data/sample/researchInitiatives.json`, `fcubComponentVenn.json` — wired UI shapes
- Most `dashboard/src/**/*.{js,jsx}` — file headers / `@CUSTOMIZE` / constant imports
- `docs/DATA-MANIFEST.json`, `scratchpad/*` — manifest + process log

**Key decisions:** `@CUSTOMIZE` marker; pragmatic CSS (static → CSS, dynamic stays inline); research initiatives moved to JSON with `dataRef`

**Errors encountered:** FcubComponentVennDark react-refresh warning — moved re-export to `data/fcubTickets.js`

### Prompt 2 — 2026-09-14
Add file-header comment blocks to source files in dashboard/src/ with @CUSTOMIZE on adopter-facing constants (orgLabels, uxLabelTickets, sample/index). Skip nothing under src except generated. Keep headers concise; do not change runtime behavior. Return list of files updated.

**TL;DR:** Added `FileName — role` file headers to all listed dashboard/src JS/JSX modules; extended thin existing headers; tagged `@CUSTOMIZE` on orgLabels demo/external, UX_LABELS/LABEL_DEFINITIONS/ALL_TICKETS, and sample/*.json via sample/index.js.

**Files changed:**
- 29 files got new top-of-file headers (pages, components, context, data provider/schema, utils, App, main)
- `config/orgLabels.js`, `data/uxLabelTickets.js`, `data/sample/index.js`, `data/dummy.js`, `utils/jiraLabelData.js` — extended headers + @CUSTOMIZE where applicable
- Pre-existing headers left as-is: `config/apexBands.js`, `config/reuseWeights.js`, `config/strategicQuadrants.js`, `config/typography.js`

**Key decisions:** @CUSTOMIZE only on adopter-facing constants; did not spam helpers; preserved existing inline/function JSDoc (e.g. SplitText flatten helper).

**Errors encountered:** None

### Prompt 3 — 2026-09-14
Add heavier explanatory comments (beyond file headers) to these complex modules in /Users/jasminekaur/Documents/GitHub/ux-metrics-dashboard/dashboard/:

1. src/data/providerCore.js — explain merge order sample → live → upload, deepMerge rules, rolling months, DATA_FILE_NAMES
2. src/data/provider.js — how sample + live glob wire into buildDataFromSources
3. src/context/DataContext.jsx — upload flow, what the context exposes
4. src/utils/executivePlaygroundModel.js — what the playground model computes
5. src/data/uxLabelTickets.js — briefly explain VENN_* helpers if not already clear
6. Any capture scripts under dashboard/scripts/*.mjs that lack a file header — add a short top comment

Also ensure chartTheme.js has a file header summarizing exports (getChartTheme, SEMANTIC_COLORS, getImpactThemes, getTypeColors, STATUS_PIPELINE).

Do not change behavior. Return files touched.

**TL;DR:** Expanded explanatory comments on data merge/upload/playground modules and VENN helpers; added capture-script headers; expanded chartTheme export summary. No runtime changes.

**Files changed:**
- `dashboard/src/data/providerCore.js` — merge order, deepMerge, rolling months, DATA_FILE_NAMES docs
- `dashboard/src/data/provider.js` — sample + live glob wiring notes
- `dashboard/src/context/DataContext.jsx` — upload flow + context API docs
- `dashboard/src/utils/executivePlaygroundModel.js` — model computation overview + helper notes
- `dashboard/src/data/uxLabelTickets.js` — VENN_* helper comments
- `dashboard/src/utils/chartTheme.js` — export list in file header
- `dashboard/scripts/capture-jira-data.mjs` — file header
- `dashboard/scripts/capture-figma-data.mjs` — file header
- `dashboard/scripts/capture-fcub-component-venn.mjs` — file header
- `dashboard/scripts/capture-fcub-comprehensive.mjs` — file header
- `scratchpad/heavier-comments-v1.md` — [NEW] plan
- `scratchpad/swapneel-prompts.md` — prompt log

**Key decisions:** Only capture-*.mjs scripts needed headers (other scripts already had them); comments only, no logic edits.

**Errors encountered:** None


### Prompt 4 — 2026-09-14
Perform pragmatic CSS extraction for the UX Metrics Dashboard at /Users/jasminekaur/Documents/GitHub/ux-metrics-dashboard/dashboard/src/

GOALS:
1. Expand index.css :root with font tokens + .font-mono
2. DELETE App.css if unused
3. Create page/component CSS files with static layout/typography classes
4. Pragmatic conversion rules (static → className, dynamic stays inline)
5. Update MONO → FONT_MONO from typography.js
6. Do not break the build

**TL;DR:** Created 8 co-located Dark CSS files, confirmed index.css font tokens and App.css removal, converted ~289 static `style={{}}` blocks to BEM-ish classes, and switched remaining pages to `FONT_MONO`. Lint + `build:external` pass.

**Files changed:**
- `dashboard/src/index.css` — already had `--font-mono` / `--font-sans` / `.font-mono` (confirmed)
- `dashboard/src/App.css` — already deleted / unused (confirmed absent)
- `dashboard/src/pages/ResearchDark.css` — [NEW] Research layout/typography
- `dashboard/src/pages/StrategicDark.css` — [NEW] matrix + drawer chrome
- `dashboard/src/pages/APEXDark.css` — [NEW] adoption/integrity layout
- `dashboard/src/pages/ExecutiveSummaryDark.css` — [NEW] exec summary shells/pipeline
- `dashboard/src/pages/PresentationDark.css` — [NEW] slide chrome
- `dashboard/src/pages/AnalyticsDark.css` — [NEW] metrics/funnel/pages
- `dashboard/src/pages/RoadmapDark.css` — [NEW] chart cards/projects
- `dashboard/src/components/LabelAdoptionVennDark.css` — [NEW] Venn chrome
- Matching JSX pages/components — className migrations + FONT_MONO imports
- `scratchpad/css-extraction-v1.md` — [NEW] plan

**Key decisions:** Left dynamic styles inline (theme colors, animated values, chart fills, tooltip positions, conditional borders). Used page-scoped BEM prefixes (`rd-`, `sd-`, `apex-`, `esd-`, `pres-`, `an-`, `rm-`, `lav-`). Kept shared dark theme in ExecutiveSummary.css.

**Errors encountered:** Unused map indices after removing borderRight inline styles — fixed for lint. ResearchDark briefly referenced undefined `bq-stats-strip` classes — restored to `rd-stats-row` / `rd-section--pt40`.

