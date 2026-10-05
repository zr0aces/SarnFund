import { getAmcColorMap } from '../config/fundCategories';

export const INITIAL_RMF = [
  { id: 'rmf_1', code: 'KKP GNP RMF-H', name: 'เคเคพี โกลบอล นิว เพอร์สเปกทีฟ RMF', amc: 'KKP', nav: 16.42, ytd: 12.5, return1y: 18.2, return2y: 8.5, return3y: 6.2, return5y: 9.8, risk: 6, type: 'RMF', isNew: false, navDate: '2026-10-02' },
  { id: 'rmf_2', code: 'KKP EQRMF', name: 'เคเคพี หุ้นทุนเพื่อการเลี้ยงชีพ', amc: 'KKP', nav: 42.10, ytd: -2.1, return1y: 4.5, return2y: -1.2, return3y: 2.1, return5y: 1.5, risk: 6, type: 'RMF', isNew: false, navDate: '2026-10-02' },
  { id: 'rmf_3', code: 'KFLTFEQ-RMF', name: 'กรุงศรีหุ้นระยะยาวอิควิตี้ RMF', amc: 'Krungsri', nav: 18.45, ytd: 1.2, return1y: 5.4, return2y: 0.5, return3y: 3.2, return5y: 2.1, risk: 6, type: 'RMF', isNew: false, navDate: '2026-10-02' },
  { id: 'rmf_4', code: 'KFGBRANRMF', name: 'กรุงศรี Global Brand RMF', amc: 'Krungsri', nav: 15.67, ytd: 14.2, return1y: 19.8, return2y: 12.5, return3y: 9.8, return5y: 11.2, risk: 6, type: 'RMF', isNew: false, navDate: '2026-10-02' },
  { id: 'rmf_5', code: 'BERMF', name: 'บัวหลวงตราสารทุนเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 56.78, ytd: 3.5, return1y: 7.2, return2y: 2.1, return3y: 5.4, return5y: 4.2, risk: 6, type: 'RMF', isNew: false, navDate: '2026-10-02' }
];

export const INITIAL_ESG = [
  { id: 'esg_1', code: 'ONE-THAIESG', name: 'ONE EQUITY THAILAND ESG FUND', amc: 'ONE', nav: 11.78, ytd: 17.44, return1y: 24.15, return3y: 1.76, return5y: 0.96, risk: 6, type: 'ESG', isNew: false, navDate: '2026-10-02' },
  { id: 'esg_2', code: 'KKP EQ THAI ESG', name: 'เคเคพี หุ้นไทยเพื่อความยั่งยืน', amc: 'KKP', nav: 10.45, ytd: 4.2, return1y: 6.5, risk: 6, type: 'ESG', isNew: false, navDate: '2026-10-02' },
  { id: 'esg_3', code: 'KFTHAIESG', name: 'กรุงศรีไทยเพื่อความยั่งยืน', amc: 'Krungsri', nav: 9.85, ytd: 3.5, return1y: 5.8, risk: 6, type: 'ESG', isNew: false, navDate: '2026-10-02' },
  { id: 'esg_4', code: 'B-TOP-THAIESG', name: 'บัวหลวงทศพลไทยเพื่อความยั่งยืน', amc: 'BBL', nav: 10.80, ytd: 5.5, return1y: 8.2, risk: 6, type: 'ESG', isNew: false, navDate: '2026-10-02' }
];

export const INITIAL_ESGX = [
  { id: 'esgx_1', code: 'KKP ESGX EXTRA', name: 'เคเคพี ไทย อีเอสจี เอ็กซ์ตร้า', amc: 'KKP', nav: 11.20, ytd: 6.2, return1y: 9.5, risk: 6, type: 'ESGX', isNew: true, navDate: '2026-10-02' },
  { id: 'esgx_2', code: 'SCBTHAEGX', name: 'ไทยพาณิชย์ ไทย อีเอสจี เอ็กซ์ตร้า', amc: 'SCB', nav: 10.50, ytd: 5.1, return1y: 7.8, risk: 6, type: 'ESGX', isNew: true, navDate: '2026-10-02' }
];

export const INITIAL_SSF = [
  { id: 'ssf_1', code: 'KKP ACTSSF', name: 'เคเคพี แอคทีฟ เอสเอสเอฟ', amc: 'KKP', nav: 12.35, ytd: 5.2, return1y: 8.4, return3y: 3.1, return5y: 4.2, risk: 6, type: 'SSF', isNew: false, navDate: '2026-10-02' },
  { id: 'ssf_2', code: 'KFSUPERSSF', name: 'กรุงศรี ซุปเปอร์ เอสเอสเอฟ', amc: 'Krungsri', nav: 11.80, ytd: 4.8, return1y: 7.2, return3y: 2.8, return5y: 3.9, risk: 6, type: 'SSF', isNew: false, navDate: '2026-10-02' },
  { id: 'ssf_3', code: 'B-ACTIVE-SSF', name: 'บัวหลวง แอคทีฟ เอสเอสเอฟ', amc: 'BBL', nav: 13.15, ytd: 6.1, return1y: 9.2, return3y: 3.8, return5y: 5.1, risk: 6, type: 'SSF', isNew: false, navDate: '2026-10-02' }
];

export const INITIAL_ETF = [
  { id: 'etf_1', code: 'TDEX', name: 'ไทยเด็กซ์ เซ็ท 50 อีทีเอฟ', amc: 'ONE', nav: 9.10, ytd: -0.9, return1y: 3.8, return3y: 1.2, return5y: 2.1, risk: 6, type: 'ETF', isNew: false, navDate: '2026-10-02' },
  { id: 'etf_2', code: 'KKP SET50 ETF', name: 'เคเคพี เซ็ท 50 อีทีเอฟ', amc: 'KKP', nav: 8.90, ytd: -1.2, return1y: 3.2, return3y: 0.9, return5y: 1.8, risk: 6, type: 'ETF', isNew: false, navDate: '2026-10-02' }
];

export const INITIAL_SP = [
  { id: 'sp_1', code: 'K-US500X-A(A)', name: 'K US500X Equity Fund (Individual Class A)', amc: 'KAsset', nav: 15.96, ytd: 10.5, return1y: 16.3, return3y: 10.2, return5y: 12.8, risk: 6, type: 'SP', isNew: false, navDate: '2026-10-02' },
  { id: 'sp_2', code: 'B-USPASSIVE', name: 'Bualuang US Passive Equity Fund', amc: 'Bualuang', nav: 14.00, ytd: 12.1, return1y: 21.7, return3y: 11.5, return5y: 13.2, risk: 6, type: 'SP', isNew: false, navDate: '2026-10-02' },
  { id: 'sp_3', code: 'SCBS&P500', name: 'SCB S&P 500 Index Fund (Dividend Class)', amc: 'SCBAM', nav: 17.85, ytd: 11.8, return1y: 20.4, return3y: 10.9, return5y: 12.5, risk: 6, type: 'SP', isNew: false, navDate: '2026-10-02' }
];

export const AMC_COLORS_RMF = getAmcColorMap('rmf');
export const AMC_COLORS_ESG = getAmcColorMap('esg');
export const AMC_COLORS_ESGX = getAmcColorMap('esgx');
export const AMC_COLORS_SSF = getAmcColorMap('ssf');
export const AMC_COLORS_ETF = getAmcColorMap('etf');
export const AMC_COLORS_SP = getAmcColorMap('sp');
