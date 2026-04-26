# SarnFund — Developer Guide

SarnFund is a mutual fund analytics dashboard for Thai tax-saving investments (RMF, SSF, TESG, LTF). It fetches data from the **SEC Thailand Open Data API v2** (`api.sec.or.th`) using subscription-key authentication.

---

## Project Architecture

### Service Map

| Service | Image | Role | Port |
| :--- | :--- | :--- | :--- |
| **backend** | built from `./backend` | Express API, SEC connector, cron scraper | `3001` (internal) |
| **frontend** | built from `./frontend` | One-shot React/Vite builder — exits after `dist/` is copied to shared volume | N/A |
| **nginx** | `nginx:1.27-alpine` (official) | Unified gateway: serves static files + proxies `/api/` to backend | `8091` (public) |

### Nginx Routing

- `GET /` and all non-API paths → serves React static files from `frontend_dist` Docker volume
- `GET /POST /api/*` → proxied to `backend:3001`
- Config file: `nginx/default.conf` (volume-mounted; edit without rebuild)

### Docker startup order

1. `frontend` service builds React and copies `dist/` to `frontend_dist` named volume, then exits with code 0
2. `nginx` waits for `frontend` to complete (`condition: service_completed_successfully`)
3. `backend` starts independently

---

## Development Workflows

### Local development (no Docker)

```bash
# Backend
cd backend
cp .env.example .env   # fill in SEC_FACTSHEET_KEY, SEC_DAILYINFO_KEY, SCRAPE_TOKEN
npm install
npm run scrape         # first-time registry build (2–5 min) + NAV fetch
npm start              # API on :3001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev            # Vite dev server on :5173 — proxies /api/* to :3001
```

### Docker deployment

```bash
# First deploy or after code changes
docker compose up -d --build

# After nginx/config change only (no code rebuild)
docker compose restart nginx

# Upgrade nginx version: edit image tag in docker-compose.yml, then:
docker compose pull nginx && docker compose up -d nginx

# Rebuild frontend only
docker compose build frontend && docker compose up -d

# Trigger initial data scrape
curl -X POST "http://localhost:8091/api/scrape?force=true" \
     -H "X-Scrape-Token: <SCRAPE_TOKEN>"
```

---

## SEC API v2

### Authentication

Every request requires:
```
Header: Ocp-Apim-Subscription-Key: <key>
```

Each subscription product (Fund Factsheet API, Fund Daily Info API) issues a **Primary Key** and a **Secondary Key**. The connector automatically retries with the secondary key on 401 — no restart needed.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SEC_FACTSHEET_KEY` | Yes | Fund Factsheet API primary key |
| `SEC_FACTSHEET_KEY_2` | Recommended | Fund Factsheet API secondary key (401 failover) |
| `SEC_DAILYINFO_KEY` | Yes | Fund Daily Info API primary key |
| `SEC_DAILYINFO_KEY_2` | Recommended | Fund Daily Info API secondary key (401 failover) |
| `SCRAPE_TOKEN` | Recommended | Protects `POST /api/scrape` |
| `PORT` | No | Default `3001` |
| `CORS_ORIGIN` | No | Restrict CORS in production |

Register and manage keys at [secopendata.sec.or.th/sec-open-apis](https://secopendata.sec.or.th/sec-open-apis).
Old portal `api-portal.sec.or.th` is discontinued **June 30, 2026**.

### API v2 Behaviour

- Empty fields are returned as `"-"` (dash string), not JSON `null`
- Use `numVal(v)` from `sec-api-connector.js` to parse any numeric field safely — handles `null`, `"-"`, `""`, and `NaN`
- HTTP `204 No Content` = no data for that date (weekend/holiday); not an error
- Rate limit: 3,000 calls / 300 s per key; connector enforces 120 ms between calls

---

## Data Flow

### Phase 1 — Fund registry (7-day TTL)

```
getAmcList()  →  filter to 18 AMCs in AMC_MAP
    └─ getFundsByAmc()  [batched ×5]  →  filter fund_status === 'RG'
        └─ getFundPolicy()  [batched ×5]
            └─ matchesFundType()  →  RMF | SSF | TESG | LTF
                └─ save fund-registry.json  (proj_id, code, name, amc, class, type, riskLevel)
```

### Phase 2 — Daily NAV fetch (24-hour TTL)

```
loadRegistry()
    └─ getLatestNav()  [batched ×5]  →  tries today … up to 5 days back
        └─ getFundPerformance()  [non-fatal]
            └─ assemble fund object
                └─ write rmf.json, tesg.json, ltf.json, ssf.json, all.json
```

### Fund object fields

| Field | Source | Notes |
|-------|--------|-------|
| `code` | `proj_abbr_name` | Fund ticker |
| `class` | `class_abbr_name` | Unit class: A/D/I (API v2) |
| `nav` | `last_val` | NAV per unit (THB) |
| `navDate` | `nav_date` | Actual SEC market date |
| `navChange` | `change_val` | Day-over-day THB change (API v2) |
| `navChangePercent` | `change_percent` | Day-over-day % change (API v2) |
| `netAsset` | `net_asset` | Total fund AUM in THB (API v2) |
| `sellPrice` | `amc_info.sell_price` | AMC offer price (API v2) |
| `buyPrice` | `amc_info.buy_price` | AMC redemption price (API v2) |
| `ytd`…`return5y` | `performance` endpoint | % returns; may be `"-"` if removed |
| `risk` | `risk_spectrum_id` | 1–8 scale |

---

## Key Source Files

| File | Purpose |
|------|---------|
| `backend/sec-api-connector.js` | All SEC API calls: `_get`, `_post`, rate limiter, `numVal`, `matchesFundType` |
| `backend/scraper.js` | Two-phase scrape logic; fund registry; NAV + performance fetch |
| `backend/server.js` | Express routes, cron (01:00 AM daily), inline `.env` loader |
| `backend/.env.example` | Template for all required and optional env vars |
| `nginx/default.conf` | Nginx routing: static files + `/api/` proxy + gzip + asset caching |
| `docker-compose.yml` | Three-service orchestration with named volume `frontend_dist` |
| `frontend/src/hooks/useFundData.js` | Dual-layer cache (localStorage + server-timestamp guard) |
| `frontend/src/components/DashboardLayout.jsx` | NAV date badge, scrape time badge, Update Data button |

---

## Internal API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/funds/rmf` | — | RMF fund data |
| GET | `/api/funds/tesg` | — | ThaiESG fund data |
| GET | `/api/funds/ltf` | — | LTF fund data |
| GET | `/api/funds/ssf` | — | SSF fund data |
| GET | `/api/funds/all` | — | All four types combined |
| GET | `/api/health` | — | Keys, registry, cache status |
| GET | `/api/stats` | — | Fund counts per type |
| POST | `/api/scrape` | `X-Scrape-Token` | Manual scrape; `?force=true` bypasses cache |
| DELETE | `/api/registry` | — | Clear 7-day registry; forces rebuild on next scrape |

---

## Frontend

- **State**: local component state only; no global store
- **Cache**: `useFundData.js` reads localStorage first, then silently checks backend; only updates if server timestamp is newer
- **Cache key**: `fund_cache_v4_{fundType}` — bump version in hook when fund object schema changes
- **Design**: Tailwind CSS + Lucide icons + Framer Motion
- **Charts**: Recharts
- **API proxy** (dev): Vite proxies `/api/*` to `http://localhost:3001` via `vite.config.js`

*Last Updated: April 26, 2026*
