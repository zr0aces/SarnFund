import { ExternalLink, Filter } from 'lucide-react';
import { isValidNumber } from '../utils/number';

const FundTable = ({ funds, sortBy, setSortBy, showNewOnly, AMC_COLORS }) => {

    const renderReturnCell = (value, isBold = false) => {
        if (value === 0 || !isValidNumber(value)) {
            return <span className="text-slate-600 font-mono">-</span>;
        }
        return (
            <span className={`font-mono ${value >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isBold ? 'font-bold' : 'font-medium'}`}>
                {value > 0 ? '+' : ''}{value.toFixed(2)}%
            </span>
        );
    };

    const renderReturnChip = (value, label, key) => {
        const isActive = sortBy === key || (showNewOnly && key === 'ytd');
        const isNum = isValidNumber(value) && value !== 0;
        const colorClass = isNum ? (value > 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500';
        return (
            <div key={key} className={`text-center rounded-xl p-2 transition-all ${isActive ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-900/60 border border-white/5'}`}>
                <div className="text-[9px] font-mono font-bold text-slate-400 uppercase">{label}</div>
                <div className={`text-xs font-mono font-bold mt-0.5 ${colorClass}`}>
                    {isNum ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : '-'}
                </div>
            </div>
        );
    };

    const sortControl = (
        <div className="flex items-center gap-2 text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/10">
            <Filter size={13} className="text-slate-400" />
            <span className="text-slate-400 font-mono font-bold text-[10px] uppercase tracking-wider hidden sm:inline">Sort Metric:</span>
            <select
                className="bg-transparent font-mono font-bold text-xs text-emerald-400 outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
            >
                <option value="ytd" className="bg-slate-900 text-white">YTD Return</option>
                <option value="return3m" className="bg-slate-900 text-white">3 Months</option>
                <option value="return6m" className="bg-slate-900 text-white">6 Months</option>
                <option value="return1y" className="bg-slate-900 text-white">1 Year</option>
                <option value="return3y" className="bg-slate-900 text-white">3 Years</option>
                <option value="return5y" className="bg-slate-900 text-white">5 Years</option>
            </select>
        </div>
    );

    return (
        <div className="glass-panel rounded-3xl overflow-hidden font-sans shadow-xl">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center gap-4 bg-slate-950/40">
                <h3 className="text-base sm:text-lg font-display font-extrabold text-white flex items-center gap-2.5">
                    {showNewOnly ? 'New Arrivals' : 'Performance Telemetry Table'}
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/20">
                        {funds.length} funds
                    </span>
                </h3>
                {sortControl}
            </div>

            {funds.length === 0 && (
                <div className="p-12 text-center text-slate-400 font-mono text-xs">
                    No funds found matching your criteria. Try adjusting your search query or filters.
                </div>
            )}

            {/* Mobile card list (< sm) */}
            {funds.length > 0 && (
                <div className="sm:hidden divide-y divide-white/5">
                    {funds.map((fund) => (
                        <div key={fund.id} className="p-4 bg-slate-900/40">
                            {/* Header: code + AMC + risk */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-display font-extrabold text-white text-base">{fund.code}</span>
                                        {fund.class && (
                                            <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-mono font-bold rounded border border-white/10 shrink-0">
                                                {fund.class}
                                            </span>
                                        )}
                                        {fund.isNew && (
                                            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold rounded uppercase border border-amber-500/20">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 block mt-0.5 leading-snug truncate max-w-[210px]">
                                        {fund.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span
                                        className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-lg text-white shadow-xs"
                                        style={{ backgroundColor: AMC_COLORS[fund.amc] || '#1E293B' }}
                                    >
                                        {fund.amc}
                                    </span>
                                    <div className="w-7 h-7 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                                        {fund.risk || '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Return chips */}
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {renderReturnChip(fund.ytd,      'YTD', 'ytd')}
                                {renderReturnChip(fund.return1y, '1Y',  'return1y')}
                                {renderReturnChip(fund.return3y, '3Y',  'return3y')}
                                {renderReturnChip(fund.return5y, '5Y',  'return5y')}
                            </div>

                            {/* External links */}
                            <div className="flex gap-3 pt-2 border-t border-white/5 font-mono">
                                <a href={`https://www.finnomena.com/fund/${encodeURIComponent(fund.code)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-bold">
                                    Finnomena <ExternalLink size={10} />
                                </a>
                                <a href={`https://www.wealthmagik.com/funds/${encodeURIComponent(fund.code)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-bold">
                                    WealthMagik <ExternalLink size={10} />
                                </a>
                                {fund.factsheetUrl && (
                                    <a href={fund.factsheetUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                                        SEC Factsheet <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Desktop / tablet table (≥ sm) */}
            {funds.length > 0 && (
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/60 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest border-b border-white/10">
                                <th className="p-4">Fund Ticker</th>
                                <th className="p-4 hidden lg:table-cell">Policy / Class</th>
                                <th className="p-4 text-center">Risk Tier</th>
                                <th className={`p-4 text-right ${sortBy === 'ytd' || showNewOnly ? 'text-emerald-400 bg-emerald-500/10' : ''}`}>YTD</th>
                                <th className={`p-4 text-right hidden sm:table-cell ${sortBy === 'return3m' ? 'text-emerald-400 bg-emerald-500/10' : ''}`}>3M</th>
                                <th className={`p-4 text-right hidden sm:table-cell ${sortBy === 'return6m' ? 'text-emerald-400 bg-emerald-500/10' : ''}`}>6M</th>
                                <th className={`p-4 text-right ${sortBy === 'return1y' && !showNewOnly ? 'text-emerald-400 bg-emerald-500/10' : ''}`}>1Y</th>
                                <th className={`p-4 text-right hidden md:table-cell ${sortBy === 'return3y' ? 'text-emerald-400 bg-emerald-500/10' : ''}`}>3Y</th>
                                <th className={`p-4 text-right hidden lg:table-cell ${sortBy === 'return5y' ? 'text-emerald-400 bg-emerald-500/10' : ''}`}>5Y</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {funds.map((fund) => (
                                <tr key={fund.id} className="hover:bg-slate-900/60 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-display font-extrabold text-white text-base">{fund.code}</span>
                                                {fund.class && (
                                                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono font-bold rounded border border-white/10">
                                                        {fund.class}
                                                    </span>
                                                )}
                                                {fund.isNew && (
                                                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold rounded uppercase border border-amber-500/20">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400 hidden sm:inline-block mt-0.5">{fund.name}</span>
                                            <div className="flex flex-wrap gap-2.5 mt-2 font-mono">
                                                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg text-white shadow-xs"
                                                    style={{ backgroundColor: AMC_COLORS[fund.amc] || '#1E293B' }}>
                                                    {fund.amc}
                                                </span>
                                                <a href={`https://www.finnomena.com/fund/${encodeURIComponent(fund.code)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5 font-bold">
                                                    Finnomena <ExternalLink size={10} />
                                                </a>
                                                <a href={`https://www.wealthmagik.com/funds/${encodeURIComponent(fund.code)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 font-bold">
                                                    WealthMagik <ExternalLink size={10} />
                                                </a>
                                                {fund.factsheetUrl ? (
                                                    <a href={fund.factsheetUrl} target="_blank" rel="noopener noreferrer"
                                                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 font-bold">
                                                        SEC <ExternalLink size={10} />
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] text-slate-600 flex items-center gap-0.5 cursor-not-allowed">
                                                        SEC <ExternalLink size={10} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs border border-white/10">
                                            {fund.policy || fund.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 font-mono font-bold text-xs border border-white/10">
                                            {fund.risk || '-'}
                                        </div>
                                    </td>
                                    <td className={`p-4 text-right ${sortBy === 'ytd' || showNewOnly ? 'bg-emerald-500/10' : ''}`}>
                                        {renderReturnCell(fund.ytd, sortBy === 'ytd' || showNewOnly)}
                                    </td>
                                    <td className={`p-4 text-right hidden sm:table-cell ${sortBy === 'return3m' ? 'bg-emerald-500/10' : ''}`}>
                                        {renderReturnCell(fund.return3m, sortBy === 'return3m')}
                                    </td>
                                    <td className={`p-4 text-right hidden sm:table-cell ${sortBy === 'return6m' ? 'bg-emerald-500/10' : ''}`}>
                                        {renderReturnCell(fund.return6m, sortBy === 'return6m')}
                                    </td>
                                    <td className={`p-4 text-right ${sortBy === 'return1y' && !showNewOnly ? 'bg-emerald-500/10' : ''}`}>
                                        {renderReturnCell(fund.return1y, sortBy === 'return1y')}
                                    </td>
                                    <td className={`p-4 text-right hidden md:table-cell ${sortBy === 'return3y' ? 'bg-emerald-500/10' : ''}`}>
                                        {renderReturnCell(fund.return3y, sortBy === 'return3y')}
                                    </td>
                                    <td className={`p-4 text-right hidden lg:table-cell ${sortBy === 'return5y' ? 'bg-emerald-500/10' : ''}`}>
                                        {renderReturnCell(fund.return5y, sortBy === 'return5y')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FundTable;
