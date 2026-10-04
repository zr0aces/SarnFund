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
