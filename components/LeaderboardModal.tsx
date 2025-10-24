
import React from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface LeaderboardModalProps {
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const leaderboard = useStore(state => state.leaderboard);
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);

  return (
    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
      <div ref={trapRef} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="leaderboard-title" className="text-3xl font-bold text-cyan-400">Leaderboard</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-cyan-400 text-3xl" aria-label="Close leaderboard modal">&times;</button>
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
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
