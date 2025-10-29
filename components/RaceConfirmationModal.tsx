import React from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { GameState, ConsumableItemId } from '../types';
import { characterService } from '../services/characterService';

const ItemCard: React.FC<{
    itemId: ConsumableItemId;
    onToggle: () => void;
}> = ({ itemId, onToggle }) => {
    const { playerCharacter, activeConsumables } = useStore();
    const itemInfo = characterService.allShopItems.find(i => i.id === itemId);
    const count = playerCharacter.inventory[itemId] || 0;
    const isActive = activeConsumables[itemId];
    
    if (!itemInfo) return null;

    return (
        <button
            onClick={onToggle}
            disabled={count === 0 && !isActive}
            className={`p-4 rounded-lg border-4 text-left transition-all w-full
                ${isActive ? 'border-[var(--dl-blue-shadow)] ring-4 ring-[var(--dl-blue)] bg-[#d1ecf1]' : 'border-[var(--dl-text)] hover:border-[var(--dl-blue-shadow)] bg-[#e9ddb8]'}
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--dl-text)]
            `}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg">{itemInfo.name}</h4>
                    <p className="text-sm opacity-70">{itemInfo.description}</p>
                </div>
                <div className={`font-bold text-2xl px-3 py-1 rounded-lg ${isActive ? 'bg-[var(--dl-blue)]' : 'bg-white'}`}>
                    {count}
                </div>
            </div>
        </button>
    );
};

const RaceConfirmationModal: React.FC = () => {
    const { setGameState, confirmStartRace, consumeItem, clearActiveConsumables } = useStore();
    
    const handleClose = () => {
        clearActiveConsumables();
        setGameState(GameState.ADVENTURE_MAP);
    };

    const trapRef = useFocusTrap<HTMLDivElement>(handleClose);

    return (
        <div className="modal-backdrop animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div ref={trapRef} className="dl-modal max-w-lg animate-scaleIn text-center" onClick={e => e.stopPropagation()}>
                <h2 id="confirm-title" className="text-3xl font-bold">Ready to Race?</h2>
                <p className="opacity-80 mt-2 mb-6">Use an item from your inventory for a single-race boost!</p>
                
                <div className="space-y-4 mb-8">
                    <ItemCard itemId="wpm_booster" onToggle={() => consumeItem('wpm_booster')} />
                    <ItemCard itemId="focus_goggles" onToggle={() => consumeItem('focus_goggles')} />
                </div>

                <div className="flex gap-4">
                    <button onClick={handleClose} className="btn btn-secondary w-1/3">
                        Back
                    </button>
                    <button onClick={confirmStartRace} className="btn btn-primary w-2/3">
                        Start Race!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RaceConfirmationModal;