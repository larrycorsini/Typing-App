import { PlayerCharacter, CharacterCustomizationItem } from '../types';
import { customizationService } from './customizationService';

const CHARACTER_DATA_KEY = 'gemini-type-racer-character';

export const allCustomizationItems: CharacterCustomizationItem[] = [
    { id: 'top_hat', name: 'Top Hat', type: 'hat', emoji: '🎩' },
    { id: 'crown', name: 'Crown', type: 'hat', emoji: '👑' },
    { id: 'cowboy_hat', name: 'Cowboy Hat', type: 'hat', emoji: '🤠' },
    { id: 'grad_cap', name: 'Graduation Cap', type: 'hat', emoji: '🎓' },
    { id: 'sunglasses', name: 'Sunglasses', type: 'accessory', emoji: '🕶️' },
    { id: 'scarf', name: 'Scarf', type: 'accessory', emoji: '🧣' },
    { id: 'tie', name: 'Tie', type: 'accessory', emoji: '👔' },
];

const levelUnlocks: Record<number, string[]> = {
    2: ['sunglasses'],
    3: ['scarf'],
    5: [], // Cowboy hat is unlocked via achievement
    7: ['grad_cap'],
    10: ['crown'],
};


const XP_BASE = 100;
const XP_FACTOR = 1.2;

const calculateXpToNextLevel = (level: number): number => {
    return Math.floor(XP_BASE * Math.pow(level, XP_FACTOR));
};

const getDefaultCharacter = (): PlayerCharacter => ({
    level: 1,
    xp: 0,
    xpToNextLevel: calculateXpToNextLevel(1),
    equippedItems: {
        hat: 'top_hat',
        accessory: null,
    },
    color: '#FFD700', // Default color: gold
    running: 1,
});

export const characterService = {
    allCustomizationItems,
    levelUnlocks,

    getCharacterData: (): PlayerCharacter => {
        try {
            const stored = localStorage.getItem(CHARACTER_DATA_KEY);
            const defaults = getDefaultCharacter();
            return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
        } catch (e) {
            return getDefaultCharacter();
        }
    },

    saveCharacterData: (character: PlayerCharacter) => {
        try {
            localStorage.setItem(CHARACTER_DATA_KEY, JSON.stringify(character));
        } catch (e) {
            console.error("Failed to save character data", e);
        }
    },

    unlockItem: (itemId: string): boolean => {
        const unlocked = customizationService.getUnlocked();
        if (unlocked.characterItems.includes(itemId)) return false;
        
        unlocked.characterItems.push(itemId);
        const { themes, soundPacks, characterItems } = unlocked;
        // Save the entire object back
        localStorage.setItem('gemini-type-racer-unlocked-customizations', JSON.stringify({ themes, soundPacks, characterItems }));
        return true;
    },

    addXp: (character: PlayerCharacter, amount: number): { newCharacterState: PlayerCharacter, leveledUp: boolean, unlockedItems: CharacterCustomizationItem[] } => {
        let { level, xp, xpToNextLevel } = character;
        let leveledUp = false;
        const unlockedItems: CharacterCustomizationItem[] = [];

        xp += amount;

        while (xp >= xpToNextLevel) {
            leveledUp = true;
            xp -= xpToNextLevel;
            level++;
            xpToNextLevel = calculateXpToNextLevel(level);

            const newUnlocks = levelUnlocks[level] || [];
            newUnlocks.forEach(itemId => {
                const item = allCustomizationItems.find(i => i.id === itemId);
                if (item) {
                    unlockedItems.push(item);
                }
            });
        }
        
        const newCharacterState = { ...character, level, xp, xpToNextLevel };
        return { newCharacterState, leveledUp, unlockedItems };
    },

    getTrainingCost: (statLevel: number): number => {
        return Math.floor(25 * Math.pow(statLevel, 1.5));
    },

    trainStat: (character: PlayerCharacter, stat: 'running'): { newCharacterState: PlayerCharacter, cost: number, success: boolean } => {
        const cost = characterService.getTrainingCost(character[stat]);
        if (character.xp < cost) {
            return { newCharacterState: character, cost, success: false };
        }

        const newCharacterState = {
            ...character,
            xp: character.xp - cost,
            [stat]: character[stat] + 1,
        };

        return { newCharacterState, cost, success: true };
    },
};