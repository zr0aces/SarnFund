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
  { id: 'k1', code: 'KKP GNP RMF-H', name: 'เคเคพี โกลบอล นิว เพอร์สเปกทีฟ RMF', amc: 'KKP', nav: 16.42, ytd: 12.5, return1y: 18.2, return2y: 8.5, return3y: 6.2, return5y: 9.8, risk: 6, type: 'Global Equity', isNew: false },
  { id: 'k2', code: 'KKP EQRMF', name: 'เคเคพี หุ้นทุนเพื่อการเลี้ยงชีพ', amc: 'KKP', nav: 42.10, ytd: -2.1, return1y: 4.5, return2y: -1.2, return3y: 2.1, return5y: 1.5, risk: 6, type: 'Thai Equity', isNew: false },
  { id: 'ks1', code: 'KFLTFEQ-RMF', name: 'กรุงศรีหุ้นระยะยาวอิควิตี้ RMF', amc: 'Krungsri', nav: 18.45, ytd: 1.2, return1y: 5.4, return2y: 0.5, return3y: 3.2, return5y: 2.1, risk: 6, type: 'Thai Equity', isNew: false },
  { id: 'ks2', code: 'KFGBRANRMF', name: 'กรุงศรี Global Brand RMF', amc: 'Krungsri', nav: 15.67, ytd: 14.2, return1y: 19.8, return2y: 12.5, return3y: 9.8, return5y: 11.2, risk: 6, type: 'Global Equity', isNew: false },
  { id: 'b1', code: 'BERMF', name: 'บัวหลวงตราสารทุนเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 56.78, ytd: 3.5, return1y: 7.2, return2y: 2.1, return3y: 5.4, return5y: 4.2, risk: 6, type: 'Thai Equity', isNew: false },
  { id: 'b2', code: 'B-INNOTECH RMF', name: 'บัวหลวงโกลบอลอินโนเวชั่น RMF', amc: 'BBL', nav: 24.12, ytd: 22.1, return1y: 28.5, return2y: 25.2, return3y: 14.8, return5y: 17.5, risk: 7, type: 'Technology', isNew: false },
  { id: 't1', code: 'TISCOUS-RMF', name: 'ทิสโก้ ยูเอส อิควิตี้ เพื่อการเลี้ยงชีพ', amc: 'TISCO', nav: 28.45, ytd: 19.2, return1y: 26.5, return2y: 21.4, return3y: 16.8, return5y: 15.5, risk: 6, type: 'US Equity', isNew: false },
  { id: 't2', code: 'TISCOTECH-RMF', name: 'ทิสโก้ เทคโนโลยี อิควิตี้ เพื่อการเลี้ยงชีพ', amc: 'TISCO', nav: 18.20, ytd: 24.8, return1y: 31.5, return2y: 26.2, return3y: 14.5, return5y: 18.2, risk: 7, type: 'Technology', isNew: false },
];

// Sample ThaiESG data
const TESG_INITIAL_DATA = [
  { id: 'k1', code: 'KKP EQ THAI ESG', name: 'เคเคพี หุ้นไทยเพื่อความยั่งยืน', amc: 'KKP', nav: 10.45, ytd: 4.2, return1y: 6.5, risk: 6, type: 'Equity ESG', isNew: false },
  { id: 'k2', code: 'KKP GB THAI ESG', name: 'เคเคพี พันธบัตรรัฐบาลไทยเพื่อความยั่งยืน', amc: 'KKP', nav: 10.15, ytd: 2.8, return1y: 3.2, risk: 3, type: 'Bond ESG', isNew: false },
  { id: 'ks1', code: 'KFTHAIESG', name: 'กรุงศรีไทยเพื่อความยั่งยืน (ชนิดสะสมมูลค่า)', amc: 'Krungsri', nav: 9.85, ytd: 3.5, return1y: 5.8, risk: 6, type: 'Equity ESG', isNew: false },
  { id: 'b1', code: 'B-TOP-THAIESG', name: 'บัวหลวงทศพลไทยเพื่อความยั่งยืน', amc: 'BBL', nav: 10.80, ytd: 5.5, return1y: 8.2, risk: 6, type: 'Equity ESG', isNew: false },
  { id: 't1', code: 'TISCOThaiESG-A', name: 'ทิสโก้ หุ้นไทยเพื่อความยั่งยืน ชนิดสะสมมูลค่า', amc: 'TISCO', nav: 10.60, ytd: 4.5, return1y: 7.2, risk: 6, type: 'Equity ESG', isNew: false },
];

async function initializeData() {
  console.log('Initializing backend data...');
  
  // Create data directory
  await fs.mkdir(DATA_DIR, { recursive: true });
  console.log('✓ Data directory created');
  
  const timestamp = Date.now();
  const selectedAMCs = ['KKP', 'Krungsri', 'BBL', 'TISCO'];
  
  // Create RMF data file
  const rmfData = {
    timestamp,
    selectedAMCs,
    data: RMF_INITIAL_DATA
  };
  await fs.writeFile(
    path.join(DATA_DIR, 'rmf.json'),
    JSON.stringify(rmfData, null, 2)
  );
  console.log(`✓ Created rmf.json with ${RMF_INITIAL_DATA.length} funds`);
  
  // Create TESG data file
  const tesgData = {
    timestamp,
    selectedAMCs,
    data: TESG_INITIAL_DATA
  };
  await fs.writeFile(
    path.join(DATA_DIR, 'tesg.json'),
    JSON.stringify(tesgData, null, 2)
  );
  console.log(`✓ Created tesg.json with ${TESG_INITIAL_DATA.length} funds`);
  
  // Create combined data file
  const allData = {
    timestamp,
    lastUpdated: new Date(timestamp).toISOString(),
    selectedAMCs,
    data: {
      rmf: RMF_INITIAL_DATA,
      tesg: TESG_INITIAL_DATA
    }
  };
  await fs.writeFile(
    path.join(DATA_DIR, 'all.json'),
    JSON.stringify(allData, null, 2)
  );
  console.log('✓ Created all.json');
  
  console.log('\n✅ Backend data initialized successfully!');
  console.log('The backend server will now have initial data to serve.');
  console.log('Run "npm run scrape" to fetch fresh data from settrade.com');
}

initializeData().catch(error => {
  console.error('❌ Failed to initialize data:', error);
  process.exit(1);
});
