# SarnFund Backend

Express API server that fetches Thai mutual fund data from the **SEC Thailand Open Data API v2** and serves it to the frontend.

## Files

| File | Purpose |
|------|---------|
| `sec-api-connector.js` | SEC API client — rate limiting, retry, all endpoints |
| `scraper.js` | Two-phase scrape: fund registry build + daily NAV fetch |
| `server.js` | Express routes, cron scheduler, `.env` loader |
| `init-data.js` | Seed script for empty cache files |
| `.env.example` | Environment variable template |

## Setup

```bash
cp .env.example .env   # fill in SEC_FACTSHEET_KEY and SEC_DAILYINFO_KEY
npm install
npm run scrape         # first-time registry build (2–5 min) + NAV fetch
npm start
```

Get subscription keys at [secopendata.sec.or.th/sec-open-apis](https://secopendata.sec.or.th/sec-open-apis)
— subscribe to **Fund Factsheet API** and **Fund Daily Info API**.

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
| `SEC_FACTSHEET_KEY` | Yes | — | Fund Factsheet API subscription key |
| `SEC_DAILYINFO_KEY` | Yes | — | Fund Daily Info API subscription key |
| `SCRAPE_TOKEN` | Recommended | — | Protects `POST /api/scrape` |
| `PORT` | No | 3001 | Server port |
| `CORS_ORIGIN` | No | `*` | Restrict CORS in production |

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/funds/rmf` | RMF fund data |
| GET | `/api/funds/tesg` | ThaiESG fund data |
| GET | `/api/funds/ltf` | LTF fund data |
| GET | `/api/funds/ssf` | SSF fund data |
| GET | `/api/funds/all` | All four types |
| GET | `/api/health` | Keys, registry, cache status |
| GET | `/api/stats` | Fund counts per type |
| POST | `/api/scrape` | Manual scrape (`X-Scrape-Token` required; `?force=true` to bypass cache) |
| DELETE | `/api/registry` | Clear 7-day registry cache |

## Caching

| Cache file | TTL | Contents |
|------------|-----|----------|
| `data/fund-registry.json` | 7 days | Fund type + risk classification for all active funds |
| `data/rmf.json` | 24 h | Latest RMF NAV + performance |
| `data/tesg.json` | 24 h | Latest ThaiESG NAV + performance |
| `data/ltf.json` | 24 h | Latest LTF NAV + performance |
| `data/ssf.json` | 24 h | Latest SSF NAV + performance |
| `data/all.json` | 24 h | Combined snapshot |

Daily scrape runs automatically at **01:00 AM** via `node-cron`.

## Rate limiting

- 120 ms between requests (≈ 8 calls/sec, well under the SEC limit of 3,000/300 s)
- Exponential backoff on HTTP 421/429: 1 s → 2 s → 3 s, max 3 retries
- Promise-chain `RateLimiter` — safe under concurrent callers
