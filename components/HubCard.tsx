import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import Sparkline from './Sparkline';

interface HubCardProps {
    title: string;
    path: string;
    icon: React.ReactNode;
    stats: { label: string; value: number | string; icon: React.ReactNode }[];
    color: string;
    accent: string;
    textColor: string;
    chartData: number[];
    chartColor: string;
}

const HubCard: React.FC<HubCardProps> = ({ title, path, icon, stats, color, accent, textColor, chartData, chartColor }) => (
    <Link to={path} className={`wood-panel p-4 rounded-[24px] border-2 ${accent} ${color} shadow-lg hover:translate-y-[-4px] transition-all group flex flex-col h-full relative overflow-hidden`}>
        <div className={`w-10 h-10 rounded-xl ${accent} border flex items-center justify-center ${textColor} mb-3 group-hover:scale-110 transition-transform shadow-sm bg-white flex-shrink-0`}>
            {icon}
        </div>

        <div className="flex-1 space-y-2 relative z-10">
            <div className="flex justify-between items-start">
                <h2 className="text-base font-black text-[#5d2e0a] tracking-tight truncate">{title}</h2>
                <TrendingUp size={12} className={`${textColor} opacity-40`} />
            </div>

            <div className="bg-white/30 rounded-lg p-1.5 border border-black/5">
                <Sparkline data={chartData} color={chartColor} />
            </div>

            <div className="space-y-1">
                {stats.map((s, i) => (
                    <div key={i} className={`flex justify-between items-center px-2 py-1 rounded bg-white/50 border border-transparent`}>
                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-tighter opacity-70">
                            {s.icon} {s.label}
                        </div>
                        <span className={`text-xs font-black text-[#5d2e0a]`}>{s.value}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-widest border-t border-[#c9a688]/20 pt-2 relative z-10">
            <span>Acessar</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
    </Link>
);

export default HubCard;
