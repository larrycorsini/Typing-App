import React from 'react';
import { useStore } from '../store';

const PartyTransition: React.FC = () => {
    const { partyPlayers, currentPartyPlayerIndex, prepareNextPartyTurn } = useStore();
    const nextPlayer = partyPlayers[currentPartyPlayerIndex];

    if (!nextPlayer) {
        return (
            <div className="card text-center w-full max-w-2xl">
                 <h2 className="text-4xl font-bold animate-pulse">Preparing next round...</h2>
            </div>
        );
    }
    
    return (
        <div className="card text-center w-full max-w-2xl">
            <h2 className="text-3xl font-bold">Get Ready!</h2>
            <p className="text-6xl font-bold text-[var(--dl-blue-shadow)] my-8">{nextPlayer.name}</p>
            <p className="opacity-80 mt-2 mb-8 text-xl">It's your turn to type. Pass the device!</p>

            <button
                onClick={prepareNextPartyTurn}
                className="w-full btn btn-primary text-2xl"
            >
                Start My Turn
            </button>
        </div>
    );
};

export default PartyTransition;