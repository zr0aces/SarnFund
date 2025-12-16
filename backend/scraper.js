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
  RMF: 'https://www.settrade.com/th/mutualfund/screening?amcId=ALL&aimcType=ALL&specificationCode=RMF&percentageReturn=50&performancePeriod=1Y&dividendPolicy=N',
  TESG: 'https://www.settrade.com/th/mutualfund/screening?amcId=ALL&aimcType=ALL&specificationCode=TESG&percentageReturn=50&performancePeriod=1Y&dividendPolicy=N'
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
    // Wait for the table to load
    await page.waitForSelector('table, .fund-list, [class*="table"]', { timeout: 30000 });
    
    // Extract fund data - this will need to be adjusted based on actual page structure
    const funds = await page.evaluate(() => {
      const data = [];
      
      // Try to find the table with fund data
      const tables = document.querySelectorAll('table');
      let fundTable = null;
      
      // Find the table that contains fund data (usually has headers like "ชื่อกองทุน", "NAV", etc.)
      for (const table of tables) {
        const text = table.innerText.toLowerCase();
        if (text.includes('กองทุน') || text.includes('nav') || text.includes('ผลตอบแทน')) {
          fundTable = table;
          break;
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
      
      rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return;
        
        const fund = {
          id: `fund_${Date.now()}_${index}`,
          code: '',
          name: '',
          amc: '',
          nav: 0,
          ytd: 0,
          return1y: 0,
          return2y: 0,
          return3y: 0,
          return5y: 0,
          risk: 5,
          type: '',
          isNew: false
        };
        
        // Map cells to fund properties based on typical column positions
        // This is a best-effort approach - adjust based on actual structure
        cells.forEach((cell, i) => {
          const text = cell.innerText.trim();
          const header = headers[i] || '';
          
          // Fund code/name (usually first few columns)
          if (i === 0 || header.includes('รหัส') || header.includes('code')) {
            fund.code = text;
          } else if (i === 1 || header.includes('ชื่อ') || header.includes('name') || header.includes('กองทุน')) {
            fund.name = text;
          } else if (header.includes('บริษัท') || header.includes('amc') || header.includes('จัดการ')) {
            fund.amc = text;
          } else if (header.includes('nav')) {
            fund.nav = parseFloat(text.replace(/,/g, '')) || 0;
          } else if (header.includes('ytd')) {
            fund.ytd = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (header.includes('1') && (header.includes('ปี') || header.includes('year'))) {
            fund.return1y = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (header.includes('2') && (header.includes('ปี') || header.includes('year'))) {
            fund.return2y = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (header.includes('3') && (header.includes('ปี') || header.includes('year'))) {
            fund.return3y = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (header.includes('5') && (header.includes('ปี') || header.includes('year'))) {
            fund.return5y = parseFloat(text.replace(/%/g, '').replace(/,/g, '')) || 0;
          } else if (header.includes('ความเสี่ยง') || header.includes('risk')) {
            fund.risk = parseInt(text) || 5;
          }
        });
        
        // Normalize AMC name after all cells are processed
        if (!fund.amc && (fund.code || fund.name)) {
          // Try to extract AMC from code or name
          const source = fund.code || fund.name;
          fund.amc = normalizeAMC(source) || '';
        } else {
          fund.amc = normalizeAMC(fund.amc) || fund.amc;
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
      const amc = normalizeAMC(fund.amc || fund.code || fund.name);
      return amc && ['KKP', 'Krungsri', 'BBL', 'TISCO'].includes(amc);
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
    await rmfPage.goto(URLS.RMF, { waitUntil: 'networkidle', timeout: 60000 });
    await rmfPage.waitForTimeout(3000); // Wait for any dynamic content
    const rmfData = await scrapeFunds(rmfPage, 'RMF');
    await rmfPage.close();
    
    // Scrape TESG data
    const tesgPage = await context.newPage();
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
