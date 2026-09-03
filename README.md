# SarnFund

Thai mutual fund analytics telemetry console for tax-saving investments tracking RMF, ThaiESG (ESG), ThaiESGX (ESGX), SSF, and ETF funds across 18 Asset Management Companies using the official SEC Open Data API v2.

## Features

- **Official SEC API v2**: Direct data ingestion from `api.sec.or.th` (no web scraping or fragile session cookies).
- **Five Fund Categories Tracked**: RMF, ThaiESG, ThaiESGX, SSF, and ETF.
- **Thai Tax Engine 2569**: Built-in dynamic tax bracket planner, withholding optimizer, and deduction limit projector.
- **18 AMCs Tracked**: Including KKP, Krungsri, BBL, TISCO, SCB, KAsset, KTAM, ONE, UOB, Principal, Eastspring, Asset Plus, DAOL, KWI, LH Fund, MFC, TALIS, and XSpring.
- **Zero-Downtime Key Failover**: Primary + Secondary API key rotation with automatic 401 failover.
- **Dual-Layer Caching**: 7-day fund registry metadata cache + 24-hour NAV daily price cache (with browser `localStorage` instant hydration).
- **High-Performance Telemetry UI**: Dark Obsidian glassmorphic telemetry console with Kanit, Prompt, and JetBrains Mono typography, responsive on mobile and desktop.
- **Optimized Bundle Splitting**: Vite 8 / Rolldown code-splitting with isolated vendor and chart chunks.

## Quick Start

### Prerequisites
- Node.js 24+ & npm
- Docker & Docker Compose (optional for containerized deployment)
- SEC Open Data API Subscription Keys

### Configuration
Create a single root-level `.env` file using the template:
```bash
cp .env.example .env
```
Fill in the required `SEC_FACTSHEET_KEY`, `SEC_DAILYINFO_KEY`, and optional `SCRAPE_TOKEN`.
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
cd backend && npm install && npm run scrape && npm run dev

# Terminal 2: Run Frontend Dashboard
cd frontend && npm install && npm run dev
```

### Data Fetching & Scraping Commands

**From Host (auto-detects and runs inside Docker if container is running):**
```bash
# Fetch latest daily NAV (reuses 7-day fund registry)
node scripts/fetch-funds.js

# Force full refresh (wipes registry cache and queries all 18 AMCs from scratch)
node scripts/fetch-funds.js --refresh
```

**Inside Docker Container Directly:**
```bash
# Run scrape inside running backend container
docker compose exec backend npm run scrape

# Force full refresh inside container
docker compose exec backend npm run scrape:refresh
```

## Architecture

See [architecture.md](file:///home/san/workspace/SarnFund/docs/architecture.md) for details on components, timezone handling, and caching.

## Development

See [development.md](file:///home/san/workspace/SarnFund/docs/development.md) for the full list of development, linting, and testing commands.

## Deployment

See [deployment.md](file:///home/san/workspace/SarnFund/docs/deployment.md) for operation instructions, backups, and health checks.

## Versioning

Uses Calendar Versioning (CalVer) in the `YYYY.M.MINOR` format (e.g. `2026.8.0`), with [VERSION](file:///home/san/workspace/SarnFund/VERSION) as the single source of truth.

## License

MIT - see [LICENSE](file:///home/san/workspace/SarnFund/LICENSE).
