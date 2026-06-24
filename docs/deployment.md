# Deployment

Guide for deploying and operating SarnFund.

## Docker Deployment (Recommended)

SarnFund runs as a multi-container Docker Compose stack. All configuration is driven by the single root-level `.env` file.

### Quick Start
```bash
# 1. Copy env template and fill in SEC API keys
cp .env.example .env

# 2. Build and start all services in detached mode
docker compose up -d --build

# 3. Trigger the initial data scrape (takes 2-5 minutes)
curl -X POST "http://localhost:8091/api/scrape?force=true" \
     -H "X-Scrape-Token: <your-SCRAPE_TOKEN>"
```

### Key Services
- **`nginx`**: Gateway service listening on host port `8091`.
- **`backend`**: Node.js Express server running on port `3001` (internal only).
- **`frontend`**: Vite-based static build container that builds the files, writes them to a shared volume, and exits.

---

## Operating Commands

### View Service Logs
```bash
docker compose logs -f          # Logs from all services
docker compose logs -f backend  # Backend logs only
docker compose logs -f nginx    # Nginx logs only
```

### Stop Services
```bash
docker compose down
```

### Rebuild Frontend After Code Edits
```bash
docker compose build frontend && docker compose up -d
```

### Upgrade Nginx Version
To upgrade Nginx without rebuilds, edit the image tag in `docker-compose.yml`, then run:
```bash
docker compose pull nginx && docker compose up -d nginx
```

---

## Configuration & Environment Variables

See [configuration.md](file:///home/san/workspace/SarnFund/docs/configuration.md) for details on all configuration keys.
See `docs/deployment/` for configuration templates:
- [docs/deployment/.env.example](file:///home/san/workspace/SarnFund/docs/deployment/.env.example) → `.env`
- [docs/deployment/docker-compose.yml.example](file:///home/san/workspace/SarnFund/docs/deployment/docker-compose.yml.example) → `docker-compose.yml`
- [docs/deployment/nginx.conf.example](file:///home/san/workspace/SarnFund/docs/deployment/nginx.conf.example) → `/etc/nginx/conf.d/default.conf`

---

## Backup & Restore

All SarnFund cached data is stored inside the `./data` host directory, which is volume-mounted into the backend container at `/app/data`.

### Backup Cached Data
Archive the local `./data` folder containing `fund-registry.json` and the scraped NAV JSON files:
```bash
tar -czvf sarnfund-data-backup-$(date +%F).tar.gz ./data
```

### Restore Cached Data
```bash
# 1. Stop containers
docker compose down

# 2. Extract backup
tar -xzvf sarnfund-data-backup-YYYY-MM-DD.tar.gz

# 3. Restart containers
docker compose up -d
```

---

## Production Health Checks

Configure monitoring alerts to ping the `/api/health` endpoint through port `8091`. 
The health check returns `status: "ok"` and status flags for each cache:
- Verify that `cache.rmf.valid` is `true`.
- Verify that `secApi.factsheetKey` and `secApi.dailyInfoKey` are `true`.
