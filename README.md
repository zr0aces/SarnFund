# SarnFund

A comprehensive, full-stack mutual fund dashboard designed to track and analyze RMF (Retirement Mutual Fund), ThaiESG, and SSF funds. The system automates data collection from Settrade and SEC APIs, processes it for specific Asset Management Companies (AMCs), and presents it through an interactive, high-performance web interface.

## System Overview

SarnFund operates on a modern split-stack architecture:

1. **Data Ingestion Layer (Backend)**:
    - Utilizes **curl-based API fetching** from Settrade's public API
    - Alternative **Python-based SEC OpenAPI client** for official data sources
    - Implements **Node.js** scripts to fetch, normalize, and filter data
    - Focuses on four key AMCs: **KKP**, **Krungsri**, **BBL** (Bangkok Bank), and **TISCO**
    - Stores processed data in a local JSON-based caching system to ensure low latency and reduced upstream load

2. **Presentation Layer (Frontend)**:
    - A **React**-based single-page application (SPA)
    - Delivers real-time visualization of fund performance (NAV, Returns: YTD, 3M, 6M, 1Y, 3Y, 5Y)
    - Features distinct dashboards for **RMF** and **ThaiESG** categories
    - Mobile-responsive design with Tailwind CSS

## Tech Stack

### Frontend

- **Core**: [React](https://react.dev/) (v18), [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/) (v6)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v3) - Utility-first CSS framework
- **Visualization**: [Recharts](https://recharts.org/) - Composable charting library
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **API Server**: [Express](https://expressjs.com/)
- **Data Fetching**: curl via shell script (`refetch_funds_v2.sh`)
- **Alternative**: Python-based SEC OpenAPI client (in `sec-api/` directory)
- **Scheduling**: [Node-cron](https://www.npmjs.com/package/node-cron) - Task scheduling
- **Caching**: JSON file-based storage with 24-hour TTL

### Infrastructure & DevOps

- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (for production frontend serving)
- **Scripts**: Bash script (`refetch_funds_v2.sh`) for API data fetching

## Features

- **Automated Data Collection**: Scheduled API fetching from Settrade's public endpoints
- **Dual Data Sources**: Primary curl-based fetching + alternative SEC OpenAPI client
- **Smart Caching**: 24-hour data persistence to minimize redundant network requests
- **AMC Filtering**: Proprietary normalization logic to map various fund naming conventions to standardized AMC codes
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Real-time Updates**: Manual refresh capability with background data fetching
- **Docker Ready**: Tailored `Dockerfile` and `docker-compose.yml` for instant deployment
- **Graceful Degradation**: Serves cached data when fresh data is unavailable

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm run scrape  # Initial data fetch
npm start       # Start API server
```

The backend will run on <http://localhost:3001>

**Note**: The scraper requires network access to settrade.com. If the curl script fails due to expired cookies, you may need to update the cookies in `refetch_funds_v2.sh` or use the alternative Python-based SEC API client.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on <http://localhost:5173>

### 3. Initial Data Fetching

```bash
cd backend
npm run scrape
```

This will fetch data from Settrade's API and cache it for 24 hours. The data includes performance metrics for RMF and ThaiESG funds from the selected AMCs.

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

The backend provides RESTful API endpoints:

- `GET /api/funds/all` - Get all fund data (RMF + ThaiESG combined)
- `GET /api/funds/rmf` - Get RMF fund data only
- `GET /api/funds/tesg` - Get ThaiESG fund data only
- `POST /api/scrape` - Manually trigger data fetching (runs in background)
- `GET /api/health` - Health check and cache status information

### Example Response

```json
{
  "success": true,
  "cached": true,
  "timestamp": 1702825200000,
  "lastUpdated": "2023-12-17T14:00:00.000Z",
  "selectedAMCs": ["KKP", "Krungsri", "BBL", "TISCO"],
  "data": [
    {
      "id": "fund_12345_K-RMF",
      "code": "K-RMF",
      "name": "KKP Retirement Mutual Fund",
      "amc": "KKP",
      "nav": 15.50,
      "ytd": 8.5,
      "return1y": 12.3,
      "return3y": 18.7,
      "return5y": 25.4,
      "risk": 5,
      "type": "Equity",
      "factsheetUrl": "https://www.settrade.com/th/mutualfund/quote/K-RMF/overview"
    }
  ]
}
```

## Configuration

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3001
```

For production, update the API URL to your backend server address.

### Backend Environment Variables

The backend accepts the following environment variables:

- `PORT` - Server port (default: 3001)

### Backend Configuration

The backend uses shell script for data fetching. If you need to update the data source:

1. **Using curl script** (default):
   - Edit `refetch_funds_v2.sh` to update cookies if they expire
   - The script fetches from Settrade's public API

2. **Using Python SEC API client** (alternative):
   - Configure `.env` in `backend/` with SEC API keys
   - Modify `backend/server.js` to use `fetch_funds.py` instead
   - Requires SEC API subscription from https://api-portal.sec.or.th

## Deployment

### Using Docker (Recommended)

```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:8091
- Backend API: http://backend:3001 (internal)

To view logs:
```bash
docker-compose logs -f
```

To stop:
```bash
docker-compose down
```

### Production Notes

- Set up proper CORS configuration for production domains in `backend/server.js`
- Consider adding authentication for the `/api/scrape` endpoint
- Use environment variables for configuration (PORT, API URLs, etc.)
- Set up a process manager (PM2, systemd) for the backend
- Configure reverse proxy (nginx) for production serving
- Set up SSL/TLS certificates for HTTPS
- Regularly update dependencies and check for security vulnerabilities
- Monitor logs and set up alerts for scraper failures
- Configure firewall rules to protect the backend API

## Data Sources

### Primary: Settrade Public API

- **RMF Funds**: `https://www.settrade.com/api/set-fund/fund-compare/list?lang=th&amcId=ALL&aimcType=ALL&specificationCode=RMF`
- **ThaiESG Funds**: `https://www.settrade.com/api/set-fund/fund-compare/list?lang=th&amcId=ALL&aimcType=ALL&specificationCode=TESG`

The `refetch_funds_v2.sh` script handles the API calls with proper headers and cookies.

### Alternative: SEC OpenAPI

- **Location**: `sec-api/` directory contains Python client library
- **Requires**: SEC API subscription keys from https://api-portal.sec.or.th
- **Setup**: Configure `.env` with API keys (see `sec-api/README.md`)
- **Usage**: Can be integrated by modifying `backend/server.js` to call Python scripts

## AMCs Covered

The system focuses on **4 specific Asset Management Companies**:

1. **KKP** (เกียรตินาคินภัทร)
   - Fund codes: KKP, KKPAM
   - Name patterns: "เกียรติ", "KKP"

2. **Krungsri** (กรุงศรี)
   - Fund codes: KF, KSAM
   - Name patterns: "กรุงศรี", "Krungsri"

3. **BBL** (บัวหลวง - Bangkok Bank)
   - Fund codes: B-, BERMF, BBLAM
   - Name patterns: "บัวหลวง", fund codes starting with "B"

4. **TISCO** (ทิสโก้)
   - Fund codes: TISCO, TISCOASSET
   - Name patterns: "ทิสโก้", "TISCO"

The AMC normalization logic in `backend/scraper.js` handles various fund naming conventions and filters out funds from other AMCs.

## Troubleshooting

### Backend issues

**Problem**: `npm run scrape` fails with "Could not resolve host"
- **Solution**: Check network connectivity. The scraper needs access to settrade.com
- **Alternative**: Use the Python SEC API client if you have API keys

**Problem**: Scraper returns no data or expired cookies error
- **Solution**: Update cookies in `refetch_funds_v2.sh`. Cookies expire periodically and need to be refreshed from a browser session

**Problem**: Backend API returns 503 errors
- **Solution**: No cached data available. Run `npm run scrape` to fetch initial data

### Frontend issues

**Problem**: Dashboard shows "No data available"
- **Solution**: 
  1. Check if backend is running: `curl http://localhost:3001/api/health`
  2. Verify backend has cached data: `ls -la backend/data/`
  3. Trigger manual scrape: `curl -X POST http://localhost:3001/api/scrape`

**Problem**: npm audit shows vulnerabilities
- **Solution**: The moderate vulnerabilities in esbuild/vite only affect the development server. For production builds, these don't pose a risk. Update with `npm audit fix` if needed, but test thoroughly as it may introduce breaking changes.

### Docker issues

**Problem**: Container fails to start
- **Solution**: Check logs with `docker-compose logs backend` or `docker-compose logs frontend`

**Problem**: Backend cannot fetch data in Docker
- **Solution**: Ensure the container has network access. Check Docker network settings.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Additional Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions and troubleshooting
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[.github/copilot_instructions.md](.github/copilot_instructions.md)** - Development guidelines for GitHub Copilot
- **[sec-api/README.md](sec-api/README.md)** - SEC OpenAPI client documentation

## Known Issues

1. **Cookies in curl script expire**: The `refetch_funds_v2.sh` script uses cookies that expire after some time. You'll need to update them periodically.
2. **ESLint warning in useFundData hook**: Intentional - including `fetchDataFromAPI` in the dependency array would cause an infinite loop.
3. **Moderate npm vulnerability in vite/esbuild**: Only affects development server, not production builds.

## License

MIT
