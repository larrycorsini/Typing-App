import { create } from 'zustand';
import { GameState, Player, RaceMode, RaceTheme, Toast, TypingStats, WpmDataPoint, PlayerStats, Achievement, LeaderboardEntry, GhostData, PlayerSettings, UnlockedCustomizations, PartyPlayer, RoomInfo, ServerToClientMessage, CourseLesson } from './types';
import { getTypingParagraph } from './services/geminiService';
import { soundService } from './services/soundService';
import { getAchievements, checkAndUnlockAchievements } from './services/achievementService';
import { getLeaderboard, addLeaderboardEntry } from './services/leaderboardService';
import { customizationService } from './services/customizationService';
import { websocketService } from './services/websocketService';
import { courseService } from './services/courseService';

const BOT_NAMES = ['RacerX', 'Speedy', 'KeyMaster', 'TypoBot', 'CodeCrusher', 'LyricLover', 'QuoteQueen', 'GhostRider', 'PixelPusher', 'ByteBlaster'];
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

const ENDURANCE_WORD_POOL = "the of to and a in is it you that he was for on are with as I his they be at one have this from or had by but what some we can out other were all there when up use your how said an each she which do their time if will way about many then them write would like so these her long make thing see him two has look who may part come its now find than first water been called who am its now find day did get come made may part".split(" ");

const generateEnduranceText = () => {
    let words = [];
    for (let i = 0; i < 200; i++) {
        words.push(ENDURANCE_WORD_POOL[Math.floor(Math.random() * ENDURANCE_WORD_POOL.length)]);
    }
    return words.join(" ");
};

type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface AppState {
  // Game State
  gameState: GameState;
  playerName: string;
  raceMode: RaceMode | null;
  raceTheme: RaceTheme | null;
  textToType: string;
  players: Player[];
  elapsedTime: number;
  textGenerationRequestCounter: number;

  // Online Race State
  socketStatus: SocketStatus;
  onlineRooms: RoomInfo[];
  currentRoomId: string | null;
  myId: string | null; // Our server-authoritative ID
  onlineCountdown: number;

  // Party Race State
  partyPlayers: PartyPlayer[];
  currentPartyPlayerIndex: number;

  // Typing Course State
  courseProgress: number; // Highest unlocked lesson ID
  currentLesson: CourseLesson | null;

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
  showTutorialModal: boolean;
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
  setRaceMode: (mode: RaceMode) => Promise<void>;
  setRaceTheme: (theme: RaceTheme) => void;
  initializeGame: () => Promise<void>;
  startGame: () => void;
  updateGame: (deltaTime: number) => void;
  endRace: () => void;
  resetLobby: () => void;

  // Online Actions
  setSocketStatus: (status: SocketStatus) => void;
  handleServerMessage: (message: ServerToClientMessage) => void;
  connectToServer: () => void;
  createOnlineRoom: () => void;
  joinOnlineRoom: (roomId: string) => void;
  leaveOnlineRoom: () => void;

  // New Mode Actions
  startCustomTextGame: (text: string) => void;

  // Course Actions
  startCourseLesson: (lesson: CourseLesson) => void;
  
  // Party Race Actions
  addPartyPlayer: (name: string) => void;
  removePartyPlayer: (name: string) => void;
  startPartySetup: () => void;
  startPartyGame: () => void;
  nextPartyTurn: () => void;
  prepareNextPartyTurn: () => void;

  toggleMute: () => void;
  setShowStatsModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setShowAchievementsModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowTutorialModal: (show: boolean) => void;
  applyTheme: (themeId: PlayerSettings['activeThemeId']) => void;
  applySoundPack: (packId: PlayerSettings['activeSoundPackId']) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Internal hook management
  _resetTypingHook: () => void;
  _setTypingHookState: (newState: Partial<Pick<AppState, 'typed' | 'errors' | 'playerStats' | 'isFinished' | 'wpmHistory'>>) => void;
}

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
  textGenerationRequestCounter: 0,
  
  socketStatus: 'disconnected',
  onlineRooms: [],
  currentRoomId: null,
  myId: null,
  onlineCountdown: 0,

  partyPlayers: [],
  currentPartyPlayerIndex: 0,

  courseProgress: 1,
  currentLesson: null,

  typed: '',
  errors: new Set(),
  playerStats: { wpm: 0, accuracy: 0, progress: 0, mistypedChars: {} },
  isFinished: false,
  wpmHistory: [],

  isMuted: false,
  showStatsModal: false,
  showLeaderboardModal: false,
  showAchievementsModal: false,
  showSettingsModal: false,
  showTutorialModal: false,
  toasts: [],

  persistentPlayerStats: { totalRaces: 0, wins: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 },
  achievements: getAchievements(),
  leaderboard: getLeaderboard(),
  playerSettings: customizationService.getPlayerSettings(),
  unlockedCustomizations: customizationService.getUnlocked(),

  // Actions
  setGameState: (gameState) => {
    set({ gameState });
    if (gameState === GameState.LOBBY) {
        get().resetLobby();
    }
  },
  setPlayerName: (name) => {
    const tutorialSeen = localStorage.getItem('gemini-type-racer-tutorial-seen') === 'true';

    set({ 
        playerName: name, 
        gameState: GameState.LOBBY,
        showTutorialModal: !tutorialSeen,
        courseProgress: courseService.getCourseProgress(),
    });
    
    const storedStats = localStorage.getItem('gemini-type-racer-stats');
    if(storedStats) {
        set({ persistentPlayerStats: JSON.parse(storedStats) });
    }
    soundService.setSoundPack(get().playerSettings.activeSoundPackId); // Initialize sound pack
    get().connectToServer(); // Connect to WebSocket server
  },
  setRaceMode: async (mode) => {
    set({ raceMode: mode, raceTheme: mode.startsWith('SOLO') ? get().raceTheme : null });
    if (mode === RaceMode.ONLINE_RACE) {
        set({ gameState: GameState.ONLINE_LOBBY });
        websocketService.sendMessage({type: 'getRoomList'});
    } else if (mode === RaceMode.PARTY) {
        get().startPartySetup();
    } else if (mode === RaceMode.CUSTOM_TEXT) {
        set({ gameState: GameState.CUSTOM_TEXT_SETUP });
    } else if (mode === RaceMode.DAILY_CHALLENGE) {
        set({ textToType: 'Loading daily challenge...' });
        websocketService.sendMessage({ type: 'getDailyChallenge' });
    } else {
        await get().initializeGame();
    }
  },
  setRaceTheme: (theme) => {
    set({ raceTheme: theme });
    if (get().raceMode && !get().raceMode?.startsWith('ONLINE') && get().raceMode !== 'DAILY_CHALLENGE') {
      get().initializeGame();
    }
  },
  initializeGame: async () => {
    const { playerName, raceMode, raceTheme, _resetTypingHook } = get();
    if (!playerName || !raceMode) return;
    if (raceMode.startsWith('SOLO') && !raceTheme) return;

    _resetTypingHook();
    rankCounter = 1;
    set({ textToType: 'Loading passage...', currentLesson: null });

    const currentRequestId = get().textGenerationRequestCounter + 1;
    set({ textGenerationRequestCounter: currentRequestId });

    const [baseWpm, range] = getBotWpmRange(raceMode);
    
    let paragraph = '';
    let initialPlayers: Player[] = [
        { id: PLAYER_ID, name: playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, wpmHistory: [] },
    ];
    
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
    } else if (![RaceMode.PARTY, RaceMode.ONLINE_RACE, RaceMode.ENDURANCE, RaceMode.CUSTOM_TEXT, RaceMode.DAILY_CHALLENGE, RaceMode.COURSE].includes(raceMode)) {
         const fetchedParagraph = await getTypingParagraph(raceTheme!, raceMode);
         if (get().textGenerationRequestCounter !== currentRequestId) return;
         paragraph = fetchedParagraph;
         
         const numBots = raceMode === RaceMode.PUBLIC ? 4 : 2;
         const botNamePool = [...BOT_NAMES].sort(() => 0.5 - Math.random());
         for(let i=0; i<numBots; i++) {
            initialPlayers.push({
                id: `bot-${i}`, name: botNamePool[i], isPlayer: false, progress: 0, wpm: 0, accuracy: 98,
                targetWpm: Math.floor(Math.random() * range) + baseWpm, mistakeCycles: 0,
            });
         }
    } else if (raceMode === RaceMode.PARTY) {
        const fetchedParagraph = await getTypingParagraph(RaceTheme.HARRY_POTTER, RaceMode.SOLO_MEDIUM); // Party mode uses medium text
        if (get().textGenerationRequestCounter !== currentRequestId) return;
        paragraph = fetchedParagraph;
    } else if (raceMode === RaceMode.ENDURANCE) {
        paragraph = generateEnduranceText();
    }
    
    set({ players: initialPlayers, textToType: paragraph });
  },
  startGame: () => {
    const { textToType, raceMode } = get();
    if (textToType && !textToType.startsWith('Loading')) {
       if (raceMode === RaceMode.ONLINE_RACE) {
            set({ gameState: GameState.COUNTDOWN }); // Server dictates start, but client shows countdown for feel
       } else {
           set({ elapsedTime: 0, gameState: GameState.COUNTDOWN });
       }
    }
  },
  updateGame: (deltaTime: number) => {
    set(state => {
        if (state.gameState !== GameState.TYPING || !state.raceMode) {
            return state;
        }

        if (state.raceMode === RaceMode.ONLINE_RACE) {
            websocketService.sendMessage({ type: 'progressUpdate', progress: state.playerStats.progress, wpm: state.playerStats.wpm });
            // FIX: Explicitly map properties for type safety and to avoid adding extra fields to the player object.
            return {
                players: state.players.map(p =>
                    p.isPlayer
                        ? {
                              ...p,
                              progress: state.playerStats.progress,
                              wpm: state.playerStats.wpm,
                              accuracy: state.playerStats.accuracy,
                              wpmHistory: state.wpmHistory,
                          }
                        : p
                ),
            };
        }

        const botBehavior = getBotBehavior(state.raceMode);
        const playerProgress = state.playerStats.progress || 0;
        
        const updatedPlayers = state.players.map(p => {
            if (p.isPlayer) {
              return { ...p, progress: state.playerStats.progress, wpm: state.playerStats.wpm, accuracy: state.playerStats.accuracy, wpmHistory: state.wpmHistory };
            }
            if (p.progress >= 100) return p;
            
            let newProgress = p.progress;
            let currentWpm = p.wpm;

            if (p.isGhost && p.wpmHistory) {
                 const ghostElapsedTime = state.elapsedTime;
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
                currentWpm = Math.max(20, targetWpm + randomFactor + wpmBoost);
                const charsPerSecond = (currentWpm * 5) / 60;
                const progressIncrement = (charsPerSecond / (state.textToType.length || 500)) * 100 * deltaTime;
                newProgress = p.progress + progressIncrement;
            }

            if (newProgress >= 100 && !p.rank) {
              p.rank = rankCounter++;
              newProgress = 100;
            }
            return { ...p, progress: Math.min(100, newProgress), wpm: Math.round(currentWpm), isFallingBehind: p.isFallingBehind };
        });

        return { players: updatedPlayers };
    });
  },
  endRace: () => {
    if (get().gameState === GameState.RESULTS) return;
    
    if (get().raceMode === RaceMode.PARTY) {
        get().nextPartyTurn();
        return; 
    }
    if (get().raceMode === RaceMode.ONLINE_RACE) {
        const { playerStats } = get();
        websocketService.sendMessage({ type: 'raceFinished', wpm: playerStats.wpm, accuracy: playerStats.accuracy });
    }
    
    if (get().raceMode === RaceMode.COURSE) {
        const { currentLesson, playerStats, courseProgress, addToast } = get();
        if (currentLesson) {
            const passed = playerStats.wpm >= currentLesson.goals.wpm && playerStats.accuracy >= currentLesson.goals.accuracy;
            if (passed) {
                addToast({ message: "Lesson Complete!", type: 'success' });
                const nextLessonId = currentLesson.id + 1;
                if (nextLessonId > courseProgress && nextLessonId <= courseService.getTotalLessons()) {
                    courseService.saveCourseProgress(nextLessonId);
                    set({ courseProgress: nextLessonId });
                }
            } else {
                addToast({ message: "Keep practicing!", type: 'info' });
            }
        }
        set({ gameState: GameState.RESULTS });
        return;
    }


    const { players, raceMode, raceTheme, persistentPlayerStats, addToast, playerStats } = get();
    
    let finalPlayers = [...players];
    if (raceMode !== RaceMode.ONLINE_RACE) {
        const sortedByRank = [...players].filter(p => p.rank).sort((a, b) => a.rank! - b.rank!);
        const sortedByProgress = [...players].filter(p => !p.rank).sort((a,b) => b.progress - a.progress);
        
        let currentRank = sortedByRank.length;
        finalPlayers = [...sortedByRank, ...sortedByProgress.map(p => ({...p, rank: ++currentRank}))];
    }

    set({ gameState: GameState.RESULTS, players: finalPlayers });
    const playerResult = finalPlayers.find(p => p.isPlayer);
    soundService.playRaceFinish(playerResult?.rank === 1);
    
    // FIX: Removed `&& raceTheme !== null` to correctly save stats for themeless modes like Endurance.
    if (playerResult && raceMode) {
        const newlyUnlocked = checkAndUnlockAchievements({ wpm: playerStats.wpm, accuracy: playerStats.accuracy, rank: playerResult.rank!, theme: raceTheme, mode: raceMode, stats: persistentPlayerStats });
        newlyUnlocked.forEach(ach => {
            addToast({ message: `Achievement: ${ach.name}`, type: 'success' });
            if (ach.reward?.type === 'theme') {
                if (customizationService.unlockTheme(ach.reward.id))
                    addToast({ message: `Theme Unlocked: ${ach.reward.id}`, type: 'info' });
            }
            if (ach.reward?.type === 'soundPack') {
                if (customizationService.unlockSoundPack(ach.reward.id))
                    addToast({ message: `Sound Pack Unlocked: ${ach.reward.id}`, type: 'info' });
            }
        });

        if(raceMode !== RaceMode.GHOST) {
            addLeaderboardEntry({ name: playerResult.name, wpm: playerStats.wpm, accuracy: playerStats.accuracy });
        }
    }
    set({ achievements: getAchievements(), leaderboard: getLeaderboard(), unlockedCustomizations: customizationService.getUnlocked() });
  },
  resetLobby: () => {
    get()._resetTypingHook();
    get().leaveOnlineRoom();
    set({ raceMode: null, textToType: '', players: [], elapsedTime: 0, partyPlayers: [], currentPartyPlayerIndex: 0, currentLesson: null });
  },
  
  // Online Actions
  setSocketStatus: (status) => {
    set({ socketStatus: status });
  },
  handleServerMessage: (message) => {
    switch (message.type) {
        case 'roomList':
            set({ onlineRooms: message.rooms });
            break;
        case 'joinedRoom':
            const players = message.room.players.map(p => ({
                id: p.id,
                name: p.name,
                isPlayer: p.id === message.yourId, // Use server-authoritative ID
                progress: 0, wpm: 0, accuracy: 100,
            }));
            set({ currentRoomId: message.room.id, players, myId: message.yourId });
            break;
        case 'playerJoined':
             set(state => ({ players: [...state.players, { id: message.player.id, name: message.player.name, isPlayer: false, progress: 0, wpm: 0, accuracy: 100}] }));
             break;
        case 'playerLeft':
             set(state => ({ players: state.players.filter(p => p.id !== message.playerId) }));
             break;
        case 'raceStarting':
            set({ onlineCountdown: message.countdown });
            break;
        case 'raceStart':
            set(state => {
                const updatedPlayers = state.players.map(p => ({ ...p, progress: 0, wpm: 0, rank: undefined }));
                return { gameState: GameState.TYPING, elapsedTime: 0, onlineCountdown: 0, players: updatedPlayers };
            });
            break;
        case 'progressUpdate':
            set(state => ({
                players: state.players.map(p => p.id === message.playerId ? { ...p, progress: message.progress, wpm: message.wpm } : p)
            }));
            break;
        case 'playerFinished':
            set(state => {
                let rank = state.players.filter(p => p.rank).length + 1;
                return {
                    players: state.players.map(p => p.id === message.playerId ? { ...p, progress: 100, wpm: message.wpm, accuracy: message.accuracy, rank } : p)
                }
            });
            break;
        case 'dailyChallenge':
            get()._resetTypingHook();
            rankCounter = 1;
            set(state => ({ 
                textToType: message.text,
                players: [{
                    id: PLAYER_ID, 
                    name: state.playerName, 
                    isPlayer: true, 
                    progress: 0, wpm: 0, accuracy: 100, wpmHistory: []
                }]
            }));
            break;
        case 'error':
            get().addToast({ message: message.message, type: 'error' });
            break;
    }
  },
  connectToServer: () => websocketService.connect(),
  createOnlineRoom: () => websocketService.sendMessage({ type: 'createRoom', playerName: get().playerName }),
  joinOnlineRoom: (roomId) => websocketService.sendMessage({ type: 'joinRoom', roomId, playerName: get().playerName }),
  leaveOnlineRoom: () => {
    // Implement leave room message if needed, for now handled by disconnect
    set({ currentRoomId: null, players: [], myId: null });
  },

  startCustomTextGame: (text) => {
    if (!text.trim()) return;
    set({ textToType: text.trim(), players: [{ id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100 }] });
    get().startGame();
  },

  // Course Actions
  startCourseLesson: (lesson) => {
    get()._resetTypingHook();
    rankCounter = 1;
    set({
      raceMode: RaceMode.COURSE,
      currentLesson: lesson,
      textToType: lesson.text,
      players: [{ id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100 }],
      elapsedTime: 0,
      gameState: GameState.COUNTDOWN,
    });
  },

  // Party Race Actions
  addPartyPlayer: (name) => {
    set(state => {
        if (state.partyPlayers.length >= 4 || state.partyPlayers.find(p => p.name.toLowerCase() === name.toLowerCase()) || !name.trim()) {
            return state;
        }
        return { partyPlayers: [...state.partyPlayers, { name: name.trim(), wpm: 0, accuracy: 0 }] };
    });
  },
  removePartyPlayer: (name) => {
    set(state => ({ partyPlayers: state.partyPlayers.filter(p => p.name !== name) }));
  },
  startPartySetup: () => {
    set({
        gameState: GameState.PARTY_SETUP,
        raceMode: RaceMode.PARTY,
        partyPlayers: [],
        currentPartyPlayerIndex: 0
    });
    get().initializeGame();
  },
  startPartyGame: () => {
    if (get().partyPlayers.length === 0) return;
    const firstPlayerName = get().partyPlayers[0].name;
    set({
        players: [{ id: PLAYER_ID, name: firstPlayerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100 }],
        gameState: GameState.COUNTDOWN,
    });
  },
  nextPartyTurn: () => {
    const { playerStats, currentPartyPlayerIndex, partyPlayers } = get();

    const updatedPartyPlayers = [...partyPlayers];
    updatedPartyPlayers[currentPartyPlayerIndex] = {
        ...updatedPartyPlayers[currentPartyPlayerIndex],
        wpm: playerStats.wpm,
        accuracy: playerStats.accuracy
    };

    const nextIndex = currentPartyPlayerIndex + 1;

    if (nextIndex >= partyPlayers.length) {
        const finalRankedPlayers = updatedPartyPlayers
            .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
            .map((p, i) => ({ ...p, rank: i + 1 }));
        set({ partyPlayers: finalRankedPlayers, gameState: GameState.RESULTS });
        soundService.playRaceFinish(true);
    } else {
        set({
            partyPlayers: updatedPartyPlayers,
            currentPartyPlayerIndex: nextIndex,
            gameState: GameState.PARTY_TRANSITION,
        });
    }
  },
  prepareNextPartyTurn: () => {
    get()._resetTypingHook();
    const { partyPlayers, currentPartyPlayerIndex } = get();
    const nextPlayerName = partyPlayers[currentPartyPlayerIndex].name;
    set(state => ({
        players: [{ ...state.players[0], name: nextPlayerName }],
        gameState: GameState.COUNTDOWN,
    }));
  },

  toggleMute: () => set({ isMuted: soundService.toggleMute() }),
  setShowStatsModal: (show) => set({ showStatsModal: show }),
  setShowLeaderboardModal: (show) => set({ showLeaderboardModal: show }),
  setShowAchievementsModal: (show) => set({ showAchievementsModal: show }),
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),
  setShowTutorialModal: (show) => {
    set({ showTutorialModal: show });
    if (!show) {
        localStorage.setItem('gemini-type-racer-tutorial-seen', 'true');
    }
  },
  applyTheme: (themeId) => {
      const newSettings: PlayerSettings = { ...get().playerSettings, activeThemeId: themeId };
      customizationService.savePlayerSettings(newSettings);
      set({ playerSettings: newSettings });
  },
  applySoundPack: (packId) => {
    const newSettings: PlayerSettings = { ...get().playerSettings, activeSoundPackId: packId };
    customizationService.savePlayerSettings(newSettings);
    soundService.setSoundPack(packId);
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