# Coding Standards

Coding and design guidelines for developers modifying SarnFund.

## UI/UX & Typography
- **Font Face**: Headings and major titles must use **Kanit**. Body copy, tables, labels, and forms must use **Prompt**.
- **Themes**: Standardized strictly on a clean, accessible **Light Theme** system. Avoid dark-mode variants unless explicitly requested.
- **Layout**: Dashboards and data grids must be sized dynamically to fit the browser viewport, avoiding unnecessary vertical or horizontal scrollbars where possible.

## Error Handling & API Resilience
- **API Inputs**: When parsing numeric values from external APIs, use the `numVal(v, fallback)` helper function. The SEC API v2 utilizes `"-"` for null or empty values; `numVal` converts these, alongside `null`, `""`, and `NaN`, to the specified fallback.
- **Rate Limiting**: Do not trigger concurrent raw fetch loops. Wrap operations using `runBatched(tasks, concurrency)` to respect the SEC's limit of 3,000 requests per 300 seconds.
- **Failover Logic**: Utilize the primary and secondary key failover mechanism in `SecApiClient` for endpoints returning HTTP 401.

## Security
- **No Hardcoded Secrets**: Secrets, keys, and tokens must never be written in the code. Reference them via `process.env`.
- **Logging Safety**: Never write secrets (such as `SEC_FACTSHEET_KEY` or `SCRAPE_TOKEN`) to backend or container console logs.
- **CORS Constraints**: Ensure all server routes execute origin validations if `CORS_ORIGIN` is configured.
- **Boundary Verification**: Validate all request parameters, payload sizes (maximum 10 MB), and token headers at Express route boundaries.

## Code Simplification & Testing
- **Clean Functions**: Keep Express handlers and React hook methods modular and under 100 lines.
- **Code Comments**: Maintain existing code comments and JSDoc blocks explaining rate limit logic, failover queues, and UTC+7 offset timezone formatting.
