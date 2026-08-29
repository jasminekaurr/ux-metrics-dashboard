# Product analytics integration

The dashboard reads product analytics from `analytics.json`. There is **no bundled capture script** — every organization uses a different analytics stack.

## What to do

1. Read the full schema in [docs/data-format.md](../../docs/data-format.md#product-analytics-analyticsjson).
2. Export or query metrics from your tool (Amplitude, Mixpanel, GA4, Heap, Pendo, internal warehouse, etc.).
3. Map the results into `analytics.json`.
4. Place the file at one of:
   - `dashboard/src/data/sample/analytics.json` (replace demo data)
   - `dashboard/src/data/live/analytics.json` (gitignored; overrides sample at build time)

## Example approaches

| Approach | When to use |
|----------|-------------|
| **Manual JSON edit** | Small teams, monthly leadership updates |
| **CSV → JSON script** | Export charts from your analytics UI on a schedule |
| **API capture script** | Add `npm run capture:analytics` in your fork (mirror `capture:jira` / `capture:figma`) |
| **Warehouse dbt model** | Metrics already modeled in Snowflake/BigQuery → export step in CI |

## Fields the UI uses

- **Executive Summary** — `monthlySummary` task completion, error rate, SUS, NPS
- **Analytics page** — full dataset: metrics cards, funnels, feature adoption, top pages, insights

Month indices align with the nav viewing period (`months.json` length). Rolling month labels are applied at runtime unless you supply custom `MONTHS`.
