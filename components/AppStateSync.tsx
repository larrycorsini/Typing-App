

import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { useTypingGame } from '../hooks/useTypingGame';
import { GameState, RaceMode } from '../types';

let gameLoopInterval: number | null = null;

export const AppStateSync: React.FC = () => {
    const state = useStore();
    const { typed, errors, stats, isFinished: hookIsFinished, reset, wpmHistory: hookWpmHistory } = useTypingGame(state.textToType, state.raceMode, state.gameState === GameState.TYPING);

    const endRaceAction = useStore(s => s.endRace);

    useEffect(() => { useStore.setState({ _resetTypingHook: reset }); }, [reset]);

    useEffect(() => {
        state._setTypingHookState({ typed, errors, playerStats: stats, isFinished: hookIsFinished, wpmHistory: hookWpmHistory });
    }, [typed, errors, stats, hookIsFinished, hookWpmHistory, state._setTypingHookState]);

    useEffect(() => {
        if (state.gameState === GameState.TYPING) {
            gameLoopInterval = window.setInterval(() => {
                useStore.setState(s => ({ elapsedTime: s.elapsedTime + 1 }));
                useStore.getState().updateGame(1);
            }, 1000);
        } else {
            if (gameLoopInterval) clearInterval(gameLoopInterval);
            gameLoopInterval = null;
        }
        return () => { if (gameLoopInterval) clearInterval(gameLoopInterval); };
    }, [state.gameState]);
    
    useEffect(() => {
        if (state.isFinished && state.gameState === GameState.TYPING) {
            endRaceAction();
        }
    }, [state.isFinished, state.gameState, endRaceAction]);

    // Effect to handle socket errors safely within the React lifecycle
    const { socketStatus, gameState, raceMode, addToast, setGameState } = useStore(s => ({
        socketStatus: s.socketStatus,
        gameState: s.gameState,
        raceMode: s.raceMode,
        addToast: s.addToast,
        setGameState: s.setGameState,
    }));

    const hasShownConnectionErrorToast = useRef(false);

    useEffect(() => {
        if (socketStatus === 'error') {
            if (hasShownConnectionErrorToast.current) return;
            hasShownConnectionErrorToast.current = true;

            const isInOnlineMode = gameState === GameState.ONLINE_LOBBY || raceMode === RaceMode.ONLINE_RACE;
            if (isInOnlineMode) {
                addToast({ message: "Connection lost. Returning to lobby.", type: 'error' });
                setGameState(GameState.LOBBY);
            } else {
                addToast({ message: "Connection to server failed. Online features are unavailable.", type: 'error' });
            }
        } else if (socketStatus === 'connected') {
            // Reset the flag once the connection is successful again
            hasShownConnectionErrorToast.current = false;
        }
    }, [socketStatus, gameState, raceMode, addToast, setGameState]);


    return null;
}