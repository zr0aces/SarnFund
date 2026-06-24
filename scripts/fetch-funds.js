#!/usr/bin/env node
/**
 * Fetch mutual fund data from SEC Thailand Open Data API v2.
 *
 * Usage:
 *   node scripts/fetch-funds.js                # reuse registry (if < 7 days old), fetch fresh NAV
 *   node scripts/fetch-funds.js                # auto-resumes interrupted spec-lookup if checkpoint exists
 *   node scripts/fetch-funds.js --refresh      # clear checkpoint + registry, rebuild from scratch
 *
 * Registry cache (backend/data/fund-registry.json):
 *   Stores the list of RMF/SSF/TESG/LTF funds across 18 AMCs.
 *   Valid for 7 days — subsequent runs reuse it to avoid ~500 spec-lookup API calls.
 *   Use --refresh to force a rebuild (e.g. after AMC changes or fund reclassification).
 *
 * Output files written to backend/data/:
 *   rmf.json  ssf.json  tesg.json  ltf.json  all.json
 */

import { readFileSync, existsSync, rmSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = resolve(__dirname, '..', 'backend');

// Load backend/.env (same simple parser as server.js)
const envPath = join(BACKEND_DIR, '.env');
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
} else {
  console.error(`No .env found at ${envPath}`);
  console.error('Copy backend/.env.example to backend/.env and fill in your SEC API keys.');
  process.exit(1);
}

if (!process.env.SEC_FACTSHEET_KEY || !process.env.SEC_DAILYINFO_KEY) {
  console.error('SEC_FACTSHEET_KEY and SEC_DAILYINFO_KEY must be set in backend/.env');
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const forceRefresh = args.has('--refresh') || args.has('--force');

if (forceRefresh) {
  const registryPath = join(BACKEND_DIR, 'data', 'fund-registry.json');
  const progressPath = join(BACKEND_DIR, 'data', '.registry-progress.json');
  for (const p of [registryPath, progressPath]) {
    if (existsSync(p)) rmSync(p);
  }
  console.log('Registry cache cleared — will rebuild from scratch.');
}

const { scrapeData } = await import(`${BACKEND_DIR}/scraper.js`);

const start = Date.now();
const result = await scrapeData();
const elapsed = ((Date.now() - start) / 1000).toFixed(1);

const total = Object.values(result.data).flat().length;
console.log(`Done in ${elapsed}s — ${total} funds written to backend/data/`);
