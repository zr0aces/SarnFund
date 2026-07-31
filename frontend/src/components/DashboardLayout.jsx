/* global __APP_VERSION__ */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Calculator, BarChart3, Leaf, Sprout, Wallet, TrendingUp, Search, ShieldCheck } from 'lucide-react';
import { useFundData } from '../hooks/useFundData';
import { FUND_CATEGORIES } from '../config/fundCategories';
import KPICards from './KPICards';
import FundTable from './FundTable';
import FundChart from './FundChart';
import TaxRuleBanner from './TaxRuleBanner';
import TaxComparisonModal from './TaxComparisonModal';

const FUND_TABS = [
    { to: '/funds/rmf',      label: 'RMF',      type: 'rmf',  icon: BarChart3,  activeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { to: '/funds/thaiesg',  label: 'ThaiESG',  type: 'esg',  icon: Leaf,       activeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { to: '/funds/thaiesgx', label: 'ESGX',     type: 'esgx', icon: Sprout,     activeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { to: '/funds/ssf',      label: 'SSF',      type: 'ssf',  icon: Wallet,     activeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { to: '/funds/etf',      label: 'ETF',      type: 'etf',  icon: TrendingUp, activeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
];

const DashboardLayout = ({ title, icon: Icon, fundType, AMC_COLORS, initialMockData }) => {
    const { funds, loading, error, lastUpdated, dataSource, refresh } = useFundData(fundType, initialMockData);

    const [selectedAmc, setSelectedAmc] = useState('All');
    const [selectedRisk, setSelectedRisk] = useState('All');
    const [sortBy, setSortBy] = useState('return1y');
    const [showNewOnly, setShowNewOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCompareOpen, setIsCompareOpen] = useState(false);

    const categoryInfo = FUND_CATEGORIES[fundType];

    const latestNavDate = useMemo(() => {
        const dates = funds.map(f => f.navDate).filter(Boolean).sort();
        return dates.length ? dates[dates.length - 1] : null;
    }, [funds]);

    const filteredFunds = useMemo(() => {
        let data = funds;
        
        // Search term filter
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            data = data.filter(f => 
                (f.code && f.code.toLowerCase().includes(query)) || 
                (f.name && f.name.toLowerCase().includes(query)) ||
                (f.amc && f.amc.toLowerCase().includes(query))
            );
        }

        // AMC filter
        if (selectedAmc !== 'All') data = data.filter(f => f.amc === selectedAmc);
        
        // Risk filter
        if (selectedRisk === 'Low') {
            data = data.filter(f => f.risk >= 1 && f.risk <= 3);
        } else if (selectedRisk === 'Mod') {
            data = data.filter(f => f.risk >= 4 && f.risk <= 5);
        } else if (selectedRisk === 'High') {
            data = data.filter(f => f.risk >= 6 && f.risk <= 8);
        } else if (selectedRisk !== 'All') {
            data = data.filter(f => f.risk === parseInt(selectedRisk));
        }

        if (showNewOnly) data = data.filter(f => f.isNew);
        const sortKey = (showNewOnly && sortBy === 'return1y') ? 'ytd' : sortBy;
        return [...data].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    }, [funds, searchTerm, selectedAmc, selectedRisk, sortBy, showNewOnly]);

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
        <div className="min-h-screen bg-[#090D16] bg-radial-mesh flex flex-col font-sans text-slate-100 pb-16 md:pb-0">
            {/* Sticky Top Navigation Glass Bar */}
            <nav className="sticky top-0 z-50 glass-header">
                <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center gap-4">
                    <Link to="/" className="flex items-center gap-2.5 group text-slate-300 hover:text-emerald-400 transition-colors shrink-0">
                        <div className="p-2 rounded-xl bg-slate-900 border border-white/10 group-hover:border-emerald-500/40 text-slate-400 group-hover:text-emerald-400 transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="font-mono font-bold text-xs tracking-wider uppercase hidden sm:inline">Hub</span>
                    </Link>

                    {/* Desktop tab switcher */}
                    <div className="hidden md:flex bg-slate-950/80 p-1 rounded-2xl border border-white/10 gap-1">
                        {FUND_TABS.map(({ to, label, type, activeClass }) => (
                            <Link
                                key={type}
                                to={to}
                                className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border whitespace-nowrap ${fundType === type ? activeClass : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                            >
                                {type === 'esgx' ? 'ThaiESGX' : label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile: current page title */}
                    <span className="md:hidden font-display font-extrabold text-white text-sm truncate">{title}</span>

                    {/* Search & External Tool */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="relative hidden lg:block">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search fund ticker or AMC..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-1.5 bg-slate-900/90 text-xs font-mono text-white placeholder-slate-500 rounded-xl border border-white/10 focus:border-emerald-500/50 outline-none w-56 transition-all"
                            />
                        </div>

                        <a href="/ThaiTax2569.html" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-emerald-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-all shrink-0">
                            <Calculator className="w-4 h-4 text-emerald-400" />
                            <span className="hidden md:inline">Thai Tax 2569</span>
                        </a>
                    </div>
                </div>
            </nav>

            <main className="flex-grow p-4 md:p-8 container mx-auto">
                {/* Header Section */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white flex items-center gap-3">
                            {Icon && (
                                <div className={`p-2.5 rounded-2xl ${categoryInfo?.theme.iconBg || 'bg-emerald-500/10 text-emerald-400'} border`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            )}
                            {categoryInfo ? categoryInfo.title : title}
                        </h1>
                        <p className="text-slate-400 mt-2 flex items-center gap-2 flex-wrap text-xs sm:text-sm font-mono">
                            <span className="inline-flex items-center gap-1 bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded-lg text-slate-300">
                                <ShieldCheck size={12} className="text-emerald-400" />
                                {dataSource === 'mock' ? 'Demo Mode' : 'SEC Open Data'}
                            </span>
                            {latestNavDate && (
                                <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 font-semibold">
                                    NAV {latestNavDate}
                                </span>
                            )}
                            {lastUpdated && (
                                <span className="bg-slate-900 text-slate-400 px-2.5 py-0.5 rounded-lg border border-white/10 hidden sm:inline">
                                    Synced {new Date(lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 items-center shrink-0 w-full sm:w-auto">
                        {/* Mobile Search Box */}
                        <div className="relative flex-grow sm:hidden">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search fund..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-900 text-xs font-mono text-white placeholder-slate-500 rounded-xl border border-white/10 outline-none"
                            />
                        </div>

                        {dataSource === 'mock' && (
                            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0">
                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                                Demo
                            </span>
                        )}
                        <button
                            onClick={refresh}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-mono font-bold text-xs active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 shrink-0"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Updating...' : 'Update NAV'}
                        </button>
                    </div>
                </div>

                {/* Tax & Category Guidance Banner */}
                <TaxRuleBanner
                    fundType={fundType}
                    onOpenCompareModal={() => setIsCompareOpen(true)}
                />

                {error && (
                    <div className="mb-6 p-4 bg-amber-500/10 text-amber-300 rounded-2xl border border-amber-500/20 text-xs font-mono">
                        {error}
                    </div>
                )}

                {/* Interactive Filter Control Panel */}
                <div className="mb-6 space-y-3">
                    {/* AMC Filter Bar */}
                    <div className="flex gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar items-center">
                        <button
                            onClick={() => setSelectedAmc('All')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap shrink-0 ${selectedAmc === 'All' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
                        >
                            All AMCs
                        </button>
                        <div className="w-px h-5 bg-white/10 mx-1 shrink-0"></div>
                        {Array.from(new Set(funds.map(f => f.amc))).sort().map((amc) => (
                            <button
                                key={amc}
                                onClick={() => setSelectedAmc(amc)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap shrink-0 ${selectedAmc === amc ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                            >
                                {amc}
                            </button>
                        ))}
                    </div>

                    {/* Risk Filter Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap shrink-0">Risk Tier:</span>
                        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-white/10 shrink-0 gap-1">
                            {['All', 'Low', 'Mod', 'High', '1', '2', '3', '4', '5', '6', '7', '8'].map((risk) => {
                                const isActive = selectedRisk === risk;
                                return (
                                    <button
                                        key={risk}
                                        onClick={() => setSelectedRisk(risk)}
                                        className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${isActive ? 'bg-slate-800 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                                    >
                                        {risk === 'Low' ? 'Low (1-3)' : risk === 'Mod' ? 'Mod (4-5)' : risk === 'High' ? 'High (6-8)' : risk}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Telemetry Modules */}
                <KPICards
                    key={fundType}
                    funds={filteredFunds}
                    showNewOnly={showNewOnly}
                    setShowNewOnly={setShowNewOnly}
                    sortBy={sortBy}
                    getSortLabel={getSortLabel}
                    AMC_COLORS={AMC_COLORS}
                    fundType={fundType}
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

            {/* Comparison Modal */}
            <TaxComparisonModal
                isOpen={isCompareOpen}
                onClose={() => setIsCompareOpen(false)}
            />

            {/* Footer */}
            <footer className="py-6 border-t border-white/10 bg-slate-950/80 mt-auto">
                <div className="container mx-auto px-4 text-center text-slate-500 text-xs font-mono">
                    <p>&copy; {new Date().getFullYear()} SarnFund Thai Mutual Fund Analytics Console | Version {__APP_VERSION__}</p>
                </div>
            </footer>

            {/* Mobile Bottom Navigation Bar */}
            <nav
                className="fixed bottom-0 left-0 right-0 md:hidden z-50 glass-header border-t border-white/10"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="flex">
                    {FUND_TABS.map(({ to, label, type, icon: TabIcon, activeClass }) => {
                        const isActive = fundType === type;
                        return (
                            <Link
                                key={type}
                                to={to}
                                className={`flex-1 pt-2.5 pb-2 flex flex-col items-center gap-0.5 transition-colors ${isActive ? activeClass : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <TabIcon size={18} strokeWidth={isActive ? 2.2 : 1.5} />
                                <span className="text-[9px] font-mono font-bold tracking-wider">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default DashboardLayout;
