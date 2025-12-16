import React from 'react';
import { ExternalLink, Filter } from 'lucide-react';

const FundTable = ({ funds, sortBy, setSortBy, showNewOnly, AMC_COLORS }) => {

    const renderReturnCell = (value, isBold = false) => {
        if (value === 0 || value === undefined) return <span className="text-slate-300">-</span>;
        return (
            <span className={`${value >= 0 ? 'text-green-600' : 'text-red-500'} ${isBold ? 'font-bold' : 'font-medium'}`}>
                {value > 0 ? '+' : ''}{value.toFixed(2)}%
            </span>
        );
    };

    return (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    {showNewOnly ? 'New Arrivals' : 'Performance Table'}
                    {showNewOnly && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">Showing {funds.length} items</span>}
                </h3>

                <div className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Filter size={16} className="text-slate-400" />
                    <span className="text-slate-600">Sort by:</span>
                    <select
                        className="bg-transparent font-medium text-emerald-600 outline-none cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="ytd">YTD Return</option>
                        <option value="return1y">1 Year Return</option>

                        <option value="return3y">3 Years Return</option>
                        <option value="return5y">5 Years Return</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="p-4 font-medium">Fund Name</th>
                            <th className="p-4 font-medium hidden lg:table-cell">Policy</th>
                            <th className="p-4 font-medium text-center">Risk</th>
                            <th className={`p-4 font-medium text-right ${sortBy === 'ytd' || showNewOnly ? 'text-emerald-600 bg-emerald-50/50' : ''}`}>YTD</th>
                            <th className={`p-4 font-medium text-right ${sortBy === 'return1y' && !showNewOnly ? 'text-emerald-600 bg-emerald-50/50' : ''}`}>1Y</th>

                            <th className={`p-4 font-medium text-right hidden md:table-cell ${sortBy === 'return3y' ? 'text-emerald-600 bg-emerald-50/50' : ''}`}>3Y</th>
                            <th className={`p-4 font-medium text-right hidden lg:table-cell ${sortBy === 'return5y' ? 'text-emerald-600 bg-emerald-50/50' : ''}`}>5Y</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {funds.map((fund) => (
                            <tr key={fund.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800">{fund.code}</span>
                                            {fund.isNew && (
                                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded uppercase border border-orange-200">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 hidden sm:inline-block">{fund.name}</span>

                                        <div className="flex gap-2 mt-1">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white`}
                                                style={{ backgroundColor: AMC_COLORS[fund.amc] || '#1e293b' }}>
                                                {fund.amc}
                                            </span>
                                            {fund.factsheetUrl ? (
                                                <a href={fund.factsheetUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">
                                                    Factsheet <ExternalLink size={10} />
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 flex items-center gap-0.5 cursor-not-allowed">
                                                    Factsheet <ExternalLink size={10} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 hidden lg:table-cell">
                                    <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                                        {fund.policy || fund.type}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                                        {fund.risk}
                                    </div>
                                </td>
                                <td className={`p-4 text-right font-mono ${sortBy === 'ytd' || showNewOnly ? 'bg-emerald-50/30 font-bold' : ''}`}>
                                    {renderReturnCell(fund.ytd, sortBy === 'ytd' || showNewOnly)}
                                </td>
                                <td className={`p-4 text-right font-mono ${sortBy === 'return1y' && !showNewOnly ? 'bg-emerald-50/30' : ''}`}>
                                    {renderReturnCell(fund.return1y, sortBy === 'return1y')}
                                </td>

                                <td className={`p-4 text-right font-mono hidden md:table-cell ${sortBy === 'return3y' ? 'bg-emerald-50/30' : ''}`}>
                                    {renderReturnCell(fund.return3y, sortBy === 'return3y')}
                                </td>
                                <td className={`p-4 text-right font-mono hidden lg:table-cell ${sortBy === 'return5y' ? 'bg-emerald-50/30' : ''}`}>
                                    {renderReturnCell(fund.return5y, sortBy === 'return5y')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {funds.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <p>No funds found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FundTable;
