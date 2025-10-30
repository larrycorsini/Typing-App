import { PlayerCharacter, CharacterCustomizationItem, League, ShopItem, ConsumableItemId, Evolution, DuckPattern, Pet, PetId } from '../types';
import { customizationService } from './customizationService';

const CHARACTER_DATA_KEY = 'gemini-type-racer-character';

export const RACE_ENERGY_COST = 25;
export const TRAINING_ENERGY_COST = 15;

export const allPets: Pet[] = [
    {
        id: 'bookworm',
        name: 'Bookworm',
        emoji: '🐛',
        description: 'A clever companion. Grants a 10% bonus to all XP earned from races.',
        bonus: { type: 'XP_BONUS', value: 0.10 }
    },
    {
        id: 'coin_pouch',
        name: 'Coin Pouch',
        emoji: '💰',
        description: 'This lucky pet helps you find 15% more coins after winning a race.',
        bonus: { type: 'COIN_BONUS', value: 0.15 }
    },
    {
        id: 'energy_seedling',
        name: 'Energy Seedling',
        emoji: '🌱',
        description: 'A helpful sprout that reduces the energy cost of every race and training session by 20%.',
        bonus: { type: 'ENERGY_SAVER', value: 0.20 }
    }
];

export const allShopItems: ShopItem[] = [
    {
        id: 'energy_seed',
        name: 'Energy Seed',
        description: 'A basic snack. Perfect for a quick boost.',
        cost: 25,
        type: 'food',
        effect: { type: 'energy', value: 25 }
    },
    {
        id: 'power_loaf',
        name: 'Power Loaf',
        description: 'A hearty meal. Fully replenishes your energy.',
        cost: 80,
        type: 'food',
        effect: { type: 'energy', value: 100 }
    },
    {
        id: 'focus_goggles',
        name: 'Focus Goggles',
        description: 'Highlights the next few words in a race, making them easier to anticipate.',
        cost: 100,
        type: 'gear',
        effect: { type: 'focus', value: 5 } // Highlights 5 words
    },
    {
        id: 'wpm_booster',
        name: 'WPM Booster',
        description: 'A shot of adrenaline that gives you a temporary speed boost at the start of a race.',
        cost: 150,
        type: 'gear',
        effect: { type: 'wpm_boost', value: 10 } // 10 second boost
    },
    {
        id: 'pet_egg',
        name: 'Mysterious Pet Egg',
        description: 'Who knows what\'s inside? Hatches into a random, unowned pet companion!',
        cost: 500,
        type: 'pet_egg'
    }
];


export const allCustomizationItems: CharacterCustomizationItem[] = [
    { id: 'party_hat', name: 'Party Hat', type: 'hat', emoji: '🎉' },
    { id: 'propeller_hat', name: 'Propeller Hat', type: 'hat', emoji: '🚁' },
    { id: 'top_hat', name: 'Top Hat', type: 'hat', emoji: '🎩' },
    { id: 'championship_crown', name: 'Championship Crown', type: 'hat', emoji: '👑' },
];

const levelUnlocks: Record<number, string[]> = {
    5: [], // Top hat is unlocked via achievement
    10: ['propeller_hat'],
};

const STAT_XP_BASE = 50;
const STAT_XP_FACTOR = 1.3;
const calculateStatXpToNextLevel = (level: number): number => {
    return Math.floor(STAT_XP_BASE * Math.pow(level, STAT_XP_FACTOR));
};

const XP_BASE = 100;
const XP_FACTOR = 1.2;
const calculateXpToNextLevel = (level: number): number => {
    return Math.floor(XP_BASE * Math.pow(level, XP_FACTOR));
};

const getDefaultCharacter = (evolution: Evolution = Evolution.ATHLETIC): PlayerCharacter => {
    const baseCharacter: Omit<PlayerCharacter, 'running' | 'maxEnergy' | 'flying' | 'xpToNextLevel' | 'runningXpToNextLevel' | 'swimmingXpToNextLevel' | 'flyingXpToNextLevel' | 'energy'> = {
        level: 1,
        xp: 0,
        evolution: evolution,
        equippedItems: { hat: null },
        color: '#FFD700',
        pattern: 'solid',
        runningXp: 0,
        swimming: 1,
        swimmingXp: 0,
        flyingXp: 0,
        coins: 0,
        defeatedBosses: [],
        inventory: { 'energy_seed': 0, 'focus_goggles': 0, 'wpm_booster': 0 },
        mapProgress: 0,
        activePet: null,
    };

    let running = 1;
    let flying = 1;
    let maxEnergy = 100;

    switch (evolution) {
        case Evolution.ATHLETIC:
            running = 3;
            break;
        case Evolution.STAMINA:
            maxEnergy = 120;
            break;
        case Evolution.INTELLECT:
            flying = 3; // Intellect is tied to flying for focus/hurdles
            break;
    }

    const finalCharacter: PlayerCharacter = {
        ...baseCharacter,
        running,
        flying,
        maxEnergy,
        energy: maxEnergy, // Start with full energy
        xpToNextLevel: calculateXpToNextLevel(1),
        runningXpToNextLevel: calculateStatXpToNextLevel(running),
        swimmingXpToNextLevel: calculateStatXpToNextLevel(1),
        flyingXpToNextLevel: calculateStatXpToNextLevel(flying),
    };

    return finalCharacter;
};

export const leagues: League[] = [
  {
    id: 'beginner_league',
    name: 'Beginner League',
    bosses: [
      {
        id: 'paddles',
        name: 'Paddles',
        wpm: 40,
        skillRequirements: { running: 5, swimming: 1, flying: 1 },
        character: { ...getDefaultCharacter(Evolution.ATHLETIC), color: '#a1a1aa', equippedItems: { hat: null }, mapProgress: 0, pattern: 'solid', activePet: null },
        narrative: "Paddles is the gatekeeper of the Championship. He's fast on his feet and guards the first piece of the legendary Golden Keyboard.",
        taunt: "You think your little webbed feet can keep up with me? Unlikely!",
        entryFee: 50,
        rewards: { xp: 500, coins: 200 }
      },
      {
        id: 'quackmire',
        name: 'Quackmire',
        wpm: 65,
        skillRequirements: { running: 10, swimming: 10, flying: 1 },
        character: { ...getDefaultCharacter(Evolution.STAMINA), color: '#22c55e', equippedItems: { hat: null }, mapProgress: 0, pattern: 'spots', activePet: null },
        narrative: "Quackmire rules the water hazards. His powerful strokes make him a formidable foe. He holds the second piece of the Golden Keyboard.",
        taunt: "The water slows you down, but it's where I feel most at home. Prepare to sink!",
        entryFee: 100,
        rewards: { xp: 800, coins: 400 }
      },
    ]
  },
  {
    id: 'pro_league',
    name: 'Pro League',
    bosses: [
      {
        id: 'aeroduck',
        name: 'AeroDuck',
        wpm: 85,
        skillRequirements: { running: 15, swimming: 15, flying: 15 },
        character: { ...getDefaultCharacter(Evolution.INTELLECT), color: '#3b82f6', equippedItems: { hat: 'propeller_hat' }, mapProgress: 0, pattern: 'stripes', activePet: null },
        narrative: "Master of the skies, AeroDuck soars over hurdles that leave others stumbling. The third piece of the Golden Keyboard is within his grasp.",
        taunt: "While you're tripping over hurdles, I'll be gliding to the finish line.",
        entryFee: 200,
        rewards: { xp: 1200, coins: 800 }
      },
      {
        id: 'champion',
        name: 'The Champion',
        wpm: 110,
        skillRequirements: { running: 25, swimming: 25, flying: 25 },
        character: { ...getDefaultCharacter(Evolution.ATHLETIC), color: '#f59e0b', equippedItems: { hat: 'championship_crown' }, mapProgress: 0, pattern: 'solid', activePet: null },
        narrative: "The final boss. The Champion has mastered all forms of typing and racing. Defeat him to reassemble the Golden Keyboard and claim ultimate victory!",
        taunt: "You've done well to make it this far. But every story needs an ending, and yours is here.",
        entryFee: 500,
        rewards: { xp: 2500, coins: 2000 }
      },
    ]
  }
];


export const characterService = {
    // FIX: Add RACE_ENERGY_COST and TRAINING_ENERGY_COST to the exported service object.
    RACE_ENERGY_COST,
    TRAINING_ENERGY_COST,
    allCustomizationItems,
    levelUnlocks,
    leagues,
    allShopItems,
    allPets,
    getDefaultCharacter,

    getCharacterData: (): PlayerCharacter => {
        try {
            const stored = localStorage.getItem(CHARACTER_DATA_KEY);
            const defaults = getDefaultCharacter();
            if (stored) {
                const parsed = JSON.parse(stored);
                // Ensure new properties exist on old save data
                return { ...defaults, ...parsed };
            }
            return defaults;
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
        localStorage.setItem('gemini-type-racer-unlocked-customizations', JSON.stringify(unlocked));
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

    addStatXp: (character: PlayerCharacter, stat: 'running' | 'swimming' | 'flying', amount: number) => {
        const xpKey = `${stat}Xp` as const;
        const levelKey = stat;
        const xpToNextLevelKey = `${stat}XpToNextLevel` as const;

        let newCharacter = { ...character };
        newCharacter[xpKey] += amount;

        while (newCharacter[xpKey] >= newCharacter[xpToNextLevelKey]) {
            newCharacter[xpKey] -= newCharacter[xpToNextLevelKey];
            newCharacter[levelKey]++;
            newCharacter[xpToNextLevelKey] = calculateStatXpToNextLevel(newCharacter[levelKey]);
        }
        return newCharacter;
    },

    buyItem: (character: PlayerCharacter, itemId: string, unlockedPets: PetId[]): { newCharacterState: PlayerCharacter, message: string, success: boolean, unlockedPet?: Pet } => {
        const item = allShopItems.find(i => i.id === itemId);
        if (!item) {
            return { newCharacterState: character, message: "Item not found.", success: false };
        }
        if (character.coins < item.cost) {
            return { newCharacterState: character, message: `Not enough coins! Need ${item.cost}.`, success: false };
        }

        const newCharacterState = { ...character, coins: character.coins - item.cost };
        
        if (item.type === 'food') {
            newCharacterState.energy = Math.min(character.maxEnergy, character.energy + (item.effect?.value || 0));
        } else if (item.type === 'gear') {
            const consumableId = item.id as ConsumableItemId;
            newCharacterState.inventory = {
                ...newCharacterState.inventory,
                [consumableId]: (newCharacterState.inventory[consumableId] || 0) + 1,
            };
        } else if (item.type === 'pet_egg') {
            const unownedPets = allPets.filter(p => !unlockedPets.includes(p.id));
            if (unownedPets.length === 0) {
                 return { newCharacterState: character, message: "You've already collected all the pets!", success: false };
            }
            const randomPet = unownedPets[Math.floor(Math.random() * unownedPets.length)];
            customizationService.unlockPet(randomPet.id);
            return { newCharacterState, message: `The egg hatched into a ${randomPet.name}!`, success: true, unlockedPet: randomPet };
        }
        
        return { newCharacterState, message: `Purchased ${item.name}!`, success: true };
    },
};