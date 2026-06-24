import fs from 'fs/promises';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SecApiClient,
  matchesFundType,
  numVal,
  runBatched,
} from './sec-api-connector.js';

// Load .env if present (checks parent directory first, then local directory)
const envPaths = [
  new URL('../.env', import.meta.url).pathname,
  new URL('.env', import.meta.url).pathname
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = path.join(__dirname, 'data');

// Single source of truth for AMC identity — display name + name-match regex in one entry.
// v2 AMC list has no amc_id, so we match by comp_name_en / comp_name_th.
// Adding an AMC here is the only change needed: display and pattern stay in sync.
const AMC_REGISTRY = {
  KKPAM:      { display: 'KKP',        pattern: /kiatnakin|\bkkp\b/i },
  KSAM:       { display: 'Krungsri',   pattern: /krungsri/i },
  BBLAM:      { display: 'BBL',        pattern: /\bbbl\b/i },
  TISCOASSET: { display: 'TISCO',      pattern: /tisco/i },
  SCBAM:      { display: 'SCB',        pattern: /\bscb\b/i },
  KASSET:     { display: 'KAsset',     pattern: /kasikorn|k\s*asset/i },
  KTAM:       { display: 'KTAM',       pattern: /krung\s*thai/i },
  ONEAM:      { display: 'ONE',        pattern: /one\s*asset/i },
  UOBAM:      { display: 'UOB',        pattern: /\buob\b/i },
  PRINCIPAL:  { display: 'Principal',  pattern: /principal/i },
  EASTSPRING: { display: 'Eastspring', pattern: /eastspring/i },
  ASSETFUND:  { display: 'Asset Plus', pattern: /asset\s*plus/i },
  DAOL:       { display: 'DAOL',       pattern: /\bdaol\b/i },
  KWI:        { display: 'KWI',        pattern: /\bkwi\b/i },
  LHFUND:     { display: 'LH Fund',    pattern: /land\s*(and|&)\s*house|lh\s*fund/i },
  MFC:        { display: 'MFC',        pattern: /\bmfc\b/i },
  TALIS:      { display: 'TALIS',      pattern: /talis/i },
  XSPRING:    { display: 'XSpring',    pattern: /xspring/i },
};

function matchAmcCode(compNameEn = '', compNameTh = '') {
  const combined = `${compNameEn} ${compNameTh}`;
  for (const [code, { pattern }] of Object.entries(AMC_REGISTRY)) {
    if (pattern.test(combined)) return code;
  }
  return null;
}

/**
 * Detect SSF / ESG / ESGX from the v2 profiles endpoint field.
 * RMF and ETF are NOT in fund_class_tax_incentive_type — they need a specs call.
 *
 * The API returns full Thai descriptions, not short codes:
 *   SSF:     "กองทุนรวมเพื่อการออม (Super Savings Fund : SSF)"
 *   ThaiESG: "กองทุนรวมไทยเพื่อความยั่งยืน (Thailand ESG Fund : Thai ESG)"
 * Use substring matching against the uppercased value.
 */
function fundTypeFromTaxIncentive(profile) {
  const raw = (profile.fund_class_tax_incentive_type || '').trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper.includes('SSF')) return 'SSF';
  // Check ESGX before ESG so 'THAIESGX' substring doesn't fall into the ESG branch
  if (upper.includes('THAIESGX') || upper.includes('THAI ESGX')) return 'ESGX';
  if (upper.includes('THAIESG') || upper.includes('THAI ESG') || upper.includes('THAILAND ESG')) return esgSubtype(profile);
  return null;
}

// When the API returns a Thai ESG incentive, check fund name/class for 'ESGX' suffix
// to distinguish ThaiESG from ThaiESGX (SEC uses the same incentive type for both).
function esgSubtype(profile) {
  const code = (profile.proj_abbr_name || '').toUpperCase();
  const cls  = (profile.fund_class_name || '').toUpperCase();
  if (/ESGX|TESGX/.test(code) || /ESGX|TESGX/.test(cls)) return 'ESGX';
  return 'ESG';
}

/**
 * Map v2 performance rows to the flat shape the frontend expects.
 * reference_period values vary (Thai/English); match flexibly.
 */
function parsePerformanceV2(rows) {
  const out = { ytd: 0, month_3: 0, month_6: 0, year_1: 0, year_3: 0, year_5: 0 };
  for (const row of rows || []) {
    const typeDesc = row.performance_type_desc || '';
    // Only parse actual fund returns, not benchmark returns, peer averages, or volatility/risk metrics
    if (!/ผลตอบแทนกองทุนรวม|Fund Return/i.test(typeDesc)) continue;

    const p = row.reference_period || '';
    const v = numVal(row.performance_value);
    if (/ytd|ต้นปี|year.to.date/i.test(p))        out.ytd     = v;
    else if (/3\s*(m|month|เดือน)/i.test(p))       out.month_3 = v;
    else if (/6\s*(m|month|เดือน)/i.test(p))       out.month_6 = v;
    else if (/^1\s*(y|year|ปี)/i.test(p))          out.year_1  = v;
    else if (/3\s*(y|year|ปี)/i.test(p))           out.year_3  = v;
    else if (/5\s*(y|year|ปี)/i.test(p))           out.year_5  = v;
  }
  return out;
}

// To add a new fund type: add its name here and handle detection in fundTypeFromTaxIncentive()
// or via a spec_code in sec-api-connector.js FUND_SPEC_CODES.
const FUND_TYPES = ['RMF', 'SSF', 'ESG', 'ESGX', 'ETF'];
// ESG/ESGX: many funds have null incentive_type — require spec lookup (TESG/TESGX spec_code).
// Funds with the "Thai ESG" incentive string are caught in Phase 2; null-incentive ones fall here.
const SPEC_LOOKUP_TYPES = ['RMF', 'ESG', 'ESGX', 'ETF'];
const REGISTRY_PATH  = path.join(DATA_DIR, 'fund-registry.json');
const PROGRESS_PATH  = path.join(DATA_DIR, '.registry-progress.json');
const REGISTRY_TTL   = 7 * 24 * 60 * 60 * 1000;
const PROGRESS_TTL   = 24 * 60 * 60 * 1000;  // discard stale progress after 24h
const BATCH_SIZE     = 5;

// ── Registry ──────────────────────────────────────────────────────────────────

async function loadRegistry() {
  try {
    const data = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
    if (Date.now() - (data.timestamp || 0) < REGISTRY_TTL) {
      // Normalize legacy TESG → ESG from registries built before the rename
      const funds = (data.funds || []).map((f) => f.type === 'TESG' ? { ...f, type: 'ESG' } : f);
      console.log(`Using cached fund registry (${funds.length} funds)`);
      return funds;
    }
  } catch { /* no registry yet */ }
  return null;
}

async function saveRegistry(funds) {
  await fs.writeFile(REGISTRY_PATH, JSON.stringify({ timestamp: Date.now(), funds }, null, 2));
}

// Deduplicate by proj_id only: one fund project = one registry entry.
// Phase-2 entries (classified by tax_incentive_type) appear first in the list and are kept;
// Phase-3 entries for the same proj_id are silently dropped.
function deduplicateRegistry(entries) {
  const seen = new Set();
  return entries.filter((e) => {
    if (seen.has(e.proj_id)) return false;
    seen.add(e.proj_id);
    return true;
  });
}

// Progress checkpoint for spec-lookup phase — survives crashes / rate-limit kills
async function loadProgress() {
  try {
    const data = JSON.parse(await fs.readFile(PROGRESS_PATH, 'utf8'));
    if (Date.now() - (data.timestamp || 0) > PROGRESS_TTL) return null;
    return data;
  } catch { return null; }
}

async function saveProgress(partialRegistry, pendingProfiles) {
  await fs.writeFile(
    PROGRESS_PATH,
    JSON.stringify({ timestamp: Date.now(), partialRegistry, pendingProfiles }, null, 2)
  );
}

async function clearProgress() {
  try { await fs.unlink(PROGRESS_PATH); } catch { /* already gone */ }
}

/**
 * Build the fund registry using SEC API v2:
 *
 * Phase 1 — AMC matching
 *   getAmcList() → match 18 target AMCs by name (no amc_id in v2)
 *
 * Phase 2 — Fund profiles (replaces getFundsByAmc + getFundPolicy)
 *   getFundProfiles({ company_info: unique_id, fund_status: 'Registered' })
 *   SSF and TESG are detected from fund_class_tax_incentive_type in the profile.
 *
 * Phase 3 — Spec lookups for RMF / LTF
 *   getFundSpecifications(proj_id) → check spec_code against FUND_SPEC_CODES
 */
async function buildRegistry(client) {
  console.log('Building fund registry from SEC API v2…');

  let partialRegistry = [];
  let unknownProfiles;

  // Resume from checkpoint if a previous run was interrupted (rate-limit, crash, etc.)
  const progress = await loadProgress();
  if (progress?.pendingProfiles?.length > 0) {
    console.log(
      `Resuming from checkpoint: ${progress.partialRegistry.length} entries done, ` +
      `${progress.pendingProfiles.length} spec lookups remaining…`
    );
    partialRegistry = progress.partialRegistry;
    unknownProfiles = progress.pendingProfiles;
  } else {
    // Phase 1: get AMC list and match target AMCs by name
    const amcList = await client.getAmcList();
    if (!Array.isArray(amcList) || amcList.length === 0)
      throw new Error('AMC list returned empty — aborting to protect existing registry');

    const matchedCount = amcList.filter(
      (amc) => matchAmcCode(amc.comp_name_en, amc.comp_name_th)
    ).length;
    console.log(`Found ${matchedCount} target AMCs among ${amcList.length} total SEC AMCs`);
    if (matchedCount === 0)
      throw new Error(`No target AMCs matched from ${amcList.length} SEC AMCs — check AMC_REGISTRY patterns`);

    // Phase 2: fetch profiles for ALL AMCs (Registered + IPO).
    // ThaiESG/ThaiESGX/SSF are detected from fund_class_tax_incentive_type across all AMCs.
    // IPO status captures newly launched funds not yet marked Registered.
    const profileTasks = amcList.map((amc) => async () => {
      const amcCode     = matchAmcCode(amc.comp_name_en, amc.comp_name_th);
      const displayName = amcCode
        ? AMC_REGISTRY[amcCode].display
        : (amc.comp_name_en || amc.comp_name_th || 'Unknown').trim();
      const [registered, ipo] = await Promise.all([
        client.getFundProfiles({ company_info: amc.unique_id, fund_status: 'Registered' }),
        client.getFundProfiles({ company_info: amc.unique_id, fund_status: 'IPO' }),
      ]);
      const total = registered.length + ipo.length;
      if (total > 0) console.log(`  ${displayName}: ${registered.length} registered + ${ipo.length} IPO`);
      return [...registered, ...ipo].map((p) => ({ ...p, amcCode, displayName }));
    });

    const amcResults = await runBatched(profileTasks, BATCH_SIZE);
    const allProfiles = amcResults.flat();

    // Phase 3 prep: classify by tax incentive (all AMCs) vs unknown (target AMCs only for spec lookup)
    unknownProfiles = [];
    for (const profile of allProfiles) {
      const fundType = fundTypeFromTaxIncentive(profile);
      if (fundType) {
        partialRegistry.push(profileToEntry(profile, fundType));
      } else if (profile.amcCode) {
        // Only target AMC unknowns get the expensive spec lookup (for RMF/ETF)
        unknownProfiles.push(profile);
      }
    }

    // Save checkpoint before the expensive spec-lookup phase
    if (unknownProfiles.length > 0) {
      await saveProgress(partialRegistry, unknownProfiles);
    }
  }

  // Phase 3: spec lookups for potential RMF/ETF (target AMCs only), checkpointed after each batch
  if (unknownProfiles.length > 0) {
    console.log(`Fetching specifications for ${unknownProfiles.length} potential RMF/ETF funds…`);
    for (let i = 0; i < unknownProfiles.length; i += BATCH_SIZE) {
      const batch = unknownProfiles.slice(i, i + BATCH_SIZE);
      const batchTasks = batch.map((profile) => async () => {
        const specs    = await client.getFundSpecifications(profile.proj_id);
        const fundType = SPEC_LOOKUP_TYPES.find((t) => specs.some((s) => matchesFundType(s, t)));
        return fundType ? profileToEntry(profile, fundType) : null;
      });
      const batchResults = await runBatched(batchTasks, BATCH_SIZE);
      for (const entry of batchResults) {
        if (entry) partialRegistry.push(entry);
      }

      const remaining = unknownProfiles.slice(i + BATCH_SIZE);
      if (remaining.length > 0) {
        await saveProgress(partialRegistry, remaining);
        console.log(`  ${i + batch.length}/${unknownProfiles.length} specs checked…`);
      }
    }
  }

  await clearProgress();
  const registry = deduplicateRegistry(partialRegistry);
  if (registry.length < partialRegistry.length)
    console.log(`Deduplication removed ${partialRegistry.length - registry.length} duplicate entries`);
  console.log(`Registry built: ${registry.length} target funds`);
  await saveRegistry(registry);
  return registry;
}

function profileToEntry(profile, fundType) {
  // fund_class_name is 'main' for single-class funds; store null in that case
  const cls = (profile.fund_class_name && profile.fund_class_name !== 'main')
    ? profile.fund_class_name.trim() : null;
  return {
    proj_id:   profile.proj_id,
    code:      (profile.proj_abbr_name || '').trim(),
    name:      (profile.proj_name_en || profile.proj_name_th || profile.proj_abbr_name || '').trim(),
    amc:       (profile.displayName || '').trim(),
    type:      fundType,
    class:     cls,
    // riskLevel: available at /v2/fund/factsheet/risk-spectrum (separate call)
    riskLevel: 0,
  };
}

// ── NAV + performance fetch ───────────────────────────────────────────────────

async function fetchFundData(client, entry) {
  const { proj_id, code, name, amc, type, class: fundClass, riskLevel } = entry;

  const result = await client.getLatestNav(proj_id, 5, fundClass);
  if (!result) return null;
  const { nav, navDate } = result;

  let perf = null;
  try {
    const perfRows = await client.getFundPerformance(proj_id);
    perf = parsePerformanceV2(perfRows);
  } catch (err) { console.warn(`Performance fetch failed for ${proj_id}:`, err.message); }

  // v2 NAV: sell_price / buy_price are top-level (not nested under amc_info)
  // change_val / change_percent not available in v2 daily-info/nav
  return {
    id:               `fund_${Date.now()}_${code}`,
    code,
    name,
    amc,
    class:            fundClass,
    nav:              numVal(nav.last_val),
    navDate,
    navChange:        0,                       // not available in SEC API v2
    navChangePercent: 0,                       // not available in SEC API v2
    netAsset:         numVal(nav.net_asset),
    sellPrice:        numVal(nav.sell_price),  // v2: top-level (was amc_info.sell_price)
    buyPrice:         numVal(nav.buy_price),   // v2: top-level (was amc_info.buy_price)
    ytd:              perf?.ytd     ?? 0,
    return3m:         perf?.month_3 ?? 0,
    return6m:         perf?.month_6 ?? 0,
    return1y:         perf?.year_1  ?? 0,
    return2y:         0,                       // not available from SEC API
    return3y:         perf?.year_3  ?? 0,
    return5y:         perf?.year_5  ?? 0,
    risk:             numVal(riskLevel),
    type,
    isNew:            false,
    factsheetUrl: `https://www.sec.or.th/th/Pages/Fund/FundProjectDetail.aspx?PROJ_ID=${proj_id}`,
  };
}

// ── Main scrape ───────────────────────────────────────────────────────────────

export async function scrapeData() {
  console.log('Starting SEC API v2 scrape…');
  await fs.mkdir(DATA_DIR, { recursive: true });

  const client = new SecApiClient(
    process.env.SEC_FACTSHEET_KEY,
    process.env.SEC_DAILYINFO_KEY,
    {
      factsheetKey2: process.env.SEC_FACTSHEET_KEY_2,
      dailyInfoKey2: process.env.SEC_DAILYINFO_KEY_2,
    }
  );

  // Step 1: get or build registry
  let registry = await loadRegistry();
  if (!registry) registry = await buildRegistry(client);

  // Step 2: fetch NAV + performance for every fund concurrently
  const buckets = Object.fromEntries(FUND_TYPES.map((t) => [t, []]));
  let succeeded = 0, failed = 0;

  const navTasks = registry.map((entry) => async () => {
    const data = await fetchFundData(client, entry);
    return data ? { entry, data } : null;
  });

  const navResults = await runBatched(navTasks, BATCH_SIZE);

  for (const r of navResults) {
    if (!r || !r.data) continue;
    // Filter funds with no valid NAV (zero means no price data available)
    if (!r.data.nav || r.data.nav === 0) {
      console.warn(`Skipping ${r.data.code} — no NAV data`);
      continue;
    }
    buckets[r.entry.type]?.push(r.data);
    succeeded++;
  }
  failed = registry.length - succeeded;

  // Sort each bucket by fund code for consistent, diffable output
  for (const bucket of Object.values(buckets)) {
    bucket.sort((a, b) => a.code.localeCompare(b.code));
  }

  const timestamp   = Date.now();
  const lastUpdated = new Date(timestamp).toISOString();
  const selectedAMCs = Object.values(AMC_REGISTRY).map(({ display }) => display);

  // Step 3: write per-type and combined files (file key = type lowercase)
  await Promise.all(
    FUND_TYPES.map((type) =>
      fs.writeFile(
        path.join(DATA_DIR, `${type.toLowerCase()}.json`),
        JSON.stringify({ timestamp, lastUpdated, selectedAMCs, data: buckets[type] }, null, 2)
      )
    )
  );

  const result = {
    timestamp,
    lastUpdated,
    selectedAMCs,
    data: Object.fromEntries(FUND_TYPES.map((t) => [t.toLowerCase(), buckets[t]])),
  };
  await fs.writeFile(path.join(DATA_DIR, 'all.json'), JSON.stringify(result, null, 2));

  console.log('\n=== Scrape Summary ===');
  for (const type of FUND_TYPES) {
    console.log(`${type}: ${buckets[type].length} funds`);
  }
  console.log(`Succeeded: ${succeeded}, Failed: ${failed}`);
  console.log('======================\n');

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--refresh') || process.argv.includes('--force')) {
    try {
      await fs.unlink(REGISTRY_PATH);
      console.log('Registry cache cleared — will rebuild from SEC API.');
    } catch { /* file didn't exist */ }
  }
  scrapeData()
    .then(() => process.exit(0))
    .catch((err) => { console.error('Fatal:', err.message); process.exit(1); });
}
