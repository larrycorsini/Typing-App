import React from 'react';
import { useStore } from '../store';

const PartyTransition: React.FC = () => {
    const { partyPlayers, currentPartyPlayerIndex, prepareNextPartyTurn } = useStore();
    const nextPlayer = partyPlayers[currentPartyPlayerIndex];

    if (!nextPlayer) {
        return (
            <div className="text-center w-full max-w-2xl bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
                 <h2 className="text-4xl font-bold text-cyan-400 animate-pulse">Preparing next round...</h2>
            </div>
        );
    }
    
    return (
        <div className="text-center w-full max-w-2xl bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-slate-300">Get Ready!</h2>
            <p className="text-6xl font-bold text-cyan-400 my-8">{nextPlayer.name}</p>
            <p className="text-slate-400 mt-2 mb-8 text-xl">It's your turn to type. Pass the device!</p>

            <button
                onClick={prepareNextPartyTurn}
                className="w-full bg-cyan-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-2xl hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 transition-all duration-300 transform hover:scale-105"
            >
                Start My Turn
            </button>
        </div>
    );
};

export default PartyTransition;
