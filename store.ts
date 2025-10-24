import { create } from 'zustand';
import { GameState, Player, RaceMode, RaceTheme, Toast, TypingStats, WpmDataPoint, PlayerStats, Achievement, LeaderboardEntry, GhostData } from './types';
import { useTypingGame } from './hooks/useTypingGame';
import { getTypingParagraph } from './services/geminiService';
import { soundService } from './services/soundService';
import { getAchievements, checkAndUnlockAchievements } from './services/achievementService';
import { getLeaderboard, addLeaderboardEntry } from './services/leaderboardService';
// FIX: Import useEffect from react to resolve errors in AppStateSync component.
import React, { useEffect } from 'react';

const BOT_NAMES = ['RacerX', 'Speedy', 'KeyMaster', 'TypoBot', 'CodeCrusher', 'LyricLover', 'QuoteQueen'];
const PLAYER_ID = 'player-1';

const getBotWpmRange = (mode: RaceMode): [number, number] => {
  switch (mode) {
    case RaceMode.SOLO_EASY: return [30, 15]; // base, range -> 30-45 WPM
    case RaceMode.SOLO_MEDIUM: return [50, 20]; // -> 50-70 WPM
    case RaceMode.SOLO_HARD: return [70, 30]; // -> 70-100 WPM
    case RaceMode.PUBLIC: return [40, 50]; // -> 40-90 WPM (wider range)
    default: return [50, 20];
  }
}

const getBotBehavior = (mode: RaceMode) => {
  switch (mode) {
    case RaceMode.SOLO_EASY:
      return { mistakeChance: 0.05, mistakeDuration: 3, wpmFluctuation: 10 };
    case RaceMode.SOLO_MEDIUM:
      return { mistakeChance: 0.03, mistakeDuration: 2, wpmFluctuation: 20 };
    case RaceMode.SOLO_HARD:
      return { mistakeChance: 0.015, mistakeDuration: 1, wpmFluctuation: 25 };
     case RaceMode.PUBLIC:
      return { mistakeChance: 0.04, mistakeDuration: 2, wpmFluctuation: 35 };
    default:
      return { mistakeChance: 0.03, mistakeDuration: 2, wpmFluctuation: 20 };
  }
};

interface AppState {
  // Game State
  gameState: GameState;
  playerName: string;
  raceMode: RaceMode | null;
  raceTheme: RaceTheme | null;
  textToType: string;
  players: Player[];
  elapsedTime: number;
  
  // Typing Hook State
  typed: string;
  errors: Set<number>;
  playerStats: TypingStats;
  isFinished: boolean;
  wpmHistory: WpmDataPoint[];

  // UI State
  isMuted: boolean;
  showStatsModal: boolean;
  showLeaderboardModal: boolean;
  showAchievementsModal: boolean;
  toasts: Toast[];

  // Persistent State
  persistentPlayerStats: PlayerStats;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];

  // Actions
  setGameState: (state: GameState) => void;
  setPlayerName: (name: string) => void;
  setRaceMode: (mode: RaceMode) => void;
  setRaceTheme: (theme: RaceTheme) => void;
  initializeGame: () => Promise<void>;
  startGame: () => void;
  updateGame: (deltaTime: number) => void;
  endRace: () => void;
  resetLobby: () => void;
  toggleMute: () => void;
  setShowStatsModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setShowAchievementsModal: (show: boolean) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Internal hook management
  _resetTypingHook: () => void;
  _setTypingHookState: (newState: Partial<Pick<AppState, 'typed' | 'errors' | 'playerStats' | 'isFinished' | 'wpmHistory'>>) => void;
}

let gameLoopInterval: NodeJS.Timeout | null = null;
let rankCounter = 1;

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  gameState: GameState.NAME_SELECTION,
  playerName: '',
  raceMode: null,
  raceTheme: null,
  textToType: '',
  players: [],
  elapsedTime: 0,
  
  typed: '',
  errors: new Set(),
  playerStats: { wpm: 0, accuracy: 0, progress: 0 },
  isFinished: false,
  wpmHistory: [],

  isMuted: false,
  showStatsModal: false,
  showLeaderboardModal: false,
  showAchievementsModal: false,
  toasts: [],

  persistentPlayerStats: { totalRaces: 0, wins: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 },
  achievements: getAchievements(),
  leaderboard: getLeaderboard(),

  // Actions
  setGameState: (gameState) => {
    set({ gameState });
    if (gameState === GameState.LOBBY) {
        get().resetLobby();
    }
  },
  setPlayerName: (name) => {
    set({ playerName: name, gameState: GameState.LOBBY });
    const storedStats = localStorage.getItem('gemini-type-racer-stats');
    if(storedStats) {
        set({ persistentPlayerStats: JSON.parse(storedStats) });
    }
  },
  setRaceMode: (mode) => {
    set({ raceMode: mode });
    get().initializeGame();
  },
  setRaceTheme: (theme) => {
    set({ raceTheme: theme });
    get().initializeGame();
  },
  initializeGame: async () => {
    const { playerName, raceMode, raceTheme, _resetTypingHook } = get();
    if (!playerName || !raceMode || !raceTheme) return;

    _resetTypingHook();
    rankCounter = 1;
    set({ textToType: 'Loading passage...' });

    const [baseWpm, range] = getBotWpmRange(raceMode);
    
    let paragraph = '';
    const initialPlayers: Player[] = [
        { id: PLAYER_ID, name: playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, wpmHistory: [] },
    ];

    if (raceMode === RaceMode.GHOST) {
        const ghostData: GhostData | null = JSON.parse(localStorage.getItem('gemini-type-racer-ghost') || 'null');
        if (ghostData) {
            paragraph = ' '.repeat(ghostData.textLength); // Create a placeholder text of the right length
            initialPlayers.push({
                id: 'ghost-1', name: 'Your Best', isPlayer: false, isGhost: true, progress: 0, wpm: 0, accuracy: 100,
                targetWpm: ghostData.finalWpm,
                wpmHistory: ghostData.wpmHistory,
            });
        } else {
             set({textToType: "Could not load ghost data. Please select another mode."});
             return;
        }
    } else {
         paragraph = await getTypingParagraph(raceTheme, raceMode);
         const numBots = raceMode === RaceMode.PUBLIC ? 4 : 2;
         const botNamePool = [...BOT_NAMES].sort(() => 0.5 - Math.random());
         for(let i=0; i<numBots; i++) {
            initialPlayers.push({
                id: `bot-${i}`, name: botNamePool[i], isPlayer: false, progress: 0, wpm: 0, accuracy: 98,
                targetWpm: Math.floor(Math.random() * range) + baseWpm, mistakeCycles: 0,
            });
         }
    }
    
    set({ players: initialPlayers, textToType: paragraph });
  },
  startGame: () => {
    const { textToType } = get();
    if (textToType && !textToType.startsWith('Loading')) {
      set({ elapsedTime: 0, gameState: GameState.COUNTDOWN });
    }
  },
  // FIX: Added deltaTime parameter to match the interface and use it for calculations.
  updateGame: (deltaTime: number) => {
    const { raceMode, players, playerStats, wpmHistory, textToType } = get();
    if(!raceMode) return;
    const botBehavior = getBotBehavior(raceMode);
    
    const playerProgress = players.find(p => p.isPlayer)?.progress || 0;
    
    const updatedPlayers = players.map(p => {
        if (p.isPlayer) {
          return { ...p, progress: playerStats.progress, wpm: playerStats.wpm, accuracy: playerStats.accuracy, wpmHistory };
        }
        if (p.progress >= 100) return p;

        let newProgress = p.progress;
        let currentWpm = p.wpm;

        if (p.isGhost && p.wpmHistory) {
             const ghostElapsedTime = get().elapsedTime;
             const nextHistoryPoint = p.wpmHistory.find(h => h.time > ghostElapsedTime);
             newProgress = nextHistoryPoint ? nextHistoryPoint.progress : 100;
             currentWpm = nextHistoryPoint ? nextHistoryPoint.wpm : p.targetWpm || 0;
        } else { // Bot logic
            if (p.mistakeCycles && p.mistakeCycles > 0) {
              return { ...p, mistakeCycles: p.mistakeCycles - 1 };
            }
            if (Math.random() < botBehavior.mistakeChance) {
              return { ...p, mistakeCycles: botBehavior.mistakeDuration };
            }
            
            const isFallingBehind = !p.isPlayer && playerProgress > 10 && p.progress < playerProgress - 20;
            const targetWpm = p.targetWpm || 60;
            const randomFactor = (Math.random() - 0.5) * botBehavior.wpmFluctuation;
            const wpmBoost = isFallingBehind ? 15 : 0;
            currentWpm = Math.max(0, targetWpm + randomFactor + wpmBoost);
            const charsPerSecond = (currentWpm * 5) / 60;
            // FIX: Use deltaTime for progress calculation instead of a hardcoded value.
            const progressIncrement = (charsPerSecond / textToType.length) * 100 * deltaTime;
            
            newProgress = p.progress + progressIncrement;
        }
        
        if (newProgress >= 100 && !p.rank) {
          p.rank = rankCounter++;
          newProgress = 100;
        }

        return { ...p, progress: newProgress, wpm: Math.round(currentWpm) };
    });

    set({ players: updatedPlayers });

    // Check for game end
     const allFinished = get().players.length > 0 && get().players.every(p => p.progress >= 100);
    if (allFinished) {
      get().endRace();
    }
  },
  endRace: () => {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = null;
    set({ gameState: GameState.RESULTS });
    const { players, raceMode, raceTheme, persistentPlayerStats } = get();
    const player = players.find(p => p.isPlayer);
    soundService.playRaceFinish(player?.rank === 1);
    
    if (player && raceMode && raceTheme) {
        const newlyUnlocked = checkAndUnlockAchievements({
            wpm: player.wpm,
            accuracy: player.accuracy,
            rank: player.rank!,
            theme: raceTheme,
            stats: persistentPlayerStats,
        });
        newlyUnlocked.forEach(ach => get().addToast({ message: `Achievement: ${ach.name}`, type: 'success' }));

        if(raceMode !== RaceMode.GHOST) {
            addLeaderboardEntry({ name: player.name, wpm: player.wpm, accuracy: player.accuracy });
        }
    }
    set({ achievements: getAchievements(), leaderboard: getLeaderboard() });

  },
  resetLobby: () => {
    get()._resetTypingHook();
    set({
      raceMode: null,
      raceTheme: null,
      textToType: '',
      players: [],
      elapsedTime: 0,
    });
  },
  toggleMute: () => {
    const muted = soundService.toggleMute();
    set({ isMuted: muted });
  },
  setShowStatsModal: (show) => set({ showStatsModal: show }),
  setShowLeaderboardModal: (show) => set({ showLeaderboardModal: show }),
  setShowAchievementsModal: (show) => set({ showAchievementsModal: show }),
  addToast: (toast) => {
    const id = Date.now().toString();
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  _resetTypingHook: () => { /* This will be overwritten by the component */ },
  _setTypingHookState: (newState) => set(newState),
}));

export const AppStateSync: React.FC = () => {
    const { gameState, isFinished, playerStats, wpmHistory, textToType, playerName, _setTypingHookState, _resetTypingHook, updateGame } = useStore();
    const { typed, errors, stats, isFinished: hookIsFinished, reset, wpmHistory: hookWpmHistory } = useTypingGame(textToType, gameState === GameState.TYPING);

    useEffect(() => {
        useStore.setState({ _resetTypingHook: reset });
    }, [reset]);

    useEffect(() => {
        _setTypingHookState({
            typed,
            errors,
            playerStats: stats,
            isFinished: hookIsFinished,
            wpmHistory: hookWpmHistory,
        });
    }, [typed, errors, stats, hookIsFinished, hookWpmHistory, _setTypingHookState]);

    useEffect(() => {
        if (gameState === GameState.TYPING) {
            gameLoopInterval = setInterval(() => {
                useStore.setState(s => ({ elapsedTime: s.elapsedTime + 0.5 }));
                // FIX: Pass the delta time (0.5 seconds) to the updateGame function.
                updateGame(0.5);
            }, 500);
        } else {
            if (gameLoopInterval) clearInterval(gameLoopInterval);
            gameLoopInterval = null;
        }
        return () => {
            if (gameLoopInterval) clearInterval(gameLoopInterval);
        };
    }, [gameState, updateGame]);
    
    useEffect(() => {
        if (isFinished) {
            let playerRank = useStore.getState().players.find(p => p.isPlayer)?.rank;
            if(!playerRank) {
                playerRank = rankCounter++;
                const newPlayers = useStore.getState().players.map(p => p.isPlayer ? { ...p, rank: playerRank } : p);
                useStore.setState({ players: newPlayers });

                const { totalRaces, wins, avgWpm, avgAccuracy } = useStore.getState().persistentPlayerStats;
                const newTotalRaces = totalRaces + 1;
                const newWins = wins + (playerRank === 1 ? 1 : 0);
                const newAvgWpm = ((avgWpm * totalRaces) + playerStats.wpm) / newTotalRaces;
                const newAvgAccuracy = ((avgAccuracy * totalRaces) + playerStats.accuracy) / newTotalRaces;
                const newBestWpm = Math.max(useStore.getState().persistentPlayerStats.bestWpm, playerStats.wpm);
                
                const newStats = { totalRaces: newTotalRaces, wins: newWins, bestWpm: newBestWpm, avgWpm: Math.round(newAvgWpm), avgAccuracy: Math.round(newAvgAccuracy) };
                useStore.setState({ persistentPlayerStats: newStats });
                localStorage.setItem('gemini-type-racer-stats', JSON.stringify(newStats));

                if (playerStats.wpm >= newBestWpm) {
                     const ghostData: GhostData = { wpmHistory, finalWpm: playerStats.wpm, textLength: textToType.length };
                     localStorage.setItem('gemini-type-racer-ghost', JSON.stringify(ghostData));
                }
            }
        }
    }, [isFinished, playerStats, wpmHistory, textToType, playerName]);

    return null;
}