import React from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { characterService } from '../services/characterService';
import { Pet } from '../types';

interface PetManagementModalProps {
    onClose: () => void;
}

const PetCard: React.FC<{
    pet: Pet;
    isUnlocked: boolean;
    isActive: boolean;
    onSelect: () => void;
}> = ({ pet, isUnlocked, isActive, onSelect }) => {
    return (
        <button
            disabled={!isUnlocked}
            onClick={onSelect}
            className={`p-4 rounded-lg border-4 text-left transition-all w-full flex flex-col items-center
                ${isActive ? 'border-[var(--dl-blue-shadow)] ring-4 ring-[var(--dl-blue)] bg-[#d1ecf1]' : 'border-[var(--dl-text)] hover:border-[var(--dl-blue-shadow)] bg-[#e9ddb8]'}
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--dl-text)]
            `}
        >
            <div className="text-6xl mb-2">{isUnlocked ? pet.emoji : '❓'}</div>
            <h4 className="font-bold text-lg text-center">{isUnlocked ? pet.name : '???'}</h4>
            <p className="text-sm opacity-70 text-center mt-1">{isUnlocked ? pet.description : 'Unlock this pet by finding a Pet Egg in the shop!'}</p>
        </button>
    );
};

const PetManagementModal: React.FC<PetManagementModalProps> = ({ onClose }) => {
    const trapRef = useFocusTrap<HTMLDivElement>(onClose);
    const { playerCharacter, unlockedCustomizations, equipPet } = useStore();
    const allPets = characterService.allPets;

    return (
        <div className="modal-backdrop animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="pet-title">
            <div ref={trapRef} className="dl-modal max-w-xl animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="pet-title" className="text-3xl font-bold">Your Pets</h2>
                    <button onClick={onClose} className="opacity-70 hover:opacity-100 text-3xl" aria-label="Close pet management modal">&times;</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {allPets.map(pet => {
                        const isUnlocked = unlockedCustomizations.unlockedPets.includes(pet.id);
                        const isActive = playerCharacter.activePet === pet.id;
                        return (
                            <PetCard 
                                key={pet.id}
                                pet={pet}
                                isUnlocked={isUnlocked}
                                isActive={isActive}
                                onSelect={() => equipPet(pet.id)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PetManagementModal;