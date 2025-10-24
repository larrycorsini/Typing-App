import { create } from 'zustand';
import { GameState, Player, RaceMode, RaceTheme, Toast, TypingStats, WpmDataPoint, PlayerStats, Achievement, LeaderboardEntry, GhostData, PlayerSettings, UnlockedCustomizations } from './types';
import { useTypingGame } from './hooks/useTypingGame';
import { getTypingParagraph } from './services/geminiService';
import { soundService } from './services/soundService';
import { getAchievements, checkAndUnlockAchievements } from './services/achievementService';
import { getLeaderboard, addLeaderboardEntry } from './services/leaderboardService';
import { customizationService } from './services/customizationService';
import React, { useEffect } from 'react';

const BOT_NAMES = ['RacerX', 'Speedy', 'KeyMaster', 'TypoBot', 'CodeCrusher', 'LyricLover', 'QuoteQueen', 'GhostRider', 'PixelPusher', 'ByteBlaster'];
const PLAYER_ID = 'player-1';

const getBotWpmRange = (mode: RaceMode): [number, number] => {
  switch (mode) {
    case RaceMode.SOLO_EASY: return [30, 15]; // base, range -> 30-45 WPM
    case RaceMode.SOLO_MEDIUM: return [50, 20]; // -> 50-70 WPM
    case RaceMode.SOLO_HARD: return [70, 30]; // -> 70-100 WPM
    case RaceMode.PUBLIC: 
    case RaceMode.LIVE_RACE:
      return [40, 50]; // -> 40-90 WPM (wider range)
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
     case RaceMode.LIVE_RACE:
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
  lobbyCountdown: number;
  
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
  showSettingsModal: boolean;
  toasts: Toast[];

  // Persistent State
  persistentPlayerStats: PlayerStats;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  playerSettings: PlayerSettings;
  unlockedCustomizations: UnlockedCustomizations;

  // Actions
  setGameState: (state: GameState) => void;
  setPlayerName: (name: string) => void;
  setRaceMode: (mode: RaceMode) => void;
  setRaceTheme: (theme: RaceTheme) => void;
  initializeGame: () => Promise<void>;
  startLiveRaceLobby: () => void;
  startGame: () => void;
  updateGame: (deltaTime: number) => void;
  endRace: () => void;
  resetLobby: () => void;
  toggleMute: () => void;
  setShowStatsModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setShowAchievementsModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  applyTheme: (themeId: PlayerSettings['activeThemeId']) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Internal hook management
  _resetTypingHook: () => void;
  _setTypingHookState: (newState: Partial<Pick<AppState, 'typed' | 'errors' | 'playerStats' | 'isFinished' | 'wpmHistory'>>) => void;
}

let gameLoopInterval: NodeJS.Timeout | null = null;
let lobbyInterval: NodeJS.Timeout | null = null;
let rankCounter = 1;

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  gameState: GameState.NAME_SELECTION,
  playerName: '',
  raceMode: null,
  raceTheme: RaceTheme.HARRY_POTTER, // Default theme
  textToType: '',
  players: [],
  elapsedTime: 0,
  lobbyCountdown: 10,
  
  typed: '',
  errors: new Set(),
  playerStats: { wpm: 0, accuracy: 0, progress: 0 },
  isFinished: false,
  wpmHistory: [],

  isMuted: false,
  showStatsModal: false,
  showLeaderboardModal: false,
  showAchievementsModal: false,
  showSettingsModal: false,
  toasts: [],

  persistentPlayerStats: { totalRaces: 0, wins: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 },
  achievements: getAchievements(),
  leaderboard: getLeaderboard(),
  playerSettings: customizationService.getPlayerSettings(),
  unlockedCustomizations: customizationService.getUnlocked(),

  // Actions
  setGameState: (gameState) => {
    if(lobbyInterval) clearInterval(lobbyInterval);
    lobbyInterval = null;
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
    if (mode === RaceMode.LIVE_RACE) {
        get().startLiveRaceLobby();
    } else {
        get().initializeGame();
    }
  },
  setRaceTheme: (theme) => {
    set({ raceTheme: theme });
    if (get().raceMode !== RaceMode.LIVE_RACE) {
      get().initializeGame();
    }
  },
  initializeGame: async () => {
    const { playerName, raceMode, raceTheme, _resetTypingHook } = get();
    if (!playerName || !raceMode || !raceTheme) return;

    _resetTypingHook();
    rankCounter = 1;
    set({ textToType: 'Loading passage...' });

    const [baseWpm, range] = getBotWpmRange(raceMode);
    
    let paragraph = '';
    let initialPlayers: Player[] = [
        { id: PLAYER_ID, name: playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, wpmHistory: [] },
    ];
    
    if (get().gameState === GameState.LIVE_RACE_LOBBY) {
        const currentLobbyPlayers = get().players.filter(p => !p.isPlayer);
        initialPlayers.push(...currentLobbyPlayers);
    }

    if (raceMode === RaceMode.GHOST) {
        const ghostData: GhostData | null = JSON.parse(localStorage.getItem('gemini-type-racer-ghost') || 'null');
        if (ghostData) {
            paragraph = ' '.repeat(ghostData.textLength);
            initialPlayers.push({
                id: 'ghost-1', name: 'Your Best', isPlayer: false, isGhost: true, progress: 0, wpm: 0, accuracy: 100,
                targetWpm: ghostData.finalWpm, wpmHistory: ghostData.wpmHistory,
            });
        } else {
             set({textToType: "Could not load ghost data."}); return;
        }
    } else {
         paragraph = await getTypingParagraph(raceTheme, raceMode);
         if (get().gameState !== GameState.LIVE_RACE_LOBBY) {
           const numBots = raceMode === RaceMode.PUBLIC ? 4 : 2;
           const botNamePool = [...BOT_NAMES].sort(() => 0.5 - Math.random());
           for(let i=0; i<numBots; i++) {
              initialPlayers.push({
                  id: `bot-${i}`, name: botNamePool[i], isPlayer: false, progress: 0, wpm: 0, accuracy: 98,
                  targetWpm: Math.floor(Math.random() * range) + baseWpm, mistakeCycles: 0,
              });
           }
         }
    }
    
    set({ players: initialPlayers, textToType: paragraph });
  },
  startLiveRaceLobby: () => {
      set({ gameState: GameState.LIVE_RACE_LOBBY, lobbyCountdown: 10, players: [{ id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100 }] });
      const [baseWpm, range] = getBotWpmRange(RaceMode.LIVE_RACE);
      const botNamePool = [...BOT_NAMES].sort(() => 0.5 - Math.random());
      let playerJoinIndex = 0;

      lobbyInterval = setInterval(() => {
          const { lobbyCountdown, players } = get();
          if (lobbyCountdown > 0) {
              set({ lobbyCountdown: lobbyCountdown - 1 });
              // Add a player periodically
              if (lobbyCountdown % 2 === 0 && playerJoinIndex < botNamePool.length && players.length < 8) {
                  const newBot: Player = {
                      id: `bot-${playerJoinIndex}`, name: botNamePool[playerJoinIndex], isPlayer: false, progress: 0, wpm: 0, accuracy: 98,
                      targetWpm: Math.floor(Math.random() * range) + baseWpm, mistakeCycles: 0,
                  };
                  set({ players: [...players, newBot] });
                  playerJoinIndex++;
              }
          } else {
              clearInterval(lobbyInterval!);
              lobbyInterval = null;
              get().initializeGame().then(() => get().startGame());
          }
      }, 1000);
  },
  startGame: () => {
    const { textToType } = get();
    if (textToType && !textToType.startsWith('Loading')) {
      set({ elapsedTime: 0, gameState: GameState.COUNTDOWN });
    }
  },
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
        } else {
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
    const allFinished = get().players.length > 0 && get().players.every(p => p.progress >= 100);
    if (allFinished) get().endRace();
  },
  endRace: () => {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = null;
    set({ gameState: GameState.RESULTS });
    const { players, raceMode, raceTheme, persistentPlayerStats, addToast } = get();
    const player = players.find(p => p.isPlayer);
    soundService.playRaceFinish(player?.rank === 1);
    
    if (player && raceMode && raceTheme) {
        const newlyUnlocked = checkAndUnlockAchievements({ wpm: player.wpm, accuracy: player.accuracy, rank: player.rank!, theme: raceTheme, stats: persistentPlayerStats });
        newlyUnlocked.forEach(ach => {
            addToast({ message: `Achievement: ${ach.name}`, type: 'success' });
            if (ach.reward?.type === 'theme') {
                const unlocked = customizationService.unlockTheme(ach.reward.id);
                if(unlocked) addToast({ message: `Theme Unlocked: ${ach.reward.id}`, type: 'info' });
            }
        });

        if(raceMode !== RaceMode.GHOST) {
            addLeaderboardEntry({ name: player.name, wpm: player.wpm, accuracy: player.accuracy });
        }
    }
    set({ achievements: getAchievements(), leaderboard: getLeaderboard(), unlockedCustomizations: customizationService.getUnlocked() });
  },
  resetLobby: () => {
    get()._resetTypingHook();
    set({ raceMode: null, textToType: '', players: [], elapsedTime: 0 });
  },
  toggleMute: () => set({ isMuted: soundService.toggleMute() }),
  setShowStatsModal: (show) => set({ showStatsModal: show }),
  setShowLeaderboardModal: (show) => set({ showLeaderboardModal: show }),
  setShowAchievementsModal: (show) => set({ showAchievementsModal: show }),
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),
  applyTheme: (themeId) => {
      const newSettings: PlayerSettings = { ...get().playerSettings, activeThemeId: themeId };
      customizationService.savePlayerSettings(newSettings);
      set({ playerSettings: newSettings });
  },
  addToast: (toast) => {
    const id = Date.now().toString();
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  _resetTypingHook: () => {},
  _setTypingHookState: (newState) => set(newState),
}));

export const AppStateSync: React.FC = () => {
    const state = useStore();
    const { typed, errors, stats, isFinished: hookIsFinished, reset, wpmHistory: hookWpmHistory } = useTypingGame(state.textToType, state.gameState === GameState.TYPING);

    useEffect(() => { useStore.setState({ _resetTypingHook: reset }); }, [reset]);
    useEffect(() => {
        state._setTypingHookState({ typed, errors, playerStats: stats, isFinished: hookIsFinished, wpmHistory: hookWpmHistory });
    }, [typed, errors, stats, hookIsFinished, hookWpmHistory, state._setTypingHookState]);

    useEffect(() => {
        if (state.gameState === GameState.TYPING) {
            gameLoopInterval = setInterval(() => {
                useStore.setState(s => ({ elapsedTime: s.elapsedTime + 0.5 }));
                state.updateGame(0.5);
            }, 500);
        } else {
            if (gameLoopInterval) clearInterval(gameLoopInterval);
            gameLoopInterval = null;
        }
        return () => { if (gameLoopInterval) clearInterval(gameLoopInterval); };
    }, [state.gameState, state.updateGame]);
    
    useEffect(() => {
        if (state.isFinished) {
            let player = useStore.getState().players.find(p => p.isPlayer);
            if(player && !player.rank) {
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
        }
    }, [state.isFinished, state.playerStats, state.wpmHistory, state.textToType, state.playerName, state.persistentPlayerStats]);

    return null;
}