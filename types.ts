export enum GameState {
  NAME_SELECTION = 'NAME_SELECTION',
  LOBBY = 'LOBBY',
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

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  unlocked: boolean;
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
// FIX: Moved TypingStats here from hooks/useTypingGame.ts so it can be shared with the store.
export interface TypingStats {
  wpm: number;
  accuracy: number;
  progress: number;
}
