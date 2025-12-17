
import { ListFilter, AlertCircle } from 'lucide-react';
import { TIMEFRAMES } from '../utils/constants';

const FundTable = ({ funds, loading, colors, timeframe }) => {

    const getReturnColor = (val) => {
        if (val > 0) return 'text-green-600';
        if (val < 0) return 'text-red-600';
        return 'text-slate-500';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
                <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                Loading...
            </div>
        );
    }

    if (!funds.length) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center">
                <AlertCircle size={48} className="mb-4 text-slate-200" />
                <p>No funds found</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        All Funds List
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <ListFilter size={14} />
                        <span>Found <strong>{funds.length}</strong> items</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 text-center w-12 sticky left-0 bg-slate-50 z-20">#</th>
                            <th className="px-4 py-3 min-w-[200px] sticky left-12 bg-slate-50 z-20">Fund Name</th>
                            <th className="px-4 py-3 text-right">NAV</th>
                            {TIMEFRAMES.map(t => (
                                <th key={t.value} className={`px-4 py-3 text-right ${timeframe === t.value ? 'bg-orange-50 text-orange-700 font-bold' : ''}`}>
                                    {t.label.split(' ')[0]} {/* Abbrev label roughly or use fixed logic */}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {funds.map((fund, index) => (
                            <tr key={fund.id || index} className="hover:bg-orange-50/30 transition-colors group">
                                <td className="px-4 py-3 text-center font-bold text-slate-400 sticky left-0 bg-white z-10 group-hover:bg-orange-50/30">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3 sticky left-12 bg-white z-10 group-hover:bg-orange-50/30 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)] sm:shadow-none">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: colors[fund.amc] || colors['OTHER'] }}></div>
                                        <div>
                                            <div className="font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs">{fund.proj_abbr_name}</div>
                                            <div className="text-[10px] text-slate-500 hidden sm:block truncate max-w-xs">{fund.proj_name_th}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-slate-600">
                                    {parseFloat(fund.last_val || 0).toFixed(4)}
                                </td>

                                {TIMEFRAMES.map(t => {
                                    const key = t.value;
                                    const val = fund[key];
                                    return (
                                        <td key={key} className={`px-4 py-3 text-right font-mono ${key === timeframe ? 'bg-orange-50/50 font-bold' : ''}`}>
                                            <span className={getReturnColor(val)}>
                                                {val > 0 ? '+' : ''}{val}%
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FundTable;
