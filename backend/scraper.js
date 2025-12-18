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
  'TISCOASSET': 'TISCO',
  'SCBAM': 'SCB',
  'KASSET': 'KAsset',
  'KTAM': 'KTAM',
  'ONEAM': 'ONE',
  'UOBAM': 'UOB',
  'PRINCIPAL': 'Principal',
  'EASTSPRING': 'Eastspring',
  'ASSETFUND': 'Asset Plus',
  'DAOL': 'DAOL',
  'KWI': 'KWI',
  'LHFUND': 'LH Fund',
  'MFC': 'MFC',
  'TALIS': 'TALIS',
  'XSPRING': 'XSpring'
};

/**
 * Process raw JSON data into the format expected by the frontend
 */
function processFunds(rawData) {
  let json;
  try {
    json = JSON.parse(rawData);
  } catch (e) {
    console.error('Error parsing JSON:', e.message);
    return [];
  }

  const fundsList = json.filterFunds || json;

  if (!Array.isArray(fundsList)) {
    console.log('Invalid data format: expected array, got', typeof fundsList);
    return [];
  }

  return fundsList
    .map((item, index) => {
      try {
        // Validate required fields exist
        if (!item || !item.overviewInfo) {
          console.warn(`Skipping item ${index}: missing overviewInfo`);
          return null;
        }

        const info = item.overviewInfo;
        const perf = item.performanceInfo || {};

        // Validate required fields
        if (!info.symbol || !info.amcCode) {
          console.warn(`Skipping item ${index}: missing symbol or amcCode`);
          return null;
        }

        const amcCode = info.amcCode;
        // Use mapped name if available, otherwise fallback to original code
        const myAmc = AMC_MAP[amcCode] || amcCode;

        return {
          id: `fund_${Date.now()}_${info.symbol}`,
          code: info.symbol,
          name: info.nameEn || info.name || 'Unknown',
          amc: myAmc,
          nav: parseFloat(perf.navPerUnit) || 0,
          ytd: parseFloat(perf.ytdPercentChange) || 0,
          return3m: parseFloat(perf.threeMonthPercentChange) || 0,
          return6m: parseFloat(perf.sixMonthPercentChange) || 0,
          return1y: parseFloat(perf.oneYearPercentChange) || 0,
          return2y: 0,
          return3y: parseFloat(perf.threeYearPercentChange) || 0,
          return5y: parseFloat(perf.fiveYearPercentChange) || 0,
          risk: parseInt(info.riskLevel) || 0,
          type: info.aimcType || '',
          isNew: false,
          factsheetUrl: `https://www.settrade.com/th/mutualfund/quote/${encodeURIComponent(info.symbol)}/overview`
        };
      } catch (error) {
        console.warn(`Error processing item ${index}:`, error.message);
        return null;
      }
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
    await execPromise(`sh ${scriptPath}`, { cwd: __dirname });

    console.log('Fetch completed. Processing data...');

    // Read the fetched files
    const rmfRaw = await fs.readFile(path.join(DATA_DIR, 'rmf-fetched.json'), 'utf8');
    const tesgRaw = await fs.readFile(path.join(DATA_DIR, 'tesg-fetched.json'), 'utf8');
    const ltfRaw = await fs.readFile(path.join(DATA_DIR, 'ltf-fetched.json'), 'utf8');
    const ssfRaw = await fs.readFile(path.join(DATA_DIR, 'ssf-fetched.json'), 'utf8');

    const rmfData = processFunds(rmfRaw);
    const tesgData = processFunds(tesgRaw);
    const ltfData = processFunds(ltfRaw);
    const ssfData = processFunds(ssfRaw);

    const timestamp = Date.now();
    const selectedAMCs = Object.values(AMC_MAP);

    const result = {
      timestamp,
      lastUpdated: new Date(timestamp).toISOString(),
      selectedAMCs,
      data: {
        rmf: rmfData,
        tesg: tesgData,
        ltf: ltfData,
        ssf: ssfData
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
      path.join(DATA_DIR, 'ltf.json'),
      JSON.stringify({ timestamp, selectedAMCs, data: ltfData }, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'ssf.json'),
      JSON.stringify({ timestamp, selectedAMCs, data: ssfData }, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'all.json'),
      JSON.stringify(result, null, 2)
    );

    console.log('\n=== Fetch Summary ===');
    console.log(`Processed RMF funds: ${rmfData.length}`);
    console.log(`Processed TESG funds: ${tesgData.length}`);
    console.log(`Processed LTF funds: ${ltfData.length}`);
    console.log(`Processed SSF funds: ${ssfData.length}`);
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
