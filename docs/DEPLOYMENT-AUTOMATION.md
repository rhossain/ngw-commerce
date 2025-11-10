# Deployment Automation Guide

This project supports two deployment flows:

1. Manual branch-switch deployment via `scripts/deploy-release.sh` (recommended)
2. Automatic webhook-triggered deploy on pushes to `release` (GitHub Action)

## Branch Behavior

| Branch (manual flow) | Behavior |
|----------------------|----------|
| development (run script here) | Builds, switches to `release`, commits build artifacts, returns to `development` |
| release (result) | Contains ONLY compiled build, `.htaccess`, and `deployment-info.json` |

## One Command

```bash
npm run deploy
```

## Manual Deployment Script

Run from the `development` branch:

```bash
npm run deploy
```

What it does:
1. Cleans previous `dist/`.
2. Builds production with base href for subdirectory.
3. Copies build output to a temp dir.
4. Checks out (or creates) `release` branch (orphan if first time).
5. Wipes working tree (except `.git`).
6. Copies build files, generates `.htaccess` and `deployment-info.json`.
7. Commits and pushes `release`.
8. Returns to original branch.

Result: `release` branch contains only deployable static assets.

## Key Files

* `scripts/deploy-release.sh` – Branch-switch deployment script.
* `.github/workflows/release-deploy.yml` – Webhook invocation workflow.
* `deployment-info.json` (generated) – Metadata snapshot of deploy.

## Webhook Flow
Pushes to `release` trigger the GitHub Action, which calls Hostinger webhook. Hostinger then pulls the repo (if configured in its Git integration) and deploys the `release` branch contents into `/public_html/ngwcommerce`.

## Rollback
Checkout prior release commit locally and re-run the manual deploy script (from `development`) after resetting to that build state or tag.

## Security Notes
* Protect the `release` branch (require PR, restrict direct pushes).
* Avoid placing secrets in deployment assets; they become public.

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Release missing index.html | Copy failed | Re-run script; check write permissions |
| Webhook not deploying | Hostinger not linked | Configure Git repo in Hostinger panel |
| Old assets still served | Browser cache | Hard refresh / configure cache headers |
| Build path wrong | Angular output changed | Update script's build directory discovery |

## Future Improvements
* Automated tagging per deploy (e.g. `deploy-YYYYMMDD-HHMM`).
* Size manifest for quick diff of asset changes.
* Optional integrity hash mapping.

## Hostinger Webhook Integration (CI)

A GitHub Actions workflow (`.github/workflows/release-deploy.yml`) triggers the Hostinger deployment webhook whenever the `release` branch is pushed. This lets Hostinger pull & deploy (or run its internal script) without exposing SFTP credentials to the repository.

### Setup Steps
1. Add the provided Hostinger webhook URL as-is in the workflow (already committed).
2. (Optional) If you later need to rotate the URL, update `release-deploy.yml` and commit.
3. Ensure your Hostinger panel is configured to handle the webhook (automatic if Hostinger generated the URL).

### When to Use Each Method
| Method | Pros | Cons | Recommended Use |
|-------|------|------|-----------------|
| Branch-switch Script | Deterministic release artifacts | Rewrites branch history; static-only | Normal deployments |
| Hostinger Webhook | Auto trigger | Requires panel setup | Hands-off releases |
| Combined | Resilient | More moving parts | Production with manual fallback |

### Hardening Suggestions
* Restrict who can push to `release` (protected branch).
* Rotate webhook if leaked (Hostinger provides new URL).
* Add simple secret validation if Hostinger supports custom headers.

### Disable or Pause CI Deploy
Temporarily comment out the job in `release-deploy.yml` or add a condition:
```
if: github.event.head_commit.message !~ /\[skip-deploy\]/
```

Add `[skip-deploy]` to a commit message to bypass.

---
Last updated: Switched to branch-switch deployment model.