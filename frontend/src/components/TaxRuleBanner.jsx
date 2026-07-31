import { useState } from 'react';
import { FUND_CATEGORIES } from '../config/fundCategories';
import { ShieldCheck, ChevronDown, ChevronUp, Clock, Landmark } from 'lucide-react';

const TaxRuleBanner = ({ fundType, onOpenCompareModal }) => {
    const category = FUND_CATEGORIES[fundType];
    const [isExpanded, setIsExpanded] = useState(false);

    if (!category) return null;

    return (
        <div className={`mb-6 rounded-3xl border ${category.theme.border} ${category.theme.bg} p-5 transition-all duration-300 shadow-lg relative overflow-hidden font-sans glass-panel`}>
            {/* Background decoration glow */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-2xl ${category.theme.iconBg} border shrink-0`}>
                        <category.icon size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${category.theme.badgeBg}`}>
                                {category.badge}
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-0.5 rounded-lg border border-white/10">
                                <Clock size={13} className="text-emerald-400" />
                                {category.lockup}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-display font-bold text-white leading-snug">
                            {category.taxCap}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <button
                        onClick={onOpenCompareModal}
                        className="px-3.5 py-2 text-xs font-mono font-bold text-white bg-slate-900 border border-white/10 hover:border-emerald-500/40 rounded-xl shadow-xs hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <Landmark size={14} className={category.theme.text} />
                        <span>Compare All Allowance Types</span>
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 rounded-xl border bg-slate-900 ${category.theme.text} border-white/10 hover:border-white/20 transition-all`}
                        title={isExpanded ? "Collapse rules" : "Expand rules"}
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {/* Expandable Key Rules & Guidelines */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10 animate-fadeIn font-mono">
                    {category.keyRules.map((rule, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-slate-900/80 p-3 rounded-2xl border border-white/10 text-xs text-slate-300">
                            <ShieldCheck size={15} className={`${category.theme.text} shrink-0 mt-0.5`} />
                            <span className="leading-relaxed">{rule}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaxRuleBanner;
