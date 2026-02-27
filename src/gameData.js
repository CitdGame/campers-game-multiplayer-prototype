const NPC_NAMES = {
  Hippies: ['Luna', 'Sticky', 'Mellow', 'Sunny', 'Breeze', 'River', 'Pine', 'Cloud'],
  Families: ['Familie Müller', 'Familie Schmidt', 'Familie Weber', 'Familie Fischer', 'Familie Becker', 'Familie Meyer'],
  Snobs: ['Graf von Luxus', 'Baronessin', 'Herzogin', 'Fürst', 'Gräfin', 'Herr von Obersee']
};

const NPC_TYPES = ['Hippies', 'Families', 'Snobs'];

const GUEST_POINT_TYPES = ['generic', 'Hippies', 'Families', 'Snobs'];

const PROMOTIONS = {
  Hippies: { name: 'Hippie-Woche', cost: 100, yields: 1, type: 'Hippies' },
  Families: { name: 'Familienaktion', cost: 150, yields: 1, type: 'Families' },
  Snobs: { name: 'Luxus-Event', cost: 200, yields: 1, type: 'Snobs' }
};

const EVENTS = {
  weather: ['rain', 'storm', 'heatwave', 'drought', 'blackout'],
  economy: ['tourism_boom'],
  local: ['festival']
};

const EVENT_EFFECTS = {
  rain: { npcMultiplier: 0.5, waterMultiplier: 1, moneyMultiplier: 1 },
  storm: { npcMultiplier: 0.5, waterMultiplier: 1, moneyMultiplier: 1, dislikedTier: 'tent' },
  heatwave: { npcMultiplier: 1, waterMultiplier: 2, moneyMultiplier: 1 },
  drought: { npcMultiplier: 0.8, waterMultiplier: 0, moneyMultiplier: 1 },
  blackout: { npcMultiplier: 0.8, electricityMultiplier: 0, moneyMultiplier: 1 },
  tourism_boom: { npcMultiplier: 2, waterMultiplier: 1, moneyMultiplier: 1 },
  festival: { npcMultiplier: 1, waterMultiplier: 1, moneyMultiplier: 1, preferredTier: 'tent' }
};

const ASSETS = {
  tent: { name: 'Zelt', price: 50, space: 1, type: 'sleeping', capacity: 2, tiers: ['tent', 'glamping'], maintenanceCost: 5 },
  glamping: { name: 'Glamping-Zelt', price: 200, space: 2, type: 'sleeping', capacity: 4, tiers: ['glamping'], maintenanceCost: 10 },
  caravan: { name: 'Caravan', price: 150, space: 2, type: 'sleeping', capacity: 4, tiers: ['tent', 'glamping', 'caravan'], maintenanceCost: 15 },
  bungalow: { name: 'Bungalow', price: 300, space: 3, type: 'sleeping', capacity: 6, tiers: ['glamping', 'bungalow'], maintenanceCost: 25 },
  luxurybungalow: { name: 'Luxus-Bungalow', price: 600, space: 4, type: 'sleeping', capacity: 8, tiers: ['luxury'], maintenanceCost: 40 },
  generator: { name: 'Stromgenerator', price: 200, space: 2, type: 'resource', produces: { electricity: 5 }, maintenanceCost: 20 },
  watertank: { name: 'Wassertank', price: 150, space: 2, type: 'resource', produces: { water: 5 }, maintenanceCost: 15 },
  sportsfield: { name: 'Sportplatz', price: 250, space: 3, type: 'special', satisfies: ['Sports'], maintenanceCost: 30 },
  campfire: { name: 'Lagerfeuerstelle', price: 100, space: 1, type: 'special', satisfies: ['Campfire'], maintenanceCost: 10 },
  sauna: { name: 'Sauna', price: 350, space: 2, type: 'special', satisfies: ['Sauna'], maintenanceCost: 35 },
  stage: { name: 'Open-Air Bühne', price: 400, space: 3, type: 'special', satisfies: ['Stage'], maintenanceCost: 45 }
};

const SPECIAL_NEEDS = ['Sports', 'Campfire', 'Sauna', 'Stage'];

// Which asset types each NPC type can request
const NPC_TIER_REQUIREMENTS = {
  Hippies: ['tent', 'caravan', 'bungalow'],
  Families: ['glamping', 'caravan', 'bungalow'],
  Snobs: ['glamping', 'bungalow', 'luxurybungalow']
};

// Max guests per NPC type per asset type
const NPC_ASSET_GUEST_LIMITS = {
  Hippies: { tent: 2, caravan: 4, bungalow: 6 },
  Families: { glamping: 4, caravan: 4, bungalow: 6 },
  Snobs: { glamping: 2, bungalow: 4, luxurybungalow: 6 }
};

const GAME_CONFIG = {
  maxPlayers: 8,
  minPlayers: 2,
  initialMoney: 500,
  initialSlots: 10,
  initialElectricity: 5,
  initialWater: 5,
  slotExpansionCost: 100,
  slotExpansionAmount: 5,
  baseIncomePerNight: 2,
  roundsPerQuarter: 3,
  quartersPerYear: 4,
  npcRequestTurnLimit: 3 // NPC requests expire after 3 turns
};

module.exports = {
  NPC_NAMES,
  NPC_TYPES,
  GUEST_POINT_TYPES,
  PROMOTIONS,
  EVENTS,
  EVENT_EFFECTS,
  ASSETS,
  GAME_CONFIG,
  SPECIAL_NEEDS,
  NPC_TIER_REQUIREMENTS,
  NPC_ASSET_GUEST_LIMITS
};
