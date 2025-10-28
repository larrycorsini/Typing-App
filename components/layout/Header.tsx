import React from 'react';
import { useStore } from '../../store';

const Header: React.FC = () => {
    const { 
        playerName, 
        playerCharacter,
        setShowStatsModal,
        setShowLeaderboardModal,
        setShowAchievementsModal,
        setShowSettingsModal,
        changeUser,
    } = useStore();

    const xpPercentage = (playerCharacter.xp / playerCharacter.xpToNextLevel) * 100;
    const energyPercentage = (playerCharacter.energy / playerCharacter.maxEnergy) * 100;

    return (
        <header className="fixed top-0 left-0 right-0 bg-[rgba(var(--color-bg-primary),0.8)] backdrop-blur-md border-b border-[rgb(var(--color-border))] p-3 z-20 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                {/* Left Side: Player Info */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-cyan-400 truncate" title={playerName}>{playerName}</h1>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <div className="flex-1 min-w-[120px]">
                            <div className="flex justify-between text-xs font-semibold mb-0.5">
                                <span className="text-cyan-300">Lvl {playerCharacter.level}</span>
                                <span className="text-slate-400">{playerCharacter.xp}/{playerCharacter.xpToNextLevel}</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <div className="flex justify-between text-xs font-semibold mb-0.5">
                                <span className="text-green-400">Energy</span>
                                <span className="text-slate-400">{playerCharacter.energy}/{playerCharacter.maxEnergy}</span>
                            </div>
                             <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                                <div className="bg-green-500 h-full rounded-full" style={{ width: `${energyPercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="font-bold text-lg text-amber-400 hidden sm:block">
                            {playerCharacter.coins} 🪙
                        </div>
                    </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => setShowStatsModal(true)} className="header-btn">Stats</button>
                    <button onClick={() => setShowLeaderboardModal(true)} className="header-btn">Scores</button>
                    <button onClick={() => setShowAchievementsModal(true)} className="header-btn">Awards</button>
                    <button onClick={() => setShowSettingsModal(true)} className="header-btn" aria-label="Settings">⚙️</button>
                    <button onClick={() => changeUser()} className="header-btn-danger">Change User</button>
                </div>
            </div>
        </header>
    );
};

export default Header;