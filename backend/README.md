# SarnFund Backend Scraper Service

This backend service scrapes mutual fund data from settrade.com and provides it via a REST API.

## Features

- Web scraping from settrade.com for RMF and ThaiESG mutual fund data
- 24-hour caching to minimize scraping frequency
- Automatic daily scraping at 1 AM
- REST API endpoints for frontend consumption
- CORS enabled for frontend integration

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Initialize data directory (creates initial mock data):
```bash
npm run init
```

## Running

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Manual Scraping
To manually trigger a scrape:
```bash
npm run scrape
```

Or via API:
```bash
curl -X POST http://localhost:3001/api/scrape
```

## API Endpoints

### GET /api/funds/rmf
Get RMF mutual fund data.

Response:
```json
{
  "success": true,
  "cached": true,
  "timestamp": 1234567890,
  "data": [...]
}
```

### GET /api/funds/tesg
Get ThaiESG mutual fund data.

### GET /api/funds/all
Get all mutual fund data (both RMF and TESG).

### POST /api/scrape
Manually trigger scraping. Will skip if cache is still valid.

### GET /api/health
Health check endpoint with cache status.

## Caching

- Data is cached for 24 hours
- Cache is stored in `backend/data/` directory
- Automatic scraping runs daily at 1 AM
- Cache validation happens on each API request

## Data Structure

Each fund object contains:
```json
{
  "id": "unique_id",
  "code": "FUND-CODE",
  "name": "Fund Name",
  "amc": "AMC Name",
  "nav": 10.50,
  "ytd": 5.2,
  "return1y": 8.5,
  "return2y": 12.3,
  "return3y": 15.7,
  "return5y": 20.1,
  "risk": 5,
  "type": "Fund Type",
  "isNew": false
}
```

## Environment Variables

- `PORT` - Server port (default: 3001)

## Notes

- The scraper uses Playwright with Chromium
- Scraping is resource-intensive, hence the 24-hour cache
- The scraper respects the settrade.com website structure
- If the website structure changes, the scraper may need updates
