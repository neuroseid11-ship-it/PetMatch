import React from 'react';

interface HealthCardProps {
    label: string;
    status: string;
}

const HealthCard: React.FC<HealthCardProps> = ({ label, status }) => (
    <div className="wood-panel p-4 rounded-2xl border-2 border-[#c9a688] flex flex-col items-center justify-center text-center gap-1 hover:bg-[#d2b48c] transition-colors">
        <p className="text-[10px] font-black text-[#5d2e0a] uppercase">{label}</p>
        <span className="text-[8px] font-bold text-[#8b4513] bg-[#f1dfcf] px-2 py-0.5 rounded-full border border-[#c9a688]">{status}</span>
    </div>
);

export default HealthCard;
