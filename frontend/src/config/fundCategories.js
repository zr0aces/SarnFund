import { BarChart3, Leaf, Sprout, Wallet, TrendingUp } from 'lucide-react';

export const MASTER_AMC_COLORS = {
    KKP: '#8B5CF6',
    Krungsri: '#F59E0B',
    BBL: '#2563EB',
    TISCO: '#EF4444',
    SCB: '#7C3AED',
    KAsset: '#10B981',
    KTAM: '#06B6D4',
    ONE: '#FBBF24',
    UOB: '#1E40AF',
    Principal: '#0284C7',
    Eastspring: '#F43F5E',
    'Asset Plus': '#FB923C',
    DAOL: '#EC4899',
    KWI: '#E11D48',
    'LH Fund': '#94A3B8',
    MFC: '#FA5252',
    TALIS: '#D97706',
    XSpring: '#64748B'
};

export const FUND_CATEGORIES = {
    rmf: {
        id: 'rmf',
        type: 'rmf',
        path: '/funds/rmf',
        label: 'RMF',
        title: 'RMF Analytics Telemetry',
        badge: 'RETIREMENT ALLOWANCE',
        icon: BarChart3,
        accentColor: '#F97316',
        allColor: '#F97316',
        theme: {
            text: 'text-orange-400',
            bg: 'bg-orange-950/30',
            border: 'border-orange-500/20',
            badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            glow: 'hover:border-orange-500/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]',
            tabActive: 'bg-orange-500/20 text-orange-300 border-orange-500/30 shadow-sm'
        },
        taxCap: 'Max 30% of taxable income, capped at 500,000 THB (combined with PVD/GPF/Pension)',
        lockup: 'Hold until age 55 AND at least 5 full years from purchase date',
        description: 'Retirement Mutual Funds. Tax benefits with long-term compound growth for retirement security.',
        keyRules: [
            'Must invest at least once every 2 years',
            'No minimum yearly purchase amount required',
            'All gains & dividends automatically reinvested tax-free'
        ],
        sparklineD: 'M0,20 Q15,8 30,16 T60,6 T90,12 T100,2'
    },
    esg: {
        id: 'esg',
        type: 'esg',
        path: '/funds/thaiesg',
        label: 'ThaiESG',
        title: 'ThaiESG Sustainability Console',
        badge: 'SUSTAINABILITY ALLOWANCE',
        icon: Leaf,
        accentColor: '#00F5A0',
        allColor: '#00F5A0',
        theme: {
            text: 'text-emerald-400',
            bg: 'bg-emerald-950/30',
            border: 'border-emerald-500/20',
            badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            glow: 'hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(0,245,160,0.15)]',
            tabActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-sm'
        },
        taxCap: 'Max 30% of taxable income, capped at 300,000 THB (Separate limit from 500k retirement cap)',
        lockup: 'Hold for 5 full years (date-to-date from exact purchase date)',
        description: 'Sustainable Equity & Bond Portfolios focusing on SET ESG ratings and carbon reduction in Thailand.',
        keyRules: [
            'Separate 300,000 THB deduction cap for tax year 2569 (2026)',
            'No annual continuous purchase required',
            'Focus on SET ESG ratings (AAA, AA, A) and greenhouse gas reduction'
        ],
        sparklineD: 'M0,24 Q12,18 24,26 T48,16 T72,20 T86,10 T100,4'
    },
    esgx: {
        id: 'esgx',
        type: 'esgx',
        path: '/funds/thaiesgx',
        label: 'ThaiESGX',
        title: 'ThaiESGX Extra Tracker',
        badge: 'ESG EXTRA ALLOWANCE',
        icon: Sprout,
        accentColor: '#38BDF8',
        allColor: '#38BDF8',
        theme: {
            text: 'text-cyan-400',
            bg: 'bg-cyan-950/30',
            border: 'border-cyan-500/20',
            badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            glow: 'hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)]',
            tabActive: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-sm'
        },
        taxCap: 'Shares the 300,000 THB ThaiESG separate tax deduction allowance',
        lockup: 'Hold for 5 full years (date-to-date)',
        description: 'Thai ESG Extra tier tracker focusing on high-impact climate transition and green bond portfolios.',
        keyRules: [
            'Dedicated tier for focused ESG transition impact',
            'High-impact green bond options available',
            'Counts toward the 300k ThaiESG total cap'
        ],
        sparklineD: 'M0,25 Q20,22 40,12 T80,8 T100,3'
    },
    ssf: {
        id: 'ssf',
        type: 'ssf',
        path: '/funds/ssf',
        label: 'SSF',
        title: 'SSF Portfolio Telemetry',
        badge: 'MEDIUM-TERM SAVINGS',
        icon: Wallet,
        accentColor: '#A855F7',
        allColor: '#A855F7',
        theme: {
            text: 'text-purple-400',
            bg: 'bg-purple-950/30',
            border: 'border-purple-500/20',
            badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            glow: 'hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
            tabActive: 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-sm'
        },
        taxCap: 'Max 30% of income, capped at 200,000 THB (part of the 500k retirement cap)',
        lockup: 'Must hold for 10 full years (date-to-date from purchase date)',
        description: 'Super Savings Funds. Flexible mutual funds created for 10-year holding periods.',
        keyRules: [
            'New purchases discontinued starting 2025',
            'Existing holdings must fulfill the full 10-year lockup',
            'Tax-free transfers between SSF funds permitted'
        ],
        sparklineD: 'M0,28 L15,22 L30,25 L45,16 L60,19 L75,9 L90,14 L100,4'
    },
    etf: {
        id: 'etf',
        type: 'etf',
        path: '/funds/etf',
        label: 'ETF',
        title: 'ETF Market Telemetry',
        badge: 'EXCHANGE TRADED',
        icon: TrendingUp,
        accentColor: '#FBBF24',
        allColor: '#FBBF24',
        theme: {
            text: 'text-amber-400',
            bg: 'bg-amber-950/30',
            border: 'border-amber-500/20',
            badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            glow: 'hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]',
            tabActive: 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-sm'
        },
        taxCap: 'No tax deduction benefits (traded as equity securities on SET)',
        lockup: 'No holding lockup (Liquid real-time intraday trading)',
        description: 'Exchange Traded Funds. Real-time index and sector tracking on the Stock Exchange of Thailand.',
        keyRules: [
            'Traded live during stock exchange trading hours',
            'Lower management fee ratio compared to standard mutual funds',
            'Dividends paid depending on fund payout policy'
        ],
        sparklineD: 'M0,15 L12,24 L24,10 L36,22 L48,6 L60,16 L72,4 L84,20 L96,8 L100,2'
    }
};

export const getAmcColorMap = (fundType) => {
    const category = FUND_CATEGORIES[fundType];
    return {
        ...MASTER_AMC_COLORS,
        All: category ? category.allColor : '#00F5A0'
    };
};
