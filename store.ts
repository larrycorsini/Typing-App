import { create } from 'zustand';
import { GameState, Player, RaceMode, RaceTheme, Toast, TypingStats, WpmDataPoint, PlayerStats, Achievement, LeaderboardEntry, GhostData, PlayerSettings, UnlockedCustomizations, PartyPlayer, RoomInfo, ServerToClientMessage, CourseLesson, PlayerCharacter } from './types';
import { getTypingParagraph } from './services/geminiService';
import { soundService } from './services/soundService';
import { getAchievements, checkAndUnlockAchievements } from './services/achievementService';
import { getLeaderboard, addLeaderboardEntry } from './services/leaderboardService';
import { customizationService } from './services/customizationService';
import { websocketService } from './services/websocketService';
import { courseService } from './services/courseService';
import { characterService, RACE_ENERGY_COST } from './services/characterService';

const BOT_NAMES = ['RacerX', 'Speedy', 'KeyMaster', 'TypoBot', 'CodeCrusher', 'LyricLover', 'QuoteQueen', 'GhostRider', 'PixelPusher', 'ByteBlaster'];
const PLAYER_ID = 'player-1';
const BOT_COLORS = ['#FFFFFF', '#8A2BE2', '#32CD32', '#1E90FF', '#FF4500', '#FF69B4', '#F0E68C', '#7FFFD4'];


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
  xpGainedThisRace: number;
  coinsGainedThisRace: number;
  rankCounter: number;

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
  showCharacterModal: boolean;
  toasts: Toast[];

  // Persistent State
  persistentPlayerStats: PlayerStats;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  playerSettings: PlayerSettings;
  unlockedCustomizations: UnlockedCustomizations;
  playerCharacter: PlayerCharacter;

  // Actions
  setGameState: (state: GameState) => void;
  setPlayerName: (name: string, color: string) => void;
  changeUser: () => void;
  setRaceMode: (mode: RaceMode) => Promise<void>;
  setRaceTheme: (theme: RaceTheme) => void;
  initializeGame: () => Promise<void>;
  startGame: () => void;
  updateGame: (deltaTime: number) => void;
  endRace: () => void;
  resetLobby: () => void;
  _addXp: (amount: number) => void;

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

  // Character Actions
  trainStat: (stat: 'running' | 'swimming' | 'flying') => void;
  feedDuck: (foodId: 'seed' | 'bread') => void;

  toggleMute: () => void;
  setShowStatsModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setShowAchievementsModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowTutorialModal: (show: boolean) => void;
  setShowCharacterModal: (show: boolean) => void;
  applyTheme: (themeId: PlayerSettings['activeThemeId']) => void;
  applySoundPack: (packId: PlayerSettings['activeSoundPackId']) => void;
  equipItem: (itemId: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Internal hook management
  _resetTypingHook: () => void;
  _setTypingHookState: (newState: Partial<Pick<AppState, 'typed' | 'errors' | 'playerStats' | 'isFinished' | 'wpmHistory'>>) => void;
}

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
  xpGainedThisRace: 0,
  coinsGainedThisRace: 0,
  rankCounter: 1,
  
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
  showCharacterModal: false,
  toasts: [],

  persistentPlayerStats: { totalRaces: 0, wins: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 },
  achievements: getAchievements(),
  leaderboard: getLeaderboard(),
  playerSettings: customizationService.getPlayerSettings(),
  unlockedCustomizations: customizationService.getUnlocked(),
  playerCharacter: characterService.getCharacterData(),

  // Actions
  setGameState: (gameState) => {
    set({ gameState });
    if (gameState === GameState.LOBBY) {
        get().resetLobby();
    }
  },
  setPlayerName: (name, color) => {
    const tutorialSeen = localStorage.getItem('gemini-type-racer-tutorial-seen') === 'true';

    const currentCharacter = characterService.getCharacterData();
    const updatedCharacter = { ...currentCharacter, color };
    characterService.saveCharacterData(updatedCharacter);

    set({ 
        playerName: name, 
        gameState: GameState.LOBBY,
        showTutorialModal: !tutorialSeen,
        courseProgress: courseService.getCourseProgress(),
        playerCharacter: updatedCharacter,
        unlockedCustomizations: customizationService.getUnlocked(),
    });
    
    const storedStats = localStorage.getItem('gemini-type-racer-stats');
    if(storedStats) {
        set({ persistentPlayerStats: JSON.parse(storedStats) });
    }
    soundService.setSoundPack(get().playerSettings.activeSoundPackId);
    get().connectToServer();
  },
  changeUser: () => {
    get()._resetTypingHook();
    set({
      playerName: '',
      gameState: GameState.NAME_SELECTION,
      raceMode: null,
      textToType: '',
      players: [],
      elapsedTime: 0,
    });
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
    const { playerName, raceMode, raceTheme, _resetTypingHook, playerCharacter } = get();
    if (!playerName || !raceMode) return;
    if (raceMode.startsWith('SOLO') && !raceTheme) return;

    _resetTypingHook();
    set({ textToType: 'Loading passage...', currentLesson: null, xpGainedThisRace: 0, coinsGainedThisRace: 0, rankCounter: 1 });

    const currentRequestId = get().textGenerationRequestCounter + 1;
    set({ textGenerationRequestCounter: currentRequestId });

    const [baseWpm, range] = getBotWpmRange(raceMode);
    
    let paragraph = '';
    let initialPlayers: Player[] = [
        { id: PLAYER_ID, name: playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, wpmHistory: [], character: playerCharacter },
    ];
    
    if (raceMode === RaceMode.GHOST) {
        const ghostData: GhostData | null = JSON.parse(localStorage.getItem('gemini-type-racer-ghost') || 'null');
        if (ghostData && ghostData.text) {
            paragraph = ghostData.text;
            initialPlayers.push({
                id: 'ghost-1', name: 'Your Best', isPlayer: false, isGhost: true, progress: 0, wpm: 0, accuracy: 100,
                targetWpm: ghostData.finalWpm, wpmHistory: ghostData.wpmHistory,
            });
        } else {
             set({textToType: "Ghost data not found or is outdated. Please complete a race to set a new ghost.", raceMode: null}); 
             return;
        }
    } else if (![RaceMode.PARTY, RaceMode.ONLINE_RACE, RaceMode.ENDURANCE, RaceMode.CUSTOM_TEXT, RaceMode.DAILY_CHALLENGE, RaceMode.COURSE].includes(raceMode)) {
         const fetchedParagraph = await getTypingParagraph(raceTheme!, raceMode);
         if (get().textGenerationRequestCounter !== currentRequestId) return;
         paragraph = fetchedParagraph;
         
         const numBots = raceMode === RaceMode.PUBLIC ? 4 : 2;
         const botNamePool = [...BOT_NAMES].sort(() => 0.5 - Math.random());
         for(let i=0; i<numBots; i++) {
            const botCharacter = characterService.getDefaultCharacter();
            botCharacter.color = BOT_COLORS[i % BOT_COLORS.length];

            initialPlayers.push({
                id: `bot-${i}`, name: botNamePool[i], isPlayer: false, progress: 0, wpm: 0, accuracy: 98,
                targetWpm: Math.floor(Math.random() * range) + baseWpm, mistakeCycles: 0,
                character: botCharacter
            });
         }
    } else if (raceMode === RaceMode.PARTY) {
        const fetchedParagraph = await getTypingParagraph(RaceTheme.HARRY_POTTER, RaceMode.SOLO_MEDIUM);
        if (get().textGenerationRequestCounter !== currentRequestId) return;
        paragraph = fetchedParagraph;
    } else if (raceMode === RaceMode.ENDURANCE) {
        paragraph = generateEnduranceText();
    }
    
    set({ players: initialPlayers, textToType: paragraph });
  },
  startGame: () => {
    const { textToType, raceMode, playerCharacter, addToast } = get();
    if (playerCharacter.energy < RACE_ENERGY_COST) {
        addToast({ message: "Not enough energy to race!", type: 'error'});
        return;
    }
    if (textToType && !textToType.startsWith('Loading')) {
       if (raceMode === RaceMode.ONLINE_RACE) {
            set({ gameState: GameState.COUNTDOWN });
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
            return {
                players: state.players.map(p =>
                    p.isPlayer
                        ? { ...p, progress: state.playerStats.progress, wpm: state.playerStats.wpm, accuracy: state.playerStats.accuracy, wpmHistory: state.wpmHistory }
                        : p
                ),
            };
        }

        const botBehavior = getBotBehavior(state.raceMode);
        const playerProgress = state.playerStats.progress || 0;
        let rank = state.rankCounter;
        
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
              p.rank = rank++;
              newProgress = 100;
            }
            return { ...p, progress: Math.min(100, newProgress), wpm: Math.round(currentWpm), isFallingBehind: p.isFallingBehind };
        });

        return { players: updatedPlayers, rankCounter: rank };
    });
  },
  endRace: () => {
    const { gameState, raceMode } = get();
    if (gameState === GameState.RESULTS) return;

    if (raceMode === RaceMode.PARTY) {
        get().nextPartyTurn();
        return; 
    }
    if (raceMode === RaceMode.ONLINE_RACE) {
        const { playerStats } = get();
        websocketService.sendMessage({ type: 'raceFinished', wpm: playerStats.wpm, accuracy: playerStats.accuracy });
        return;
    }

    let newlyUnlocked: Achievement[] = [];
    let playerResultForEffects: Player | undefined;

    set(state => {
        if (state.gameState !== GameState.TYPING) return state;

        if (state.raceMode === RaceMode.COURSE) {
            const { currentLesson, playerStats, courseProgress } = state;
            let newCourseProgress = courseProgress;
            let xpGained = 0;
            if (currentLesson) {
                const passed = playerStats.wpm >= currentLesson.goals.wpm && playerStats.accuracy >= currentLesson.goals.accuracy;
                if (passed) {
                    xpGained = Math.round(currentLesson.goals.wpm * 1.2);
                    const nextLessonId = currentLesson.id + 1;
                    if (nextLessonId > courseProgress && nextLessonId <= courseService.getTotalLessons()) {
                        courseService.saveCourseProgress(nextLessonId);
                        newCourseProgress = nextLessonId;
                    }
                }
            }
            playerResultForEffects = state.players.find(p => p.isPlayer);
            return {
                ...state,
                gameState: GameState.RESULTS,
                courseProgress: newCourseProgress,
                xpGainedThisRace: xpGained,
            };
        }

        let players = [...state.players];
        let player = players.find(p => p.isPlayer);
        let newPersistentStats = state.persistentPlayerStats;
        let rankCounter = state.rankCounter;
        let xpGained = 0;
        let coinsGained = 0;
        
        if (player && !player.rank) {
            player = { ...player, rank: rankCounter++ };
            players = players.map(p => p.id === player.id ? player : p);
        }
        
        playerResultForEffects = player;

        const sortedByRank = [...players].filter(p => p.rank).sort((a, b) => a.rank! - b.rank!);
        const sortedByProgress = [...players].filter(p => !p.rank).sort((a,b) => b.progress - a.progress);
        
        let currentRank = sortedByRank.length;
        const finalPlayers = [...sortedByRank, ...sortedByProgress.map(p => ({...p, rank: ++currentRank}))];
        
        if (player && state.raceMode) {
            const { totalRaces, wins, avgWpm, avgAccuracy, bestWpm } = state.persistentPlayerStats;
            const newTotalRaces = totalRaces + 1;
            const newWins = wins + (player.rank === 1 ? 1 : 0);
            const newAvgWpm = ((avgWpm * totalRaces) + state.playerStats.wpm) / newTotalRaces;
            const newAvgAccuracy = ((avgAccuracy * totalRaces) + state.playerStats.accuracy) / newTotalRaces;
            const newBestWpm = Math.max(bestWpm, state.playerStats.wpm);
            
            newPersistentStats = { totalRaces: newTotalRaces, wins: newWins, bestWpm: newBestWpm, avgWpm: Math.round(newAvgWpm), avgAccuracy: Math.round(newAvgAccuracy) };
            localStorage.setItem('gemini-type-racer-stats', JSON.stringify(newPersistentStats));

            if (state.raceMode !== RaceMode.GHOST && state.playerStats.wpm >= newBestWpm) {
                 const ghostData: GhostData = { wpmHistory: state.wpmHistory, finalWpm: state.playerStats.wpm, text: state.textToType };
                 localStorage.setItem('gemini-type-racer-ghost', JSON.stringify(ghostData));
            }

            xpGained = Math.round(state.playerStats.wpm * 1.5 + state.playerStats.accuracy * 0.5 + (player.rank === 1 ? 50 : 0));
            if (player.rank === 1) coinsGained = 50;
            else if (player.rank === 2) coinsGained = 25;
            else if (player.rank === 3) coinsGained = 10;
            
            const character = state.playerCharacter;
            const updatedCharacter = { ...character, coins: character.coins + coinsGained, energy: Math.max(0, character.energy - RACE_ENERGY_COST)};
            characterService.saveCharacterData(updatedCharacter);

            newlyUnlocked = checkAndUnlockAchievements({ 
                wpm: state.playerStats.wpm, 
                accuracy: state.playerStats.accuracy, 
                rank: player.rank!, 
                theme: state.raceTheme, 
                mode: state.raceMode, 
                stats: newPersistentStats,
                level: updatedCharacter.level,
            });

            return {
                players: finalPlayers,
                persistentPlayerStats: newPersistentStats,
                gameState: GameState.RESULTS,
                xpGainedThisRace: xpGained,
                coinsGainedThisRace: coinsGained,
                playerCharacter: updatedCharacter,
            };
        }
        return { ...state };
    });

    if (playerResultForEffects) {
        soundService.playRaceFinish(playerResultForEffects.rank === 1);
    }
    
    const { xpGainedThisRace, addToast, playerStats } = get();
    if (xpGainedThisRace > 0) {
        get()._addXp(xpGainedThisRace);
    }

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
        if (ach.reward?.type === 'characterItem') {
            if(characterService.unlockItem(ach.reward.id)) {
                 addToast({ message: `Cosmetic Unlocked!`, type: 'info' });
            }
        }
    });

    if (playerResultForEffects && raceMode && raceMode !== RaceMode.GHOST && raceMode !== RaceMode.COURSE) {
        addLeaderboardEntry({ name: playerResultForEffects.name, wpm: playerStats.wpm, accuracy: playerStats.accuracy });
    }

    set({ achievements: getAchievements(), leaderboard: getLeaderboard(), unlockedCustomizations: customizationService.getUnlocked() });
  },
  resetLobby: () => {
    get()._resetTypingHook();
    get().leaveOnlineRoom();
    set({ raceMode: null, textToType: '', players: [], elapsedTime: 0, partyPlayers: [], currentPartyPlayerIndex: 0, currentLesson: null });
  },
  _addXp: (amount) => {
    const { playerCharacter, addToast } = get();
    const { newCharacterState, leveledUp, unlockedItems } = characterService.addXp(playerCharacter, amount);
    
    characterService.saveCharacterData(newCharacterState);
    set({ playerCharacter: newCharacterState });

    if (leveledUp) {
        addToast({ message: `Leveled up to Level ${newCharacterState.level}!`, type: 'success' });
    }
    unlockedItems.forEach(item => {
        if(characterService.unlockItem(item.id)) {
            addToast({ message: `Unlocked: ${item.name}`, type: 'info' });
        }
    });
    set({ unlockedCustomizations: customizationService.getUnlocked() });
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
            const players = message.room.players.map((p) => {
                const character = characterService.getDefaultCharacter();
                character.color = BOT_COLORS[Math.floor(Math.random() * BOT_COLORS.length)];
                const isMe = p.id === message.yourId;
                return {
                    id: p.id,
                    name: p.name,
                    isPlayer: isMe,
                    progress: 0, wpm: 0, accuracy: 100,
                    character: isMe ? get().playerCharacter : character,
                };
            });
            set({ currentRoomId: message.room.id, players, myId: message.yourId });
            break;
        case 'playerJoined':
             const newPlayerCharacter = characterService.getDefaultCharacter();
             newPlayerCharacter.color = BOT_COLORS[Math.floor(Math.random() * BOT_COLORS.length)];
             set(state => ({ players: [...state.players, { id: message.player.id, name: message.player.name, isPlayer: false, progress: 0, wpm: 0, accuracy: 100, character: newPlayerCharacter}] }));
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
            set(state => ({ 
                textToType: message.text,
                rankCounter: 1,
                players: [{
                    id: PLAYER_ID, 
                    name: state.playerName, 
                    isPlayer: true, 
                    progress: 0, wpm: 0, accuracy: 100, wpmHistory: [],
                    character: state.playerCharacter,
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
    set({ currentRoomId: null, players: [], myId: null });
  },

  startCustomTextGame: (text) => {
    if (!text.trim()) return;
    set({ textToType: text.trim(), players: [{ id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, character: get().playerCharacter }], rankCounter: 1 });
    get().startGame();
  },

  // Course Actions
  startCourseLesson: (lesson) => {
    get()._resetTypingHook();
    set({
      raceMode: RaceMode.COURSE,
      currentLesson: lesson,
      textToType: lesson.text,
      players: [{ id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, character: get().playerCharacter }],
      elapsedTime: 0,
      gameState: GameState.COUNTDOWN,
      rankCounter: 1,
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
        players: [{ id: PLAYER_ID, name: firstPlayerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, character: get().playerCharacter }],
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

  trainStat: (stat) => {
    const { playerCharacter, addToast } = get();
    const { newCharacterState, success, message } = characterService.trainStat(playerCharacter, stat);
    if (success) {
        characterService.saveCharacterData(newCharacterState);
        set({ playerCharacter: newCharacterState });
        addToast({ message: `Trained ${stat}! Level ${newCharacterState[stat]}.`, type: 'success' });
    } else {
        addToast({ message, type: 'error' });
    }
  },
  feedDuck: (foodId) => {
    const { playerCharacter, addToast } = get();
    const { newCharacterState, success, message } = characterService.feedDuck(playerCharacter, foodId);
    if (success) {
        characterService.saveCharacterData(newCharacterState);
        set({ playerCharacter: newCharacterState });
        addToast({ message, type: 'success' });
    } else {
        addToast({ message, type: 'error' });
    }
  },

  toggleMute: () => set({ isMuted: soundService.toggleMute() }),
  setShowStatsModal: (show) => set({ showStatsModal: show }),
  setShowLeaderboardModal: (show) => set({ showLeaderboardModal: show }),
  setShowAchievementsModal: (show) => set({ showAchievementsModal: show }),
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),
  setShowCharacterModal: (show) => set({ showCharacterModal: show }),
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
  equipItem: (itemId: string) => {
    const { playerCharacter } = get();
    const item = characterService.allCustomizationItems.find(i => i.id === itemId);
    if (!item) return;

    const newCharacter = { ...playerCharacter };
    const currentlyEquippedId = newCharacter.equippedItems[item.type];
    
    newCharacter.equippedItems[item.type] = currentlyEquippedId === itemId ? null : itemId;
    
    characterService.saveCharacterData(newCharacter);
    set({ playerCharacter: newCharacter });
  },
  addToast: (toast) => {
    const id = Date.now().toString();
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  _resetTypingHook: () => {},
  _setTypingHookState: (newState) => set(newState),
}));