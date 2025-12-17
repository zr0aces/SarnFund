export const AMC_COLORS = {
    'SCB': '#4E2583',   // SCB Asset Management
    'K': '#00A950',     // Kasikorn Asset Management
    'B': '#1E4598',     // Bualuang Fund
    'KT': '#00A5E3',    // Krungthai Asset Management
    'TISCO': '#EC1D25', // Tisco Asset Management
    'KKP': '#6F42C1',   // Kiatnakin Phatra Asset Management
    'LH': '#6D6E71',    // Land and Houses Fund
    'UOB': '#0B2341',   // UOB Asset Management
    'PRINCIPAL': '#0054A4', // Principal Asset Management
    'ABERDEEN': '#D1282E', // Aberdeen Standard
    'ONE': '#F47920',   // One Asset Management
    'OTHER': '#94a3b8'  // Fallback
};

export const FUND_TYPES = ['RMF', 'SSF', 'ThaiESG'];

export const TIMEFRAMES = [
    { value: 'return_ytd', label: 'Year To Date (YTD)' },
    { value: 'return_3m', label: '3 Months' },
    { value: 'return_6m', label: '6 Months' },
    { value: 'return_1y', label: '1 Year' },
    { value: 'return_3y', label: '3 Years' },
    { value: 'return_5y', label: '5 Years' },
];

export const API_URL = '/api/funds/all';
