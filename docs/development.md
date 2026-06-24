# Development

## Prerequisites
# Node.js 24+
# npm

## Setup Environment
cp .env.example .env

## Setup Backend
cd backend && npm install

## Initialize Backend Mock Data
cd backend && npm run init

## Run Scraper Pipeline
cd backend && npm run scrape

## Run Scraper Pipeline (Full Refresh)
cd backend && npm run scrape:refresh

## Run Backend Server (Development)
cd backend && npm run dev

## Run Backend Server (Production)
cd backend && npm start

## Setup Frontend
cd frontend && npm install

## Run Frontend Dashboard (Development)
cd frontend && npm run dev

## Lint Frontend Code
cd frontend && npm run lint

## Build Frontend Dashboard
cd frontend && npm run build

## Preview Frontend Build
cd frontend && npm run preview

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
node scripts/release.mjs 2026.6.5    # Bumps to exactly 2026.6.5 (supports v prefix too)
```
