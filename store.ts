import { create } from 'zustand';
import { GameState, Player, RaceMode, RaceTheme, Toast, TypingStats, WpmDataPoint, PlayerStats, Achievement, LeaderboardEntry, GhostData, PlayerSettings, UnlockedCustomizations, PartyPlayer, RoomInfo, ServerToClientMessage, CourseLesson, PlayerCharacter, Boss, ConsumableItemId, Evolution, MapNode, DuckPattern, PetId } from './types';
import { getTypingParagraph } from './services/geminiService';
import { soundService } from './services/soundService';
import { getAchievements, checkAndUnlockAchievements } from './services/achievementService';
import { getLeaderboard, addLeaderboardEntry } from './services/leaderboardService';
import { customizationService } from './services/customizationService';
import { websocketService } from './services/websocketService';
import { courseService } from './services/courseService';
import { characterService } from './services/characterService';
import { mapService } from './services/mapService';

const BOT_COLORS = ['#FFFFFF', '#8A2BE2', '#32CD32', '#1E90FF', '#FF4500', '#FF69B4', '#F0E68C', '#7FFFD4'];
const PLAYER_ID = 'player-1';

const ENDURANCE_WORD_POOL = "the of to and a in is it you that he was for on are with as I his they be at one have this from or had by but what some we can out other were all there when up use your how said an each she which do their time if will way about many then them write would like so these her long make thing see him two has look who may part come its now find than first water been called who am its now find day did get come made may part".split(" ");
const ENDURANCE_DURATION_SECONDS = 60;

const generateEnduranceText = () => {
    let words = [];
    for (let i = 0; i < 200; i++) {
        words.push(ENDURANCE_WORD_POOL[Math.floor(Math.random() * ENDURANCE_WORD_POOL.length)]);
    }
    return words.join(" ");
};

// Non-reactive state for timers, etc.
const storeRefs = {
    startTime: null as number | null,
    lastHistoryPushTime: 0,
    mistypedChars: {} as Record<string, number>,
    enduranceTimer: null as number | null,
};

type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type TrainingStat = 'running' | 'swimming' | 'flying';

interface AppState {
  // Game State
  gameState: GameState;
  playerName: string;
  raceMode: RaceMode | null;
  textToType: string;
  players: Player[];
  elapsedTime: number;
  xpGainedThisRace: number;
  coinsGainedThisRace: number;
  rankCounter: number;
  currentBossIntro: Boss | null;
  currentMapNodeId: number | null;
  activeConsumables: Record<ConsumableItemId, boolean>;
  wpmBoostEndTime: number | null;
  loadingMessage: string;
  cheatCodeBuffer: string;
  isCapsLockOn: boolean;
  sprintAvailable: boolean;
  sprintEndTime: number | null;

  // Online Race State
  socketStatus: SocketStatus;
  onlineRooms: RoomInfo[];
  currentRoomId: string | null;
  myId: string | null;
  onlineCountdown: number;

  // Party Race State
  partyPlayers: PartyPlayer[];
  currentPartyPlayerIndex: number;

  // Typing Course State
  courseProgress: number;
  currentLesson: CourseLesson | null;

  // Typing State (previously in hook)
  typed: string;
  errors: Set<number>;
  playerStats: TypingStats;
  isFinished: boolean;
  wpmHistory: WpmDataPoint[];
  lastMistakeTime: number;

  // UI State
  isMuted: boolean;
  showStatsModal: boolean;
  showLeaderboardModal: boolean;
  showAchievementsModal: boolean;
  showSettingsModal: boolean;
  showTutorialModal: boolean;
  showCharacterModal: boolean;
  showPetModal: boolean;
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
  setPlayerAndEvolution: (name: string, color: string, evolution: Evolution, pattern: DuckPattern) => void;
  changeUser: () => void;
  startMapNodeActivity: (nodeId: number) => Promise<void>;
  updateGame: (deltaTime: number) => void;
  endRace: () => void;
  returnToMap: () => void;
  _addXp: (amount: number) => void;
  consumeItem: (itemId: ConsumableItemId) => void;
  confirmStartRace: () => Promise<void>;
  clearActiveConsumables: () => void;
  handleCheatCodeInput: (key: string) => void;
  setIsCapsLockOn: (isOn: boolean) => void;
  regenerateEnergy: () => void;
  activateSprint: () => void;

  // Online Actions
  setSocketStatus: (status: SocketStatus) => void;
  handleServerMessage: (message: ServerToClientMessage) => void;
  connectToServer: () => void;
  createOnlineRoom: () => void;
  joinOnlineRoom: (roomId: string) => void;
  leaveOnlineRoom: () => void;

  // Other Mode Actions
  startCustomTextGame: (text: string) => void;
  startEnduranceGame: () => void;
  startGhostRace: () => void;

  // Course Actions
  startCourseLesson: (lesson: CourseLesson) => void;
  
  // Party Race Actions
  addPartyPlayer: (name: string) => void;
  removePartyPlayer: (name: string) => void;
  startPartySetup: () => void;
  startPartyGame: () => Promise<void>;
  nextPartyTurn: () => void;
  prepareNextPartyTurn: () => void;

  // Character Actions
  startTraining: (stat: TrainingStat) => void;
  finishTraining: (stat: TrainingStat, score: number) => void;
  buyItem: (itemId: string) => void;
  startBossBattle: (bossId: string) => void;
  confirmStartBossBattle: () => Promise<void>;
  setPlayerPattern: (pattern: DuckPattern) => void;

  toggleMute: () => void;
  setShowStatsModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setShowAchievementsModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowCharacterModal: (show: boolean) => void;
  setShowTutorialModal: (show: boolean) => void;
  setShowPetModal: (show: boolean) => void;
  applySoundPack: (packId: PlayerSettings['activeSoundPackId']) => void;
  equipItem: (itemId: string) => void;
  equipPet: (petId: PetId | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Typing Actions (from hook)
  _resetTypingState: () => void;
  _calculateStats: () => void;
  handleKeyDown: (key: string, isBackspace: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  gameState: GameState.CHARACTER_CREATION,
  playerName: '',
  raceMode: null,
  textToType: '',
  players: [],
  elapsedTime: 0,
  xpGainedThisRace: 0,
  coinsGainedThisRace: 0,
  rankCounter: 1,
  currentBossIntro: null,
  currentMapNodeId: null,
  activeConsumables: { 'wpm_booster': false, 'focus_goggles': false, 'energy_seed': false },
  wpmBoostEndTime: null,
  loadingMessage: '',
  cheatCodeBuffer: '',
  isCapsLockOn: false,
  sprintAvailable: true,
  sprintEndTime: null,
  
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
  lastMistakeTime: 0,

  isMuted: false,
  showStatsModal: false,
  showLeaderboardModal: false,
  showAchievementsModal: false,
  showSettingsModal: false,
  showTutorialModal: false,
  showCharacterModal: false,
  showPetModal: false,
  toasts: [],

  persistentPlayerStats: { totalRaces: 0, wins: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 },
  achievements: getAchievements(),
  leaderboard: getLeaderboard(),
  playerSettings: customizationService.getPlayerSettings(),
  unlockedCustomizations: customizationService.getUnlocked(),
  playerCharacter: characterService.getCharacterData(),

  // Actions
  setGameState: (state) => set({ gameState: state }),
  setPlayerAndEvolution: (name, color, evolution, pattern) => {
    const tutorialSeen = localStorage.getItem('gemini-type-racer-tutorial-seen') === 'true';

    const newCharacter = characterService.getDefaultCharacter(evolution);
    newCharacter.color = color;
    newCharacter.pattern = pattern;
    characterService.saveCharacterData(newCharacter);

    set({ 
        playerName: name, 
        gameState: GameState.ADVENTURE_MAP,
        showTutorialModal: !tutorialSeen,
        courseProgress: courseService.getCourseProgress(),
        playerCharacter: newCharacter,
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
    get()._resetTypingState();
    set({
      playerName: '',
      gameState: GameState.CHARACTER_CREATION,
      raceMode: null,
      textToType: '',
      players: [],
      elapsedTime: 0,
    });
  },
  startMapNodeActivity: async (nodeId) => {
    const { playerCharacter, addToast } = get();
    const node = mapService.getNodeById(nodeId);
    if (!node) return;

    if (node.type === 'SHOP') {
      set({ gameState: GameState.SHOP });
      return;
    }
    if (node.type === 'TRAINING') {
      set({ gameState: GameState.TRAINING_GROUND });
      return;
    }
    if (node.type === 'BOSS') {
      get().startBossBattle(node.bossId!);
      return;
    }
    
    const activePet = characterService.allPets.find(p => p.id === playerCharacter.activePet);
    let energyCost = characterService.RACE_ENERGY_COST;
    if (activePet?.bonus.type === 'ENERGY_SAVER') {
        energyCost = Math.round(energyCost * (1 - activePet.bonus.value));
    }
    
    if (playerCharacter.energy < energyCost) {
      addToast({ message: "Not enough energy to race!", type: 'error'});
      return;
    }

    set({
      raceMode: RaceMode.ADVENTURE,
      currentMapNodeId: nodeId,
      gameState: GameState.RACE_CONFIRMATION,
    });
  },

  consumeItem: (itemId) => {
    set(state => {
        const currentStatus = state.activeConsumables[itemId];
        if (!currentStatus && state.playerCharacter.inventory[itemId] < 1) {
            get().addToast({ message: `You don't have any ${itemId.replace('_', ' ')}s!`, type: 'error' });
            return state;
        }
        return {
            activeConsumables: {
                ...state.activeConsumables,
                [itemId]: !currentStatus,
            }
        };
    });
  },

  confirmStartRace: async () => {
    const { playerCharacter, activeConsumables, _resetTypingState, currentMapNodeId } = get();
    const node = mapService.getNodeById(currentMapNodeId!);
    if (!node || node.type !== 'RACE') return;

    _resetTypingState();
    let finalCharacter = { ...playerCharacter };
    let boostEndTime: number | null = null;
    
    if (activeConsumables.wpm_booster) {
        const item = characterService.allShopItems.find(i => i.id === 'wpm_booster');
        const duration = (item?.effect?.type === 'wpm_boost' ? item.effect.value : 10) * 1000;
        boostEndTime = Date.now() + duration;
        finalCharacter.inventory.wpm_booster--;
    }
    if (activeConsumables.focus_goggles) {
        finalCharacter.inventory.focus_goggles--;
    }
    
    const activePet = characterService.allPets.find(p => p.id === finalCharacter.activePet);
    let energyCost = characterService.RACE_ENERGY_COST;
    if (activePet?.bonus.type === 'ENERGY_SAVER') {
        energyCost = Math.round(energyCost * (1 - activePet.bonus.value));
    }
    finalCharacter.energy -= energyCost;
    
    characterService.saveCharacterData(finalCharacter);

    set({ 
      gameState: GameState.LOADING,
      loadingMessage: 'Generating your race with Gemini...',
      currentLesson: null, 
      xpGainedThisRace: 0, 
      coinsGainedThisRace: 0, 
      rankCounter: 1,
      wpmBoostEndTime: boostEndTime,
      sprintAvailable: true,
      playerCharacter: finalCharacter,
    });

    const paragraph = await getTypingParagraph(RaceTheme.MOVIE_QUOTES, RaceMode.SOLO_MEDIUM);
    
    const initialPlayers: Player[] = [
        { id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, wpmHistory: [], character: get().playerCharacter },
    ];
    
    node.bots?.forEach((bot, i) => {
        const botCharacter = characterService.getDefaultCharacter(bot.evolution);
        botCharacter.color = BOT_COLORS[i % BOT_COLORS.length];
        initialPlayers.push({
            id: `bot-${i}`, name: bot.name, isPlayer: false, progress: 0, wpm: 0, accuracy: 98,
            targetWpm: bot.targetWpm, mistakeCycles: 0,
            character: botCharacter
        });
    });

    set({ players: initialPlayers, textToType: paragraph, elapsedTime: 0, gameState: GameState.COUNTDOWN });
    get().clearActiveConsumables();
  },

  clearActiveConsumables: () => {
    set({ activeConsumables: { 'wpm_booster': false, 'focus_goggles': false, 'energy_seed': false } });
  },

  handleCheatCodeInput: (key) => {
    if (get().gameState !== GameState.ADVENTURE_MAP) return;
    
    set(state => {
      const newBuffer = (state.cheatCodeBuffer + key).slice(-20); // Keep buffer from getting too long
      let characterUpdate = { ...state.playerCharacter };
      let toast: Omit<Toast, 'id'> | null = null;
      let bufferCleared = false;

      if (newBuffer.endsWith('quackmorecoins')) {
        characterUpdate.coins += 1000;
        toast = { message: 'Cheat Activated: +1000 Coins!', type: 'success' };
        bufferCleared = true;
      } else if (newBuffer.endsWith('fullenergy')) {
        characterUpdate.energy = characterUpdate.maxEnergy;
        toast = { message: 'Cheat Activated: Energy Restored!', type: 'success' };
        bufferCleared = true;
      }
      
      if (toast) {
        get().addToast(toast);
        characterService.saveCharacterData(characterUpdate);
        return { playerCharacter: characterUpdate, cheatCodeBuffer: bufferCleared ? '' : newBuffer };
      }

      return { cheatCodeBuffer: newBuffer };
    });
  },

  setIsCapsLockOn: (isOn) => {
    if (get().isCapsLockOn !== isOn) {
        set({ isCapsLockOn: isOn });
    }
  },

  regenerateEnergy: () => {
      set(state => {
          if (state.playerCharacter.energy < state.playerCharacter.maxEnergy) {
              const newCharacter = { ...state.playerCharacter, energy: Math.min(state.playerCharacter.maxEnergy, state.playerCharacter.energy + 1) };
              characterService.saveCharacterData(newCharacter);
              return { playerCharacter: newCharacter };
          }
          return state;
      });
  },

  activateSprint: () => {
    set(state => {
        if (!state.sprintAvailable || !state.playerCharacter.activeAbilityUnlocked || state.playerCharacter.evolution !== Evolution.ATHLETIC) return state;
        
        const SPRINT_COST = 10;
        if (state.playerCharacter.energy < SPRINT_COST) {
            get().addToast({ message: "Not enough energy for Sprint!", type: 'error' });
            return state;
        }

        const newCharacter = { ...state.playerCharacter, energy: state.playerCharacter.energy - SPRINT_COST };
        characterService.saveCharacterData(newCharacter);
        
        return {
            sprintAvailable: false,
            sprintEndTime: Date.now() + 5000, // 5 seconds from now
            playerCharacter: newCharacter,
        };
    });
  },

  updateGame: (deltaTime: number) => {
    set(state => {
        if (state.gameState !== GameState.TYPING) {
            return state;
        }
        
        let rank = state.rankCounter;
        
        const updatedPlayers = state.players.map(p => {
            if (p.isPlayer) {
              const isBoosted = state.wpmBoostEndTime ? Date.now() < state.wpmBoostEndTime : false;
              return { ...p, progress: state.playerStats.progress, wpm: state.playerStats.wpm, accuracy: state.playerStats.accuracy, wpmHistory: state.wpmHistory, isBoosted };
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
                if (Math.random() < 0.03) { // Generic mistake chance
                  return { ...p, mistakeCycles: 2 };
                }
                const isFallingBehind = !p.isPlayer && state.playerStats.progress > 10 && p.progress < state.playerStats.progress - 20;
                const targetWpm = p.targetWpm || 60;
                const randomFactor = (Math.random() - 0.5) * 20;
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
    const { gameState, raceMode, playerCharacter } = get();
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
    let wasBossDefeated = false;
    let defeatedBossId: string | null = null;

    set(state => {
        if (state.gameState !== GameState.TYPING) return state;

        // Unified race end logic
        let players = [...state.players];
        let player = players.find(p => p.isPlayer);
        let newPersistentStats = state.persistentPlayerStats;
        let rankCounter = state.rankCounter;
        let xpGained = 0;
        let coinsGained = 0;
        let finalCharacterState = state.playerCharacter;
        let newCourseProgress = state.courseProgress;
        
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

            if (state.playerStats.wpm >= newBestWpm && state.playerStats.wpm > 0) {
                 const ghostData: GhostData = { wpmHistory: state.wpmHistory, finalWpm: state.playerStats.wpm, text: state.textToType };
                 localStorage.setItem('gemini-type-racer-ghost', JSON.stringify(ghostData));
            }

            if (state.raceMode === RaceMode.COURSE) {
                const { currentLesson } = state;
                if (currentLesson) {
                    const passed = state.playerStats.wpm >= currentLesson.goals.wpm && state.playerStats.accuracy >= currentLesson.goals.accuracy;
                    if (passed) {
                        xpGained = Math.round(currentLesson.goals.wpm * 1.2);
                        const nextLessonId = currentLesson.id + 1;
                        if (nextLessonId > state.courseProgress && nextLessonId <= courseService.getTotalLessons()) {
                            courseService.saveCourseProgress(nextLessonId);
                            newCourseProgress = nextLessonId;
                        }
                    }
                }
            } else {
                xpGained = Math.round(state.playerStats.wpm * 1.5 + state.playerStats.accuracy * 0.5 + (player.rank === 1 ? 50 : 0));
                if (player.rank === 1) coinsGained = 50;
                else if (player.rank === 2) coinsGained = 25;
                else if (player.rank === 3) coinsGained = 10;

                const activePet = characterService.allPets.find(p => p.id === playerCharacter.activePet);
                if (activePet?.bonus.type === 'COIN_BONUS') {
                    const bonusCoins = Math.round(coinsGained * activePet.bonus.value);
                    if (bonusCoins > 0) {
                        get().addToast({ message: `+${bonusCoins} Pet Coin Bonus!`, type: 'success' });
                        coinsGained += bonusCoins;
                    }
                }
            }

            if (state.raceMode === RaceMode.BOSS_BATTLE) {
                const bossInRace = state.players.find(p => !p.isPlayer);
                const playerWon = player.rank === 1;
                const bossData = characterService.leagues.flatMap(l => l.bosses).find(b => b.id === bossInRace?.id);
                if (playerWon && bossInRace && bossData && !state.playerCharacter.defeatedBosses.includes(bossInRace.id)) {
                    wasBossDefeated = true;
                    defeatedBossId = bossInRace.id;
                    xpGained += bossData.rewards.xp;
                    coinsGained += bossData.rewards.coins;
                    finalCharacterState = {
                        ...finalCharacterState,
                        defeatedBosses: [...finalCharacterState.defeatedBosses, bossInRace.id],
                        mapProgress: Math.max(state.playerCharacter.mapProgress, state.currentMapNodeId!),
                    };
                }
            } else if (state.raceMode === RaceMode.ADVENTURE) {
                 if (player.rank === 1 && state.currentMapNodeId) {
                     finalCharacterState = {
                         ...finalCharacterState,
                         mapProgress: Math.max(state.playerCharacter.mapProgress, state.currentMapNodeId),
                     }
                 }
            }

            finalCharacterState = {
                ...finalCharacterState,
                coins: finalCharacterState.coins + coinsGained,
            };
            characterService.saveCharacterData(finalCharacterState);

            newlyUnlocked = checkAndUnlockAchievements({ 
                wpm: state.playerStats.wpm, 
                accuracy: state.playerStats.accuracy, 
                rank: player.rank!, 
                theme: RaceTheme.MOVIE_QUOTES, 
                mode: state.raceMode, 
                stats: newPersistentStats,
                level: finalCharacterState.level,
                defeatedFinalBoss: wasBossDefeated && defeatedBossId === 'champion',
            });

            return {
                players: finalPlayers,
                persistentPlayerStats: newPersistentStats,
                gameState: GameState.RESULTS,
                xpGainedThisRace: xpGained,
                coinsGainedThisRace: coinsGained,
                playerCharacter: finalCharacterState,
                courseProgress: newCourseProgress,
            };
        }
        return { ...state, gameState: GameState.RESULTS }; // Failsafe
    });

    // Handle side effects after state update
    const { playerStats, currentLesson, raceMode: finalRaceMode, addToast, xpGainedThisRace } = get();
    if (finalRaceMode === RaceMode.COURSE && currentLesson) {
        const passed = playerStats.wpm >= currentLesson.goals.wpm && playerStats.accuracy >= currentLesson.goals.accuracy;
        soundService.playRaceFinish(passed);
    } else if (playerResultForEffects) {
        soundService.playRaceFinish(playerResultForEffects.rank === 1);
    }
    
    if (xpGainedThisRace > 0) {
        get()._addXp(xpGainedThisRace);
    }

    if (wasBossDefeated && defeatedBossId === 'champion') {
        if(characterService.unlockItem('championship_crown')) {
            addToast({ message: 'Championship Crown Unlocked!', type: 'success' });
        }
    }

    newlyUnlocked.forEach(ach => {
        addToast({ message: `Achievement: ${ach.name}`, type: 'success' });
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

    if (playerResultForEffects && finalRaceMode && ![RaceMode.GHOST, RaceMode.BOSS_BATTLE].includes(finalRaceMode)) {
        addLeaderboardEntry({ name: playerResultForEffects.name, wpm: playerStats.wpm, accuracy: playerStats.accuracy });
    }

    set({ achievements: getAchievements(), leaderboard: getLeaderboard(), unlockedCustomizations: customizationService.getUnlocked() });
  },
  returnToMap: () => {
    get()._resetTypingState();
    set({ raceMode: null, textToType: '', players: [], elapsedTime: 0, partyPlayers: [], currentPartyPlayerIndex: 0, currentLesson: null, gameState: GameState.ADVENTURE_MAP });
  },
  _addXp: (amount) => {
    const { playerCharacter, addToast } = get();
    let finalXp = amount;
    
    // Apply Pet Bonus
    const activePet = characterService.allPets.find(p => p.id === playerCharacter.activePet);
    if (activePet?.bonus.type === 'XP_BONUS') {
        const bonusXp = Math.round(amount * activePet.bonus.value);
        if (bonusXp > 0) {
            finalXp += bonusXp;
            addToast({ message: `+${bonusXp} Pet XP Bonus!`, type: 'success' });
        }
    }
    
    // Apply Evolution Bonus
    if (playerCharacter.evolution === Evolution.INTELLECT) {
        const evolutionBonus = Math.round(amount * 0.10); // 10% bonus on original amount
        if (evolutionBonus > 0) {
            finalXp += evolutionBonus;
            addToast({ message: `+${evolutionBonus} Intellect XP Bonus!`, type: 'success' });
        }
    }

    const { newCharacterState, leveledUp, unlockedItems } = characterService.addXp(playerCharacter, finalXp);
    
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
  setSocketStatus: (status) => set({ socketStatus: status }),
  handleServerMessage: (message) => {
    switch (message.type) {
        case 'roomList': set({ onlineRooms: message.rooms }); break;
        case 'joinedRoom': {
            const evolutionsOnline = [Evolution.ATHLETIC, Evolution.STAMINA, Evolution.INTELLECT];
            const players = message.room.players.map((p, index) => {
                const character = characterService.getDefaultCharacter(evolutionsOnline[index % evolutionsOnline.length]);
                character.color = BOT_COLORS[Math.floor(Math.random() * BOT_COLORS.length)];
                const isMe = p.id === message.yourId;
                return {
                    id: p.id, name: p.name, isPlayer: isMe, progress: 0, wpm: 0, accuracy: 100,
                    character: isMe ? get().playerCharacter : character,
                };
            });
            set({ currentRoomId: message.room.id, players, myId: message.yourId });
            break;
        }
        case 'playerJoined': {
             const newPlayerEvolution = [Evolution.ATHLETIC, Evolution.STAMINA, Evolution.INTELLECT][Math.floor(Math.random()*3)];
             const newPlayerCharacter = characterService.getDefaultCharacter(newPlayerEvolution);
             newPlayerCharacter.color = BOT_COLORS[Math.floor(Math.random() * BOT_COLORS.length)];
             set(state => ({ players: [...state.players, { id: message.player.id, name: message.player.name, isPlayer: false, progress: 0, wpm: 0, accuracy: 100, character: newPlayerCharacter}] }));
             break;
        }
        case 'playerLeft': set(state => ({ players: state.players.filter(p => p.id !== message.playerId) })); break;
        case 'raceStarting': set({ onlineCountdown: message.countdown, gameState: GameState.COUNTDOWN }); break;
        case 'raceStart': set(state => {
                const updatedPlayers = state.players.map(p => ({ ...p, progress: 0, wpm: 0, rank: undefined }));
                return { gameState: GameState.TYPING, elapsedTime: 0, onlineCountdown: 0, players: updatedPlayers, sprintAvailable: true };
            }); break;
        case 'progressUpdate': set(state => ({ players: state.players.map(p => p.id === message.playerId ? { ...p, progress: message.progress, wpm: message.wpm } : p) })); break;
        case 'playerFinished': set(state => {
                let rank = state.players.filter(p => p.rank).length + 1;
                return { players: state.players.map(p => p.id === message.playerId ? { ...p, progress: 100, wpm: message.wpm, accuracy: message.accuracy, rank } : p) }
            }); break;
        case 'dailyChallenge': {
            get()._resetTypingState();
            set(state => ({ 
                textToType: message.text, raceMode: RaceMode.DAILY_CHALLENGE,
                rankCounter: 1,
                sprintAvailable: true,
                players: [{
                    id: PLAYER_ID, name: state.playerName, isPlayer: true, 
                    progress: 0, wpm: 0, accuracy: 100, wpmHistory: [],
                    character: state.playerCharacter,
                }]
            }));
            set({ gameState: GameState.COUNTDOWN });
            break;
        }
        case 'error': get().addToast({ message: message.message, type: 'error' }); break;
    }
  },
  connectToServer: () => websocketService.connect(),
  createOnlineRoom: () => websocketService.sendMessage({ type: 'createRoom', playerName: get().playerName }),
  joinOnlineRoom: (roomId) => websocketService.sendMessage({ type: 'joinRoom', roomId, playerName: get().playerName }),
  leaveOnlineRoom: () => set({ currentRoomId: null, players: [], myId: null }),

  startCustomTextGame: (text) => {
    if (!text.trim()) return;
    get()._resetTypingState();
    set({ textToType: text.trim(), players: [{ id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, character: get().playerCharacter }], rankCounter: 1, raceMode: RaceMode.CUSTOM_TEXT, sprintAvailable: true });
    set({ gameState: GameState.COUNTDOWN });
  },
  startEnduranceGame: () => {
    get()._resetTypingState();
    set({ textToType: generateEnduranceText(), players: [{ id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, character: get().playerCharacter }], rankCounter: 1, raceMode: RaceMode.ENDURANCE, sprintAvailable: true });
    set({ gameState: GameState.COUNTDOWN });
  },
  startGhostRace: () => {
    const ghostDataString = localStorage.getItem('gemini-type-racer-ghost');
    if (!ghostDataString) {
        get().addToast({ message: "No ghost data found!", type: 'error' });
        return;
    }
    const ghostData: GhostData = JSON.parse(ghostDataString);
    get()._resetTypingState();
    
    const ghostPlayer: Player = {
        id: 'ghost-player',
        name: `${get().playerName}'s Ghost`,
        isPlayer: false,
        isGhost: true,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        wpmHistory: ghostData.wpmHistory,
        targetWpm: ghostData.finalWpm,
    };
    
    const player: Player = {
        id: PLAYER_ID,
        name: get().playerName,
        isPlayer: true,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        character: get().playerCharacter,
    };

    set({
        raceMode: RaceMode.GHOST,
        textToType: ghostData.text,
        players: [player, ghostPlayer],
        elapsedTime: 0,
        rankCounter: 1,
        sprintAvailable: true,
        gameState: GameState.COUNTDOWN,
    });
  },

  // Course Actions
  startCourseLesson: (lesson) => {
    get()._resetTypingState();
    set({
      raceMode: RaceMode.COURSE,
      currentLesson: lesson,
      textToType: courseService.generateTextForLesson(lesson),
      players: [{ id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, character: get().playerCharacter }],
      elapsedTime: 0,
      sprintAvailable: true,
      gameState: GameState.COUNTDOWN,
      rankCounter: 1,
    });
  },

  // Party Race Actions
  addPartyPlayer: (name) => {
    set(state => {
        if (state.partyPlayers.length >= 4 || state.partyPlayers.find(p => p.name.toLowerCase() === name.toLowerCase()) || !name.trim()) return state;
        return { partyPlayers: [...state.partyPlayers, { name: name.trim(), wpm: 0, accuracy: 0 }] };
    });
  },
  removePartyPlayer: (name) => set(state => ({ partyPlayers: state.partyPlayers.filter(p => p.name !== name) })),
  startPartySetup: () => set({ gameState: GameState.PARTY_SETUP, raceMode: RaceMode.PARTY, partyPlayers: [], currentPartyPlayerIndex: 0 }),
  startPartyGame: async () => {
    if (get().partyPlayers.length === 0) return;
    const firstPlayerName = get().partyPlayers[0].name;
    set({
      gameState: GameState.LOADING,
      loadingMessage: 'Preparing your party race...',
    });
    const text = await getTypingParagraph(RaceTheme.HARRY_POTTER, RaceMode.SOLO_MEDIUM);
    set({
        players: [{ id: PLAYER_ID, name: firstPlayerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, character: get().playerCharacter }],
        gameState: GameState.COUNTDOWN,
        textToType: text,
        sprintAvailable: true,
    });
  },
  nextPartyTurn: () => {
    const { playerStats, currentPartyPlayerIndex, partyPlayers } = get();
    const updatedPartyPlayers = [...partyPlayers];
    updatedPartyPlayers[currentPartyPlayerIndex] = { ...updatedPartyPlayers[currentPartyPlayerIndex], wpm: playerStats.wpm, accuracy: playerStats.accuracy };
    const nextIndex = currentPartyPlayerIndex + 1;
    if (nextIndex >= partyPlayers.length) {
        const finalRankedPlayers = updatedPartyPlayers.sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy).map((p, i) => ({ ...p, rank: i + 1 }));
        set({ partyPlayers: finalRankedPlayers, gameState: GameState.RESULTS });
        soundService.playRaceFinish(true);
    } else {
        set({ partyPlayers: updatedPartyPlayers, currentPartyPlayerIndex: nextIndex, gameState: GameState.PARTY_TRANSITION });
    }
  },
  prepareNextPartyTurn: () => {
    get()._resetTypingState();
    const { partyPlayers, currentPartyPlayerIndex } = get();
    const nextPlayerName = partyPlayers[currentPartyPlayerIndex].name;
    set(state => ({ players: [{ ...state.players[0], name: nextPlayerName }], gameState: GameState.COUNTDOWN, sprintAvailable: true }));
  },

  startTraining: (stat) => {
    const { playerCharacter, addToast } = get();
    
    const activePet = characterService.allPets.find(p => p.id === playerCharacter.activePet);
    let energyCost = characterService.TRAINING_ENERGY_COST;
    if (activePet?.bonus.type === 'ENERGY_SAVER') {
        energyCost = Math.round(energyCost * (1 - activePet.bonus.value));
    }

    if (playerCharacter.energy < energyCost) {
        addToast({ message: "Not enough energy to train!", type: 'error' });
        return;
    }
    const newCharacter = { ...playerCharacter, energy: playerCharacter.energy - energyCost };
    characterService.saveCharacterData(newCharacter);
    set({ playerCharacter: newCharacter });
    if (stat === 'running') set({ gameState: GameState.TRAINING_RUNNING });
    if (stat === 'swimming') set({ gameState: GameState.TRAINING_SWIMMING });
    if (stat === 'flying') set({ gameState: GameState.TRAINING_FLYING });
  },
  finishTraining: (stat, score) => {
    const { playerCharacter, addToast } = get();
    const xpGained = Math.round(score * 2.5); 
    addToast({ message: `Gained ${xpGained} ${stat} XP!`, type: 'success' });
    const newCharacterState = characterService.addStatXp(playerCharacter, stat, xpGained);
    characterService.saveCharacterData(newCharacterState);
    set({ playerCharacter: newCharacterState, gameState: GameState.TRAINING_GROUND });
  },
  buyItem: (itemId) => {
    const { playerCharacter, addToast, unlockedCustomizations } = get();
    const { newCharacterState, success, message, unlockedPet } = characterService.buyItem(playerCharacter, itemId, unlockedCustomizations.unlockedPets);
    if (success) {
        characterService.saveCharacterData(newCharacterState);
        set({ playerCharacter: newCharacterState });
        addToast({ message, type: 'success' });
        if (unlockedPet) {
            set({ unlockedCustomizations: customizationService.getUnlocked() });
        }
    } else {
        addToast({ message, type: 'error' });
    }
  },
  startBossBattle: (bossId) => {
    const allBosses = characterService.leagues.flatMap(l => l.bosses);
    const boss = allBosses.find(b => b.id === bossId);
    if (!boss) return;
    const { playerCharacter, addToast } = get();
    if (playerCharacter.coins < boss.entryFee) {
        addToast({ message: `Not enough coins! Entry fee is ${boss.entryFee}.`, type: 'error'});
        return;
    }
    const node = mapService.getNodeByBossId(bossId);
    set({ currentBossIntro: boss, gameState: GameState.BOSS_INTRO, currentMapNodeId: node?.id || null });
  },
  confirmStartBossBattle: async () => {
    const { playerCharacter, addToast, _resetTypingState, currentBossIntro } = get();
    if (!currentBossIntro) return;
    const boss = currentBossIntro;
    if (playerCharacter.running < boss.skillRequirements.running || playerCharacter.swimming < boss.skillRequirements.swimming || playerCharacter.flying < boss.skillRequirements.flying) {
        addToast({ message: 'Your skills are not high enough to challenge this boss!', type: 'error' });
        set({ gameState: GameState.ADVENTURE_MAP, currentBossIntro: null });
        return;
    }
    const activePet = characterService.allPets.find(p => p.id === playerCharacter.activePet);
    let energyCost = characterService.RACE_ENERGY_COST;
    if (activePet?.bonus.type === 'ENERGY_SAVER') {
        energyCost = Math.round(energyCost * (1 - activePet.bonus.value));
    }
    if (playerCharacter.energy < energyCost) {
        addToast({ message: "Not enough energy to race!", type: 'error' });
        set({ gameState: GameState.ADVENTURE_MAP, currentBossIntro: null });
        return;
    }
    const newCharacter = { ...playerCharacter, coins: playerCharacter.coins - boss.entryFee, energy: playerCharacter.energy - energyCost };
    characterService.saveCharacterData(newCharacter);
    set({ playerCharacter: newCharacter });
    _resetTypingState();
    set({ 
      raceMode: RaceMode.BOSS_BATTLE, 
      rankCounter: 1,
      gameState: GameState.LOADING,
      loadingMessage: 'The boss is preparing their challenge...',
      sprintAvailable: true,
    });
    const paragraph = await getTypingParagraph(RaceTheme.MOVIE_QUOTES, RaceMode.SOLO_HARD);
    const players: Player[] = [
        { id: PLAYER_ID, name: get().playerName, isPlayer: true, progress: 0, wpm: 0, accuracy: 100, wpmHistory: [], character: get().playerCharacter },
        { id: boss.id, name: boss.name, isPlayer: false, progress: 0, wpm: 0, accuracy: 99, targetWpm: boss.wpm, character: boss.character },
    ];
    set({ players, textToType: paragraph, currentBossIntro: null, gameState: GameState.COUNTDOWN, elapsedTime: 0 });
  },

  setPlayerPattern: (pattern) => {
    set(state => {
        const newCharacter = { ...state.playerCharacter, pattern };
        characterService.saveCharacterData(newCharacter);
        return { playerCharacter: newCharacter };
    });
  },

  toggleMute: () => set({ isMuted: soundService.toggleMute() }),
  setShowStatsModal: (show) => set({ showStatsModal: show }),
  setShowLeaderboardModal: (show) => set({ showLeaderboardModal: show }),
  setShowAchievementsModal: (show) => set({ showAchievementsModal: show }),
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),
  setShowCharacterModal: (show) => set({ showCharacterModal: show }),
  setShowTutorialModal: (show) => {
    set({ showTutorialModal: show });
    if (!show) localStorage.setItem('gemini-type-racer-tutorial-seen', 'true');
  },
  setShowPetModal: (show) => set({ showPetModal: show }),
  applySoundPack: (packId) => {
    const newSettings: PlayerSettings = { ...get().playerSettings, activeSoundPackId: packId };
    customizationService.savePlayerSettings(newSettings);
    soundService.setSoundPack(packId);
    set({ playerSettings: newSettings });
  },
  equipItem: (itemId: string) => {
    const { playerCharacter } = get();
    const item = characterService.allCustomizationItems.find(i => i.id === itemId);
    if (!item || item.type !== 'hat') return;
    const newCharacter = { ...playerCharacter };
    const currentlyEquippedId = newCharacter.equippedItems.hat;
    newCharacter.equippedItems.hat = currentlyEquippedId === itemId ? null : itemId;
    characterService.saveCharacterData(newCharacter);
    set({ playerCharacter: newCharacter });
  },
  equipPet: (petId) => {
      set(state => {
          const currentPet = state.playerCharacter.activePet;
          const newCharacter = { ...state.playerCharacter, activePet: currentPet === petId ? null : petId };
          characterService.saveCharacterData(newCharacter);
          return { playerCharacter: newCharacter };
      });
  },
  addToast: (toast) => {
    const id = Date.now().toString();
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  // Typing Actions (from hook)
  _resetTypingState: () => {
    storeRefs.startTime = null;
    storeRefs.lastHistoryPushTime = 0;
    storeRefs.mistypedChars = {};
    if (storeRefs.enduranceTimer) clearTimeout(storeRefs.enduranceTimer);
    storeRefs.enduranceTimer = null;
    set({ typed: '', errors: new Set(), playerStats: { wpm: 0, accuracy: 0, progress: 0, mistypedChars: {} }, isFinished: false, wpmHistory: [], lastMistakeTime: 0 });
  },
  _calculateStats: () => {
    set(state => {
        if (!storeRefs.startTime) return state;
        const now = Date.now();
        const elapsedTime = (now - storeRefs.startTime) / 1000 / 60;
        if (elapsedTime === 0) return state;
        const typedChars = state.typed.length;
        const wpm = (typedChars / 5) / elapsedTime;
        const correctChars = typedChars - state.errors.size;
        const accuracy = typedChars > 0 ? (correctChars / typedChars) * 100 : 100;
        const progress = (state.textToType.length > 0) ? (typedChars / state.textToType.length) * 100 : 0;
        const newStats: TypingStats = { wpm: Math.round(wpm), accuracy: Math.round(accuracy), progress, mistypedChars: storeRefs.mistypedChars };
        let newWpmHistory = state.wpmHistory;
        if (now - storeRefs.lastHistoryPushTime > 2000) {
            newWpmHistory = [...state.wpmHistory, { time: (now - storeRefs.startTime!) / 1000, wpm: newStats.wpm, progress: newStats.progress }];
            storeRefs.lastHistoryPushTime = now;
        }
        const isFinished = state.raceMode !== RaceMode.ENDURANCE && typedChars >= state.textToType.length && state.textToType.length > 0;
        if (isFinished && state.gameState === GameState.TYPING) {
            const finalWpm = Math.round(((correctChars / 5) / ((now - storeRefs.startTime) / 1000 / 60)));
            newStats.wpm = finalWpm;
        }
        return { playerStats: newStats, wpmHistory: newWpmHistory, isFinished };
    });
  },
  handleKeyDown: (key, isBackspace) => {
    const state = get();
    if (state.gameState !== GameState.TYPING || state.isFinished) return;

    if (state.raceMode === RaceMode.COURSE && !isBackspace && key !== state.textToType[state.typed.length]) {
        soundService.playKeyStroke(true);
        set({ lastMistakeTime: Date.now() });
        return;
    }

    if (!storeRefs.startTime) {
        storeRefs.startTime = Date.now();
        set({ wpmHistory: [{ time: 0, wpm: 0, progress: 0 }] });
        if (state.raceMode === RaceMode.ENDURANCE) {
            storeRefs.enduranceTimer = window.setTimeout(() => set({ isFinished: true }), ENDURANCE_DURATION_SECONDS * 1000);
        }
    }
    
    let newTyped = state.typed;
    let newErrors = state.errors;

    if (isBackspace) {
        if (state.typed.length === 0) return;
        soundService.playKeyStroke(true);
        newTyped = state.typed.slice(0, -1);
        if (state.errors.has(state.typed.length - 1)) {
            newErrors = new Set(state.errors);
            newErrors.delete(state.typed.length - 1);
        }
    } else if (key.length === 1) { 
        if (state.typed.length >= state.textToType.length && state.raceMode !== RaceMode.ENDURANCE) return;
        if (key === state.textToType[state.typed.length]) {
            soundService.playKeyStroke(false);
        } else {
            soundService.playKeyStroke(true);
            const wrongChar = state.textToType[state.typed.length];
            storeRefs.mistypedChars[wrongChar] = (storeRefs.mistypedChars[wrongChar] || 0) + 1;
            newErrors = new Set(state.errors).add(state.typed.length);
        }
        newTyped = state.typed + key;
    } else {
        return;
    }

    set({ typed: newTyped, errors: newErrors });
    get()._calculateStats();
  },
}));