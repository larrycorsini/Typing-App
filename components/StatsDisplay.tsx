
import React from 'react';
import { TypingStats } from '../types';

interface StatsDisplayProps {
  stats: TypingStats;
}

const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col items-center bg-slate-800 p-4 rounded-lg shadow-md">
    <span className="text-slate-400 text-sm font-semibold uppercase tracking-widest">{label}</span>
    <span className="text-cyan-400 text-4xl font-bold">{value}</span>
  </div>
);

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6">
      <StatItem label="WPM" value={stats.wpm} />
      <StatItem label="Accuracy" value={`${stats.accuracy}%`} />
    </div>
  );
};

export default StatsDisplay;