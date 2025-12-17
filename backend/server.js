import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

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
 * Run generic python scraper
 */
async function runPythonScraper() {
  console.log('Starting Python scraper...');
  try {
    const { stdout, stderr } = await execPromise('python3 fetch_funds.py', { cwd: __dirname });
    console.log('Python script stdout:', stdout);
    if (stderr) console.error('Python script stderr:', stderr);
    return true;
  } catch (error) {
    console.error('Error running python script:', error);
    return false;
  }
}

/**
 * Get all fund data
 */
app.get('/api/funds/all', async (req, res) => {
  try {
    console.log('GET /api/funds/all');

    const cached = await getCachedData('all_funds.json');

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        ...cached
      });
    }

    // Should we trigger scrape if missing? 
    // Yes, but async to avoid timeout, or sync if critical?
    // Let's return 503 and trigger async if it's missing entirely.

    // Check if file exists at least (even if expired) to serve *something*
    try {
      const filePath = path.join(DATA_DIR, 'all_funds.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      // Serve expired data if no valid cache (better than nothing)
      return res.json({
        success: true,
        cached: false,
        expired: true,
        ...parsed
      });
    } catch (e) {
      // No file at all
      runPythonScraper(); // Trigger in background
      return res.status(503).json({
        success: false,
        error: 'No data available. Scraping started in background. Please try again later.'
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
 * Manually trigger scraping
 */
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('POST /api/scrape - Manual scrape triggered');

    runPythonScraper(); // Run in background

    res.json({
      success: true,
      message: 'Scraping started in background'
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
  res.json({ status: 'ok' });
});

// Schedule daily scraping at 1 AM
cron.schedule('0 1 * * *', async () => {
  console.log('Running scheduled scrape at 1 AM...');
  await runPythonScraper();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/funds/all  - Get all fund data`);
  console.log(`  POST /api/scrape     - Manually trigger scraping`);
  console.log(`  GET  /api/health     - Health check`);
});

export default app;
