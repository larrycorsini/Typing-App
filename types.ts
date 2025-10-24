
export enum GameState {
  NAME_SELECTION = 'NAME_SELECTION',
  LOBBY = 'LOBBY',
  COUNTDOWN = 'COUNTDOWN',
  TYPING = 'TYPING',
  RESULTS = 'RESULTS',
  PARTY_SETUP = 'PARTY_SETUP',
  PARTY_TRANSITION = 'PARTY_TRANSITION',
  ONLINE_LOBBY = 'ONLINE_LOBBY',
  CUSTOM_TEXT_SETUP = 'CUSTOM_TEXT_SETUP',
}

export enum RaceMode {
  SOLO_EASY = 'SOLO_EASY',
  SOLO_MEDIUM = 'SOLO_MEDIUM',
  SOLO_HARD = 'SOLO_HARD',
  GHOST = 'GHOST',
  PUBLIC = 'PUBLIC', // Kept for bot simulation, but less prominent
  PARTY = 'PARTY',
  ONLINE_RACE = 'ONLINE_RACE',
  ENDURANCE = 'ENDURANCE',
  CUSTOM_TEXT = 'CUSTOM_TEXT',
  DAILY_CHALLENGE = 'DAILY_CHALLENGE',
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
  textLength: number;
}

export type AchievementId = 'FIRST_RACE' | 'FIRST_WIN' | 'WPM_100' | 'PERFECT_ACCURACY' | 'ALL_THEMES' | 'ENDURANCE_MASTER' | 'DIY_RACER' | 'DAILY_RACER' | 'SOUND_MAESTRO';

export interface CustomizationTheme {
    id: 'default' | 'fiery';
    name: string;
}

export interface CustomizationSoundPack {
    id: 'classic' | 'scifi' | 'mechanical';
    name: string;
}

export interface PlayerSettings {
    activeThemeId: CustomizationTheme['id'];
    activeSoundPackId: CustomizationSoundPack['id'];
}

export interface UnlockedCustomizations {
    themes: CustomizationTheme['id'][];
    soundPacks: CustomizationSoundPack['id'][];
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  unlocked: boolean;
  // FIX: Converted `reward` to a discriminated union to allow for correct type narrowing.
  reward?:
    | { type: 'theme'; id: CustomizationTheme['id'] }
    | { type: 'soundPack'; id: CustomizationSoundPack['id'] };
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
  | { type: 'joinedRoom'; room: RoomInfo }
  | { type: 'playerJoined'; player: { id: string; name: string } }
  | { type: 'playerLeft'; playerId: string }
  | { type: 'raceStarting'; countdown: number }
  | { type: 'raceStart' }
  | { type: 'progressUpdate'; playerId: string; progress: number; wpm: number }
  | { type: 'playerFinished'; playerId: string; wpm: number; accuracy: number; rank?: number }
  | { type: 'dailyChallenge'; text: string }
  | { type: 'error'; message: string };
