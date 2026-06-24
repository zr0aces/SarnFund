# Thai Tax Planner 2569 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `ThaiTax2569.html` — a fully updated Thai personal income tax calculator for tax year 2569 (2026) — with correct 2569 deduction rules and a mobile sticky results bar.

**Architecture:** Single standalone HTML file (no build step). Based on `ThaiTax2568.html`. Tailwind CSS via CDN, Lucide icons via CDN. Changes are: remove 3 expired deductions, add 2 new deductions, update labels/warnings, add mobile sticky bar, update `LandingPage.jsx` card link.

**Tech Stack:** Vanilla HTML/JS/CSS, Tailwind CSS CDN, Lucide CDN, React/JSX (LandingPage only)

## Global Constraints

- File: `frontend/public/ThaiTax2569.html` (create new; keep `ThaiTax2568.html` intact)
- Tailwind via `https://cdn.tailwindcss.com` (same as 2568 file)
- Lucide via `https://unpkg.com/lucide@latest` (same as 2568 file)
- Fonts: Kanit + Prompt via Google Fonts (same as 2568 file)
- All Thai text must be correct Thai (no romanisation substitution)
- All money amounts in THB (฿), formatted with `toLocaleString('th-TH', {maximumFractionDigits:0})`
- No new CDN dependencies

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/public/ThaiTax2569.html` | **Create** | Full standalone calculator for 2569 |
| `frontend/public/ThaiTax2568.html` | **No change** | Historical reference |
| `frontend/src/pages/LandingPage.jsx` | **Modify** | Update card link + title to 2569 |

---

## Task 1: Bootstrap — copy 2568 and update year references

**Files:**
- Create: `frontend/public/ThaiTax2569.html`

**Interfaces:**
- Produces: a working copy of the 2568 calculator with year labels updated to 2569

- [ ] **Step 1: Copy the file**

```bash
cp /home/san/workspace/SarnFund/frontend/public/ThaiTax2568.html \
   /home/san/workspace/SarnFund/frontend/public/ThaiTax2569.html
```

- [ ] **Step 2: Update title and header text**

In `ThaiTax2569.html`, find and replace:

| Old | New |
|-----|-----|
| `Thai Tax Planner 2568` (in `<title>`) | `Thai Tax Planner 2569` |
| `Thai Tax Planner 2568` (in `<h1>`) | `Thai Tax Planner 2569` |
| `Updated Dec 2025` (badge in h1) | `Updated Jun 2026` |
| `วางแผนลดหย่อนภาษี อัปเดต Thai ESG & Easy E-Receipt 2.0` (subtitle p) | `วางแผนลดหย่อนภาษี อัปเดตปีภาษี 2569 — โซล่าเซลล์ & Thai ESG สุดท้าย` |
| `สรุปภาษี 2568` (inside right-col result card span) | `สรุปภาษี 2569` |
| `คำแนะนำ (Thai ESG 2568)` (tips card h4) | `คำแนะนำ (Thai ESG 2569 — สุดท้าย!)` |
| `ปี 68` or `ปี 2568` (any occurrence in JS tips string) | `ปี 69` / `ปี 2569` |
| `รวมรายได้ทั้งปี 2568` (label hint in income section) | `รวมรายได้ทั้งปี 2569` |

- [ ] **Step 3: Verify in browser**

Open `frontend/public/ThaiTax2569.html` directly in a browser (file://).
Check: title bar reads "Thai Tax Planner 2569", header h1 reads "Thai Tax Planner 2569", badge reads "Updated Jun 2026".

- [ ] **Step 4: Commit**

```bash
git add frontend/public/ThaiTax2569.html
git commit -m "feat: add ThaiTax2569.html scaffold from 2568 with year labels updated"
```

---

## Task 2: Remove SSF — input and calculation

**Files:**
- Modify: `frontend/public/ThaiTax2569.html`

**Interfaces:**
- Consumes: Task 1 file
- Produces: file with no SSF field in HTML or JS

- [ ] **Step 1: Remove SSF from JS state object**

Find and delete the `ssf: 0,` line inside the `let data = { ... }` block (around line 599 in 2568 original).

- [ ] **Step 2: Remove SSF from calculateTax()**

Find and delete the line:
```js
const limitSSF = Math.min(data.ssf, totalIncome * 0.30, 200000);
```

Then update the `retirementSum` line from:
```js
const retirementSum = limitProvident + limitSSF + limitRMF + limitPension;
```
to:
```js
const retirementSum = limitProvident + limitRMF + limitPension;
```

- [ ] **Step 3: Remove SSF input HTML**

Delete the entire `<div class="input-group">` block that contains `id="ssf"` — it looks like this:
```html
<div class="input-group">
    <div class="flex justify-between mb-1">
        <label class="text-sm font-medium text-gray-600">กองทุน SSF</label>
        <span class="text-xs text-gray-400">ไม่เกิน 30% / 200k</span>
    </div>
    <div class="relative">
        <input type="number" id="ssf" oninput="updateData('ssf', this.value)" placeholder="0"
            class="w-full p-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none">
        <span class="absolute right-3 top-3 text-gray-400 text-sm">฿</span>
    </div>
</div>
```

- [ ] **Step 4: Verify calculation without SSF**

Open file in browser. Enter salary=1,000,000. Set RMF=0. Confirm the retirement group cap still works correctly (set PVD=200,000, RMF=300,000 → retirement capped at 500,000). No JavaScript errors in console.

- [ ] **Step 5: Commit**

```bash
git add frontend/public/ThaiTax2569.html
git commit -m "feat(2569): remove SSF deduction — discontinued from Jan 2025"
```

---

## Task 3: Remove Easy E-Receipt and Tourism — input and calculation

**Files:**
- Modify: `frontend/public/ThaiTax2569.html`

**Interfaces:**
- Consumes: Task 2 file
- Produces: file with no Easy E-Receipt or Tourism fields

- [ ] **Step 1: Remove Easy E-Receipt and Tourism from JS state**

In `let data = { ... }`, delete these lines:
```js
easyEReceipt: 0,
tourismMain: 0,
tourismSecondary: 0,
```

- [ ] **Step 2: Remove Easy E-Receipt calculation**

In `calculateTax()`, delete:
```js
deductions += Math.min(data.easyEReceipt, 50000); // Easy E-Receipt 2.0
```

- [ ] **Step 3: Remove Tourism calculation**

In `calculateTax()`, delete the entire tourism block (comments + logic):
```js
// Tourism (Teaw Dee Mee Kuen 2568)
// Rule: Main max 20k, Secondary 1.5x. Combined max 30k.
const tourMain = Math.min(data.tourismMain, 20000);
const tourSec = data.tourismSecondary * 1.5;
const totalTour = Math.min(tourMain + tourSec, 30000);
// Re-check logic: usually Main city spending is capped at 20k within the 30k total
// If Main=20k, Secondary=0 => 20k
// If Main=0, Secondary=20k => 30k
// If Main=20k, Secondary=10k => Main 20k + Secondary 15k = 35k -> Cap 30k.
deductions += totalTour;
```

- [ ] **Step 4: Remove Easy E-Receipt HTML**

In Section 4 (Stimulus & Donation), delete the entire Easy E-Receipt `<div class="input-group bg-blue-50 ...">` block:
```html
<!-- Easy E-Receipt -->
<div class="input-group bg-blue-50 p-2 rounded border border-blue-100">
    <div class="flex justify-between mb-1">
        <label class="text-sm font-bold text-blue-700 flex items-center">
            Easy E-Receipt 2.0 <span class="badge-new">16 ม.ค.-28 ก.พ. 68</span>
        </label>
        <span class="text-xs text-blue-600">สูงสุด 50,000 บาท (ต้องมี e-Tax Invoice)</span>
    </div>
    <div class="relative">
        <input type="number" id="easyEReceipt" oninput="updateData('easyEReceipt', this.value)"
            placeholder="0"
            class="w-full p-3 pr-10 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
        <span class="absolute right-3 top-3 text-gray-400 text-sm">฿</span>
    </div>
</div>
```

- [ ] **Step 5: Remove Tourism HTML**

Delete the entire `<div class="bg-yellow-50 ...">` tourism block (the "เที่ยวดีมีคืน 2568" card with two inputs `tourismMain` and `tourismSecondary`).

- [ ] **Step 6: Update Section 4 title**

Change the section header span from:
```html
<span class="font-semibold text-gray-700">4. กระตุ้นเศรษฐกิจ & บริจาค</span>
```
to:
```html
<span class="font-semibold text-gray-700">4. บ้าน & บริจาค</span>
```

- [ ] **Step 7: Verify in browser**

Open in browser. Section 4 should show only: Home Loan Interest + two donation fields. No JS errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/public/ThaiTax2569.html
git commit -m "feat(2569): remove Easy E-Receipt and Tourism deductions — expired 2568 programs"
```

---

## Task 4: Add Solar Rooftop and ThaiESGX — input and calculation

**Files:**
- Modify: `frontend/public/ThaiTax2569.html`

**Interfaces:**
- Consumes: Task 3 file
- Produces: file with `solarRooftop` and `thaiesgx` fields in state, calculation, and HTML

- [ ] **Step 1: Add to JS state**

In `let data = { ... }`, after `pensionInsurance: 0,` add:
```js
thaiesgx: 0,
solarRooftop: 0,
```

- [ ] **Step 2: Add Solar Rooftop to calculateTax()**

After the `// Thai ESG` deduction block, add:
```js
// ThaiESGX (LTF exchange continuation 2569-2572: 50,000/yr, separate limit)
const limitTHAIESGX = Math.min(data.thaiesgx, 50000);
deductions += limitTHAIESGX;

// Solar Rooftop (Royal Decree No.805, eff. Mar 2026, max 200k through 2028)
const limitSolar = Math.min(data.solarRooftop, 200000);
deductions += limitSolar;
```

Place these BEFORE the `// Stimulus` section (home loan interest line).

- [ ] **Step 3: Add ThaiESGX input HTML in Section 3**

Inside Section 3 (Insurance & Funds), after the Thai ESG (`id="tesg"`) block and before the closing `</div>` of the grid, add:

```html
<!-- ThaiESGX (LTF exchange continuation) -->
<div class="input-group col-span-full bg-purple-50 p-2 rounded border border-purple-100">
    <div class="flex justify-between mb-1">
        <label class="text-sm font-bold text-purple-700 flex items-center">
            Thai ESGX <span class="badge-new" style="background-color:#7c3aed">LTF Exchange</span>
        </label>
        <span class="text-xs text-purple-600">ต่อเนื่องจากการแลกเปลี่ยน LTF ปี 2568 สูงสุด 50,000 บาท/ปี (2569-2572)</span>
    </div>
    <div class="relative">
        <input type="number" id="thaiesgx" oninput="updateData('thaiesgx', this.value)" placeholder="0"
            class="w-full p-3 pr-10 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none">
        <span class="absolute right-3 top-3 text-gray-400 text-sm">฿</span>
    </div>
</div>
```

- [ ] **Step 4: Add Solar Rooftop input HTML in Section 3**

After the ThaiESGX block (still inside Section 3 grid), add:

```html
<!-- Solar Rooftop -->
<div class="input-group col-span-full bg-teal-50 p-2 rounded border border-teal-100">
    <div class="flex justify-between mb-1">
        <label class="text-sm font-bold text-teal-700 flex items-center">
            โซล่าเซลล์ติดตั้งที่อยู่อาศัย <span class="badge-new" style="background-color:#0d9488">NEW 2569</span>
        </label>
        <span class="text-xs text-teal-600">ค่าซื้อ+ติดตั้งระบบ Solar Rooftop ≤ 10kW สูงสุด 200,000 บาท (ผ่าน 2571)</span>
    </div>
    <div class="relative">
        <input type="number" id="solarRooftop" oninput="updateData('solarRooftop', this.value)" placeholder="0"
            class="w-full p-3 pr-10 bg-white border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none">
        <span class="absolute right-3 top-3 text-gray-400 text-sm">฿</span>
    </div>
    <p class="text-xs text-teal-500 mt-1">* ต้องมี e-Tax Invoice ชื่อตรงกับทะเบียนมิเตอร์ไฟฟ้า / ลดหย่อนได้ครั้งเดียว</p>
</div>
```

- [ ] **Step 5: Verify Solar + ThaiESGX calculation**

Open in browser. Enter salary=2,000,000. Enter ThaiESGX=100,000 → confirm it caps at 50,000 in deductions. Enter Solar=300,000 → confirm it caps at 200,000. No JS errors in console.

- [ ] **Step 6: Commit**

```bash
git add frontend/public/ThaiTax2569.html
git commit -m "feat(2569): add Solar Rooftop (200k) and ThaiESGX (50k/yr) deductions"
```

---

## Task 5: Update Thai ESG label with "LAST YEAR" warning

**Files:**
- Modify: `frontend/public/ThaiTax2569.html`

**Interfaces:**
- Consumes: Task 4 file
- Produces: Thai ESG card with prominent expiry warning

- [ ] **Step 1: Update Thai ESG card label**

Find the Thai ESG input block (around the `id="tesg"` input). The current label reads:
```html
<label class="text-sm font-bold text-green-700 flex items-center">
    Thai ESG (ปี 2568) <span class="badge-new">NEW Limit 300k</span>
</label>
<span class="text-xs text-green-600">ลดหย่อน 30% สูงสุด 300,000
    (แยกจากกลุ่มเกษียณ)</span>
```

Replace with:
```html
<label class="text-sm font-bold text-green-700 flex items-center flex-wrap gap-1">
    Thai ESG (ปี 2569)
    <span class="badge-new bg-amber-500">⚠ สุดท้าย 300k!</span>
</label>
<span class="text-xs text-green-600">ลดหย่อน 30% สูงสุด 300,000 บาท — <strong class="text-amber-600">ปี 2570 ลดเหลือ 100,000 บาท</strong> (แยกจากกลุ่มเกษียณ)</span>
```

- [ ] **Step 2: Update JS tips string**

In `calculateTax()`, find the tips innerHTML string that references Thai ESG. Update to mention the last-year warning:
```js
document.getElementById('tax-tips').innerHTML = `
    อัตราภาษีสูงสุดของคุณอยู่ที่ <strong>${maxRate}%</strong><br>
    หากซื้อ <strong>Thai ESG</strong> เพิ่ม 10,000 บาท ประหยัดภาษีได้ ${formatMoney(savingPer10k)} บาท<br>
    <span class="text-xs text-amber-600 font-medium">⚠ ปี 2569 เป็นปีสุดท้ายที่วงเงิน Thai ESG อยู่ที่ 300,000 บาท — ปี 2570 ลดเหลือ 100,000 บาท</span>
`;
```

- [ ] **Step 3: Verify in browser**

Open in browser. Section 3 Thai ESG card should display amber "⚠ สุดท้าย 300k!" badge. Tips area after entering income should show the amber warning.

- [ ] **Step 4: Commit**

```bash
git add frontend/public/ThaiTax2569.html
git commit -m "feat(2569): add Thai ESG last-year warning — 300k limit expires end of 2569"
```

---

## Task 6: Add e-Donation note to Section 4

**Files:**
- Modify: `frontend/public/ThaiTax2569.html`

**Interfaces:**
- Consumes: Task 5 file
- Produces: donation fields have e-Donation system note

- [ ] **Step 1: Add e-Donation info banner above donation inputs**

Inside Section 4, before the `<div class="input-group">` for `donationEducation`, add:

```html
<div class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
    <strong>ℹ บริจาคปี 2569:</strong> ต้องผ่านระบบ <strong>e-Donation</strong> เท่านั้น (มีผลตั้งแต่ 1 ม.ค. 2569) — บริจาคด้วยเงินสดหรือโอนปกติไม่มีสิทธิ์ลดหย่อน
</div>
```

- [ ] **Step 2: Verify in browser**

Section 4 should show the blue info banner above the two donation inputs.

- [ ] **Step 3: Commit**

```bash
git add frontend/public/ThaiTax2569.html
git commit -m "feat(2569): add e-Donation requirement notice to Section 4"
```

---

## Task 7: Add mobile sticky bottom bar

**Files:**
- Modify: `frontend/public/ThaiTax2569.html`

**Interfaces:**
- Consumes: Task 6 file
- Produces: sticky bottom bar visible only on mobile (hidden on lg+), updates live

- [ ] **Step 1: Add bottom padding to main content to avoid bar overlap**

Find:
```html
<body class="bg-white min-h-screen pb-12">
```
Replace with:
```html
<body class="bg-white min-h-screen pb-12 lg:pb-12 pb-20">
```

Wait — Tailwind utility order matters. The correct way with responsive variants:
```html
<body class="bg-white min-h-screen pb-20 lg:pb-12">
```

- [ ] **Step 2: Add sticky bottom bar HTML**

Before the closing `</body>` tag (and before the `<script>` block), add the sticky bar:

```html
<!-- Mobile sticky tax bar (hidden on desktop) -->
<div id="mobile-sticky-bar"
    class="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white z-50 shadow-2xl border-t border-slate-700"
    style="height:56px;"
    onclick="document.getElementById('results-anchor').scrollIntoView({behavior:'smooth'})">
    <div class="max-w-6xl mx-auto h-full flex items-center justify-between px-4 cursor-pointer">
        <div class="flex items-center gap-3">
            <span id="mobile-status-label" class="text-xs text-slate-400">ภาษีที่ต้องชำระ</span>
            <span id="mobile-status-amount" class="text-xl font-display font-bold text-orange-400">0 ฿</span>
        </div>
        <div class="flex items-center gap-2">
            <span id="mobile-rate-badge" class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full hidden">0%</span>
            <i data-lucide="chevron-up" class="w-5 h-5 text-slate-400"></i>
        </div>
    </div>
</div>
```

- [ ] **Step 3: Add anchor for scroll target**

Find the right column div (results panel):
```html
<!-- Right Column: Results -->
<div class="lg:col-span-5">
```
Replace with:
```html
<!-- Right Column: Results -->
<div id="results-anchor" class="lg:col-span-5">
```

- [ ] **Step 4: Update calculateTax() to drive the mobile bar**

At the end of `calculateTax()`, after the existing UI updates, add:

```js
// Update mobile sticky bar
const mobileAmount = document.getElementById('mobile-status-amount');
const mobileLabel = document.getElementById('mobile-status-label');
const mobileRateBadge = document.getElementById('mobile-rate-badge');

if (taxStatus >= 0) {
    mobileLabel.innerText = 'ต้องชำระเพิ่ม';
    mobileAmount.className = 'text-xl font-display font-bold text-red-400';
    mobileAmount.innerText = formatMoney(taxStatus) + ' ฿';
} else {
    mobileLabel.innerText = 'ขอคืนภาษีได้';
    mobileAmount.className = 'text-xl font-display font-bold text-emerald-400';
    mobileAmount.innerText = formatMoney(Math.abs(taxStatus)) + ' ฿';
}

if (maxRate > 0) {
    mobileRateBadge.classList.remove('hidden');
    mobileRateBadge.innerText = maxRate + '%';
} else {
    mobileRateBadge.classList.add('hidden');
}
```

Note: `maxRate` is computed earlier in `calculateTax()` — it must be hoisted to be accessible here. Move the `const maxRate = ...` line to before the `calculateTax` `}` close, or confirm it's already in scope (it is — it's in the same function scope).

- [ ] **Step 5: Re-init Lucide icons after bar is added**

The sticky bar uses `data-lucide="chevron-up"`. Ensure `lucide.createIcons()` is called after DOM load (it already is at the bottom of the script as "Initial Calc"). No extra call needed since the bar is static HTML rendered at page load.

- [ ] **Step 6: Verify on mobile viewport**

In browser DevTools, switch to mobile viewport (e.g. iPhone SE 375px). Confirm:
- Sticky bar visible at bottom of screen
- Amount shows "0 ฿" on load (orange)
- Enter salary=1,200,000 → bar updates live showing amount in red (payable) with rate badge
- Enter RMF=200,000 → bar updates immediately
- Tap bar → scrolls smoothly to results panel
- On desktop viewport (≥1024px): bar is hidden

- [ ] **Step 7: Commit**

```bash
git add frontend/public/ThaiTax2569.html
git commit -m "feat(2569): add mobile sticky bottom bar with live tax status"
```

---

## Task 8: Update LandingPage.jsx card link

**Files:**
- Modify: `frontend/src/pages/LandingPage.jsx`

**Interfaces:**
- Consumes: Task 7 (ThaiTax2569.html exists)
- Produces: landing page Tax Planner card links to new file

- [ ] **Step 1: Update the card definition**

In `LandingPage.jsx`, find the tax card object (around line 142–148):
```js
{
  id: 'tax',
  badge: ...,
  path: '/ThaiTax2568.html',
  ...,
  title: 'Tax Planner 2568',
  desc: 'Optimize your withholding rates and project tax deductions dynamically.',
```

Update `path` and `title`:
```js
path: '/ThaiTax2569.html',
...
title: 'Tax Planner 2569',
```

- [ ] **Step 2: Verify dev server**

```bash
cd /home/san/workspace/SarnFund/frontend && npm run dev
```

Open `http://localhost:5173`. The Tax Planner card should show "Tax Planner 2569". Clicking it should open the new calculator. No console errors.

Kill the dev server with Ctrl+C after verifying.

- [ ] **Step 3: Update landing page tip text**

In `LandingPage.jsx`, find the tips array entry (around line 25):
```js
"Thai Tax 2568: Plan early to optimize withholding tax rates across brackets."
```
Update to:
```js
"Thai Tax 2569: Thai ESG วงเงิน 300k สุดท้าย — ลดเหลือ 100k ปี 2570!"
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/LandingPage.jsx
git commit -m "feat: update Tax Planner card to link ThaiTax2569 and 2569 tip text"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Remove SSF | Task 2 |
| Remove Easy E-Receipt | Task 3 |
| Remove Tourism | Task 3 |
| Add Solar Rooftop (200k) | Task 4 |
| Add ThaiESGX (50k) | Task 4 |
| Thai ESG last-year warning | Task 5 |
| e-Donation note | Task 6 |
| Mobile sticky bar | Task 7 |
| LandingPage card update | Task 8 |
| Title/year labels updated | Task 1 |
| Keep ThaiTax2568.html intact | Task 1 (copy, not move) |

All requirements covered. ✓

**Placeholder scan:** No TBDs or incomplete code blocks. ✓

**Type consistency:** All field names match between state object additions (`thaiesgx`, `solarRooftop`) and HTML `id` attributes and `oninput` calls. ✓
