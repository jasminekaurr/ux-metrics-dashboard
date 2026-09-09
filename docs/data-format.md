# Data format

How dashboard data is structured, loaded, and customized.

Bring-your-own-data steps: [DATA-SETTINGS.md](./DATA-SETTINGS.md)  
Machine-readable wiring: [DATA-MANIFEST.json](./DATA-MANIFEST.json)

## How data loads

Later sources win:

1. **Bundled sample** — `dashboard/src/data/sample/*.json`
2. **Live capture** — `dashboard/src/data/live/*.json` (gitignored; from `npm run capture:*`)
3. **Uploaded overrides** — optional `localStorage` via `DataContext` / `providerCore` (no demo UI)

Merge logic: `dashboard/src/data/providerCore.js`.

## Viewing period (months)

Month labels are computed at runtime from the length of `months.json` (default: 4). Labels roll forward to end at the **current calendar month**.

- Index `0` = oldest month in the window
- Last index = current month (default selection)

To pin fixed labels, supply a custom `MONTHS` / `months` array via live override or upload.

## Domain files

| File | Used on | Wiring | Typical source |
|------|---------|--------|----------------|
| `months.json` | Nav picker | active | Rolling labels or your calendar |
| `roadmap.json` | Executive Summary, Roadmap | active | Jira / project tracker |
| `executive.json` | — | exported only | Leadership summary (future) |
| `research.json` | Research, Executive Summary | active | Research ops |
| `analytics.json` | Analytics, Executive Summary | active | Amplitude, Mixpanel, GA4, etc. |
| `strategic.json` | Executive Summary, Strategic | active | Portfolio planning |
| `projectComponents.json` | Design System, Executive Summary | active | User input |
| `apex.json` | Design System | active | Figma capture |
| `jiraLabelAdoption.json` | Executive Summary Venn | active | `npm run capture:jira` |
| `cost.json` | — | exported only | Finance model |
| `researchInitiatives.json` | — | exported only | Program list |
| `researchAsks.json` | — | exported only | Intake queue |
| `strategicContributions.json` | Strategic | active | Contribution log (demo shows 3) |
| `panelHealth.json` | Research | active | Panel health |
| `ubaIASpotlight.json` | Research | active | Spotlight studies |
| `fcubComponentVenn.json` | — | exported only | Optional capture |

Export: `npm run export:snapshot` → `sample-data/full-snapshot/`.

---

## Product analytics (`analytics.json`)

Replace sample data with exports from any analytics platform.

### Schema (high level)

```json
{
  "monthlySummary": [
    {
      "taskCompletionRate": 81,
      "avgTimeOnTaskSec": 84,
      "errorRate": 6.8,
      "funnelCompletionRate": 68,
      "featureAdoptionRate": 62,
      "avgPagesPerSession": 4.7,
      "nps": 38,
      "csat": 4.5,
      "susScore": 76
    }
  ],
  "metrics": [
    {
      "id": "task-completion",
      "title": "Task Completion Rate",
      "field": "taskCompletionRate",
      "unit": "%",
      "direction": "higher"
    }
  ],
  "funnels": [
    {
      "id": "post-creation",
      "name": "Post creation",
      "product": "Feed",
      "steps": [
        { "name": "Open composer", "entered": 12400, "exited": 2100, "exitRate": 17 }
      ]
    }
  ],
  "featureAdoption": [
    {
      "feature": "Reels Remix",
      "product": "Reels",
      "eligibleUsers": 8200000,
      "adoptedUsers": 1968000,
      "adoptionRate": 24,
      "daysSinceLaunch": 45
    }
  ],
  "topPages": [],
  "insights": []
}
```

`monthlySummary` aligns by **index** with `MONTHS`.

Guide: [integrations/analytics/README.md](../integrations/analytics/README.md).

---

## Jira label adoption (`jiraLabelAdoption.json`)

Powers the Executive Summary Venn. Labels must match display names in `uxLabelTickets.js`.

```json
{
  "generatedAt": "2026-08-29T18:00:00.000Z",
  "browseBaseUrl": "https://your-domain.atlassian.net/browse",
  "issues": [
    {
      "id": "FEED-2201",
      "name": "Suggested posts trust gap",
      "labels": ["Research-Driven", "Design Revision"],
      "url": "https://your-domain.atlassian.net/browse/FEED-2201"
    }
  ]
}
```

Map Jira → dashboard labels with `JIRA_LABEL_MAP` in `.env.local` (see `.env.example`). Empty capture falls back to `uxLabelTickets.js`.

---

## User-maintained input (`projectComponents.json`)

Track custom vs design-system features your team records manually. `monthly` entries align by index with `MONTHS`.

---

## Automated capture

| Integration | Script | Output |
|-------------|--------|--------|
| Jira | `npm run capture:jira` | `live/jiraLabelAdoption.json` |
| Figma | `npm run capture:figma` | `live/apex.json` |

Credentials: `dashboard/.env.local` (never commit).

---

## Anonymized demo mode

`npm run dev:external` / `npm run build:external` swap product names via `dashboard/src/config/orgLabels.js`.

## Fictional sample data

Bundled JSON uses fictional Instagram-themed product names and ticket IDs for demonstration only.
