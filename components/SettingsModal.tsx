import React from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { allSoundPacks } from '../services/customizationService';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const trapRef = useFocusTrap<HTMLDivElement>(onClose);
    const { playerSettings, unlockedCustomizations, applySoundPack } = useStore();

    return (
        <div className="modal-backdrop animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div ref={trapRef} className="dl-modal max-w-lg animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="settings-title" className="text-3xl font-bold">Settings</h2>
                    <button onClick={onClose} className="text-[var(--dl-text)] opacity-70 hover:opacity-100 text-3xl" aria-label="Close settings modal">&times;</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold mb-3">Typing Sounds</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {allSoundPacks.map(pack => {
                                const isUnlocked = unlockedCustomizations.soundPacks.includes(pack.id);
                                const isActive = playerSettings.activeSoundPackId === pack.id;

                                return (
                                    <button
                                        key={pack.id}
                                        disabled={!isUnlocked}
                                        onClick={() => applySoundPack(pack.id)}
                                        className={`p-4 rounded-lg border-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                            ${isActive ? 'border-[var(--dl-blue-shadow)] bg-[#d1ecf1]' : 'border-[var(--dl-text)] hover:border-[var(--dl-blue-shadow)] bg-[#e9ddb8]'}
                                        `}
                                    >
                                        <div className="font-bold text-lg">{pack.name}</div>
                                        {!isUnlocked && <div className="text-xs opacity-70 mt-1">Unlock via achievements</div>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                 <button 
                    onClick={onClose}
                    className="w-full btn btn-primary text-xl py-3 mt-8"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;