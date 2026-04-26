# SarnFund

**SarnFund** is a Thai mutual fund analytics dashboard for tax-saving investments. It tracks RMF, ThaiESG, LTF, and SSF funds across 18 Asset Management Companies using the **official SEC Open Data API v2** — no scraping, no brittle cookies.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](docker-compose.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Data](https://img.shields.io/badge/Data-SEC%20Open%20Data%20API%20v2-orange)](https://secopendata.sec.or.th/sec-open-apis)

## Features

- **Official SEC API v2** — data sourced from `api.sec.or.th`; no third-party scraping
- **Four fund types** — RMF, ThaiESG (TESG), LTF, SSF
- **18 AMCs tracked** — KKP, Krungsri, BBL, TISCO, SCB, KAsset, KTAM, ONE, UOB, Principal, Eastspring, and more
- **Primary + Secondary key support** — automatic 401 failover; zero-downtime key rotation
- **Two-phase caching** — 7-day fund registry (static metadata) + 24-hour NAV cache (daily prices)
- **Rich per-fund data** — NAV, day change (THB + %), total AUM, sell/buy prices, unit class, performance
- **Smart frontend cache** — localStorage with server-timestamp comparison; shows stale data instantly, silently updates in background
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
   │    Backend     │             │  Nginx Gateway  │
   │  Node.js 22    │◄────────────│  nginx:1.27     │
   │                │  proxy_pass │                 │
   │  Express API   │             │  :8091 (public) │
   │  SEC Connector │             │  Static files   │
   │  Cron (1 AM)   │             │  /api/* → :3001 │
   │  JSON Cache    │             └─────────────────┘
   └───────┬────────┘                     ▲
           │                              │ built dist/
           │  Ocp-Apim-Subscription-Key   │
           │                    ┌─────────┴───────┐
   ┌───────▼────────────────┐   │ Frontend Builder│
   │  SEC Open Data API v2  │   │  node:22-alpine │
   │  api.sec.or.th         │   │  React + Vite   │
   │                        │   └─────────────────┘
   │  /FundFactsheet/…      │   ← AMC, funds, policy, performance, URLs
   │  /FundDailyInfo/…      │   ← Daily NAV, AUM, day change, sell/buy price
   └────────────────────────┘
```

### Three-service Docker setup

| Service | Image | Role |
|---------|-------|------|
| `backend` | built from `./backend` | Express API + cron scraper; internal only |
| `frontend` | built from `./frontend` | One-shot React builder; exits after copying `dist/` to shared volume |
| `nginx` | `nginx:1.27-alpine` (official) | Serves static files + proxies `/api/` to backend |

### Two-phase scraping

| Phase | Trigger | TTL | What it does |
|-------|---------|-----|--------------|
| **Registry build** | First run, or weekly | 7 days | Fetches AMC list → fund lists → fund policies; classifies each fund as RMF/SSF/TESG/LTF; saves `data/fund-registry.json` |
| **Daily NAV fetch** | Cron 1 AM, or manual | 24 hours | Reads registry; fetches latest NAV + day change + AUM + performance for each fund; saves per-type JSON files |

Both phases use **batched concurrency** (5 requests at a time) against the rate limiter.

## Quick Start

### Option 1 — Docker (recommended)

```bash
# 1. Copy env template and fill in your SEC API keys
cp backend/.env.example backend/.env
#    Edit backend/.env — at minimum set SEC_FACTSHEET_KEY, SEC_DAILYINFO_KEY, SCRAPE_TOKEN

# 2. Build and start all services
docker compose up -d --build

# 3. Trigger the first data fetch (takes 2–5 min on first run)
curl -X POST "http://localhost:8091/api/scrape?force=true" \
     -H "X-Scrape-Token: <your-SCRAPE_TOKEN>"

# 4. Open the dashboard
open http://localhost:8091
```

### Option 2 — Local development

```bash
# Backend
cd backend
cp .env.example .env      # fill in SEC keys
npm install
npm run scrape            # first-time registry build + NAV fetch (~2–5 min)
npm start                 # API on :3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev               # Vite dev server on :5173
```

## Getting SEC API Keys

Each API product gives you a **Primary Key** and a **Secondary Key**. Use both — the secondary is a hot standby for zero-downtime key rotation.

1. Go to [secopendata.sec.or.th/sec-open-apis](https://secopendata.sec.or.th/sec-open-apis)
2. Sign up / sign in
3. Navigate to **Products** and subscribe to:
   - **Fund Factsheet API** → copy Primary Key → `SEC_FACTSHEET_KEY`, copy Secondary Key → `SEC_FACTSHEET_KEY_2`
   - **Fund Daily Info API** → copy Primary Key → `SEC_DAILYINFO_KEY`, copy Secondary Key → `SEC_DAILYINFO_KEY_2`
4. Put all four keys in `backend/.env`

Rate limit: **3,000 calls / 300 seconds** per key. The connector enforces a 120 ms inter-request delay with exponential backoff.

> **Portal note**: The old developer portal at `api-portal.sec.or.th` will be discontinued on **June 30, 2026**. Use `secopendata.sec.or.th` for all account and subscription management.

## Configuration

### `backend/.env`

```bash
# Fund Factsheet API — primary and secondary subscription keys
SEC_FACTSHEET_KEY=your_factsheet_primary_key
SEC_FACTSHEET_KEY_2=your_factsheet_secondary_key

# Fund Daily Info API — primary and secondary subscription keys
SEC_DAILYINFO_KEY=your_dailyinfo_primary_key
SEC_DAILYINFO_KEY_2=your_dailyinfo_secondary_key

# Protects the POST /api/scrape endpoint
SCRAPE_TOKEN=change_me_to_a_random_secret

# Optional
PORT=3001
CORS_ORIGIN=https://yourdomain.com
```

The secondary keys (`_2`) are optional but recommended. If the primary key returns 401, the connector automatically retries with the secondary key — no restart required.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/funds/rmf` | — | RMF fund data |
| GET | `/api/funds/tesg` | — | ThaiESG fund data |
| GET | `/api/funds/ltf` | — | LTF fund data |
| GET | `/api/funds/ssf` | — | SSF fund data |
| GET | `/api/funds/all` | — | All four fund types combined |
| GET | `/api/health` | — | Service status, key config, registry info, cache ages |
| GET | `/api/stats` | — | Fund counts per type |
| POST | `/api/scrape` | `X-Scrape-Token` | Manual scrape; add `?force=true` to bypass cache |
| DELETE | `/api/registry` | — | Clear fund registry cache (forces full rebuild on next scrape) |

### Example responses

```bash
# Health check
curl http://localhost:8091/api/health
# {
#   "status": "ok",
#   "secApi": {
#     "factsheetKey": true,  "factsheetKey2": true,
#     "dailyInfoKey": true,  "dailyInfoKey2": true
#   },
#   "registry": { "funds": 142, "lastBuilt": "2026-04-26T01:00:00.000Z" },
#   "cache": {
#     "rmf":  { "valid": true, "funds": 54, "lastUpdated": "..." },
#     "tesg": { "valid": true, "funds": 28, "lastUpdated": "..." },
#     "ltf":  { "valid": true, "funds": 18, "lastUpdated": "..." },
#     "ssf":  { "valid": true, "funds": 42, "lastUpdated": "..." }
#   }
# }

# Force a manual scrape
curl -X POST "http://localhost:8091/api/scrape?force=true" \
     -H "X-Scrape-Token: your_token"

# Reset registry (re-classifies all funds on next scrape)
curl -X DELETE http://localhost:8091/api/registry
```

## Fund data structure

Each fund object returned by the API:

```js
{
  id:               "fund_1714089600000_KPRMF",
  code:             "KPRMF",           // SEC proj_abbr_name
  name:             "KKP RMF Fund",
  amc:              "KKP",
  class:            "A",               // unit class (A/D/I) — API v2
  nav:              12.45,             // NAV per unit (THB)
  navDate:          "2026-04-25",      // actual SEC NAV date
  navChange:        0.03,              // day-over-day change (THB) — API v2
  navChangePercent: 0.24,              // day-over-day change (%) — API v2
  netAsset:         4823000000,        // total fund AUM (THB) — API v2
  sellPrice:        12.47,             // AMC offer price — API v2
  buyPrice:         12.43,             // AMC redemption price — API v2
  ytd:              3.21,              // year-to-date return %
  return3m:         1.10,
  return6m:         2.30,
  return1y:         8.50,
  return2y:         0,                 // not available from SEC API
  return3y:         22.10,
  return5y:         41.80,
  risk:             5,                 // SEC risk spectrum 1–8
  type:             "RMF",
  isNew:            false,
  factsheetUrl:     "https://www.sec.or.th/th/Pages/Fund/FundProjectDetail.aspx?PROJ_ID=..."
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
│   │   │   ├── DashboardLayout.jsx  # Main page shell; NAV date + scrape time badges
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
│   ├── nginx.conf            # (embedded in Docker image — not used at runtime)
│   ├── Dockerfile            # node:22-alpine builder only; no nginx stage
│   └── package.json
│
├── nginx/
│   └── default.conf          # Volume-mounted into nginx:1.27-alpine container
│
├── documents/
│   ├── SETUP_GUIDE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── SECURITY_SUMMARY.md
├── docker-compose.yml
├── CHANGELOG.md
└── README.md
```

## Supported AMCs (18)

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

```bash
docker compose up -d --build   # build and start all three services
docker compose logs -f backend # stream backend logs
docker compose logs -f nginx   # stream nginx logs
docker compose down            # stop all services

# Upgrade nginx without rebuilding frontend
# Edit docker-compose.yml: image: nginx:1.29-alpine
docker compose pull nginx && docker compose up -d nginx
```

The `frontend` service is a one-shot builder — it runs `npm run build`, copies `dist/` to a named Docker volume (`frontend_dist`), then exits. The `nginx` service waits for the builder to complete before starting (`condition: service_completed_successfully`).

## Security

- SEC API keys stored only in `backend/.env` (git-ignored); never in source code
- Primary + Secondary key pair per API product; secondary used automatically on 401
- `POST /api/scrape` requires `X-Scrape-Token` header matching `SCRAPE_TOKEN` env var
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `HSTS`
- CORS configurable via `CORS_ORIGIN` environment variable
- Request body size limited to 10 MB
- Backend is not externally exposed in Docker — all traffic goes through nginx

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `SEC API 401` on primary key | Check `SEC_FACTSHEET_KEY` / `SEC_DAILYINFO_KEY` in `.env`; connector auto-retries with `_2` key if configured |
| `SEC API 401` on both keys | Subscription may be inactive — check the SEC portal |
| No data after first start | Run the scrape: `curl -X POST "http://localhost:8091/api/scrape?force=true" -H "X-Scrape-Token: ..."` — registry build on first run takes 2–5 min |
| Registry misses fund types | `curl -X DELETE http://localhost:8091/api/registry` then re-scrape — forces fresh policy fetch |
| Rate limit 421/429 in logs | Normal under heavy load; connector backs off automatically (1 s → 2 s → 3 s) |
| Docker container missing keys | Confirm `backend/.env` exists; check `env_file: ./backend/.env` in `docker-compose.yml` |
| Stale browser data | Click **Update Data** button — clears localStorage cache and re-fetches |
| `frontend` builder keeps restarting | It shouldn't — `restart: "no"` is set. Check `docker compose logs frontend` |

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- Data provided by the [SEC Thailand Open Data API](https://secopendata.sec.or.th/)
- Built for the Thai long-term investment community
