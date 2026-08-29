# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main`  | Yes       |

## Reporting a vulnerability

If you discover a security issue, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities.
2. Open a **private security advisory** on GitHub: **Security → Advisories → Report a vulnerability**, or email the repository owner listed on the [GitHub repo](https://github.com/jasminekaurr/ux-metrics-dashboard).
3. Include a description, steps to reproduce, and potential impact.
4. Allow reasonable time for a fix before public disclosure.

## Credential handling

This project uses **build-time capture scripts** for Jira and Figma integrations. Follow these practices:

- Never commit `.env.local`, API tokens, or capture output in `dashboard/src/data/live/`
- Use `dashboard/.env.example` as a template only — replace all placeholder values locally
- Capture scripts run on your machine or in CI with secrets — tokens are never bundled into the static site
- Only sanitized issue metadata (IDs, titles, labels) is included in built JSON

## Demo data

All bundled sample data is fictional and themed for demonstration. It does not contain real user data, production URLs, or employer-specific information.
