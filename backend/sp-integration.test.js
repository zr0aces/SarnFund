import assert from 'node:assert/strict';
import test from 'node:test';
import { scrapeData } from './scraper.js';
import { HttpSecAdapter } from './sec-api-connector.js';
import { SP_FUNDS_CATALOG } from './sp-catalog.js';

function memoryStore(registry) {
  return {
    getRegistry: async () => registry,
    getProgress: async () => null,
    clearProgress: async () => {},
    saveRegistry: async () => {},
    getFunds: async () => null,
    saveFunds: async () => {},
    saveFailedFunds: async () => {},
    saveAllFundsCombined: async () => {},
  };
}

function connector() {
  return {
    getAmcList: async () => [{ comp_name_en: 'AIA', unique_id: 'aia' }],
    getFundProfiles: async () => [],
    getLatestNav: async () => ({ nav: { last_val: 10 }, navDate: '2026-10-01' }),
    getFundPerformance: async () => ({ year_1: 5 }),
  };
}

test('cached pre-SP registry gains all curated classes without dropping tax funds', async () => {
  const taxFund = { ...SP_FUNDS_CATALOG[7], type: 'RMF' };
  const registry = [taxFund];
  const result = await scrapeData(connector(), memoryStore(registry));
  assert.equal(result.data.sp.length, 33);
  assert.equal(result.data.rmf.length, 1);
  assert.equal(registry.length, 1, 'do not mutate the cached registry');
});

test('catalog merge is idempotent for cached and rebuilt registries', async () => {
  for (const registry of [SP_FUNDS_CATALOG, null]) {
    const result = await scrapeData(connector(), memoryStore(registry));
    assert.equal(result.data.sp.length, 33);
    assert.equal(new Set(result.data.sp.map(fund => fund.id)).size, 33);
  }
});

test('scraper passes the unit class to performance retrieval', async () => {
  const client = connector();
  const calls = [];
  client.getFundPerformance = async (project, fundClass) => {
    calls.push([project, fundClass]);
    return {};
  };
  await scrapeData(client, memoryStore(SP_FUNDS_CATALOG));
  assert.deepEqual(calls, SP_FUNDS_CATALOG.map(fund => [fund.proj_id, fund.class]));
});

test('performance parser isolates share classes and does not borrow missing returns', async () => {
  const adapter = new HttpSecAdapter('mock', 'mock');
  adapter._client = {
    getFundPerformance: async () => [
      { fund_class_name: 'A', performance_type_desc: 'Fund Return', reference_period: '1 year', performance_value: 12 },
      { fund_class_name: 'I', performance_type_desc: 'Fund Return', reference_period: '1 year', performance_value: 18 },
      { fund_class_name: 'A', performance_type_desc: 'Benchmark', reference_period: '1 year', performance_value: 99 },
      { fund_class_name: 'A', performance_type_desc: 'Fund Return', reference_period: 'YTD', performance_value: '-' },
    ],
  };
  assert.equal((await adapter.getFundPerformance('project', 'A')).year_1, 12);
  assert.equal((await adapter.getFundPerformance('project', 'I')).year_1, 18);
  assert.equal((await adapter.getFundPerformance('project', 'missing')).year_1, 0);
  assert.equal((await adapter.getFundPerformance('project', 'A')).ytd, 0);
  assert.equal((await adapter.getFundPerformance('project')).year_1, 18, 'preserve unfiltered callers');
});

test('scraper computes trailing returns and resolves risk when SEC factsheet performance is empty', async () => {
  const conn = connector();
  conn.getFundPerformance = async () => ({ year_1: 0, ytd: 0 }); // simulate SEC 204 empty
  conn.getLatestNav = async () => ({ nav: { last_val: 120, net_asset: 1000000 }, navDate: '2026-10-01' });
  conn.getBenchmarkNavMaps = async () => ({
    ytd: new Map([['project::main', 100]]),
    year_1: new Map([['project::main', 96]]),
    month_6: new Map([['project::main', 110]]),
    month_3: new Map([['project::main', 115]]),
    riskMap: new Map([['project', 6]])
  });

  const registry = [{ proj_id: 'project', code: 'TEST', name: 'Test Fund', amc: 'Test', type: 'SP', class: null, riskLevel: 0, status: 'Registered' }];
  let savedData = null;
  const store = {
    ...memoryStore(registry),
    saveFunds: async (type, funds) => {
      if (type === 'sp') savedData = funds;
    }
  };

  await scrapeData(conn, store);
  const testFund = savedData.find(f => f.code === 'TEST');
  assert.ok(testFund, 'Test fund should be saved');
  assert.equal(testFund.return1y, 25); // (120 - 96) / 96 * 100 = 25%
  assert.equal(testFund.ytd, 20);      // (120 - 100) / 100 * 100 = 20%
  assert.equal(testFund.risk, 6);      // resolved from riskMap
});

test('scraper falls back to existing cached fund data when live NAV returns null', async () => {
  const conn = connector();
  conn.getLatestNav = async () => null; // simulate SEC API 204 or missing NAV

  const cachedFund = {
    id: 'project_main_TEST',
    proj_id: 'project',
    code: 'TEST',
    name: 'Test Fund',
    amc: 'Test',
    type: 'SP',
    nav: 125.5,
    navDate: '2026-09-30',
    risk: 6,
    return1y: 20
  };

  const registry = [{ proj_id: 'project', code: 'TEST', name: 'Test Fund', amc: 'Test', type: 'SP', class: null, riskLevel: 6, status: 'Registered' }];
  let savedData = null;
  const store = {
    ...memoryStore(registry),
    getFunds: async (type) => {
      if (type === 'sp') return { data: [cachedFund] };
      return null;
    },
    saveFunds: async (type, funds) => {
      if (type === 'sp') savedData = funds;
    }
  };

  const result = await scrapeData(conn, store);
  assert.equal(result.abortedWrite, undefined, 'should not abort since cached fund data salvaged the scrape');
  assert.ok(savedData, 'saveFunds should have been called');
  const fund = savedData.find(f => f.code === 'TEST');
  assert.ok(fund, 'cached fund should be present');
  assert.equal(fund.nav, 125.5);
});

test('scraper aborts destructive file write when all funds fail and no cache exists', async () => {
  const conn = connector();
  conn.getLatestNav = async () => null; // all fail

  const registry = [{ proj_id: 'project', code: 'TEST', name: 'Test Fund', amc: 'Test', type: 'SP', class: null, riskLevel: 6, status: 'Registered' }];
  let saveFundsCalled = false;
  const store = {
    ...memoryStore(registry),
    getFunds: async () => null, // no cache exists
    saveFunds: async () => { saveFundsCalled = true; },
    saveFailedFunds: async () => {}
  };

  const result = await scrapeData(conn, store);
  assert.equal(result.abortedWrite, true, 'abortedWrite must be true');
  assert.equal(saveFundsCalled, false, 'saveFunds must NOT be called when write is aborted');
});

