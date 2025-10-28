import React from 'react';
import { Player } from '../types';
import CharacterDisplay from './CharacterDisplay';

// Fix: Define the missing PlayerCardProps interface.
interface PlayerCardProps {
  player: Player;
}

const WATER_HAZARD_START = 40; // a percentage
const WATER_HAZARD_END = 60;
const MAX_SWIM_SLOWDOWN = 0.7; // 70% speed reduction at level 1
const SWIM_SKILL_EFFECTIVENESS = 0.05; // Each level reduces slowdown

const HURDLE_START = 80;
const HURDLE_END = 82;
const MAX_FLYING_SLOWDOWN = 0.9; // A very high slowdown for low level
const FLYING_SKILL_EFFECTIVENESS = 0.08; // Each level reduces slowdown

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
  
  const calculateVisualProgress = () => {
    const baseProgress = player.progress;
    const runningBoost = player.character?.running ? (player.character.running / 5) : 0;
    let visualProgress = baseProgress + runningBoost;

    // Apply water hazard slowdown
    if (player.character && baseProgress > WATER_HAZARD_START && baseProgress < WATER_HAZARD_END) {
        const swimmingLevel = player.character.swimming || 1;
        const slowdownFactor = Math.max(0, MAX_SWIM_SLOWDOWN - (swimmingLevel - 1) * SWIM_SKILL_EFFECTIVENESS);
        const progressInWater = baseProgress - WATER_HAZARD_START;
        const slowedProgressInWater = progressInWater * (1 - slowdownFactor);
        
        visualProgress = WATER_HAZARD_START + runningBoost + slowedProgressInWater;
    } else if (player.character && baseProgress >= WATER_HAZARD_END) {
        const swimmingLevel = player.character.swimming || 1;
        const slowdownFactor = Math.max(0, MAX_SWIM_SLOWDOWN - (swimmingLevel - 1) * SWIM_SKILL_EFFECTIVENESS);
        const waterSectionLength = WATER_HAZARD_END - WATER_HAZARD_START;
        const effectiveWaterLength = waterSectionLength * (1 - slowdownFactor);
        const penalty = waterSectionLength - effectiveWaterLength;
        
        visualProgress = baseProgress + runningBoost - penalty;
    }

    // Apply hurdle slowdown
    if (player.character && visualProgress > HURDLE_START && visualProgress < HURDLE_END) {
        const flyingLevel = player.character.flying || 1;
        const slowdownFactor = Math.max(0, MAX_FLYING_SLOWDOWN - (flyingLevel - 1) * FLYING_SKILL_EFFECTIVENESS);
        const progressInHurdle = visualProgress - HURDLE_START;
        const slowedProgressInHurdle = progressInHurdle * (1 - slowdownFactor);

        visualProgress = HURDLE_START + slowedProgressInHurdle;

    } else if (player.character && visualProgress >= HURDLE_END) {
        const flyingLevel = player.character.flying || 1;
        const slowdownFactor = Math.max(0, MAX_FLYING_SLOWDOWN - (flyingLevel - 1) * FLYING_SKILL_EFFECTIVENESS);
        const hurdleSectionLength = HURDLE_END - HURDLE_START;
        const effectiveHurdleLength = hurdleSectionLength * (1 - slowdownFactor);
        const penalty = hurdleSectionLength - effectiveHurdleLength;

        visualProgress -= penalty;
    }
    
    return Math.min(100, visualProgress);
  };

  const visualProgress = calculateVisualProgress();

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
      
      <div className="w-full bg-slate-700 rounded-full h-4 relative mt-2 overflow-hidden" aria-hidden="true">
        {/* Water Hazard */}
        <div 
            className="absolute h-full bg-blue-500/50"
            style={{ left: `${WATER_HAZARD_START}%`, width: `${WATER_HAZARD_END - WATER_HAZARD_START}%` }}
        />
        {/* Hurdle */}
        <div
            className="absolute h-full bg-yellow-800/80 border-y-2 border-yellow-600"
            style={{ left: `${HURDLE_START}%`, width: `${HURDLE_END - HURDLE_START}%`}}
        />
        
        {/* Progress Bar */}
        <div 
            className={`h-4 rounded-full transition-all duration-300 ease-linear ${progressBgColor}`}
            style={{ width: `${player.progress}%` }}
        />
        
        {/* Duck Character */}
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