import React from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';
// FIX: Import `allThemes` and `allSoundPacks` directly.
import { allThemes, allSoundPacks } from '../services/customizationService';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const trapRef = useFocusTrap<HTMLDivElement>(onClose);
    const { playerSettings, unlockedCustomizations, applyTheme, applySoundPack } = useStore();

    return (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div ref={trapRef} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="settings-title" className="text-3xl font-bold text-cyan-400">Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-cyan-400 text-3xl" aria-label="Close settings modal">&times;</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl text-slate-300 font-bold mb-3">UI Theme</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* FIX: Use the imported `allThemes` constant directly. */}
                            {allThemes.map(theme => {
                                const isUnlocked = unlockedCustomizations.themes.includes(theme.id);
                                const isActive = playerSettings.activeThemeId === theme.id;

                                return (
                                    <button
                                        key={theme.id}
                                        disabled={!isUnlocked}
                                        onClick={() => applyTheme(theme.id)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                            ${isActive ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-slate-600 hover:border-cyan-500'}
                                        `}
                                    >
                                        <div className="font-bold text-lg text-slate-200">{theme.name}</div>
                                        {!isUnlocked && <div className="text-xs text-slate-400">Unlock by earning achievements</div>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl text-slate-300 font-bold mb-3">Typing Sounds</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* FIX: Use the imported `allSoundPacks` constant directly. */}
                            {allSoundPacks.map(pack => {
                                const isUnlocked = unlockedCustomizations.soundPacks.includes(pack.id);
                                const isActive = playerSettings.activeSoundPackId === pack.id;

                                return (
                                    <button
                                        key={pack.id}
                                        disabled={!isUnlocked}
                                        onClick={() => applySoundPack(pack.id)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                            ${isActive ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-slate-600 hover:border-cyan-500'}
                                        `}
                                    >
                                        <div className="font-bold text-lg text-slate-200">{pack.name}</div>
                                        {!isUnlocked && <div className="text-xs text-slate-400">Unlock via achievements</div>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;