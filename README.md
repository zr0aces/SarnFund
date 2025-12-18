# SanFund Scraper Service

A dedicated backend service for collecting and serving Mutual Fund data (RMF, ThaiESG) from the Stock Exchange of Thailand (SET).

## Architecture

This service runs as a Docker container and performs the following:

1. **Scheduled Scraping**: A daily cron job (at 1:00 AM) triggers a data fetch.
2. **Data Fetching**:
    - Executes `refetch_funds_v2.sh` to fetch raw JSON data from SETTrade API using `curl`.
    - Normalizes and processes the data using `scraper.js`.
    - Saves processed data to `backend/data/`.
3. **API Serving**: An Express.js server serves the processed data via REST endpoints.

## API Endpoints

- `GET /api/funds/rmf` - Returns processed RMF fund data.
- `GET /api/funds/tesg` - Returns processed ThaiESG fund data.
- `GET /api/funds/all` - Returns all fund data including metadata.
- `GET /api/health` - Health check endpoint (used by Docker).

## Setup & Usage

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)

### Running with Docker

The service is part of the main `docker-compose.yml`.

```bash
docker-compose up -d backend
```

### Local Development

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. **Manual Scrape**:
   To manually trigger a data fetch without waiting for the cron schedule:

   ```bash
   npm run scrape
   ```

## Project Structure

- `server.js`: Main Express API server and Cron scheduler.
- `scraper.js`: Data processing logic and shell script executor.
- `refetch_funds_v2.sh`: Shell script to `curl` data from SETTrade.
- `Dockerfile`: minimal Node.js Alpine image with `curl` support.
