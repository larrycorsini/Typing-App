import React from 'react';
import { Player } from '../types';
import CharacterDisplay from './CharacterDisplay';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const isFinished = player.progress >= 100;
  
  const cardClasses = [
    'p-4 rounded-lg shadow-md transition-all duration-300 border-2',
    player.isPlayer ? 'bg-cyan-900/50 border-cyan-400' : 'bg-slate-800 border-transparent',
    player.isFallingBehind ? 'animate-subtleGlow !border-red-500/80' : '',
    player.isGhost ? 'border-dashed border-purple-400' : '',
  ].join(' ');

  const progressBgColor = isFinished 
    ? 'bg-green-500' 
    : player.isGhost 
    ? 'bg-purple-500' 
    : player.isPlayer
    ? 'bg-cyan-500'
    : 'bg-slate-500';

  const ariaLabel = `${player.name}${player.isPlayer ? ' (You)' : ''}${player.isGhost ? ' (Ghost)' : ''}: ${player.wpm} WPM, ${Math.round(player.progress)}% progress. ${isFinished ? 'Finished.' : ''}`;
  
  // Apply a visual boost based on the running stat
  const visualProgress = player.character?.running
    ? Math.min(100, player.progress + (player.character.running / 5))
    : player.progress;

  return (
    <div className={cardClasses} role="status" aria-live="polite" aria-label={ariaLabel}>
      <div className="flex justify-between items-center mb-2">
        <span className={`font-bold text-lg truncate pr-2 ${player.isPlayer ? 'text-cyan-300' : player.isGhost ? 'text-purple-300' : 'text-slate-300'}`}>
          {player.rank && `#${player.rank} `}{player.name} {player.isPlayer && '(You)'} {player.isGhost && '(Ghost)'}
        </span>
        <span className={`text-xl font-bold ${isFinished ? 'text-green-400' : player.isGhost ? 'text-purple-300' : 'text-cyan-400'}`}>
          {player.wpm} WPM
        </span>
      </div>
      
      <div className="w-full bg-slate-700 rounded-full h-4 relative mt-2" aria-hidden="true">
        <div 
            className={`h-4 rounded-full transition-all duration-300 ease-linear ${progressBgColor}`}
            style={{ width: `${player.progress}%` }}
        />
        {player.character && !player.isGhost && (
            <div
                className="absolute transition-all duration-300 ease-linear"
                style={{
                    left: `${visualProgress}%`,
                    top: '50%',
                    width: '42px',
                    height: '42px',
                    transform: 'translate(-50%, -65%)'
                }}
            >
                <CharacterDisplay character={player.character} size="small" />
            </div>
        )}
      </div>

    </div>
  );
};

export default PlayerCard;