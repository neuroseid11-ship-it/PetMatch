import React from 'react';

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
    <div className="wood-panel p-6 rounded-3xl border-2 border-[#c9a688] shadow-md flex items-center gap-4 relative overflow-hidden group">
        <div className={`p-3 rounded-2xl bg-[#f1dfcf] ${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-[#8b4513] uppercase tracking-tighter">{label}</p>
            <h3 className="text-3xl font-black text-[#5d2e0a]">{value}</h3>
        </div>
        <div className="absolute top-0 right-0 w-12 h-12 grass-bg opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
    </div>
);

export default StatCard;
