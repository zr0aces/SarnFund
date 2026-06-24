# AI Development Rules

Guidelines for AI models writing code in the SarnFund repository.

## Repository Architecture & Structure
- **Design Pattern**: Strictly follow the three-tier monorepo architecture (Vite frontend, Express backend, Nginx unified reverse proxy gateway).
- **Environment Settings**: Never create subfolder `.env` configurations. All configuration resides inside the single, root-level `.env` file.
- **Versioning**: Follow CalVer (`YYYY.M.MINOR`). Read the version from the [VERSION](file:///home/san/workspace/SarnFund/VERSION) file at the root — do not hardcode versions.

## Code Standards
- **Typography Standards**: Ensure all new page text elements use **Prompt** styling, and headings use **Kanit**.
- **Visual Design**: Keep UI consistent with the standard Light Theme. Fit dashboard interfaces within a single screen view (no scrolling required).
- **Data Safeguards**: When parsing any numeric input fields from the SEC API, wrap the access in the `numVal()` helper to correctly parse the empty string indicator (`"-"`).
- **Rate-limit Protection**: Do not add raw API loops. All fetches targeting the SEC API must queue through the rate limiter in `sec-api-connector.js` using `runBatched`.
- **Security Protocols**:
  - Never log credentials, API keys, or scrape tokens.
  - Never execute child process shells (`exec`, `spawn`) for scraping operations. All requests must use the JS connector.
  - Do not alter the Alpine image tags in Docker configurations to non-alpine versions.
