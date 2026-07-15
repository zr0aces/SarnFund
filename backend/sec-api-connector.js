/**
 * SEC Thailand Open Data API v2 Connector
 *
 * Developer portal: https://secopendata.sec.or.th/sec-open-apis
 * (Old portal api-portal.sec.or.th discontinued June 30, 2026)
 *
 * Each API product issues a Primary Key and a Secondary Key:
 *   SEC_FACTSHEET_KEY / SEC_FACTSHEET_KEY_2  – Fund General Info + Factsheet API
 *   SEC_DAILYINFO_KEY / SEC_DAILYINFO_KEY_2  – Fund Daily Info API
 *
 * V2 changes from V1:
 *   - All endpoints moved to /v2/fund/...
 *   - Responses are cursor-paginated: { message, page_size, next_cursor, items[] }
 *   - AMC list: amc_id removed; match by comp_name_en/comp_name_th
 *   - Fund profiles: single endpoint replaces getFundsByAmc + getFundPolicy + more
 *   - Fund type: fund_class_tax_incentive_type in profiles (SSF/Thai ESG);
 *               spec_code in /specifications (RMF/LTF)
 *   - Fund status: 'Registered' | 'IPO' (was 'RG')
 *   - NAV: query params, not path params; sell/buy_price top-level (not in amc_info);
 *          change_val/change_percent removed
 *   - Performance: array of rows { reference_period, performance_value } (not flat object)
 *
 * Rate limit: 5,000 calls / 300 s per key; we enforce 120 ms between calls.
 */

const BASE_URL = 'https://api.sec.or.th';
const MAX_RETRIES = 10;

// SEC API rate limit: 5 000 requests per 300-second rolling window per key.
const RATE_LIMIT_MAX   = 5_000;
const RATE_LIMIT_WINDOW_MS = 300_000;
// Minimum gap between consecutive requests (300s / 5000 = 60ms).
// Prevents hammering even when the window has capacity.
const MIN_DELAY_MS = Math.ceil(RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX); // 60 ms
// Wait when the API returns 429/421 and Retry-After is absent or zero.
const RATE_LIMIT_FALLBACK_MS = RATE_LIMIT_WINDOW_MS + 10_000; // 310 s

// Spec codes checked against v2 /general-info/specifications items
export const FUND_SPEC_CODES = {
  RMF:  ['RMF'],
  SSF:  ['SSF'],
  ESG:  ['ThaiESG', 'TESG', 'THAI_ESG', 'Thai ESG'],
  ESGX: ['ThaiESGX', 'TESGX', 'THAI_ESGX', 'Thai ESGX', 'THAIESGX'],
  LTF:  ['LTF'],
  ETF:  ['ETFC', 'ETF'],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Sliding-window rate limiter (promise-chain serialised — no concurrent access).
 *
 * Tracks the timestamps of every request made in the last RATE_LIMIT_WINDOW_MS.
 * Before each request it:
 *   1. Evicts timestamps older than the window.
 *   2. If the window is full (≥ RATE_LIMIT_MAX), waits until the oldest entry ages out.
 *   3. Records the new timestamp.
 *   4. Enforces a minimum inter-request delay (MIN_DELAY_MS) to avoid bursty traffic.
 *
 * Callers use the same await-pattern as before: `await rateLimiter.wait()`.
 */
class RateLimiter {
  constructor(maxRequests = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS) {
    this._max    = maxRequests;
    this._window = windowMs;
    this._ts     = []; // sorted timestamps of requests within the current window
    this._queue  = Promise.resolve();
  }

  wait() {
    const slot   = this._queue;
    this._queue  = this._queue.then(() => this._acquire());
    return slot;
  }

  async _acquire() {
    while (true) {
      const now = Date.now();
      // Evict timestamps that have fallen outside the rolling window
      while (this._ts.length > 0 && now - this._ts[0] >= this._window) {
        this._ts.shift();
      }
      if (this._ts.length < this._max) {
        this._ts.push(Date.now());
        await sleep(MIN_DELAY_MS);
        return;
      }
      // Window is saturated — wait until the oldest request expires
      const waitMs = this._window - (now - this._ts[0]) + 50; // +50 ms safety margin
      console.warn(`Rate limiter: window full (${this._ts.length}/${this._max} in ${this._window / 1000}s), waiting ${Math.round(waitMs / 1000)}s…`);
      await sleep(waitMs);
    }
  }

  /** Current request count within the active window (for diagnostics). */
  get count() {
    const now = Date.now();
    return this._ts.filter(t => now - t < this._window).length;
  }
}

class SecApiClient {
  /**
   * @param {string} factsheetKey  – Fund General Info / Factsheet API primary key
   * @param {string} dailyInfoKey  – Fund Daily Info API primary key
   * @param {object} [opts]
   * @param {string} [opts.factsheetKey2] – secondary key (401 failover)
   * @param {string} [opts.dailyInfoKey2] – secondary key (401 failover)
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
    this._fsRL   = new RateLimiter(); // Factsheet API: 5000 req / 300s
    this._diRL   = new RateLimiter(); // Daily Info API: 5000 req / 300s
  }

  async _get(url, primaryKey, secondaryKey, rateLimiter, attempt = 0) {
    await rateLimiter.wait();
    
    let res;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      res = await fetch(url, {
        headers: {
          'Ocp-Apim-Subscription-Key': primaryKey,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s, 4s, 8s... plus a random jitter up to 1s
        const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`Network error or timeout for ${url} (${err.message}). Retrying ${attempt + 1}/${MAX_RETRIES} in ${(backoff / 1000).toFixed(1)}s…`);
        await sleep(backoff);
        return this._get(url, primaryKey, secondaryKey, rateLimiter, attempt + 1);
      }
      throw err;
    } finally {
      timeoutId && clearTimeout(timeoutId);
    }

    if (res.status === 204) return null;

    if (res.status === 401) {
      if (secondaryKey) {
        console.warn(`Primary key returned 401, retrying with secondary key for ${url}`);
        return this._get(url, secondaryKey, null, rateLimiter, 0);
      }
      throw new Error(`SEC API 401 – check subscription key for ${url}`);
    }

    if ((res.status === 421 || res.status === 429) && attempt < MAX_RETRIES) {
      const retryAfterSec = parseInt(res.headers.get('Retry-After') || '0', 10);
      // Only trust Retry-After if it's at least 5 s — the API sometimes sends "1"
      // which is too short for a 300-second rate-limit window.
      const backoff = retryAfterSec >= 5 ? retryAfterSec * 1000 : RATE_LIMIT_FALLBACK_MS;
      const waitSec = Math.round(backoff / 1000);
      console.warn(`Rate limit (${res.status}), waiting ${waitSec}s before retry ${attempt + 1}/${MAX_RETRIES}…`);
      await sleep(backoff);
      return this._get(url, primaryKey, secondaryKey, rateLimiter, attempt + 1);
    }

    // Handle transient 5xx server errors
    if (res.status >= 500 && res.status < 600 && attempt < MAX_RETRIES) {
      const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      console.warn(`SEC API HTTP ${res.status} for ${url}. Retrying ${attempt + 1}/${MAX_RETRIES} in ${(backoff / 1000).toFixed(1)}s…`);
      await sleep(backoff);
      return this._get(url, primaryKey, secondaryKey, rateLimiter, attempt + 1);
    }

    if (!res.ok) throw new Error(`SEC API HTTP ${res.status} for ${url}`);
    return res.json();
  }

  // Fetches all pages of a v2 cursor-paginated endpoint, returns combined items[].
  async _getAllPages(baseUrl, params, key, secondaryKey, rateLimiter) {
    const items = [];
    let cursor = '';
    do {
      const qp = new URLSearchParams({ page_size: '100', ...params });
      if (cursor) qp.set('next_cursor', cursor);
      const data = await this._get(`${baseUrl}?${qp}`, key, secondaryKey, rateLimiter);
      if (!data?.items) {
        if (cursor) console.warn(`Unexpected null/empty response mid-pagination at ${baseUrl} (cursor present)`);
        break;
      }
      items.push(...data.items);
      cursor = data.next_cursor || '';
    } while (cursor);
    return items;
  }

  // ── Fund General Info API (v2) ────────────────────────────────────────────
  // Subscription key: SEC_FACTSHEET_KEY

  /**
   * GET /v2/fund/general-info/amcs
   * Returns: items[].{ unique_id, comp_name_th, comp_name_en, last_upd_date }
   * Note: amc_id field removed in v2 — match AMCs by comp_name_en/th.
   */
  getAmcList() {
    return this._getAllPages(
      `${BASE_URL}/v2/fund/general-info/amcs`,
      {},
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  /**
   * GET /v2/fund/general-info/profiles
   * Replaces: getFundsByAmc() + getFundPolicy() + searchFunds() (all merged in v2)
   *
   * @param {object} params - query filters:
   *   company_info: unique_id (exact) or partial comp_name_en/th (partial search)
   *   fund_status:  'Registered' | 'IPO' | 'Expired' | 'Canceled' | 'Liquidated'
   *   project_info: exact proj_id OR partial proj_name/abbr
   *   fund_class_name: unit class name filter
   *
   * Returns: items[].{
   *   unique_id, comp_name_th, comp_name_en,
   *   proj_id, proj_name_th, proj_name_en, proj_abbr_name,
   *   fund_status, fund_class_name, fund_class_tax_incentive_type ('SSF'|'Thai ESG'|null),
   *   policy_desc, management_style, ...
   * }
   */
  getFundProfiles(params = {}) {
    return this._getAllPages(
      `${BASE_URL}/v2/fund/general-info/profiles`,
      params,
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  /**
   * GET /v2/fund/general-info/specifications
   * Replaces: getFundPolicy() for RMF/LTF type detection
   *
   * Returns: items[].{ proj_id, fund_class_name, spec_code, spec_desc, last_upd_date }
   * Use matchesFundType(item, 'RMF') to check spec_code against known codes.
   */
  getFundSpecifications(projId) {
    return this._getAllPages(
      `${BASE_URL}/v2/fund/general-info/specifications`,
      { proj_id: projId },
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  // ── Fund Factsheet API (v2) ───────────────────────────────────────────────
  // Subscription key: SEC_FACTSHEET_KEY

  /**
   * GET /v2/fund/factsheet/performance
   * Use latest=true to get only the current factsheet's performance data.
   *
   * Returns: items[].{
   *   proj_id, fund_class_name, prospectus_type,
   *   performance_type_desc, reference_period, performance_value
   * }
   * Use parsePerformanceV2(items) in scraper.js to map to flat { ytd, month_3, ... }.
   */
  getFundPerformance(projId) {
    return this._getAllPages(
      `${BASE_URL}/v2/fund/factsheet/performance`,
      { proj_id: projId, latest: 'true' },
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  /**
   * GET /v2/fund/factsheet/urls
   * Returns: items[].{ proj_id, fund_class_name, amc_url_factsheet, pdf_factsheet, as_of_date }
   */
  getFundUrls(projId) {
    return this._getAllPages(
      `${BASE_URL}/v2/fund/factsheet/urls`,
      { proj_id: projId, latest: 'true' },
      this._fsKey, this._fsKey2, this._fsRL
    );
  }

  // ── Fund Daily Info API (v2) ──────────────────────────────────────────────
  // Subscription key: SEC_DAILYINFO_KEY

  /**
   * GET /v2/fund/daily-info/nav
   * Replaces: getDailyNav(projId, navDate) path-param style
   *
   * V2 changes:
   *   - sell_price / buy_price are TOP-LEVEL fields (not nested under amc_info)
   *   - change_val / change_percent NOT available (removed in v2)
   *   - HTTP 204 gone; empty date returns items: []
   *
   * @param {string} projId
   * @param {string} navDate – YYYY-MM-DD in Thai market timezone
   * @param {string} [fundClass] – optional unit class filter (e.g. 'A', 'D', 'I')
   *
   * Returns: items[].{
   *   proj_id, nav_date, fund_class_name,
   *   net_asset, last_val, unique_id,
   *   sell_price, buy_price, sell_swap_price, buy_swap_price,
   *   last_upd_date
   * }
   */
  getDailyNav(projId, startNavDate, endNavDate = null, fundClass = null) {
    let actualEnd = endNavDate;
    let actualClass = fundClass;

    // Support flexible signature: if third arg is not a date, it is the fundClass
    if (endNavDate && !/^\d{4}-\d{2}-\d{2}$/.test(endNavDate)) {
      actualEnd = startNavDate;
      actualClass = endNavDate;
    } else if (!endNavDate) {
      actualEnd = startNavDate;
    }

    const params = {
      proj_id: projId,
      start_nav_date: startNavDate,
      end_nav_date: actualEnd
    };
    if (actualClass && actualClass !== 'main') params.fund_class_name = actualClass;

    return this._getAllPages(
      `${BASE_URL}/v2/fund/daily-info/nav`,
      params,
      this._diKey, this._diKey2, this._diRL
    );
  }

  /**
   * GET /v2/fund/daily-info/dividend-history
   * Returns: items[].{ unique_id, proj_id, class_abbr_name, book_close_date, dividend_date, dividend_value }
   */
  getDividendHistory(projId) {
    return this._getAllPages(
      `${BASE_URL}/v2/fund/daily-info/dividend-history`,
      { proj_id: projId },
      this._diKey, this._diKey2, this._diRL
    );
  }

  /**
   * Tries today (Thai timezone), then falls back up to maxDaysBack days.
   * Returns { nav, navDate } or null.
   *
   * @param {string} projId
   * @param {number} [maxDaysBack=5]
   * @param {string} [fundClass] – pass fund_class_name from registry to filter multi-class results
   */
  async getLatestNav(projId, maxDaysBack = 5, fundClass = null) {
    const startDateStr = thaiDateStr(maxDaysBack - 1);
    const endDateStr = thaiDateStr(0);

    let items = await this.getDailyNav(projId, startDateStr, endDateStr, fundClass);

    // Fallback: If no items found for the specific class, try without class filter
    if ((!items || items.length === 0) && fundClass) {
      items = await this.getDailyNav(projId, startDateStr, endDateStr, null);
    }

    if (Array.isArray(items) && items.length > 0) {
      const validItems = items.filter(
        (nav) => nav.last_val != null && nav.last_val !== '-' && numVal(nav.last_val) > 0
      );

      if (validItems.length > 0) {
        // Sort by nav_date descending to get the latest entry
        validItems.sort((a, b) => b.nav_date.localeCompare(a.nav_date));
        const nav = validItems[0];
        return {
          nav,
          navDate: nav.nav_date
        };
      }
    }
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns YYYY-MM-DD in the Thai timezone (UTC+7), offset by daysAgo.
 */
export function thaiDateStr(daysAgo = 0) {
  const THAI_OFFSET_MS = 7 * 3600 * 1000;
  const d = new Date(Date.now() + THAI_OFFSET_MS - daysAgo * 86400000);
  return d.toISOString().slice(0, 10);
}

/**
 * Safe numeric parse. API may return "-" for empty values.
 * Returns fallback (default 0) for null, undefined, "-", "", or NaN.
 */
export function numVal(v, fallback = 0) {
  if (v == null || v === '-' || v === '') return fallback;
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

/**
 * Check whether a spec/policy object matches a given fund type.
 * Works with both v2 spec items ({ spec_code, spec_desc }) and v1 policy objects.
 */
export function matchesFundType(spec, fundType) {
  if (!spec) return false;
  const codes = FUND_SPEC_CODES[fundType] || [fundType];
  const candidates = [
    spec.spec_code,         // v2: /general-info/specifications
    spec.spec_desc,         // v2: /general-info/specifications
    spec.typeCode,          // v1 legacy
    spec.type_code,         // v1 legacy
    spec.specification,     // v1 legacy
    spec.specificationCode, // v1 legacy
    spec.fund_type_code,    // v1 legacy
    spec.abbr_name,         // v1 legacy
  ].filter((v) => v != null && v !== '-').map((v) => String(v).toUpperCase());
  return codes.some((c) => candidates.includes(c.toUpperCase()));
}

/**
 * Run async task functions with a bounded concurrency limit.
 * Rejected tasks are warned and skipped.
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

function parsePerformanceV2(rows) {
  const out = { ytd: 0, month_3: 0, month_6: 0, year_1: 0, year_3: 0, year_5: 0 };
  for (const row of rows || []) {
    const typeDesc = row.performance_type_desc || '';
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

// Concrete adapter for SecConnector interface
export class HttpSecAdapter {
  constructor(factsheetKey, dailyInfoKey, opts = {}) {
    this._client = new SecApiClient(factsheetKey, dailyInfoKey, opts);
  }

  async getAmcList() {
    return this._client.getAmcList();
  }

  async getFundProfiles(companyUniqueId, fundStatus) {
    return this._client.getFundProfiles({ company_info: companyUniqueId, fund_status: fundStatus });
  }

  async getSpecifications(projId) {
    return this._client.getFundSpecifications(projId);
  }

  async getLatestNav(projId, maxDaysBack = 15, fundClass = null) {
    return this._client.getLatestNav(projId, maxDaysBack, fundClass);
  }

  async getFundPerformance(projId) {
    const rows = await this._client.getFundPerformance(projId);
    return parsePerformanceV2(rows);
  }
}

