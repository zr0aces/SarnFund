# SarnFund

**SarnFund** is a Thai mutual fund analytics dashboard for tax-saving investments. It tracks RMF, ThaiESG, LTF, and SSF funds across 18+ Asset Management Companies using the **official SEC Open Data API v2** — no scraping, no brittle cookies.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](docker-compose.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Data](https://img.shields.io/badge/Data-SEC%20Open%20Data%20API%20v2-orange)](https://secopendata.sec.or.th/sec-open-apis)

## Features

- **Official SEC API** — data sourced from the SEC Thailand Open Data API v2; no third-party scraping
- **Four fund types** — RMF, ThaiESG (TESG), LTF, SSF
- **18+ AMCs tracked** — KKP, Krungsri, BBL, TISCO, SCB, KAsset, KTAM, ONE, UOB, Principal, Eastspring, and more
- **Two-phase caching** — 7-day fund registry (static metadata) + 24-hour NAV cache (daily prices)
- **Smart frontend cache** — localStorage with server-timestamp comparison; shows stale data instantly, silently updates in background
- **NAV date display** — shows actual NAV date per fund (`navDate`), not just the scrape timestamp
- **Interactive charts** — performance visualization with Recharts
- **Thai Tax Planner 2568** — built-in tax saving calculator
- **Docker ready** — single `docker compose up -d` to run everything
- **Rate-limit safe** — 120 ms delay between API calls, exponential backoff on 421/429

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          SarnFund                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
   ┌───────▼────────┐             ┌────────▼────────┐
   │    Backend     │             │    Frontend     │
   │  Node.js 22    │             │   React 18      │
   │                │◄────────────┤                 │
   │  Express API   │  REST/JSON  │  Vite + Tailwind│
   │  SEC Connector │             │  Recharts       │
   │  Cron (1 AM)   │             │  React Router   │
   │  JSON Cache    │             │  localStorage   │
   └───────┬────────┘             └─────────────────┘
           │
           │  Ocp-Apim-Subscription-Key
           │
   ┌───────▼────────────────┐
   │  SEC Open Data API v2  │
   │  api.sec.or.th         │
   │                        │
   │  /FundFactsheet/…      │  ← AMC list, fund list, policy, performance
   │  /FundDailyInfo/…      │  ← Daily NAV per fund
   └────────────────────────┘
```

### Two-phase scraping

| Phase | Trigger | TTL | What it does |
|-------|---------|-----|--------------|
| **Registry build** | First run, or weekly | 7 days | Fetches AMC list → fund lists → fund policies; classifies each fund as RMF/SSF/TESG/LTF; saves `data/fund-registry.json` |
| **Daily NAV fetch** | Cron 1 AM, or manual | 24 hours | Reads registry; fetches latest NAV + performance for each fund; saves per-type JSON files |

Both phases use **batched concurrency** (5 requests at a time) against the rate limiter.

## Quick Start

### Option 1 — Docker (recommended)

```bash
# 1. Copy env template and fill in your SEC API keys
cp backend/.env.example backend/.env
#    Edit backend/.env with your subscription keys

# 2. Start all services
docker compose up -d

# 3. Trigger the first data fetch
curl -X POST "http://localhost:3001/api/scrape?force=true" \
     -H "X-Scrape-Token: <your-SCRAPE_TOKEN>"

# Access the app
open http://localhost:8091
```

### Option 2 — Local development

```bash
# Backend
cd backend
cp .env.example .env      # fill in SEC keys
npm install
npm run scrape            # first-time registry build + NAV fetch
npm start                 # API on :3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev               # Vite dev server on :5173
```

## Getting SEC API Keys

1. Go to [secopendata.sec.or.th/sec-open-apis](https://secopendata.sec.or.th/sec-open-apis)
2. Sign up / sign in
3. Navigate to **Products** and subscribe to:
   - **Fund Factsheet API** → copy subscription key → `SEC_FACTSHEET_KEY`
   - **Fund Daily Info API** → copy subscription key → `SEC_DAILYINFO_KEY`
4. Put both keys in `backend/.env`

Rate limit: **3,000 calls / 300 seconds** per key. The connector enforces a 120 ms inter-request delay with exponential backoff.

## Configuration

### `backend/.env`

```bash
# SEC Open Data API subscription keys (required)
# Register at: https://secopendata.sec.or.th/sec-open-apis
SEC_FACTSHEET_KEY=your_fund_factsheet_subscription_key_here
SEC_DAILYINFO_KEY=your_fund_daily_info_subscription_key_here

# Protects the POST /api/scrape endpoint
SCRAPE_TOKEN=change_me_to_a_random_secret

# Optional overrides
PORT=3001
CORS_ORIGIN=https://yourdomain.com
```

### Frontend

```bash
VITE_API_URL=http://backend:3001   # set automatically in Docker
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/funds/rmf` | RMF fund data |
| GET | `/api/funds/tesg` | ThaiESG fund data |
| GET | `/api/funds/ltf` | LTF fund data |
| GET | `/api/funds/ssf` | SSF fund data |
| GET | `/api/funds/all` | All four fund types combined |
| GET | `/api/health` | Service status, key config, registry info, cache ages |
| GET | `/api/stats` | Fund counts per type |
| POST | `/api/scrape` | Manual scrape (requires `X-Scrape-Token` header; add `?force=true` to bypass cache check) |
| DELETE | `/api/registry` | Clear fund registry cache (forces full rebuild on next scrape) |

### Example responses

```bash
# Health check
curl http://localhost:3001/api/health
# {
#   "status": "ok",
#   "secApi": { "factsheetKey": true, "dailyInfoKey": true },
#   "registry": { "funds": 142, "lastBuilt": "2026-04-26T01:00:00.000Z" },
#   "cache": {
#     "rmf":  { "valid": true, "funds": 54, "lastUpdated": "..." },
#     "tesg": { "valid": true, "funds": 28, "lastUpdated": "..." },
#     "ltf":  { "valid": true, "funds": 18, "lastUpdated": "..." },
#     "ssf":  { "valid": true, "funds": 42, "lastUpdated": "..." }
#   }
# }

# Force a manual scrape
curl -X POST "http://localhost:3001/api/scrape?force=true" \
     -H "X-Scrape-Token: your_token"

# Reset registry (re-classifies all funds on next scrape)
curl -X DELETE http://localhost:3001/api/registry \
     -H "X-Scrape-Token: your_token"
```

## Fund data structure

```js
{
  id:          "fund_1714089600000_KPRMF",
  code:        "KPRMF",
  name:        "KKP RMF Fund",
  amc:         "KKP",
  nav:         12.45,          // NAV per unit (THB)
  navDate:     "2026-04-25",   // actual SEC NAV date
  ytd:         3.21,           // year-to-date return %
  return3m:    1.10,
  return6m:    2.30,
  return1y:    8.50,
  return3y:    22.10,
  return5y:    41.80,
  risk:        5,              // SEC risk spectrum 1–8
  type:        "RMF",
  isNew:       false,
  factsheetUrl: "https://www.sec.or.th/th/Pages/Fund/FundProjectDetail.aspx?PROJ_ID=..."
}
```

## Project structure

```
SarnFund/
├── backend/
│   ├── sec-api-connector.js  # SEC API client — rate limiting, auth, all endpoints
│   ├── scraper.js            # Two-phase scrape: registry build + daily NAV fetch
│   ├── server.js             # Express API, cron scheduler, env loader
│   ├── init-data.js          # Seed script for empty data files
│   ├── .env.example          # Environment variable template
│   ├── data/                 # Runtime JSON cache (git-ignored)
│   │   ├── fund-registry.json   # Fund type mapping (7-day TTL)
│   │   ├── rmf.json             # Latest RMF fund data
│   │   ├── tesg.json            # Latest ThaiESG fund data
│   │   ├── ltf.json             # Latest LTF fund data
│   │   ├── ssf.json             # Latest SSF fund data
│   │   └── all.json             # Combined snapshot
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx  # Main page shell; shows navDate + scrape time
│   │   │   ├── FundTable.jsx        # Sortable table with SEC factsheet links
│   │   │   ├── FundChart.jsx        # Bar chart (Recharts)
│   │   │   └── KPICards.jsx         # Summary metrics
│   │   ├── pages/
│   │   │   ├── RmfPage.jsx
│   │   │   ├── ThaiEsgPage.jsx
│   │   │   ├── SsfPage.jsx
│   │   │   └── LtfPage.jsx
│   │   ├── hooks/
│   │   │   └── useFundData.js       # Fetch + dual-layer cache (server-timestamp aware)
│   │   ├── data/funds.js            # Mock/initial data + AMC colour palette
│   │   └── App.jsx                  # Router
│   ├── Dockerfile
│   └── package.json
│
├── documents/
│   ├── SETUP_GUIDE.md
│   └── IMPLEMENTATION_SUMMARY.md
├── docker-compose.yml
├── CHANGELOG.md
└── README.md
```

## Supported AMCs

| Code | Thai name |
|------|-----------|
| KKP | เกียรตินาคินภัทร |
| Krungsri | กรุงศรี |
| BBL | บัวหลวง |
| TISCO | ทิสโก้ |
| SCB | ไทยพาณิชย์ |
| KAsset | กสิกรไทย |
| KTAM | กรุงไทย |
| ONE | วรรณ |
| UOB | ยูโอบี |
| Principal | พรินซิพัล |
| Eastspring | อีสท์สปริง |
| Asset Plus | แอสเซทพลัส |
| DAOL | ดาโอ |
| KWI | เคดับบลิวไอ |
| LH Fund | แลนด์แอนด์เฮ้าส์ |
| MFC | เอ็มเอฟซี |
| TALIS | ทาลิส |
| XSpring | เอ็กซ์สปริง |

## Docker deployment

```yaml
# docker-compose.yml (abbreviated)
services:
  backend:
    build: ./backend
    env_file: ./backend/.env      # loads SEC keys + SCRAPE_TOKEN
    environment: [PORT=3001]
    volumes: [./backend/data:/app/data]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]

  frontend:
    build: ./frontend
    ports: ["8091:80"]
    depends_on: [backend]
```

```bash
docker compose up -d --build   # build and start
docker compose logs -f backend # stream backend logs
docker compose down            # stop
```

## Security

- SEC API keys stored only in `backend/.env` (git-ignored); never in source code
- `POST /api/scrape` requires `X-Scrape-Token` header matching `SCRAPE_TOKEN` env var
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `HSTS`
- CORS configurable via `CORS_ORIGIN` environment variable
- Request body size limited to 10 MB

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `SEC API 401` | Check `SEC_FACTSHEET_KEY` / `SEC_DAILYINFO_KEY` in `.env` |
| `No data` after first start | Run `npm run scrape` (or `POST /api/scrape?force=true`); registry build on first run takes a few minutes |
| Registry classification misses funds | `DELETE /api/registry` then re-scrape — forces fresh policy fetch |
| Rate limit 421/429 logged | Normal under heavy load; connector backs off automatically (1 s → 2 s → 3 s) |
| Docker container missing keys | Confirm `backend/.env` exists and `env_file` is in `docker-compose.yml` |
| Stale browser data | Click **Update Data** button — clears localStorage cache and re-fetches |

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- Data provided by the [SEC Thailand Open Data API](https://secopendata.sec.or.th/)
- Built for the Thai long-term investment community
