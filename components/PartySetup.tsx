
import React, { useState, FormEvent } from 'react';
import { useStore } from '../store';
import { GameState } from '../types';

const PartySetup: React.FC = () => {
    const { partyPlayers, addPartyPlayer, removePartyPlayer, startPartyGame, setGameState, textToType } = useStore();
    const [name, setName] = useState('');

    const handleAddPlayer = (e: FormEvent) => {
        e.preventDefault();
        if (name) {
            addPartyPlayer(name);
            setName('');
        }
    };

    return (
        <div className="text-center w-full max-w-2xl bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-4xl font-bold text-cyan-400">Party Race Setup</h2>
            <p className="text-slate-400 mt-2 mb-6">Add up to 4 players to compete locally.</p>

            <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter player name..."
                    maxLength={15}
                    className="flex-grow bg-slate-900 text-xl p-3 rounded-lg border-2 border-slate-700 focus:border-cyan-400 focus:ring-0 focus:outline-none transition-colors"
                    autoFocus
                />
                <button type="submit" disabled={!name || partyPlayers.length >= 4} className="bg-cyan-500 text-slate-900 font-bold py-3 px-5 rounded-lg text-lg hover:bg-cyan-400 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed">
                    Add Player
                </button>
            </form>

            <div className="space-y-3 min-h-[14rem] border-y-2 border-slate-700/50 py-4 mb-6">
                {partyPlayers.map((player) => (
                    <div key={player.name} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg animate-fadeIn">
                        <span className="font-semibold text-slate-200">{player.name}</span>
                        <button onClick={() => removePartyPlayer(player.name)} className="text-red-500 hover:text-red-400 font-bold text-xl">&times;</button>
                    </div>
                ))}
                 {partyPlayers.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500">Add some players to get started...</p>
                    </div>
                )}
            </div>
            
            <div className="flex gap-4">
                <button
                    onClick={() => setGameState(GameState.LOBBY)}
                    className="w-1/3 bg-slate-600/80 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-500/80 focus:outline-none focus:ring-4 focus:ring-slate-400/50 transition-colors"
                >
                    Back to Lobby
                </button>
                <button
                    onClick={startPartyGame}
                    disabled={partyPlayers.length === 0 || textToType.startsWith('Loading')}
                    className="w-2/3 bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {textToType.startsWith('Loading') ? 'Loading Text...' : `Start Race (${partyPlayers.length} players)`}
                </button>
            </div>
        </div>
    );
};

export default PartySetup;
