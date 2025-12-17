import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { scrapeData } from './scraper.js';

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
try {
  await fs.mkdir(DATA_DIR, { recursive: true });
} catch (err) {
  console.error('Error creating data directory:', err);
}

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

    // For all_funds.json, we rely on the python script's "timestamp" field if it exists,
    // or file modification time? 
    // The python script output format: { timestamp: ..., data: ... }

    // Check internal timestamp if present
    if (parsed.timestamp && isCacheValid(parsed.timestamp)) {
      console.log(`Using valid cache for ${filename}`);
      return parsed;
    }

    console.log(`Cache expired or missing timestamp for ${filename}`);
    return null;

  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.log(`Error reading cache for ${filename}:`, error.message);
    }
    return null;
  }
}

/**
 * Run scraper to fetch fresh data
 */
async function runScraper() {
  console.log('Starting data scraper...');
  try {
    await scrapeData();
    console.log('Scraper completed successfully');
    return true;
  } catch (error) {
    console.error('Error running scraper:', error.message);
    return false;
  }
}

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
        timestamp: cached.timestamp,
        lastUpdated: cached.lastUpdated,
        selectedAMCs: cached.selectedAMCs,
        data: cached.data
      });
    }

    // Check if file exists (even if expired) to serve stale data
    try {
      const filePath = path.join(DATA_DIR, 'all.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      
      console.log('Serving expired cache for all.json');
      return res.json({
        success: true,
        cached: false,
        expired: true,
        timestamp: parsed.timestamp,
        lastUpdated: parsed.lastUpdated,
        selectedAMCs: parsed.selectedAMCs,
        data: parsed.data
      });
    } catch (e) {
      // No file at all - trigger background scrape
      runScraper();
      return res.status(503).json({
        success: false,
        error: 'No data available. Scraping started in background. Please try again in a few minutes.'
      });
    }

  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get RMF fund data
 */
app.get('/api/funds/rmf', async (req, res) => {
  try {
    console.log('GET /api/funds/rmf');

    const cached = await getCachedData('rmf.json');

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        timestamp: cached.timestamp,
        selectedAMCs: cached.selectedAMCs,
        data: cached.data
      });
    }

    // Check if file exists (even if expired)
    try {
      const filePath = path.join(DATA_DIR, 'rmf.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      
      console.log('Serving expired cache for rmf.json');
      return res.json({
        success: true,
        cached: false,
        expired: true,
        timestamp: parsed.timestamp,
        selectedAMCs: parsed.selectedAMCs,
        data: parsed.data
      });
    } catch (e) {
      runScraper();
      return res.status(503).json({
        success: false,
        error: 'No RMF data available. Scraping started in background.'
      });
    }

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

    const cached = await getCachedData('tesg.json');

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        timestamp: cached.timestamp,
        selectedAMCs: cached.selectedAMCs,
        data: cached.data
      });
    }

    // Check if file exists (even if expired)
    try {
      const filePath = path.join(DATA_DIR, 'tesg.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      
      console.log('Serving expired cache for tesg.json');
      return res.json({
        success: true,
        cached: false,
        expired: true,
        timestamp: parsed.timestamp,
        selectedAMCs: parsed.selectedAMCs,
        data: parsed.data
      });
    } catch (e) {
      runScraper();
      return res.status(503).json({
        success: false,
        error: 'No ThaiESG data available. Scraping started in background.'
      });
    }

  } catch (error) {
    console.error('Error fetching ThaiESG data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Manually trigger scraping
 */
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('POST /api/scrape - Manual scrape triggered');

    // Run in background
    runScraper();

    res.json({
      success: true,
      message: 'Scraping started in background. Data will be available shortly.'
    });
  } catch (error) {
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
    // Check if data files exist and their age
    const files = ['rmf.json', 'tesg.json', 'all.json'];
    const status = {};

    for (const file of files) {
      try {
        const filePath = path.join(DATA_DIR, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        const age = Date.now() - parsed.timestamp;
        const isValid = age < CACHE_DURATION;
        
        status[file] = {
          exists: true,
          valid: isValid,
          age: Math.floor(age / 1000 / 60), // age in minutes
          lastUpdated: parsed.lastUpdated || new Date(parsed.timestamp).toISOString()
        };
      } catch (e) {
        status[file] = {
          exists: false,
          valid: false
        };
      }
    }

    res.json({
      status: 'ok',
      uptime: process.uptime(),
      cache: status
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Schedule daily scraping at 1 AM
cron.schedule('0 1 * * *', async () => {
  console.log('Running scheduled scrape at 1 AM...');
  await runScraper();
});

// Start server
app.listen(PORT, () => {
  console.log(`\n=== SarnFund Backend Server ===`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET  /api/funds/all  - Get all fund data (RMF + ThaiESG)`);
  console.log(`  GET  /api/funds/rmf  - Get RMF fund data`);
  console.log(`  GET  /api/funds/tesg - Get ThaiESG fund data`);
  console.log(`  POST /api/scrape     - Manually trigger data scraping`);
  console.log(`  GET  /api/health     - Health check and cache status`);
  console.log(`\nScheduled Tasks:`);
  console.log(`  Daily scrape at 1:00 AM`);
  console.log(`\nCache Duration: 24 hours`);
  console.log(`Data Directory: ${DATA_DIR}`);
  console.log(`===============================\n`);
});

export default app;
