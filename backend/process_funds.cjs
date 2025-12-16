const fs = require('fs');

const AMC_MAP = {
    'KKPAM': 'KKP',
    'KSAM': 'Krungsri',
    'BBLAM': 'BBL',
    'TISCOASSET': 'TISCO'
};

const AMCS_TO_INCLUDE = ['KKP', 'Krungsri', 'BBL', 'TISCO'];

function processFunds(filePath, type) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return [];
    }
    const rawData = fs.readFileSync(filePath, 'utf8');
    let json;
    try {
        json = JSON.parse(rawData);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return [];
    }

    // Handle structure differences: rmf-fetch often has { filterFunds: [...] }
    const fundsList = json.filterFunds || json;

    if (!Array.isArray(fundsList)) {
        console.log('Invalid data format in ' + filePath);
        return [];
    }

    return fundsList
        .map(item => {
            const info = item.overviewInfo;
            const perf = item.performanceInfo || {};

            const amcCode = info.amcCode;
            const myAmc = AMC_MAP[amcCode];

            if (!myAmc) return null; // Skip if not in our map

            return {
                id: `fund_${Date.now()}_${info.symbol}`,
                code: info.symbol,
                name: info.nameEn || info.name, // Use English name if available or Thai name
                amc: myAmc,
                nav: perf.navPerUnit,
                ytd: perf.ytdPercentChange || 0,
                return1y: perf.oneYearPercentChange || 0,
                return2y: 0,
                return3y: perf.threeYearPercentChange || 0,
                return5y: perf.fiveYearPercentChange || 0,
                risk: parseInt(info.riskLevel) || 0,
                type: info.aimcType || '',
                isNew: false,
                factsheetUrl: `https://www.settrade.com/th/mutualfund/quote/${info.symbol}/overview`
            };
        })
        .filter(f => f !== null);
}

const rmfFunds = processFunds('backend/data/rmf-fetch.json', 'RMF');
const esgFunds = processFunds('backend/data/thaiesg-fetch.json', 'ESG');

const content = `// RMF Funds Mock Data - Removed as we now fetch from API
export const INITIAL_RMF = ${JSON.stringify(rmfFunds, null, 4)};

// ThaiESG Funds Mock Data - Removed as we now fetch from API
export const INITIAL_ESG = ${JSON.stringify(esgFunds, null, 4)};

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
`;

console.log(content);
