import React, { useState } from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { characterService } from '../services/characterService';
import { CharacterCustomizationItem, DuckPattern } from '../types';
import CharacterDisplay from './CharacterDisplay';

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
            className={`p-4 rounded-lg border-4 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive ? 'border-[var(--dl-blue-shadow)] ring-4 ring-[var(--dl-blue)] bg-[#d1ecf1]' : 'border-[var(--dl-text)] hover:border-[var(--dl-blue-shadow)] bg-[#e9ddb8]'}
            `}
        >
            <div className="text-5xl mb-2">{item.emoji}</div>
            <div className="font-bold text-md">{item.name}</div>
            {!isUnlocked && <div className="text-xs opacity-70 mt-1">Locked</div>}
        </button>
    )
}

const PatternCard: React.FC<{
    pattern: DuckPattern,
    isActive: boolean,
    onSelect: () => void;
}> = ({ pattern, isActive, onSelect }) => {
     return (
        <button
            onClick={onSelect}
            className={`p-4 rounded-lg border-4 text-center transition-all capitalize
                ${isActive ? 'border-[var(--dl-blue-shadow)] ring-4 ring-[var(--dl-blue)] bg-[#d1ecf1]' : 'border-[var(--dl-text)] hover:border-[var(--dl-blue-shadow)] bg-[#e9ddb8]'}
            `}
        >
            <div className="font-bold text-lg">{pattern}</div>
        </button>
    )
}


const CharacterCustomizationModal: React.FC<CharacterCustomizationModalProps> = ({ onClose }) => {
    const trapRef = useFocusTrap<HTMLDivElement>(onClose);
    const { playerCharacter, unlockedCustomizations, equipItem, setPlayerPattern } = useStore();
    const [activeTab, setActiveTab] = useState<'hat' | 'pattern'>('hat');

    const hats = characterService.allCustomizationItems.filter(i => i.type === 'hat');
    const patterns: DuckPattern[] = ['solid', 'spots', 'stripes'];
    
    return (
        <div className="modal-backdrop animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="character-title">
            <div ref={trapRef} className="dl-modal max-w-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="character-title" className="text-3xl font-bold">Customize Your Duck</h2>
                    <button onClick={onClose} className="opacity-70 hover:opacity-100 text-3xl" aria-label="Close customization modal">&times;</button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <CharacterDisplay character={playerCharacter} />
                    </div>
                    <div className="md:w-2/3">
                        <div className="flex border-b border-[var(--dl-dirt)] mb-4">
                            <button onClick={() => setActiveTab('hat')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'hat' ? 'text-[var(--dl-blue-shadow)] border-b-2 border-[var(--dl-blue-shadow)]' : 'opacity-60 hover:opacity-100'}`}>Hats</button>
                            <button onClick={() => setActiveTab('pattern')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'pattern' ? 'text-[var(--dl-blue-shadow)] border-b-2 border-[var(--dl-blue-shadow)]' : 'opacity-60 hover:opacity-100'}`}>Patterns</button>
                        </div>

                        {activeTab === 'hat' && (
                            <div className="grid grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                                {hats.map(item => {
                                    const isUnlocked = unlockedCustomizations.characterItems.includes(item.id);
                                    const isActive = playerCharacter.equippedItems.hat === item.id;
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
                        )}
                        {activeTab === 'pattern' && (
                             <div className="grid grid-cols-3 gap-4">
                                {patterns.map(pattern => (
                                    <PatternCard
                                        key={pattern}
                                        pattern={pattern}
                                        isActive={playerCharacter.pattern === pattern}
                                        onSelect={() => setPlayerPattern(pattern)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CharacterCustomizationModal;