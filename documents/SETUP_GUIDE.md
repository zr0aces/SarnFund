# Setup Guide

## Prerequisites

- Node.js 18+
- npm
- Docker & Docker Compose (for containerised deployment)
- SEC Open Data API subscription keys (see below)

---

## 1. Get SEC API Keys

SarnFund uses the **official SEC Thailand Open Data API v2**. You need two subscription keys before the scraper can run.

1. Go to [secopendata.sec.or.th/sec-open-apis](https://secopendata.sec.or.th/sec-open-apis)
2. Click **Sign up** (top-right) and create an account
3. Go to **Products** and subscribe to **Fund Factsheet API** — copy the subscription key
4. Go to **Products** and subscribe to **Fund Daily Info API** — copy the subscription key
5. Put both keys in `backend/.env` (see step 2 below)

Rate limits: 3,000 calls per 300 seconds per key. The connector enforces 120 ms between calls.

---

## 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```bash
SEC_FACTSHEET_KEY=<your Fund Factsheet API key>
SEC_DAILYINFO_KEY=<your Fund Daily Info API key>
SCRAPE_TOKEN=<random secret to protect the /api/scrape endpoint>
PORT=3001
# CORS_ORIGIN=https://yourdomain.com   # uncomment in production
```

---

## 3a. Docker deployment (recommended)

```bash
# From the SarnFund root directory
docker compose up -d

# Watch startup logs
docker compose logs -f backend
```

The backend starts on port 3001 (internal). The application is available on **http://localhost:8091**, which is managed by the unified Nginx gateway.


### First-time data fetch

The cache is empty on first start. Trigger the initial scrape:

```bash
curl -X POST "http://localhost:3001/api/scrape?force=true" \
     -H "X-Scrape-Token: <your SCRAPE_TOKEN>"
```

The **first run** builds the fund registry (classifies every active fund from 18 AMCs as RMF/SSF/TESG/LTF). This takes **2–5 minutes** depending on API response times. Subsequent daily runs are much faster because the registry is cached for 7 days.

### Common Docker commands

```bash
docker compose up -d --build   # rebuild after code changes
docker compose logs -f         # stream logs for all services
docker compose logs -f backend # backend only
docker compose down            # stop all containers
docker compose restart backend # restart backend only
```

---

## 3b. Local development

### Backend

```bash
cd backend
npm install
npm run scrape    # builds registry + fetches NAV data (first run: ~2–5 min)
npm start         # API server on http://localhost:3001
```

For auto-reload during development:

```bash
npm run dev       # uses nodemon
```

### Frontend

In a separate terminal from the project root:

```bash
cd frontend
npm install
npm run dev       # Vite dev server on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:3001` automatically (configured in `vite.config.js`).

---

## Data management

### Cache locations

| Cache | Location | TTL |
|-------|----------|-----|
| Fund registry (type classification) | `backend/data/fund-registry.json` | 7 days |
| RMF NAV data | `backend/data/rmf.json` | 24 hours |
| ThaiESG NAV data | `backend/data/tesg.json` | 24 hours |
| LTF NAV data | `backend/data/ltf.json` | 24 hours |
| SSF NAV data | `backend/data/ssf.json` | 24 hours |
| Combined snapshot | `backend/data/all.json` | 24 hours |
| Browser cache | `localStorage` (key `fund_cache_v4_<type>`) | 24 hours |

### Manual operations

```bash
# Trigger a scrape (skip cache)
curl -X POST "http://localhost:3001/api/scrape?force=true" \
     -H "X-Scrape-Token: <SCRAPE_TOKEN>"

# Reset fund registry (forces full re-classification next scrape)
curl -X DELETE http://localhost:3001/api/registry \
     -H "X-Scrape-Token: <SCRAPE_TOKEN>"

# Run scraper directly (development)
cd backend && npm run scrape
```

### Automatic scraping

The backend cron job runs daily at **01:00 AM** (server local time) and refreshes the NAV cache. Registry is only rebuilt if older than 7 days.

---

## API reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/funds/rmf` | — | RMF fund data |
| GET | `/api/funds/tesg` | — | ThaiESG fund data |
| GET | `/api/funds/ltf` | — | LTF fund data |
| GET | `/api/funds/ssf` | — | SSF fund data |
| GET | `/api/funds/all` | — | All four types |
| GET | `/api/health` | — | Service status, key config, registry, cache ages |
| GET | `/api/stats` | — | Fund counts per type |
| POST | `/api/scrape` | `X-Scrape-Token` | Manual scrape; add `?force=true` to skip cache |
| DELETE | `/api/registry` | — | Clear registry cache |

---

## Troubleshooting

### `SEC API 401 – check subscription key`

Your `SEC_FACTSHEET_KEY` or `SEC_DAILYINFO_KEY` is missing or invalid.

1. Re-check your keys in `backend/.env`
2. Confirm the product subscription is **Active** in the SEC portal
3. For Docker: confirm `backend/.env` exists and `docker-compose.yml` has `env_file: ./backend/.env`

### No funds returned after scrape

The registry may have been built before your `.env` was configured.

```bash
curl -X DELETE http://localhost:3001/api/registry
curl -X POST "http://localhost:3001/api/scrape?force=true" \
     -H "X-Scrape-Token: <token>"
```

### `Invalid or missing scrape token` on POST /api/scrape

Set `SCRAPE_TOKEN` in `backend/.env` and restart the server. Pass the same value as `X-Scrape-Token` header.

### Rate limit warnings in logs (`421` / `429`)

Normal under heavy concurrent load. The connector backs off automatically (1 s → 2 s → 3 s). If it persists, increase `REQUEST_DELAY_MS` in `sec-api-connector.js`.

### Stale data in browser

Click **Update Data** on the dashboard — this clears the localStorage cache and re-fetches from the backend. The page does not need to reload.

### Port 3001 already in use

```bash
PORT=3002 node server.js
```

Update `VITE_API_URL` in `frontend/.env` if running locally.

### Docker container exits immediately

```bash
docker compose logs backend
```

Likely cause: `backend/.env` missing or malformed. Confirm the file exists with valid keys.

---

## Production checklist

- [ ] `SEC_FACTSHEET_KEY` and `SEC_DAILYINFO_KEY` set in `backend/.env`
- [ ] `SCRAPE_TOKEN` set to a strong random value
- [ ] `CORS_ORIGIN=https://yourdomain.com` set (restrict to your domain)
- [ ] HTTPS enabled (required for HSTS header to be effective)
- [ ] `backend/data/` volume persisted across container restarts
- [ ] Monitoring on `/api/health` (alerts if `cache.rmf.valid` is false)
- [ ] Log aggregation configured (`docker compose logs` or a log driver)

---

## Nginx reverse proxy

The project is already configured with an internal Nginx gateway in `docker-compose.yml`. If you need to put another proxy in front of it (e.g., for SSL via Certbot or Cloudflare), point your external proxy to port `8091`.

