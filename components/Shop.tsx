import React, { useState } from 'react';
import { useStore } from '../store';
import { GameState } from '../types';
import CharacterDisplay from './CharacterDisplay';
import { characterService } from '../services/characterService';

const StatBox: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
  <div className={`bg-[#e9ddb8] p-3 rounded-lg text-center ${className}`}>
    <div className="text-2xl font-bold text-[var(--dl-blue-shadow)]">{value}</div>
    <div className="text-xs opacity-80 uppercase tracking-wider">{label}</div>
  </div>
);

const Shop: React.FC = () => {
    const { playerCharacter, setGameState, buyItem } = useStore();
    const [activeTab, setActiveTab] = useState<'food' | 'gear'>('food');
    const energyPercentage = (playerCharacter.energy / playerCharacter.maxEnergy) * 100;
    
    const itemsToShow = characterService.allShopItems.filter(item => item.type === activeTab);

    return (
        <div className="w-full max-w-3xl mx-auto text-center card">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Duck Shop</h1>
            <p className="opacity-80 mb-6">Spend coins to get food and helpful gear!</p>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="md:w-1/3">
                    <CharacterDisplay character={playerCharacter} />
                </div>
                <div className="md:w-2/3 w-full grid grid-cols-2 gap-4">
                    <StatBox label="Energy" value={`${playerCharacter.energy}/${playerCharacter.maxEnergy}`} className="col-span-2" />
                     <div className="w-full h-4 bg-white rounded-full overflow-hidden border-2 border-[var(--dl-text)] col-span-2">
                        <div className="bg-[var(--dl-green)] h-full transition-all duration-500" style={{ width: `${energyPercentage}%` }}></div>
                    </div>
                    <StatBox label="Coins" value={playerCharacter.coins} className="col-span-2" />
                </div>
            </div>

             <div className="bg-[#e9ddb8] p-6 rounded-lg border-2 border-[var(--dl-text)]">
                <div className="flex border-b border-[var(--dl-dirt)] mb-4">
                    <button onClick={() => setActiveTab('food')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'food' ? 'text-[var(--dl-blue-shadow)] border-b-2 border-[var(--dl-blue-shadow)]' : 'opacity-60 hover:opacity-100'}`}>Food</button>
                    <button onClick={() => setActiveTab('gear')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'gear' ? 'text-[var(--dl-blue-shadow)] border-b-2 border-[var(--dl-blue-shadow)]' : 'opacity-60 hover:opacity-100'}`}>Gear</button>
                </div>

                <div className="space-y-4">
                    {itemsToShow.map(item => (
                         <div key={item.id} className="flex flex-col md:flex-row justify-between items-center bg-[var(--dl-panel-bg)] p-4 rounded-lg">
                            <div className="text-left">
                                <h3 className="text-xl font-bold">{item.name}</h3>
                                <p className="opacity-80">{item.description}</p>
                            </div>
                            <button
                                onClick={() => buyItem(item.id)}
                                disabled={playerCharacter.coins < item.cost}
                                className="btn btn-primary mt-4 md:mt-0 w-full md:w-auto"
                            >
                                Buy ({item.cost} 🪙)
                            </button>
                        </div>
                    ))}
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

export default Shop;