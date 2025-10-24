
import React from 'react';
import { PlayerStats } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface PlayerStatsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-slate-700 p-4 rounded-lg text-center">
    <div className="text-3xl font-bold text-cyan-400">{value}</div>
    <div className="text-sm text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({ stats, onClose }) => {
  const winRate = stats.totalRaces > 0 ? ((stats.wins / stats.totalRaces) * 100).toFixed(0) : 0;
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);

  return (
    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="stats-title">
      <div ref={trapRef} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="stats-title" className="text-3xl font-bold text-cyan-400">Your Stats</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-cyan-400 text-3xl" aria-label="Close stats modal">&times;</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatBox label="Total Races" value={stats.totalRaces} />
          <StatBox label="Races Won" value={stats.wins} />
          <StatBox label="Win Rate" value={`${winRate}%`} />
          <StatBox label="Best WPM" value={stats.bestWpm} />
          <StatBox label="Avg WPM" value={stats.avgWpm} />
          <StatBox label="Avg Accuracy" value={`${stats.avgAccuracy}%`} />
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsModal;
