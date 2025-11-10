#!/bin/bash
set -euo pipefail

SUBDIRECTORY="ngwcommerce"
RED="\033[0;31m"; GREEN="\033[0;32m"; YELLOW="\033[1;33m"; BLUE="\033[0;34m"; RESET="\033[0m"

echo -e "${BLUE}🚀 Deploying Angular app (branch-switch method) ...${RESET}"

if [ ! -f package.json ] || [ ! -f angular.json ]; then
  echo -e "${RED}❌ Must run from project root containing package.json & angular.json${RESET}"; exit 1; fi

CURRENT_BRANCH=$(git branch --show-current || echo "unknown")
echo -e "${BLUE}📋 Current branch:${RESET} ${CURRENT_BRANCH}"
if [ "${CURRENT_BRANCH}" != "development" ]; then
  echo -e "${YELLOW}⚠️ Recommended to deploy from 'development' branch (continuing)${RESET}"; fi

echo -e "${BLUE}🧹 Cleaning previous dist ...${RESET}"
rm -rf dist/

echo -e "${BLUE}🔨 Building production with base href / ...${RESET}"
npm run build -- --configuration=production --base-href="/"

INDEX_FILE=$(find dist -name index.html -type f | head -1 || true)
if [ -z "${INDEX_FILE}" ]; then echo -e "${RED}❌ Build failed: index.html not found${RESET}"; exit 1; fi
BUILD_DIR=$(dirname "${INDEX_FILE}")
echo -e "${GREEN}✅ Build dir:${RESET} ${BUILD_DIR}"

TEMP_DIR=$(mktemp -d)
echo -e "${BLUE}📦 Temp dir:${RESET} ${TEMP_DIR}"
cp -R "${BUILD_DIR}"/* "${TEMP_DIR}"/
cp -R "${BUILD_DIR}"/.[^.]* "${TEMP_DIR}"/ 2>/dev/null || true

if [ ! -f "${TEMP_DIR}/index.html" ]; then echo -e "${RED}❌ Copy to temp failed${RESET}"; exit 1; fi

echo -e "${BLUE}🔄 Switching to release branch ...${RESET}"
if git rev-parse --verify release >/dev/null 2>&1; then
  git checkout release
else
  git checkout --orphan release
fi

echo -e "${BLUE}🧹 Cleaning release branch working tree ...${RESET}"
find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name '.gitignore' -exec rm -rf {} + 2>/dev/null || true

echo -e "${BLUE}📁 Copying build files into release branch ...${RESET}"
cp -R "${TEMP_DIR}"/* .
cp -R "${TEMP_DIR}"/.[^.]* . 2>/dev/null || true
rm -rf "${TEMP_DIR}"

if [ ! -f index.html ]; then echo -e "${RED}❌ Missing index.html after copy${RESET}"; git checkout "${CURRENT_BRANCH}"; exit 1; fi

echo -e "${BLUE}⚙️ Writing .htaccess for Angular SPA routing ...${RESET}"
cat > .htaccess <<EOF
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOF

echo -e "${BLUE}📝 Writing deployment-info.json ...${RESET}"
cat > deployment-info.json <<EOF
{
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "sourceBranch": "${CURRENT_BRANCH}",
  "subdomain": "ngwcommerce.rshossain.me",
  "baseHref": "/",
  "buildDir": "${BUILD_DIR}",
  "node": "$(node --version 2>/dev/null || echo unknown)",
  "user": "$(whoami)@$(hostname)"
}
EOF

echo -e "${BLUE}💾 Staging files ...${RESET}"
git add .
if git diff --cached --quiet; then
  echo -e "${YELLOW}⚠️ No changes to deploy (release unchanged)${RESET}"
  git checkout "${CURRENT_BRANCH}"; echo -e "${GREEN}✨ Done${RESET}"; exit 0
fi

COMMIT_MSG="Deploy to ngwcommerce.rshossain.me $(date '+%Y-%m-%d %H:%M:%S') from ${CURRENT_BRANCH}"
echo -e "${BLUE}💾 Committing: ${RESET}${COMMIT_MSG}"
git commit -m "${COMMIT_MSG}"

echo -e "${BLUE}⬆️ Pushing release ...${RESET}"
if ! git push origin release; then
  echo -e "${YELLOW}⚠️ Push reported an issue, verifying commit sync...${RESET}"
  git fetch origin release --quiet || true
fi

LOCAL=$(git rev-parse release)
REMOTE=$(git rev-parse origin/release 2>/dev/null || echo "none")

echo -e "${BLUE}🔄 Returning to ${CURRENT_BRANCH} ...${RESET}"
git checkout "${CURRENT_BRANCH}" || echo -e "${YELLOW}⚠️ Could not return automatically${RESET}"

if [ "${LOCAL}" = "${REMOTE}" ]; then
  echo -e "${GREEN}🎉 Deployment successful. Release branch updated.${RESET}"
  echo -e "${GREEN}🌐 Hostinger should auto-deploy if configured for branch 'release'.${RESET}"
else
  echo -e "${RED}❌ Deployment may have failed (remote commit mismatch).${RESET}"; exit 1
fi

echo -e "${GREEN}✅ Finished.${RESET}"