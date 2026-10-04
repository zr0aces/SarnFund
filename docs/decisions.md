# Architecture Decisions

Record of key architectural, layout, and framework design decisions.

---

## 2026-10-04 — Add S&P 500 (`sp`) Fund Category with Curated Catalog and SEC Live Telemetry
* **Status**: Accepted
* **Decision**: Add a dedicated S&P 500 fund type (`sp` / `sp500`) with neon blue accent (`#3B82F6`), Globe telemetry icon, and a curated catalog of 33 funds/classes across 12 AMCs mapped directly to SEC Thailand Open Data API v2 project IDs.
* **Rationale**: S&P 500 index funds are the dominant US equity allocation vehicle for Thai retail and tax-saving investors. Because they span multiple tax structures (general FIF, E-class, RMF, SSF) and currency hedge approaches (hedged, unhedged, dynamic), grouping them under a unified S&P 500 telemetry console gives investors a dedicated comparison workspace.
* **Implementation**: Added `backend/sp-catalog.js`, updated `backend/server.js`, `backend/scraper.js`, `backend/fund-store.js`, `frontend/src/config/fundCategories.js`, `frontend/src/pages/SpPage.jsx`, `frontend/src/App.jsx`, and `frontend/src/components/DashboardLayout.jsx`.

---

## 2026-10-04 — Historical NAV Benchmark Snapshot Calculation & Factsheet Spectrum Risk Mapping
* **Status**: Accepted
* **Decision**: Implement a market-wide historical daily NAV snapshot pipeline (`getBenchmarkNavMaps`) for trailing returns (YTD, 1M, 3M, 6M, 1Y, 3Y, 5Y) and query `/v2/fund/factsheet/fund-factsheet-spectrum` (`getRiskSpectrum`) for official SEC risk tiers 1–8.
* **Rationale**: The official SEC factsheet performance endpoint (`/v2/fund/factsheet/performance`) frequently returns HTTP 204 No Content for mutual funds, resulting in empty metrics (`"-"`) on the dashboard. By snapshotting daily NAV across target historical dates in a single market-wide batch query per period, SarnFund calculates accurate trailing returns with compound annualization (`(1 + r)^(1/years) - 1`) for multi-year horizons, with zero additional per-fund HTTP overhead.
* **Implementation**: Implemented `getBenchmarkNavMaps()` and `getDailyNavRange()` in `backend/sec-api-connector.js`, added calculation and spectrum mapping logic in `backend/scraper.js`, and added automated verification in `backend/sp-integration.test.js`.

---

## 2026-10-04 — Telemetry UI Harmonization & In-Chart Contrast Accessibility
* **Status**: Accepted
* **Decision**: (1) Unify all 6 fund categories and the sidebar Thai Tax Calculator under the Dark Obsidian glassmorphic telemetry theme (`#090D16`), removing legacy light-theme overrides. (2) Replace default Recharts tooltips with a custom glassmorphic neon tooltip, add formatted float return percentages at bar ends via `LabelList`, and deduplicate Y-axis labels when fund abbreviations match.
* **Rationale**: (1) Eliminates visual fragmentation between category pages and landing view, providing a cohesive dark telemetry aesthetic. (2) Default Recharts tooltips rendered unreadable dark text on dark backgrounds; adding direct bar labels and neon tooltip chips delivers immediate readability without requiring hover interactions on mobile devices.
* **Implementation**: Updated `frontend/src/pages/LandingPage.jsx`, `frontend/src/config/fundCategories.js`, and `frontend/src/components/FundChart.jsx`.

---

## 2026-08-23 — Vite 8 / Rolldown Code-Splitting and Production Bundle Optimization
* **Status**: Accepted
* **Decision**: Configure function-based `manualChunks` in `vite.config.js` compatible with Vite 8 / Rolldown to separate application logic from vendor dependencies (`vendor-react`, `vendor-charts`).
* **Rationale**: The previous unchunked build generated a single monolithic bundle (>656 kB), triggering Vite size warnings and slowing initial script evaluation. Splitting cuts the main application chunk to 106 kB (an 84% reduction) and enables long-term caching of core React and Recharts vendor assets.
* **Implementation**: Implemented `manualChunks(id)` in `frontend/vite.config.js`.

---

## 2026-08-23 — Defensive Metric Type Guards and Deterministic Fund IDs
* **Status**: Accepted
* **Decision**: (1) Enforce strict number and NaN guards on all performance metrics across table cells, return chips, KPI cards, and charts. (2) Replace runtime `Date.now()` fund ID timestamps with deterministic IDs formatted as `fund_${proj_id}_${class}_${code}`.
* **Rationale**: (1) Prevents fatal runtime `TypeError: Cannot read properties of null (reading 'toFixed')` when external SEC metrics contain `null` or unpopulated values. (2) Eliminates non-deterministic IDs that cause unnecessary React DOM churn and reconciliation collisions.
* **Implementation**: Applied in `FundTable.jsx`, `KPICards.jsx`, `FundChart.jsx`, and `scraper.js`.

---

## 2026-07-15 — Obsidian Cyberpunk Telemetry Theme & Multi-Category Console
* **Status**: Accepted
* **Decision**: Transition from legacy Light Theme to a unified Dark Obsidian glassmorphic telemetry theme (`#090D16`), incorporating neon accent hierarchies (`#00F5A0` ThaiESG, `#F97316` RMF, `#38BDF8` ESGX, `#A855F7` SSF, `#FBBF24` ETF), with **Prompt**, **Kanit**, and **JetBrains Mono** typography.
* **Rationale**: Delivers a high-density, professional telemetry workstation feel that minimizes eye fatigue during deep financial comparison and cleanly differentiates risk tiers and asset classes.
* **Implementation**: Standardized via Tailwind CSS v4 `@theme` tokens in `frontend/src/index.css` and `fundCategories.js`.

---

## 2026-06-24 — Adopt CalVer Versioning
* **Status**: Accepted
* **Decision**: Adopt Calendar Versioning (CalVer) in the format `YYYY.M.MINOR` (e.g. `2026.8.0`).
* **Rationale**: SarnFund undergoes regular updates driven by SEC portal transitions and tax policy changes. CalVer provides immediate temporal context regarding the age of the release and ruleset validity.
* **Implementation**: The [VERSION](file:///home/san/workspace/SarnFund/VERSION) file at the root acts as the single source of truth. Both the frontend and backend read from this file at build/run time.

---

## 2026-06-24 — Consolidate Environment Configuration under Single Root `.env`
* **Status**: Accepted
* **Decision**: Move all backend, frontend, and Docker settings into a single `.env` file at the root level.
* **Rationale**: Avoids developer configuration drift, simplifies container deployment (a single `env_file` reference), and guarantees secrets are stored outside source subfolders.
* **Implementation**: Express server reads root `.env` via relative paths; Vite loader resolves relative path using `envDir: '../'`.

---

## 2026-04-26 — Migrate to Official SEC Open Data API v2
* **Status**: Accepted
* **Decision**: Deprecate Settrade cookie-based scraper shell scripts and transition entirely to the official SEC Thailand Open Data API v2.
* **Rationale**: The Settrade scraper relied on private session cookie sniffing which expired every few hours. The official SEC Open Data API v2 is stable, authenticated, rate-limit safe, and provides accurate `navDate` metadata.
* **Implementation**: Added the `SecApiClient` promise-chain queue rate limiter, weekly registry cache mapping, and daily cron fetches.
