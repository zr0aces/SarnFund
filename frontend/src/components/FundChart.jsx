import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { isValidNumber } from '../utils/number';

const CustomTooltip = ({ active, payload, label, AMC_COLORS }) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        const val = item.value;
        const isPos = typeof val === 'number' && val >= 0;
        const amc = item.payload.amc;
        const amcColor = AMC_COLORS[amc] || AMC_COLORS['All'] || '#38BDF8';
        return (
            <div className="bg-slate-950/95 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl p-3 font-sans min-w-[180px]">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-display font-extrabold text-white text-xs truncate max-w-[140px]">
                        {label}
                    </span>
                    {amc && (
                        <span 
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: amcColor }}
                        >
                            {amc}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-3 font-mono text-xs pt-1.5 border-t border-white/10">
                    <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Return</span>
                    <span className={`font-bold text-xs ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {typeof val === 'number' ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '—'}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

const renderBarLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (typeof value !== 'number') return null;
    const isPos = value >= 0;
    const fill = isPos ? '#34D399' : '#F43F5E';
    return (
        <text 
            x={x + width + 8} 
            y={y + height / 2} 
            fill={fill} 
            textAnchor="start" 
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fontFamily="JetBrains Mono, monospace"
        >
            {isPos ? '+' : ''}{value.toFixed(1)}%
        </text>
    );
};

const FundChart = ({ funds, sortBy, showNewOnly, getSortLabel, AMC_COLORS }) => {

    const chartData = useMemo(() => {
        const metric = showNewOnly ? 'ytd' : sortBy;
        // The current SEC snapshot uses zero as the missing-performance sentinel.
        const validFunds = funds.filter(f => isValidNumber(f[metric]) && f[metric] !== 0);

        return validFunds.slice(0, 10).map(f => {
            const hasDistinctClass = f.class && f.class !== f.code && !f.code.includes(f.class);
            return {
                name: hasDistinctClass ? `${f.code} (${f.class})` : f.code,
                return: f[metric],
                amc: f.amc,
                isNew: f.isNew
            };
        });
    }, [funds, showNewOnly, sortBy]);

    if (chartData.length === 0) return null;

    return (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 mb-8 font-sans">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base sm:text-lg font-display font-extrabold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Top 10 Performance Radar
                    <span className="text-slate-400 font-mono font-normal text-xs ml-1">
                        ({showNewOnly ? 'YTD' : getSortLabel(sortBy)})
                    </span>
                </h3>
            </div>
            <div className="h-56 sm:h-72 lg:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.08)" />
                        <XAxis 
                            type="number" 
                            unit="%" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                        />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={115} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 600, fontFamily: 'Kanit' }} 
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                            content={<CustomTooltip AMC_COLORS={AMC_COLORS} />}
                        />
                        <Bar dataKey="return" radius={[0, 6, 6, 0]} barSize={26}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={AMC_COLORS[entry.amc] || AMC_COLORS['All']} />
                            ))}
                            <LabelList dataKey="return" content={renderBarLabel} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FundChart;
