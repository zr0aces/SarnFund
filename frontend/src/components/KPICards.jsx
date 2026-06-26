import { useMemo, useState, useEffect } from 'react';
import { Trophy, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';
import tipsData from '../data/tips.json';

const CATEGORY_TIPS = tipsData.categories;

const KPICards = ({ funds, showNewOnly, sortBy, getSortLabel, AMC_COLORS, fundType }) => {
    const [activeTipIndex, setActiveTipIndex] = useState(0);

    const tips = CATEGORY_TIPS[fundType] || CATEGORY_TIPS.rmf;

    // Cycle category tips with fade-like delay
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTipIndex((prev) => (prev + 1) % tips.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [tips.length]);

    const stats = useMemo(() => {
        if (funds.length === 0) return { bestFund: null, avgReturn: 0, metric: sortBy };
        const metric = showNewOnly ? 'ytd' : sortBy;
        const validFunds = funds.filter(f => f[metric] !== undefined && f[metric] !== 0);
        if (validFunds.length === 0) return { bestFund: null, avgReturn: 0, metric };
        const bestFund = [...validFunds].sort((a, b) => b[metric] - a[metric])[0];
        const avgReturn = validFunds.reduce((sum, f) => sum + f[metric], 0) / validFunds.length;
        return { bestFund, avgReturn, metric };
    }, [funds, sortBy, showNewOnly]);

    const label = showNewOnly ? 'YTD' : getSortLabel(sortBy);
    const bestVal = stats.bestFund ? stats.bestFund[stats.metric] : null;

    return (
        <>
            {/* ── Mobile: single compact row card ── */}
            <div className="flex md:hidden bg-white rounded-2xl shadow-sm border border-transparent mb-3 font-sans overflow-hidden">
                {/* Top Performer */}
                <div className="flex-1 flex items-center gap-3 px-4 py-3 relative overflow-hidden min-w-0">
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-[0.06]">
                        <Trophy size={52} color={AMC_COLORS[stats.bestFund?.amc] || '#94a3b8'} />
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 shrink-0">
                        <Trophy size={15} className="text-amber-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-display">
                            Top · {label}
                        </p>
                        <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                            <span className="font-display font-extrabold text-slate-800 text-base leading-none truncate">
                                {stats.bestFund ? stats.bestFund.code : '—'}
                            </span>
                            {stats.bestFund && (
                                <span
                                    className="text-[9px] font-display font-bold px-1.5 py-0.5 rounded text-white shrink-0"
                                    style={{ backgroundColor: AMC_COLORS[stats.bestFund.amc] || '#1e293b' }}
                                >
                                    {stats.bestFund.amc}
                                </span>
                            )}
                        </div>
                        {bestVal !== null && (
                            <span className="text-sm font-display font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                                {bestVal > 0 ? '+' : ''}{bestVal.toFixed(2)}%
                                <ArrowUpRight size={13} />
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-px bg-slate-100 my-3 shrink-0" />

                {/* Average Return */}
                <div className="flex-1 flex items-center gap-3 px-4 py-3 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
                        <TrendingUp size={15} className="text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-display">
                            Avg · {label}
                        </p>
                        <span className={`text-base font-display font-extrabold leading-none ${stats.avgReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}%
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{funds.length} funds</p>
                    </div>
                </div>
            </div>

            {/* Mobile: Quick Planner Tip banner */}
            <div className="md:hidden bg-orange-50/40 border border-orange-100/60 rounded-2xl p-4 mb-5 flex items-start gap-3 font-sans relative overflow-hidden">
                <div className="p-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 shrink-0">
                    <Sparkles size={15} />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-orange-700/80 font-display">
                        Quick Planner Tip
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {tips[activeTipIndex]}
                    </p>
                </div>
            </div>

            {/* ── Desktop: 3-card grid (Top, Avg, Tip) ── */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8 font-sans">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={64} color={AMC_COLORS[stats.bestFund?.amc] || '#ccc'} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-display">
                            Top Performer ({label})
                        </p>
                        <h3 className="text-3xl font-display font-extrabold text-slate-800 tracking-tight">
                            {stats.bestFund ? stats.bestFund.code : '-'}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className="text-xs px-2.5 py-0.5 rounded-full font-bold text-white font-display"
                                style={{ backgroundColor: (stats.bestFund && AMC_COLORS[stats.bestFund.amc]) || '#1e293b' }}
                            >
                                {stats.bestFund ? stats.bestFund.amc : '-'}
                            </span>
                            <span className="text-2xl font-display font-bold text-emerald-600 flex items-center">
                                {bestVal !== null ? `${bestVal > 0 ? '+' : ''}${bestVal.toFixed(2)}%` : '-'}
                                <ArrowUpRight size={18} className="ml-0.5" />
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent flex items-center hover:shadow-md transition-shadow">
                    <div className="mr-4 bg-emerald-50 p-3 rounded-full">
                        <TrendingUp className="text-emerald-600 w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-display">
                            Average Return ({label})
                        </p>
                        <h3 className={`text-3xl font-display font-extrabold tracking-tight ${stats.avgReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}%
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">From {funds.length} funds</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent flex items-center hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="mr-4 bg-orange-50 p-3 rounded-full shrink-0">
                        <Sparkles className="text-orange-500 w-6 h-6 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1.5 font-display">
                            Quick Planner Tip
                        </p>
                        <div className="text-xs font-display font-medium text-slate-650 leading-relaxed min-h-[48px]">
                            {tips[activeTipIndex]}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default KPICards;
