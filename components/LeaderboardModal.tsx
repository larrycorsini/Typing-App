import React, { useState } from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { LeaderboardEntry } from '../types';

interface LeaderboardModalProps {
  onClose: () => void;
}

const globalLeaderboardData: LeaderboardEntry[] = [
    { id: 'g1', name: 'Zephyr', wpm: 185, accuracy: 99, timestamp: 0 },
    { id: 'g2', name: 'Velocity', wpm: 172, accuracy: 100, timestamp: 0 },
    { id: 'g3', name: 'Blitz', wpm: 168, accuracy: 98, timestamp: 0 },
    { id: 'g4', name: 'Quantum', wpm: 165, accuracy: 99, timestamp: 0 },
    { id: 'g5', name: 'WPM-Wizard', wpm: 161, accuracy: 100, timestamp: 0 },
    { id: 'g6', name: 'Keyslinger', wpm: 158, accuracy: 97, timestamp: 0 },
    { id: 'g7', name: 'Typenado', wpm: 155, accuracy: 99, timestamp: 0 },
    { id: 'g8', name: 'Swift', wpm: 152, accuracy: 100, timestamp: 0 },
    { id: 'g9', name: 'RacerAI', wpm: 149, accuracy: 98, timestamp: 0 },
    { id: 'g10', name: 'Flow', wpm: 147, accuracy: 99, timestamp: 0 },
];

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const localLeaderboard = useStore(state => state.leaderboard);
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);
  const [activeTab, setActiveTab] = useState<'local' | 'global'>('local');

  const leaderboardData = activeTab === 'local' ? localLeaderboard : globalLeaderboardData;

  return (
    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
      <div ref={trapRef} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="leaderboard-title" className="text-3xl font-bold text-cyan-400">Leaderboard</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-cyan-400 text-3xl" aria-label="Close leaderboard modal">&times;</button>
        </div>

        <div className="flex border-b border-slate-700 mb-4">
            <button onClick={() => setActiveTab('local')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'local' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}>Local</button>
            <button onClick={() => setActiveTab('global')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'global' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}>Global</button>
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {leaderboardData.length > 0 ? leaderboardData.map((entry, index) => (
            <div key={entry.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-700/50">
              <div className="flex items-center">
                <span className="font-bold text-lg text-slate-400 w-8">#{index + 1}</span>
                <span className="font-semibold text-slate-200">{entry.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-cyan-300">{entry.wpm} WPM</div>
                <div className="text-xs text-slate-400">{entry.accuracy}% Acc</div>
              </div>
            </div>
          )) : (
            <p className="text-center text-slate-400 py-8">No scores yet. Complete a race to get on the leaderboard!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;