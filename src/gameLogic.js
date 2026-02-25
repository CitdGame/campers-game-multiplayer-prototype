const { NPC_NAMES, NPC_TYPES, EVENT_EFFECTS, ASSETS, GAME_CONFIG } = require('./gameData');

function isHighSeason(quarter) {
  return quarter === 2 || quarter === 3;
}

function getEventsForQuarter(quarter) {
  const eventsPerQuarter = (quarter === 1 || quarter === 4) ? 1 : 2;
  const selectedEvents = [];
  const categories = Object.keys(require('./gameData').EVENTS);
  
  for (let i = 0; i < eventsPerQuarter; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const events = require('./gameData').EVENTS[category];
    const event = events[Math.floor(Math.random() * events.length)];
    if (!selectedEvents.includes(event)) {
      selectedEvents.push(event);
    }
  }
  
  return selectedEvents;
}

function getEventEffects(events) {
  const effects = { npcMultiplier: 1, waterMultiplier: 1, moneyMultiplier: 1 };
  for (const event of events) {
    const eventEffect = EVENT_EFFECTS[event];
    if (eventEffect) {
      effects.npcMultiplier *= eventEffect.npcMultiplier;
      effects.waterMultiplier *= eventEffect.waterMultiplier;
      effects.moneyMultiplier *= eventEffect.moneyMultiplier;
    }
  }
  return effects;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function generateNPC(quarter, isHighSeason, eventEffects = null) {
  const type = NPC_TYPES[Math.floor(Math.random() * NPC_TYPES.length)];
  const names = NPC_NAMES[type];
  const name = names[Math.floor(Math.random() * names.length)];
  
  let baseGuests = type === 'Hippies' ? 2 : type === 'Families' ? 4 : 2;
  if (eventEffects) {
    baseGuests = Math.floor(baseGuests * eventEffects.npcMultiplier);
  }
  const guests = baseGuests + Math.floor(Math.random() * 3);
  
  const nights = Math.floor(Math.random() * 3) + 1;
  
  let baseIncome = type === 'Hippies' ? 30 : type === 'Families' ? 80 : 120;
  if (eventEffects) {
    baseIncome = Math.floor(baseIncome * eventEffects.moneyMultiplier);
  }
  const income = baseIncome * nights * guests;
  
  let electricity = guests * (type === 'Snobs' ? 3 : 1);
  let water = guests * (type === 'Families' ? 2 : 1);
  
  if (eventEffects) {
    water = Math.floor(water * eventEffects.waterMultiplier);
  }
  
  let specialNeeds = [];
  if (type === 'Families' && Math.random() < 0.3) {
    specialNeeds.push('Sports');
  }
  
  return {
    id: generateId(),
    name,
    type,
    guests,
    nights,
    income,
    needs: {
      electricity,
      water,
      sleepingSpots: guests
    },
    specialNeeds,
    quarter,
    accepted: false
  };
}

function generateNPCsForQuarter(quarter, isHighSeason, eventEffects = null) {
  const count = isHighSeason ? 4 : 2;
  const npcs = [];
  for (let i = 0; i < count; i++) {
    npcs.push(generateNPC(quarter, isHighSeason, eventEffects));
  }
  return npcs;
}

function createGameState() {
  return {
    quarter: 1,
    round: 1,
    year: 1,
    totalRounds: GAME_CONFIG.roundsPerQuarter * GAME_CONFIG.quartersPerYear,
    players: [],
    npcs: [],
    currentPlayerIndex: 0,
    phase: 'lobby',
    events: [],
    turnAction: null
  };
}

function createPlayer(id, name, playerIndex) {
  return {
    id,
    name: name || `Spieler ${playerIndex + 1}`,
    money: GAME_CONFIG.initialMoney,
    space: GAME_CONFIG.initialSpace,
    usedSpace: 0,
    electricity: GAME_CONFIG.initialElectricity,
    water: GAME_CONFIG.initialWater,
    assets: [],
    score: 0
  };
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getAssetByType(assetType) {
  return ASSETS[assetType];
}

module.exports = {
  isHighSeason,
  getEventsForQuarter,
  getEventEffects,
  generateId,
  generateNPC,
  generateNPCsForQuarter,
  createGameState,
  createPlayer,
  generateCode,
  getAssetByType,
  GAME_CONFIG
};
