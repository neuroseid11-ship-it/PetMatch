import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, children, className = '' }) => {
    return (
        <header className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-[#c9a688] pb-4 ${className}`}>
            <div>
                <div className="flex items-center gap-3 mb-2">
                    {icon && (
                        <div className="grass-bg p-2 rounded-xl shadow-md">
                            <div className="text-white w-6 h-6">
                                {icon}
                            </div>
                        </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-black text-[#5d2e0a] tracking-tight uppercase leading-none">{title}</h1>
                </div>
                {subtitle && <p className="text-[#8b4513] font-medium italic text-sm md:text-base">{subtitle}</p>}
            </div>

            {children && (
                <div className="flex flex-wrap gap-3">
                    {children}
                </div>
            )}
        </header>
    );
};

export default PageHeader;
