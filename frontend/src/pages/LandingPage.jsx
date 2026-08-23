import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  ArrowRight, 
  ShieldCheck, 
  Calculator, 
  Activity, 
  Sparkles, 
  Database,
  ExternalLink,
  Layers,
  Zap,
  Lock
} from 'lucide-react';
import tipsData from '../data/tips.json';
import { FUND_CATEGORIES } from '../config/fundCategories';

const TAX_TIPS = tipsData.general;

const LandingPage = () => {
  const [stats, setStats] = useState({ rmf: 0, esg: 0, esgx: 0, ssf: 0, etf: 0 });
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  const [shuffledTips, setShuffledTips] = useState(() => 
    [...TAX_TIPS].sort(() => Math.random() - 0.5).slice(0, 3)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setShuffledTips([...TAX_TIPS].sort(() => Math.random() - 0.5).slice(0, 3));
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const result = await response.json();
        if (result.success) {
          if (result.stats) setStats(result.stats);
          if (result.metrics) setMetrics(result.metrics);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalFundsCount = Object.values(stats).reduce((a, b) => a + b, 0);
  const categories = Object.values(FUND_CATEGORIES);

  const cardsData = [
    ...categories.map((cat) => ({
      id: cat.id,
      type: 'internal',
      path: cat.path,
      badge: cat.badge,
      icon: cat.icon,
      title: cat.title,
      desc: cat.description,
      colorClass: cat.theme.text,
      badgeClass: cat.theme.badgeBg,
      iconBgClass: cat.theme.iconBg,
      glowClass: cat.theme.glow,
      accentColor: cat.accentColor,
      count: stats[cat.id] || 0,
      metric: metrics[cat.id] || null
    })),
    {
      id: 'tax',
      type: 'external',
      path: '/ThaiTax2569.html',
      badge: 'TAX ENGINE 2569',
      icon: Calculator,
      title: 'Thai Tax Calculator 2569',
      desc: 'Dynamic tax bracket planner, withholding rate optimizer, and deduction limit projector.',
      colorClass: 'text-rose-400',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      iconBgClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glowClass: 'hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
      accentColor: '#F43F5E',
      count: 'Active',
      metric: null
    }
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col lg:flex-row bg-[#090D16] bg-radial-mesh text-slate-100 p-4 sm:p-6 lg:p-8 gap-6 relative overflow-y-auto lg:overflow-hidden font-sans">
      
      {/* Background Grid Layer */}
      <div className="absolute inset-0 bg-telemetry-grid pointer-events-none opacity-40"></div>

      {/* Left Panel: Sidebar Telemetry Hub */}
      <aside className="lg:w-1/4 flex flex-col justify-between glass-panel rounded-3xl p-5 sm:p-6 relative overflow-hidden shrink-0 shadow-2xl z-10">

        {/* Ambient Glow Blob */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Logo & Tag Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
              <Trophy size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-semibold text-emerald-400 tracking-wider uppercase">
                <ShieldCheck size={12} className="text-emerald-400" /> SEC Open API v2
              </div>
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-white mt-1">
                SarnFund
              </h1>
            </div>
          </div>

          <h2 className="hidden lg:block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
            {'//'} Telemetry Console
          </h2>

          <p className="hidden lg:block text-slate-400 text-xs leading-relaxed mb-6">
            Real-time mutual fund telemetry console for Thai tax-saving investments (RMF, ThaiESG, SSF, ETF) across 18 Asset Management Companies.
          </p>

          <div className="h-px bg-white/10 my-4 lg:my-6" />

          {/* Stats Counters */}
          <div className="flex lg:flex-col gap-2.5">
            <div className="flex flex-1 lg:flex-none items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <Database size={14} />
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline font-mono">Tracked Funds</span>
              </div>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {loading ? '...' : totalFundsCount}
              </span>
            </div>

            <div className="flex flex-1 lg:flex-none items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <Activity size={14} />
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline font-mono">SEC Data Feed</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Live 24h</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <Layers size={14} />
                </div>
                <span className="text-xs text-slate-400 font-mono">AMCs Covered</span>
              </div>
              <span className="text-sm font-mono font-bold text-cyan-400">18 AMCs</span>
            </div>
          </div>
        </div>

        {/* Tax Tips Carousel Box */}
        <div className="hidden lg:block mt-6 p-4 rounded-2xl bg-slate-900/80 border border-white/10 relative overflow-hidden shrink-0">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} className="animate-pulse" />
            Quick Planner Telemetry
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1.5 custom-scrollbar">
            {shuffledTips.map((tip, idx) => (
              <div key={idx} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                <span className="text-amber-400 font-mono font-bold shrink-0">0{idx + 1}.</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Area: 6-Card Category Matrix */}
      <main className="lg:w-3/4 flex flex-col justify-between h-full z-10 gap-4">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between gap-3 shrink-0 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-base sm:text-xl font-display font-extrabold tracking-wide text-white">
                Market Telemetry Console
              </h2>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
              Select an asset category to inspect live NAV data, AMC statistics, and tax allowances.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 flex items-center gap-2">
              <Zap size={13} className="text-amber-400" />
              <span>SEC API v2</span>
            </div>
          </div>
        </header>

        {/* 6-Card Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 flex-grow min-h-0">

          {cardsData.map((card) => {
            const CardWrapper = card.type === 'internal' ? Link : 'a';
            const extraProps = card.type === 'external'
              ? { href: card.path, target: '_blank', rel: 'noopener noreferrer' }
              : { to: card.path };

            return (
              <CardWrapper
                key={card.id}
                {...extraProps}
                className={`group flex flex-col justify-between p-5 glass-panel glass-panel-hover rounded-3xl overflow-hidden relative shadow-lg ${card.glowClass}`}
              >
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border leading-tight ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                  <div className={`p-2.5 rounded-2xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300 ${card.iconBgClass} shrink-0`}>
                    <card.icon size={18} className="stroke-[2.2]" />
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-display font-extrabold text-white mb-1 group-hover:text-emerald-300 transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                </div>

                {/* Real Performance Telemetry Pill & Mini-Bar Indicator (Option 3) */}
                {card.id !== 'tax' ? (
                  <div className="my-2.5 p-2.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-3">
                    {/* Top Fund and Avg Stats */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Top ({card.metric?.metricLabel || '1Y'}):
                        </span>
                        <span className="text-xs font-display font-extrabold text-white truncate max-w-[120px]">
                          {card.metric?.topFund ? card.metric.topFund.code : '—'}
                        </span>
                        {card.metric?.topFund && typeof card.metric.topFund.returnVal === 'number' && (
                          <span className={`text-xs font-mono font-bold ${card.metric.topFund.returnVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {card.metric.topFund.returnVal > 0 ? '+' : ''}{card.metric.topFund.returnVal.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Avg: <strong className={card.metric?.avgReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{card.metric?.avgReturn ? `${card.metric.avgReturn > 0 ? '+' : ''}${card.metric.avgReturn.toFixed(1)}%` : '—'}</strong></span>
                        {card.metric?.topFund?.amc && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                            {card.metric.topFund.amc}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mini-Bar Visual Spectrum */}
                    <div className="flex items-end gap-1 h-7 px-1 shrink-0">
                      {card.metric?.trendBars?.length ? (
                        card.metric.trendBars.map((val, bIdx) => {
                          const maxVal = Math.max(...card.metric.trendBars.map(Math.abs), 1);
                          const heightPct = Math.max(Math.min((Math.abs(val) / maxVal) * 100, 100), 20);
                          return (
                            <div
                              key={bIdx}
                              title={`Rank ${bIdx + 1}: ${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
                              className="w-1.5 rounded-t-sm transition-all duration-300 group-hover:scale-y-110 origin-bottom"
                              style={{
                                height: `${heightPct}%`,
                                backgroundColor: card.accentColor,
                                opacity: 0.4 + (0.6 * (1 - bIdx / card.metric.trendBars.length))
                              }}
                            />
                          );
                        })
                      ) : (
                        <div className="flex items-end gap-1 h-full opacity-30">
                          <div className="w-1.5 h-3 rounded-t-sm bg-slate-600" />
                          <div className="w-1.5 h-5 rounded-t-sm bg-slate-600" />
                          <div className="w-1.5 h-4 rounded-t-sm bg-slate-600" />
                          <div className="w-1.5 h-6 rounded-t-sm bg-slate-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Tax Engine Telemetry Pill */
                  <div className="my-2.5 p-2.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                          Tax Year 2569:
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          Max Cap 800k THB
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        500k Retirement + 300k ThaiESG
                      </div>
                    </div>

                    {/* Mini Tax Bracket Progression Visualizer */}
                    <div className="flex items-end gap-1 h-7 px-1 shrink-0">
                      {[5, 10, 15, 20, 25, 30, 35].map((rate, rIdx) => (
                        <div
                          key={rIdx}
                          title={`Bracket: ${rate}%`}
                          className="w-1 rounded-t-sm bg-rose-400 transition-all duration-300 group-hover:scale-y-110 origin-bottom"
                          style={{
                            height: `${(rate / 35) * 100}%`,
                            opacity: 0.35 + (rIdx / 7) * 0.65
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Bar: Count & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                      {card.id === 'tax' ? 'Status' : 'Available Funds'}
                    </span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5">
                      {loading && card.id !== 'tax' ? (
                        <span className="inline-block w-8 h-3 bg-slate-800 rounded animate-pulse"></span>
                      ) : (
                        card.count
                      )}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold group-hover:translate-x-1 transition-transform ${card.colorClass}`}>
                    {card.type === 'external' ? 'Launch' : 'Inspect'}
                    {card.type === 'external' ? <ExternalLink size={12} /> : <ArrowRight size={12} />}
                  </span>
                </div>
              </CardWrapper>
            );
          })}
        </div>

        {/* Footer Bar */}
        <footer className="text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row justify-between items-center border-t border-white/10 pt-3 gap-2 shrink-0">
          <p>&copy; {new Date().getFullYear()} SarnFund Thai Mutual Fund Analytics Console.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
              <Lock size={10} className="text-emerald-400" /> SEC Open API v2 Direct
            </span>
            <span>&middot;</span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">Zero-Downtime Key Failover</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
