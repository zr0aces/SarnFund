import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, AlertCircle, TrendingUp, Trophy } from 'lucide-react';
import { AMC_COLORS, FUND_TYPES, TIMEFRAMES, API_URL } from '../utils/constants';
import FundChart from './FundChart';
import FundTable from './FundTable';
import FilterBar from './FilterBar';
import SourceBadge from './SourceBadge';

const FundDashboard = () => {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dataSource, setDataSource] = useState('none');
    const [selectedType, setSelectedType] = useState('RMF');
    const [selectedTimeframe, setSelectedTimeframe] = useState('return_1y');
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                // If 503, it might mean scraping is in progress or failed. 
                // We might still get data if we handle it in json.
                // But generally ok is 200-299.
                if (response.status === 503) {
                    const data = await response.json();
                    if (data.expired) {
                        // Still have data, just expired
                        setFunds(data.data || []);
                        setDataSource('expired');
                        setLastUpdated(data.timestamp);
                        setError('Data is outdated. Background update started.');
                    } else {
                        throw new Error(data.error || 'Service Unavailable');
                    }
                } else {
                    throw new Error('Failed to fetch data');
                }
            } else {
                const data = await response.json();
                setFunds(data.data || []);
                setDataSource(data.cached ? 'cached' : 'live');
                setLastUpdated(data.timestamp);
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
            // Fallback to empty or previous state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const sortedFunds = useMemo(() => {
        if (!funds.length) return [];
        let filtered = funds.filter(f => f.fund_type === selectedType);
        return filtered.sort((a, b) => (b[selectedTimeframe] || -999) - (a[selectedTimeframe] || -999));
    }, [funds, selectedType, selectedTimeframe]);

    const chartData = useMemo(() => {
        return sortedFunds.slice(0, 10);
    }, [sortedFunds]);

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-12">
            {/* Header */}
            <header className="bg-white border-b border-orange-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-600 text-white p-2 rounded-lg shadow-orange-200">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Thai Fund Ranking</h1>
                            <h1 className="text-xl font-bold text-slate-900 sm:hidden">Ranking</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <SourceBadge source={dataSource} timestamp={lastUpdated} />

                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600 rounded-full transition-colors relative group"
                            title="Refresh Data"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FilterBar
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        selectedTimeframe={selectedTimeframe}
                        setSelectedTimeframe={setSelectedTimeframe}
                    />
                </div>

                {/* Chart */}
                {chartData.length > 0 && !loading && (
                    <FundChart
                        data={chartData}
                        timeframe={selectedTimeframe}
                        colors={AMC_COLORS}
                    />
                )}

                {/* Table */}
                <FundTable
                    funds={sortedFunds}
                    loading={loading}
                    colors={AMC_COLORS}
                    timeframe={selectedTimeframe}
                />

            </main>
        </div>
    );
};

export default FundDashboard;
