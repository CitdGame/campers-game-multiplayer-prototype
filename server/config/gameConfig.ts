import { GameConfig, AssetType, NPCType, EventType, Quarter } from '../../types/index.js';

/**
 * Centralized game configuration for Campers
 * Contains all game constants, prices, and balanced values
 */

// Economy Configuration
export const ECONOMY = {
  // Starting resources
  STARTING_MONEY: 500,
  STARTING_SLOTS: 5,
  STARTING_ELECTRIC: 5,
  STARTING_WATER: 5,
  
  // Tile costs
  TILE_PRICE: 100,
  
  // Coin system
  STARTING_GENERIC_COINS: 2,
  MAX_COINS_PER_TYPE: 10,
  COINS_PER_TURN: 2,
  
  // Promotion costs
  PROMOTIONS: {
    HIPPIE: { cost: 100, coinType: 'Hippies' as const, name: 'Hippie-Woche' },
    FAMILIE: { cost: 150, coinType: 'Familie' as const, name: 'Familienaktion' },
    SNOB: { cost: 200, coinType: 'Snob' as const, name: 'Luxus-Event' }
  }
} as const;

// Asset Configuration with balanced prices and stats
export const ASSETS: Record<AssetType, {
  price: number;
  slots: number;
  capacity?: number;
  category: 'sleeping' | 'resource' | 'facility';
  upgradeFrom?: AssetType;
  upgradeTo?: AssetType | null;
  upgradePrice?: number;
  incomeMultiplier?: number;
  produces?: Record<string, number>;
  maintenance?: number;
  satisfies?: NPCType[];
}> = {
  // Sleeping places
  tent: { 
    price: 50, 
    slots: 1, 
    capacity: 2, 
    category: 'sleeping',
    upgradeFrom: 'tent', 
    upgradeTo: 'glamping',
    upgradePrice: 50,
    incomeMultiplier: 1.0
  },
  glamping: { 
    price: 100, 
    slots: 1, 
    capacity: 4, 
    category: 'sleeping',
    upgradeFrom: 'tent',
    upgradeTo: undefined,
    incomeMultiplier: 1.2
  },
  caravan: { 
    price: 150, 
    slots: 2, 
    capacity: 4, 
    category: 'sleeping',
    upgradeFrom: undefined,
    upgradeTo: undefined,
    incomeMultiplier: 1.1
  },
  bungalow: { 
    price: 300, 
    slots: 3, 
    capacity: 6, 
    category: 'sleeping',
    upgradeFrom: 'bungalow', 
    upgradeTo: 'luxurybungalow',
    upgradePrice: 200,
    incomeMultiplier: 1.3
  },
  luxurybungalow: { 
    price: 500, 
    slots: 3, 
    capacity: 8, 
    category: 'sleeping',
    upgradeFrom: 'bungalow',
    upgradeTo: undefined,
    incomeMultiplier: 1.5
  },
  
  // Resource generators
  generator: { 
    price: 200, 
    slots: 2, 
    category: 'resource',
    produces: { electric: 5 },
    maintenance: 10 // per turn
  },
  watertank: { 
    price: 150, 
    slots: 2, 
    category: 'resource',
    produces: { water: 5 },
    maintenance: 5 // per turn
  },
  
  // Special facilities
  sportsfield: { 
    price: 250, 
    slots: 3, 
    category: 'facility',
    satisfies: ['Familie'],
    incomeMultiplier: 1.1
  },
  campfire: { 
    price: 100, 
    slots: 1, 
    category: 'facility',
    satisfies: ['Hippies', 'Familie'],
    incomeMultiplier: 1.05
  },
  sauna: { 
    price: 350, 
    slots: 2, 
    category: 'facility',
    satisfies: ['Snob'],
    incomeMultiplier: 1.15
  },
  stage: { 
    price: 400, 
    slots: 3, 
    category: 'facility',
    satisfies: ['Hippies', 'Snob'],
    incomeMultiplier: 1.2
  }
};

// NPC Configuration with balanced income
export const NPC_TYPES: Record<NPCType, {
  name: string;
  baseIncome: number;
  variance: number;
  minGroupSize: number;
  maxGroupSize: number;
  allowedAssets: AssetType[];
  maxAssetSize: number;
  specialRequirements: string[];
  preferredAssets: AssetType[];
}> = {
  Hippies: {
    name: 'Hippies',
    baseIncome: 15,
    variance: 10,
    minGroupSize: 1,
    maxGroupSize: 3,
    allowedAssets: ['tent', 'glamping', 'caravan', 'bungalow'],
    maxAssetSize: 6,
    specialRequirements: [],
    preferredAssets: ['tent', 'campfire']
  },
  Familie: {
    name: 'Familie',
    baseIncome: 25,
    variance: 15,
    minGroupSize: 2,
    maxGroupSize: 6,
    allowedAssets: ['glamping', 'caravan', 'bungalow', 'luxurybungalow'],
    maxAssetSize: 8,
    specialRequirements: [],
    preferredAssets: ['glamping', 'bungalow', 'sportsfield']
  },
  Snob: {
    name: 'Snob',
    baseIncome: 40,
    variance: 20,
    minGroupSize: 1,
    maxGroupSize: 4,
    allowedAssets: ['glamping', 'bungalow', 'luxurybungalow'],
    maxAssetSize: 8,
    specialRequirements: [],
    preferredAssets: ['luxurybungalow', 'sauna']
  }
};

// Event Configuration
export const EVENTS: Record<EventType, {
  name: string;
  description: string;
  npcMod?: number;
  waterMod?: number;
  noTents?: boolean;
  preferTents?: boolean;
  noWater?: boolean;
  noElectric?: boolean;
  quarters?: Quarter[];
}> = {
  rain: { 
    name: 'Dauerregen', 
    description: 'NPCs pro Zug halbieren sich', 
    npcMod: 0.5,
    quarters: [1, 4] // Off-season
  },
  boom: { 
    name: 'Tourismusboom', 
    description: 'Region zum Weltkulturerbe erklärt!', 
    npcMod: 2,
    quarters: [2, 3] // Peak season
  },
  storm: { 
    name: 'Sturmwarnung', 
    description: 'NPCs wollen nicht in Zelten übernachten', 
    noTents: true,
    quarters: [2, 3]
  },
  festival: { 
    name: 'Festival', 
    description: 'NPCs wollen bevorzugt in Zelten', 
    preferTents: true,
    quarters: [2, 3]
  },
  heat: { 
    name: 'Hitzewelle', 
    description: 'Erhöhter Wasserverbrauch', 
    waterMod: 2,
    quarters: [2, 3]
  },
  drought: { 
    name: 'Dürre', 
    description: 'Wassertanks generieren kein Wasser', 
    noWater: true,
    quarters: [1, 4]
  },
  blackout: { 
    name: 'Blackout', 
    description: 'Generatoren generieren keinen Strom', 
    noElectric: true,
    quarters: [1, 4]
  }
};

// Game Timing Configuration
export const GAME_TIMING = {
  ROUNDS_PER_QUARTER: 3,
  QUARTERS_PER_YEAR: 4,
  TOTAL_ROUNDS: 12,
  NPC_EXPIRE_ROUNDS: 3,
  BASE_NPCS_PER_TURN: 2,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8
} as const;

// Season Configuration
export const SEASONS: Record<Quarter, {
  name: string;
  npcMultiplier: number;
  events: EventType[];
}> = {
  1: { name: 'Nebensaison', npcMultiplier: 0.8, events: ['rain', 'drought', 'blackout'] },
  2: { name: 'Hauptsaison', npcMultiplier: 1.5, events: ['boom', 'storm', 'festival', 'heat'] },
  3: { name: 'Hauptsaison', npcMultiplier: 1.5, events: ['boom', 'storm', 'festival', 'heat'] },
  4: { name: 'Nebensaison', npcMultiplier: 0.8, events: ['rain', 'drought', 'blackout'] }
};

// Scoring Configuration
export const SCORING = {
  MONEY_WEIGHT: 1.0,
  ASSET_WEIGHT: 0.1, // 10% of asset price
  GUEST_WEIGHT: 2.0, // income * stay duration
  UPGRADE_WEIGHT: 0.2
} as const;

// UI Configuration
export const UI = {
  COLORS: {
    PLAYER_TILE: '#7CB342',
    PLAYER_BORDER: '#33691E',
    BUYABLE_TILE: '#FFD54F',
    UNCLAIMED_TILE: '#AED581',
    OTHER_PLAYER_TILE: '#B0BEC5',
    SELECTED_TILE: '#FF5722',
    MOVING_TILE: '#2196F3',
    VALID_DROP_TARGET: '#4CAF50'
  },
  ICONS: {
    tent: '⛺',
    glamping: '🏕️',
    caravan: '🚐',
    bungalow: '🏠',
    luxurybungalow: '🏰',
    generator: '⚡',
    watertank: '💧',
    sportsfield: '⚽',
    campfire: '🔥',
    sauna: '🧖',
    stage: '🎭'
  },
  ASSET_NAMES: {
    tent: 'Zelt',
    glamping: 'Glamping',
    caravan: 'Caravan',
    bungalow: 'Bungalow',
    luxurybungalow: 'Luxus-Bungalow',
    generator: 'Kraftwerk',
    watertank: 'Wassertank',
    sportsfield: 'Sportplatz',
    campfire: 'Lagerfeuer',
    sauna: 'Sauna',
    stage: 'Bühne'
  },
  PLAYER_ICONS: ['🏕️','🎒','🌲','🔥','🎣','⛺','🌻','🏔️']
} as const;

// Guest names pool
export const GUEST_NAMES = [
  'Hans', 'Klaus', 'Wolfgang', 'Gerhard', 'Helmut', 'Werner', 'Manfred', 'Günter',
  'Maria', 'Helga', 'Ursula', 'Lieselotte', 'Gertrud', 'Brigitte', 'Elfriede', 'Hilde',
  'Klaus-Dieter', 'Hans-Jürgen', 'Wulfgang', 'Günter-Helmut', 'Friedrich', 'Erich', 'Walter'
];

// Validation rules
export const VALIDATION = {
  MAX_GUESTS_PER_ASSET: 8,
  MAX_ASSETS_PER_PLAYER: 20,
  MAX_MONEY: 10000,
  MIN_MONEY: 0,
  MAX_RESOURCES: 100,
  MIN_RESOURCES: 0
} as const;

// Export complete configuration
export const GAME_CONFIG: GameConfig = {
  ECONOMY,
  ASSETS,
  NPC_TYPES,
  EVENTS,
  GAME_TIMING,
  SEASONS,
  SCORING,
  UI,
  VALIDATION,
  GUEST_NAMES
};
