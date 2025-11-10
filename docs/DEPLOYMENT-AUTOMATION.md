# Deployment Automation Guide

This project includes a branch-aware deployment script that builds the Angular app and (optionally) uploads the compiled assets to Hostinger via SFTP.

## Branch Behavior

| Branch      | Default Strategy | Action |
|-------------|------------------|--------|
| release     | full             | Production build + clean remote (except `.htaccess`) + upload |
| development | incremental      | Production build + upload changed/new files (existing remote kept) |
| other       | incremental      | Same as development |

You can override the strategy with the `DEPLOY_STRATEGY` env variable (`full` or `incremental`).

## One Command

```bash
npm run deploy
```

## Environment Variables

Create a `.env` file (never commit real secrets) based on `.env.example`:

```
HOSTINGER_HOST=your.hostinger.server
HOSTINGER_PORT=22
HOSTINGER_USER=your_username
HOSTINGER_PASS=your_password
HOSTINGER_REMOTE_PATH=/public_html/ngwcommerce
```

Optional overrides:

```
# Force strategy (full|incremental)
DEPLOY_STRATEGY=full
# Dry run without uploading
DEPLOY_DRY_RUN=true
```

## Files Added

* `scripts/deploy.js` – Node script performing build + SFTP sync.
* `.env.example` – Template for required variables.
* `package.json` – Added `build:prod` and `deploy` scripts.

## How It Works
1. Determines current git branch.
2. Runs production build (`ng build --configuration=production`).
3. Collects files in `dist/ngw-commerce`.
4. Connects via SFTP using credentials.
5. If strategy = full: removes remote files (except `.htaccess`).
6. Uploads all build artifacts.
7. Writes `deploy-info.json` with metadata.

## Dry Run Example

```
DEPLOY_DRY_RUN=true npm run deploy
```

## Security Notes
* Do not commit `.env`.
* Prefer generating a restricted SFTP user limited to the target path.
* Rotate credentials if leaked.

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Missing env error | Not all required vars set | Copy `.env.example` -> `.env` and fill in |
| Dist directory not found | Build failed | Check terminal output for Angular errors |
| Authentication failure | Wrong credentials | Verify Hostinger FTP/SFTP settings |
| Slow uploads | Large asset set | Enable gzip on server, ensure caching headers |

## Future Improvements
* Differential checksum-based uploads.
* Automatic invalidation of CDN caches (if added later).
* Optional rollback to prior `deploy-info.json` snapshot.

## Hostinger Webhook Integration (CI)

A GitHub Actions workflow (`.github/workflows/release-deploy.yml`) triggers the Hostinger deployment webhook whenever the `release` branch is pushed. This lets Hostinger pull & deploy (or run its internal script) without exposing SFTP credentials to the repository.

### Setup Steps
1. Add the provided Hostinger webhook URL as-is in the workflow (already committed).
2. (Optional) If you later need to rotate the URL, update `release-deploy.yml` and commit.
3. Ensure your Hostinger panel is configured to handle the webhook (automatic if Hostinger generated the URL).

### When to Use Each Method
| Method | Pros | Cons | Recommended Use |
|-------|------|------|-----------------|
| SFTP Script (`npm run deploy`) | Immediate manual control; can deploy any branch | Requires credentials locally | Ad-hoc deploys, hotfix validation |
| Hostinger Webhook (CI) | Fully automated on push; no local creds needed | Limited to release branch; opaque server process | Standard production releases |
| Both Combined | Redundancy; flexibility | Two paths to maintain | Migration / fallback period |

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
Last updated: Automated script introduction.