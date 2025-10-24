
import { LeaderboardEntry } from '../types';

const LEADERBOARD_STORAGE_KEY = 'gemini-type-racer-leaderboard';
const LEADERBOARD_MAX_ENTRIES = 10;

export const getLeaderboard = (): LeaderboardEntry[] => {
    try {
        const stored = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load leaderboard', e);
        return [];
    }
};

export const addLeaderboardEntry = (entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>) => {
    try {
        const leaderboard = getLeaderboard();
        const newEntry: LeaderboardEntry = {
            ...entry,
            id: `${Date.now()}-${entry.name}`,
            timestamp: Date.now(),
        };

        const newLeaderboard = [...leaderboard, newEntry]
            .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
            .slice(0, LEADERBOARD_MAX_ENTRIES);

        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(newLeaderboard));
    } catch (e) {
        console.error('Failed to save leaderboard', e);
    }
};