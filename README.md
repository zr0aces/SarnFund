# SanFund

A comprehensive, full-stack mutual fund dashboard designed to track and analyze RMF (Retirement Mutual Fund) and ThaiESG funds. The system automates data collection from external sources, processes it for specific Asset Management Companies (AMCs), and presents it through an interactive, high-performance web interface.

## System Overview

SanFund operates on a modern split-stack architecture:

1. **Data Ingestion Layer (Backend)**:
    - Utilizes **Playwright** for robust scraping of fund data from `settrade.com`.
    - Implements **Node.js** scripts to fetch, normalize, and filter data.
    - Focuses on four key AMCs: **KKP**, **Krungsri**, **BBL** (Bangkok Bank), and **TISCO**.
    - Stores processed data in a local JSON-based caching system to ensure low latency and reduced upstream load.

2. **Presentation Layer (Frontend)**:
    - A **React**-based single-page application (SPA).
    - Delivers real-time visualization of fund performance (NAV, Returns: YTD, 1Y, 3Y, 5Y).
    - Features distinct dashboards for **RMF** and **ThaiESG** categories.

## Tech Stack

### Frontend

- **Core**: [React](https://react.dev/) (v18), [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/) (v6)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v3) - Utility-first CSS framework
- **Visualization**: [Recharts](https://recharts.org/) - Composable charting library
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend

- **Runtime**: [Node.js](https://nodejs.org/)
- **API Server**: [Express](https://expressjs.com/)
- **Scraping Engine**: [Playwright](https://playwright.dev/) - Headless browser automation
- **Scheduling**: [Node-cron](https://www.npmjs.com/package/node-cron) - Task scheduling

### Infrastructure & DevOps

- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (Reverse proxy configuration included)
- **Scripts**: Bash scripts (`refetch_funds.sh`) for utility operations

## Features

- **Automated Data Collection**: Scheduled scraping tailored to Settrade's structure.
- **Smart Caching**: 24-hour data persistence to minimize redundant network requests.
- **AMC Filtering**: Proprietary normalization logic to map various fund naming conventions to standardized AMC codes.
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS.
- **Docker Ready**: Tailored `Dockerfile` and `docker-compose.yml` for instant deployment.

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npx playwright install chromium
npm start
```

The backend will run on <http://localhost:3001>

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on <http://localhost:5173>

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
├── frontend/             # Frontend React app
│   ├── src/             # Source code
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── data/        # Mock/fallback data
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
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

- RMF Funds: <https://www.settrade.com/th/mutualfund/screening> (RMF filter)
- ThaiESG Funds: <https://www.settrade.com/th/mutualfund/screening> (TESG filter)

## AMCs Covered

- **KKP** (เกียรตินาคินภัทร)
- **Krungsri** (กรุงศรี)
- **BBL** (บัวหลวง - Bangkok Bank)
- **TISCO** (ทิสโก้)

## License

MIT
