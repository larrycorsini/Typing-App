
import { useState, useEffect, useCallback } from 'react';
import { PlayerStats, WpmDataPoint, GhostData } from '../types';

const STATS_STORAGE_KEY = 'gemini-type-racer-stats';
const GHOST_STORAGE_KEY = 'gemini-type-racer-ghost';

const initialStats: PlayerStats = {
  totalRaces: 0,
  wins: 0,
  bestWpm: 0,
  avgWpm: 0,
  avgAccuracy: 0,
};

export const usePlayerStats = () => {
  const [stats, setStats] = useState<PlayerStats>(initialStats);

  useEffect(() => {
    try {
      const storedStats = localStorage.getItem(STATS_STORAGE_KEY);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error("Failed to load player stats from localStorage", error);
    }
  }, []);

  const updateStats = useCallback((raceResult: { wpm: number; accuracy: number; rank: number, wpmHistory: WpmDataPoint[], textLength: number }) => {
    let isNewBest = false;
    setStats(prevStats => {
      const newTotalRaces = prevStats.totalRaces + 1;
      const newWins = prevStats.wins + (raceResult.rank === 1 ? 1 : 0);
      
      if (raceResult.wpm > prevStats.bestWpm) {
        isNewBest = true;
      }
      const newBestWpm = Math.max(prevStats.bestWpm, raceResult.wpm);
      
      const newAvgWpm = ((prevStats.avgWpm * prevStats.totalRaces) + raceResult.wpm) / newTotalRaces;
      const newAvgAccuracy = ((prevStats.avgAccuracy * prevStats.totalRaces) + raceResult.accuracy) / newTotalRaces;

      const newStats: PlayerStats = {
        totalRaces: newTotalRaces,
        wins: newWins,
        bestWpm: newBestWpm,
        avgWpm: Math.round(newAvgWpm),
        avgAccuracy: Math.round(newAvgAccuracy),
      };

      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));

        if(isNewBest) {
            const ghostData: GhostData = {
                wpmHistory: raceResult.wpmHistory,
                finalWpm: raceResult.wpm,
                textLength: raceResult.textLength,
            }
            localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(ghostData));
        }
      } catch (error) {
        console.error("Failed to save player stats to localStorage", error);
      }
      
      return newStats;
    });
  }, []);

  return { stats, updateStats };
};