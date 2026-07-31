import { useMemo, useState, useEffect } from 'react';
import { Trophy, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';
import tipsData from '../data/tips.json';

const CATEGORY_TIPS = tipsData.categories;

const KPICards = ({ funds, showNewOnly, sortBy, getSortLabel, AMC_COLORS, fundType }) => {
    const [activeTipIndex, setActiveTipIndex] = useState(0);
    const [shuffledTips] = useState(() => {
        const tips = CATEGORY_TIPS[fundType] || CATEGORY_TIPS.rmf;
        return [...tips].sort(() => Math.random() - 0.5);
    });

    // Cycle category tips with fade delay
    useEffect(() => {
        if (shuffledTips.length === 0) return;
        const interval = setInterval(() => {
            setActiveTipIndex((prev) => (prev + 1) % shuffledTips.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [shuffledTips.length]);

    const currentTip = shuffledTips[activeTipIndex];

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
            {/* Mobile: Compact single row telemetry card */}
            <div className="flex md:hidden glass-panel rounded-2xl mb-4 font-sans overflow-hidden">
                {/* Top Performer */}
                <div className="flex-1 flex items-center gap-3 p-3.5 relative overflow-hidden min-w-0">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                        <Trophy size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Top · {label}
                        </p>
                        <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                            <span className="font-display font-extrabold text-white text-sm truncate">
                                {stats.bestFund ? stats.bestFund.code : '—'}
                            </span>
                            {stats.bestFund && (
                                <span
                                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-white shrink-0 shadow-xs"
                                    style={{ backgroundColor: AMC_COLORS[stats.bestFund.amc] || '#1E293B' }}
                                >
                                    {stats.bestFund.amc}
                                </span>
                            )}
                        </div>
                        {bestVal !== null && (
                            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                                {bestVal > 0 ? '+' : ''}{bestVal.toFixed(2)}%
                                <ArrowUpRight size={12} />
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-px bg-white/10 my-3 shrink-0" />

                {/* Average Return */}
                <div className="flex-1 flex items-center gap-3 p-3.5 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                        <TrendingUp size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Avg · {label}
                        </p>
                        <span className={`text-sm font-mono font-bold ${stats.avgReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}%
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{funds.length} funds</p>
                    </div>
                </div>
            </div>

            {/* Mobile: Quick Planner Tip banner */}
            <div className="md:hidden glass-panel border-amber-500/20 rounded-2xl p-4 mb-5 flex items-start gap-3 relative overflow-hidden">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <Sparkles size={16} className="animate-pulse" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400">
                        Quick Planner Telemetry
                    </p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {currentTip}
                    </p>
                </div>
            </div>

            {/* Desktop: 3-card telemetry grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5 mb-8 font-sans">
                {/* Top Performer Card */}
                <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <Trophy size={72} color={AMC_COLORS[stats.bestFund?.amc] || '#94a3b8'} />
                    </div>
                    <div>
                        <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                            {'//'} Top Performer ({label})
                        </p>
                        <h3 className="text-2xl font-display font-extrabold text-white tracking-tight">
                            {stats.bestFund ? stats.bestFund.code : '-'}
                        </h3>
                        <div className="flex items-center gap-3 mt-3">
                            <span
                                className="text-xs px-2.5 py-1 rounded-xl font-mono font-bold text-white shadow-md"
                                style={{ backgroundColor: (stats.bestFund && AMC_COLORS[stats.bestFund.amc]) || '#1E293B' }}
                            >
                                {stats.bestFund ? stats.bestFund.amc : '-'}
                            </span>
                            <span className="text-2xl font-mono font-bold text-emerald-400 flex items-center">
                                {bestVal !== null ? `${bestVal > 0 ? '+' : ''}${bestVal.toFixed(2)}%` : '-'}
                                <ArrowUpRight size={20} className="ml-0.5" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Average Return Card */}
                <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex items-center">
                    <div className="mr-4 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-emerald-400 shrink-0">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                            {'//'} Average Return ({label})
                        </p>
                        <h3 className={`text-2xl font-mono font-bold tracking-tight ${stats.avgReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}%
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-1">Calculated from {funds.length} funds</p>
                    </div>
                </div>

                {/* Category Tax Tip Card */}
                <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex items-start relative overflow-hidden">
                    <div className="mr-4 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-amber-400 shrink-0 mt-0.5">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-1.5">
                            {'//'} Quick Telemetry Tip
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                            {currentTip}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default KPICards;
