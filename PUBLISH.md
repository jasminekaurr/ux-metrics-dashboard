# Publishing guide

How to publish or update the public UX Metrics Dashboard repository.

## First-time publish

1. **Verify the build** from the repo root:

   ```bash
   cd dashboard
   npm ci
   npm run lint
   npm run build:external
   ```

2. **Initialize git** (if this folder is not already a repo):

   ```bash
   git init
   git add .
   git commit -m "Initial public release of UX Metrics Dashboard"
   git remote add origin https://github.com/YOUR_USER/ux-metrics-dashboard.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to **Settings → Pages**
   - Set **Source** to **GitHub Actions**
   - The `Deploy dashboard to Pages` workflow builds and deploys on every push to `main`

4. **Verify CI**: The `CI` workflow runs lint and build on pull requests and pushes.

## Updating from a private repo

If you maintain a private repo with internal planning files, regenerate the public export there:

```bash
./scripts/prepare-public-export.sh
```

Then copy the `oss-export/` output into this public repo and push.

## What stays private

Do not include in the public repo:

- Internal planning docs, pitch decks, `.jam` files
- `node_modules/`, `.env.local`, capture output in `dashboard/src/data/live/`
- API tokens, internal Jira URLs, or employer-specific data
- Internal AI service integrations

## Rebuilding the demo site

The Vite build outputs to `docs/` at the repo root:

```bash
cd dashboard
npm run build:external
git add docs/
git commit -m "Rebuild GitHub Pages demo"
git push
```

Alternatively, push to `main` and let the GitHub Actions workflow rebuild automatically.

## Anonymized demo mode

Public deployments use `build:external`, which sets `VITE_ORG_MODE=external` to anonymize product names (Product Alpha, Product Beta, etc.).

Local development defaults to the LinkedIn-themed demo labels (Feed, Messaging, Jobs, etc.).
