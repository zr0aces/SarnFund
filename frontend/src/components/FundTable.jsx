import { ExternalLink, Filter } from 'lucide-react';

const FundTable = ({ funds, sortBy, setSortBy, showNewOnly, AMC_COLORS }) => {

    const renderReturnCell = (value, isBold = false) => {
        if (value === 0 || value === undefined) return <span className="text-slate-300">-</span>;
        return (
            <span className={`font-display ${value >= 0 ? 'text-green-650' : 'text-red-500'} ${isBold ? 'font-bold' : 'font-medium'}`}>
                {value > 0 ? '+' : ''}{value.toFixed(2)}%
            </span>
        );
    };

    const renderReturnChip = (value, label, key) => {
        const isActive = sortBy === key || (showNewOnly && key === 'ytd');
        const colorClass = value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-500' : 'text-slate-300';
        return (
            <div key={key} className={`text-center rounded-lg p-1.5 ${isActive ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50'}`}>
                <div className="text-[9px] font-display font-bold text-slate-400 uppercase">{label}</div>
                <div className={`text-xs font-display font-bold mt-0.5 ${colorClass}`}>
                    {value ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : '-'}
                </div>
            </div>
        );
    };

    const sortControl = (
        <div className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Filter size={14} className="text-slate-400" />
            <span className="text-slate-500 font-display font-bold text-xs uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
                className="bg-transparent font-display font-bold text-xs text-emerald-600 outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
            >
                <option value="ytd">YTD</option>
                <option value="return3m">3M</option>
                <option value="return6m">6M</option>
                <option value="return1y">1Y</option>
                <option value="return3y">3Y</option>
                <option value="return5y">5Y</option>
            </select>
        </div>
    );

    return (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden font-sans">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center gap-4">
                <h3 className="text-base sm:text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                    {showNewOnly ? 'New Arrivals' : 'Performance Table'}
                    {showNewOnly && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-sans">{funds.length}</span>}
                </h3>
                {sortControl}
            </div>

            {funds.length === 0 && (
                <div className="p-12 text-center text-slate-400 font-display font-semibold text-sm">
                    No funds found matching your criteria.
                </div>
            )}

            {/* Mobile card list (< sm) */}
            {funds.length > 0 && (
                <div className="sm:hidden divide-y divide-slate-100">
                    {funds.map((fund) => (
                        <div key={fund.id} className="p-4">
                            {/* Header: code + AMC + risk */}
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-display font-extrabold text-slate-800">{fund.code}</span>
                                        {fund.isNew && (
                                            <span className="px-1 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-bold rounded uppercase border border-orange-200">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-400 block mt-0.5 leading-tight truncate max-w-[210px]">
                                        {fund.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span
                                        className="text-[9px] uppercase font-display font-bold px-1.5 py-0.5 rounded text-white"
                                        style={{ backgroundColor: AMC_COLORS[fund.amc] || '#1e293b' }}
                                    >
                                        {fund.amc}
                                    </span>
                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-display font-bold text-slate-600">
                                        {fund.risk || '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Return chips */}
                            <div className="grid grid-cols-4 gap-1.5">
                                {renderReturnChip(fund.ytd,      'YTD', 'ytd')}
                                {renderReturnChip(fund.return1y, '1Y',  'return1y')}
                                {renderReturnChip(fund.return3y, '3Y',  'return3y')}
                                {renderReturnChip(fund.return5y, '5Y',  'return5y')}
                            </div>

                            {/* External links */}
                            <div className="flex gap-3 mt-2.5">
                                <a href={`https://www.finnomena.com/fund/${encodeURIComponent(fund.code)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-[10px] text-yellow-600 flex items-center gap-0.5 font-medium font-sans">
                                    Finnomena <ExternalLink size={9} />
                                </a>
                                <a href={`https://www.wealthmagik.com/funds/${encodeURIComponent(fund.code)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-[10px] text-cyan-600 flex items-center gap-0.5 font-medium font-sans">
                                    WealthMagik <ExternalLink size={9} />
                                </a>
                                {fund.factsheetUrl && (
                                    <a href={fund.factsheetUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-[10px] text-green-600 flex items-center gap-0.5 font-medium font-sans">
                                        SEC <ExternalLink size={9} />
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
                            <tr className="bg-slate-50 text-slate-400 text-[11px] font-display font-bold uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4">Fund Name</th>
                                <th className="p-4 hidden lg:table-cell">Policy</th>
                                <th className="p-4 text-center">Risk</th>
                                <th className={`p-4 text-right ${sortBy === 'ytd' || showNewOnly ? 'text-emerald-600 bg-emerald-50/30' : ''}`}>YTD</th>
                                <th className={`p-4 text-right hidden sm:table-cell ${sortBy === 'return3m' ? 'text-emerald-600 bg-emerald-50/30' : ''}`}>3M</th>
                                <th className={`p-4 text-right hidden sm:table-cell ${sortBy === 'return6m' ? 'text-emerald-600 bg-emerald-50/30' : ''}`}>6M</th>
                                <th className={`p-4 text-right ${sortBy === 'return1y' && !showNewOnly ? 'text-emerald-600 bg-emerald-50/30' : ''}`}>1Y</th>
                                <th className={`p-4 text-right hidden md:table-cell ${sortBy === 'return3y' ? 'text-emerald-600 bg-emerald-50/30' : ''}`}>3Y</th>
                                <th className={`p-4 text-right hidden lg:table-cell ${sortBy === 'return5y' ? 'text-emerald-600 bg-emerald-50/30' : ''}`}>5Y</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {funds.map((fund) => (
                                <tr key={fund.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-display font-extrabold text-slate-800 text-base">{fund.code}</span>
                                                {fund.isNew && (
                                                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded uppercase border border-orange-200 font-sans">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400 hidden sm:inline-block mt-0.5">{fund.name}</span>
                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                <span className="text-[9px] uppercase font-display font-bold px-1.5 py-0.5 rounded text-white"
                                                    style={{ backgroundColor: AMC_COLORS[fund.amc] || '#1e293b' }}>
                                                    {fund.amc}
                                                </span>
                                                <a href={`https://www.finnomena.com/fund/${encodeURIComponent(fund.code)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-[10px] text-yellow-600 hover:underline flex items-center gap-0.5 font-medium font-sans">
                                                    Finnomena <ExternalLink size={10} />
                                                </a>
                                                <a href={`https://www.wealthmagik.com/funds/${encodeURIComponent(fund.code)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-[10px] text-cyan-600 hover:underline flex items-center gap-0.5 font-medium font-sans">
                                                    WealthMagik <ExternalLink size={10} />
                                                </a>
                                                {fund.factsheetUrl ? (
                                                    <a href={fund.factsheetUrl} target="_blank" rel="noopener noreferrer"
                                                        className="text-[10px] text-green-600 hover:underline flex items-center gap-0.5 font-medium font-sans">
                                                        SEC <ExternalLink size={10} />
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300 flex items-center gap-0.5 cursor-not-allowed font-sans">
                                                        SEC <ExternalLink size={10} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-500 border border-slate-200 font-display">
                                            {fund.policy || fund.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-650 font-display font-bold text-xs">
                                            {fund.risk}
                                        </div>
                                    </td>
                                    <td className={`p-4 text-right ${sortBy === 'ytd' || showNewOnly ? 'bg-emerald-50/30' : ''}`}>
                                        {renderReturnCell(fund.ytd, sortBy === 'ytd' || showNewOnly)}
                                    </td>
                                    <td className={`p-4 text-right hidden sm:table-cell ${sortBy === 'return3m' ? 'bg-emerald-50/30' : ''}`}>
                                        {renderReturnCell(fund.return3m, sortBy === 'return3m')}
                                    </td>
                                    <td className={`p-4 text-right hidden sm:table-cell ${sortBy === 'return6m' ? 'bg-emerald-50/30' : ''}`}>
                                        {renderReturnCell(fund.return6m, sortBy === 'return6m')}
                                    </td>
                                    <td className={`p-4 text-right ${sortBy === 'return1y' && !showNewOnly ? 'bg-emerald-50/30' : ''}`}>
                                        {renderReturnCell(fund.return1y, sortBy === 'return1y')}
                                    </td>
                                    <td className={`p-4 text-right hidden md:table-cell ${sortBy === 'return3y' ? 'bg-emerald-50/30' : ''}`}>
                                        {renderReturnCell(fund.return3y, sortBy === 'return3y')}
                                    </td>
                                    <td className={`p-4 text-right hidden lg:table-cell ${sortBy === 'return5y' ? 'bg-emerald-50/30' : ''}`}>
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
