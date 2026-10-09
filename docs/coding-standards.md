# Coding Standards

Coding and design guidelines for developers modifying SarnFund.

## UI/UX & Typography
- **Font Face**: Headings and major titles must use **Kanit**. Body copy, tables, labels, and forms must use **Prompt**. Telemetry metrics, return percentages, timestamps, and numeric cells must use **JetBrains Mono**.
- **Themes**: Standardized on the unified **Dark Obsidian** glassmorphic telemetry theme (`#090D16`), utilizing dark glass panels (`glass-panel`, `glass-panel-subtle`), vibrant neon accent hierarchies per fund category, and accessible high-contrast text and in-chart float labels.
- **Layout**: Dashboards and data grids must be sized dynamically to fit the browser viewport, avoiding unnecessary vertical or horizontal scrollbars where possible.

## Error Handling & API Resilience
- **API Inputs**: When parsing numeric values from external APIs, use the `numVal(v, fallback)` helper function. The SEC API v2 utilizes `"-"` for null or empty values; `numVal` converts these, alongside `null`, `""`, and `NaN`, to the specified fallback.
- **Rate Limiting**: Do not trigger concurrent raw fetch loops. Wrap operations using `runBatched(tasks, concurrency)` to respect the SEC's limit of 3,000 requests per 300 seconds.
- **Failover Logic**: Utilize the primary and secondary key failover mechanism in `SecApiClient` for endpoints returning HTTP 401.
- **Catalog Retention (Zero-Purge)**: Never discard or drop registered funds from datasets or UI tables when upstream API queries return HTTP 204 No Content, missing NAV, or 0. Create fallback schema records (`nav: null`, `navDate: null`, `navUnavailable: true`). UI components must render `nav: null` gracefully using `'—'` and `'Date unavailable'` without runtime exceptions.
- **Baseline Seed Parity**: `backend/seed-data.js` must mirror 100% of registered funds in `data/fund-registry.json` across all categories (RMF, SSF, ESG, ESGX, ETF, SP) so initial environment seeding (`npm run init`) guarantees full catalog coverage.

## Security
- **No Hardcoded Secrets**: Secrets, keys, and tokens must never be written in the code. Reference them via `process.env`.
- **Logging Safety**: Never write secrets (such as `SEC_FACTSHEET_KEY` or `SCRAPE_TOKEN`) to backend or container console logs.
- **CORS Constraints**: Ensure all server routes execute origin validations if `CORS_ORIGIN` is configured.
- **Boundary Verification**: Validate all request parameters, payload sizes (maximum 10 MB), and token headers at Express route boundaries.

## Code Simplification & Testing
- **Clean Functions**: Keep Express handlers and React hook methods modular and under 100 lines.
- **Code Comments**: Maintain existing code comments and JSDoc blocks explaining rate limit logic, failover queues, and UTC+7 offset timezone formatting.
