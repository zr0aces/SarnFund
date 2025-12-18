import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Leaf, ArrowRight, ShieldCheck, BarChart3 } from 'lucide-react';
import { INITIAL_RMF, INITIAL_ESG } from '../data/funds';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            {/* Hero Section */}
            <header className="bg-slate-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/50 to-transparent pointer-events-none"></div>
                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-sm mb-6">
                        <ShieldCheck size={16} /> ZeroTrust Investment Tools
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Fund Analytics</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Real-time tracking for Tax Saving Funds. Compare RMF and ThaiESG performance with zero-trust transparency.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/funds/rmf" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2">
                            <Trophy size={20} /> Explore RMF
                        </Link>
                        <Link to="/funds/thaiesg" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                            <Leaf size={20} /> Explore ThaiESG
                        </Link>
                    </div>
                </div>
            </header>

            {/* Dashboard Previews */}
            <section className="container mx-auto px-4 -mt-10 pb-20 relative z-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">

                    {/* RMF Card */}
                    <Link to="/funds/rmf" className="group bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:border-indigo-200 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Trophy size={100} className="text-indigo-600" />
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <BarChart3 size={20} />
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-slate-900">RMF Dashboard</h2>
                            <p className="text-slate-500 mb-4 text-sm">Retirement Mutual Funds. Long-term tracking.</p>

                            <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100">
                                <span className="text-slate-400">Funds</span>
                                <span className="font-bold text-slate-800">{INITIAL_RMF.length}+</span>
                            </div>
                            <div className="flex items-center text-indigo-600 font-medium text-xs mt-3 group-hover:gap-2 transition-all">
                                Launch <ArrowRight size={14} className="ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* ThaiESG Card */}
                    <Link to="/funds/thaiesg" className="group bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:border-emerald-200 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Leaf size={100} className="text-emerald-600" />
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Leaf size={20} />
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-slate-900">ThaiESG</h2>
                            <p className="text-slate-500 mb-4 text-sm">Sustainable Equity Funds. Tax saving + ESG.</p>

                            <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100">
                                <span className="text-slate-400">Funds</span>
                                <span className="font-bold text-slate-800">{INITIAL_ESG.length}+</span>
                            </div>
                            <div className="flex items-center text-emerald-600 font-medium text-xs mt-3 group-hover:gap-2 transition-all">
                                Launch <ArrowRight size={14} className="ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* LTF Card */}
                    <Link to="/funds/ltf" className="group bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:border-blue-200 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <BarChart3 size={100} className="text-blue-600" />
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <BarChart3 size={20} />
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-slate-900">LTF Dashboard</h2>
                            <p className="text-slate-500 mb-4 text-sm">Long Term Equity Funds. Historical tracking.</p>

                            <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100">
                                <span className="text-slate-400">Funds</span>
                                <span className="font-bold text-slate-800">70+</span>
                            </div>
                            <div className="flex items-center text-blue-600 font-medium text-xs mt-3 group-hover:gap-2 transition-all">
                                Launch <ArrowRight size={14} className="ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* SSF Card */}
                    <Link to="/funds/ssf" className="group bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:border-purple-200 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Leaf size={100} className="text-purple-600" />
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Leaf size={20} />
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-slate-900">SSF Dashboard</h2>
                            <p className="text-slate-500 mb-4 text-sm">Super Savings Funds. Long term savings.</p>

                            <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100">
                                <span className="text-slate-400">Funds</span>
                                <span className="font-bold text-slate-800">350+</span>
                            </div>
                            <div className="flex items-center text-purple-600 font-medium text-xs mt-3 group-hover:gap-2 transition-all">
                                Launch <ArrowRight size={14} className="ml-1" />
                            </div>
                        </div>
                    </Link>

                </div>
            </section>

            <footer className="py-8 text-center text-slate-400 text-sm">
                <p>&copy; {new Date().getFullYear()} ZeroTrust Investment Tools</p>
            </footer>
        </div>
    );
};

export default LandingPage;
