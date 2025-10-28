import { PlayerCharacter, CharacterCustomizationItem, Boss } from '../types';
import { customizationService } from './customizationService';

const CHARACTER_DATA_KEY = 'gemini-type-racer-character';

export const RACE_ENERGY_COST = 25;
export const TRAIN_ENERGY_COST = 20;

const foodItems = {
    seed: { cost: 10, energy: 25 },
    bread: { cost: 30, energy: 75 },
};

export const allCustomizationItems: CharacterCustomizationItem[] = [
    { id: 'top_hat', name: 'Top Hat', type: 'hat', emoji: '🎩' },
    { id: 'crown', name: 'Crown', type: 'hat', emoji: '👑' },
    { id: 'cowboy_hat', name: 'Cowboy Hat', type: 'hat', emoji: '🤠' },
    { id: 'grad_cap', name: 'Graduation Cap', type: 'hat', emoji: '🎓' },
    { id: 'championship_crown', name: 'Championship Crown', type: 'hat', emoji: '👑' },
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
    swimming: 1,
    flying: 1,
    energy: 100,
    maxEnergy: 100,
    coins: 0,
    defeatedBosses: [],
});

export const bosses: Boss[] = [
  {
    id: 'paddles',
    name: 'Paddles',
    wpm: 40,
    skillRequirements: { running: 5, swimming: 1, flying: 1 },
    character: { ...getDefaultCharacter(), color: '#a1a1aa', equippedItems: { hat: null, accessory: null } },
  },
  {
    id: 'quackmire',
    name: 'Quackmire',
    wpm: 65,
    skillRequirements: { running: 10, swimming: 10, flying: 1 },
    character: { ...getDefaultCharacter(), color: '#22c55e', equippedItems: { hat: null, accessory: 'scarf' } },
  },
  {
    id: 'aeroduck',
    name: 'AeroDuck',
    wpm: 85,
    skillRequirements: { running: 15, swimming: 15, flying: 15 },
    character: { ...getDefaultCharacter(), color: '#3b82f6', equippedItems: { hat: null, accessory: 'sunglasses' } },
  },
  {
    id: 'champion',
    name: 'The Champion',
    wpm: 110,
    skillRequirements: { running: 25, swimming: 25, flying: 25 },
    character: { ...getDefaultCharacter(), color: '#f59e0b', equippedItems: { hat: 'crown', accessory: null } },
  },
];


export const characterService = {
    allCustomizationItems,
    levelUnlocks,
    foodItems,
    bosses,
    // FIX: Export getDefaultCharacter so it can be used in the store.
    getDefaultCharacter,

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

    trainStat: (character: PlayerCharacter, stat: 'running' | 'swimming' | 'flying'): { newCharacterState: PlayerCharacter, message: string, success: boolean } => {
        const xpCost = characterService.getTrainingCost(character[stat]);
        
        if (character.energy < TRAIN_ENERGY_COST) {
            return { newCharacterState: character, message: `Not enough energy! Need ${TRAIN_ENERGY_COST} energy.`, success: false };
        }
        if (character.xp < xpCost) {
            return { newCharacterState: character, message: `Not enough XP! Need ${xpCost} XP.`, success: false };
        }

        const newCharacterState = {
            ...character,
            xp: character.xp - xpCost,
            energy: character.energy - TRAIN_ENERGY_COST,
            [stat]: character[stat] + 1,
        };

        return { newCharacterState, message: 'Training successful!', success: true };
    },

    feedDuck: (character: PlayerCharacter, foodId: 'seed' | 'bread'): { newCharacterState: PlayerCharacter, message: string, success: boolean } => {
        const food = foodItems[foodId];
        if (character.coins < food.cost) {
            return { newCharacterState: character, message: `Not enough coins! Need ${food.cost}.`, success: false };
        }

        const newEnergy = Math.min(character.maxEnergy, character.energy + food.energy);
        const newCharacterState = {
            ...character,
            coins: character.coins - food.cost,
            energy: newEnergy,
        };
        
        return { newCharacterState, message: `Restored ${food.energy} energy!`, success: true };
    },
};