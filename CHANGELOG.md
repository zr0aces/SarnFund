# Changelog

## [2.0.0] - 2026-04-26 — SEC Open Data API v2

### Migration: Settrade → SEC Official API

The data source has been completely replaced. The previous approach used `curl` with
hardcoded session cookies against the Settrade.com internal API — this was fragile
(cookies expire), unofficial, and produced no NAV date metadata. The new connector
uses the **SEC Thailand Open Data API v2** with proper subscription-key authentication.

### Added

- `backend/sec-api-connector.js` — full SEC API client
  - `SecApiClient` class with separate rate limiters for Factsheet and Daily Info APIs
  - `RateLimiter` using a promise-chain queue (fixes race condition in the previous timestamp-diff approach)
  - Exponential backoff retry on HTTP 421 and 429 (1 s → 2 s → 3 s, max 3 attempts)
  - `thaiDateStr(daysAgo)` — returns date in UTC+7 to avoid off-by-one errors at midnight Bangkok time
  - `runBatched(tasks, concurrency)` — bounded-concurrency helper used by the scraper
  - `matchesFundType(policy, type)` — checks multiple possible SEC API field names for fund type classification
- `backend/.env.example` — documents `SEC_FACTSHEET_KEY`, `SEC_DAILYINFO_KEY`, `SCRAPE_TOKEN`
- `data/fund-registry.json` — 7-day cached mapping of `proj_id → { type, riskLevel, name, amc }`
- `DELETE /api/registry` endpoint — clears registry cache, forces full rebuild on next scrape
- `navDate` field on every fund object — actual SEC NAV date (`YYYY-MM-DD`), not the scrape timestamp
- `SCRAPE_TOKEN` env var — `POST /api/scrape` now requires `X-Scrape-Token` header

### Changed

- `backend/scraper.js` — complete rewrite
  - Two-phase scrape: weekly registry build + daily NAV fetch, both using `runBatched`
  - Fund type classification via `FundFactsheet/fund/{proj_id}/policy` endpoint
  - `navDate` stored per fund (from `FundDailyInfo` response)
  - Concurrent file writes for per-type JSON outputs
- `backend/server.js`
  - Loads `backend/.env` at startup (no external `dotenv` dependency)
  - `POST /api/scrape` logic order fixed — token check now runs before cache check
  - Startup log shows key and token configuration status
  - `GET /api/health` extended — reports `secApi` key presence, registry stats, all four cache states
- `docker-compose.yml` — added `env_file: ./backend/.env` so SEC keys reach the container
- `frontend/src/hooks/useFundData.js`
  - Cache version bumped (`v3` → `v4`) to bust old localStorage entries
  - Silent background fetch on mount; UI only updates if server `timestamp` is newer than cached value
  - `refresh()` clears the cache then re-fetches without page reload
  - `lastUpdated` stored as ISO string (was locale time string)
- `frontend/src/components/DashboardLayout.jsx`
  - Uses `refresh()` from hook instead of `window.location.reload()`
  - Displays **"NAV as of YYYY-MM-DD"** badge derived from `fund.navDate`
  - Displays fetch timestamp in human-readable format (`26 Apr 2026, 01:00`)
  - Data source label changed from "Real-time Data Dashboard" to "SEC Open Data"
- `frontend/src/components/FundTable.jsx`
  - Factsheet link label changed from "Settrade" to "SEC" (URL now points to `sec.or.th`)

### Removed

- `backend/refetch_funds_v2.sh` — shell script with hardcoded Settrade session cookies (superseded)
- `backend/data/rmf-fetched.json`, `tesg-fetched.json`, `ltf-fetched.json`, `ssf-fetched.json` — stale 0-byte intermediary files

### Security

- `POST /api/scrape` is now protected by `SCRAPE_TOKEN` (previously open to anyone)
- SEC API keys never embedded in source; loaded only from `backend/.env`

### Performance

- Registry build: ~5× faster due to batched concurrent policy fetches (5 at a time vs sequential)
- Daily NAV fetch: concurrent (5 at a time) instead of strictly sequential
- Backend file writes: parallel `Promise.all` instead of sequential loop

---

## [1.0.0] - 2025-12-18 — Comprehensive System Release

### Added

- `.github/copilot_instructions.md` — development guide
- `documents/SECURITY_SUMMARY.md` — security audit report
- `frontend/.eslintrc.cjs` — ESLint configuration
- Security headers middleware (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, HSTS)
- Configurable CORS (`CORS_ORIGIN` environment variable)
- Request body size limit (10 MB)
- Input validation with `parseFloat` / `parseInt`
- URL encoding for external links

### Changed

- Updated backend dependencies: express 4.22.1, node-cron 3.0.3, cors 2.8.5
- Updated frontend dependencies: React 18.3.1, Vite 5.4.21, lucide-react 0.561.0, recharts 2.15.4
- Package renamed: `sanfund-backend` → `sarnfund-backend`
- README.md — architecture diagram and deployment guides
- Documentation reorganised into `/documents`
- Fixed branding: SanFund → SarnFund throughout
- React components updated to new JSX transform (no `React` import)

### Fixed

- Removed unused imports and variables
- React hooks dependencies in `useFundData`
- SSF Dashboard incorrectly displaying ThaiESG funds

### Security

- CodeQL scan: 0 vulnerabilities
- Backend: 0 vulnerabilities (101 packages audited)
