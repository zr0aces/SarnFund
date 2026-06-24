# Architecture Decisions

Record of key architectural, layout, and framework design decisions.

---

## 2026-06-24 — Adopt CalVer Versioning
* **Status**: Accepted
* **Decision**: Adopt Calendar Versioning (CalVer) in the format `YYYY.M.MINOR` (e.g. `2026.6.1`).
* **Rationale**: SarnFund undergoes regular updates driven by SEC portal transitions and tax policy changes. CalVer provides immediate temporal context regarding the age of the release and ruleset validity.
* **Implementation**: The [VERSION](file:///home/san/workspace/SarnFund/VERSION) file at the root acts as the single source of truth. Both the frontend and backend read from this file at build/run time.

---

## 2026-06-24 — UI/UX Light Theme Consistency with Kanit and Prompt Fonts
* **Status**: Accepted
* **Decision**: Standardize all views on a consistent Light Theme layout, fitting completely within the browser window without forced scrolling. Headings use the **Kanit** font family, and UI/body elements use the **Prompt** font family.
* **Rationale**: The tax-saving planning dashboard demands high legibility and a professional financial look. The Light Theme maximizes read clarity, while the dual-font pair (Kanit and Prompt) aligns with modern Thai typography standards.
* **Implementation**: Standardized across Vite configs, CSS variables, and tailwind typography.

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
