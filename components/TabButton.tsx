import React from 'react';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${active ? 'grass-bg text-white shadow-md' : 'text-[#5d2e0a] hover:bg-[#d2b48c]'
            }`}
    >
        {icon} {label}
    </button>
);

export default TabButton;
