const fs = require('fs');
const path = require('path');

const AMC_MAP = {
    'KKPAM': 'KKP',
    'KSAM': 'Krungsri',
    'BBLAM': 'BBL',
    'TISCOASSET': 'TISCO'
};

const AMCS_TO_INCLUDE = ['KKP', 'Krungsri', 'BBL', 'TISCO'];

function processFunds(filePath) {
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

            if (!myAmc) return null;

            return {
                id: `fund_${Date.now()}_${info.symbol}`,
                code: info.symbol,
                name: info.nameEn || info.name,
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

function updateBackendFile(fetchFile, targetFile) {
    const funds = processFunds(fetchFile);

    const output = {
        timestamp: Date.now(),
        selectedAMCs: AMCS_TO_INCLUDE,
        data: funds
    };

    fs.writeFileSync(targetFile, JSON.stringify(output, null, 2));
    console.log(`Updated ${targetFile} with ${funds.length} funds.`);
}

updateBackendFile('backend/data/rmf-fetched.json', 'backend/data/rmf.json');
updateBackendFile('backend/data/tesg-fetched.json', 'backend/data/tesg.json');
