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
        <header className="fixed top-0 left-0 right-0 dl-header p-3 z-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                {/* Left Side: Player Info */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold truncate" title={playerName}>{playerName}</h1>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <div className="flex-1 min-w-[120px]">
                            <div className="flex justify-between text-xs font-semibold mb-0.5">
                                <span>Lvl {playerCharacter.level}</span>
                                <span>{playerCharacter.xp}/{playerCharacter.xpToNextLevel}</span>
                            </div>
                            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden border-2 border-[var(--dl-text)]">
                                <div className="bg-blue-400 h-full" style={{ width: `${xpPercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <div className="flex justify-between text-xs font-semibold mb-0.5">
                                <span>Energy</span>
                                <span>{playerCharacter.energy}/{playerCharacter.maxEnergy}</span>
                            </div>
                             <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden border-2 border-[var(--dl-text)]">
                                <div className="bg-green-500 h-full" style={{ width: `${energyPercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="font-bold text-lg text-amber-600 hidden sm:block">
                            {playerCharacter.coins} 🪙
                        </div>
                    </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => setShowStatsModal(true)} className="dl-header-btn">Stats</button>
                    <button onClick={() => setShowLeaderboardModal(true)} className="dl-header-btn">Scores</button>
                    <button onClick={() => setShowAchievementsModal(true)} className="dl-header-btn">Awards</button>
                    <button onClick={() => setShowSettingsModal(true)} className="dl-header-btn" aria-label="Settings">⚙️</button>
                    <button onClick={() => changeUser()} className="dl-header-btn dl-header-btn-danger">Change User</button>
                </div>
            </div>
        </header>
    );
};

export default Header;