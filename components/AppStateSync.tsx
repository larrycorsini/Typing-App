
import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { useTypingGame } from '../hooks/useTypingGame';
import { GameState, GhostData, PlayerStats, RaceMode } from '../types';

let gameLoopInterval: NodeJS.Timeout | null = null;
let rankCounter = 1;

export const AppStateSync: React.FC = () => {
    const state = useStore();
    // The hook no longer returns `textToType`. It receives it as a one-way prop.
    const { typed, errors, stats, isFinished: hookIsFinished, reset, wpmHistory: hookWpmHistory } = useTypingGame(state.textToType, state.raceMode, state.gameState === GameState.TYPING);

    useEffect(() => { useStore.setState({ _resetTypingHook: reset }); }, [reset]);

    // This effect now correctly syncs only the state managed by the hook,
    // breaking the infinite loop.
    useEffect(() => {
        state._setTypingHookState({ typed, errors, playerStats: stats, isFinished: hookIsFinished, wpmHistory: hookWpmHistory });
    }, [typed, errors, stats, hookIsFinished, hookWpmHistory, state._setTypingHookState]);

    useEffect(() => {
        if (state.gameState === GameState.TYPING) {
            gameLoopInterval = setInterval(() => {
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
            const currentState = useStore.getState();
            const player = currentState.players.find(p => p.isPlayer);
            
            if(player && !player.rank && currentState.raceMode !== RaceMode.PARTY) {
                // FIX: Avoid direct state mutation. Create new objects for immutability.
                const rankedPlayer = { ...player, rank: rankCounter++ };
                
                useStore.setState(s => ({
                    players: s.players.map(p => p.id === rankedPlayer.id ? rankedPlayer : p)
                }));
                
                const { totalRaces, wins, avgWpm, avgAccuracy, bestWpm } = currentState.persistentPlayerStats;
                const newTotalRaces = totalRaces + 1;
                // Use the new, non-mutated object for calculations
                const newWins = wins + (rankedPlayer.rank === 1 ? 1 : 0);
                const newAvgWpm = ((avgWpm * totalRaces) + currentState.playerStats.wpm) / newTotalRaces;
                const newAvgAccuracy = ((avgAccuracy * totalRaces) + currentState.playerStats.accuracy) / newTotalRaces;
                const newBestWpm = Math.max(bestWpm, currentState.playerStats.wpm);
                
                const newStats: PlayerStats = { totalRaces: newTotalRaces, wins: newWins, bestWpm: newBestWpm, avgWpm: Math.round(newAvgWpm), avgAccuracy: Math.round(newAvgAccuracy) };
                useStore.setState({ persistentPlayerStats: newStats });
                localStorage.setItem('gemini-type-racer-stats', JSON.stringify(newStats));

                if (currentState.playerStats.wpm >= bestWpm) {
                     const ghostData: GhostData = { wpmHistory: currentState.wpmHistory, finalWpm: currentState.playerStats.wpm, textLength: currentState.textToType.length };
                     localStorage.setItem('gemini-type-racer-ghost', JSON.stringify(ghostData));
                }
            }
            useStore.getState().endRace();
        }
    }, [state.isFinished, state.gameState]);

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
