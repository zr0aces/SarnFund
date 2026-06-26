#!/usr/bin/env node
/**
 * Fetch mutual fund data from SEC Thailand Open Data API v2.
 *
 * Usage:
 *   node scripts/fetch-funds.js                # reuse registry (if < 7 days old), fetch fresh NAV
 *   node scripts/fetch-funds.js                # auto-resumes interrupted spec-lookup if checkpoint exists
 *   node scripts/fetch-funds.js --refresh      # clear checkpoint + registry, rebuild from scratch
 *
 * Registry cache:
 *   If Docker is running:   data/fund-registry.json (root)
 *   If running locally:     backend/data/fund-registry.json
 *
 * Output files written to:
 *   If Docker is running:   data/ (root, mounted to /app/data in backend container)
 *   If running locally:     backend/data/
 */

import { readFileSync, existsSync, rmSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = resolve(__dirname, '..', 'backend');
const PROJECT_ROOT = resolve(__dirname, '..');

// 1. Detect if Docker Compose is running and has the backend container up
let useDocker = false;
try {
  const check = spawnSync('docker', ['compose', 'ps', 'backend', '--status', 'running', '--quiet'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8'
  });
  if (check.status === 0 && check.stdout.trim().length > 0) {
    useDocker = true;
  }
} catch (e) {
  // Docker or docker compose not available or running
}

const args = new Set(process.argv.slice(2));
if (args.has('--help') || args.has('-h')) {
  console.log(`
SarnFund Fetch Funds Utility — Fetch mutual fund data from SEC Thailand Open Data API v2.

Usage:
  node scripts/fetch-funds.js [options]

Options:
  -h, --help     Show this help guide
  --refresh      Clear checkpoint + registry, rebuild from scratch
  --force        Alias for --refresh

Registry Cache:
  If Docker is running:   data/fund-registry.json (root)
  If running locally:     backend/data/fund-registry.json

Output files written to:
  If Docker is running:   data/ (root, mounted to /app/data in backend container)
  If running locally:     backend/data/
`);
  process.exit(0);
}
const forceRefresh = args.has('--refresh') || args.has('--force');

if (useDocker) {
  console.log('Docker environment detected. Executing scraper inside the running backend container...');
  
  if (forceRefresh) {
    const rootDataDir = join(PROJECT_ROOT, 'data');
    const registryPath = join(rootDataDir, 'fund-registry.json');
    const progressPath = join(rootDataDir, '.registry-progress.json');
    for (const p of [registryPath, progressPath]) {
      if (existsSync(p)) rmSync(p);
    }
    console.log('Registry cache cleared in root data directory.');
  }

  // Forward process arguments to docker compose exec
  const result = spawnSync('docker', [
    'compose', 'exec', '-T', 'backend', 'node', 'scraper.js', ...process.argv.slice(2)
  ], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  });
  
  process.exit(result.status ?? 0);
}

// --- Fallback to Local Host Execution ---
console.log('No running backend container found. Falling back to local execution...');
console.log('NOTE: If you intend to run SarnFund inside Docker, please start the containers first via:');
console.log('  docker compose up -d');
console.log('This avoids having the scraped data written to the wrong location (host backend/data/ instead of root data/).\n');

// Load .env (checks root first, then backend directory)
const envPaths = [
  resolve(PROJECT_ROOT, '.env'),
  join(BACKEND_DIR, '.env')
];

let loadedPath = null;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) process.env[key] = val;
    }
    loadedPath = envPath;
    break;
  }
}

if (!loadedPath) {
  console.error('No .env found at root or backend directory.');
  console.error('Copy .env.example to .env and fill in your SEC API keys.');
  process.exit(1);
}

if (!process.env.SEC_FACTSHEET_KEY || !process.env.SEC_DAILYINFO_KEY) {
  console.error(`SEC_FACTSHEET_KEY and SEC_DAILYINFO_KEY must be set in ${loadedPath}`);
  process.exit(1);
}

if (forceRefresh) {
  const registryPath = join(BACKEND_DIR, 'data', 'fund-registry.json');
  const progressPath = join(BACKEND_DIR, 'data', '.registry-progress.json');
  for (const p of [registryPath, progressPath]) {
    if (existsSync(p)) rmSync(p);
  }
  console.log('Registry cache cleared — will rebuild from scratch.');
}

const { scrapeData } = await import(pathToFileURL(join(BACKEND_DIR, 'scraper.js')).href);

const start = Date.now();
const result = await scrapeData();
const elapsed = ((Date.now() - start) / 1000).toFixed(1);

const total = Object.values(result.data).flat().length;
console.log(`Done in ${elapsed}s — ${total} funds written to backend/data/`);
