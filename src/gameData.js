const NPC_NAMES = {
  Hippies: ['Luna', 'Sticky', 'Mellow', 'Sunny', 'Breeze', 'River', 'Pine', 'Cloud'],
  Families: ['Familie Müller', 'Familie Schmidt', 'Familie Weber', 'Familie Fischer', 'Familie Becker', 'Familie Meyer'],
  Snobs: ['Graf von Luxus', 'Baronessin', 'Herzogin', 'Fürst', 'Gräfin', 'Herr von Obersee']
};

const NPC_TYPES = ['Hippies', 'Families', 'Snobs'];

const EVENTS = {
  weather: ['rain', 'storm', 'heatwave', 'cold', 'drought'],
  economy: ['tourism_boom', 'recession', 'luxury_trend', 'minimalism_trend'],
  local: ['festival', 'sports_event', 'fishing_competition', 'music_week'],
  social: ['influencer_hype', 'online_storm', 'award', 'wildlife']
};

const EVENT_EFFECTS = {
  rain: { npcMultiplier: 0.5, waterMultiplier: 1, moneyMultiplier: 1 },
  storm: { npcMultiplier: 0.6, waterMultiplier: 1, moneyMultiplier: 0.8 },
  heatwave: { npcMultiplier: 1.2, waterMultiplier: 2, moneyMultiplier: 1.2 },
  cold: { npcMultiplier: 0.7, waterMultiplier: 1, moneyMultiplier: 0.9 },
  drought: { npcMultiplier: 0.8, waterMultiplier: 0.5, moneyMultiplier: 0.9 },
  tourism_boom: { npcMultiplier: 1.5, waterMultiplier: 1, moneyMultiplier: 1.3 },
  recession: { npcMultiplier: 0.6, waterMultiplier: 1, moneyMultiplier: 0.7 },
  luxury_trend: { npcMultiplier: 1.1, waterMultiplier: 1, moneyMultiplier: 1.4 },
  minimalism_trend: { npcMultiplier: 1, waterMultiplier: 1, moneyMultiplier: 1 },
  festival: { npcMultiplier: 1.4, waterMultiplier: 1.2, moneyMultiplier: 1.3 },
  sports_event: { npcMultiplier: 1.3, waterMultiplier: 1.1, moneyMultiplier: 1.2 },
  fishing_competition: { npcMultiplier: 1.2, waterMultiplier: 1, moneyMultiplier: 1.2 },
  music_week: { npcMultiplier: 1.3, waterMultiplier: 1, moneyMultiplier: 1.2 },
  influencer_hype: { npcMultiplier: 1.4, waterMultiplier: 1, moneyMultiplier: 1.3 },
  online_storm: { npcMultiplier: 0.7, waterMultiplier: 1, moneyMultiplier: 0.8 },
  award: { npcMultiplier: 1.2, waterMultiplier: 1, moneyMultiplier: 1.3 },
  wildlife: { npcMultiplier: 1, waterMultiplier: 1, moneyMultiplier: 1.1 }
};

const ASSETS = {
  tent: { name: 'Zelt', price: 50, space: 1, type: 'sleeping', capacity: 2 },
  caravan: { name: 'Wohnwagen', price: 150, space: 2, type: 'sleeping', capacity: 4 },
  bungalow: { name: 'Bungalow', price: 300, space: 3, type: 'sleeping', capacity: 6 },
  generator: { name: 'Stromgenerator', price: 200, space: 2, type: 'resource', produces: { electricity: 5 } },
  watertank: { name: 'Wassertank', price: 150, space: 2, type: 'resource', produces: { water: 5 } },
  sportsfield: { name: 'Sportplatz', price: 250, space: 3, type: 'special', satisfies: ['Sports'] }
};

const GAME_CONFIG = {
  maxPlayers: 8,
  minPlayers: 2,
  initialMoney: 500,
  initialSpace: 10,
  initialElectricity: 5,
  initialWater: 5,
  spaceExpansionCost: 100,
  spaceExpansionAmount: 5,
  baseIncomePerNight: 2,
  roundsPerQuarter: 3,
  quartersPerYear: 4
};

module.exports = {
  NPC_NAMES,
  NPC_TYPES,
  EVENTS,
  EVENT_EFFECTS,
  ASSETS,
  GAME_CONFIG
};
