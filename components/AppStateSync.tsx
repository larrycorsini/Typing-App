import React, { useEffect } from 'react';
import { useStore } from '../store';
import { useTypingGame } from '../hooks/useTypingGame';
import { GameState, GhostData, PlayerStats, RaceMode } from '../types';
import { soundService } from '../services/soundService';
import { checkAndUnlockAchievements } from '../services/achievementService';
import { customizationService } from '../services/customizationService';
import { addLeaderboardEntry } from '../services/leaderboardService';

let gameLoopInterval: NodeJS.Timeout | null = null;
let rankCounter = 1;

export const AppStateSync: React.FC = () => {
    const state = useStore();
    const { typed, errors, stats, isFinished: hookIsFinished, reset, wpmHistory: hookWpmHistory, textToType: hookTextToType } = useTypingGame(state.textToType, state.raceMode, state.gameState === GameState.TYPING);

    useEffect(() => { useStore.setState({ _resetTypingHook: reset }); }, [reset]);
    useEffect(() => {
        state._setTypingHookState({ typed, errors, playerStats: stats, isFinished: hookIsFinished, wpmHistory: hookWpmHistory, textToType: hookTextToType });
    }, [typed, errors, stats, hookIsFinished, hookWpmHistory, hookTextToType, state._setTypingHookState]);

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
            let player = useStore.getState().players.find(p => p.isPlayer);
            if(player && !player.rank && state.raceMode !== RaceMode.PARTY) {
                player.rank = rankCounter++;
                useStore.setState(s => ({ players: s.players.map(p => p.id === player!.id ? player! : p)}));
                
                const { totalRaces, wins, avgWpm, avgAccuracy, bestWpm } = state.persistentPlayerStats;
                const newTotalRaces = totalRaces + 1;
                const newWins = wins + (player.rank === 1 ? 1 : 0);
                const newAvgWpm = ((avgWpm * totalRaces) + state.playerStats.wpm) / newTotalRaces;
                const newAvgAccuracy = ((avgAccuracy * totalRaces) + state.playerStats.accuracy) / newTotalRaces;
                const newBestWpm = Math.max(bestWpm, state.playerStats.wpm);
                
                const newStats: PlayerStats = { totalRaces: newTotalRaces, wins: newWins, bestWpm: newBestWpm, avgWpm: Math.round(newAvgWpm), avgAccuracy: Math.round(newAvgAccuracy) };
                useStore.setState({ persistentPlayerStats: newStats });
                localStorage.setItem('gemini-type-racer-stats', JSON.stringify(newStats));

                if (state.playerStats.wpm >= bestWpm) {
                     const ghostData: GhostData = { wpmHistory: state.wpmHistory, finalWpm: state.playerStats.wpm, textLength: state.textToType.length };
                     localStorage.setItem('gemini-type-racer-ghost', JSON.stringify(ghostData));
                }
            }
            useStore.getState().endRace();
        }
    }, [state.isFinished, state.gameState, state.playerStats, state.wpmHistory, state.textToType, state.playerName, state.persistentPlayerStats]);

    return null;
}
