import React, { useMemo } from 'react';
import { Trophy, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';

const KPICards = ({ funds, showNewOnly, setShowNewOnly, sortBy, getSortLabel, AMC_COLORS }) => {

    // Calculate Stats
    const stats = useMemo(() => {
        if (funds.length === 0) return { bestFund: null, avgReturn: 0 };
        const metric = showNewOnly ? 'ytd' : sortBy;
        const validFunds = funds.filter(f => f[metric] !== undefined);
        if (validFunds.length === 0) return { bestFund: null, avgReturn: 0 };

        const bestFund = [...validFunds].sort((a, b) => b[metric] - a[metric])[0];
        const totalReturn = validFunds.reduce((sum, f) => sum + f[metric], 0);
        const avgReturn = totalReturn / validFunds.length;
        return { bestFund, avgReturn, metric };
    }, [funds, sortBy, showNewOnly]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy size={64} color={AMC_COLORS[stats.bestFund?.amc || 'All'] || '#ccc'} />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                        Top Performer ({showNewOnly ? 'YTD' : getSortLabel(sortBy)})
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {stats.bestFund ? stats.bestFund.code : '-'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold text-white`}
                            style={{ backgroundColor: (stats.bestFund && AMC_COLORS[stats.bestFund.amc]) || '#1e293b' }}>
                            {stats.bestFund ? stats.bestFund.amc : '-'}
                        </span>
                        <span className="text-lg font-bold text-emerald-600 flex items-center">
                            +{stats.bestFund ? stats.bestFund[stats.metric]?.toFixed(2) : 0}% <ArrowUpRight size={16} />
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center">
                <div className="mr-4 bg-emerald-50 p-3 rounded-full">
                    <TrendingUp className="text-emerald-600 w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Average Return ({showNewOnly ? 'YTD' : getSortLabel(sortBy)})</p>
                    <h3 className={`text-2xl font-bold tracking-tight ${stats.avgReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {stats.avgReturn.toFixed(2)}%
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">From {funds.length} funds</p>
                </div>
            </div>
        </div>
    );
};

export default KPICards;
