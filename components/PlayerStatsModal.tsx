
import React from 'react';
import { PlayerStats } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface PlayerStatsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-[#e9ddb8] p-4 rounded-lg text-center">
    <div className="text-3xl font-bold text-[var(--dl-blue-shadow)]">{value}</div>
    <div className="text-sm text-[var(--dl-text)] opacity-80 uppercase tracking-wider">{label}</div>
  </div>
);

const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({ stats, onClose }) => {
  const winRate = stats.totalRaces > 0 ? ((stats.wins / stats.totalRaces) * 100).toFixed(0) : 0;
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);

  return (
    <div className="modal-backdrop animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="stats-title">
      <div ref={trapRef} className="dl-modal max-w-lg animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="stats-title" className="text-3xl font-bold">Your Stats</h2>
          <button onClick={onClose} className="text-[var(--dl-text)] opacity-70 hover:opacity-100 text-3xl" aria-label="Close stats modal">&times;</button>
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