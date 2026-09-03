# Development

## Prerequisites
- Node.js 24+ & npm
- Docker & Docker Compose (optional)

## Environment Setup
```bash
cp .env.example .env
```

## Backend Development
```bash
cd backend && npm install
cd backend && npm run init            # Seed initial mock data
cd backend && npm run dev             # Start dev server with nodemon (:3001)
cd backend && npm start               # Start production server
cd backend && npm run scrape          # Run scrape reusing 7-day registry
cd backend && npm run scrape:refresh  # Wipe registry and force full scrape
```

## Frontend Development
```bash
cd frontend && npm install
cd frontend && npm run dev            # Start Vite dev server (:5173, proxies to :3001)
cd frontend && npm run lint           # Run ESLint (max-warnings 0 enforced)
cd frontend && npm run build          # Production build -> dist/
cd frontend && npm run preview        # Preview production build locally
```

## Data Ingestion & Scraping

### Host Utility (Auto-detects Docker)
The root script `scripts/fetch-funds.js` automatically detects if the `backend` container is running in Docker Compose and transparently forwards the scrape command inside it. If Docker is not running, it falls back to local execution.
```bash
# Fetch latest daily NAV (reuses 7-day fund registry)
node scripts/fetch-funds.js

# Force full registry rebuild and refresh
node scripts/fetch-funds.js --refresh
```

### Running Directly Inside Docker
Inside the backend container, the application files live at `/app/`, with the scraper entrypoint at `scraper.js` (`npm run scrape`):
```bash
# Run scrape inside the running backend container
docker compose exec backend npm run scrape
# or: docker compose exec backend node scraper.js

# Force full registry rebuild inside container
docker compose exec backend npm run scrape:refresh
# or: docker compose exec backend node scraper.js --refresh

# One-off run if the container stack is stopped
docker compose run --rm backend npm run scrape
```

## Version Management (CalVer)

### Propagate Version from VERSION File to Manifests
```bash
node scripts/sync-version.mjs
```

### Verify Version Consistency (CI Check)
```bash
node scripts/sync-version.mjs --check
```

### Bump Version (Auto Bump)
```bash
node scripts/release.mjs             # Bumps based on CalVer rules and syncs manifests
node scripts/release.mjs --tag       # Bumps, syncs, stages, commits, and tags
node scripts/release.mjs --build     # Bumps, syncs, and triggers docker compose build
```

### Set Custom Version Explicitly
```bash
node scripts/release.mjs 2026.8.0    # Bumps to exactly 2026.8.0 (supports v prefix too)
```

## Quality & Verification Checklist

Before completing any task or PR:
1. `cd frontend && npm run lint` — verify zero ESLint errors and warnings.
2. `cd frontend && npm run build` — verify production build succeeds with clean chunking.
3. `node scripts/sync-version.mjs --check` — verify version synchronization.
4. `./.agent-parity/bin/agent-parity status` — verify cross-agent parity and git tracking.
5. `npm audit --prefix frontend && npm audit --prefix backend` — verify zero package vulnerabilities.
