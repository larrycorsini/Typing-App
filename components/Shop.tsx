import React, { useState } from 'react';
import { useStore } from '../store';
import { GameState } from '../types';
import CharacterDisplay from './CharacterDisplay';
import { characterService } from '../services/characterService';

const StatBox: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
  <div className={`bg-slate-700 p-3 rounded-lg text-center ${className}`}>
    <div className="text-2xl font-bold text-cyan-400">{value}</div>
    <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

const Shop: React.FC = () => {
    const { playerCharacter, setGameState, buyItem } = useStore();
    const [activeTab, setActiveTab] = useState<'food' | 'gear'>('food');
    const energyPercentage = (playerCharacter.energy / playerCharacter.maxEnergy) * 100;
    
    const itemsToShow = characterService.allShopItems.filter(item => item.type === activeTab);

    return (
        <div className="w-full max-w-3xl mx-auto text-center bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">Duck Shop</h1>
            <p className="text-slate-400 mb-6">Spend coins to get food and helpful gear!</p>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="md:w-1/3">
                    <CharacterDisplay character={playerCharacter} />
                </div>
                <div className="md:w-2/3 w-full grid grid-cols-2 gap-4">
                    <StatBox label="Energy" value={`${playerCharacter.energy}/${playerCharacter.maxEnergy}`} className="col-span-2" />
                     <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600 col-span-2">
                        <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${energyPercentage}%` }}></div>
                    </div>
                    <StatBox label="Coins" value={playerCharacter.coins} className="col-span-2" />
                </div>
            </div>

             <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                <div className="flex border-b border-slate-700 mb-4">
                    <button onClick={() => setActiveTab('food')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'food' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}>Food</button>
                    <button onClick={() => setActiveTab('gear')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'gear' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}>Gear</button>
                </div>

                <div className="space-y-4">
                    {itemsToShow.map(item => (
                         <div key={item.id} className="flex flex-col md:flex-row justify-between items-center bg-slate-700 p-4 rounded-lg">
                            <div>
                                <h3 className="text-xl font-bold text-cyan-300">{item.name}</h3>
                                <p className="text-slate-400">{item.description}</p>
                            </div>
                            <button
                                onClick={() => buyItem(item.id)}
                                disabled={playerCharacter.coins < item.cost}
                                className="bg-amber-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 mt-4 md:mt-0 w-full md:w-auto"
                            >
                                Buy ({item.cost} Coins)
                            </button>
                        </div>
                    ))}
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

export default Shop;