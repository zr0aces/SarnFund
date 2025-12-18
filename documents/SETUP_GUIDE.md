# Setup and Running Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Docker and Docker Compose

## Development Setup

### Option 1: Local Development (Recommended for Development)

#### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

#### Step 2: Install Playwright Browsers

```bash
cd backend
npx playwright install chromium
```

#### Step 3: Run Initial Scrape

Before starting the servers, you should run an initial scrape to populate the cache:

```bash
cd backend
npm run scrape
```

This will:
- Connect to settrade.com
- Scrape RMF and ThaiESG fund data
- Filter for KKP, Krungsri, BBL, and TISCO funds
- Save data to `backend/data/` directory
- Cache the data for 24 hours

**Note**: The initial scrape may take 1-2 minutes depending on network speed and website response time.

#### Step 4: Start Backend Server

```bash
cd backend
npm start
```

The backend will run on http://localhost:3001

You can verify it's running by visiting: http://localhost:3001/api/health

#### Step 5: Install Frontend Dependencies

In a new terminal:

```bash
cd /path/to/SarnFund
npm install
```

#### Step 6: Start Frontend Development Server

```bash
npm run dev
```

The frontend will run on http://localhost:5173

### Option 2: Docker Deployment (Recommended for Production)

#### Build and Start All Services

```bash
docker-compose up -d
```

This will:
- Build both backend and frontend images
- Start the backend on port 3001
- Start the frontend on port 8082
- Set up networking between services

Access the application at: http://localhost:8082

#### Check Service Status

```bash
docker-compose ps
docker-compose logs -f
```

#### Stop Services

```bash
docker-compose down
```

## Configuration

### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001
```

For production with Docker, the docker-compose.yml handles this automatically.

### Backend Environment Variables

The backend accepts the following environment variables:

- `PORT` - Server port (default: 3001)

## Usage

### Manual Data Refresh

You can manually trigger a scrape in several ways:

#### 1. Via Backend Script

```bash
cd backend
npm run scrape
```

#### 2. Via API Endpoint

```bash
curl -X POST http://localhost:3001/api/scrape
```

#### 3. Via Frontend UI

Click the "Update Data" button on any dashboard page.

### Accessing Dashboards

- **RMF Dashboard**: http://localhost:5173/rmf (dev) or http://localhost:8082/rmf (docker)
- **ThaiESG Dashboard**: http://localhost:5173/thaiesg (dev) or http://localhost:8082/thaiesg (docker)

## Data Management

### Cache Location

- **Frontend**: Browser localStorage
- **Backend**: `backend/data/` directory as JSON files

### Cache Duration

Data is cached for 24 hours. After expiration:
- Frontend will attempt to fetch from backend
- Backend will serve existing data if available
- Manual refresh can be triggered anytime

### Automatic Scraping

The backend automatically scrapes data daily at 1 AM. This is configured via cron in `backend/server.js`.

## Troubleshooting

### Backend Issues

#### "Cannot find module" error

```bash
cd backend
npm install
```

#### "Playwright browser not found" error

```bash
cd backend
npx playwright install chromium
```

#### Port 3001 already in use

Change the port:
```bash
PORT=3002 node server.js
```

And update frontend `.env`:
```env
VITE_API_URL=http://localhost:3002
```

### Frontend Issues

#### API connection errors

1. Verify backend is running: `curl http://localhost:3001/api/health`
2. Check VITE_API_URL in `.env`
3. Check browser console for CORS errors

#### No data displayed

1. Check if backend has cached data: `ls -la backend/data/`
2. Run manual scrape: `cd backend && npm run scrape`
3. Check frontend localStorage in browser DevTools

### Docker Issues

#### Container fails to start

Check logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

#### "No space left on device"

Clean up Docker:
```bash
docker system prune -a
```

## Testing

### Test AMC Normalization

```bash
cd backend
node test-normalization.js
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Get RMF data
curl http://localhost:3001/api/funds/rmf

# Get ThaiESG data
curl http://localhost:3001/api/funds/tesg

# Get all data
curl http://localhost:3001/api/funds/all
```

## Development Tips

### Backend Development with Hot Reload

```bash
cd backend
npm install -g nodemon  # Install nodemon globally
npm run dev             # Start with auto-reload
```

### Frontend Development

The Vite dev server has built-in hot module replacement (HMR). Changes to React components will reflect immediately.

### Debugging Scraper

Add console.log statements in `backend/scraper.js` or run with Node inspector:

```bash
cd backend
node --inspect scraper.js
```

Then open Chrome DevTools (chrome://inspect) to debug.

## Production Deployment

### Environment Setup

1. Set proper CORS origins in `backend/server.js`
2. Use environment variables for sensitive config
3. Set up HTTPS with reverse proxy (nginx, Caddy)
4. Configure firewall rules

### Process Management

Use PM2 for process management:

```bash
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name sarnfund-backend

# Start backend with ecosystem file
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Auto-start on boot
pm2 startup
pm2 save
```

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring

### Health Checks

Backend provides a health endpoint:

```bash
curl http://localhost:3001/api/health
```

Response includes:
- Service status
- Cache validity
- Last update times

### Logs

- **Backend logs**: Console output or redirect to file
- **Frontend logs**: Browser console
- **Docker logs**: `docker-compose logs -f`

## Security Considerations

1. **Rate Limiting**: Add rate limiting to `/api/scrape` endpoint
2. **Authentication**: Protect sensitive endpoints
3. **CORS**: Configure proper CORS origins for production
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: Validate all API inputs
6. **Environment Variables**: Never commit sensitive data

## Support

For issues or questions:
1. Check logs for error messages
2. Review this guide's troubleshooting section
3. Check GitHub issues
4. Open a new issue with detailed information
