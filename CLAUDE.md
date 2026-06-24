# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# SarnFund — Developer Guide

SarnFund is a mutual fund analytics dashboard for Thai tax-saving investments (RMF, SSF, TESG, LTF). It fetches data from the **SEC Thailand Open Data API v2** (`api.sec.or.th`) using subscription-key authentication.

---

## Commands

```bash
# Backend
cd backend && npm run dev      # nodemon watch mode, API on :3001
cd backend && npm start        # production start
cd backend && npm run scrape   # run two-phase scrape manually (2–5 min first run)
cd backend && npm run init     # seed initial data without full scrape

# Frontend
cd frontend && npm run dev     # Vite dev server on :5173, proxies /api/* to :3001
cd frontend && npm run build   # production build → dist/
cd frontend && npm run lint    # ESLint (max-warnings 0)
cd frontend && npm run preview # preview production build locally
```

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
# Setup Env (at project root)
cp .env.example .env   # fill in SEC_FACTSHEET_KEY, SEC_DAILYINFO_KEY, SCRAPE_TOKEN at root

# Backend
cd backend
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

- All endpoints moved to `/v2/fund/...` (old `/FundFactsheet/` and `/FundDailyInfo/` paths are deprecated)
- All responses are cursor-paginated: `{ message, page_size, next_cursor, items[] }`; `_getAllPages()` in connector handles this transparently
- AMC list: `amc_id` field removed; match AMCs by `comp_name_en`/`comp_name_th` via `AMC_NAME_PATTERNS` in `scraper.js`
- Fund status: `'Registered'` (was `'RG'`); also `'IPO'` for newly launched funds
- Fund type detection: SSF/TESG → `fund_class_tax_incentive_type` in profiles; RMF/LTF → `spec_code` in `/general-info/specifications`
- NAV endpoint: `sell_price`/`buy_price` are top-level fields (were nested under `amc_info`); `change_val`/`change_percent` removed — stored as `0` in fund data
- Performance endpoint: returns rows `{ reference_period, performance_value }` — `parsePerformanceV2()` in `scraper.js` maps these to `{ ytd, month_3, ... }`
- HTTP `204` → empty `items[]` array (same semantic: no data for that date)
- Rate limit: 5,000 calls / 300 s per key; connector enforces 120 ms between calls

---

## Data Flow

### Phase 1 — Fund registry (7-day TTL)

```
getAmcList()  →  match 18 AMCs by name via AMC_NAME_PATTERNS
    └─ getFundProfiles({ company_info: unique_id, fund_status: 'Registered' })  [batched ×5]
        ├─ fund_class_tax_incentive_type === 'SSF'       →  type = SSF  (no extra call)
        ├─ fund_class_tax_incentive_type === 'Thai ESG'  →  type = TESG (no extra call)
        └─ no tax incentive type  →  getFundSpecifications(proj_id)  [batched ×5]
               └─ matchesFundType(spec, type)  →  RMF | LTF
                   └─ save fund-registry.json  (proj_id, code, name, amc, class, type, riskLevel=0)
```

### Phase 2 — Daily NAV fetch (24-hour TTL)

```
loadRegistry()
    └─ getLatestNav(proj_id, 5, fundClass)  [batched ×5]  →  tries today … up to 5 days back
        └─ getFundPerformance()  →  parsePerformanceV2()  [non-fatal]
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
| `navChange` | — | Always `0` — removed in SEC API v2 `daily-info/nav` |
| `navChangePercent` | — | Always `0` — removed in SEC API v2 `daily-info/nav` |
| `netAsset` | `net_asset` | Total fund AUM in THB |
| `sellPrice` | `sell_price` | Top-level in v2 (was `amc_info.sell_price`) |
| `buyPrice` | `buy_price` | Top-level in v2 (was `amc_info.buy_price`) |
| `ytd`…`return5y` | `reference_period` + `performance_value` rows | Parsed by `parsePerformanceV2()` |
| `risk` | — | Always `0` — requires separate `/v2/fund/factsheet/risk-spectrum` call |

---

## Key Source Files

| File | Purpose |
|------|---------|
| `backend/sec-api-connector.js` | All SEC API calls: `_get`, `_post`, rate limiter, `numVal`, `matchesFundType`, `runBatched` |
| `backend/scraper.js` | Two-phase scrape logic; fund registry; NAV + performance fetch |
| `backend/server.js` | Express routes, cron (01:00 AM daily), inline `.env` loader (checks root/local paths) |
| `backend/init-data.js` | Seeds initial data (called by `npm run init`) |
| `.env.example` | Template for all required and optional env vars at root level |
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
- **Design**: Tailwind CSS + Lucide icons
- **Charts**: Recharts
- **API proxy** (dev): Vite proxies `/api/*` to `http://localhost:3001` via `vite.config.js`

- **ESM**: Both `backend/` and `frontend/` use `"type": "module"` — use `import`/`export`, no `require()`

*Last Updated: June 24, 2026 — migrated to SEC API v2*
