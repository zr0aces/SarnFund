import { X, Check, Landmark, ExternalLink } from 'lucide-react';
import { FUND_CATEGORIES } from '../config/fundCategories';

const TaxComparisonModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const categories = Object.values(FUND_CATEGORIES);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
            <div className="glass-panel rounded-3xl border border-white/15 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden font-sans shadow-2xl">
                {/* Modal Header */}
                <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20">
                            <Landmark size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-extrabold text-white">
                                Thai Mutual Fund Tax Matrix 2569
                            </h2>
                            <p className="text-xs font-mono text-slate-400 mt-0.5">
                                Side-by-side comparison of tax deduction limits, lockup terms, and regulations
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body / Table */}
                <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-6 custom-scrollbar">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[640px]">
                            <thead>
                                <tr className="border-b border-white/10 text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                                    <th className="p-3.5 w-1/5">Category</th>
                                    <th className="p-3.5 w-1/4">Tax Deduction Cap</th>
                                    <th className="p-3.5 w-1/4">Lockup Term</th>
                                    <th className="p-3.5 w-1/4">Key Features</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-900/50 transition-colors">
                                        <td className="p-3.5 align-top">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`p-2 rounded-xl ${cat.theme.iconBg} border shrink-0`}>
                                                    <cat.icon size={16} />
                                                </div>
                                                <div>
                                                    <span className="font-display font-extrabold text-white block">
                                                        {cat.label}
                                                    </span>
                                                    <span className={`text-[9px] font-mono font-bold uppercase ${cat.theme.text}`}>
                                                        {cat.id.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3.5 align-top font-sans text-slate-200 leading-snug">
                                            {cat.taxCap}
                                        </td>
                                        <td className="p-3.5 align-top font-sans text-slate-200 leading-snug">
                                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-emerald-400 text-xs font-mono font-bold mb-1">
                                                {cat.lockup}
                                            </span>
                                        </td>
                                        <td className="p-3.5 align-top">
                                            <ul className="space-y-1.5 text-slate-300 text-xs font-sans">
                                                {cat.keyRules.slice(0, 2).map((rule, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <Check size={13} className={`${cat.theme.text} shrink-0 mt-0.5`} />
                                                        <span>{rule}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-200 flex items-start gap-3">
                        <span className="font-bold text-amber-400 uppercase tracking-wider shrink-0 mt-0.5">{'//'} Note:</span>
                        <p className="leading-relaxed">
                            Retirement allowances (RMF + SSF + Provident Fund + GPF) are combined and capped at <strong>500,000 THB total</strong>. ThaiESG has a <strong>separate 300,000 THB allowance</strong> for tax year 2569.
                        </p>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/60 flex justify-between items-center font-mono">
                    <a
                        href="/ThaiTax2569.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                    >
                        <span>Open Tax Calculator 2569</span>
                        <ExternalLink size={13} />
                    </a>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        Close Matrix
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaxComparisonModal;
