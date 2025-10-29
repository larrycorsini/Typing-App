import React from 'react';
import { useStore } from '../store';
import { GameState } from '../types';
import CharacterDisplay from './CharacterDisplay';
import { TRAINING_ENERGY_COST } from '../services/characterService';

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-[#e9ddb8] p-4 rounded-lg text-center">
    <div className="text-3xl font-bold text-[var(--dl-blue-shadow)]">{value}</div>
    <div className="text-sm opacity-80 uppercase tracking-wider">{label}</div>
  </div>
);

const TrainingGround: React.FC = () => {
    const { playerCharacter, setGameState, startTraining } = useStore();
    
    const canTrain = playerCharacter.energy >= TRAINING_ENERGY_COST;

    const StatProgress: React.FC<{ label: string, xp: number, xpToNext: number }> = ({ label, xp, xpToNext }) => {
        const percentage = (xp / xpToNext) * 100;
        return (
            <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="opacity-90">{label}</span>
                    <span className="opacity-70">{xp} / {xpToNext} XP</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden border-2 border-[var(--dl-text)]">
                    <div className="bg-[var(--dl-blue)] h-full" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        )
    };

    return (
        <div className="w-full max-w-3xl mx-auto text-center card">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Training Ground</h1>
            <p className="opacity-80 mb-6">Play minigames to earn stat XP and improve your duck's abilities!</p>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="md:w-1/3">
                    <CharacterDisplay character={playerCharacter} />
                </div>
                <div className="md:w-2/3 w-full grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatBox label="Energy" value={`${playerCharacter.energy}/${playerCharacter.maxEnergy}`} />
                    <StatBox label="Running" value={playerCharacter.running} />
                    <StatBox label="Swimming" value={playerCharacter.swimming} />
                    <StatBox label="Flying" value={playerCharacter.flying} />
                    <StatBox label="Level" value={playerCharacter.level} />
                    <StatBox label="Coins" value={playerCharacter.coins} />
                </div>
            </div>

            <div className="bg-[#e9ddb8] p-6 rounded-lg border-2 border-[var(--dl-text)]">
                <h2 className="text-2xl font-bold mb-4">Train Skills (Cost: {TRAINING_ENERGY_COST} Energy)</h2>
                <div className="space-y-6">
                    <div className="bg-[var(--dl-panel-bg)] p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-3">
                            <div>
                                <h3 className="text-xl font-bold">Running</h3>
                                <p className="opacity-80">Gives your duck a visual head start in races.</p>
                            </div>
                            <button
                                onClick={() => startTraining('running')}
                                disabled={!canTrain}
                                className="btn btn-success mt-4 md:mt-0 w-full md:w-auto"
                            >
                                Train
                            </button>
                        </div>
                        <StatProgress label="Running XP" xp={playerCharacter.runningXp} xpToNext={playerCharacter.runningXpToNextLevel} />
                    </div>
                     <div className="bg-[var(--dl-panel-bg)] p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-3">
                            <div>
                                <h3 className="text-xl font-bold">Swimming</h3>
                                <p className="opacity-80">Reduces the slowdown from water hazards in races.</p>
                            </div>
                            <button
                                onClick={() => startTraining('swimming')}
                                disabled={!canTrain}
                                className="btn btn-success mt-4 md:mt-0 w-full md:w-auto"
                            >
                                Train
                            </button>
                        </div>
                        <StatProgress label="Swimming XP" xp={playerCharacter.swimmingXp} xpToNext={playerCharacter.swimmingXpToNextLevel} />
                    </div>
                     <div className="bg-[var(--dl-panel-bg)] p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-3">
                            <div>
                                <h3 className="text-xl font-bold">Flying</h3>
                                <p className="opacity-80">Helps your duck overcome hurdles in races.</p>
                            </div>
                             <button
                                onClick={() => startTraining('flying')}
                                disabled={!canTrain}
                                className="btn btn-success mt-4 md:mt-0 w-full md:w-auto"
                            >
                                Train
                            </button>
                        </div>
                        <StatProgress label="Flying XP" xp={playerCharacter.flyingXp} xpToNext={playerCharacter.flyingXpToNextLevel} />
                    </div>
                </div>
            </div>

            <button
                onClick={() => setGameState(GameState.ADVENTURE_MAP)}
                className="mt-8 btn btn-secondary"
            >
                Back to Map
            </button>
        </div>
    );
};

export default TrainingGround;