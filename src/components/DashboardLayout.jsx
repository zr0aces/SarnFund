import React, { useState, useMemo } from 'react';
import { RefreshCw, Settings, Search, XCircle, Leaf, Zap } from 'lucide-react';
import { useFundData } from '../hooks/useFundData';
import KPICards from './KPICards';
import FundTable from './FundTable';

const DashboardLayout = ({ title, icon: Icon, fundType, initialFunds, AMC_COLORS }) => {
    // Shared State
    const { funds, loading, error, lastUpdated, apiKey, updateApiKey, refresh } = useFundData(fundType, initialFunds);

    // UI State
    const [selectedAmc, setSelectedAmc] = useState('All');
    const [sortBy, setSortBy] = useState('return1y');
    const [showNewOnly, setShowNewOnly] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [tempKey, setTempKey] = useState('');

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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-slate-800">
            {/* Navigation / Header */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        {Icon && <Icon className="w-8 h-8 text-indigo-600" />}
                        {title}
                    </h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        Real-time Data Dashboard
                        {lastUpdated && <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200">Updated: {lastUpdated}</span>}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => { setTempKey(apiKey); setShowSettings(true); }}
                        className={`p-2 rounded-xl border transition-all ${apiKey ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-slate-400 border-slate-200'}`}
                        title="API Settings"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Updating...' : 'Update Data'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            {/* Config Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">API Configuration</h3>
                            <button onClick={() => setShowSettings(false)}><XCircle size={24} className="text-slate-400" /></button>
                        </div>
                        <input
                            type="password"
                            value={tempKey}
                            onChange={(e) => setTempKey(e.target.value)}
                            placeholder="Enter SEC API Key"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4"
                        />
                        <button
                            onClick={() => { updateApiKey(tempKey); setShowSettings(false); }}
                            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Save Key
                        </button>
                    </div>
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

            <FundTable
                funds={filteredFunds}
                sortBy={sortBy}
                setSortBy={setSortBy}
                showNewOnly={showNewOnly}
                AMC_COLORS={AMC_COLORS}
            />
        </div>
    );
};

export default DashboardLayout;
