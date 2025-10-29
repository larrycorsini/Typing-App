



export enum Evolution {
  ATHLETIC = 'ATHLETIC',
  STAMINA = 'STAMINA',
  INTELLECT = 'INTELLECT',
}

export enum GameState {
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  ADVENTURE_MAP = 'ADVENTURE_MAP',
  RACE_CONFIRMATION = 'RACE_CONFIRMATION',
  LOADING = 'LOADING',
  COUNTDOWN = 'COUNTDOWN',
  TYPING = 'TYPING',
  RESULTS = 'RESULTS',
  PARTY_SETUP = 'PARTY_SETUP',
  PARTY_TRANSITION = 'PARTY_TRANSITION',
  ONLINE_LOBBY = 'ONLINE_LOBBY',
  CUSTOM_TEXT_SETUP = 'CUSTOM_TEXT_SETUP',
  COURSE_LOBBY = 'COURSE_LOBBY',
  TRAINING_GROUND = 'TRAINING_GROUND',
  SHOP = 'SHOP',
  TOURNAMENT_LOBBY = 'TOURNAMENT_LOBBY',
  TRAINING_RUNNING = 'TRAINING_RUNNING',
  TRAINING_SWIMMING = 'TRAINING_SWIMMING',
  TRAINING_FLYING = 'TRAINING_FLYING',
  BOSS_INTRO = 'BOSS_INTRO',
  OTHER_MODES = 'OTHER_MODES',
}

export enum RaceMode {
  SOLO_EASY = 'SOLO_EASY', // Kept for Gemini paragraph generation context
  SOLO_MEDIUM = 'SOLO_MEDIUM',
  SOLO_HARD = 'SOLO_HARD',
  ADVENTURE = 'ADVENTURE',
  GHOST = 'GHOST',
  PUBLIC = 'PUBLIC',
  PARTY = 'PARTY',
  ONLINE_RACE = 'ONLINE_RACE',
  ENDURANCE = 'ENDURANCE',
  CUSTOM_TEXT = 'CUSTOM_TEXT',
  DAILY_CHALLENGE = 'DAILY_CHallenge',
  COURSE = 'COURSE',
  BOSS_BATTLE = 'BOSS_BATTLE',
}

export enum RaceTheme {
  HARRY_POTTER = 'HARRY_POTTER',
  MOVIE_QUOTES = 'MOVIE_QUOTES',
  SONG_LYRICS = 'SONG_LYRICS',
  CODE_SNIPPETS = 'CODE_SNIPPETS',
}

export interface WpmDataPoint {
  time: number;
  wpm: number;
  progress: number;
}

export interface Player {
  id: string;
  name: string;
  isPlayer: boolean;
  isGhost?: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  rank?: number;
  wpmHistory?: WpmDataPoint[];
  character?: PlayerCharacter;
  isBoosted?: boolean;
  // Bot-specific properties
  targetWpm?: number;
  isFallingBehind?: boolean;
  mistakeCycles?: number;
}

export interface PlayerStats {
  totalRaces: number;
  wins: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
}

export interface PartyPlayer {
  name: string;
  wpm: number;
  accuracy: number;
  rank?: number;
}

export interface GhostData {
  wpmHistory: WpmDataPoint[];
  finalWpm: number;
  text: string;
}

export type AchievementId = 'FIRST_RACE' | 'FIRST_WIN' | 'WPM_100' | 'PERFECT_ACCURACY' | 'ALL_THEMES' | 'ENDURANCE_MASTER' | 'DIY_RACER' | 'DAILY_RACER' | 'SOUND_MAESTRO' | 'LEVEL_5' | 'CHAMPION';

export interface CustomizationSoundPack {
    id: 'classic' | 'scifi' | 'mechanical';
    name: string;
}

export interface PlayerSettings {
    activeSoundPackId: CustomizationSoundPack['id'];
}

export interface UnlockedCustomizations {
    soundPacks: CustomizationSoundPack['id'][];
    characterItems: string[];
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  unlocked: boolean;
  reward?:
    | { type: 'soundPack'; id: CustomizationSoundPack['id'] }
    | { type: 'characterItem'; id: string };
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  timestamp: number;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'info' | 'error';
}
export interface TypingStats {
  wpm: number;
  accuracy: number;
  progress: number;
  mistypedChars: Record<string, number>;
}

// Typing Course Types
export interface CourseLesson {
    id: number;
    title: string;
    text: string; // Fallback or static text
    characterPool?: string; // e.g. "asdfjkl;"
    wordPool?: string[]; // e.g. ["a", "sad", "lad"]
    goals: {
        wpm: number;
        accuracy: number;
    };
}

export interface CourseSection {
    title: string;
    lessons: CourseLesson[];
}

// Character Customization Types
export interface CharacterCustomizationItem {
  id: string;
  name: string;
  type: 'hat' | 'accessory';
  emoji: string;
}

export type ConsumableItemId = 'energy_seed' | 'focus_goggles' | 'wpm_booster';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'food' | 'gear';
    effect: {
        type: 'energy' | 'wpm_boost' | 'focus';
        value: number;
    };
}


export interface PlayerCharacter {
  evolution: Evolution;
  level: number;
  xp: number;
  xpToNextLevel: number;
  equippedItems: {
    hat: string | null;
    accessory: string | null;
  };
  color: string;
  running: number;
  runningXp: number;
  runningXpToNextLevel: number;
  swimming: number;
  swimmingXp: number;
  swimmingXpToNextLevel: number;
  flying: number;
  flyingXp: number;
  flyingXpToNextLevel: number;
  energy: number;
  maxEnergy: number;
  coins: number;
  defeatedBosses: string[];
  inventory: Record<ConsumableItemId, number>;
  mapProgress: number; // ID of the last completed map node
}

export interface Boss {
  id: string;
  name: string;
  wpm: number;
  character: PlayerCharacter;
  skillRequirements: {
    running: number;
    swimming: number;
    flying: number;
  };
  narrative: string;
  taunt: string;
  entryFee: number;
  rewards: {
      xp: number;
      coins: number;
  }
}

export interface League {
    id: string;
    name: string;
    bosses: Boss[];
}

// Adventure Map Types
export type MapNodeType = 'RACE' | 'TRAINING' | 'SHOP' | 'BOSS';
export interface MapNode {
  id: number;
  name: string;
  type: MapNodeType;
  position: { top: string; left: string };
  // Race-specific properties
  bots?: { name: string; targetWpm: number; evolution: Evolution }[];
  // Boss-specific properties
  bossId?: string;
}
export interface MapZone {
    name: string;
    nodes: MapNode[];
}


// WebSocket Types
export interface RoomInfo {
    id: string;
    playerCount: number;
    state: 'waiting' | 'countdown' | 'racing';
    players: { id: string, name: string }[];
}

export type ClientToServerMessage =
  | { type: 'getRoomList' }
  | { type: 'createRoom'; playerName: string }
  | { type: 'joinRoom'; roomId: string; playerName: string }
  | { type: 'progressUpdate'; progress: number; wpm: number }
  | { type: 'raceFinished'; wpm: number; accuracy: number }
  | { type: 'getDailyChallenge' };

export type ServerToClientMessage =
  | { type: 'roomList'; rooms: RoomInfo[] }
  | { type: 'roomCreated'; roomId: string }
  | { type: 'joinedRoom'; room: RoomInfo; yourId: string }
  | { type: 'playerJoined'; player: { id: string; name: string } }
  | { type: 'playerLeft'; playerId: string }
  | { type: 'raceStarting'; countdown: number }
  | { type: 'raceStart' }
  | { type: 'progressUpdate'; playerId: string; progress: number; wpm: number }
  | { type: 'playerFinished'; playerId: string; wpm: number; accuracy: number; rank?: number }
  | { type: 'dailyChallenge'; text: string }
  | { type: 'error'; message: string };