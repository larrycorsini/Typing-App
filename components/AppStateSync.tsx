

import React, { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store';
import { GameState, RaceMode } from '../types';

let gameLoopInterval: number | null = null;
let statsInterval: number | null = null;

export const AppStateSync: React.FC = () => {
    // Select state and actions from the store
    const {
        gameState,
        isFinished,
        typedLength,
        endRace,
        handleKeyDown,
        calculateStats,
        socketStatus,
        raceMode,
        addToast,
        setGameState,
    } = useStore(s => ({
        gameState: s.gameState,
        isFinished: s.isFinished,
        typedLength: s.typed.length,
        endRace: s.endRace,
        handleKeyDown: s.handleKeyDown,
        calculateStats: s._calculateStats,
        socketStatus: s.socketStatus,
        raceMode: s.raceMode,
        addToast: s.addToast,
        setGameState: s.setGameState,
    }));

    // Game loop for bot movement and elapsed time
    useEffect(() => {
        if (gameState === GameState.TYPING) {
            gameLoopInterval = window.setInterval(() => {
                useStore.setState(s => ({ elapsedTime: s.elapsedTime + 1 }));
                useStore.getState().updateGame(1);
            }, 1000);
        } else {
            if (gameLoopInterval) clearInterval(gameLoopInterval);
            gameLoopInterval = null;
        }
        return () => { if (gameLoopInterval) clearInterval(gameLoopInterval); };
    }, [gameState]);

    // Interval to calculate player stats (WPM, accuracy)
    useEffect(() => {
        if (gameState === GameState.TYPING && typedLength > 0) {
            statsInterval = window.setInterval(() => {
                calculateStats();
            }, 500);
        } else {
            if (statsInterval) clearInterval(statsInterval);
            statsInterval = null;
        }
        return () => { if (statsInterval) clearInterval(statsInterval); }
    }, [gameState, typedLength, calculateStats]);

    // End the race when finished
    useEffect(() => {
        if (isFinished && gameState === GameState.TYPING) {
            endRace();
        }
    }, [isFinished, gameState, endRace]);

    // Keyboard event listener
    const onKeyDown = useCallback((e: KeyboardEvent) => {
        const isGameActive = useStore.getState().gameState === GameState.TYPING;
        if (!isGameActive) return;

        const { key } = e;
        if (key === 'Backspace') {
            e.preventDefault();
            handleKeyDown('', true);
        } else if (key.length === 1) { 
            e.preventDefault();
            handleKeyDown(key, false);
        }
    }, [handleKeyDown]);

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [onKeyDown]);
    
    // Effect to handle socket errors safely within the React lifecycle
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