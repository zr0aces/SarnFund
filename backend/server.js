import { readFileSync, existsSync } from 'fs';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { scrapeData } from './scraper.js';

// Load .env if present (no external dependency needed – simple key=value parser)
const envPath = new URL('.env', import.meta.url).pathname;
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
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// CORS Configuration - Restrict in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Set CORS_ORIGIN in production
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit request body size

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

/**
 * Check if cached data is still valid (less than 24 hours old)
 */
function isCacheValid(timestamp) {
  if (!timestamp) return false;
  const age = Date.now() - timestamp;
  return age < CACHE_DURATION;
}

/**
 * Get cached data or return null
 */
async function getCachedData(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);

    if (isCacheValid(parsed.timestamp)) {
      console.log(`Using valid cache for ${filename}`);
      return parsed;
    } else {
      console.log(`Cache expired for ${filename}`);
      return null;
    }
  } catch (error) {
    console.log(`No cache found for ${filename}:`, error.message);
    return null;
  }
}

// Active fund types — to add a new type: add its key here (must match scraper FUND_TYPES)
// and ensure the scraper writes {type}.json to the data directory.
const ACTIVE_FUND_TYPES = new Set(['rmf', 'esg', 'ssf', 'all']);

/**
 * Fund data endpoints — one route handles all active types.
 */
app.get('/api/funds/:type', async (req, res) => {
  const { type } = req.params;
  if (!ACTIVE_FUND_TYPES.has(type)) {
    return res.status(404).json({ success: false, error: `Unknown fund type: ${type}` });
  }
  try {
    console.log(`GET /api/funds/${type}`);
    const cached = await getCachedData(`${type}.json`);
    if (cached) return res.json({ success: true, cached: true, ...cached });
    return res.status(503).json({
      success: false,
      error: 'No cached data available. Please run scraper manually or wait for scheduled scrape.',
      message: 'Run: npm run scrape in the backend directory',
    });
  } catch (error) {
    console.error(`Error fetching ${type.toUpperCase()} data:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Backward-compat aliases
app.get('/api/funds/tesg', (req, res) => res.redirect(301, '/api/funds/esg'));
app.get('/api/funds/ltf', (_req, res) =>
  res.status(410).json({ success: false, error: 'LTF funds were discontinued. No longer tracked.' })
);

/**
 * Manually trigger scraping.
 * Requires the SCRAPE_TOKEN env var to match the X-Scrape-Token header (or
 * the ?token= query param). Falls back to allowing the request if no token is
 * configured (dev mode), but logs a warning.
 */
app.post('/api/scrape', async (req, res) => {
  try {
    // ── Auth check ────────────────────────────────────────────────────────────
    const configuredToken = process.env.SCRAPE_TOKEN;
    const providedToken   = req.headers['x-scrape-token'] || req.query.token;

    if (configuredToken) {
      if (providedToken !== configuredToken) {
        return res.status(401).json({ success: false, message: 'Invalid or missing scrape token.' });
      }
    } else {
      console.warn('WARNING: SCRAPE_TOKEN is not set. /api/scrape is unprotected.');
    }

    // ── Cache check (skip with ?force=true) ──────────────────────────────────
    if (req.query.force !== 'true') {
      const cached = await getCachedData('all.json');
      if (cached) {
        return res.json({
          success: true,
          message: 'Cache is still valid. Use ?force=true to scrape anyway.',
          nextScrapeIn: CACHE_DURATION - (Date.now() - cached.timestamp),
        });
      }
    }

    console.log('POST /api/scrape – manual scrape triggered');
    const result = await scrapeData();
    res.json({ success: true, message: 'Scrape completed.', data: result });
  } catch (error) {
    console.error('Manual scrape error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Reset the fund registry cache (forces a full re-fetch of fund types on next scrape)
 */
app.delete('/api/registry', async (req, res) => {
  try {
    const registryPath = path.join(DATA_DIR, 'fund-registry.json');
    await fs.rm(registryPath, { force: true });
    res.json({ success: true, message: 'Fund registry cleared. Next scrape will rebuild it.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    const [rmfCache, esgCache, ssfCache] = await Promise.all([
      getCachedData('rmf.json'),
      getCachedData('esg.json'),
      getCachedData('ssf.json'),
    ]);

    let registry = null;
    try {
      const reg = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'fund-registry.json'), 'utf8'));
      registry = { funds: reg.funds?.length ?? 0, lastBuilt: new Date(reg.timestamp).toISOString() };
    } catch { /* no registry yet */ }

    const cacheInfo = (c) => c
      ? { valid: true, funds: c.data?.length ?? 0, lastUpdated: new Date(c.timestamp).toISOString() }
      : { valid: false };

    res.json({
      status: 'ok',
      secApi: {
        factsheetKey:  !!process.env.SEC_FACTSHEET_KEY,
        factsheetKey2: !!process.env.SEC_FACTSHEET_KEY_2,
        dailyInfoKey:  !!process.env.SEC_DAILYINFO_KEY,
        dailyInfoKey2: !!process.env.SEC_DAILYINFO_KEY_2,
      },
      registry,
      cache: {
        rmf: cacheInfo(rmfCache),
        esg: cacheInfo(esgCache),
        ssf: cacheInfo(ssfCache),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

/**
 * Get fund stats (counts)
 */
app.get('/api/stats', async (req, res) => {
  try {
    const [rmf, esg, ssf] = await Promise.all([
      getCachedData('rmf.json'),
      getCachedData('esg.json'),
      getCachedData('ssf.json'),
    ]);

    res.json({
      success: true,
      stats: {
        rmf: rmf?.data?.length || 0,
        esg: esg?.data?.length || 0,
        ssf: ssf?.data?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule daily scraping at 1 AM
cron.schedule('0 1 * * *', async () => {
  console.log('Running scheduled scrape at 1 AM...');
  try {
    await scrapeData();
    console.log('Scheduled scrape completed successfully');
  } catch (error) {
    console.error('Scheduled scrape failed:', error);
  }
});

// Start server
app.listen(PORT, () => {
  const hasFs    = !!process.env.SEC_FACTSHEET_KEY;
  const hasFs2   = !!process.env.SEC_FACTSHEET_KEY_2;
  const hasDi    = !!process.env.SEC_DAILYINFO_KEY;
  const hasDi2   = !!process.env.SEC_DAILYINFO_KEY_2;
  const hasToken = !!process.env.SCRAPE_TOKEN;
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`SEC Factsheet API: primary ${hasFs ? '✓' : '✗ MISSING'}  secondary ${hasFs2 ? '✓' : '–'}`);
  console.log(`SEC Daily Info API: primary ${hasDi ? '✓' : '✗ MISSING'}  secondary ${hasDi2 ? '✓' : '–'}`);
  if (!hasFs || !hasDi) console.log('  → set SEC_FACTSHEET_KEY / SEC_DAILYINFO_KEY in .env');
  console.log(`Scrape token:  ${hasToken ? 'configured ✓' : 'not set – /api/scrape is unprotected (set SCRAPE_TOKEN in .env)'}`);
  console.log(`\nAPI endpoints:`);
  console.log(`  GET    /api/funds/rmf   - RMF fund data`);
  console.log(`  GET    /api/funds/esg   - ThaiESG (ESG) fund data`);
  console.log(`  GET    /api/funds/ssf   - SSF fund data`);
  console.log(`  GET    /api/funds/all   - All fund data`);
  console.log(`  POST   /api/scrape?force=true  - Force scrape`);
  console.log(`  DELETE /api/registry    - Reset fund registry cache`);
  console.log(`  GET    /api/health      - Health check`);
  console.log(`  GET    /api/stats       - Fund counts`);
  console.log(`\nScheduled scraping: Daily at 1 AM`);
  console.log(`Cache duration: 24 hours | Registry TTL: 7 days`);
});

export default app;
