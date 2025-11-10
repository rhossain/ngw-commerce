#!/usr/bin/env node
/**
 * Automated deployment script for ngw-commerce Angular app.
 * Usage: npm run deploy
 *
 * Branch behavior:
 *  - release: full clean deploy to HOSTINGER_REMOTE_PATH
 *  - development: incremental deploy (only dist files) preserving existing .htaccess
 *
 * Environment variables (define in .env or shell):
 *  HOSTINGER_HOST=ftp.hostinger.com (or your domain)
 *  HOSTINGER_PORT=22 (SFTP) optional
 *  HOSTINGER_USER=your_ftp_username
 *  HOSTINGER_PASS=your_ftp_password
 *  HOSTINGER_REMOTE_PATH=/public_html/ngwcommerce
 *  DEPLOY_STRATEGY=incremental|full (override branch default)
 *
 * Optional:
 *  DEPLOY_DRY_RUN=true  -> list files only
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Client = require('ssh2-sftp-client');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

function log(msg) { console.log(`[deploy] ${msg}`); }
function fail(msg) { console.error(`\n[deploy:ERROR] ${msg}`); process.exit(1); }

// Validate env
const HOST = process.env.HOSTINGER_HOST;
const PORT = process.env.HOSTINGER_PORT ? parseInt(process.env.HOSTINGER_PORT, 10) : 22;
const USER = process.env.HOSTINGER_USER;
const PASS = process.env.HOSTINGER_PASS;
const REMOTE = process.env.HOSTINGER_REMOTE_PATH || '/public_html/ngwcommerce';
if (!HOST || !USER || !PASS) {
  fail('Missing required env HOSTINGER_HOST / HOSTINGER_USER / HOSTINGER_PASS');
}

// Determine branch
let branch = 'unknown';
try {
  branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (e) {
  log('Warning: could not determine git branch; defaulting to unknown');
}
log(`Current branch: ${branch}`);

// Build (always production for deployment)
log('Running production build...');
execSync('npm run build -- --configuration=production', { stdio: 'inherit' });

// Dist path inference from angular.json (hardcoded based on config)
const distDir = path.resolve(process.cwd(), 'dist/ngw-commerce');
if (!fs.existsSync(distDir)) fail(`Dist directory not found: ${distDir}`);

// Decide strategy
const isRelease = branch === 'release';
let strategy = process.env.DEPLOY_STRATEGY || (isRelease ? 'full' : 'incremental');
log(`Deployment strategy: ${strategy}`);
const dryRun = process.env.DEPLOY_DRY_RUN === 'true';

// Collect local files
function walk(dir, base = dir) {
  return fs.readdirSync(dir).flatMap(entry => {
    const full = path.join(dir, entry);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) return walk(full, base);
    return [{ full, rel }];
  });
}
const files = walk(distDir);
log(`Found ${files.length} build files.`);

async function deploy() {
  const sftp = new Client();
  await sftp.connect({ host: HOST, port: PORT, username: USER, password: PASS });
  log(`Connected to ${HOST}`);

  // Ensure remote path exists
  try { await sftp.mkdir(REMOTE, true); } catch(_) {}

  if (strategy === 'full') {
    log('Performing full clean (except .htaccess) ...');
    const list = await sftp.list(REMOTE);
    for (const item of list) {
      if (item.name === '.htaccess') continue;
      const remoteItemPath = `${REMOTE}/${item.name}`;
      try {
        if (item.type === 'd') {
          await sftp.rmdir(remoteItemPath, true);
        } else {
          await sftp.delete(remoteItemPath);
        }
      } catch (e) { log(`Skip delete error ${remoteItemPath}: ${e.message}`); }
    }
  }

  let uploaded = 0;
  for (const f of files) {
    const remoteFile = `${REMOTE}/${f.rel}`;
    const remoteDir = path.dirname(remoteFile).replace(/\\/g, '/');
    try { await sftp.mkdir(remoteDir, true); } catch(_) {}
    if (dryRun) {
      log(`[dry-run] Would upload ${f.rel}`);
      continue;
    }
    await sftp.fastPut(f.full, remoteFile);
    uploaded++;
    if (uploaded % 50 === 0) log(`Uploaded ${uploaded}/${files.length}`);
  }

  // Create a release marker
  if (!dryRun) {
    const markerContent = JSON.stringify({ branch, date: new Date().toISOString(), strategy }, null, 2);
    await sftp.put(Buffer.from(markerContent), `${REMOTE}/deploy-info.json`);
  }

  await sftp.end();
  log(`Deployment complete. Uploaded ${uploaded} files.`);
}

deploy().catch(err => fail(err.message));