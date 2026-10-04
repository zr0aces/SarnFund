# Plan: Add "S&P" (S&P 500) Fund Type

**Date**: 2026-10-04  
**Author**: Antigravity  
**Goal**: Integrate the S&P 500 (`sp`) fund type into SarnFund across backend and frontend, populated with the user-provided 33 funds list and enriched with live SEC Thailand Open Data API v2 NAV and performance telemetry.

---

## 1. Overview & Data Mapping
The user provided a curated list of 33 S&P 500 funds and share classes in Thailand across 12 AMCs:
- AIA IM (AIA-US500)
- Asset Plus (ASP-S&P500-A, ASP-S&P500-SSF)
- Bualuang / BBL (B-USPASSIVE)
- Eastspring (ES-US500, ES-US500RMF)
- KAsset (K-US500X-A(A), K-US500XRMF, K-US500XUH)
- Krungsri (KFUSINDFX-A, KFUSINDFX-I, KFUSINDX-A, KFUSINDX-I)
- KKP (KKP US500-H, KKP US500-UH, KKP US500-UH-E, KKP US500-UH-M, KKP US500-UH-SSF)
- KTAM (KT-S&P500-A, KT-S&P500-USD-A)
- MFC (M-US500H)
- SCBAM (SCBRMS&P500, SCBS&P500, SCBS&P500(SSFA), SCBS&P500-SSF, SCBS&P500A, SCBS&P500E, SCBUSDS&P500)
- TISCO (TISCOUS-A, TISCOUS-SSF)
- Talis (TLUS500-H, TLUS500-UH-A, TLUS500-UH-X)

All 33 have been verified and mapped to their exact SEC `proj_id` and unit class names, and verified live with 100% success rate on SEC v2 Daily Info and Performance endpoints.

---

## 2. Implementation Steps

### Phase 1: Backend Integration
1. **`backend/server.js`**:
   - Add `'sp'` to `ACTIVE_FUND_TYPES`.
   - Add alias `/api/funds/sp500` -> redirects to `/api/funds/sp`.
2. **`backend/fund-store.js`**:
   - Include `'sp'` in `getHealth()` and `getStats()` type lists.
3. **`backend/scraper.js`**:
   - Add `'SP'` to `FUND_TYPES`.
   - Add `'AIA'` to `AMC_REGISTRY` (`{ display: 'AIA IM', pattern: /\baia\b/i }`).
   - Add curated S&P funds mapping so future scrapes refresh S&P NAV and performance.
4. **Data Generation**:
   - Write `data/sp.json` containing all 33 funds with live SEC metrics (NAV, returns, net assets, risk, factsheet URLs, and report summaries).
   - Update `data/all.json` to include `"sp"`.

### Phase 2: Frontend Integration
1. **`frontend/src/config/fundCategories.js`**:
   - Add `'AIA IM': '#D9222A'` and `'Bualuang': '#2563EB'` to `MASTER_AMC_COLORS`.
   - Add `sp` category configuration to `FUND_CATEGORIES` (path `/funds/sp`, icon `Globe`, theme colors, tax caps, lockup rules, description, and key rules).
2. **`frontend/src/pages/SpPage.jsx`**:
   - Create standard page component using `DashboardLayout`.
3. **`frontend/src/App.jsx`**:
   - Register routes `/funds/sp` and `/funds/sp500`.
4. **`frontend/src/components/DashboardLayout.jsx`**:
   - Add S&P 500 tab to `FUND_TABS` for desktop and mobile navigation.
5. **`frontend/src/pages/LandingPage.jsx`**:
   - Include `sp: 0` in telemetry stats state.
6. **`frontend/src/data/tips.json`**:
   - Add category tips for S&P 500.
7. **`frontend/src/data/funds.js`**:
   - Add `INITIAL_SP` and `AMC_COLORS_SP`.

### Phase 3: Verification
1. Run `cd frontend && npm run lint` to ensure zero ESLint errors/warnings.
2. Run `cd frontend && npm run build` to verify production build.
3. Verify `/api/funds/sp` and `/api/stats` outputs.
4. Run `node scripts/sync-version.mjs --check`.
