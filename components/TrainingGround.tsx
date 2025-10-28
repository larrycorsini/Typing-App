import React from 'react';
import { useStore } from '../store';
import { GameState } from '../types';
import CharacterDisplay from './CharacterDisplay';
import { characterService } from '../services/characterService';

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-slate-700 p-4 rounded-lg text-center">
    <div className="text-3xl font-bold text-cyan-400">{value}</div>
    <div className="text-sm text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

const TrainingGround: React.FC = () => {
    const { playerCharacter, setGameState, trainStat } = useStore();
    const runningCost = characterService.getTrainingCost(playerCharacter.running);

    return (
        <div className="w-full max-w-2xl mx-auto text-center bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">Training Ground</h1>
            <p className="text-slate-400 mb-6">Spend XP to improve your duck's abilities!</p>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="md:w-1/3">
                    <CharacterDisplay character={playerCharacter} />
                </div>
                <div className="md:w-2/3 w-full grid grid-cols-2 gap-4">
                    <StatBox label="Level" value={playerCharacter.level} />
                    <StatBox label="Current XP" value={playerCharacter.xp} />
                    <StatBox label="Running Skill" value={playerCharacter.running} />
                    <StatBox label="Next Level XP" value={playerCharacter.xpToNextLevel} />
                </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-slate-200 mb-4">Train Skills</h2>
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-700 p-4 rounded-lg">
                    <div>
                        <h3 className="text-xl font-bold text-cyan-300">Running</h3>
                        <p className="text-slate-400">Gives your duck a visual head start in races.</p>
                    </div>
                    <button
                        onClick={() => trainStat('running')}
                        disabled={playerCharacter.xp < runningCost}
                        className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 mt-4 md:mt-0"
                    >
                        Train ({runningCost} XP)
                    </button>
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