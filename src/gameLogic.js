const { NPC_NAMES, NPC_TYPES, EVENT_EFFECTS, ASSETS, GAME_CONFIG, SPECIAL_NEEDS, NPC_TIER_REQUIREMENTS, NPC_ASSET_GUEST_LIMITS } = require('./gameData');

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
  
  // Select tier first, then cap guests based on it
  const tierRequirement = NPC_TIER_REQUIREMENTS[type][Math.floor(Math.random() * NPC_TIER_REQUIREMENTS[type].length)];
  const maxGuestsForTier = NPC_ASSET_GUEST_LIMITS[type][tierRequirement];
  
  let baseGuests = type === 'Hippies' ? 2 : type === 'Families' ? 4 : 2;
  if (eventEffects) {
    baseGuests = Math.floor(baseGuests * eventEffects.npcMultiplier);
  }
  // Cap guests at the max allowed for this NPC type + tier combination
  const guests = Math.min(baseGuests + Math.floor(Math.random() * 3), maxGuestsForTier);
  
  const nights = Math.floor(Math.random() * 3) + 1;
  
  let baseIncome = type === 'Hippies' ? 30 : type === 'Families' ? 80 : 120;
  if (eventEffects) {
    baseIncome = Math.floor(baseIncome * eventEffects.moneyMultiplier);
  }
  const income = baseIncome * nights * guests;
  
  let electricity = guests * (type === 'Snobs' ? 3 : 1);
  let water = guests * (type === 'Families' ? 2 : 1);
  
  if (eventEffects) {
    if (eventEffects.waterMultiplier !== undefined && eventEffects.waterMultiplier > 0) {
      water = Math.floor(water * eventEffects.waterMultiplier);
    }
    if (eventEffects.electricityMultiplier !== undefined && eventEffects.electricityMultiplier > 0) {
      electricity = Math.floor(electricity * eventEffects.electricityMultiplier);
    }
  }
  
  // Ensure minimum 1 water/electricity per guest
  water = Math.max(water, guests);
  electricity = Math.max(electricity, guests);
  
  // Generate special needs based on NPC type
  let specialNeeds = [];
  const roll = Math.random();
  
  if (type === 'Families') {
    if (roll < 0.25) specialNeeds.push('Sports');
    else if (roll < 0.4) specialNeeds.push('Campfire');
  } else if (type === 'Hippies') {
    if (roll < 0.2) specialNeeds.push('Campfire');
    else if (roll < 0.3) specialNeeds.push('Stage');
  } else if (type === 'Snobs') {
    if (roll < 0.3) specialNeeds.push('Sauna');
    else if (roll < 0.45) specialNeeds.push('Stage');
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
    tierRequirement,
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
    slots: GAME_CONFIG.initialSlots,
    usedSlots: 0,
    slotArray: Array(GAME_CONFIG.initialSlots).fill(null),
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
