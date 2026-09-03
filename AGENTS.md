# AGY.md

This file provides guidance to Google Antigravity (AGY) when working with code in this repository.

# SarnFund — AI Coding Agent Guidelines

SarnFund is a mutual fund analytics dashboard for Thai tax-saving investments (RMF, SSF, ThaiESG/ESG, ThaiESGX/ESGX, ETF). It fetches data from the **SEC Thailand Open Data API v2** (`api.sec.or.th`) using subscription-key authentication.

---

## 1. Quick Reference & Commands

```bash
# Backend Commands (run from backend/ directory)
cd backend && npm run dev        # nodemon watch mode, API on :3001
cd backend && npm start          # production start
cd backend && npm run scrape     # run two-phase scrape manually (2–5 min initial run)
cd backend && npm run scrape:refresh # scrape with forced registry rebuild
cd backend && npm run init       # seed initial mock data without API scrape

# Frontend Commands (run from frontend/ directory)
cd frontend && npm run dev       # Vite dev server on :5173 (proxies /api/* to :3001)
cd frontend && npm run build     # production build → dist/
cd frontend && npm run lint      # ESLint execution (max-warnings 0 enforced)
cd frontend && npm run preview   # preview production build locally

# Data Ingestion & Refresh Commands (run from project root)
node scripts/fetch-funds.js          # scrape latest NAV using cached registry (auto-detects Docker)
node scripts/fetch-funds.js --refresh # scrape with forced registry rebuild
docker compose exec backend npm run scrape # scrape directly inside running Docker container

# Versioning Commands (run from project root)
node scripts/sync-version.mjs        # propagate VERSION file to package manifests
node scripts/sync-version.mjs --check # verify version consistency across files
node scripts/release.mjs             # bump version according to CalVer rules
```

---

## 2. Supported AI Coding Tools & Architecture

SarnFund supports three AI coding tools:
- **Claude Code** (`CLAUDE.md`)
- **Google Antigravity (AGY)** (`AGENTS.md`)
- **Codex AI** (`CODEX.md`)

All instruction files follow standardized formatting, taxonomy, and operational boundaries.

### Project Architecture & Service Map

| Service | Image | Role | Port |
| :--- | :--- | :--- | :--- |
| **backend** | built from `./backend` | Express API, SEC API v2 connector, cron scraper | `3001` (internal) |
| **frontend** | built from `./frontend` | One-shot React/Vite builder (exits after copying `dist/`) | N/A |
| **nginx** | `nginx:1.27-alpine` | Reverse proxy & static server gateway | `8091` (public) |

---

## 3. Core Development Practices & Guidelines

- **Module Format**: Pure ESM (`"type": "module"`) in both backend and frontend. Use `import`/`export` only; do not use `require()`.
- **UI/UX & Design System**: Light theme default, Kanit font for headings/titles, Prompt font for body copy/tables. Responsive dynamic layout.
- **Error Handling**: Use `numVal(val, fallback)` for SEC API numeric parsing (`"-"` and `null` fallback). Use `runBatched()` for rate-limiting.
- **Security**: Never log API keys or secrets. Store credentials in root `.env`.

---

## 4. Key Source Files

| File | Purpose |
| :--- | :--- |
| [backend/sec-api-connector.js](file:///home/san/workspace/SarnFund/backend/sec-api-connector.js) | SEC API v2 connector, rate limiting, and 401 failover handling |
| [backend/scraper.js](file:///home/san/workspace/SarnFund/backend/scraper.js) | Two-phase scraper (Phase 1: Fund Registry, Phase 2: Daily NAV) |
| [backend/server.js](file:///home/san/workspace/SarnFund/backend/server.js) | Express endpoints, CORS, cron scheduling (06:30 PM daily) |
| [frontend/src/hooks/useFundData.js](file:///home/san/workspace/SarnFund/frontend/src/hooks/useFundData.js) | Dual-layer cache hook (`fund_cache_v4_*`) |
| [VERSION](file:///home/san/workspace/SarnFund/VERSION) | Single source of truth for CalVer versioning (`YYYY.M.MINOR`) |

---

## 5. Verification Checklist

Before completing any task:
1. Run `cd frontend && npm run lint` to verify zero ESLint warnings/errors.
2. Run `cd frontend && npm run build` to verify frontend production build succeeds.
3. Run `node scripts/sync-version.mjs --check` to verify version alignment.

<!-- agent-parity:begin -->
## Shared memory and agent state

This project uses `agent-parity` to keep memory, skills, instructions, and agent wiring portable across agents and machines; treat its managed files as repository state, not disposable generated files.

A shared `memory` MCP server persists context across sessions and agents (`memory_recent`, `memory_add`, `memory_search`, `memory_get`). Each tool's description says when to call it — follow them. Store durable context, not secrets, one-off chatter, or facts another source already enforces.

Cross-agent bootstrap: at the start of the first user turn, if the `memory` tools are unavailable, repair only the one config your own client reads — Claude Code `.mcp.json`, Cursor `.cursor/mcp.json`, Codex `.codex/config.toml`, Antigravity `.agents/mcp_config.json` — and leave the other three untouched, because a different-OS agent may share this working tree and need the other launcher. In that file, on native Windows replace an exact `.agent-parity/mcp/memory/run.sh` value with `.agent-parity/mcp/memory/run.cmd`, and on Unix-like systems make the inverse replacement. Use built-in file read/edit tools, not project scripts or a command the user must type. Preserve a missing, malformed, or custom `memory` registration. If you changed the file, tell the user that the current agent must be restarted and do not claim the memory tools are available in the current session.

When asked for agent-parity status in a conversation, run the project-local `status` command and call `memory_recent` to verify the current session; never infer tool availability from a static tool list because MCP tools may load lazily. If wiring is healthy but that call is unavailable, tell the user to restart the agent session. If wiring is missing, stale, conflicting, or invalid, offer to inspect the named configuration files because unrelated user settings may also prevent the agent from loading them.

When pushing or handing off through Git, commit and include every changed agent-parity-managed file. Never select only some managed changes or bypass the pre-push guard.
<!-- agent-parity:end -->
