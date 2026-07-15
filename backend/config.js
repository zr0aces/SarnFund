import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present (checks parent directory first, then local directory)
const envPaths = [
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '.env')
];

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
    break; // Load first valid .env found
  }
}

const DATA_DIR = process.env.DATA_DIR || (
  existsSync(path.join(__dirname, '..', 'data'))
    ? path.join(__dirname, '..', 'data')
    : path.join(__dirname, 'data')
);

const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    corsOrigin: process.env.CORS_ORIGIN || '*',
    scrapeToken: process.env.SCRAPE_TOKEN || null,
  },
  sec: {
    factsheetKey: process.env.SEC_FACTSHEET_KEY,
    factsheetKey2: process.env.SEC_FACTSHEET_KEY_2 || null,
    dailyInfoKey: process.env.SEC_DAILYINFO_KEY,
    dailyInfoKey2: process.env.SEC_DAILYINFO_KEY_2 || null,
  },
  storage: {
    dataDir: DATA_DIR,
    cacheDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    registryTtlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    progressTtlMs: 24 * 60 * 60 * 1000, // 24 hours
  }
};

export default config;
