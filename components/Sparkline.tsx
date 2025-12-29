import React from 'react';

interface SparklineProps {
    data: number[];
    color: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 30;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-8 mt-1 opacity-60">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="drop-shadow-sm"
                />
                <circle
                    cx={width}
                    cy={height - ((data[data.length - 1] - min) / range) * height}
                    r="2"
                    fill={color}
                />
            </svg>
        </div>
    );
};

export default Sparkline;
