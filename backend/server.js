import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import config from './config.js';
import { FileFundStoreAdapter } from './fund-store.js';
import { scrapeData } from './scraper.js';
import { HttpSecAdapter } from './sec-api-connector.js';

const app = express();
const PORT = config.server.port;
const store = new FileFundStoreAdapter();
const connector = new HttpSecAdapter(
  config.sec.factsheetKey,
  config.sec.dailyInfoKey,
  {
    factsheetKey2: config.sec.factsheetKey2,
    dailyInfoKey2: config.sec.dailyInfoKey2,
  }
);

// CORS Configuration - Restrict in production
const corsOptions = {
  origin: config.server.corsOrigin,
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
await store.ensureDataDir();

// Active fund types — to add a new type: add its key here
const ACTIVE_FUND_TYPES = new Set(['rmf', 'esg', 'esgx', 'ssf', 'etf', 'all']);

// Backward-compat aliases — must be before /:type or Express shadows them
app.get('/api/funds/tesg', (req, res) => res.redirect(301, '/api/funds/esg'));
app.get('/api/funds/ltf', (_req, res) =>
  res.status(410).json({ success: false, error: 'LTF funds were discontinued. No longer tracked.' })
);

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
    const cached = await store.getFunds(type);
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

/**
 * Manually trigger scraping.
 */
app.post('/api/scrape', async (req, res) => {
  try {
    // ── Auth check ────────────────────────────────────────────────────────────
    const configuredToken = config.server.scrapeToken;
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
      const cached = await store.getFunds('all', true);
      if (cached) {
        return res.json({
          success: true,
          message: 'Cache is still valid. Use ?force=true to scrape anyway.',
          nextScrapeIn: config.storage.cacheDurationMs - (Date.now() - cached.timestamp),
        });
      }
    }

    console.log('POST /api/scrape – manual scrape triggered');
    const result = await scrapeData(connector, store);
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
    await store.clearRegistry();
    res.json({ success: true, message: 'Fund registry and progress checkpoint cleared. Next scrape will rebuild it.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    const health = await store.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

/**
 * Get fund stats (counts)
 */
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await store.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule daily scraping at 6:30 PM
cron.schedule('30 18 * * *', async () => {
  console.log('Running scheduled scrape at 6:30 PM...');
  try {
    await scrapeData(connector, store);
    console.log('Scheduled scrape completed successfully');
  } catch (error) {
    console.error('Scheduled scrape failed:', error);
  }
}, { timezone: 'Asia/Bangkok' });

// Start server
app.listen(PORT, () => {
  const hasFs    = !!config.sec.factsheetKey;
  const hasFs2   = !!config.sec.factsheetKey2;
  const hasDi    = !!config.sec.dailyInfoKey;
  const hasDi2   = !!config.sec.dailyInfoKey2;
  const hasToken = !!config.server.scrapeToken;
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`SEC Factsheet API: primary ${hasFs ? '✓' : '✗ MISSING'}  secondary ${hasFs2 ? '✓' : '–'}`);
  console.log(`SEC Daily Info API: primary ${hasDi ? '✓' : '✗ MISSING'}  secondary ${hasDi2 ? '✓' : '–'}`);
  if (!hasFs || !hasDi) console.log('  → set SEC_FACTSHEET_KEY / SEC_DAILYINFO_KEY in .env');
  console.log(`Scrape token:  ${hasToken ? 'configured ✓' : 'not set – /api/scrape is unprotected (set SCRAPE_TOKEN in .env)'}`);
  console.log(`\nAPI endpoints:`);
  console.log(`  GET    /api/funds/rmf   - RMF fund data`);
  console.log(`  GET    /api/funds/esg   - ThaiESG fund data`);
  console.log(`  GET    /api/funds/esgx  - ThaiESGX fund data`);
  console.log(`  GET    /api/funds/ssf   - SSF fund data`);
  console.log(`  GET    /api/funds/etf   - ETF fund data`);
  console.log(`  GET    /api/funds/all   - All fund data`);
  console.log(`  POST   /api/scrape?force=true  - Force scrape`);
  console.log(`  DELETE /api/registry    - Reset fund registry cache`);
  console.log(`  GET    /api/health      - Health check`);
  console.log(`  GET    /api/stats       - Fund counts`);
  console.log(`\nScheduled scraping: Daily at 6:30 PM`);
  console.log(`Cache duration: 24 hours | Registry TTL: 7 days`);
});

export default app;
