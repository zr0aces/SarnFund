# Implementation Summary

## Overview

SarnFund v2.0 replaces the previous Settrade.com scraper with the **official SEC Thailand Open Data API v2**. The old approach used `curl` with hardcoded session cookies — cookies expire silently and the Settrade API is undocumented and subject to change without notice. The new connector uses proper subscription-key authentication, returns richer metadata (including the actual NAV date per fund), and is far more reliable.

---

## Backend

### `sec-api-connector.js`

The SEC API client. Wraps two API products with separate rate limiters.

**Authentication**

```
Header: Ocp-Apim-Subscription-Key: <key>
```

Two separate keys are required:
- `SEC_FACTSHEET_KEY` — for the Fund Factsheet API (static fund metadata)
- `SEC_DAILYINFO_KEY` — for the Fund Daily Info API (daily NAV prices)

**Rate limiting**

```
SEC limit:  3,000 calls / 300 seconds per key
Enforced:   120 ms between calls (≈ 8 calls/sec)
Retry:      exponential backoff on 421/429 — 1 s, 2 s, 3 s (max 3 attempts)
```

The `RateLimiter` class uses a **promise-chain queue** so concurrent callers cannot bypass the delay by reading the same timestamp simultaneously.

**Key endpoints used**

| Endpoint | API product | Purpose |
|----------|------------|---------|
| `GET /FundFactsheet/fund/amc` | Factsheet | List all AMCs |
| `GET /FundFactsheet/fund/amc/{unique_id}` | Factsheet | List funds for one AMC |
| `GET /FundFactsheet/fund/{proj_id}/policy` | Factsheet | Fund type + risk level |
| `GET /FundFactsheet/fund/{proj_id}/performance` | Factsheet | YTD, 3M, 6M, 1Y, 3Y, 5Y returns |
| `GET /FundDailyInfo/{proj_id}/dailynav/{YYYY-MM-DD}` | Daily Info | NAV per unit for a date |

**Thai timezone**

The NAV endpoint requires a Thai-market date. `thaiDateStr(daysAgo)` adds the UTC+7 offset before producing the date string, preventing the midnight off-by-one error that `toISOString()` would cause.

**Concurrent batch helper**

`runBatched(tasks, concurrency=5)` runs async task functions in groups of 5. Failed tasks are warned and skipped; their absence does not abort the whole batch. This is used both in registry build (policy fetches) and in the daily NAV loop.

---

### `scraper.js`

Implements two-phase scraping.

#### Phase 1 — Fund registry (weekly, ~2–5 min first time)

```
getAmcList()
    └─ filter to 18 target AMCs (AMC_MAP)
        └─ getFundsByAmc() [batched ×5]
            └─ filter fund_status === 'RG' (active)
                └─ getFundPolicy() [batched ×5]
                    └─ matchesFundType() → RMF | SSF | TESG | LTF
                        └─ save: data/fund-registry.json (TTL 7 days)
```

`matchesFundType()` checks multiple possible field names (`typeCode`, `type_code`, `specification`, `specificationCode`, `fund_type_code`) because the API version may use different naming. TESG aliases: `ThaiESG`, `TESG`, `THAI_ESG`.

#### Phase 2 — Daily NAV fetch (daily, fast)

```
loadRegistry()  ← from fund-registry.json
    └─ getLatestNav() [batched ×5]
        └─ tries today, yesterday, … up to 5 days back (handles weekends/holidays)
        └─ getFundPerformance() [non-fatal if missing]
            └─ assemble fund object with navDate
                └─ write rmf.json, tesg.json, ltf.json, ssf.json, all.json
```

File writes are parallelised with `Promise.all`.

#### Fund object structure

```js
{
  id:          string,    // "fund_{timestamp}_{code}"
  code:        string,    // SEC proj_abbr_name  e.g. "KPRMF"
  name:        string,    // English name
  amc:         string,    // display name from AMC_MAP e.g. "KKP"
  nav:         number,    // last_val from dailynav
  navDate:     string,    // "YYYY-MM-DD" — actual SEC NAV date
  ytd:         number,    // % from performance endpoint
  return3m:    number,
  return6m:    number,
  return1y:    number,
  return2y:    0,         // not available from SEC API
  return3y:    number,
  return5y:    number,
  risk:        number,    // risk_spectrum_id (1–8)
  type:        string,    // "RMF" | "SSF" | "TESG" | "LTF"
  isNew:       false,
  factsheetUrl: string,   // https://www.sec.or.th/…?PROJ_ID=…
}
```

---

### `server.js`

Express API server. Key changes from v1:

- **`.env` loading** — reads `backend/.env` at startup using Node's built-in `fs.readFileSync`; no `dotenv` dependency
- **Scrape endpoint protection** — `POST /api/scrape` checks `X-Scrape-Token` header against `SCRAPE_TOKEN` env var; warns at startup if token is unset
- **Logic order fix** — token check runs before cache check, so `?force=true` actually bypasses the cache
- **`DELETE /api/registry`** — removes `fund-registry.json` so the next scrape rebuilds it
- **Extended health check** — reports `secApi.factsheetKey`, `secApi.dailyInfoKey`, `registry.funds`, `registry.lastBuilt`, and cache validity for all four fund types

---

## Frontend

### `useFundData.js`

Custom React hook for data fetching and caching.

**Cache key**: `fund_cache_v4_{fundType}` (bumped from v3 to bust old entries)

**Mount behaviour**:
1. Read localStorage — if valid (< 24 h old), render immediately and silently fetch from backend
2. Silent fetch only updates state if `server.timestamp > cached.timestamp` — prevents a slow background response from overwriting newer data already displayed
3. If no valid cache and no mock data, shows loading state and fetches synchronously

**`refresh()`**:
- Clears localStorage for the current fund type
- Resets the in-flight timestamp guard
- Calls `fetchDataFromAPI(silent=false)` — shows the loading spinner

**`lastUpdated`** is now stored as an ISO string from the server (`result.lastUpdated`) rather than a locale time string, so the component can format it however it needs.

---

### `DashboardLayout.jsx`

- Computes `latestNavDate` from `Math.max` of all `fund.navDate` values in the current fund list
- Displays **"NAV as of YYYY-MM-DD"** badge (green) and **"Fetched DD Mon YYYY, HH:MM"** (grey)
- **Update Data** button calls `refresh()` from the hook — no `window.location.reload()`

### `FundTable.jsx`

- Factsheet link label: **"SEC"** (was "Settrade") — URL now points to `sec.or.th`

---

## Infrastructure

### `docker-compose.yml`

The project architecture has been consolidated into a two-service setup:
- **`nginx` service**: Acts as the unified gateway. It builds the React frontend, serves static assets, and reverse proxies `/api` requests to the backend. It uses the root `nginx/default.conf` for configuration.
- **`backend` service**: Runs the Express API and scraper. It is isolated from direct external access and communicates only with the Nginx service.

Environment variables from `backend/.env` are injected into the backend container to provide API keys and secrets.


### `backend/.env.example`

Documents all required and optional environment variables:

```
SEC_FACTSHEET_KEY   required  — Fund Factsheet API subscription key
SEC_DAILYINFO_KEY   required  — Fund Daily Info API subscription key
SCRAPE_TOKEN        required  — protects POST /api/scrape
PORT                optional  — default 3001
CORS_ORIGIN         optional  — restrict CORS in production
```

---

## Removed

| Item | Reason |
|------|--------|
| `refetch_funds_v2.sh` | Replaced by `sec-api-connector.js`; used hardcoded Settrade cookies |
| `rmf-fetched.json` etc. | Stale 0-byte intermediary files from the old shell script |
| `getFundInfo()` method | Unused; fund name and risk come from registry |
| `todayDateStr()` export | Superseded by `thaiDateStr()` which also applies UTC+7 offset |

---

## Supported AMCs (18)

`KKPAM`, `KSAM`, `BBLAM`, `TISCOASSET`, `SCBAM`, `KASSET`, `KTAM`, `ONEAM`, `UOBAM`,
`PRINCIPAL`, `EASTSPRING`, `ASSETFUND`, `DAOL`, `KWI`, `LHFUND`, `MFC`, `TALIS`, `XSPRING`

---

## Future enhancements

1. **Historical NAV** — store daily NAV snapshots in a SQLite file for trend charts
2. **Push notifications** — alert when a fund's 1Y return crosses a threshold
3. **Admin panel** — UI to trigger scrape, reset registry, view logs
4. **Dividend history** — fetch from `FundDailyInfo/{proj_id}/dividend`
5. **Fund comparison** — side-by-side performance chart across fund types
