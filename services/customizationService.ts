import { CustomizationTheme, PlayerSettings, UnlockedCustomizations, CustomizationSoundPack } from '../types';

const UNLOCKED_CUSTOMIZATIONS_KEY = 'gemini-type-racer-unlocked-customizations';
const PLAYER_SETTINGS_KEY = 'gemini-type-racer-player-settings';

export const allThemes: CustomizationTheme[] = [
    { id: 'default', name: 'Default Dark' },
    { id: 'fiery', name: 'Fiery Orange' },
];

export const allSoundPacks: CustomizationSoundPack[] = [
    { id: 'classic', name: 'Classic' },
    { id: 'scifi', name: 'Sci-Fi' },
    { id: 'mechanical', name: 'Mechanical' },
];

const getDefaults = (): { customizations: UnlockedCustomizations, settings: PlayerSettings } => ({
    customizations: {
        themes: ['default'],
        soundPacks: ['classic', 'scifi'], // Give scifi for free
        characterItems: ['top_hat'], // Start with a default hat
    },
    settings: {
        activeThemeId: 'default',
        activeSoundPackId: 'classic',
    }
});

export const customizationService = {
    getUnlocked: (): UnlockedCustomizations => {
        try {
            const stored = localStorage.getItem(UNLOCKED_CUSTOMIZATIONS_KEY);
            const defaults = getDefaults().customizations;
            if (stored) {
                const parsed = JSON.parse(stored);
                // Ensure all keys exist
                return {
                    themes: parsed.themes || defaults.themes,
                    soundPacks: parsed.soundPacks || defaults.soundPacks,
                    characterItems: parsed.characterItems || defaults.characterItems,
                };
            }
            return defaults;
        } catch (e) {
            return getDefaults().customizations;
        }
    },

    unlockTheme: (themeId: CustomizationTheme['id']): boolean => {
        const unlocked = customizationService.getUnlocked();
        if (unlocked.themes.includes(themeId)) return false;
        unlocked.themes.push(themeId);
        localStorage.setItem(UNLOCKED_CUSTOMIZATIONS_KEY, JSON.stringify(unlocked));
        return true;
    },

    unlockSoundPack: (packId: CustomizationSoundPack['id']): boolean => {
        const unlocked = customizationService.getUnlocked();
        if (unlocked.soundPacks.includes(packId)) return false;
        unlocked.soundPacks.push(packId);
        localStorage.setItem(UNLOCKED_CUSTOMIZATIONS_KEY, JSON.stringify(unlocked));
        return true;
    },
    
    getPlayerSettings: (): PlayerSettings => {
        try {
            const stored = localStorage.getItem(PLAYER_SETTINGS_KEY);
            const defaults = getDefaults().settings;
            return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
        } catch (e) {
            return getDefaults().settings;
        }
    },
    
    savePlayerSettings: (settings: PlayerSettings) => {
        localStorage.setItem(PLAYER_SETTINGS_KEY, JSON.stringify(settings));
    }
};