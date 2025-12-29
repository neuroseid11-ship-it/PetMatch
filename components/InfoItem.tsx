import React from 'react';

interface InfoItemProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => (
    <div className="wood-inner p-3 border border-[#c9a688]/30">
        <p className="text-[9px] font-black text-[#8b4513] uppercase opacity-60 flex items-center gap-1">
            {icon} {label}
        </p>
        <p className="text-sm font-black text-[#5d2e0a]">{value}</p>
    </div>
);

export default InfoItem;
