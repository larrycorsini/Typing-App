import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { GameState, RaceMode, RaceTheme } from '../types';
import CharacterDisplay from './CharacterDisplay';
import { RACE_ENERGY_COST } from '../services/characterService';

const Lobby: React.FC = () => {
    const state = useStore();
    const [isGhostAvailable, setIsGhostAvailable] = useState(false);

    useEffect(() => {
        setIsGhostAvailable(!!localStorage.getItem('gemini-type-racer-ghost'));
    }, [state.gameState]);

    const isConnecting = state.socketStatus === 'connecting' || state.socketStatus === 'disconnected';
    const hasEnoughEnergy = state.playerCharacter.energy >= RACE_ENERGY_COST;

    const modeButtonClass = (mode: RaceMode, color: string) => {
        const isActive = state.raceMode === mode;
        return `btn-mode ${isActive ? `active-${color}` : ''}`;
    }

    return (
        <div className="text-center w-full max-w-4xl flex flex-col items-center gap-6">
            {/* Character Display */}
            <div className="relative">
                <CharacterDisplay character={state.playerCharacter} />
                <button 
                  onClick={() => state.setShowCharacterModal(true)} 
                  className="absolute -bottom-2 -right-2 bg-slate-700 hover:bg-slate-600 text-white font-bold w-10 h-10 rounded-full text-xl transition-colors border-2 border-slate-600 flex items-center justify-center"
                  aria-label="Customize character"
                >
                    ✏️
                </button>
            </div>

            {/* Race Modes Card */}
            <div className="card w-full max-w-2xl">
                <h3 className="text-xl text-slate-300 font-bold mb-4">Select Race Mode</h3>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    <button onClick={() => state.setRaceMode(RaceMode.SOLO_EASY)} className={modeButtonClass(RaceMode.SOLO_EASY, 'easy')}>Solo Easy</button>
                    <button onClick={() => state.setRaceMode(RaceMode.SOLO_MEDIUM)} className={modeButtonClass(RaceMode.SOLO_MEDIUM, 'medium')}>Solo Medium</button>
                    <button onClick={() => state.setRaceMode(RaceMode.SOLO_HARD)} className={modeButtonClass(RaceMode.SOLO_HARD, 'hard')}>Solo Hard</button>
                    <button onClick={() => state.setRaceMode(RaceMode.ONLINE_RACE)} disabled={isConnecting} title={isConnecting ? 'Connecting...' : 'Race Online'} className={modeButtonClass(RaceMode.ONLINE_RACE, 'online')}>Online Race</button>
                    <button onClick={() => state.setRaceMode(RaceMode.GHOST)} disabled={!isGhostAvailable} className={modeButtonClass(RaceMode.GHOST, 'ghost')}>Vs Ghost</button>
                    <button onClick={() => state.setRaceMode(RaceMode.PARTY)} className={modeButtonClass(RaceMode.PARTY, 'party')}>Party Race</button>
                </div>
                 <button 
                    onClick={state.startGame} 
                    disabled={!state.raceMode || !hasEnoughEnergy || (state.raceMode.startsWith('SOLO') && !state.raceTheme) || state.textToType.startsWith('Loading')} 
                    className="btn btn-primary w-full text-2xl py-3"
                >
                    {!hasEnoughEnergy ? `Not Enough Energy (${RACE_ENERGY_COST})` : state.textToType.startsWith('Loading') ? 'Loading Text...' : 'Start Race'}
                </button>
            </div>
            
            {/* Theme Selection Card (if applicable) */}
             {state.raceMode && state.raceMode.startsWith('SOLO') && (
                <div className="card w-full max-w-2xl animate-fadeIn">
                    <h3 className="text-xl text-slate-300 font-bold mb-3">Choose a Theme</h3>
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {(Object.keys(RaceTheme) as Array<keyof typeof RaceTheme>).map(key => (
                        <button key={key} onClick={() => state.setRaceTheme(RaceTheme[key])} className={`btn-mode ${state.raceTheme === RaceTheme[key] ? 'active active-online' : ''}`}>
                          {key.replace(/_/g, ' ')}
                        </button>
                    ))}
                    </div>
                </div>
            )}
            
            {/* Other Actions Card */}
            <div className="card w-full max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <h3 className="text-xl text-cyan-300 font-bold mb-3">Practice & Challenges</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => state.setGameState(GameState.COURSE_LOBBY)} className="btn btn-secondary">Typing Course</button>
                            <button onClick={() => state.setRaceMode(RaceMode.ENDURANCE)} className="btn btn-secondary">Endurance (60s)</button>
                            <button onClick={() => state.setRaceMode(RaceMode.CUSTOM_TEXT)} className="btn btn-secondary">Custom Text</button>
                            <button onClick={() => state.setRaceMode(RaceMode.DAILY_CHALLENGE)} disabled={isConnecting} title={isConnecting ? 'Connecting...' : 'Daily Challenge'} className="btn btn-secondary">Daily Challenge</button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl text-amber-300 font-bold mb-3">Duck Life</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => state.setGameState(GameState.TRAINING_GROUND)} className="btn btn-secondary">Training Ground</button>
                            <button onClick={() => state.setGameState(GameState.SHOP)} className="btn btn-secondary">Shop</button>
                            <button onClick={() => state.setGameState(GameState.TOURNAMENT_LOBBY)} className="btn btn-secondary">Championship</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;