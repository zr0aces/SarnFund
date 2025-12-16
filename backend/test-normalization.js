// Test script to verify AMC normalization
import { normalizeAMC, SELECTED_AMCS } from './scraper.js';

console.log('Testing AMC Normalization...\n');
console.log('Selected AMCs:', SELECTED_AMCS);
console.log('\n--- Test Cases ---\n');

const testCases = [
  // KKP tests
  { input: 'KKP GNP RMF-H', expected: 'KKP' },
  { input: 'เกียรตินาคินภัทร', expected: 'KKP' },
  { input: 'KKP', expected: 'KKP' },
  
  // Krungsri tests
  { input: 'KFGBRANRMF', expected: 'Krungsri' },
  { input: 'กรุงศรี Global Brand', expected: 'Krungsri' },
  { input: 'Krungsri', expected: 'Krungsri' },
  { input: 'KFUSRMF', expected: 'Krungsri' },
  
  // BBL tests
  { input: 'B-INNOTECH RMF', expected: 'BBL' },
  { input: 'บัวหลวง', expected: 'BBL' },
  { input: 'BBL', expected: 'BBL' },
  { input: 'BERMF', expected: 'BBL' },
  { input: 'B-TOP-THAIESG', expected: 'BBL' },
  
  // TISCO tests
  { input: 'TISCOUS-RMF', expected: 'TISCO' },
  { input: 'ทิสโก้', expected: 'TISCO' },
  { input: 'TISCO', expected: 'TISCO' },
  { input: 'TISCOThaiESG-A', expected: 'TISCO' },
  
  // Non-matching tests
  { input: 'SCB', expected: null },
  { input: 'KBANK', expected: null },
  { input: 'Random Fund', expected: null }
];

let passed = 0;
let failed = 0;

testCases.forEach(({ input, expected }) => {
  const result = normalizeAMC(input);
  const match = result === expected;
  
  if (match) {
    console.log(`✓ "${input}" → "${result}"`);
    passed++;
  } else {
    console.log(`✗ "${input}" → "${result}" (expected: "${expected}")`);
    failed++;
  }
});

console.log(`\n--- Results ---`);
console.log(`Passed: ${passed}/${testCases.length}`);
console.log(`Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed!');
  process.exit(1);
}
