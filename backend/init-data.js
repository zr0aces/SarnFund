#!/usr/bin/env node
/**
 * Script to create initial mock data files for backend
 * This ensures the backend is healthy even before first scrape
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

// Sample RMF data (subset from frontend mock data)
const RMF_INITIAL_DATA = [
  { id: 'k1', code: 'KKP GNP RMF-H', name: 'เคเคพี โกลบอล นิว เพอร์สเปกทีฟ RMF', amc: 'KKP', nav: 16.42, ytd: 12.5, return1y: 18.2, return2y: 8.5, return3y: 6.2, return5y: 9.8, risk: 6, type: 'Global Equity', isNew: false, navDate: '2026-06-23' },
  { id: 'k2', code: 'KKP EQRMF', name: 'เคเคพี หุ้นทุนเพื่อการเลี้ยงชีพ', amc: 'KKP', nav: 42.10, ytd: -2.1, return1y: 4.5, return2y: -1.2, return3y: 2.1, return5y: 1.5, risk: 6, type: 'Thai Equity', isNew: false, navDate: '2026-06-23' },
  { id: 'ks1', code: 'KFLTFEQ-RMF', name: 'กรุงศรีหุ้นระยะยาวอิควิตี้ RMF', amc: 'Krungsri', nav: 18.45, ytd: 1.2, return1y: 5.4, return2y: 0.5, return3y: 3.2, return5y: 2.1, risk: 6, type: 'Thai Equity', isNew: false, navDate: '2026-06-23' },
  { id: 'ks2', code: 'KFGBRANRMF', name: 'กรุงศรี Global Brand RMF', amc: 'Krungsri', nav: 15.67, ytd: 14.2, return1y: 19.8, return2y: 12.5, return3y: 9.8, return5y: 11.2, risk: 6, type: 'Global Equity', isNew: false, navDate: '2026-06-23' },
  { id: 'b1', code: 'BERMF', name: 'บัวหลวงตราสารทุนเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 56.78, ytd: 3.5, return1y: 7.2, return2y: 2.1, return3y: 5.4, return5y: 4.2, risk: 6, type: 'Thai Equity', isNew: false, navDate: '2026-06-23' }
];

// Sample ThaiESG data
const ESG_INITIAL_DATA = [
  { id: 'k1', code: 'KKP EQ THAI ESG', name: 'เคเคพี หุ้นไทยเพื่อความยั่งยืน', amc: 'KKP', nav: 10.45, ytd: 4.2, return1y: 6.5, risk: 6, type: 'Equity ESG', isNew: false, navDate: '2026-06-23' },
  { id: 'ks1', code: 'KFTHAIESG', name: 'กรุงศรีไทยเพื่อความยั่งยืน (ชนิดสะสมมูลค่า)', amc: 'Krungsri', nav: 9.85, ytd: 3.5, return1y: 5.8, risk: 6, type: 'Equity ESG', isNew: false, navDate: '2026-06-23' },
  { id: 'b1', code: 'B-TOP-THAIESG', name: 'บัวหลวงทศพลไทยเพื่อความยั่งยืน', amc: 'BBL', nav: 10.80, ytd: 5.5, return1y: 8.2, risk: 6, type: 'Equity ESG', isNew: false, navDate: '2026-06-23' }
];

// Sample ThaiESGX data
const ESGX_INITIAL_DATA = [
  { id: 'e1', code: 'KKP ESGX EXTRA', name: 'เคเคพี ไทย อีเอสจี เอ็กซ์ตร้า', amc: 'KKP', nav: 11.20, ytd: 6.2, return1y: 9.5, risk: 6, type: 'Equity ESG Extra', isNew: true, navDate: '2026-06-23' },
  { id: 'e2', code: 'SCBTHAEGX', name: 'ไทยพาณิชย์ ไทย อีเอสจี เอ็กซ์ตร้า', amc: 'SCB', nav: 10.50, ytd: 5.1, return1y: 7.8, risk: 6, type: 'Equity ESG Extra', isNew: true, navDate: '2026-06-23' }
];

// Sample SSF data
const SSF_INITIAL_DATA = [
  { id: 's1', code: 'KKP ACTSSF', name: 'เคเคพี แอคทีฟ เอสเอสเอฟ', amc: 'KKP', nav: 12.35, ytd: 5.2, return1y: 8.4, risk: 6, type: 'Equity SSF', isNew: false, navDate: '2026-06-23' },
  { id: 's2', code: 'KFSUPERSSF', name: 'กรุงศรี ซุปเปอร์ เอสเอสเอฟ', amc: 'Krungsri', nav: 11.80, ytd: 4.8, return1y: 7.2, risk: 6, type: 'Equity SSF', isNew: false, navDate: '2026-06-23' }
];

// Sample ETF data
const ETF_INITIAL_DATA = [
  { id: 'et1', code: 'KKP SET50 ETF', name: 'เคเคพี เซ็ท 50 อีทีเอฟ', amc: 'KKP', nav: 8.90, ytd: -1.2, return1y: 3.2, risk: 6, type: 'Index ETF', isNew: false, navDate: '2026-06-23' },
  { id: 'et2', code: 'TDEX', name: 'ไทยเด็กซ์ เซ็ท 50 อีทีเอฟ', amc: 'ONE', nav: 9.10, ytd: -0.9, return1y: 3.8, risk: 6, type: 'Index ETF', isNew: false, navDate: '2026-06-23' }
];

async function initializeData() {
  console.log('Initializing SarnFund backend seed data...');
  
  // Create data directory
  await fs.mkdir(DATA_DIR, { recursive: true });
  console.log('✓ Data directory verified/created');
  
  const timestamp = Date.now();
  const selectedAMCs = ['KKP', 'Krungsri', 'BBL', 'TISCO', 'SCB', 'ONE'];
  
  const filesToCreate = [
    { name: 'rmf.json', data: RMF_INITIAL_DATA },
    { name: 'esg.json', data: ESG_INITIAL_DATA },
    { name: 'esgx.json', data: ESGX_INITIAL_DATA },
    { name: 'ssf.json', data: SSF_INITIAL_DATA },
    { name: 'etf.json', data: ETF_INITIAL_DATA }
  ];

  for (const file of filesToCreate) {
    const wrapper = {
      timestamp,
      selectedAMCs,
      data: file.data
    };
    await fs.writeFile(
      path.join(DATA_DIR, file.name),
      JSON.stringify(wrapper, null, 2)
    );
    console.log(`   ✓ Created ${file.name} with ${file.data.length} items`);
  }
  
  // Create combined data file (all.json)
  const allData = {
    timestamp,
    lastUpdated: new Date(timestamp).toISOString(),
    selectedAMCs,
    data: {
      rmf: RMF_INITIAL_DATA,
      esg: ESG_INITIAL_DATA,
      esgx: ESGX_INITIAL_DATA,
      ssf: SSF_INITIAL_DATA,
      etf: ETF_INITIAL_DATA
    }
  };
  await fs.writeFile(
    path.join(DATA_DIR, 'all.json'),
    JSON.stringify(allData, null, 2)
  );
  console.log('✓ Created all.json snapshot');
  
  console.log('\n✅ Backend data initialized successfully!');
  console.log('The backend server is now seeded and ready to serve mock requests.');
  console.log('Run "npm run scrape" to scrape live SEC endpoints.');
}

initializeData().catch(error => {
  console.error('❌ Failed to initialize data:', error);
  process.exit(1);
});
