# SanFund

A comprehensive mutual fund dashboard for RMF (Retirement Mutual Fund) and ThaiESG funds, featuring web scraping from settrade.com and real-time data caching.

## Features

- **Web Scraping**: Automated data collection from settrade.com
- **Selected AMCs**: Focus on KKP, Krungsri, BBL (Bangkok Bank), and TISCO funds
- **24-Hour Caching**: Efficient data management with daily updates
- **Interactive Dashboards**: Separate views for RMF and ThaiESG funds
- **Real-time Updates**: Manual refresh capability with automatic daily scraping

## Architecture

This project consists of two main components:

1. **Frontend** (React + Vite): Interactive dashboard UI
2. **Backend** (Node.js + Express): Web scraper and data API

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npx playwright install chromium
npm start
```

The backend will run on http://localhost:3001

### 2. Frontend Setup

```bash
# In the root directory
npm install
npm run dev
```

The frontend will run on http://localhost:5173

### 3. Initial Data Scraping

```bash
cd backend
npm run scrape
```

This will scrape data from settrade.com and cache it for 24 hours.

## Project Structure

```
SanFund/
├── backend/              # Backend scraper service
│   ├── server.js        # Express API server
│   ├── scraper.js       # Web scraper logic
│   ├── data/            # Cached JSON data
│   └── package.json
├── src/                 # Frontend React app
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   └── data/           # Mock/fallback data
└── package.json        # Frontend dependencies
```

## API Endpoints

- `GET /api/funds/rmf` - Get RMF fund data
- `GET /api/funds/tesg` - Get ThaiESG fund data
- `GET /api/funds/all` - Get all fund data
- `POST /api/scrape` - Manually trigger scraping
- `GET /api/health` - Health check and cache status

## Configuration

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

### Backend

The backend uses Playwright for web scraping and automatically:
- Scrapes data daily at 1 AM
- Caches data for 24 hours
- Filters funds to only include KKP, Krungsri, BBL, and TISCO

## Deployment

### Using Docker

```bash
docker-compose up -d
```

### Production Notes

- Set up proper CORS configuration for production domains
- Consider adding authentication for the `/api/scrape` endpoint
- Use environment variables for configuration
- Set up a process manager (PM2, systemd) for the backend
- Configure reverse proxy (nginx) for production

## Data Sources

- RMF Funds: https://www.settrade.com/th/mutualfund/screening (RMF filter)
- ThaiESG Funds: https://www.settrade.com/th/mutualfund/screening (TESG filter)

## AMCs Covered

- **KKP** (เกียรตินาคินภัทร)
- **Krungsri** (กรุงศรี)
- **BBL** (บัวหลวง - Bangkok Bank)
- **TISCO** (ทิสโก้)

## License

MIT

