
import { Achievement, AchievementId, PlayerStats, RaceTheme } from '../types';

const ACHIEVEMENTS_STORAGE_KEY = 'gemini-type-racer-achievements';

const allAchievements: Omit<Achievement, 'unlocked'>[] = [
    { id: 'FIRST_RACE', name: 'Off the Starting Blocks', description: 'Complete your first race.' },
    { id: 'FIRST_WIN', name: 'Victory Lap', description: 'Win your first race.' },
    { id: 'WPM_100', name: 'Need for Speed', description: 'Achieve a WPM of 100 or more.' },
    { id: 'PERFECT_ACCURACY', name: 'Flawless Victory', description: 'Finish a race with 100% accuracy.' },
    { id: 'ALL_THEMES', name: 'Globetrotter', description: 'Complete a race in every theme.' },
];

export const getAchievements = (): Achievement[] => {
    try {
        const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        const unlockedIds: AchievementId[] = stored ? JSON.parse(stored) : [];
        return allAchievements.map(ach => ({
            ...ach,
            unlocked: unlockedIds.includes(ach.id),
        }));
    } catch (e) {
        console.error('Failed to load achievements', e);
        return allAchievements.map(ach => ({ ...ach, unlocked: false }));
    }
};

const saveAchievements = (unlocked: Achievement[]) => {
    try {
        const unlockedIds = unlocked.filter(a => a.unlocked).map(a => a.id);
        localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlockedIds));
    } catch (e) {
        console.error('Failed to save achievements', e);
    }
};

interface RaceResultForAchievements {
    wpm: number;
    accuracy: number;
    rank: number;
    theme: RaceTheme;
    stats: PlayerStats;
}

// Store which themes have been played
const getPlayedThemes = (): RaceTheme[] => {
    try {
        const stored = localStorage.getItem('gemini-type-racer-played-themes');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

const addPlayedTheme = (theme: RaceTheme) => {
    try {
        const themes = new Set(getPlayedThemes());
        themes.add(theme);
        localStorage.setItem('gemini-type-racer-played-themes', JSON.stringify(Array.from(themes)));
    } catch (e) {
        console.error('Failed to save played themes', e);
    }
}


export const checkAndUnlockAchievements = (result: RaceResultForAchievements): Achievement[] => {
    const currentAchievements = getAchievements();
    const newlyUnlocked: Achievement[] = [];

    addPlayedTheme(result.theme);
    const playedThemes = getPlayedThemes();

    const check = (id: AchievementId, condition: boolean) => {
        const achievement = currentAchievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked && condition) {
            achievement.unlocked = true;
            newlyUnlocked.push(achievement);
        }
    };

    check('FIRST_RACE', true); // This is checked after every race, so if it's not unlocked, it will be.
    check('FIRST_WIN', result.rank === 1);
    check('WPM_100', result.wpm >= 100);
    check('PERFECT_ACCURACY', result.accuracy === 100);
    check('ALL_THEMES', Object.values(RaceTheme).every(theme => playedThemes.includes(theme)));

    if (newlyUnlocked.length > 0) {
        saveAchievements(currentAchievements);
    }

    return newlyUnlocked;
};