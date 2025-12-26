import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Leaf, ArrowRight, ShieldCheck, BarChart3, Calculator } from 'lucide-react';

const LandingPage = () => {
    const [stats, setStats] = useState({ rmf: 0, tesg: 0, ltf: 0, ssf: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats');
                const result = await response.json();
                if (result.success && result.stats) {
                    setStats(result.stats);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            {/* Hero Section */}
            <header className="bg-slate-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-900/50 to-transparent pointer-events-none"></div>
                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-200 text-sm mb-6">
                        <ShieldCheck size={16} /> ZeroTrust Investment Tools
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Fund Analytics</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Real-time tracking for Tax Saving Funds. Compare RMF, ThaiESG, SSF, and LTF performance with zero-trust transparency.
                    </p>
                </div>
            </header>

            {/* Dashboard Previews */}
            <section className="container mx-auto px-4 -mt-20 pb-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                    {/* RMF Card */}
                    <Link to="/funds/rmf" className="group bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:border-orange-200 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Trophy size={140} className="text-orange-600" />
                        </div>
                        <div className="relative">
                            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <BarChart3 size={28} />
                            </div>
                            <h2 className="text-3xl font-bold mb-3 text-slate-900">RMF Dashboard</h2>
                            <p className="text-slate-500 mb-6 text-base">Retirement Mutual Funds. Long-term tracking.</p>

                            <div className="flex items-center justify-between text-sm py-3 border-t border-slate-100">
                                <span className="text-slate-400">Funds</span>
                                <span className="font-bold text-slate-800">{stats.rmf > 0 ? stats.rmf : 'Loading...'}</span>
                            </div>
                            <div className="flex items-center text-orange-600 font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                                Launch <ArrowRight size={18} className="ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* ThaiESG Card */}
                    <Link to="/funds/thaiesg" className="group bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:border-teal-600 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Leaf size={140} className="text-teal-600" />
                        </div>
                        <div className="relative">
                            <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                <Leaf size={28} />
                            </div>
                            <h2 className="text-3xl font-bold mb-3 text-slate-900">ThaiESG</h2>
                            <p className="text-slate-500 mb-6 text-base">Sustainable Equity Funds. Tax saving + ESG.</p>

                            <div className="flex items-center justify-between text-sm py-3 border-t border-slate-100">
                                <span className="text-slate-400">Funds</span>
                                <span className="font-bold text-slate-800">{stats.tesg > 0 ? stats.tesg : 'Loading...'}</span>
                            </div>
                            <div className="flex items-center text-teal-600 font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                                Launch <ArrowRight size={18} className="ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* SSF Card */}
                    <Link to="/funds/ssf" className="group bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:border-purple-200 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Leaf size={140} className="text-purple-600" />
                        </div>
                        <div className="relative">
                            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Leaf size={28} />
                            </div>
                            <h2 className="text-3xl font-bold mb-3 text-slate-900">SSF Dashboard</h2>
                            <p className="text-slate-500 mb-6 text-base">Super Savings Funds. Long term savings.</p>

                            <div className="flex items-center justify-between text-sm py-3 border-t border-slate-100">
                                <span className="text-slate-400">Funds</span>
                                <span className="font-bold text-slate-800">{stats.ssf > 0 ? stats.ssf : 'Loading...'}</span>
                            </div>
                            <div className="flex items-center text-purple-600 font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                                Launch <ArrowRight size={18} className="ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* LTF Card */}
                    <Link to="/funds/ltf" className="group bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:border-blue-200 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <BarChart3 size={140} className="text-blue-600" />
                        </div>
                        <div className="relative">
                            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <BarChart3 size={28} />
                            </div>
                            <h2 className="text-3xl font-bold mb-3 text-slate-900">LTF Dashboard</h2>
                            <p className="text-slate-500 mb-6 text-base">Long Term Equity Funds. Historical tracking.</p>

                            <div className="flex items-center justify-between text-sm py-3 border-t border-slate-100">
                                <span className="text-slate-400">Funds</span>
                                <span className="font-bold text-slate-800">{stats.ltf > 0 ? stats.ltf : 'Loading...'}</span>
                            </div>
                            <div className="flex items-center text-blue-600 font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                                Launch <ArrowRight size={18} className="ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* Thai Tax 2568 Card */}
                    <a href="/ThaiTax2568.html" target="_blank" rel="noopener noreferrer" className="group bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:border-red-200 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Calculator size={140} className="text-red-600" />
                        </div>
                        <div className="relative">
                            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <Calculator size={28} />
                            </div>
                            <h2 className="text-3xl font-bold mb-3 text-slate-900">Thai Tax 2568</h2>
                            <p className="text-slate-500 mb-6 text-base">Wht Tax & Tax Saving Planner 2568.</p>

                            <div className="flex items-center justify-between text-sm py-3 border-t border-slate-100">
                                <span className="text-slate-400">Status</span>
                                <span className="font-bold text-slate-800">Active</span>
                            </div>
                            <div className="flex items-center text-red-600 font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                                Open Calculator <ArrowRight size={18} className="ml-1" />
                            </div>
                        </div>
                    </a>

                </div>
            </section>
        </div>
    );
};

export default LandingPage;
