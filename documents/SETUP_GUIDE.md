# Setup Guide

## Prerequisites

- Node.js 22+
- npm
- Docker & Docker Compose (for containerised deployment)
- SEC Open Data API subscription keys (see step 1)

---

## 1. Get SEC API Keys

SarnFund uses the **official SEC Thailand Open Data API v2**. You need subscription keys for two API products.

Each product subscription provides a **Primary Key** and a **Secondary Key**. Copy both — the secondary enables zero-downtime key rotation and automatic 401 failover.

**Steps:**

1. Go to [secopendata.sec.or.th/sec-open-apis](https://secopendata.sec.or.th/sec-open-apis)
2. Click **Sign up** (top-right) and create an account
3. Go to **Products** → subscribe to **Fund Factsheet API**
   - Copy the Primary Key → `SEC_FACTSHEET_KEY`
   - Copy the Secondary Key → `SEC_FACTSHEET_KEY_2`
4. Go to **Products** → subscribe to **Fund Daily Info API**
   - Copy the Primary Key → `SEC_DAILYINFO_KEY`
   - Copy the Secondary Key → `SEC_DAILYINFO_KEY_2`

Rate limits: 3,000 calls per 300 seconds per key. The connector enforces 120 ms between calls.

> **Note**: The old developer portal at `api-portal.sec.or.th` is discontinued on **June 30, 2026**. Use `secopendata.sec.or.th` for all account management.

---

## 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```bash
# Fund Factsheet API — primary and secondary keys
SEC_FACTSHEET_KEY=<your primary key>
SEC_FACTSHEET_KEY_2=<your secondary key>

# Fund Daily Info API — primary and secondary keys
SEC_DAILYINFO_KEY=<your primary key>
SEC_DAILYINFO_KEY_2=<your secondary key>

# Protects the POST /api/scrape endpoint
SCRAPE_TOKEN=<random secret>

# Optional
PORT=3001
# CORS_ORIGIN=https://yourdomain.com
```

Secondary keys (`_2`) are optional but strongly recommended. If the primary key returns 401, the connector retries automatically with the secondary — no restart required.

---

## 3a. Docker deployment (recommended)

```bash
# From the SarnFund root directory
docker compose up -d --build

# Watch startup logs
docker compose logs -f backend
```

The application is available at **http://localhost:8091** once all three services are running.

**How startup works:**
1. The `frontend` service builds the React app and copies the output to a shared Docker volume, then exits
2. The `nginx` service starts after the frontend builder completes
3. The `backend` service runs independently on port 3001 (internal only)

### First-time data fetch

The cache is empty on first start. Trigger the initial scrape through the nginx gateway:

```bash
curl -X POST "http://localhost:8091/api/scrape?force=true" \
     -H "X-Scrape-Token: <your SCRAPE_TOKEN>"
```

The **first run** builds the fund registry — classifies every active fund from 18 AMCs as RMF/SSF/TESG/LTF. This takes **2–5 minutes** depending on API response times. Subsequent daily runs are much faster because the registry is cached for 7 days.

### Common Docker commands

```bash
docker compose up -d --build       # rebuild and restart all services
docker compose logs -f             # stream logs for all services
docker compose logs -f backend     # backend only
docker compose down                # stop all containers

# Upgrade nginx without rebuilding frontend
# Edit image tag in docker-compose.yml, then:
docker compose pull nginx && docker compose up -d nginx

# Rebuild frontend only (after UI changes)
docker compose build frontend && docker compose up -d
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
# Trigger a scrape (skip cache) — use port 8091 in Docker, 3001 in local dev
curl -X POST "http://localhost:8091/api/scrape?force=true" \
     -H "X-Scrape-Token: <SCRAPE_TOKEN>"

# Reset fund registry (forces full re-classification on next scrape)
curl -X DELETE http://localhost:8091/api/registry

# Run scraper directly (local development)
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

Primary key rejected. The connector will automatically retry with the secondary key if `SEC_FACTSHEET_KEY_2` / `SEC_DAILYINFO_KEY_2` are set.

If both keys fail:
1. Re-check all four keys in `backend/.env`
2. Confirm the product subscription is **Active** in the SEC portal
3. For Docker: confirm `backend/.env` exists and `docker-compose.yml` has `env_file: ./backend/.env`

### No funds returned after scrape

The registry may have been built before `.env` was configured, or fund policy fields changed.

```bash
curl -X DELETE http://localhost:8091/api/registry
curl -X POST "http://localhost:8091/api/scrape?force=true" \
     -H "X-Scrape-Token: <token>"
```

### `Invalid or missing scrape token` on POST /api/scrape

Set `SCRAPE_TOKEN` in `backend/.env` and restart the server. Pass the same value as the `X-Scrape-Token` header.

### Rate limit warnings in logs (`421` / `429`)

Normal under heavy concurrent load. The connector backs off automatically (1 s → 2 s → 3 s, max 3 attempts). If it persists, increase `REQUEST_DELAY_MS` in `sec-api-connector.js`.

### Stale data in browser

Click **Update Data** on the dashboard — this clears the localStorage cache and re-fetches from the backend. The page does not need to reload.

### Port 3001 already in use (local dev)

```bash
PORT=3002 node server.js
```

Update `VITE_API_URL` in `frontend/.env` if running locally.

### Docker container exits immediately

```bash
docker compose logs backend
```

Likely cause: `backend/.env` missing or malformed. Confirm the file exists with valid keys.

### Frontend builder restarts in a loop

The `frontend` service has `restart: "no"` and should exit cleanly after copying the build output. If it loops, check `docker compose logs frontend` for build errors.

---

## Production checklist

- [ ] `SEC_FACTSHEET_KEY` and `SEC_DAILYINFO_KEY` set in `backend/.env`
- [ ] `SEC_FACTSHEET_KEY_2` and `SEC_DAILYINFO_KEY_2` set (secondary keys for failover)
- [ ] `SCRAPE_TOKEN` set to a strong random value
- [ ] `CORS_ORIGIN=https://yourdomain.com` set (restrict to your domain)
- [ ] HTTPS enabled (required for HSTS header to be effective)
- [ ] `backend/data/` volume persisted across container restarts
- [ ] Monitoring on `/api/health` (alerts if `cache.rmf.valid` is false)
- [ ] Log aggregation configured (`docker compose logs` or a log driver)

---

## Key rotation (zero downtime)

When a key needs to be rotated:

1. Generate a new key in the SEC portal for the relevant product
2. Set it as the secondary key (`SEC_FACTSHEET_KEY_2` or `SEC_DAILYINFO_KEY_2`) and restart backend
3. Revoke the old primary key in the SEC portal — the connector automatically falls over to the secondary
4. Promote: copy the new key to `SEC_FACTSHEET_KEY`, clear `SEC_FACTSHEET_KEY_2`, restart backend

---

## Nginx configuration

The project uses a standalone `nginx:1.27-alpine` container. Configuration lives in `nginx/default.conf` which is volume-mounted — edit and `docker compose restart nginx` to apply changes without rebuilding.

To put another reverse proxy in front (e.g., for SSL via Certbot or Cloudflare), point it to port `8091`.
