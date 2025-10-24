
import React from 'react';
import { useStore } from '../store';
import { GameState } from '../types';

const Lobby: React.FC = () => {
    const { players, lobbyCountdown, raceTheme, setGameState } = useStore();
    const themeName = raceTheme?.replace(/_/g, ' ') || 'Unknown Theme';

    return (
        <div className="text-center w-full max-w-2xl bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-4xl font-bold text-cyan-400">Live Race Lobby</h2>
            <p className="text-slate-400 mt-2 mb-6">Waiting for players... Race starts in <span className="font-bold text-white">{lobbyCountdown}</span></p>
            
            <div className="mb-4 text-left">
                <p><span className="font-bold text-slate-300">Theme:</span> {themeName}</p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 border-y-2 border-slate-700/50 py-4 mb-6">
                {players.map((player, index) => (
                    <div key={player.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                        <span className={`font-semibold ${player.isPlayer ? 'text-cyan-300' : 'text-slate-200'}`}>{player.name} {player.isPlayer && '(You)'}</span>
                        <span className="text-sm text-green-400">Ready</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setGameState(GameState.LOBBY)}
                className="w-full bg-red-600/80 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-red-500/80 focus:outline-none focus:ring-4 focus:ring-red-400/50 transition-colors"
            >
                Cancel
            </button>
        </div>
    );
};

export default Lobby;
