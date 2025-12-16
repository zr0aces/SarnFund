import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
// import { scrapeData } from './scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Middleware
app.use(cors());
app.use(express.json());

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

/**
 * Get RMF fund data
 */
app.get('/api/funds/rmf', async (req, res) => {
  try {
    console.log('GET /api/funds/rmf');

    // Check cache first
    const cached = await getCachedData('rmf.json');

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        ...cached
      });
    }

    // If no valid cache, return error and suggest manual scrape
    return res.status(503).json({
      success: false,
      error: 'No cached data available. Please run scraper manually or wait for scheduled scrape.',
      message: 'Run: npm run scrape in the backend directory'
    });

  } catch (error) {
    console.error('Error fetching RMF data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get ThaiESG fund data
 */
app.get('/api/funds/tesg', async (req, res) => {
  try {
    console.log('GET /api/funds/tesg');

    // Check cache first
    const cached = await getCachedData('tesg.json');

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        ...cached
      });
    }

    // If no valid cache, return error
    return res.status(503).json({
      success: false,
      error: 'No cached data available. Please run scraper manually or wait for scheduled scrape.',
      message: 'Run: npm run scrape in the backend directory'
    });

  } catch (error) {
    console.error('Error fetching TESG data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all fund data
 */
app.get('/api/funds/all', async (req, res) => {
  try {
    console.log('GET /api/funds/all');

    const cached = await getCachedData('all.json');

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        ...cached
      });
    }

    return res.status(503).json({
      success: false,
      error: 'No cached data available. Please run scraper manually or wait for scheduled scrape.'
    });

  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Manually trigger scraping (protected endpoint - add authentication in production)
 */
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('POST /api/scrape - Manual scrape triggered');

    // Check if there's valid cache
    const cached = await getCachedData('all.json');
    if (cached) {
      return res.json({
        success: true,
        message: 'Cache is still valid. Scraping not needed.',
        nextScrapeIn: CACHE_DURATION - (Date.now() - cached.timestamp),
        data: cached
      });
    }

    // Trigger scraping
    /*
    const result = await scrapeData();
    
    res.json({
      success: true,
      message: 'Scraping completed successfully',
      data: result
    });
    */
    res.status(403).json({ success: false, message: 'Scraping is disabled' });
  } catch (error) {
    console.error('Error during manual scrape:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    const rmfCache = await getCachedData('rmf.json');
    const tesgCache = await getCachedData('tesg.json');

    res.json({
      status: 'ok',
      cache: {
        rmf: rmfCache ? {
          valid: true,
          age: Date.now() - rmfCache.timestamp,
          lastUpdated: new Date(rmfCache.timestamp).toISOString()
        } : { valid: false },
        tesg: tesgCache ? {
          valid: true,
          age: Date.now() - tesgCache.timestamp,
          lastUpdated: new Date(tesgCache.timestamp).toISOString()
        } : { valid: false }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Schedule daily scraping at 1 AM
// cron.schedule('0 1 * * *', async () => {
//   console.log('Running scheduled scrape at 1 AM...');
//   try {
//     await scrapeData();
//     console.log('Scheduled scrape completed successfully');
//   } catch (error) {
//     console.error('Scheduled scrape failed:', error);
//   }
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/funds/rmf  - Get RMF fund data`);
  console.log(`  GET  /api/funds/tesg - Get ThaiESG fund data`);
  console.log(`  GET  /api/funds/all  - Get all fund data`);
  console.log(`  POST /api/scrape     - Manually trigger scraping`);
  console.log(`  GET  /api/health     - Health check`);
  console.log(`\nScheduled scraping: Daily at 1 AM`);
  console.log(`Cache duration: 24 hours`);
});

export default app;
