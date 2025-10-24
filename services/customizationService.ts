import { CustomizationTheme, PlayerSettings, UnlockedCustomizations } from '../types';

const UNLOCKED_CUSTOMIZATIONS_KEY = 'gemini-type-racer-unlocked-customizations';
const PLAYER_SETTINGS_KEY = 'gemini-type-racer-player-settings';

export const allThemes: CustomizationTheme[] = [
    { id: 'default', name: 'Default Dark' },
    { id: 'fiery', name: 'Fiery Orange' },
];

export const customizationService = {
    getUnlocked: (): UnlockedCustomizations => {
        try {
            const stored = localStorage.getItem(UNLOCKED_CUSTOMIZATIONS_KEY);
            const defaults: UnlockedCustomizations = { themes: ['default'] };
            return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
        } catch (e) {
            return { themes: ['default'] };
        }
    },

    unlockTheme: (themeId: CustomizationTheme['id']): boolean => {
        const unlocked = customizationService.getUnlocked();
        if (unlocked.themes.includes(themeId)) {
            return false; // Already unlocked
        }
        unlocked.themes.push(themeId);
        localStorage.setItem(UNLOCKED_CUSTOMIZATIONS_KEY, JSON.stringify(unlocked));
        return true;
    },
    
    getPlayerSettings: (): PlayerSettings => {
        try {
            const stored = localStorage.getItem(PLAYER_SETTINGS_KEY);
            const defaults: PlayerSettings = { activeThemeId: 'default' };
            return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
        } catch (e) {
            return { activeThemeId: 'default' };
        }
    },
    
    savePlayerSettings: (settings: PlayerSettings) => {
        localStorage.setItem(PLAYER_SETTINGS_KEY, JSON.stringify(settings));
    }
};
