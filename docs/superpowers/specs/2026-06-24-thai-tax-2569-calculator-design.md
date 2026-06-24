# Thai Tax Planner 2569 — Design Spec
Date: 2026-06-24

## Overview

Update `frontend/public/ThaiTax2568.html` → create `frontend/public/ThaiTax2569.html` (and redirect the 2568 file or replace it). Update the LandingPage card link to point to the new file.

Scope: standalone HTML file (Tailwind CDN + Lucide CDN, same as 2568 version). No React conversion.

---

## 1. Tax Law Changes for 2569 (Income Year 2026)

### Removed deductions
| Field | Reason |
|-------|--------|
| SSF (Super Saving Fund) | Discontinued from Jan 1, 2025 (2568). No longer deductible. |
| Easy E-Receipt 2.0 | Program ran Jan 16–Feb 28, 2568 only. Finance Ministry confirmed no renewal for 2569. |
| Tourism "Teaw Dee Mee Kuen" | 2568 program ran Oct 29–Dec 15, 2568. No 2569 equivalent confirmed. |

### Added deductions
| Field | Detail |
|-------|--------|
| Solar Rooftop Installation | Royal Decree No. 805 (effective March 3, 2026). Deduct actual cost up to **200,000 THB**. On-grid system ≤ 10 kW on owned residence. One-time per taxpayer. Requires e-Tax Invoice with name matching electricity meter. Valid through Dec 31, 2028. |
| ThaiESGX (LTF continuation) | For investors who exchanged LTF units in 2568. Deduct up to **50,000 THB/year** for 2569–2572. Separate from both the 500k retirement cap and the Thai ESG 300k limit. |

### Updated deductions
| Field | Update |
|-------|--------|
| Thai ESG | Same limit: 30% income, max 300,000 THB. Add prominent "LAST YEAR at 300k" warning — limit drops to 100,000 after Dec 31, 2026. |
| Donations | From Jan 1, 2026, all donations must be made via the **e-Donation system** to qualify. Add note to UI. |

### Unchanged deductions
Tax brackets, personal/family allowances, insurance caps, RMF, PVD, pension insurance, home loan interest — all unchanged from 2568.

---

## 2. Calculation Logic Changes

### Remove
- `ssf` field and `limitSSF` from retirement group calculation
- `easyEReceipt` field and its cap (50,000)
- `tourismMain` / `tourismSecondary` fields and tourism calculation block

### Add
- `solarRooftop`: `Math.min(data.solarRooftop, 200000)` — simple cap, no % of income constraint
- `thaiesgx`: `Math.min(data.thaiesgx, 50000)` — separate deduction, NOT in retirement cap or ESG cap

### Retirement group recalculation (post-SSF removal)
```
retirementSum = limitProvident + limitRMF + limitPension   // SSF removed
cappedRetirement = Math.min(retirementSum, 500000)
```

### Full deduction order
1. Personal allowances (personal, spouse, children, parents, disabled)
2. Social security (cap 9,000)
3. Life + health insurance (combined cap 100,000 + separate health parents 15,000)
4. Retirement group: PVD + RMF + Pension Insurance → capped at 500,000
5. Thai ESG: separate cap 300,000
6. ThaiESGX: separate cap 50,000
7. Solar Rooftop: cap 200,000
8. Home loan interest: cap 100,000
9. Donations (education 2x up to 10% net, general up to 10% net) — e-Donation required

---

## 3. Desktop Layout (unchanged structure)

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Thai Tax Planner 2569" sticky                  │
├──────────────────────────┬──────────────────────────────┤
│ Left col (7/12)          │ Right col (5/12) sticky      │
│                          │                              │
│ [1. Income]              │ [Summary Card]               │
│ [2. Family]              │  - Total Income              │
│ [3. Insurance & Funds]   │  - Expenses                  │
│    - PVD                 │  - Deductions                │
│    - RMF                 │  - Net Taxable               │
│    - Pension Insurance   │  - Tax Payable               │
│    - Thai ESG ⚠ LAST YR  │  - Withholding               │
│    - ThaiESGX (purple)   │  - STATUS (pay/refund)       │
│    - Solar Rooftop (teal)│                              │
│ [4. Stimulus & Donation] │ [Tax Bracket Table]          │
│    - Home Loan Interest  │ [Tips]                       │
│    - Donations (e-Don ℹ) │                              │
└──────────────────────────┴──────────────────────────────┘
```

---

## 4. Mobile Layout (new)

### Sticky bottom bar
Always visible over content. Updates live as user types.

```
┌─────────────────────────────────────────────────────────┐
│  ภาษีที่ต้องชำระ (or ขอคืน)  [amount]  [rate]%  ⌄   │
└─────────────────────────────────────────────────────────┘
```

- Background: `bg-slate-900`
- Amount: color red (payable) or green (refund)
- Rate badge: shows current marginal rate
- Tap anywhere on bar → smoothly scrolls to results panel
- Height: 56px, `z-50`, `fixed bottom-0 left-0 right-0`

### Mobile input improvements
- Min input height: 48px (touch-friendly)
- Results panel full-width below inputs
- Padding bottom on page: `pb-20` to avoid overlap with sticky bar

---

## 5. Visual Design

### New field accents
| Field | Color scheme |
|-------|-------------|
| Thai ESG | Green (existing) + amber warning badge |
| ThaiESGX | Purple: `bg-purple-50`, `border-purple-100`, `text-purple-700` |
| Solar Rooftop | Teal: `bg-teal-50`, `border-teal-100`, `text-teal-700` |

### Removed field styling
- Blue "Easy E-Receipt 2.0" card: deleted
- Yellow "Teaw Dee Mee Kuen" block: deleted

### Badge updates
- Thai ESG: Add `⚠ สุดท้ายปี 2569! → 100k ปีหน้า`
- Solar: `NEW 2569` badge
- ThaiESGX: `LTF Exchange` badge

---

## 6. LandingPage Update

`frontend/src/pages/LandingPage.jsx` line ~144:
- Change `path: '/ThaiTax2568.html'` → `path: '/ThaiTax2569.html'`
- Change `title: 'Tax Planner 2568'` → `title: 'Tax Planner 2569'`

---

## 7. Files Changed

| File | Action |
|------|--------|
| `frontend/public/ThaiTax2569.html` | Create (new, replaces 2568) |
| `frontend/public/ThaiTax2568.html` | Keep as-is (historical reference) |
| `frontend/src/pages/LandingPage.jsx` | Update card link + title |

---

## 8. Out of Scope
- React conversion
- Backend changes
- New stimulus programs not yet announced (Low Carbon tourism TBD)
- Potential future deduction cap reform (not enacted as of June 2026)
