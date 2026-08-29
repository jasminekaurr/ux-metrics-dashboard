# Jira integration

Capture Jira label-adoption data at build time and merge it into the dashboard.

## Setup

1. Copy `dashboard/.env.example` to `dashboard/.env.local`.
2. Fill in:

```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEYS=PROJ,OTHER
VITE_JIRA_BROWSE_BASE_URL=https://your-domain.atlassian.net/browse
```

3. Adjust `JIRA_LABEL_MAP` if your Jira labels differ from the dashboard taxonomy.

## Capture

```bash
cd dashboard
npm run capture:jira
```

This writes `src/data/live/jiraLabelAdoption.json`.

## Build with live Jira data

```bash
npm run build:with-jira
```

## Label taxonomy

Default dashboard labels:

- Research-Driven
- Design Revision
- Post-Handoff
- Usability Fix
- Requirements Update
- Stakeholder Feedback
- Scope Expansion

Map each to your Jira labels via `JIRA_LABEL_MAP` in `.env.local`.

## Security

- Never commit API tokens.
- Capture scripts run locally or in CI with secrets — not in the browser.
- Only sanitized issue metadata is bundled into the static site.
