# Changelog

## [2026.10.3] - 2026-10-06

### Added
- **Resilient Fund Catalog Retention (Zero-Purge Policy)**: Updated `backend/scraper.js` to preserve registered funds in category buckets even when upstream SEC API v2 daily NAV endpoint returns HTTP 204 No Content, missing NAV, or zero.
- **Authoritative Baseline Seed Dataset (`backend/seed-data.js`)**: Merged all 794 registered funds matching `data/fund-registry.json` across all categories (RMF: 379, SSF: 299, ESG: 38, ESGX: 34, ETF: 11, SP: 33) into `SEED_FUNDS` with historical NAV and returns where available.
- **Dynamic AMC Detection (`backend/init-data.js`)**: Dynamic AMC discovery from seed dataset during `npm run init`.
- **AMC Brand Palette Expansion (`frontend/src/config/fundCategories.js`)**: Added brand colors for Aberdeen (`#E11D48`), First Plus (`#14B8A6`), and Sawakami (`#84CC16`).

### Fixed
- **Catalog Depletion on API 204 / Scrape Refresh**: Prevented fund count from dropping from 794 to ~180 when upstream SEC daily NAV endpoint returns HTTP 204.
- **Frontend Missing NAV Rendering**: Updated `FundTable.jsx` to gracefully display `'—'` and `'Date unavailable'` for unpriced or zero-NAV funds without layout shift or exceptions.

## [2026.10.1] - 2026-10-04

### Added
- **S&P 500 Fund Category (`/funds/sp`)**: Added dedicated S&P 500 telemetry analytics page and backend API endpoints (`/api/funds/sp`, `/api/funds/sp500`).
- **Curated S&P 500 Catalog (`backend/sp-catalog.js`)**: Integrated 33 S&P 500 funds and share classes across 12 AMCs (AIA IM, Asset Plus, Bualuang, Eastspring, KAsset, Krungsri, KKP, KTAM, MFC, SCBAM, TISCO, Talis) mapped directly to official SEC Open Data API v2 project IDs.
- **AIA IM Integration**: Added AIA Investment Management (Thailand) to `AMC_REGISTRY` and `MASTER_AMC_COLORS` with dedicated `#D9222A` brand styling.
- **S&P 500 Telemetry UI**: Glassmorphic theme styling with Globe icon, `#3B82F6` neon accent, tax guidance for General/RMF/SSF share classes, and category tips.
- **Historical NAV Trailing Returns Engine (`backend/sec-api-connector.js`, `backend/scraper.js`)**: Implemented `getBenchmarkNavMaps()` and `getDailyNavRange()` to query historical market-wide daily NAV snapshots across benchmark target dates (YTD start: Dec 30/31, 1M, 3M, 6M, 1Y, 3Y, 5Y). Calculates precise trailing returns with compound annualization for multi-year horizons (`(1 + r)^(1/years) - 1`).
- **SEC Factsheet Risk Spectrum Mapping (`getRiskSpectrum`)**: Added risk tier loader querying `/v2/fund/factsheet/fund-factsheet-spectrum` to resolve official SEC risk tiers 1–8 (`risk_spectrum`) when fund profile risk levels are unpopulated.
- **In-Bar Float Metric Labels (`frontend/src/components/FundChart.jsx`)**: Added Recharts `LabelList` rendering formatted float return percentages directly at bar ends with positive/negative color semantics.
- **S&P 500 Integration & Calculation Tests (`backend/sp-integration.test.js`)**: 5 automated Node.js test cases covering catalog integrity, project ID uniqueness, SEC profile merging, trailing return calculations (simple + annualized), and risk spectrum mapping.
- **Backend Test Script (`backend/package.json`)**: Added `npm test` script executing the Node.js test runner for fast local and CI verification.

### Changed
- **Telemetry UI Harmonization**: Unified all 6 fund category pages (RMF, ThaiESG, ThaiESGX, SSF, ETF, S&P 500) and the Thai Tax Calculator sidebar widget under Dark Obsidian glassmorphic telemetry theme (`#090D16`, `glass-panel`, `glass-panel-subtle`), eliminating light theme overrides on the Landing Page.
- **Chart Tooltip & Axis Contrast**: Replaced default Recharts tooltip with a custom glassmorphic dark tooltip displaying neon emerald/rose returns and AMC badge tags; deduplicated Y-axis labels when fund abbreviations match.
- **Frontend Dependency Upgrades**: Upgraded 12 in-major packages: `react`/`react-dom` 19.3.0, `lucide-react` 1.52.0, `vite` 8.3.2, `@vitejs/plugin-react` 6.0.0, `@eslint/js` 9.39.5, `globals` 17.4.0, `eslint-plugin-react-hooks` 7.1.0, `eslint-plugin-react-refresh` 0.4.26, `@types/react` 19.2.14, `@types/react-dom` 19.2.3, `tailwindcss` 4.2.2, `@tailwindcss/vite` 4.2.2.

### Fixed
- **Missing Returns & Risk Levels on Dashboard**: Fixed dashboard displaying `"-"` for returns and risk levels caused by SEC API factsheet performance returning HTTP 204 No Content for mutual funds.
- **Chart Contrast in Dark Mode**: Fixed illegible black text in Top 10 Performance Radar tooltips.


## [2026.8.0] - 2026-08-23

### Added
- **Vite 8 / Rolldown Code-Splitting**: Configured function-based `manualChunks` in `frontend/vite.config.js` to isolate `vendor-react` and `vendor-charts`, reducing the main entry chunk from 656 kB down to 106 kB (84% reduction).
- **Deterministic Fund IDs**: Standardized fund unique IDs in `scraper.js` (`fund_${proj_id}_${class}_${code}`) replacing nondeterministic `Date.now()` timestamp generators.
- **ThaiESGX Classification**: Expanded `esgSubtype` in `scraper.js` to inspect full English/Thai project names alongside unit class and abbreviation codes.

### Fixed
- **Runtime Defensive Boundaries**: Added strict number, null, and NaN type checks in `FundTable.jsx`, `KPICards.jsx`, and `FundChart.jsx` to prevent `TypeError: Cannot read properties of null (reading 'toFixed')` on missing metrics.
- **RateLimiter Queue Serialization**: Hardened `RateLimiter.wait()` in `sec-api-connector.js` with `.catch().then()` chaining to ensure sequential queuing without unhandled rejection lockups.
- **SEC API Response Parsing Resilience**: Wrapped `res.json()` parsing within the try-catch backoff retry block in `sec-api-connector.js` to handle transient gateway HTML error payloads.
- **Pure Async File Operations**: Replaced synchronous `existsSync` calls in `fund-store.js` with non-blocking `fs/promises`.
- **Peer Dependency Graph Alignment**: Aligned `@eslint/js` (`^9.39.5`) with `eslint` (`^9.39.4`) in `frontend/package.json`, removing the need for `--legacy-peer-deps` in `frontend/Dockerfile`.
- **Agent Parity Tracking**: Unignored `.agent-parity/` in `.gitignore` to allow seamless multi-agent state and skill sync.

### Security
- **0 Vulnerabilities**: Resolved all 9 high/moderate vulnerability advisories across frontend and backend dependencies via targeted package upgrades.

## [2.0.1] - 2026-06-24

### Fixed
- Performance metrics duplication bug: modified `parsePerformanceV2` in `scraper.js` to only extract records where `performance_type_desc` matches `"ผลตอบแทนกองทุนรวม"` (Fund Return). This prevents benchmark returns, peer group averages, and standard deviation metrics (which are identical across multiple funds in the same categories) from overwriting actual fund returns.
- Environment variables loading: added manual `.env` file parsing to `scraper.js` so it can be run standalone via `npm run scrape` without requiring variables to be pre-set in the environment.

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
- `.env.example` (at root) — documents `SEC_FACTSHEET_KEY`, `SEC_DAILYINFO_KEY`, `SCRAPE_TOKEN`
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
  - Loads `.env` (at root) at startup (no external `dotenv` dependency)
  - `POST /api/scrape` logic order fixed — token check now runs before cache check
  - Startup log shows key and token configuration status
  - `GET /api/health` extended — reports `secApi` key presence, registry stats, all four cache states
- `docker-compose.yml` — added `env_file: ./.env` so SEC keys reach the container
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
- SEC API keys never embedded in source; loaded only from root `.env`

### Performance

- Registry build: ~5× faster due to batched concurrent policy fetches (5 at a time vs sequential)
- Daily NAV fetch: concurrent (5 at a time) instead of strictly sequential
- Backend file writes: parallel `Promise.all` instead of sequential loop

---

## [1.0.0] - 2025-12-18 — Comprehensive System Release

### Added

- `.github/copilot_instructions.md` — development guide
- `docs/archived/SECURITY_SUMMARY.md` — security audit report
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
