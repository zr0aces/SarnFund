# SarnFund - GitHub Copilot Instructions

## System Overview

**SarnFund** is a comprehensive mutual fund dashboard application that provides real-time data visualization and analysis for Thai mutual funds including RMF (Retirement Mutual Fund), ThaiESG, LTF (Long-Term Equity Fund), and SSF (Super Savings Fund). The system consists of a Node.js backend scraper service that fetches data from SET Trade APIs and a React frontend for data visualization.

## Architecture

### Technology Stack

**Backend:**
- **Runtime:** Node.js 18+ (Alpine-based Docker image)
- **Framework:** Express.js v4.x
- **Task Scheduler:** node-cron v3.x
- **CORS:** cors v2.x
- **API Source:** SET Trade API (settrade.com)

**Frontend:**
- **Framework:** React 18.x
- **Build Tool:** Vite 5.x
- **Routing:** React Router DOM v6.x
- **UI Styling:** Tailwind CSS v3.x
- **Charts:** Recharts v2.x
- **Icons:** Lucide React v0.395.x

**Infrastructure:**
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (for frontend static files)
- **Data Storage:** JSON files with 24-hour caching

### System Components

```
SarnFund/
├── backend/               # Backend scraper and API service
│   ├── server.js         # Express API server with cron scheduling
│   ├── scraper.js        # Data processing and transformation
│   ├── refetch_funds_v2.sh # Shell script for curl-based API fetching
│   ├── init-data.js      # Initial data setup
│   ├── data/             # Cached JSON data files
│   ├── Dockerfile        # Backend container definition
│   └── package.json      # Backend dependencies
│
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components (RMF, ThaiESG, LTF, SSF)
│   │   ├── hooks/        # Custom React hooks (useFundData)
│   │   ├── data/         # Static data and configurations
│   │   └── App.jsx       # Main application router
│   ├── Dockerfile        # Multi-stage frontend build
│   ├── nginx.conf        # Nginx configuration with API proxy
│   └── package.json      # Frontend dependencies
│
├── documents/            # Project documentation
├── .github/              # GitHub configurations and workflows
└── docker-compose.yml    # Multi-container orchestration
```

## Data Flow

1. **Scheduled Scraping:** Daily at 1 AM, node-cron triggers data collection
2. **API Fetching:** `refetch_funds_v2.sh` uses curl to fetch JSON from SET Trade API
3. **Data Processing:** `scraper.js` normalizes AMC names and transforms data structure
4. **Caching:** Processed data saved to `backend/data/` as JSON files (24-hour TTL)
5. **API Serving:** Express endpoints serve cached data with validation
6. **Frontend Fetch:** React hooks fetch from backend API with relative paths
7. **Client Caching:** Browser localStorage provides secondary 24-hour cache
8. **Visualization:** React components render charts, tables, and KPI cards

## API Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/funds/rmf` | GET | Get RMF fund data | JSON with funds array |
| `/api/funds/tesg` | GET | Get ThaiESG fund data | JSON with funds array |
| `/api/funds/ltf` | GET | Get LTF fund data | JSON with funds array |
| `/api/funds/ssf` | GET | Get SSF fund data | JSON with funds array |
| `/api/funds/all` | GET | Get all fund types | Combined JSON object |
| `/api/scrape` | POST | Manual scrape trigger (disabled) | Success/error message |
| `/api/health` | GET | Health check with cache status | Service status JSON |
| `/api/stats` | GET | Fund statistics (counts) | Statistics JSON |

## Data Structure

### Fund Object Schema

```javascript
{
  id: string,              // Unique identifier
  code: string,            // Fund symbol (e.g., "KKP-RMF")
  name: string,            // Full fund name (English)
  amc: string,             // Asset Management Company (normalized)
  nav: number,             // Net Asset Value per unit
  ytd: number,             // Year-to-date return (%)
  return3m: number,        // 3-month return (%)
  return6m: number,        // 6-month return (%)
  return1y: number,        // 1-year return (%)
  return2y: number,        // 2-year return (%)
  return3y: number,        // 3-year return (%)
  return5y: number,        // 5-year return (%)
  risk: number,            // Risk level (1-8)
  type: string,            // AIMC type
  isNew: boolean,          // Is new fund flag
  factsheetUrl: string     // Link to fund factsheet
}
```

## Asset Management Companies (AMCs)

The system tracks multiple AMCs with normalized naming:

- **KKPAM** → KKP (เกียรตินาคินภัทร)
- **KSAM** → Krungsri (กรุงศรี)
- **BBLAM** → BBL (บัวหลวง - Bangkok Bank)
- **TISCOASSET** → TISCO (ทิสโก้)
- **SCBAM** → SCB
- **KASSET** → KAsset
- **KTAM** → KTAM
- **ONEAM** → ONE
- **UOBAM** → UOB
- **PRINCIPAL** → Principal
- **EASTSPRING** → Eastspring
- **ASSETFUND** → Asset Plus
- **DAOL** → DAOL
- **KWI** → KWI
- **LHFUND** → LH Fund
- **MFC** → MFC
- **TALIS** → TALIS
- **XSPRING** → XSpring

## Coding Standards

### Backend (Node.js)

- **Module System:** ES Modules (type: "module")
- **Async/Await:** Use async/await for all asynchronous operations
- **Error Handling:** Try-catch blocks with detailed logging
- **Logging:** Console.log for info, console.error for errors
- **File Operations:** Use fs/promises for async file operations
- **Path Handling:** Use path.join() for cross-platform compatibility
- **Environment:** Support PORT via process.env with default 3001

### Frontend (React)

- **Component Style:** Functional components with hooks
- **State Management:** useState, useEffect, useCallback hooks
- **Custom Hooks:** Extract reusable logic (e.g., useFundData)
- **Styling:** Tailwind CSS utility classes
- **Routing:** React Router v6 with BrowserRouter
- **API Calls:** Fetch API with relative paths (proxy in nginx)
- **Error Boundaries:** Graceful error handling with user feedback
- **Caching:** localStorage with timestamp validation

### Code Style

- **Indentation:** 2 spaces (JavaScript) or 4 spaces (depends on file)
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Naming:**
  - camelCase for variables and functions
  - PascalCase for React components
  - UPPER_SNAKE_CASE for constants
- **Comments:** JSDoc style for functions, inline for complex logic

## Development Workflow

### Local Development

```bash
# Backend
cd backend
npm install
npm start          # Start server on port 3001
npm run scrape     # Manually trigger data fetch

# Frontend
npm install
npm run dev        # Start Vite dev server on port 5173
npm run build      # Production build
```

### Docker Development

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Testing

- **Backend:** Manual testing with curl or Postman
- **Frontend:** Browser testing with React DevTools
- **Integration:** Test full flow from scraping to visualization

## Security Considerations

1. **API Scraping Protection:**
   - POST `/api/scrape` endpoint is disabled by default
   - Consider adding authentication before enabling

2. **CORS Configuration:**
   - Currently allows all origins (development mode)
   - Restrict origins in production

3. **Input Validation:**
   - Validate all JSON data from external APIs
   - Handle malformed data gracefully

4. **Secrets Management:**
   - No secrets in codebase
   - Use environment variables for sensitive config
   - SET Trade API requires cookie/UA but no auth

5. **Dependency Security:**
   - Regularly update dependencies
   - Run `npm audit` for vulnerability checks
   - Use exact versions in production

## Performance Optimization

1. **Caching Strategy:**
   - Backend: 24-hour JSON file cache
   - Frontend: 24-hour localStorage cache
   - Reduces API calls and scraping frequency

2. **Data Processing:**
   - Filter and transform data once during scraping
   - Serve pre-processed data from API

3. **Frontend Optimization:**
   - Lazy loading for routes
   - Memoization for expensive computations
   - Debouncing for user interactions

4. **Docker Optimization:**
   - Multi-stage builds for frontend
   - Alpine base images for smaller size
   - Production-only dependencies

## Common Tasks

### Adding a New Fund Type

1. Add endpoint in `backend/server.js`
2. Update `refetch_funds_v2.sh` with new API URL
3. Add processing in `scraper.js`
4. Create frontend page in `src/pages/`
5. Add route in `App.jsx`

### Updating AMC List

1. Modify `AMC_MAP` in `backend/scraper.js`
2. Update frontend colors in `src/data/funds.js`
3. Test normalization with various fund codes

### Changing Cache Duration

1. Update `CACHE_DURATION` in `backend/server.js`
2. Update `CACHE_DURATION` in `frontend/src/hooks/useFundData.js`
3. Clear existing cache in `backend/data/` and localStorage

### Modifying Scrape Schedule

1. Update cron expression in `backend/server.js`
2. Format: `'second minute hour day month weekday'`
3. Example: `'0 1 * * *'` = Daily at 1 AM

## Troubleshooting

### Backend Issues

- **Port in use:** Change PORT environment variable
- **Scraping fails:** Check curl access to settrade.com
- **Empty data:** Run manual scrape with `npm run scrape`
- **Cache not updating:** Delete files in `backend/data/`

### Frontend Issues

- **API connection error:** Verify backend is running on port 3001
- **CORS error:** Check backend CORS configuration
- **No data displayed:** Check browser console and localStorage
- **Build fails:** Clear node_modules and reinstall

### Docker Issues

- **Container fails:** Check logs with `docker-compose logs`
- **Network issues:** Ensure backend container is healthy
- **Volume permissions:** Check data directory permissions

## Contributing Guidelines

When contributing to SarnFund:

1. **Branch Naming:** `feature/description` or `fix/description`
2. **Commit Messages:** Clear, descriptive, present tense
3. **Code Review:** All changes require review
4. **Testing:** Test locally and with Docker before committing
5. **Documentation:** Update docs for significant changes
6. **Dependencies:** Justify all new dependencies
7. **Security:** Run security scans before merging

## Project Naming Convention

- **Project Name:** SarnFund (not SanFund)
- **Branding:** Use "SarnFund" consistently in all user-facing text
- **Internal References:** Update legacy "SanFund" references to "SarnFund"

## Additional Resources

- **React Documentation:** https://react.dev/
- **Vite Documentation:** https://vitejs.dev/
- **Express Documentation:** https://expressjs.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **Docker Documentation:** https://docs.docker.com/
- **SET Trade:** https://www.settrade.com/

## Support and Maintenance

- **Monitoring:** Use `/api/health` endpoint for uptime checks
- **Logs:** Check console output or Docker logs
- **Updates:** Schedule regular dependency updates
- **Backups:** Version control with Git, cache is regeneratable
- **Alerts:** Consider adding email/Slack notifications for failures
