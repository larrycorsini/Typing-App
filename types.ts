export enum GameState {
  NAME_SELECTION = 'NAME_SELECTION',
  LOBBY = 'LOBBY',
  LIVE_RACE_LOBBY = 'LIVE_RACE_LOBBY',
  COUNTDOWN = 'COUNTDOWN',
  TYPING = 'TYPING',
  RESULTS = 'RESULTS',
}

export enum RaceMode {
  SOLO_EASY = 'SOLO_EASY',
  SOLO_MEDIUM = 'SOLO_MEDIUM',
  SOLO_HARD = 'SOLO_HARD',
  GHOST = 'GHOST',
  PUBLIC = 'PUBLIC',
  LIVE_RACE = 'LIVE_RACE',
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

export interface GhostData {
  wpmHistory: WpmDataPoint[];
  finalWpm: number;
  textLength: number;
}

export type AchievementId = 'FIRST_RACE' | 'FIRST_WIN' | 'WPM_100' | 'PERFECT_ACCURACY' | 'ALL_THEMES';

export interface CustomizationTheme {
    id: 'default' | 'fiery';
    name: string;
}

export interface PlayerSettings {
    activeThemeId: CustomizationTheme['id'];
}

export interface UnlockedCustomizations {
    themes: CustomizationTheme['id'][];
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  unlocked: boolean;
  reward?: {
    type: 'theme';
    id: CustomizationTheme['id'];
  }
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
}