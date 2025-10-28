import React, { useState } from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { characterService } from '../services/characterService';
import { CharacterCustomizationItem } from '../types';

interface CharacterCustomizationModalProps {
    onClose: () => void;
}

const ItemCard: React.FC<{
    item: CharacterCustomizationItem;
    isUnlocked: boolean;
    isActive: boolean;
    onSelect: () => void;
}> = ({ item, isUnlocked, isActive, onSelect }) => {
    return (
        <button
            disabled={!isUnlocked}
            onClick={onSelect}
            className={`p-4 rounded-lg border-2 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive ? 'border-cyan-400 ring-2 ring-cyan-400 bg-cyan-900/50' : 'border-slate-600 hover:border-cyan-500 bg-slate-700/50'}
            `}
        >
            <div className="text-5xl mb-2">{item.emoji}</div>
            <div className="font-bold text-md text-slate-200">{item.name}</div>
            {!isUnlocked && <div className="text-xs text-slate-400 mt-1">Locked</div>}
        </button>
    )
}

const CharacterCustomizationModal: React.FC<CharacterCustomizationModalProps> = ({ onClose }) => {
    const trapRef = useFocusTrap<HTMLDivElement>(onClose);
    const { playerCharacter, unlockedCustomizations, equipItem } = useStore();
    const [activeTab, setActiveTab] = useState<'hat' | 'accessory'>('hat');

    const items = characterService.allCustomizationItems.filter(i => i.type === activeTab);
    
    return (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="character-title">
            <div ref={trapRef} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-xl border border-slate-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="character-title" className="text-3xl font-bold text-cyan-400">Customize Your Duck</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-cyan-400 text-3xl" aria-label="Close customization modal">&times;</button>
                </div>
                
                <div className="flex border-b border-slate-700 mb-4">
                    <button onClick={() => setActiveTab('hat')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'hat' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}>Hats</button>
                    <button onClick={() => setActiveTab('accessory')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'accessory' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}>Accessories</button>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                    {items.map(item => {
                        const isUnlocked = unlockedCustomizations.characterItems.includes(item.id);
                        const isActive = playerCharacter.equippedItems[item.type] === item.id;
                        return (
                            <ItemCard
                                key={item.id}
                                item={item}
                                isUnlocked={isUnlocked}
                                isActive={isActive}
                                onSelect={() => equipItem(item.id)}
                            />
                        )
                    })}
                </div>

            </div>
        </div>
    );
};

export default CharacterCustomizationModal;