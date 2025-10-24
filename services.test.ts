
/**
 * @jest-environment jsdom
 */

// This file demonstrates how unit tests could be structured for this project.
// To run this, a testing framework like Jest would need to be set up.
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';
import { checkAndUnlockAchievements } from './services/achievementService';
import { addLeaderboardEntry, getLeaderboard } from './services/leaderboardService';
import { AchievementId, PlayerStats, RaceTheme } from './types';

// Mock localStorage for testing environment
class LocalStorageMock {
  private store: Record<string, string> = {};
  
  clear() {
    this.store = {};
  }
  
  getItem(key: string) {
    return this.store[key] || null;
  }
  
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  
  removeItem(key: string) {
    delete this.store[key];
  }
}

// In a real Jest setup, this would be in a setup file.
const localStorageMock = new LocalStorageMock();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


// Mock console.error to prevent logging during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  localStorageMock.clear();
});

describe('achievementService', () => {
  const mockStats: PlayerStats = { totalRaces: 0, wins: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 };

  it('should unlock FIRST_RACE achievement on first race', () => {
    const result = { wpm: 50, accuracy: 95, rank: 2, theme: RaceTheme.HARRY_POTTER, stats: mockStats };
    const unlocked = checkAndUnlockAchievements(result);
    expect(unlocked.some(a => a.id === 'FIRST_RACE')).toBe(true);
  });

  it('should unlock FIRST_WIN achievement on first win', () => {
    const result = { wpm: 80, accuracy: 98, rank: 1, theme: RaceTheme.MOVIE_QUOTES, stats: mockStats };
    const unlocked = checkAndUnlockAchievements(result);
    expect(unlocked.some(a => a.id === 'FIRST_WIN')).toBe(true);
  });
  
  it('should not unlock FIRST_WIN if rank is not 1', () => {
    const result = { wpm: 80, accuracy: 98, rank: 2, theme: RaceTheme.MOVIE_QUOTES, stats: mockStats };
    const unlocked = checkAndUnlockAchievements(result);
    expect(unlocked.some(a => a.id === 'FIRST_WIN')).toBe(false);
  });

  it('should unlock WPM_100 achievement for high WPM', () => {
    const result = { wpm: 105, accuracy: 99, rank: 1, theme: RaceTheme.CODE_SNIPPETS, stats: mockStats };
    const unlocked = checkAndUnlockAchievements(result);
    expect(unlocked.some(a => a.id === 'WPM_100')).toBe(true);
  });
  
  it('should unlock PERFECT_ACCURACY achievement for 100% accuracy', () => {
    const result = { wpm: 90, accuracy: 100, rank: 1, theme: RaceTheme.SONG_LYRICS, stats: mockStats };
    const unlocked = checkAndUnlockAchievements(result);
    expect(unlocked.some(a => a.id === 'PERFECT_ACCURACY')).toBe(true);
  });
  
  it('should not unlock achievements that are already unlocked', () => {
    // First race unlocks FIRST_RACE
    checkAndUnlockAchievements({ wpm: 50, accuracy: 95, rank: 2, theme: RaceTheme.HARRY_POTTER, stats: mockStats });
    
    // Second race
    const unlocked = checkAndUnlockAchievements({ wpm: 55, accuracy: 96, rank: 3, theme: RaceTheme.HARRY_POTTER, stats: mockStats });
    expect(unlocked.some(a => a.id === 'FIRST_RACE')).toBe(false); // Should not be in the "newly unlocked" list
  });
});

describe('leaderboardService', () => {
  it('should add a new entry to an empty leaderboard', () => {
    addLeaderboardEntry({ name: 'Player1', wpm: 100, accuracy: 95 });
    const leaderboard = getLeaderboard();
    expect(leaderboard.length).toBe(1);
    expect(leaderboard[0].name).toBe('Player1');
  });
  
  it('should sort entries by WPM descending', () => {
    addLeaderboardEntry({ name: 'PlayerSlow', wpm: 50, accuracy: 100 });
    addLeaderboardEntry({ name: 'PlayerFast', wpm: 100, accuracy: 100 });
    const leaderboard = getLeaderboard();
    expect(leaderboard[0].name).toBe('PlayerFast');
    expect(leaderboard[1].name).toBe('PlayerSlow');
  });

  it('should cap the leaderboard at 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      addLeaderboardEntry({ name: `Player${i}`, wpm: 50 + i, accuracy: 95 });
    }
    const leaderboard = getLeaderboard();
    expect(leaderboard.length).toBe(10);
  });

  it('should keep the highest score when capped', () => {
    for (let i = 0; i < 11; i++) {
        // WPMs from 100 down to 90
      addLeaderboardEntry({ name: `Player${i}`, wpm: 100 - i, accuracy: 95 });
    }
    const leaderboard = getLeaderboard();
    expect(leaderboard[0].wpm).toBe(100);
    expect(leaderboard[leaderboard.length - 1].wpm).toBe(91);
    expect(leaderboard.some(e => e.wpm === 90)).toBe(false);
  });
});
