# SarnFund Backend

Express API server that fetches Thai mutual fund data from the **SEC Thailand Open Data API v2** (`api.sec.or.th`) and serves it to the frontend.

## Files

| File | Purpose |
|------|---------|
| `sec-api-connector.js` | SEC API client — rate limiting, primary/secondary key failover, all endpoints, `numVal` helper |
| `scraper.js` | Two-phase scrape: fund registry build + daily NAV fetch |
| `server.js` | Express routes, cron scheduler (01:00 AM daily), inline `.env` loader (checks root/local paths) |
| `init-data.js` | Seed script for empty cache files |

## Setup

```bash
# In the SarnFund root directory:
cp .env.example .env   # fill in all four SEC subscription keys + SCRAPE_TOKEN

# In the backend directory:
npm install
npm run scrape         # first-time registry build (2–5 min) + NAV fetch
npm start
```

Get subscription keys at [secopendata.sec.or.th/sec-open-apis](https://secopendata.sec.or.th/sec-open-apis) — subscribe to **Fund Factsheet API** and **Fund Daily Info API**. Each subscription provides a Primary Key and a Secondary Key.

## Scripts

```bash
npm start       # production server
npm run dev     # nodemon (auto-reload)
npm run scrape  # run scraper directly
npm run init    # seed empty data files
```

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SEC_FACTSHEET_KEY` | Yes | — | Fund Factsheet API primary subscription key |
| `SEC_FACTSHEET_KEY_2` | Recommended | — | Fund Factsheet API secondary key (auto-retry on 401) |
| `SEC_DAILYINFO_KEY` | Yes | — | Fund Daily Info API primary subscription key |
| `SEC_DAILYINFO_KEY_2` | Recommended | — | Fund Daily Info API secondary key (auto-retry on 401) |
| `SCRAPE_TOKEN` | Recommended | — | Protects `POST /api/scrape` via `X-Scrape-Token` header |
| `PORT` | No | 3001 | Server port |
| `CORS_ORIGIN` | No | `*` | Restrict CORS in production |

Secondary keys are optional but enable zero-downtime key rotation: if the primary key returns 401, the connector retries automatically with the secondary — no restart required.

## API endpoints

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
| DELETE | `/api/registry` | — | Clear 7-day registry cache; next scrape rebuilds it |

## Caching

| Cache file | TTL | Contents |
|------------|-----|----------|
| `data/fund-registry.json` | 7 days | Fund type, class, risk classification for all active funds |
| `data/rmf.json` | 24 h | Latest RMF NAV + performance |
| `data/tesg.json` | 24 h | Latest ThaiESG NAV + performance |
| `data/ltf.json` | 24 h | Latest LTF NAV + performance |
| `data/ssf.json` | 24 h | Latest SSF NAV + performance |
| `data/all.json` | 24 h | Combined snapshot |

Daily scrape runs automatically at **01:00 AM** via `node-cron`.

## Rate limiting

- 120 ms between requests (≈ 8 calls/sec, well under the SEC limit of 3,000/300 s)
- Exponential backoff on HTTP 421/429: 1 s → 2 s → 3 s, max 3 retries
- Promise-chain `RateLimiter` — safe under concurrent callers; no timestamp-race condition

## SEC API v2 notes

- Empty fields are returned as `"-"` (dash string) instead of JSON `null`
- `numVal(v)` exported from `sec-api-connector.js` safely parses any field: handles `null`, `"-"`, `""`, `NaN` → returns 0 (or a custom fallback)
- HTTP `204 No Content` = no data for that date (weekend/holiday); treated the same as null
- `getLatestNav()` tries today then falls back up to 5 days to handle Thai market holidays
