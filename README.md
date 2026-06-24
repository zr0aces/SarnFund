# SarnFund

Thai mutual fund analytics dashboard for tax-saving investments tracking RMF, ThaiESG, LTF, and SSF funds across 18 Asset Management Companies using the official SEC Open Data API v2.

## Features

- **Official SEC API v2**: Sourced from `api.sec.or.th` (no scraping or private cookies).
- **Four tax-saving fund types**: RMF, ThaiESG (TESG), LTF, and SSF.
- **18 AMCs tracked**: Including KKP, Krungsri, BBL, TISCO, SCB, KAsset, KTAM, ONE, UOB, and Principal.
- **Primary + Secondary keys**: Zero-downtime key rotation and automated 401 failover.
- **Dual-layer caching**: 7-day fund registry metadata cache + 24-hour NAV daily price cache.
- **Modern UI**: Light Theme dashboard optimized to fit the browser viewport, using Prompt and Kanit typography.

## Quick Start

### Prerequisites
- Node.js 22+ & npm
- Docker & Docker Compose
- SEC Open Data API Subscription Keys

### Configuration
Create a single root-level `.env` file using the template:
```bash
cp .env.example .env
```
Fill in the required `SEC_FACTSHEET_KEY`, `SEC_DAILYINFO_KEY`, and `SCRAPE_TOKEN`.
See [configuration.md](file:///home/san/workspace/SarnFund/docs/configuration.md) for variable details.

### Run (Docker)
```bash
docker compose up -d --build
curl -X POST "http://localhost:8091/api/scrape?force=true" -H "X-Scrape-Token: <SCRAPE_TOKEN>"
```
Access the application at http://localhost:8091.

### Run (Local Development)
```bash
# Terminal 1: Run Backend API
cd backend && npm install && npm run scrape && npm start

# Terminal 2: Run Frontend Dashboard
cd frontend && npm install && npm run dev
```

## Architecture

See [architecture.md](file:///home/san/workspace/SarnFund/docs/architecture.md) for details on components, timezone handling, and caching.

## Development

See [development.md](file:///home/san/workspace/SarnFund/docs/development.md) for the full list of development, linting, and testing commands.

## Deployment

See [deployment.md](file:///home/san/workspace/SarnFund/docs/deployment.md) for operation instructions, backups, and health checks.

## Versioning

Uses Calendar Versioning (CalVer) in the `YYYY.M.MINOR` format (e.g. `2026.6.1`), with [VERSION](file:///home/san/workspace/SarnFund/VERSION) as the single source of truth.

## License

MIT - see [LICENSE](file:///home/san/workspace/SarnFund/LICENSE).
