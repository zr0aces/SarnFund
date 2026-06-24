/* global __APP_VERSION__ */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Calculator, BarChart3, Leaf, Sprout, Wallet, TrendingUp } from 'lucide-react';
import { useFundData } from '../hooks/useFundData';
import KPICards from './KPICards';
import FundTable from './FundTable';
import FundChart from './FundChart';

const FUND_TABS = [
    { to: '/funds/rmf',      label: 'RMF',      type: 'rmf',  icon: BarChart3,  activeClass: 'text-orange-600' },
    { to: '/funds/thaiesg',  label: 'ThaiESG',  type: 'esg',  icon: Leaf,       activeClass: 'text-emerald-600' },
    { to: '/funds/thaiesgx', label: 'ESGX',     type: 'esgx', icon: Sprout,     activeClass: 'text-cyan-600' },
    { to: '/funds/ssf',      label: 'SSF',      type: 'ssf',  icon: Wallet,     activeClass: 'text-purple-600' },
    { to: '/funds/etf',      label: 'ETF',      type: 'etf',  icon: TrendingUp, activeClass: 'text-amber-600' },
];

const DESKTOP_TAB_ACTIVE = {
    rmf: 'bg-white text-orange-600 shadow-sm',
    esg: 'bg-white text-emerald-600 shadow-sm',
    esgx: 'bg-white text-cyan-600 shadow-sm',
    ssf: 'bg-white text-purple-600 shadow-sm',
    etf: 'bg-white text-amber-700 shadow-sm',
};

const DashboardLayout = ({ title, icon: Icon, fundType, AMC_COLORS, initialMockData }) => {
    const { funds, loading, error, lastUpdated, dataSource, refresh } = useFundData(fundType, initialMockData);

    const [selectedAmc, setSelectedAmc] = useState('All');
    const [selectedRisk, setSelectedRisk] = useState('All');
    const [sortBy, setSortBy] = useState('return1y');
    const [showNewOnly, setShowNewOnly] = useState(false);

    const latestNavDate = useMemo(() => {
        const dates = funds.map(f => f.navDate).filter(Boolean).sort();
        return dates.length ? dates[dates.length - 1] : null;
    }, [funds]);

    const filteredFunds = useMemo(() => {
        let data = funds;
        if (selectedAmc !== 'All') data = data.filter(f => f.amc === selectedAmc);
        if (selectedRisk !== 'All') data = data.filter(f => f.risk === parseInt(selectedRisk));
        if (showNewOnly) data = data.filter(f => f.isNew);
        const sortKey = (showNewOnly && sortBy === 'return1y') ? 'ytd' : sortBy;
        return [...data].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    }, [funds, selectedAmc, selectedRisk, sortBy, showNewOnly]);

    const getSortLabel = (key) => {
        if (showNewOnly && key === 'return1y') return 'YTD (New)';
        switch (key) {
            case 'ytd': return 'YTD';
            case 'return1y': return '1 Year';
            case 'return3y': return '3 Years';
            default: return 'Return';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800 pb-16 md:pb-0">
            {/* Sticky Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center gap-4">
                    <Link to="/" className="flex items-center gap-2 group text-slate-600 hover:text-orange-600 transition-colors shrink-0">
                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-orange-50 text-slate-500 group-hover:text-orange-600 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-display font-semibold text-sm hidden sm:inline">Back to Home</span>
                    </Link>

                    {/* Desktop tab switcher — hidden on mobile */}
                    <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
                        {FUND_TABS.map(({ to, label, type }) => (
                            <Link
                                key={type}
                                to={to}
                                className={`px-4 py-1.5 rounded-md text-sm font-display font-bold transition-all whitespace-nowrap ${fundType === type ? DESKTOP_TAB_ACTIVE[type] : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {type === 'esgx' ? 'ThaiESGX' : label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile: current page title */}
                    <span className="md:hidden font-display font-bold text-slate-800 text-sm truncate">{title}</span>

                    <a href="/ThaiTax2569.html" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-display font-semibold text-slate-400 uppercase tracking-wider hover:text-orange-600 transition-colors shrink-0">
                        <Calculator className="w-4 h-4" />
                        <span className="hidden md:inline">Thai Tax 2569</span>
                    </a>
                </div>
            </nav>

            <main className="flex-grow p-4 md:p-8 container mx-auto">
                {/* Header */}
                <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 flex items-center gap-2">
                            {Icon && <Icon className="w-7 h-7 text-orange-600" />}
                            {title}
                        </h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                            {dataSource === 'mock' ? 'Demo Data – start backend to load real data' : 'SEC Open Data'}
                            {latestNavDate && (
                                <span className="font-display bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-transparent font-medium">
                                    NAV {latestNavDate}
                                </span>
                            )}
                            {lastUpdated && (
                                <span className="bg-white px-2 py-0.5 rounded border border-transparent hidden sm:inline shadow-sm">
                                    {new Date(lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex gap-2 items-center shrink-0">
                        {dataSource === 'mock' && (
                            <span className="text-xs font-display font-semibold bg-amber-100 text-amber-800 px-3 py-2 rounded-lg border border-amber-300 flex items-center gap-1">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                Mock
                            </span>
                        )}
                        <button
                            onClick={refresh}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-display font-semibold text-sm"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Updating...' : 'Update Data'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 text-sm">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="mb-5 flex flex-col gap-3 font-sans">
                    {/* AMC Filter — horizontal scrollable, no wrap */}
                    <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-transparent overflow-x-auto no-scrollbar items-center">
                        <button
                            onClick={() => setSelectedAmc('All')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all whitespace-nowrap shrink-0 ${selectedAmc === 'All' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            All
                        </button>
                        <div className="w-px h-5 bg-slate-200 mx-1 shrink-0"></div>
                        {Array.from(new Set(funds.map(f => f.amc))).sort().map((amc) => (
                            <button
                                key={amc}
                                onClick={() => setSelectedAmc(amc)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all whitespace-nowrap shrink-0 ${selectedAmc === amc ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {amc}
                            </button>
                        ))}
                    </div>

                    {/* Risk Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap shrink-0">Risk:</span>
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-transparent shrink-0">
                            {['All', '1', '2', '3', '4', '5', '6', '7', '8'].map((risk) => (
                                <button
                                    key={risk}
                                    onClick={() => setSelectedRisk(risk)}
                                    className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${selectedRisk === risk ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {risk}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <KPICards
                    funds={funds}
                    showNewOnly={showNewOnly}
                    setShowNewOnly={setShowNewOnly}
                    sortBy={sortBy}
                    getSortLabel={getSortLabel}
                    AMC_COLORS={AMC_COLORS}
                />
                <FundChart
                    funds={filteredFunds}
                    sortBy={sortBy}
                    showNewOnly={showNewOnly}
                    getSortLabel={getSortLabel}
                    AMC_COLORS={AMC_COLORS}
                />
                <FundTable
                    funds={filteredFunds}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    showNewOnly={showNewOnly}
                    AMC_COLORS={AMC_COLORS}
                />
            </main>

            <footer className="py-4 border-t border-slate-100 bg-white mt-auto">
                <div className="container mx-auto text-center text-slate-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} ZeroTrust Investment Tools. All rights reserved. | v{__APP_VERSION__}</p>
                </div>
            </footer>

            {/* Mobile Bottom Navigation — fixed, iOS safe area aware */}
            <nav
                className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-white/95 backdrop-blur-md border-t border-slate-100"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="flex">
                    {FUND_TABS.map(({ to, label, type, icon: TabIcon, activeClass }) => {
                        const isActive = fundType === type;
                        return (
                            <Link
                                key={type}
                                to={to}
                                className={`flex-1 pt-2 pb-1.5 flex flex-col items-center gap-0.5 transition-colors ${isActive ? activeClass : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <TabIcon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                                <span className="text-[9px] font-display font-bold tracking-wide">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default DashboardLayout;
