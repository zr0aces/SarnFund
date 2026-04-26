import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SecApiClient,
  matchesFundType,
  runBatched,
} from './sec-api-connector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = path.join(__dirname, 'data');

const AMC_MAP = {
  KKPAM:      'KKP',
  KSAM:       'Krungsri',
  BBLAM:      'BBL',
  TISCOASSET: 'TISCO',
  SCBAM:      'SCB',
  KASSET:     'KAsset',
  KTAM:       'KTAM',
  ONEAM:      'ONE',
  UOBAM:      'UOB',
  PRINCIPAL:  'Principal',
  EASTSPRING: 'Eastspring',
  ASSETFUND:  'Asset Plus',
  DAOL:       'DAOL',
  KWI:        'KWI',
  LHFUND:     'LH Fund',
  MFC:        'MFC',
  TALIS:      'TALIS',
  XSPRING:    'XSpring',
};

const FUND_TYPES    = ['RMF', 'SSF', 'TESG', 'LTF'];
const REGISTRY_PATH = path.join(DATA_DIR, 'fund-registry.json');
const REGISTRY_TTL  = 7 * 24 * 60 * 60 * 1000; // 7 days
const BATCH_SIZE    = 5; // concurrent API calls

// ── Registry ──────────────────────────────────────────────────────────────────

async function loadRegistry() {
  try {
    const data = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
    if (Date.now() - (data.timestamp || 0) < REGISTRY_TTL) {
      console.log(`Using cached fund registry (${data.funds?.length ?? 0} funds)`);
      return data.funds || [];
    }
  } catch { /* no registry yet */ }
  return null;
}

async function saveRegistry(funds) {
  await fs.writeFile(REGISTRY_PATH, JSON.stringify({ timestamp: Date.now(), funds }, null, 2));
}

/**
 * Build the fund registry by:
 *   1. Getting all AMCs from the SEC API
 *   2. Fetching fund lists for target AMCs concurrently
 *   3. Fetching fund policies concurrently to identify RMF/SSF/TESG/LTF
 *
 * Expensive on first run; cached for 7 days afterwards.
 */
async function buildRegistry(client) {
  console.log('Building fund registry from SEC API…');

  const amcList = await client.getAmcList();
  if (!Array.isArray(amcList)) throw new Error('Unexpected AMC list response');

  const amcKeys = new Set(Object.keys(AMC_MAP).map((k) => k.toUpperCase()));
  const targetAmcs = amcList.filter((amc) => {
    const code = (amc.amc_id || '').toUpperCase();
    return amcKeys.has(code);
  });

  console.log(`Found ${targetAmcs.length} of ${amcList.length} target AMCs`);

  // Step 1: fetch all fund lists concurrently
  const fundListTasks = targetAmcs.map((amc) => async () => {
    const amcCode = (amc.amc_id || '').toUpperCase();
    const funds   = await client.getFundsByAmc(amc.unique_id);
    if (!Array.isArray(funds)) return null;
    const active = funds.filter((f) => f.fund_status === 'RG');
    console.log(`  ${amcCode}: ${active.length} active funds`);
    return { amc, amcCode, activeFunds: active };
  });

  const amcResults = await runBatched(fundListTasks, BATCH_SIZE);

  // Step 2: fetch policies for all active funds concurrently
  const policyTasks = [];
  for (const { amc, amcCode, activeFunds } of amcResults) {
    const displayName = AMC_MAP[amcCode] || amcCode;
    for (const fund of activeFunds) {
      policyTasks.push(async () => {
        const policy = await client.getFundPolicy(fund.proj_id);
        return { fund, policy, displayName };
      });
    }
  }

  console.log(`Fetching policies for ${policyTasks.length} funds…`);
  const policyResults = await runBatched(policyTasks, BATCH_SIZE);

  // Step 3: filter to target types
  const registry = [];
  for (const { fund, policy, displayName } of policyResults) {
    const fundType = FUND_TYPES.find((t) => matchesFundType(policy, t));
    if (!fundType) continue;

    registry.push({
      proj_id:   fund.proj_id,
      code:      fund.proj_abbr_name,
      name:      fund.proj_name_en || fund.proj_name_th || fund.proj_abbr_name,
      amc:       displayName,
      type:      fundType,
      riskLevel: policy?.risk_spectrum_id ?? 0,
    });
  }

  console.log(`Registry built: ${registry.length} target funds`);
  await saveRegistry(registry);
  return registry;
}

// ── NAV + performance fetch ───────────────────────────────────────────────────

async function fetchFundData(client, entry) {
  const { proj_id, code, name, amc, type, riskLevel } = entry;

  const result = await client.getLatestNav(proj_id);
  if (!result) return null;
  const { nav, navDate } = result;

  let perf = null;
  try {
    perf = await client.getFundPerformance(proj_id);
  } catch { /* non-fatal – returns 0s */ }

  return {
    id:        `fund_${Date.now()}_${code}`,
    code,
    name,
    amc,
    nav:       parseFloat(nav.last_val)  || 0,
    navDate,                                    // actual NAV date (YYYY-MM-DD)
    ytd:       parseFloat(perf?.ytd)     || 0,
    return3m:  parseFloat(perf?.month_3) || 0,
    return6m:  parseFloat(perf?.month_6) || 0,
    return1y:  parseFloat(perf?.year_1)  || 0,
    return2y:  0,
    return3y:  parseFloat(perf?.year_3)  || 0,
    return5y:  parseFloat(perf?.year_5)  || 0,
    risk:      parseInt(riskLevel)        || 0,
    type,
    isNew:     false,
    factsheetUrl: `https://www.sec.or.th/th/Pages/Fund/FundProjectDetail.aspx?PROJ_ID=${proj_id}`,
  };
}

// ── Main scrape ───────────────────────────────────────────────────────────────

export async function scrapeData() {
  console.log('Starting SEC API scrape…');
  await fs.mkdir(DATA_DIR, { recursive: true });

  const client = new SecApiClient(
    process.env.SEC_FACTSHEET_KEY,
    process.env.SEC_DAILYINFO_KEY
  );

  // Step 1: get or build registry
  let registry = await loadRegistry();
  if (!registry) registry = await buildRegistry(client);

  // Step 2: fetch NAV + performance for every fund concurrently
  const buckets = { RMF: [], SSF: [], TESG: [], LTF: [] };
  let succeeded = 0, failed = 0;

  const navTasks = registry.map((entry) => async () => {
    const data = await fetchFundData(client, entry);
    return data ? { entry, data } : null;
  });

  const navResults = await runBatched(navTasks, BATCH_SIZE);

  for (const r of navResults) {
    if (r?.data) {
      buckets[r.entry.type]?.push(r.data);
      succeeded++;
    } else {
      failed++;
    }
  }
  // Count failures from tasks that returned null
  failed += registry.length - navResults.length;

  const timestamp   = Date.now();
  const lastUpdated = new Date(timestamp).toISOString();
  const selectedAMCs = Object.values(AMC_MAP);

  // Step 3: write per-type and combined files
  const typeFileMap = { RMF: 'rmf', SSF: 'ssf', TESG: 'tesg', LTF: 'ltf' };
  await Promise.all(
    Object.entries(typeFileMap).map(([type, key]) =>
      fs.writeFile(
        path.join(DATA_DIR, `${key}.json`),
        JSON.stringify({ timestamp, lastUpdated, selectedAMCs, data: buckets[type] }, null, 2)
      )
    )
  );

  const result = {
    timestamp,
    lastUpdated,
    selectedAMCs,
    data: { rmf: buckets.RMF, tesg: buckets.TESG, ltf: buckets.LTF, ssf: buckets.SSF },
  };
  await fs.writeFile(path.join(DATA_DIR, 'all.json'), JSON.stringify(result, null, 2));

  console.log('\n=== Scrape Summary ===');
  console.log(`RMF:  ${buckets.RMF.length} funds`);
  console.log(`SSF:  ${buckets.SSF.length} funds`);
  console.log(`TESG: ${buckets.TESG.length} funds`);
  console.log(`LTF:  ${buckets.LTF.length} funds`);
  console.log(`Succeeded: ${succeeded}, Failed: ${failed}`);
  console.log('======================\n');

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeData()
    .then(() => process.exit(0))
    .catch((err) => { console.error('Fatal:', err.message); process.exit(1); });
}
