
import React, { useState, FormEvent } from 'react';
import { useStore } from '../store';
import { GameState } from '../types';

const PartySetup: React.FC = () => {
    const { partyPlayers, addPartyPlayer, removePartyPlayer, startPartyGame, setGameState } = useStore();
    const [name, setName] = useState('');

    const handleAddPlayer = (e: FormEvent) => {
        e.preventDefault();
        if (name) {
            addPartyPlayer(name);
            setName('');
        }
    };

    return (
        <div className="card text-center w-full max-w-2xl">
            <h2 className="text-4xl font-bold">Party Race Setup</h2>
            <p className="opacity-80 mt-2 mb-6">Add up to 4 players to compete locally.</p>

            <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter player name..."
                    maxLength={15}
                    className="flex-grow bg-white text-xl p-3 rounded-lg border-4 border-[var(--dl-text)] focus:border-yellow-500 focus:ring-0 focus:outline-none transition-colors"
                    autoFocus
                />
                <button type="submit" disabled={!name || partyPlayers.length >= 4} className="btn btn-secondary">
                    Add
                </button>
            </form>

            <div className="space-y-3 min-h-[14rem] border-y-2 border-[var(--dl-dirt)] py-4 mb-6">
                {partyPlayers.map((player) => (
                    <div key={player.name} className="flex justify-between items-center bg-[#e9ddb8] p-3 rounded-lg animate-fadeIn">
                        <span className="font-semibold">{player.name}</span>
                        <button onClick={() => removePartyPlayer(player.name)} className="text-[var(--dl-red)] hover:text-red-400 font-bold text-xl">&times;</button>
                    </div>
                ))}
                 {partyPlayers.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="opacity-60">Add some players to get started...</p>
                    </div>
                )}
            </div>
            
            <div className="flex gap-4">
                <button
                    onClick={() => setGameState(GameState.ADVENTURE_MAP)}
                    className="btn btn-secondary w-1/3"
                >
                    Back
                </button>
                <button
                    onClick={startPartyGame}
                    disabled={partyPlayers.length === 0}
                    className="btn btn-primary w-2/3"
                >
                    {`Start Race (${partyPlayers.length} players)`}
                </button>
            </div>
        </div>
    );
};

export default PartySetup;