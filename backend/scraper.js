import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

// Selected AMCs to include
const AMC_MAP = {
  'KKPAM': 'KKP',
  'KSAM': 'Krungsri',
  'BBLAM': 'BBL',
  'TISCOASSET': 'TISCO'
};

/**
 * Process raw JSON data into the format expected by the frontend
 */
function processFunds(rawData) {
  let json;
  try {
    json = JSON.parse(rawData);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return [];
  }

  const fundsList = json.filterFunds || json;

  if (!Array.isArray(fundsList)) {
    console.log('Invalid data format');
    return [];
  }

  return fundsList
    .map(item => {
      const info = item.overviewInfo;
      const perf = item.performanceInfo || {};

      const amcCode = info.amcCode;
      const myAmc = AMC_MAP[amcCode];

      if (!myAmc) return null;

      return {
        id: `fund_${Date.now()}_${info.symbol}`,
        code: info.symbol,
        name: info.nameEn || info.name,
        amc: myAmc,
        nav: perf.navPerUnit,
        ytd: perf.ytdPercentChange || 0,
        return3m: perf.threeMonthPercentChange || 0,
        return6m: perf.sixMonthPercentChange || 0,
        return1y: perf.oneYearPercentChange || 0,
        return2y: 0,
        return3y: perf.threeYearPercentChange || 0,
        return5y: perf.fiveYearPercentChange || 0,
        risk: parseInt(info.riskLevel) || 0,
        type: info.aimcType || '',
        isNew: false,
        factsheetUrl: `https://www.settrade.com/th/mutualfund/quote/${info.symbol}/overview`
      };
    })
    .filter(f => f !== null);
}

/**
 * Main scraping function (now uses curl via shell script)
 */
async function scrapeData() {
  console.log('Starting API fetch (curl)...');

  // Ensure data directory exists
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    // Run the shell script that handles the curl commands
    // The script is now in the same directory as this file
    const scriptPath = path.resolve(__dirname, 'refetch_funds_v2.sh');
    console.log(`Executing ${scriptPath}...`);

    // Run from current directory so that "data" in the script resolves correctly to backend/data
    await execPromise(`bash ${scriptPath}`, { cwd: __dirname });

    console.log('Fetch completed. Processing data...');

    // Read the fetched files
    const rmfRaw = await fs.readFile(path.join(DATA_DIR, 'rmf-fetched.json'), 'utf8');
    const tesgRaw = await fs.readFile(path.join(DATA_DIR, 'tesg-fetched.json'), 'utf8');

    const rmfData = processFunds(rmfRaw);
    const tesgData = processFunds(tesgRaw);

    const timestamp = Date.now();
    const selectedAMCs = Object.values(AMC_MAP);

    const result = {
      timestamp,
      lastUpdated: new Date(timestamp).toISOString(),
      selectedAMCs,
      data: {
        rmf: rmfData,
        tesg: tesgData
      }
    };

    // Save processed files
    await fs.writeFile(
      path.join(DATA_DIR, 'rmf.json'),
      JSON.stringify({ timestamp, selectedAMCs, data: rmfData }, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'tesg.json'),
      JSON.stringify({ timestamp, selectedAMCs, data: tesgData }, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'all.json'),
      JSON.stringify(result, null, 2)
    );

    console.log('\n=== Fetch Summary ===');
    console.log(`Processed RMF funds: ${rmfData.length}`);
    console.log(`Processed TESG funds: ${tesgData.length}`);
    console.log('=====================\n');

    return result;

  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
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

export { scrapeData };
