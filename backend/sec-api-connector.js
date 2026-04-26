/**
 * SEC Thailand Open Data API Connector
 *
 * Developer portal: https://secopendata.sec.or.th/sec-open-apis
 * (Old portal api-portal.sec.or.th discontinued June 30, 2026)
 *
 * Each API product subscription provides a Primary Key and a Secondary Key.
 * Required env vars:
 *   SEC_FACTSHEET_KEY    – Fund Factsheet API primary key
 *   SEC_FACTSHEET_KEY_2  – Fund Factsheet API secondary key (optional, 401 failover)
 *   SEC_DAILYINFO_KEY    – Fund Daily Info API primary key
 *   SEC_DAILYINFO_KEY_2  – Fund Daily Info API secondary key (optional, 401 failover)
 *
 * API v2 behaviour: empty fields are returned as "-" (dash) rather than null.
 * Use numVal() to parse numeric fields safely.
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
   * @param {string} factsheetKey   – Primary key for Fund Factsheet API
   * @param {string} dailyInfoKey   – Primary key for Fund Daily Info API
   * @param {object} [opts]
   * @param {string} [opts.factsheetKey2] – Secondary key for Fund Factsheet API (401 failover)
   * @param {string} [opts.dailyInfoKey2] – Secondary key for Fund Daily Info API (401 failover)
   */
  constructor(factsheetKey, dailyInfoKey, { factsheetKey2, dailyInfoKey2 } = {}) {
    if (!factsheetKey || !dailyInfoKey) {
      throw new Error(
        'Both SEC_FACTSHEET_KEY and SEC_DAILYINFO_KEY must be set. ' +
        'Subscribe at https://secopendata.sec.or.th/sec-open-apis'
      );
    }
    this._fsKey  = factsheetKey;
    this._fsKey2 = factsheetKey2 || null;
    this._diKey  = dailyInfoKey;
    this._diKey2 = dailyInfoKey2 || null;
    this._fsRL   = new RateLimiter(REQUEST_DELAY_MS);
    this._diRL   = new RateLimiter(REQUEST_DELAY_MS);
  }

  /**
   * Makes a GET request, automatically failing over to the secondary key on 401.
   * The secondary key slot is cleared on retry so we never loop beyond one failover.
   */
  async _get(url, primaryKey, secondaryKey, rateLimiter, attempt = 0) {
    await rateLimiter.wait();
    const res = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': primaryKey,
        'Accept': 'application/json',
      },
    });

    if (res.status === 204) return null;

    if (res.status === 401) {
      if (secondaryKey) {
        console.warn(`Primary key returned 401, retrying with secondary key for ${url}`);
        return this._get(url, secondaryKey, null, rateLimiter, 0);
      }
      throw new Error(`SEC API 401 – check subscription key for ${url}`);
    }

    // Handle both 421 (SEC-specific) and 429 (standard) rate-limit responses.
    if ((res.status === 421 || res.status === 429) && attempt < MAX_RETRIES) {
      const backoff = 1000 * (attempt + 1); // 1 s, 2 s, 3 s
      console.warn(`Rate limit hit (${res.status}), backing off ${backoff}ms…`);
      await sleep(backoff);
      return this._get(url, primaryKey, secondaryKey, rateLimiter, attempt + 1);
    }

    if (!res.ok) throw new Error(`SEC API HTTP ${res.status} for ${url}`);
    return res.json();
  }

  /**
   * Makes a POST request with JSON body. Shares the same auth/retry logic as _get.
   */
  async _post(url, body, primaryKey, secondaryKey, rateLimiter, attempt = 0) {
    await rateLimiter.wait();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': primaryKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.status === 204) return null;

    if (res.status === 401) {
      if (secondaryKey) {
        console.warn(`Primary key returned 401, retrying with secondary key for ${url}`);
        return this._post(url, body, secondaryKey, null, rateLimiter, 0);
      }
      throw new Error(`SEC API 401 – check subscription key for ${url}`);
    }

    if ((res.status === 421 || res.status === 429) && attempt < MAX_RETRIES) {
      const backoff = 1000 * (attempt + 1);
      console.warn(`Rate limit hit (${res.status}), backing off ${backoff}ms…`);
      await sleep(backoff);
      return this._post(url, body, primaryKey, secondaryKey, rateLimiter, attempt + 1);
    }

    if (!res.ok) throw new Error(`SEC API HTTP ${res.status} for ${url}`);
    return res.json();
  }

  // ── Fund Factsheet API ──────────────────────────────────────────────────────

  /**
   * Returns array of AMC objects.
   * Fields: unique_id, amc_id, amc_name_th, amc_name_en
   */
  getAmcList() {
    return this._get(`${BASE_URL}/FundFactsheet/fund/amc`, this._fsKey, this._fsKey2, this._fsRL);
  }

  /**
   * Returns array of fund summaries for an AMC.
   * Fields: proj_id, proj_abbr_name, proj_name_th, proj_name_en,
   *         fund_status ('RG' = active), regis_date, cancel_date,
   *         class_abbr_name (unit class e.g. 'A'/'D'/'I'), unique_id
   */
  getFundsByAmc(amcUniqueId) {
    return this._get(
      `${BASE_URL}/FundFactsheet/fund/amc/${amcUniqueId}`,
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  /**
   * Search funds by name.
   * @param {string} name – partial fund name to search
   * @returns {Array} matching fund objects
   */
  searchFunds(name) {
    return this._post(
      `${BASE_URL}/FundFactsheet/fund`,
      { name },
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  /**
   * Returns the fund policy / classification object.
   * Fields: typeCode, type_code, specification, specificationCode, fund_type_code,
   *         risk_spectrum_id (1–8), abbr_name
   * Empty fields returned as "-" in API v2.
   */
  getFundPolicy(projId) {
    return this._get(
      `${BASE_URL}/FundFactsheet/fund/${projId}/policy`,
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  /**
   * Returns performance metrics object.
   * Fields: ytd, month_3, month_6, year_1, year_3, year_5
   * Note: return estimates and buy-and-hold projections removed Oct 2024.
   * Fields may return "-" — use numVal() to parse.
   */
  getFundPerformance(projId) {
    return this._get(
      `${BASE_URL}/FundFactsheet/fund/${projId}/performance`,
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  /**
   * Returns factsheet and annual report URLs for a fund.
   * Fields: factsheet_url, annual_report_url
   */
  getFundUrls(projId) {
    return this._get(
      `${BASE_URL}/FundFactsheet/fund/${projId}/URLs`,
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  // ── Fund Daily Info API ─────────────────────────────────────────────────────

  /**
   * Returns list of AMCs participating in the Fund Daily Info API.
   * Fields: unique_id, amc_id, amc_name_th, amc_name_en
   */
  getDailyInfoAmcs() {
    return this._get(`${BASE_URL}/FundDailyInfo/amc`, this._diKey, this._diKey2, this._diRL);
  }

  /**
   * Returns daily NAV data for a fund on a given date.
   * HTTP 204 = no data for that date (weekend / holiday / not yet published).
   *
   * @param {string} projId
   * @param {string} navDate – YYYY-MM-DD in Thai market timezone
   * @returns {{
   *   nav_date: string,
   *   last_val: number|"-",      – NAV per unit (THB)
   *   prev_val: number|"-",      – Previous business day NAV
   *   change_val: number|"-",    – Absolute day-over-day change
   *   change_percent: number|"-",– Percentage day-over-day change
   *   net_asset: number|"-",     – Total net assets (THB)
   *   last_upd_date: string,
   *   unique_id: string,         – Added July 2025
   *   class_abbr_name: string,   – Unit class e.g. "A" — added July 2025
   *   amc_info: {
   *     sell_price: number|"-",
   *     buy_price: number|"-",
   *     sell_swap_price: number|"-",
   *     buy_swap_price: number|"-",
   *     remark_th: string
   *   }
   * }} | null
   */
  getDailyNav(projId, navDate) {
    return this._get(
      `${BASE_URL}/FundDailyInfo/${projId}/dailynav/${navDate}`,
      this._diKey, this._diKey2, this._diRL
    );
  }

  /**
   * Returns dividend payment history for a fund.
   * Fields: book_closing_date, dividend_details, unique_id, class_abbr_name
   * @param {string} projId
   */
  getDividendHistory(projId) {
    return this._get(
      `${BASE_URL}/FundDailyInfo/${projId}/dividend`,
      this._diKey, this._diKey2, this._diRL
    );
  }

  /**
   * Tries today (Thai timezone), then falls back up to `maxDaysBack` days.
   * Returns { nav, navDate } or null.
   * HTTP 204 and "-" values (API v2 null convention) are both treated as no data.
   */
  async getLatestNav(projId, maxDaysBack = 5) {
    for (let i = 0; i < maxDaysBack; i++) {
      const dateStr = thaiDateStr(i);
      const nav = await this.getDailyNav(projId, dateStr);
      if (nav && nav.last_val != null && nav.last_val !== '-') {
        return { nav, navDate: nav.nav_date || dateStr };
      }
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
 * Safe numeric parse. API v2 returns "-" for empty values instead of null.
 * Returns fallback (default 0) for null, undefined, "-", "", or NaN.
 */
export function numVal(v, fallback = 0) {
  if (v == null || v === '-' || v === '') return fallback;
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

/**
 * Determine whether a policy object matches a given fund type.
 * Checks multiple possible field names since the API version may differ.
 * Excludes "-" values (API v2 uses "-" instead of null for empty fields).
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
  ].filter((v) => v != null && v !== '-').map((v) => String(v).toUpperCase());

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
