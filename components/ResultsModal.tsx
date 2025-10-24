
import React from 'react';
import { Player } from '../types';
import WpmChart from './WpmChart';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ResultsModalProps {
  players: Player[];
  onPlayAgain: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ players, onPlayAgain }) => {
  const trapRef = useFocusTrap<HTMLDivElement>(onPlayAgain);

  const sortedPlayers = [...players].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
  const playerResult = players.find(p => p.isPlayer);
  const isWinner = playerResult?.rank === 1;

  return (
    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="results-title">
      <div ref={trapRef} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <h2 id="results-title" className={`text-4xl font-bold text-center mb-2 ${isWinner ? 'text-yellow-400' : 'text-cyan-400'}`}>
          {isWinner ? 'You Won!' : 'Race Finished!'}
        </h2>
        <p className="text-center text-slate-300 text-xl mb-6">You placed #{playerResult?.rank || 'N/A'}</p>

        <div className="space-y-3 mb-6">
          {sortedPlayers.map(p => (
            <div key={p.id} className={`flex justify-between items-center p-3 rounded-lg transition-transform duration-300 ${p.isPlayer ? 'bg-cyan-900/50' : 'bg-slate-700/50'} ${p.isPlayer && isWinner ? 'scale-105 ring-2 ring-yellow-400 shadow-lg' : ''}`}>
              <span className="font-semibold text-slate-200">
                {p.rank === 1 && !p.isGhost ? '👑 ' : ''}#{p.rank} {p.name}
              </span>
              <span className="font-bold text-cyan-300">{p.wpm} WPM</span>
            </div>
          ))}
        </div>

        {playerResult?.wpmHistory && <WpmChart data={playerResult.wpmHistory} />}

        <button 
          onClick={onPlayAgain}
          className="w-full bg-cyan-500 text-slate-900 font-bold py-3 px-6 rounded-lg text-xl hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 transition-all duration-300 transform hover:scale-105 mt-8"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;
