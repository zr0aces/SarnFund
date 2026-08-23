import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { isValidNumber } from '../utils/number';

const FundChart = ({ funds, sortBy, showNewOnly, getSortLabel, AMC_COLORS }) => {

    const chartData = useMemo(() => {
        const metric = showNewOnly ? 'ytd' : sortBy;
        const validFunds = funds.filter(f => isValidNumber(f[metric]));

        return validFunds.slice(0, 10).map(f => ({
            name: f.class ? `${f.code} (${f.class})` : f.code,
            return: f[metric],
            amc: f.amc,
            isNew: f.isNew
        }));
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
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 24, left: 10, bottom: 5 }}>
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
                            width={100} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 600, fontFamily: 'Kanit' }} 
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                            contentStyle={{ 
                                backgroundColor: 'rgba(15, 22, 38, 0.95)', 
                                backdropFilter: 'blur(12px)',
                                borderRadius: '16px', 
                                border: '1px solid rgba(255, 255, 255, 0.15)', 
                                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
                                color: '#F8FAFC',
                                fontFamily: 'Prompt',
                                padding: '10px 14px'
                            }}
                            formatter={(value) => [`${value.toFixed(2)}%`, `Return`]}
                        />
                        <Bar dataKey="return" radius={[0, 6, 6, 0]} barSize={26}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={AMC_COLORS[entry.amc] || AMC_COLORS['All']} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FundChart;
