#!/usr/bin/env node
/**
 * Script to create initial mock data files for backend
 * This ensures the backend is healthy even before first scrape
 */

import { FileFundStoreAdapter } from './fund-store.js';
import { SEED_FUNDS } from './seed-data.js';

export async function initializeData(store = new FileFundStoreAdapter()) {
  console.log('Initializing SarnFund backend seed data...');
  
  await store.ensureDataDir();
  console.log('✓ Data directory verified/created');
  const timestamp = Date.now();
  const selectedAMCs = Array.from(new Set(Object.values(SEED_FUNDS).flat().map(f => f.amc).filter(Boolean))).sort();
  
  const filesToCreate = [
    { name: 'rmf', data: SEED_FUNDS.rmf },
    { name: 'esg', data: SEED_FUNDS.esg },
    { name: 'esgx', data: SEED_FUNDS.esgx },
    { name: 'ssf', data: SEED_FUNDS.ssf },
    { name: 'etf', data: SEED_FUNDS.etf },
    { name: 'sp', data: SEED_FUNDS.sp }
  ];

  for (const file of filesToCreate) {
    await store.saveFunds(file.name, file.data, { selectedAMCs });
    console.log(`   ✓ Created ${file.name}.json with ${file.data.length} items`);
  }
  
  // Create combined data file (all.json)
  const allData = {
    timestamp,
    lastUpdated: new Date(timestamp).toISOString(),
    selectedAMCs,
    data: {
      rmf: SEED_FUNDS.rmf,
      esg: SEED_FUNDS.esg,
      esgx: SEED_FUNDS.esgx,
      ssf: SEED_FUNDS.ssf,
      etf: SEED_FUNDS.etf,
      sp: SEED_FUNDS.sp
    }
  };
  await store.saveAllFundsCombined(allData);
  console.log('✓ Created all.json snapshot');
  
  console.log('\n✅ Backend data initialized successfully!');
  console.log('The backend server is now seeded and ready to serve mock requests.');
  console.log('Run "npm run scrape" to scrape live SEC endpoints.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  initializeData().catch(error => {
    console.error('❌ Failed to initialize data:', error);
    process.exit(1);
  });
}

