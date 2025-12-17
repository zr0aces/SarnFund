import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useFundData } from '../hooks/useFundData';
import KPICards from './KPICards';
import FundTable from './FundTable';
import FundChart from './FundChart';

const DashboardLayout = ({ title, icon: Icon, fundType, AMC_COLORS, initialMockData }) => {
    // Shared State
    const { funds, loading, error, lastUpdated, dataSource } = useFundData(fundType, initialMockData);

    // UI State
    const [selectedAmc, setSelectedAmc] = useState('All');
    const [sortBy, setSortBy] = useState('return1y');
    const [showNewOnly, setShowNewOnly] = useState(false);

    // Filter Logic
    const filteredFunds = useMemo(() => {
        let data = funds;
        if (selectedAmc !== 'All') {
            data = data.filter(f => f.amc === selectedAmc);
        }
        if (showNewOnly) {
            data = data.filter(f => f.isNew);
        }
        const sortKey = (showNewOnly && sortBy === 'return1y') ? 'ytd' : sortBy;
        return [...data].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    }, [funds, selectedAmc, sortBy, showNewOnly]);

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
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
            {/* Sticky Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group text-slate-600 hover:text-indigo-600 transition-colors">
                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-500 group-hover:text-indigo-600 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-semibold text-sm">Back to Home</span>
                    </Link>
                    <div className="hidden md:block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        ZeroTrust Investment Tools
                    </div>
                </div>
            </nav>

            <main className="flex-grow p-4 md:p-8 container mx-auto">
                {/* Header Section */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            {Icon && <Icon className="w-8 h-8 text-indigo-600" />}
                            {title}
                        </h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            {dataSource === 'mock' ? 'Demo Data - Start backend to load real data' : 'Real-time Data Dashboard'}
                            {lastUpdated && <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200">Updated: {lastUpdated}</span>}
                        </p>
                    </div>

                    <div className="flex gap-2 items-center">
                        {dataSource === 'mock' && (
                            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-3 py-2 rounded-lg border border-amber-300 flex items-center gap-1">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                Mock Data
                            </span>
                        )}
                        <button
                            onClick={() => {
                                localStorage.removeItem(`fund_cache_v2_${fundType}`);
                                localStorage.removeItem('fund_cache_v2_rmf');
                                localStorage.removeItem('fund_cache_v2_tesg');
                                window.location.reload();
                            }}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Updating...' : 'Update Data'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit mb-6 overflow-x-auto">
                    {['All', ...Object.keys(AMC_COLORS).filter(k => k !== 'All')].map((amc) => (
                        <button
                            key={amc}
                            onClick={() => setSelectedAmc(amc)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedAmc === amc ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            {amc}
                        </button>
                    ))}
                </div>

                {/* Content */}
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

            {/* Footer */}
            <footer className="py-6 border-t border-slate-200 bg-white mt-auto">
                <div className="container mx-auto text-center text-slate-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} ZeroTrust Investment Tools. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default DashboardLayout;
