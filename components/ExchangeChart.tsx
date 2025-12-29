import React from 'react';

const ExchangeChart = ({ data }: { data: number[] }) => {
    const max = Math.max(...data);
    return (
        <div className="flex items-end justify-between gap-1 h-20 w-full px-2">
            {data.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                        className="w-full grass-bg opacity-40 group-hover:opacity-100 transition-all rounded-t-lg relative"
                        style={{ height: `${(val / max) * 100}%` }}
                    >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#5d2e0a] text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {val}
                        </div>
                    </div>
                    <span className="text-[7px] font-black text-[#8b4513] uppercase">Dia {i + 1}</span>
                </div>
            ))}
        </div>
    );
};
export default ExchangeChart;
