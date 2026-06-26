import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Leaf, 
  Sprout, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  Calculator, 
  Wallet, 
  Activity, 
  Sparkles, 
  Database,
  ExternalLink
} from 'lucide-react';

const TAX_TIPS = [
  "RMF: Max deduction up to 30% of taxable income, capped at 500k Baht.",
  "ThaiESG: Max deduction up to 30% of taxable income, capped at 300k Baht.",
  "Solar Rooftop 2569: New deduction up to 200k Baht for on-grid home solar installation.",
  "Combine RMF + Provident Fund + Pension Insurance capped at 500k Baht total.",
  "ThaiESG has its own separate limit of 300k Baht (not in the 500k cap)!",
  "Thai Tax 2569: Thai ESG วงเงิน 300k สุดท้าย — ลดเหลือ 100k ปี 2570!",
  "SSF: Purchases are discontinued starting 2025. Existing holdings must still be held for 10 full years.",
  "ETF: Buy and sell directly on the stock exchange during trading hours. No holding lockups apply.",
  "e-Donation: Double deduction (200%) for educational and hospital donations, verified via EDOC.",
  "Solar Rooftop: Save on electricity and get up to 200k Baht tax deduction for home installations in 2569."
];

const LandingPage = () => {
  const [stats, setStats] = useState({ rmf: 0, esg: 0, esgx: 0, ssf: 0, etf: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [fadeTip, setFadeTip] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Cycle tips with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeTip(true);
      setTimeout(() => {
        setActiveTipIndex((prev) => (prev + 1) % TAX_TIPS.length);
        setFadeTip(false);
      }, 300);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const totalFundsCount = Object.values(stats).reduce((a, b) => a + b, 0);

  const cardsData = [
    {
      id: 'rmf',
      type: 'internal',
      path: '/funds/rmf',
      badge: 'RETIREMENT ALLOWANCE',
      icon: BarChart3,
      title: 'RMF Analytics',
      desc: 'Retirement Mutual Funds. Tax benefits with long-term compound growth.',
      sparklineD: 'M0,20 Q15,8 30,16 T60,6 T90,12 T100,2',
      colorClass: 'text-orange-600',
      badgeClass: 'text-orange-700 bg-orange-50 border-orange-100',
      iconBgClass: 'bg-orange-50/80 border-orange-100 text-orange-600',
      glowClass: 'hover:border-orange-300 hover:shadow-[0_8px_30px_rgba(249,115,22,0.06)]',
      count: stats.rmf
    },
    {
      id: 'esg',
      type: 'internal',
      path: '/funds/thaiesg',
      badge: 'SUSTAINABILITY ALLOWANCE',
      icon: Leaf,
      title: 'ThaiESG Console',
      desc: 'Sustainable Equity Portfolios. Combine ESG alignment with tax savings.',
      sparklineD: 'M0,24 Q12,18 24,26 T48,16 T72,20 T86,10 T100,4',
      colorClass: 'text-emerald-600',
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      iconBgClass: 'bg-emerald-50/80 border-emerald-100 text-emerald-600',
      glowClass: 'hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.06)]',
      count: stats.esg
    },
    {
      id: 'ssf',
      type: 'internal',
      path: '/funds/ssf',
      badge: 'MEDIUM-TERM SAVINGS',
      icon: Wallet,
      title: 'SSF Dashboard',
      desc: 'Super Savings Funds. Flexible mutual funds with 10-year holding term.',
      sparklineD: 'M0,28 L15,22 L30,25 L45,16 L60,19 L75,9 L90,14 L100,4',
      colorClass: 'text-purple-600',
      badgeClass: 'text-purple-700 bg-purple-50 border-purple-100',
      iconBgClass: 'bg-purple-50/80 border-purple-100 text-purple-600',
      glowClass: 'hover:border-purple-300 hover:shadow-[0_8px_30px_rgba(168,85,247,0.06)]',
      count: stats.ssf
    },
    {
      id: 'esgx',
      type: 'internal',
      path: '/funds/thaiesgx',
      badge: 'ESG EXTRA ALLOWANCE',
      icon: Sprout,
      title: 'ThaiESGX Extra',
      desc: 'Thai ESG Extra tier tracker. Shorter lockups for ESG-focused investing.',
      sparklineD: 'M0,25 Q20,22 40,12 T80,8 T100,3',
      colorClass: 'text-cyan-600',
      badgeClass: 'text-cyan-700 bg-cyan-50 border-cyan-100',
      iconBgClass: 'bg-cyan-50/80 border-cyan-100 text-cyan-600',
      glowClass: 'hover:border-cyan-300 hover:shadow-[0_8px_30px_rgba(6,182,212,0.06)]',
      count: stats.esgx
    },
    {
      id: 'etf',
      type: 'internal',
      path: '/funds/etf',
      badge: 'EXCHANGE TRADED',
      icon: TrendingUp,
      title: 'ETF Tracker',
      desc: 'Exchange Traded Funds. Tracking indexes and key sectors on SET.',
      sparklineD: 'M0,15 L12,24 L24,10 L36,22 L48,6 L60,16 L72,4 L84,20 L96,8 L100,2',
      colorClass: 'text-amber-600',
      badgeClass: 'text-amber-800 bg-amber-50 border-amber-100',
      iconBgClass: 'bg-amber-50/80 border-amber-100 text-amber-600',
      glowClass: 'hover:border-amber-300 hover:shadow-[0_8px_30px_rgba(245,158,11,0.06)]',
      count: stats.etf
    },
    {
      id: 'tax',
      type: 'external',
      path: '/ThaiTax2569.html',
      badge: 'TAX ENGINE',
      icon: Calculator,
      title: 'Tax Planner 2569',
      desc: 'Optimize your withholding rates and project tax deductions dynamically.',
      sparklineD: 'M0,26 L20,26 L20,18 L50,18 L50,11 L80,11 L80,4 L100,4',
      colorClass: 'text-rose-600',
      badgeClass: 'text-rose-700 bg-rose-50 border-rose-100',
      iconBgClass: 'bg-rose-50/80 border-rose-100 text-rose-600',
      glowClass: 'hover:border-rose-300 hover:shadow-[0_8px_30px_rgba(244,63,94,0.06)]',
      count: 'Active'
    }
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col lg:flex-row bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8 gap-6 relative overflow-y-auto lg:overflow-hidden font-sans">
      
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-60"></div>

      {/* Left Panel: Brand & Info (1/4 Width on Desktop, compact strip on mobile) */}
      <aside className="lg:w-1/4 flex flex-col justify-between bg-white border border-transparent rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-sm z-10 shrink-0">

        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Logo & Tag */}
          <div className="flex items-center gap-3 mb-4 lg:mb-6">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20">
              <Trophy size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/60 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                <ShieldCheck size={11} className="text-orange-600" /> ZeroTrust Secure
              </div>
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-slate-900 mt-0.5">
                SarnFund
              </h1>
            </div>
          </div>

          <h2 className="hidden lg:block text-xl font-display font-bold text-slate-800 mb-3 tracking-wide">
            Portfolio Hub
          </h2>

          {/* Description — hidden on mobile to save vertical space */}
          <p className="hidden lg:block text-slate-500 text-sm leading-relaxed mb-6">
            Real-time visual monitoring console for Thai tax-saving and exchange-traded mutual funds. Driven by open SEC datasets.
          </p>

          <hr className="border-slate-100 my-3 lg:my-5" />

          {/* Stats Summary — compact row on mobile */}
          <div className="flex lg:flex-col gap-2 lg:space-y-0 lg:gap-0 lg:space-y-4">
            <div className="flex flex-1 lg:flex-none items-center justify-between p-2.5 lg:p-3 rounded-xl bg-slate-50/50 border border-transparent">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500 hidden sm:inline">Tracked Funds</span>
              </div>
              <span className="text-sm font-display font-bold text-orange-600">
                {loading ? '...' : totalFundsCount}
              </span>
            </div>

            <div className="flex flex-1 lg:flex-none items-center justify-between p-2.5 lg:p-3 rounded-xl bg-slate-50/50 border border-transparent">
              <div className="flex items-center gap-2 font-medium">
                <Activity size={14} className="text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500 hidden sm:inline">SEC API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-xs font-semibold text-emerald-600">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Tip — hidden on mobile, visible on desktop */}
        <div className="hidden lg:block mt-8 lg:mt-0 p-4 rounded-2xl bg-slate-50/60 border border-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Sparkles size={40} className="text-orange-500" />
          </div>
          <div className="flex items-center gap-1.5 text-orange-600/90 text-xs font-display font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            Quick Planner Tip
          </div>
          <div className={`text-xs text-slate-600 leading-relaxed min-h-[48px] transition-opacity duration-300 ${fadeTip ? 'opacity-0' : 'opacity-100'}`}>
            {TAX_TIPS[activeTipIndex]}
          </div>
        </div>
      </aside>

      {/* Right Area: Main Grid Container (3/4 Width on Desktop) */}
      <main className="lg:w-3/4 flex flex-col justify-between h-full z-10 gap-4">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between gap-3 shrink-0 pb-1 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-lg font-display font-bold tracking-wide text-slate-800">
              Analytics Console
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              Select an asset category to review NAV performance, AMC stats, and risk tiers.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200/60 shrink-0">
            <span className="text-slate-700 font-medium">Synced</span>
          </div>
        </header>

        {/* 6-Card Dashboard Grid — 2 cols on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-3 sm:gap-4 flex-grow min-h-0">

          {cardsData.map((card) => {
            const CardWrapper = card.type === 'internal' ? Link : 'a';
            const extraProps = card.type === 'external'
              ? { href: card.path, target: '_blank', rel: 'noopener noreferrer' }
              : { to: card.path };

            return (
              <CardWrapper
                key={card.id}
                {...extraProps}
                className={`group flex flex-col justify-between p-3 sm:p-5 bg-white border border-transparent hover:-translate-y-0.5 hover:shadow-md rounded-2xl transition-all duration-300 overflow-hidden relative shadow-sm ${card.glowClass}`}
              >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent pointer-events-none rounded-bl-full"></div>

                {/* Top: Badge + Icon */}
                <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                  <span className={`text-[8px] sm:text-[9px] font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded border leading-tight ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                  <div className={`p-1.5 sm:p-2 rounded-xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300 bg-white ${card.iconBgClass} shrink-0`}>
                    <card.icon size={16} className="stroke-[2] sm:w-[18px] sm:h-[18px]" />
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm sm:text-lg font-display font-bold text-slate-800 mb-0.5 sm:mb-1 group-hover:text-slate-900 transition-colors leading-tight">
                    {card.title}
                  </h3>
                  {/* Description hidden on mobile — too small for 2-col cards */}
                  <p className="hidden sm:block text-slate-500 text-xs leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                </div>

                {/* Sparkline */}
                <div className="my-1.5 sm:my-2.5">
                  <svg className="w-full h-6 sm:h-8 stroke-current opacity-80 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 100 30" fill="none">
                    <path
                      d={card.sparklineD}
                      className={`${card.colorClass} animate-sparkline`}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Bottom: Count + CTA */}
                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-100 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium uppercase tracking-wider leading-tight">
                      {card.id === 'tax' ? 'Status' : 'Funds'}
                    </span>
                    <span className="text-xs font-display font-semibold text-slate-700 mt-0.5">
                      {loading && card.id !== 'tax' ? (
                        <span className="inline-block w-6 h-3 bg-slate-100 rounded animate-pulse"></span>
                      ) : (
                        card.count
                      )}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-bold group-hover:underline ${card.colorClass}`}>
                    {card.type === 'external' ? 'Open' : 'View'}
                    {card.type === 'external' ? <ExternalLink size={11} /> : <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />}
                  </span>
                </div>
              </CardWrapper>
            );
          })}
        </div>

        {/* Small Footer Bar inside viewport */}
        <footer className="text-[11px] text-slate-400 flex justify-between items-center border-t border-slate-100 pt-2 shrink-0">
          <p>&copy; {new Date().getFullYear()} SarnFund Investment Instruments. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Security Protocol TLS 1.3</span>
            <span>&middot;</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Data: SEC Sandbox</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;

