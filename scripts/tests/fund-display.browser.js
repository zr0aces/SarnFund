// Navigate to the Vite dev server, then run with Playwright browser_run_code.
// All API responses are mocked; no SEC requests or fund-file writes occur.
async (page) => {
    const baseUrl = await page.evaluate(() => location.origin);
    const cacheKey = 'fund_cache_v4_sp';
    const snapshot = {
        success: true,
        timestamp: Date.now(),
        data: [{ id: 'test', code: 'TEST-SP', name: 'Test Fund', amc: 'KAsset',
            nav: 17.2105, navDate: '2026-10-01', risk: 6, type: 'SP',
            ytd: 0, return3m: 0, return6m: 0, return1y: 0, return3y: 0, return5y: 0 }],
    };
    let failRequest = false;
    const handler = route => route.fulfill({
        status: failRequest ? 503 : 200,
        json: failRequest ? { success: false } : snapshot,
    });
    const check = (condition, message) => {
        if (!condition) throw new Error(message);
    };
    await page.route('**/api/funds/sp', handler);
    try {
        await page.goto(`${baseUrl}/funds/sp`, { waitUntil: 'domcontentloaded' });
        await page.evaluate(key => localStorage.setItem(key,
            JSON.stringify({ timestamp: Date.now(), data: {} })), cacheKey);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Update NAV', exact: true }).waitFor();
        check(await page.locator('tbody').innerText().then(text => text.includes('17.2105')),
            'Malformed cache must not blank the page; API NAV must display');
        check(await page.getByRole('status').innerText().then(text => text.includes('performance data is unavailable')),
            'Missing SEC returns must be explained');
        check(await page.getByText('Top 10 Performance Radar', { exact: false }).count() === 0,
            'Missing returns must not be charted as zeros');
        check(!(await page.locator('body').innerText()).includes('+0.00%'),
            'Missing returns must not produce a 0% average');
        await page.setViewportSize({ width: 390, height: 844 });
        check(await page.getByText('Latest NAV', { exact: true }).first().isVisible(),
            'NAV must display on mobile');

        failRequest = true;
        await page.evaluate(key => localStorage.removeItem(key), cacheKey);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.getByText('Unable to fetch data: API error: 503', { exact: true }).waitFor();
        check(await page.getByRole('button', { name: 'Update NAV', exact: true }).isEnabled(),
            'Initial fetch failure must enable retry');
        failRequest = false;
        await page.getByRole('button', { name: 'Update NAV', exact: true }).click();
        await page.locator('tbody').waitFor({ state: 'attached' });
        check((await page.locator('tbody').innerText()).includes('TEST-SP'), 'Retry must display funds');
        snapshot.timestamp += 1000;
        snapshot.data[0].return1y = 12;
        await page.getByRole('button', { name: 'Update NAV', exact: true }).click();
        await page.getByText('Top 10 Performance Radar', { exact: false }).waitFor();
        check((await page.locator('body').innerText()).includes('+12.00%'),
            'Available performance must still display');
        return 'Passed: malformed-cache recovery, desktop/mobile NAV, missing-return notice, no false average/chart, failed-fetch recovery.';
    } finally {
        await page.unroute('**/api/funds/sp', handler);
        await page.evaluate(key => localStorage.removeItem(key), cacheKey);
    }
}
