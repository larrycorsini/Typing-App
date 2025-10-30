import { PlayerSettings, UnlockedCustomizations, CustomizationSoundPack, PetId } from '../types';

const UNLOCKED_CUSTOMIZATIONS_KEY = 'gemini-type-racer-unlocked-customizations';
const PLAYER_SETTINGS_KEY = 'gemini-type-racer-player-settings';

export const allSoundPacks: CustomizationSoundPack[] = [
    { id: 'classic', name: 'Classic' },
    { id: 'scifi', name: 'Sci-Fi' },
    { id: 'mechanical', name: 'Mechanical' },
];

const getDefaults = (): { customizations: UnlockedCustomizations, settings: PlayerSettings } => ({
    customizations: {
        soundPacks: ['classic', 'scifi'], // Give scifi for free
        characterItems: [], 
        unlockedPets: [],
    },
    settings: {
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
                    soundPacks: parsed.soundPacks || defaults.soundPacks,
                    characterItems: parsed.characterItems || defaults.characterItems,
                    unlockedPets: parsed.unlockedPets || defaults.unlockedPets,
                };
            }
            return defaults;
        } catch (e) {
            return getDefaults().customizations;
        }
    },

    unlockSoundPack: (packId: CustomizationSoundPack['id']): boolean => {
        const unlocked = customizationService.getUnlocked();
        if (unlocked.soundPacks.includes(packId)) return false;
        unlocked.soundPacks.push(packId);
        localStorage.setItem(UNLOCKED_CUSTOMIZATIONS_KEY, JSON.stringify(unlocked));
        return true;
    },
    
    unlockPet: (petId: PetId): boolean => {
        const unlocked = customizationService.getUnlocked();
        if (unlocked.unlockedPets.includes(petId)) return false;
        unlocked.unlockedPets.push(petId);
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