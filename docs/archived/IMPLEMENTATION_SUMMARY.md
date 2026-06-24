<!-- Archived 2026-06-24: content merged into docs/architecture.md and docs/configuration.md -->

# Implementation Summary

## Overview

SarnFund v2.0 uses the **official SEC Thailand Open Data API v2** (`api.sec.or.th`) with proper subscription-key authentication. Data is fetched in two phases — a weekly fund registry build and a daily NAV fetch — then cached as JSON files served by an Express API.

---

## Backend

### `sec-api-connector.js`

The SEC API client. Wraps two API products (Fund Factsheet, Fund Daily Info) with separate rate limiters and automatic secondary-key failover.

**Authentication**

```
Header: Ocp-Apim-Subscription-Key: <key>
```

Each API product subscription provides a **Primary Key** and a **Secondary Key**:
- `SEC_FACTSHEET_KEY` / `SEC_FACTSHEET_KEY_2` — Fund Factsheet API
- `SEC_DAILYINFO_KEY` / `SEC_DAILYINFO_KEY_2` — Fund Daily Info API

On HTTP 401, the connector retries once with the secondary key (if set) before throwing.

**Rate limiting**

```
SEC limit:  3,000 calls / 300 seconds per key
Enforced:   120 ms between calls (≈ 8 calls/sec)
Retry:      exponential backoff on 421/429 — 1 s, 2 s, 3 s (max 3 attempts)
```

The `RateLimiter` class uses a **promise-chain queue** so concurrent callers cannot bypass the delay by reading the same timestamp simultaneously.

**API v2 null convention**

Empty fields are returned as `"-"` (dash string), not JSON `null`. The exported `numVal(v, fallback=0)` helper converts `null`, `"-"`, `""`, and `NaN` to the fallback value. All numeric field reads use this helper.

**Endpoints**

*Fund Factsheet API* (`https://api.sec.or.th/FundFactsheet`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/fund/amc` | List all AMCs |
| GET | `/fund/amc/{unique_id}` | List funds for one AMC (incl. `class_abbr_name`) |
| POST | `/fund` | Search funds by name `{"name":"..."}` |
| GET | `/fund/{proj_id}/policy` | Fund type + risk level |
| GET | `/fund/{proj_id}/performance` | YTD, 3M, 6M, 1Y, 3Y, 5Y returns |
| GET | `/fund/{proj_id}/URLs` | Factsheet and annual report URLs |
| GET | `/fund/{proj_id}/fund_manager` | Fund manager change history |
| GET | `/fund/{proj_id}/dividend` | Dividend history and policy |

*Fund Daily Info API* (`https://api.sec.or.th/FundDailyInfo`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/amc` | Participating AMC directory |
| GET | `/{proj_id}/dailynav/{YYYY-MM-DD}` | NAV, day change, AUM, sell/buy prices |
| GET | `/{proj_id}/dividend` | Dividend payment history |

**Deprecated (October 2024)**: `/return`, `/buy_and_hold`, `/5YearLost`

**Thai timezone**

The NAV endpoint requires a Thai-market date. `thaiDateStr(daysAgo)` adds the UTC+7 offset before producing the date string, preventing the midnight off-by-one error that `toISOString()` would cause.

**Concurrent batch helper**

`runBatched(tasks, concurrency=5)` runs async task functions in groups of 5. Failed tasks are warned and skipped; their absence does not abort the whole batch. Used in both the registry build (policy fetches) and the daily NAV loop.

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

`matchesFundType()` checks six possible field names (`typeCode`, `type_code`, `specification`, `specificationCode`, `fund_type_code`, `abbr_name`) because the exact field returned varies by fund. API v2 uses `"-"` for empty fields (not `null`) — these are filtered before comparison. TESG aliases: `ThaiESG`, `TESG`, `THAI_ESG`.

The registry entry stores `class_abbr_name` from the fund-by-AMC response (e.g. `"A"`, `"D"`, `"I"`) to identify the unit class. Funds with multiple classes each have a distinct `proj_id` and appear as separate registry entries.

#### Phase 2 — Daily NAV fetch (daily, fast)

```
loadRegistry()  ← from fund-registry.json
    └─ getLatestNav() [batched ×5]
        └─ tries today, yesterday, … up to 5 days back (handles weekends/holidays)
        └─ getFundPerformance() [non-fatal if missing]
            └─ assemble fund object with all v2 fields
                └─ write rmf.json, tesg.json, ltf.json, ssf.json, all.json
```

File writes are parallelised with `Promise.all`.

#### Fund object structure

```js
{
  id:               string,      // "fund_{timestamp}_{code}"
  code:             string,      // SEC proj_abbr_name  e.g. "KPRMF"
  name:             string,      // English name
  amc:              string,      // display name from AMC_MAP e.g. "KKP"
  class:            string|null, // unit class e.g. "A", "D", "I" — from API v2
  nav:              number,      // last_val — NAV per unit (THB)
  navDate:          string,      // "YYYY-MM-DD" — actual SEC NAV date
  navChange:        number,      // change_val — absolute day-over-day change (THB)
  navChangePercent: number,      // change_percent — day-over-day change (%)
  netAsset:         number,      // net_asset — total fund AUM (THB)
  sellPrice:        number,      // amc_info.sell_price — AMC offer price
  buyPrice:         number,      // amc_info.buy_price  — AMC redemption price
  ytd:              number,      // % from performance endpoint
  return3m:         number,
  return6m:         number,
  return1y:         number,
  return2y:         0,           // not available from SEC API
  return3y:         number,
  return5y:         number,
  risk:             number,      // risk_spectrum_id (1–8)
  type:             string,      // "RMF" | "SSF" | "TESG" | "LTF"
  isNew:            false,
  factsheetUrl:     string,      // https://www.sec.or.th/…?PROJ_ID=…
}
```

---

### `server.js`

Express API server. Key design decisions:

- **`.env` loading** — checks for and reads `.env` from both parent root and local directory at startup using Node's built-in `fs.readFileSync`; no external `dotenv` dependency
- **Scrape endpoint protection** — `POST /api/scrape` checks `X-Scrape-Token` header against `SCRAPE_TOKEN` env var; warns at startup if token is unset
- **Logic order** — token check runs before cache check, so `?force=true` correctly bypasses the cache
- **`DELETE /api/registry`** — removes `fund-registry.json` so the next scrape rebuilds it
- **Extended health check** — reports primary and secondary key presence for both API products, registry fund count and build time, and cache validity for all four fund types

---

## Frontend

### `useFundData.js`

Custom React hook for data fetching and caching.

**Cache key**: `fund_cache_v4_{fundType}` — bump the version number whenever the fund object schema changes to bust old cached data.

**Mount behaviour**:
1. Read localStorage — if valid (< 24 h old), render immediately and silently fetch from backend
2. Silent fetch only updates state if `server.timestamp > cached.timestamp` — prevents a slow background response from overwriting newer data already displayed
3. If no valid cache, shows loading state and fetches synchronously

**`refresh()`**:
- Clears localStorage for the current fund type
- Resets the in-flight timestamp guard
- Calls `fetchDataFromAPI(silent=false)` — shows the loading spinner

---

## `DashboardLayout.jsx`

- Computes `latestNavDate` from the maximum `fund.navDate` across the current fund list
- Displays **"NAV as of YYYY-MM-DD"** badge (green) and **"Fetched DD Mon YYYY, HH:MM"** badge (grey)
- **Update Data** button calls `refresh()` from the hook — no `window.location.reload()`

### `FundTable.jsx`

- Factsheet link label: **"SEC"** — URL points to `sec.or.th`

---

## Infrastructure

### `docker-compose.yml`

Three-service setup with a named volume (`frontend_dist`) shared between the builder and nginx:

| Service | Image | Role |
|---------|-------|------|
| `backend` | built from `./backend` | Express API + cron scraper; internal only |
| `frontend` | built from `./frontend` | One-shot React/Vite builder; exits after copying `dist/` to `frontend_dist` |
| `nginx` | `nginx:1.27-alpine` | Serves static files from `frontend_dist`; proxies `/api/` to backend |

The `nginx` service depends on `frontend` with `condition: service_completed_successfully`, ensuring the built files are ready before nginx starts.

Upgrading nginx is a one-line change to the `image` tag — no rebuild of the frontend required.

### `nginx/default.conf`

Volume-mounted into the nginx container. Features:
- Gzip compression for text/css/js/json/svg
- `Cache-Control: immutable, 1y` for Vite-fingerprinted static assets
- HTTP/1.1 keepalive proxy to backend with 120 s read timeout
- SPA `try_files` fallback for React Router
- `server_name _` accepts any hostname

### `backend/.env.example`

Documents all required and optional environment variables:

```
SEC_FACTSHEET_KEY    required  — Fund Factsheet API primary key
SEC_FACTSHEET_KEY_2  optional  — Fund Factsheet API secondary key (401 failover)
SEC_DAILYINFO_KEY    required  — Fund Daily Info API primary key
SEC_DAILYINFO_KEY_2  optional  — Fund Daily Info API secondary key (401 failover)
SCRAPE_TOKEN         required  — protects POST /api/scrape
PORT                 optional  — default 3001
CORS_ORIGIN          optional  — restrict CORS in production
```

---

## Removed (from v1.0)

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
4. **Fund comparison** — side-by-side performance chart across fund types
5. **NAV change display** — show `navChange` and `navChangePercent` badges in the fund table
6. **AUM display** — format `netAsset` (total fund size) in the fund detail view
