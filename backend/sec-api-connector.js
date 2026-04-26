/**
 * SEC Thailand Open Data API Connector
 *
 * Register and obtain subscription keys at:
 *   https://secopendata.sec.or.th/sec-open-apis
 *
 * Required subscriptions:
 *   - Fund Factsheet API  → SEC_FACTSHEET_KEY
 *   - Fund Daily Info API → SEC_DAILYINFO_KEY
 *
 * Rate limit: 3,000 calls / 300 s per key. We enforce 120 ms between calls.
 */

const BASE_URL = 'https://api.sec.or.th';
const REQUEST_DELAY_MS = 120;
const MAX_RETRIES = 3;

// Specification codes used in FundFactsheet policy responses.
export const FUND_SPEC_CODES = {
  RMF:  ['RMF'],
  SSF:  ['SSF'],
  TESG: ['ThaiESG', 'TESG', 'THAI_ESG'],
  LTF:  ['LTF'],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Rate limiter ──────────────────────────────────────────────────────────────
// Uses a promise chain so concurrent callers queue up correctly — no race
// condition where two simultaneous calls both read the same _last timestamp.
class RateLimiter {
  constructor(delayMs) {
    this._delay = delayMs;
    this._queue = Promise.resolve();
  }

  wait() {
    const slot = this._queue;
    // Extend the chain before returning, so the next caller waits after us.
    this._queue = this._queue.then(() => sleep(this._delay));
    return slot;
  }
}

// ── API client ────────────────────────────────────────────────────────────────
export class SecApiClient {
  /**
   * @param {string} factsheetKey  – Ocp-Apim-Subscription-Key for Fund Factsheet API
   * @param {string} dailyInfoKey  – Ocp-Apim-Subscription-Key for Fund Daily Info API
   */
  constructor(factsheetKey, dailyInfoKey) {
    if (!factsheetKey || !dailyInfoKey) {
      throw new Error(
        'Both SEC_FACTSHEET_KEY and SEC_DAILYINFO_KEY must be set. ' +
        'Subscribe at https://secopendata.sec.or.th/sec-open-apis'
      );
    }
    this._fsKey = factsheetKey;
    this._diKey = dailyInfoKey;
    this._fsRL  = new RateLimiter(REQUEST_DELAY_MS);
    this._diRL  = new RateLimiter(REQUEST_DELAY_MS);
  }

  async _get(url, key, rateLimiter, attempt = 0) {
    await rateLimiter.wait();
    const res = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Accept': 'application/json',
      },
    });

    if (res.status === 204) return null;
    if (res.status === 401) {
      throw new Error(`SEC API 401 – check subscription key for ${url}`);
    }
    // Handle both 421 (SEC-specific) and 429 (standard) rate-limit responses.
    if ((res.status === 421 || res.status === 429) && attempt < MAX_RETRIES) {
      const backoff = 1000 * (attempt + 1); // 1 s, 2 s, 3 s
      console.warn(`Rate limit hit (${res.status}), backing off ${backoff}ms…`);
      await sleep(backoff);
      return this._get(url, key, rateLimiter, attempt + 1);
    }
    if (!res.ok) throw new Error(`SEC API HTTP ${res.status} for ${url}`);
    return res.json();
  }

  // ── Fund Factsheet API ──────────────────────────────────────────────────────

  /** Returns array of { unique_id, amc_id, amc_name_th, amc_name_en } */
  getAmcList() {
    return this._get(`${BASE_URL}/FundFactsheet/fund/amc`, this._fsKey, this._fsRL);
  }

  /**
   * Returns array of fund summaries for an AMC.
   * Each item includes: proj_id, proj_abbr_name, proj_name_th, proj_name_en,
   *                     fund_status ('RG' = active), regis_date, …
   */
  getFundsByAmc(amcUniqueId) {
    return this._get(
      `${BASE_URL}/FundFactsheet/fund/amc/${amcUniqueId}`,
      this._fsKey, this._fsRL
    );
  }

  /**
   * Returns the fund policy / classification object.
   * Fields: typeCode, specification, risk_spectrum_id, …
   */
  getFundPolicy(projId) {
    return this._get(
      `${BASE_URL}/FundFactsheet/fund/${projId}/policy`,
      this._fsKey, this._fsRL
    );
  }

  /**
   * Returns performance metrics object.
   * Fields: ytd, month_3, month_6, year_1, year_3, year_5, …
   * Note: some fields were deprecated in Oct 2024 – callers should default to 0.
   */
  getFundPerformance(projId) {
    return this._get(
      `${BASE_URL}/FundFactsheet/fund/${projId}/performance`,
      this._fsKey, this._fsRL
    );
  }

  // ── Fund Daily Info API ─────────────────────────────────────────────────────

  /**
   * Returns daily NAV data for a fund on a given date.
   * @param {string} projId
   * @param {string} navDate – YYYY-MM-DD (Thai market date)
   * @returns {{ last_val, prev_val, change_val, change_percent, nav_date }} | null
   */
  getDailyNav(projId, navDate) {
    return this._get(
      `${BASE_URL}/FundDailyInfo/${projId}/dailynav/${navDate}`,
      this._diKey, this._diRL
    );
  }

  /**
   * Tries today (Thai timezone), then falls back up to `maxDaysBack` days.
   * Returns { nav, navDate } or null.
   */
  async getLatestNav(projId, maxDaysBack = 5) {
    for (let i = 0; i < maxDaysBack; i++) {
      const dateStr = thaiDateStr(i);
      const nav = await this.getDailyNav(projId, dateStr);
      if (nav && nav.last_val != null) return { nav, navDate: nav.nav_date || dateStr };
    }
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns YYYY-MM-DD in the Thai timezone (UTC+7), offset by `daysAgo`.
 */
export function thaiDateStr(daysAgo = 0) {
  const THAI_OFFSET_MS = 7 * 3600 * 1000;
  const d = new Date(Date.now() + THAI_OFFSET_MS - daysAgo * 86400000);
  return d.toISOString().slice(0, 10);
}

/**
 * Determine whether a policy object matches a given fund type.
 * Checks multiple possible field names since the API version may differ.
 */
export function matchesFundType(policy, fundType) {
  if (!policy) return false;
  const codes = FUND_SPEC_CODES[fundType] || [fundType];
  const candidates = [
    policy.typeCode,
    policy.type_code,
    policy.specification,
    policy.specificationCode,
    policy.fund_type_code,
    policy.abbr_name,
  ].filter(Boolean).map((v) => String(v).toUpperCase());

  return codes.some((c) => candidates.includes(c.toUpperCase()));
}

/**
 * Run async task functions with a bounded concurrency limit.
 * Returns an array of fulfilled values (rejected tasks are warned and skipped).
 */
export async function runBatched(tasks, concurrency = 5) {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const settled = await Promise.allSettled(batch.map((fn) => fn()));
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value != null) results.push(r.value);
      else if (r.status === 'rejected') console.warn('Batch task failed:', r.reason?.message);
    }
  }
  return results;
}
