

import React, { useEffect, useState } from 'react';
import { GameState, RaceMode, RaceTheme } from './types';
import { useStore } from './store';

import TypingArea from './components/TypingArea';
import PlayerCard from './components/PlayerCard';
import Countdown from './components/Countdown';
import ResultsModal from './components/ResultsModal';
import NameSelection from './components/NameSelection';
import PlayerStatsModal from './components/PlayerStatsModal';
import LeaderboardModal from './components/LeaderboardModal';
import AchievementsModal from './components/AchievementsModal';
import ToastContainer from './components/Toast';
import SettingsModal from './components/SettingsModal';
import TutorialModal from './components/TutorialModal';
import PartySetup from './components/PartySetup';
import PartyTransition from './components/PartyTransition';
import OnlineLobby from './components/OnlineLobby';
import CustomTextSetup from './components/CustomTextSetup';

const App: React.FC = () => {
  const state = useStore();
  const [isGhostAvailable, setIsGhostAvailable] = useState(false);

  useEffect(() => {
    setIsGhostAvailable(!!localStorage.getItem('gemini-type-racer-ghost'));
  }, [state.gameState]);
  
  useEffect(() => {
    document.body.setAttribute('data-theme', state.playerSettings.activeThemeId);
  }, [state.playerSettings.activeThemeId]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const renderLobby = () => (
    <div className="text-center w-full max-w-4xl">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          <button onClick={() => state.setShowStatsModal(true)} className="bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.8)] text-[rgb(var(--color-text-primary))] font-semibold py-2 px-4 rounded-lg transition-colors">Stats</button>
          <button onClick={() => state.setShowLeaderboardModal(true)} className="bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.8)] text-[rgb(var(--color-text-primary))] font-semibold py-2 px-4 rounded-lg transition-colors">Leaderboard</button>
          <button onClick={() => state.setShowAchievementsModal(true)} className="bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.8)] text-[rgb(var(--color-text-primary))] font-semibold py-2 px-4 rounded-lg transition-colors">Achievements</button>
          <button onClick={() => state.setShowSettingsModal(true)} className="bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.8)] text-[rgb(var(--color-text-primary))] font-semibold py-2 px-4 rounded-lg transition-colors">Settings</button>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[rgb(var(--color-accent-primary))] order-first w-full text-center sm:order-none sm:w-auto">Welcome, {state.playerName}!</h1>
        <div className="w-[360px]">{/* Placeholder for alignment */}</div>
      </div>
      <p className="text-[rgb(var(--color-text-secondary))] mt-2 mb-6">Select a mode and theme, then start the race.</p>
      
      <div className="mb-6">
        <h3 className="text-xl text-[rgb(var(--color-text-primary))] font-bold mb-3" id="mode-label">Game Mode</h3>
        <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => state.setRaceMode(RaceMode.SOLO_EASY)} className={`font-bold py-2 px-5 rounded-lg text-lg transition-colors border-2 ${state.raceMode === RaceMode.SOLO_EASY ? 'bg-green-500 border-green-500 text-white' : 'border-[rgb(var(--color-border))] hover:bg-slate-700'}`}>Solo Easy</button>
            <button onClick={() => state.setRaceMode(RaceMode.SOLO_MEDIUM)} className={`font-bold py-2 px-5 rounded-lg text-lg transition-colors border-2 ${state.raceMode === RaceMode.SOLO_MEDIUM ? 'bg-yellow-500 border-yellow-500 text-white' : 'border-[rgb(var(--color-border))] hover:bg-slate-700'}`}>Solo Medium</button>
            <button onClick={() => state.setRaceMode(RaceMode.SOLO_HARD)} className={`font-bold py-2 px-5 rounded-lg text-lg transition-colors border-2 ${state.raceMode === RaceMode.SOLO_HARD ? 'bg-red-500 border-red-500 text-white' : 'border-[rgb(var(--color-border))] hover:bg-slate-700'}`}>Solo Hard</button>
            <button onClick={() => state.setRaceMode(RaceMode.ONLINE_RACE)} className={`font-bold py-2 px-5 rounded-lg text-lg transition-colors border-2 ${state.raceMode === RaceMode.ONLINE_RACE ? 'bg-sky-500 border-sky-500 text-white' : 'border-[rgb(var(--color-border))] hover:bg-slate-700'}`}>Online Race</button>
            <button onClick={() => state.setRaceMode(RaceMode.GHOST)} disabled={!isGhostAvailable} className={`font-bold py-2 px-5 rounded-lg text-lg transition-colors border-2 ${state.raceMode === RaceMode.GHOST ? 'bg-purple-500 border-purple-500 text-white' : 'border-[rgb(var(--color-border))] hover:bg-slate-700'} disabled:opacity-50`}>Vs Ghost</button>
            <button onClick={() => state.setRaceMode(RaceMode.PARTY)} className={`font-bold py-2 px-5 rounded-lg text-lg transition-colors border-2 ${state.raceMode === RaceMode.PARTY ? 'bg-pink-500 border-pink-500 text-white' : 'border-[rgb(var(--color-border))] hover:bg-slate-700'}`}>Party Race</button>
        </div>
      </div>

       <div className="mb-8">
        <h3 className="text-xl text-[rgb(var(--color-text-primary))] font-bold mb-3" id="practice-label">Practice & Challenges</h3>
        <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => state.setRaceMode(RaceMode.ENDURANCE)} className={`font-bold py-2 px-5 rounded-lg text-lg transition-colors border-2 ${state.raceMode === RaceMode.ENDURANCE ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-[rgb(var(--color-border))] hover:bg-slate-700'}`}>Endurance (60s)</button>
            <button onClick={() => state.setRaceMode(RaceMode.CUSTOM_TEXT)} className={`font-bold py-2 px-5 rounded-lg text-lg transition-colors border-2 ${state.raceMode === RaceMode.CUSTOM_TEXT ? 'bg-teal-500 border-teal-500 text-white' : 'border-[rgb(var(--color-border))] hover:bg-slate-700'}`}>Custom Text</button>
            <button onClick={() => state.setRaceMode(RaceMode.DAILY_CHALLENGE)} className={`font-bold py-2 px-5 rounded-lg text-lg transition-colors border-2 ${state.raceMode === RaceMode.DAILY_CHALLENGE ? 'bg-amber-500 border-amber-500 text-white' : 'border-[rgb(var(--color-border))] hover:bg-slate-700'}`}>Daily Challenge</button>
        </div>
      </div>
      
      {state.raceMode && state.raceMode.startsWith('SOLO') && (
         <div className="mb-6">
            <h3 className="text-xl text-[rgb(var(--color-text-primary))] font-bold mb-3" id="theme-label">Theme</h3>
            <div role="group" aria-labelledby="theme-label" className="flex flex-wrap justify-center gap-2 md:gap-4">
              {(Object.keys(RaceTheme) as Array<keyof typeof RaceTheme>).map(key => (
                <button key={key} onClick={() => state.setRaceTheme(RaceTheme[key])} className={`font-bold py-2 px-4 rounded-lg text-md transition-all duration-200 border-2 ${state.raceTheme === RaceTheme[key] ? 'bg-[rgb(var(--color-accent-secondary))] border-[rgb(var(--color-accent-secondary))] text-[rgb(var(--color-accent-text))]' : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:border-slate-500'}`}>
                  {key.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
        </div>
      )}

      <div className="bg-[rgb(var(--color-bg-secondary))] p-6 rounded-lg shadow-lg text-xl md:text-2xl leading-relaxed tracking-wider select-none font-medium mb-8 min-h-[10rem] flex items-center justify-center transition-opacity duration-300">
        <p className={`${!state.textToType || state.textToType.startsWith('Loading') ? 'animate-pulse text-[rgb(var(--color-text-secondary))]' : ''}`}>
          {state.textToType || 'Select a mode to generate a passage...'}
        </p>
      </div>
      <button onClick={state.startGame} disabled={!state.raceMode || (state.raceMode.startsWith('SOLO') && !state.raceTheme) || state.textToType.startsWith('Loading')} className="bg-[rgb(var(--color-accent-secondary))] text-[rgb(var(--color-accent-text))] font-bold py-4 px-8 rounded-lg text-2xl hover:bg-[rgb(var(--color-accent-primary))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-accent-primary),0.5)] transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105">
        Start Race
      </button>
    </div>
  );

  const renderGame = () => (
    <>
      <div className="absolute top-4 right-4 text-center bg-[rgba(var(--color-bg-secondary),0.8)] backdrop-blur-sm p-2 px-4 rounded-lg shadow-md border border-[rgb(var(--color-border))]">
        <span className="text-[rgb(var(--color-text-secondary))] text-xs font-semibold uppercase tracking-widest">Time</span>
        <p className="text-[rgb(var(--color-accent-primary))] text-3xl font-bold font-mono" aria-live="off">{formatTime(state.elapsedTime)}</p>
      </div>
      <div className="w-full max-w-5xl space-y-4 mb-6">
        {state.players.map(p => <PlayerCard key={p.id} player={p} />)}
      </div>
      <TypingArea textToType={state.textToType} typed={state.typed} errors={state.errors} />
    </>
  );

  const renderContent = () => {
    switch(state.gameState) {
      case GameState.NAME_SELECTION: return <NameSelection onNameSubmit={state.setPlayerName} />;
      case GameState.LOBBY: return renderLobby();
      case GameState.ONLINE_LOBBY: return <OnlineLobby />;
      case GameState.PARTY_SETUP: return <PartySetup />;
      case GameState.PARTY_TRANSITION: return <PartyTransition />;
      case GameState.CUSTOM_TEXT_SETUP: return <CustomTextSetup />;
      case GameState.TYPING: case GameState.COUNTDOWN: return renderGame();
      default: return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
      <ToastContainer />
      {state.showTutorialModal && <TutorialModal />}
      <button onClick={state.toggleMute} className="absolute top-4 left-4 w-12 h-12 bg-[rgba(var(--color-bg-secondary),0.8)] backdrop-blur-sm rounded-full flex items-center justify-center text-2xl border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors z-30" aria-label={state.isMuted ? "Unmute sound" : "Mute sound"}>
        {state.isMuted ? '🔇' : '🔊'}
      </button>
      {state.gameState === GameState.COUNTDOWN && <Countdown onComplete={() => state.setGameState(GameState.TYPING)} />}
      {state.gameState === GameState.RESULTS && <ResultsModal players={state.players} onPlayAgain={() => state.setGameState(GameState.LOBBY)} />}
      {state.showStatsModal && <PlayerStatsModal stats={state.persistentPlayerStats} onClose={() => state.setShowStatsModal(false)} />}
      {state.showLeaderboardModal && <LeaderboardModal onClose={() => state.setShowLeaderboardModal(false)} />}
      {state.showAchievementsModal && <AchievementsModal onClose={() => state.setShowAchievementsModal(false)} />}
      {state.showSettingsModal && <SettingsModal onClose={() => state.setShowSettingsModal(false)} />}
      <div key={state.gameState} className="w-full max-w-5xl mx-auto flex flex-col items-center animate-fadeIn">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
