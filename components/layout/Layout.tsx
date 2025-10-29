import React from 'react';
import { useStore } from '../../store';
import { AppStateSync } from '../AppStateSync';
import Header from './Header';
import PlayerStatsModal from '../PlayerStatsModal';
import LeaderboardModal from '../LeaderboardModal';
import AchievementsModal from '../AchievementsModal';
import SettingsModal from '../SettingsModal';
import TutorialModal from '../TutorialModal';
import CharacterCustomizationModal from '../CharacterCustomizationModal';
import StoryModal from '../StoryModal';
import ToastContainer from '../Toast';
import Countdown from '../Countdown';
import ResultsModal from '../ResultsModal';
import { GameState, RaceMode } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const state = useStore();

  const handleResultsModalClose = () => {
    if (state.raceMode === RaceMode.COURSE) {
        state.setGameState(GameState.COURSE_LOBBY);
    } else {
        state.setGameState(GameState.LOBBY);
    }
  }

  return (
    <>
      <AppStateSync />
      <ToastContainer />
      {state.showTutorialModal && <TutorialModal />}
      <button 
        onClick={state.toggleMute} 
        className="absolute top-4 left-4 w-12 h-12 bg-[rgba(var(--color-bg-secondary),0.8)] backdrop-blur-sm rounded-full flex items-center justify-center text-2xl border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors z-30" 
        aria-label={state.isMuted ? "Unmute sound" : "Mute sound"}
      >
        {state.isMuted ? '🔇' : '🔊'}
      </button>

      {state.gameState !== GameState.CHARACTER_CREATION && <Header />}

      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative pt-24">
        {children}
      </main>

      {state.gameState === GameState.COUNTDOWN && <Countdown onComplete={() => state.setGameState(GameState.TYPING)} />}
      {state.gameState === GameState.RESULTS && <ResultsModal players={state.players} onPlayAgain={handleResultsModalClose} />}
      {state.gameState === GameState.BOSS_INTRO && <StoryModal />}
      {state.showStatsModal && <PlayerStatsModal stats={state.persistentPlayerStats} onClose={() => state.setShowStatsModal(false)} />}
      {state.showLeaderboardModal && <LeaderboardModal onClose={() => state.setShowLeaderboardModal(false)} />}
      {state.showAchievementsModal && <AchievementsModal onClose={() => state.setShowAchievementsModal(false)} />}
      {state.showSettingsModal && <SettingsModal onClose={() => state.setShowSettingsModal(false)} />}
      {state.showCharacterModal && <CharacterCustomizationModal onClose={() => state.setShowCharacterModal(false)} />}
    </>
  );
};

export default Layout;