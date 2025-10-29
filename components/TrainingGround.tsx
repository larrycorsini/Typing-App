import React from 'react';
import { useStore } from '../store';
import { GameState } from '../types';
import CharacterDisplay from './CharacterDisplay';
import { TRAINING_ENERGY_COST } from '../services/characterService';

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-slate-700 p-4 rounded-lg text-center">
    <div className="text-3xl font-bold text-cyan-400">{value}</div>
    <div className="text-sm text-slate-400 uppercase tracking-wider">{label}</div>
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
                    <span className="text-slate-300">{label}</span>
                    <span className="text-slate-400">{xp} / {xpToNext} XP</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        )
    };

    return (
        <div className="w-full max-w-3xl mx-auto text-center bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">Training Ground</h1>
            <p className="text-slate-400 mb-6">Play minigames to earn stat XP and improve your duck's abilities!</p>

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

            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-slate-200 mb-4">Train Skills (Cost: {TRAINING_ENERGY_COST} Energy)</h2>
                <div className="space-y-6">
                    <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-3">
                            <div>
                                <h3 className="text-xl font-bold text-cyan-300">Running</h3>
                                <p className="text-slate-400">Gives your duck a visual head start in races.</p>
                            </div>
                            <button
                                onClick={() => startTraining('running')}
                                disabled={!canTrain}
                                className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 mt-4 md:mt-0 w-full md:w-auto"
                            >
                                Start Training
                            </button>
                        </div>
                        <StatProgress label="Running XP" xp={playerCharacter.runningXp} xpToNext={playerCharacter.runningXpToNextLevel} />
                    </div>
                     <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-3">
                            <div>
                                <h3 className="text-xl font-bold text-cyan-300">Swimming</h3>
                                <p className="text-slate-400">Reduces the slowdown from water hazards in races.</p>
                            </div>
                            <button
                                onClick={() => startTraining('swimming')}
                                disabled={!canTrain}
                                className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 mt-4 md:mt-0 w-full md:w-auto"
                            >
                                Start Training
                            </button>
                        </div>
                        <StatProgress label="Swimming XP" xp={playerCharacter.swimmingXp} xpToNext={playerCharacter.swimmingXpToNextLevel} />
                    </div>
                     <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-3">
                            <div>
                                <h3 className="text-xl font-bold text-cyan-300">Flying</h3>
                                <p className="text-slate-400">Helps your duck overcome hurdles in races.</p>
                            </div>
                             <button
                                onClick={() => startTraining('flying')}
                                disabled={!canTrain}
                                className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 mt-4 md:mt-0 w-full md:w-auto"
                            >
                                Start Training
                            </button>
                        </div>
                        <StatProgress label="Flying XP" xp={playerCharacter.flyingXp} xpToNext={playerCharacter.flyingXpToNextLevel} />
                    </div>
                </div>
            </div>

            <button
                onClick={() => setGameState(GameState.LOBBY)}
                className="mt-8 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full md:w-auto"
            >
                Back to Lobby
            </button>
        </div>
    );
};

export default TrainingGround;