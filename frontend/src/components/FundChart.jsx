import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FundChart = ({ funds, sortBy, showNewOnly, getSortLabel, AMC_COLORS }) => {

    const chartData = useMemo(() => {
        // Filter out funds with undefined metrics for the chart to avoid errors
        const metric = showNewOnly ? 'ytd' : sortBy;
        const validFunds = funds.filter(f => f[metric] !== undefined);

        return validFunds.slice(0, 10).map(f => ({
            name: f.code,
            return: f[metric],
            amc: f.amc,
            isNew: f.isNew
        }));
    }, [funds, showNewOnly, sortBy]);

    if (chartData.length === 0) return null;

    return (
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">
                    Top 10 Performance <span className="text-slate-400 font-normal text-sm">({showNewOnly ? 'Based on YTD' : getSortLabel(sortBy)})</span>
                </h3>
            </div>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" unit="%" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [`${value.toFixed(2)}%`, `Return`]}
                        />
                        <Bar dataKey="return" radius={[0, 4, 4, 0]} barSize={28}>
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
