import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { TIMEFRAMES } from '../utils/constants';

const FundChart = ({ data, timeframe, colors }) => {

    const getTimeframeLabel = (key) => {
        const found = TIMEFRAMES.find(t => t.value === key);
        return found ? found.label : key;
    };

    const getReturnColor = (val) => {
        if (val > 0) return 'text-green-600';
        if (val < 0) return 'text-red-600';
        return 'text-slate-500';
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg z-50">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[d.amc] || colors['OTHER'] }}></span>
                        <p className="font-bold text-slate-800">{d.proj_abbr_name}</p>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 max-w-[200px] truncate">{d.proj_name_th}</p>
                    <p className={`text-sm font-mono font-bold ${getReturnColor(d[timeframe])}`}>
                        Return: {d[timeframe] > 0 ? '+' : ''}{d[timeframe]}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // Determine colors for legend/mapping
    // const top5AMCs = Object.entries(colors).slice(0, 5);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 size={20} className="text-orange-600" />
                    Top 10 Funds ({getTimeframeLabel(timeframe)})
                </h3>
            </div>
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" unit="%" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis
                            dataKey="proj_abbr_name"
                            type="category"
                            width={100}
                            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fff7ed' }} />
                        <Bar dataKey={timeframe} radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[entry.amc] || colors['OTHER']}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FundChart;
