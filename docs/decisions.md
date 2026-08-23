# Architecture Decisions

Record of key architectural, layout, and framework design decisions.

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
