import React from 'react';
import { Database, Clock } from 'lucide-react';

const SourceBadge = ({ source, timestamp }) => {
    let colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
    let icon = <Database size={12} />;
    let text = 'N/A';

    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString() : '';

    if (source === 'live') {
        colorClass = 'bg-green-50 border-green-200 text-green-700';
        text = 'SEC API Live';
    } else if (source === 'cached' || source === 'expired') {
        colorClass = 'bg-blue-50 border-blue-200 text-blue-700';
        text = `Cached (${timeStr})`;
        icon = <Clock size={12} />;

        if (source === 'expired') {
            colorClass = 'bg-yellow-50 border-yellow-200 text-yellow-700';
            text = `Expired (${timeStr})`;
        }
    } else {
        colorClass = 'bg-orange-50 border-orange-200 text-orange-700';
        text = 'Simulation/Mock';
    }

    return (
        <div className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border ${colorClass}`}>
            {icon}
            <span className="hidden sm:inline">{text}</span>
            <span className="sm:hidden">{source}</span>
        </div>
    );
};

export default SourceBadge;
