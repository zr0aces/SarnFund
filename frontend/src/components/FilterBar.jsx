import React from 'react';
import { TrendingUp } from 'lucide-react';
import { FUND_TYPES, TIMEFRAMES } from '../utils/constants';

const FilterBar = ({ selectedType, setSelectedType, selectedTimeframe, setSelectedTimeframe }) => {
    return (
        <>
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
                {FUND_TYPES.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${selectedType === type
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-2 px-2 text-xs font-bold text-slate-400 uppercase">
                    <TrendingUp size={12} /> Sort By
                </div>
                <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    {TIMEFRAMES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>
        </>
    );
};

export default FilterBar;
