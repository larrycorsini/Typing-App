
import React from 'react';
import { WpmDataPoint } from '../types';

interface WpmChartProps {
  data: WpmDataPoint[];
}

const WpmChart: React.FC<WpmChartProps> = ({ data }) => {
  if (data.length < 2) {
    return <div className="text-center text-slate-500 p-4">Not enough data for a WPM chart.</div>;
  }

  const width = 350;
  const height = 100;
  const padding = 10;

  const maxWpm = Math.max(...data.map(d => d.wpm), 0) * 1.1; // 10% ceiling
  const maxTime = Math.max(...data.map(d => d.time), 1);

  const getX = (time: number) => (time / maxTime) * (width - padding * 2) + padding;
  const getY = (wpm: number) => height - padding - (wpm / maxWpm) * (height - padding * 2);

  const path = data.map(d => `${getX(d.time)},${getY(d.wpm)}`).join(' ');

  return (
    <div className="bg-slate-700/50 p-2 rounded-lg mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <text x={padding} y={padding} fill="#94a3b8" fontSize="10" dominantBaseline="hanging">
          {Math.round(maxWpm)} WPM
        </text>
        <text x={width - padding} y={height - padding / 2} fill="#94a3b8" fontSize="10" textAnchor="end">
          {Math.round(maxTime)}s
        </text>
        <polyline
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={path}
        />
      </svg>
      <p className="text-center text-xs text-slate-400 mt-1">WPM Over Time</p>
    </div>
  );
};

export default WpmChart;
