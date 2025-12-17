# GitHub Copilot Instructions for SarnFund

## Project Overview

SarnFund is a full-stack mutual fund dashboard system that fetches, processes, and displays performance data for Thai mutual funds (RMF, ThaiESG, and SSF) from SEC and Settrade sources. The system focuses on providing easy-to-read performance metrics for funds from selected Asset Management Companies (AMCs).

## System Architecture

### Technology Stack

**Backend:**
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Data Fetching**: curl-based scraper via shell script (`refetch_funds_v2.sh`)
- **Alternative**: Python-based SEC API client (in `backend/function/` directory)
- **Scheduling**: node-cron for daily automated fetching
- **Caching**: JSON file-based (24-hour cache duration)

**Frontend:**
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS v3
- **Charts**: Recharts library
- **Icons**: Lucide React
- **State Management**: React hooks (no external state management)

**Infrastructure:**
- **Containerization**: Docker with docker-compose
- **Web Server**: Nginx (for production frontend serving)
- **Data Storage**: JSON files in `backend/data/`

### Directory Structure

```
SarnFund/
├── backend/                    # Backend Node.js service
│   ├── server.js              # Express API server with cron jobs
│   ├── scraper.js             # Main scraper using curl script
│   ├── fetch_funds.py         # Alternative Python SEC API scraper
│   ├── init-data.js           # Data initialization script
│   ├── test-normalization.js  # Tests for AMC normalization
│   ├── function/              # Python SEC API client library
│   │   ├── FundFactsheet.py   # Fund data fetching
│   │   ├── Common.py          # Utilities and rate limiting
│   │   └── ...                # Other API modules
│   ├── backend/data/          # Raw fetched JSON data
│   └── data/                  # Processed and cached data
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page-level components
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useFundData.js # Main data fetching hook
│   │   ├── data/              # Mock/fallback data
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── sec-api/                    # SEC API documentation and examples
├── refetch_funds_v2.sh        # Shell script for curl-based fetching
├── docker-compose.yml         # Docker orchestration
└── docs/                      # Documentation (README, SETUP_GUIDE, etc.)
```

## Key Concepts and Conventions

### Data Flow

1. **Data Fetching** (Backend):
   - **Primary Method**: `refetch_funds_v2.sh` uses curl to fetch from Settrade API
   - **Alternative Method**: Python scripts using SEC OpenAPI
   - Fetches RMF and ThaiESG fund data separately
   - Runs daily at 1 AM via cron schedule
   - Can be triggered manually via `/api/scrape` endpoint

2. **Data Processing** (Backend):
   - Raw data is filtered for selected AMCs: KKP, Krungsri, BBL, TISCO
   - AMC normalization maps various fund codes to standardized AMC names
   - Processed data stored in `backend/data/` as JSON files
   - Each file includes timestamp for cache validation

3. **Data Serving** (Backend):
   - Express API serves processed data via REST endpoints
   - Cache validation checks 24-hour expiry
   - Serves stale data if fresh data unavailable (graceful degradation)

4. **Data Consumption** (Frontend):
   - `useFundData` hook fetches from backend API
   - Falls back to localStorage cache (24 hours)
   - Falls back to mock data if API unavailable
   - Real-time updates via manual refresh button

### Selected AMCs

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

**Important**: When working with fund data, always filter and normalize AMC names using the patterns above. See `backend/scraper.js` for the normalization logic.

### Caching Strategy

**Two-Layer Caching**:
1. **Backend Cache** (Primary):
   - Location: `backend/data/` directory
   - Files: `rmf.json`, `tesg.json`, `all.json`
   - Duration: 24 hours
   - Validation: Checks timestamp on every request

2. **Frontend Cache** (Secondary):
   - Location: Browser localStorage
   - Keys: `fund_cache_v2_rmf`, `fund_cache_v2_tesg`
   - Duration: 24 hours
   - Fallback: Mock data if both backend and cache fail

### API Endpoints

**Backend API** (Default port: 3001):

```javascript
GET  /api/funds/all    // Get all funds (RMF + ThaiESG)
GET  /api/funds/rmf    // Get RMF funds only (NOT IMPLEMENTED - use /all)
GET  /api/funds/tesg   // Get ThaiESG funds only (NOT IMPLEMENTED - use /all)
POST /api/scrape       // Manually trigger data fetching
GET  /api/health       // Health check endpoint
```

**Note**: Currently only `/api/funds/all` endpoint is fully implemented. Frontend tries to call `/api/funds/rmf` and `/api/funds/tesg` but these should either be implemented or frontend should be updated to use `/api/funds/all`.

### Fund Data Schema

```javascript
{
  id: string,              // Unique identifier
  code: string,            // Fund symbol/code (e.g., "K-RMF")
  name: string,            // Fund name (English or Thai)
  amc: string,             // AMC name (KKP, Krungsri, BBL, TISCO)
  nav: number,             // Net Asset Value
  ytd: number,             // Year-to-date return %
  return3m: number,        // 3-month return %
  return6m: number,        // 6-month return %
  return1y: number,        // 1-year return %
  return3y: number,        // 3-year return %
  return5y: number,        // 5-year return %
  risk: number,            // Risk level (1-8)
  type: string,            // Fund type (e.g., "Equity", "Mixed")
  isNew: boolean,          // New fund flag
  factsheetUrl: string     // Link to fund details on Settrade
}
```

## Development Guidelines

### Backend Development

1. **ES Modules**: Backend uses ES Modules (`type: "module"` in package.json)
   - Use `import/export` syntax, not `require/module.exports`
   - Use `__dirname` workaround: `path.dirname(fileURLToPath(import.meta.url))`

2. **Error Handling**: Always implement graceful degradation
   - Log errors but don't crash the server
   - Return cached/stale data when fresh data unavailable
   - Provide helpful error messages in API responses

3. **Data Validation**: Validate data before caching
   - Check timestamp validity
   - Verify data structure
   - Filter out invalid entries

4. **Rate Limiting**: Be respectful to external APIs
   - Use rate limiting when calling SEC API
   - Implement exponential backoff for retries
   - Cache aggressively to minimize requests

### Frontend Development

1. **Component Structure**: Follow functional component pattern
   - Use hooks for state and effects
   - Keep components small and focused
   - Prefer composition over inheritance

2. **Styling**: Use Tailwind CSS utility classes
   - Follow existing color scheme for AMCs
   - Maintain responsive design patterns
   - Use Lucide icons for consistency

3. **Data Fetching**: Use the `useFundData` hook
   - Always handle loading states
   - Display error messages gracefully
   - Provide manual refresh option

4. **Performance**: Optimize for large datasets
   - Use React.memo for expensive components
   - Implement virtualization for long lists
   - Lazy load charts and heavy components

### Code Style

1. **JavaScript/React**:
   - Use ES6+ features (arrow functions, destructuring, etc.)
   - Prefer `const` and `let` over `var`
   - Use meaningful variable names
   - Keep functions small and single-purpose

2. **Comments**:
   - Add JSDoc comments for functions
   - Explain "why" not "what"
   - Document complex algorithms
   - Keep comments up-to-date

3. **File Organization**:
   - Group related files together
   - Use index files for exports
   - Keep file names descriptive

### Testing

**Current Status**: No automated tests implemented yet.

**Testing Strategy** (Recommended):
1. **Backend Tests**:
   - Unit tests for AMC normalization
   - Integration tests for API endpoints
   - Mock external API calls

2. **Frontend Tests**:
   - Component tests with React Testing Library
   - Hook tests for useFundData
   - E2E tests with Playwright/Cypress

### Security Considerations

1. **API Keys**: 
   - Never commit API keys to repository
   - Use environment variables for sensitive data
   - Use `.env` files (git-ignored)

2. **CORS**:
   - Configure CORS properly for production
   - Whitelist only necessary origins
   - See `backend/server.js` for configuration

3. **Input Validation**:
   - Validate all API inputs
   - Sanitize user-provided data
   - Use proper error messages (no stack traces in production)

4. **Dependencies**:
   - Regularly run `npm audit`
   - Keep dependencies up-to-date
   - Review security advisories

## Common Issues and Solutions

### Issue: Backend cannot fetch data

**Symptoms**: Scraper fails, API returns 503 errors

**Solutions**:
1. Check if `refetch_funds_v2.sh` is executable: `chmod +x refetch_funds_v2.sh`
2. Verify network connectivity to settrade.com
3. Check if cookies in script are still valid (they expire periodically)
4. Try alternative Python scraper: `cd backend && python3 fetch_funds.py`

### Issue: Frontend shows "No data available"

**Symptoms**: Dashboard is empty or shows mock data only

**Solutions**:
1. Check if backend is running: `curl http://localhost:3001/api/health`
2. Verify backend has cached data: `ls -la backend/data/`
3. Check browser console for API errors
4. Verify VITE_API_URL environment variable
5. Trigger manual scrape: `curl -X POST http://localhost:3001/api/scrape`

### Issue: ESLint not working

**Symptoms**: `npm run lint` fails with "configuration file not found"

**Solutions**:
1. ESLint config is missing - create `.eslintrc.js` in frontend directory
2. Use `npx eslint --init` to generate config
3. Or copy from similar React projects

### Issue: npm audit shows vulnerabilities

**Symptoms**: Moderate vulnerabilities in esbuild/vite

**Solutions**:
1. Review vulnerabilities: `npm audit`
2. Check if they affect production builds
3. Update dependencies: `npm audit fix`
4. For breaking changes: `npm audit fix --force` (test thoroughly after)

## Development Workflow

### Local Development

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run scrape  # Initial data fetch
   npm start       # or npm run dev for auto-reload
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

### Docker Development

```bash
docker-compose up -d         # Start all services
docker-compose logs -f       # View logs
docker-compose down          # Stop all services
```

Access: http://localhost:8091

### Production Deployment

1. Build frontend: `cd frontend && npm run build`
2. Start backend with PM2: `pm2 start backend/server.js`
3. Serve frontend with nginx (see nginx.conf)
4. Set up SSL/TLS certificates
5. Configure firewall rules

## Data Sources

### Primary: Settrade API (via curl)

- **RMF Funds**: `https://www.settrade.com/api/set-fund/fund-compare/list?lang=th&amcId=ALL&aimcType=ALL&specificationCode=RMF`
- **ThaiESG Funds**: `https://www.settrade.com/api/set-fund/fund-compare/list?lang=th&amcId=ALL&aimcType=ALL&specificationCode=TESG`

**Requirements**:
- Valid cookies (expire after some time)
- Proper headers (User-Agent, Referer, etc.)
- Rate limiting to avoid blocking

### Alternative: SEC OpenAPI

- **Location**: `sec-api/` and `backend/function/`
- **Requires**: SEC API subscription keys
- **Setup**: Configure `.env` with API keys
- **Usage**: See `backend/fetch_funds.py`

## Important Files to Review

When making changes, always consider impact on:

1. **Backend**:
   - `backend/server.js` - Main API server
   - `backend/scraper.js` - Data fetching logic
   - `refetch_funds_v2.sh` - Curl scraper script
   - `backend/package.json` - Dependencies and scripts

2. **Frontend**:
   - `frontend/src/hooks/useFundData.js` - Data fetching
   - `frontend/src/components/FundDashboard.jsx` - Main dashboard
   - `frontend/src/components/FundTable.jsx` - Fund display table
   - `frontend/package.json` - Dependencies and scripts

3. **Configuration**:
   - `docker-compose.yml` - Container orchestration
   - `.gitignore` - Files to exclude from git
   - `.env` files - Environment configuration

4. **Documentation**:
   - `README.md` - Project overview
   - `SETUP_GUIDE.md` - Setup instructions
   - `IMPLEMENTATION_SUMMARY.md` - Implementation details

## Known Issues and TODOs

1. **Backend API Endpoints**: Implement separate `/api/funds/rmf` and `/api/funds/tesg` endpoints
2. **ESLint Configuration**: Missing `.eslintrc.js` in frontend
3. **Security Vulnerabilities**: esbuild vulnerability in frontend dependencies
4. **Python Scraper**: Not fully tested, SEC API keys may be needed
5. **Error Handling**: Improve error messages and logging
6. **Tests**: Add comprehensive test coverage
7. **Documentation**: Add architecture diagrams
8. **Monitoring**: Add production monitoring and alerting

## Additional Resources

- **SEC API Portal**: https://api-portal.sec.or.th
- **Settrade Mutual Funds**: https://www.settrade.com/th/mutualfund/screening
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Express.js**: https://expressjs.com

---

**Last Updated**: 2025-12-17
**Maintained By**: SarnFund Development Team
