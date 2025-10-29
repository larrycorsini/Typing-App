import React, { useEffect } from 'react';
import { GameState } from './types';
import { useStore } from './store';

import TypingArea from './components/TypingArea';
import PlayerCard from './components/PlayerCard';
import CharacterCreation from './components/CharacterCreation';
import PartySetup from './components/PartySetup';
import PartyTransition from './components/PartyTransition';
import OnlineLobby from './components/OnlineLobby';
import CustomTextSetup from './components/CustomTextSetup';
import CourseLobby from './components/CourseLobby';
import TrainingGround from './components/TrainingGround';
import Shop from './components/Shop';
import TournamentLobby from './components/TournamentLobby';
import Lobby from './components/Lobby';
import TrainingRunning from './components/TrainingRunning';
import TrainingSwimming from './components/TrainingSwimming';
import TrainingFlying from './components/TrainingFlying';

const App: React.FC = () => {
  const state = useStore();
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const renderGame = () => (
    <>
      <div className="absolute top-4 right-4 text-center bg-[var(--dl-panel-bg)] p-2 px-4 rounded-lg shadow-md border-2 border-[var(--dl-text)]">
        <span className="text-xs font-semibold uppercase tracking-widest">Time</span>
        <p className="text-[var(--dl-yellow-shadow)] text-3xl font-bold font-mono" aria-live="off">{formatTime(state.elapsedTime)}</p>
      </div>
      <div className="w-full max-w-5xl space-y-4 mb-6">
        {state.players.map(p => <PlayerCard key={p.id} player={p} />)}
      </div>
      <TypingArea textToType={state.textToType} typed={state.typed} errors={state.errors} />
    </>
  );

  const renderContent = () => {
    switch(state.gameState) {
      case GameState.CHARACTER_CREATION: return <CharacterCreation onCharacterCreate={(name, color, evolution) => state.setPlayerAndEvolution(name, color, evolution)} />;
      case GameState.LOBBY: return <Lobby />;
      case GameState.COURSE_LOBBY: return <CourseLobby />;
      case GameState.ONLINE_LOBBY: return <OnlineLobby />;
      case GameState.PARTY_SETUP: return <PartySetup />;
      case GameState.PARTY_TRANSITION: return <PartyTransition />;
      case GameState.CUSTOM_TEXT_SETUP: return <CustomTextSetup />;
      case GameState.TRAINING_GROUND: return <TrainingGround />;
      case GameState.SHOP: return <Shop />;
      case GameState.TOURNAMENT_LOBBY: return <TournamentLobby />;
      case GameState.TRAINING_RUNNING: return <TrainingRunning />;
      case GameState.TRAINING_SWIMMING: return <TrainingSwimming />;
      case GameState.TRAINING_FLYING: return <TrainingFlying />;
      case GameState.TYPING: case GameState.COUNTDOWN: return renderGame();
      default: return null;
    }
  }

  return (
    <div key={state.gameState} className="w-full max-w-6xl mx-auto flex flex-col items-center animate-fadeIn">
      {renderContent()}
    </div>
  );
};

export default App;