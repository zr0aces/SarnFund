import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

// URLs to scrape
const URLS = {
  RMF: 'https://www.settrade.com/th/mutualfund/screening?amcId=ALL&aimcType=ALL&specificationCode=RMF&performancePeriod=1Y',
  TESG: 'https://www.settrade.com/th/mutualfund/screening?amcId=ALL&aimcType=ALL&specificationCode=TESG'
};

// Selected AMCs to include in the data
const SELECTED_AMCS = ['KKP', 'Krungsri', 'BBL', 'TISCO'];

// AMC name mapping for normalization
const AMC_NAME_MAP = {
  'เกียรตินาคินภัทร': 'KKP',
  'KKP': 'KKP',
  'กรุงศรี': 'Krungsri',
  'Krungsri': 'Krungsri',
  'KFUND': 'Krungsri',
  'กรุงเทพ': 'BBL',
  'บัวหลวง': 'BBL',
  'Bualuang': 'BBL',
  'BBL': 'BBL',
  'Bangkok Bank': 'BBL',
  'ทิสโก้': 'TISCO',
  'TISCO': 'TISCO',
  'Tisco': 'TISCO'
};

/**
 * Normalize AMC name to standard format
 */
function normalizeAMC(name) {
  if (!name) return null;

  // Try exact match first
  for (const [key, value] of Object.entries(AMC_NAME_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return value;
    }
  }

  // Try to extract from fund code/name
  const upperName = name.toUpperCase();
  if (upperName.includes('KKP') || upperName.includes('เกียรติ')) return 'KKP';
  if (upperName.includes('KRUNGSRI') || upperName.includes('กรุงศรี') || upperName.includes('KF')) return 'Krungsri';
  if (upperName.includes('BBL') || upperName.includes('บัวหลวง') || upperName.includes('BUALUANG') || upperName.startsWith('B-') || upperName.match(/^B[A-Z]/)) return 'BBL';
  if (upperName.includes('TISCO') || upperName.includes('ทิสโก้')) return 'TISCO';

  return null;
}

/**
 * Filter funds by selected AMCs
 */
function filterBySelectedAMCs(funds) {
  return funds.filter(fund => {
    const normalizedAMC = normalizeAMC(fund.amc || fund.code || fund.name);
    return normalizedAMC && SELECTED_AMCS.includes(normalizedAMC);
  });
}

/**
 * Parse fund data from the page
 */
async function scrapeFunds(page, fundType) {
  console.log(`Scraping ${fundType} funds...`);

  try {
    // Wait for the table data to load and ensure it has content
    await page.waitForFunction(
      () => {
        const cells = document.querySelectorAll('table tbody tr td');
        return cells.length > 0 && cells[0].innerText.trim().length > 0;
      },
      { timeout: 30000 }
    );

    // Auto-scroll to load all data
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // Extract fund data - this will need to be adjusted based on actual page structure
    const funds = await page.evaluate(() => {
      const data = [];

      // Try to find the table with fund data
      const tables = document.querySelectorAll('table');
      let fundTable = null;

      // Find the table that contains fund data (usually has headers like "ชื่อกองทุน", "NAV", etc.)
      for (const table of tables) {
        const text = table.innerText.toLowerCase();
        // Strict check: must contain both NAV and Fund Name/Code
        if ((text.includes('กองทุน') || text.includes('fund') || text.includes('name')) && text.includes('nav')) {
          fundTable = table;
          break;
        } else {
          console.log('Skipped table with text length:', text.length, text.substring(0, 50));
        }
      }

      if (!fundTable) {
        console.error('Could not find fund table');
        return [];
      }

      // Get headers to map columns
      const headers = [];
      const headerRow = fundTable.querySelector('thead tr, tr:first-child');
      if (headerRow) {
        headerRow.querySelectorAll('th, td').forEach(cell => {
          headers.push(cell.innerText.trim().toLowerCase());
        });
      }

      // Get data rows
      const rows = fundTable.querySelectorAll('tbody tr, tr:not(:first-child)');

      console.log('Detected headers:', headers);

      let loggedFirstRow = false;
      rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        // Skip invalid rows or mobile layout rows
        if (cells.length < 5) return;

        if (!loggedFirstRow) {
          console.log('ROW RAW:', row.innerText);
          const cellTexts = Array.from(cells).map((c, i) => `[${i}]${c.innerText.trim()}`);
          console.log('ROW CELLS:', cellTexts.join(' | '));
          loggedFirstRow = true;
        }

        const fund = {
          id: `fund_${Date.now()}_${index}`,
          code: '',
          return3m: 0,
          return6m: 0,
          return1y: 0,
          return2y: 0,
          return3y: 0,
          return5y: 0,
          risk: 5,
          type: '',
          isNew: false
        };

        // Find Link Column -> Code
        let linkColumnIndex = -1;
        cells.forEach((cell, i) => {
          const link = cell.querySelector('a');
          if (link && link.href && linkColumnIndex === -1 && cell.innerText.trim().length > 0) {
            linkColumnIndex = i;
            fund.factsheetUrl = link.href;
            fund.code = cell.innerText.trim();
            // If previous column was empty or likely checkbox/rank, assumes this is name too
            if (!fund.name) fund.name = fund.code;
          }
        });

        // Loop again for other data based on position relative to Link
        // Structure: [0]Code [1]Code [2]Combined [3]AMC [4]NAV [5]Ccy [6]Date [7]AllReturns [8]YTD [9]3M [10]6M [11]1Y [12]3Y [13]5Y [14]10Y [15]SinceInc

        cells.forEach((cell, i) => {
          const text = cell.innerText.trim();

          if (i === linkColumnIndex + 3) {
            fund.amc = text;
          } else if (i === linkColumnIndex + 4) {
            fund.nav = parseFloat(text.replace(/,/g, '')) || 0;
          } else if (i === linkColumnIndex + 8) {
            fund.ytd = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (i === linkColumnIndex + 9) {
            // 3M
            fund.return3m = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (i === linkColumnIndex + 10) {
            // 6M
            fund.return6m = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (i === linkColumnIndex + 11) {
            fund.return1y = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (i === linkColumnIndex + 12) {
            // 3Y
            fund.return3y = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (i === linkColumnIndex + 13) {
            fund.return5y = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (text.match(/^[1-8]$/)) {
            // Risk usually single digit
            fund.risk = parseInt(text);
          }
        });

        // Normalize URL if it's relative
        if (fund.factsheetUrl && !fund.factsheetUrl.startsWith('http')) {
          fund.factsheetUrl = `https://www.settrade.com${fund.factsheetUrl.startsWith('/') ? '' : '/'}${fund.factsheetUrl}`;
        }

        // Helper to normalize AMC name inside browser context
        const normalizeAMCInBrowser = (name) => {
          if (!name) return null;
          const upperName = name.toUpperCase();
          if (upperName.includes('KKP') || upperName.includes('เกียรติ')) return 'KKP';
          if (upperName.includes('KRUNGSRI') || upperName.includes('กรุงศรี') || upperName.includes('KF')) return 'Krungsri';
          if (upperName.includes('BBL') || upperName.includes('บัวหลวง') || upperName.includes('BUALUANG') || upperName.startsWith('B-') || upperName.match(/^B[A-Z]/)) return 'BBL';
          if (upperName.includes('TISCO') || upperName.includes('ทิสโก้')) return 'TISCO';
          return null;
        };

        // Normalize AMC name after all cells are processed
        if (!fund.amc && (fund.code || fund.name)) {
          // Try to extract AMC from code or name
          const source = fund.code || fund.name;
          fund.amc = normalizeAMCInBrowser(source) || '';
        } else {
          fund.amc = normalizeAMCInBrowser(fund.amc) || fund.amc;
        }

        // Only add if we have at least a code or name
        if (fund.code || fund.name) {
          data.push(fund);
        }
      });

      return data;
    });

    console.log(`Found ${funds.length} ${fundType} funds`);

    // Filter by selected AMCs
    const filteredFunds = funds.filter(fund => {
      // Logic inside browser already normalized, but let's double check or just trust amc field
      // The normalizeAMC function is outside scope, need to reuse or rely on string match
      const amcs = ['KKP', 'Krungsri', 'BBL', 'TISCO'];
      return fund.amc && amcs.includes(fund.amc);
    });

    console.log(`After filtering by AMCs (KKP, Krungsri, BBL, TISCO): ${filteredFunds.length} funds`);
    return filteredFunds;

  } catch (error) {
    console.error(`Error scraping ${fundType}:`, error);
    return [];
  }
}

/**
 * Main scraping function
 */
async function scrapeData() {
  console.log('Starting scraper...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'th-TH'
    });

    // Scrape RMF data
    const rmfPage = await context.newPage();
    rmfPage.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await rmfPage.goto(URLS.RMF, { waitUntil: 'networkidle', timeout: 60000 });
    await rmfPage.waitForTimeout(3000); // Wait for any dynamic content
    const rmfData = await scrapeFunds(rmfPage, 'RMF');
    await rmfPage.close();

    // Scrape TESG data
    const tesgPage = await context.newPage();
    tesgPage.on('console', msg => console.log('TESG PAGE LOG:', msg.text()));
    await tesgPage.goto(URLS.TESG, { waitUntil: 'networkidle', timeout: 60000 });
    await tesgPage.waitForTimeout(3000);
    const tesgData = await scrapeFunds(tesgPage, 'TESG');
    await tesgPage.close();

    await context.close();

    // Save data with timestamp
    const timestamp = Date.now();
    const result = {
      timestamp,
      lastUpdated: new Date(timestamp).toISOString(),
      selectedAMCs: SELECTED_AMCS,
      data: {
        rmf: rmfData,
        tesg: tesgData
      }
    };

    // Save individual files
    await fs.writeFile(
      path.join(DATA_DIR, 'rmf.json'),
      JSON.stringify({ timestamp, selectedAMCs: SELECTED_AMCS, data: rmfData }, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'tesg.json'),
      JSON.stringify({ timestamp, selectedAMCs: SELECTED_AMCS, data: tesgData }, null, 2)
    );

    // Save combined file
    await fs.writeFile(
      path.join(DATA_DIR, 'all.json'),
      JSON.stringify(result, null, 2)
    );

    console.log('\n=== Scraping Summary ===');
    console.log(`Selected AMCs: ${SELECTED_AMCS.join(', ')}`);
    console.log(`RMF funds: ${rmfData.length}`);
    console.log(`TESG funds: ${tesgData.length}`);
    console.log(`Total funds: ${rmfData.length + tesgData.length}`);
    console.log('========================\n');

    return result;

  } catch (error) {
    console.error('Scraping failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeData()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { scrapeData, normalizeAMC, SELECTED_AMCS };
