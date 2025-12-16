// RMF Funds Mock Data - Extracted from RmfDashboard.html
export const INITIAL_RMF = [
    // ================= KKP (เกียรตินาคินภัทร) =================
    // Global & Foreign Equity
    { id: 'k1', code: 'KKP GNP RMF-H', name: 'เคเคพี โกลบอล นิว เพอร์สเปกทีฟ RMF', amc: 'KKP', nav: 16.42, ytd: 12.5, return1y: 18.2, return2y: 8.5, return3y: 6.2, return5y: 9.8, risk: 6, type: 'Global Equity', isNew: false },
    { id: 'k6', code: 'KKP NDQ100-RMF', name: 'เคเคพี Nasdaq 100 RMF', amc: 'KKP', nav: 12.50, ytd: 20.1, return1y: 28.4, return2y: 22.1, return3y: 18.5, return5y: 0, risk: 6, type: 'US Equity', isNew: false },
    { id: 'k3', code: 'KKP TECH-RMF', name: 'เคเคพี เทคโนโลยี เพื่อการเลี้ยงชีพ', amc: 'KKP', nav: 11.23, ytd: 25.4, return1y: 32.1, return2y: 28.4, return3y: 15.6, return5y: 18.9, risk: 7, type: 'Technology', isNew: false },
    { id: 'k5', code: 'KKP SEMICON-RMF', name: 'เคเคพี เซมิคอนดักเตอร์ RMF', amc: 'KKP', nav: 10.15, ytd: 15.2, return1y: 0, return2y: 0, return3y: 0, return5y: 0, risk: 7, type: 'Technology', isNew: true },
    { id: 'k7', code: 'KKP PGE-RMF', name: 'เคเคพี แพสซีฟ โกลบอล อิควิตี้ RMF', amc: 'KKP', nav: 14.20, ytd: 10.5, return1y: 15.8, return2y: 9.2, return3y: 7.5, return5y: 8.9, risk: 6, type: 'Global Equity', isNew: false },
    // Thai Equity
    { id: 'k2', code: 'KKP EQRMF', name: 'เคเคพี หุ้นทุนเพื่อการเลี้ยงชีพ', amc: 'KKP', nav: 42.10, ytd: -2.1, return1y: 4.5, return2y: -1.2, return3y: 2.1, return5y: 1.5, risk: 6, type: 'Thai Equity', isNew: false },
    { id: 'k8', code: 'KKP SET50 RMF', name: 'เคเคพี SET50 RMF', amc: 'KKP', nav: 18.50, ytd: -1.5, return1y: 3.2, return2y: -2.5, return3y: 1.8, return5y: 1.2, risk: 6, type: 'Thai Equity', isNew: false },
    // Mixed & Fixed Income & Alternative
    { id: 'k4', code: 'KKP SG-AA RMF', name: 'เคเคพี สตราทิจิค แอสเซ็ท อโลเคชั่น RMF', amc: 'KKP', nav: 13.88, ytd: 4.5, return1y: 6.8, return2y: 3.2, return3y: 4.1, return5y: 3.5, risk: 5, type: 'Mixed', isNew: false },
    { id: 'k9', code: 'KKP INRMF', name: 'เคเคพี ตราสารหนี้เพื่อการเลี้ยงชีพ', amc: 'KKP', nav: 15.30, ytd: 2.2, return1y: 2.5, return2y: 2.1, return3y: 1.9, return5y: 1.8, risk: 4, type: 'Fixed Income', isNew: false },
    { id: 'k10', code: 'KKP ACT FIXED RMF', name: 'เคเคพี แอคทีฟ ฟิกซ์ อินคัม RMF', amc: 'KKP', nav: 11.45, ytd: 2.8, return1y: 3.1, return2y: 2.4, return3y: 2.0, return5y: 1.9, risk: 4, type: 'Fixed Income', isNew: false },
    { id: 'k11', code: 'KKP PROP-RMF', name: 'เคเคพี อสังหาริมทรัพย์เพื่อการเลี้ยงชีพ', amc: 'KKP', nav: 9.80, ytd: -5.2, return1y: -3.5, return2y: -8.5, return3y: -5.2, return5y: -2.1, risk: 8, type: 'Property/REITs', isNew: false },
    { id: 'k12', code: 'KKP GOLD-RMF', name: 'เคเคพี โกลด์ เพื่อการเลี้ยงชีพ', amc: 'KKP', nav: 18.20, ytd: 11.5, return1y: 14.2, return2y: 9.5, return3y: 7.8, return5y: 8.5, risk: 8, type: 'Gold', isNew: false },

    // ================= Krungsri (กรุงศรี) =================
    // Global & Foreign Equity
    { id: 'ks2', code: 'KFGBRANRMF', name: 'กรุงศรี Global Brand RMF', amc: 'Krungsri', nav: 15.67, ytd: 14.2, return1y: 19.8, return2y: 12.5, return3y: 9.8, return5y: 11.2, risk: 6, type: 'Global Equity', isNew: false },
    { id: 'ks7', code: 'KFUSRMF', name: 'กรุงศรี ยูเอส อิควิตี้ RMF', amc: 'Krungsri', nav: 22.15, ytd: 18.5, return1y: 24.2, return2y: 19.5, return3y: 12.5, return5y: 14.2, risk: 6, type: 'US Equity', isNew: false },
    { id: 'ks3', code: 'KFACHINRMF', name: 'กรุงศรี All China Equity RMF', amc: 'Krungsri', nav: 8.90, ytd: -5.4, return1y: -8.2, return2y: -15.4, return3y: -10.2, return5y: -2.5, risk: 6, type: 'China Equity', isNew: false },
    { id: 'ks4', code: 'KFVIETRMF', name: 'กรุงศรีเวียดนามอิควิตี้ RMF', amc: 'Krungsri', nav: 10.55, ytd: 18.5, return1y: 22.4, return2y: 15.6, return3y: 12.8, return5y: 14.5, risk: 7, type: 'Vietnam Equity', isNew: false },
    { id: 'ks5', code: 'KF-INDIA RMF', name: 'กรุงศรี อินเดีย อิควิตี้ RMF', amc: 'Krungsri', nav: 10.88, ytd: 8.5, return1y: 0, return2y: 0, return3y: 0, return5y: 0, risk: 7, type: 'India Equity', isNew: true },
    { id: 'ks10', code: 'KFHCARERMF', name: 'กรุงศรี โกลบอล เฮลธ์แคร์ RMF', amc: 'Krungsri', nav: 14.60, ytd: 6.5, return1y: 9.2, return2y: 4.5, return3y: 5.8, return5y: 7.2, risk: 7, type: 'Health Care', isNew: false },
    { id: 'ks11', code: 'KFEURORMF', name: 'กรุงศรี ยุโรป อิควิตี้ RMF', amc: 'Krungsri', nav: 11.20, ytd: 7.8, return1y: 11.5, return2y: 5.5, return3y: 4.2, return5y: 3.8, risk: 6, type: 'Europe Equity', isNew: false },
    { id: 'ks12', code: 'KFJPIND-RMF', name: 'กรุงศรี เจแปน RMF', amc: 'Krungsri', nav: 12.50, ytd: 12.5, return1y: 16.5, return2y: 8.5, return3y: 3.5, return5y: 2.5, risk: 6, type: 'Japan Equity', isNew: false },
    // Thai Equity
    { id: 'ks1', code: 'KFLTFEQ-RMF', name: 'กรุงศรีหุ้นระยะยาวอิควิตี้ RMF', amc: 'Krungsri', nav: 18.45, ytd: 1.2, return1y: 5.4, return2y: 0.5, return3y: 3.2, return5y: 2.1, risk: 6, type: 'Thai Equity', isNew: false },
    { id: 'ks8', code: 'KFEQRMF', name: 'กรุงศรีตราสารทุนเพื่อการเลี้ยงชีพ', amc: 'Krungsri', nav: 45.20, ytd: 2.1, return1y: 4.8, return2y: 1.5, return3y: 3.5, return5y: 2.8, risk: 6, type: 'Thai Equity', isNew: false },
    { id: 'ks9', code: 'KFENS50RMF', name: 'กรุงศรี SET50 RMF', amc: 'Krungsri', nav: 12.30, ytd: -0.8, return1y: 3.5, return2y: -1.8, return3y: 2.0, return5y: 1.5, risk: 6, type: 'Thai Equity', isNew: false },
    // Property & Money Market
    { id: 'ks13', code: 'KFPROPRMF', name: 'กรุงศรี พร็อพเพอร์ตี้ RMF', amc: 'Krungsri', nav: 13.10, ytd: -3.5, return1y: -1.2, return2y: -5.5, return3y: -3.2, return5y: -0.5, risk: 8, type: 'Property/REITs', isNew: false },
    { id: 'ks6', code: 'KFCASHRMF', name: 'กรุงศรีแคชแมเนจเมนท์ RMF', amc: 'Krungsri', nav: 12.10, ytd: 1.8, return1y: 2.1, return2y: 1.9, return3y: 1.5, return5y: 1.2, risk: 1, type: 'Money Market', isNew: false },

    // ================= BBL (บัวหลวง) =================
    // Global & Foreign Equity
    { id: 'b2', code: 'B-INNOTECH RMF', name: 'บัวหลวงโกลบอลอินโนเวชั่น RMF', amc: 'BBL', nav: 24.12, ytd: 22.1, return1y: 28.5, return2y: 25.2, return3y: 14.8, return5y: 17.5, risk: 7, type: 'Technology', isNew: false },
    { id: 'b3', code: 'B-ASIA RMF', name: 'บัวหลวงเอเชียเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 12.34, ytd: 6.7, return1y: 9.1, return2y: 4.5, return3y: -1.2, return5y: 2.8, risk: 6, type: 'Asia Equity', isNew: false },
    { id: 'b5', code: 'B-USALPHA RMF', name: 'บัวหลวงยูเอสอัลฟ่า RMF', amc: 'BBL', nav: 14.50, ytd: 18.2, return1y: 24.5, return2y: 20.1, return3y: 0, return5y: 0, risk: 6, type: 'US Equity', isNew: false },
    { id: 'b6', code: 'B-EV RMF', name: 'บัวหลวงโกลบอล อีวี RMF', amc: 'BBL', nav: 9.85, ytd: 5.4, return1y: 0, return2y: 0, return3y: 0, return5y: 0, risk: 7, type: 'Technology', isNew: true },
    { id: 'b7', code: 'B-GLOBALRMF', name: 'บัวหลวงโกลบอลเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 16.80, ytd: 11.5, return1y: 15.2, return2y: 10.5, return3y: 8.4, return5y: 9.5, risk: 6, type: 'Global Equity', isNew: false },
    { id: 'b8', code: 'B-NIPPONRMF', name: 'บัวหลวงนิปปอนเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 13.50, ytd: 14.5, return1y: 18.2, return2y: 12.5, return3y: 5.5, return5y: 0, risk: 6, type: 'Japan Equity', isNew: false },
    { id: 'b11', code: 'B-CHINA RMF', name: 'บัวหลวงหุ้นจีนเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 8.50, ytd: -6.5, return1y: -9.5, return2y: -16.5, return3y: -12.5, return5y: -4.5, risk: 6, type: 'China Equity', isNew: false },
    // Thai Equity
    { id: 'b1', code: 'BERMF', name: 'บัวหลวงตราสารทุนเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 56.78, ytd: 3.5, return1y: 7.2, return2y: 2.1, return3y: 5.4, return5y: 4.2, risk: 6, type: 'Thai Equity', isNew: false },
    { id: 'b9', code: 'B-TOPTENRMF', name: 'บัวหลวงทศพลเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 48.20, ytd: 4.2, return1y: 8.5, return2y: 3.5, return3y: 6.2, return5y: 4.8, risk: 6, type: 'Thai Equity', isNew: false },
    // Alternative & Mixed & Fixed Income
    { id: 'b4', code: 'B-FLEXRMF', name: 'บัวหลวงเฟล็กซิเบิลเพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 19.88, ytd: 2.1, return1y: 4.8, return2y: 1.5, return3y: 3.2, return5y: 3.0, risk: 5, type: 'Mixed', isNew: false },
    { id: 'b10', code: 'B-GOLDRMF', name: 'บัวหลวงโกลด์เพื่อการเลี้ยงชีพ', amc: 'BBL', nav: 21.50, ytd: 12.5, return1y: 15.5, return2y: 10.2, return3y: 8.5, return5y: 9.2, risk: 8, type: 'Gold', isNew: false },
    { id: 'b12', code: 'B-TREASURY RMF', name: 'บัวหลวงตราสารหนี้ภาครัฐ RMF', amc: 'BBL', nav: 10.50, ytd: 1.9, return1y: 2.2, return2y: 1.8, return3y: 1.6, return5y: 1.4, risk: 4, type: 'Fixed Income', isNew: false },

    // ================= TISCO (ทิสโก้) =================
    // Global & Foreign Equity
    { id: 't1', code: 'TISCOUS-RMF', name: 'ทิสโก้ ยูเอส อิควิตี้ เพื่อการเลี้ยงชีพ', amc: 'TISCO', nav: 28.45, ytd: 19.2, return1y: 26.5, return2y: 21.4, return3y: 16.8, return5y: 15.5, risk: 6, type: 'US Equity', isNew: false },
    { id: 't2', code: 'TISCOTECH-RMF', name: 'ทิสโก้ เทคโนโลยี อิควิตี้ เพื่อการเลี้ยงชีพ', amc: 'TISCO', nav: 18.20, ytd: 24.8, return1y: 31.5, return2y: 26.2, return3y: 14.5, return5y: 18.2, risk: 7, type: 'Technology', isNew: false },
    { id: 't3', code: 'TISCOCHINA-RMF', name: 'ทิสโก้ ไชน่า อิควิตี้ เพื่อการเลี้ยงชีพ', amc: 'TISCO', nav: 7.80, ytd: -4.5, return1y: -7.2, return2y: -14.2, return3y: -9.5, return5y: -3.2, risk: 6, type: 'China Equity', isNew: false },
    { id: 't4', code: 'TISCOGY-RMF', name: 'ทิสโก้ เยอรมัน อิควิตี้ เพื่อการเลี้ยงชีพ', amc: 'TISCO', nav: 11.50, ytd: 8.2, return1y: 12.5, return2y: 6.5, return3y: 5.2, return5y: 4.8, risk: 6, type: 'Europe Equity', isNew: false },
    { id: 't8', code: 'TISCOJP-RMF', name: 'ทิสโก้ เจแปน อิควิตี้ เพื่อการเลี้ยงชีพ', amc: 'TISCO', nav: 13.20, ytd: 13.5, return1y: 17.2, return2y: 10.5, return3y: 4.5, return5y: 3.2, risk: 6, type: 'Japan Equity', isNew: false },
    { id: 't9', code: 'TISCOIN-RMF', name: 'ทิสโก้ อินเดีย อิควิตี้ เพื่อการเลี้ยงชีพ', amc: 'TISCO', nav: 11.80, ytd: 9.5, return1y: 0, return2y: 0, return3y: 0, return5y: 0, risk: 7, type: 'India Equity', isNew: true },
    // Thai Equity
    { id: 't5', code: 'TISCOHD-RMF', name: 'ทิสโก้ ไฮ ดิวิเดนด์ หุ้นทุนเพื่อการเลี้ยงชีพ', amc: 'TISCO', nav: 14.20, ytd: 5.2, return1y: 9.5, return2y: 4.8, return3y: 6.5, return5y: 5.2, risk: 6, type: 'Thai Equity', isNew: false },
    { id: 't6', code: 'TISCOMS-RMF', name: 'ทิสโก้ Mid/Small Cap อิควิตี้ RMF', amc: 'TISCO', nav: 16.80, ytd: 6.5, return1y: 10.2, return2y: 5.5, return3y: 8.2, return5y: 7.5, risk: 6, type: 'Thai Equity', isNew: false },
    { id: 't10', code: 'TISCOESG-RMF', name: 'ทิสโก้ หุ้นไทยเพื่อความยั่งยืน RMF', amc: 'TISCO', nav: 10.20, ytd: 3.5, return1y: 5.2, return2y: 0, return3y: 0, return5y: 0, risk: 6, type: 'Thai Equity', isNew: true },
    // New Fund
    { id: 't7', code: 'TISCOCLOUD-RMF', name: 'ทิสโก้ Cloud Computing RMF', amc: 'TISCO', nav: 10.05, ytd: 12.5, return1y: 0, return2y: 0, return3y: 0, return5y: 0, risk: 7, type: 'Technology', isNew: true },
];

// ThaiESG Funds Mock Data - Extracted from ThaiEsgDashboard.html
export const INITIAL_ESG = [
    // ================= KKP (เกียรตินาคินภัทร) =================
    { id: 'k1', code: 'KKP EQ THAI ESG', name: 'เคเคพี หุ้นไทยเพื่อความยั่งยืน', amc: 'KKP', nav: 10.45, ytd: 4.2, return1y: 6.5, risk: 6, type: 'Equity ESG', isNew: false },
    { id: 'k2', code: 'KKP GB THAI ESG', name: 'เคเคพี พันธบัตรรัฐบาลไทยเพื่อความยั่งยืน', amc: 'KKP', nav: 10.15, ytd: 2.8, return1y: 3.2, risk: 3, type: 'Bond ESG', isNew: false },

    // ================= Krungsri (กรุงศรี) =================
    { id: 'ks1', code: 'KFTHAIESG', name: 'กรุงศรีไทยเพื่อความยั่งยืน (ชนิดสะสมมูลค่า)', amc: 'Krungsri', nav: 9.85, ytd: 3.5, return1y: 5.8, risk: 6, type: 'Equity ESG', isNew: false },
    { id: 'ks2', code: 'KFTHAIESGD', name: 'กรุงศรีไทยเพื่อความยั่งยืน (ชนิดจ่ายเงินปันผล)', amc: 'Krungsri', nav: 9.72, ytd: 3.2, return1y: 5.5, risk: 6, type: 'Equity ESG', isNew: false },

    // ================= BBL (บัวหลวง) =================
    { id: 'b1', code: 'B-TOP-THAIESG', name: 'บัวหลวงทศพลไทยเพื่อความยั่งยืน', amc: 'BBL', nav: 10.80, ytd: 5.5, return1y: 8.2, risk: 6, type: 'Equity ESG', isNew: false },
    { id: 'b2', code: 'B-DYNAMIC-THAIESG', name: 'บัวหลวงไดนามิกไทยเพื่อความยั่งยืน', amc: 'BBL', nav: 10.25, ytd: 4.8, return1y: 7.5, risk: 6, type: 'Equity ESG', isNew: true },
    { id: 'b3', code: 'B-SI-THAIESG', name: 'บัวหลวงยั่งยืน (Sustainable Investment)', amc: 'BBL', nav: 10.10, ytd: 4.1, return1y: 6.2, risk: 6, type: 'Equity ESG', isNew: true },

    // ================= TISCO (ทิสโก้) =================
    { id: 't1', code: 'TISCOThaiESG-A', name: 'ทิสโก้ หุ้นไทยเพื่อความยั่งยืน ชนิดสะสมมูลค่า', amc: 'TISCO', nav: 10.60, ytd: 4.5, return1y: 7.2, risk: 6, type: 'Equity ESG', isNew: false },
    { id: 't2', code: 'TISCOThaiESG-D', name: 'ทิสโก้ หุ้นไทยเพื่อความยั่งยืน ชนิดจ่ายเงินปันผล', amc: 'TISCO', nav: 10.40, ytd: 4.2, return1y: 6.8, risk: 6, type: 'Equity ESG', isNew: false },
];

export const AMC_COLORS_RMF = {
    KKP: '#6F42C1',
    Krungsri: '#F59E0B',
    BBL: '#1E3A8A',
    TISCO: '#CC0000',
    All: '#4F46E5'
};

export const AMC_COLORS_ESG = {
    KKP: '#6F42C1',
    Krungsri: '#F59E0B',
    BBL: '#1E3A8A',
    TISCO: '#CC0000',
    All: '#059669'
};
