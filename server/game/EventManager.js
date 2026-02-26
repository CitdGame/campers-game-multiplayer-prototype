import { EVENTS, SEASONS, GAME_TIMING } from '../config/gameConfig.js';

/**
 * Event Manager - Handles all game events and seasonal effects
 */
export class EventManager {
  /**
   * Generate an event for a specific quarter
   */
  static generateQuarterEvent(quarter) {
    const season = SEASONS[quarter];
    if (!season || !season.events || season.events.length === 0) {
      return null;
    }
    
    // In off-season (Q1, Q4), fewer events
    if (quarter === 1 || quarter === 4) {
      return Math.random() < 0.3 ? this.getRandomEvent(season.events) : null;
    }
    
    // In peak season (Q2, Q3), more events
    return Math.random() < 0.7 ? this.getRandomEvent(season.events) : null;
  }

  /**
   * Get a random event from available events
   */
  static getRandomEvent(allowedEvents) {
    const availableEvents = Object.keys(EVENTS).filter(key => allowedEvents.includes(key));
    if (availableEvents.length === 0) return null;
    
    const eventKey = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    return { ...EVENTS[eventKey], key: eventKey };
  }

  /**
   * Apply event effects to game state
   */
  static applyEventEffects(gameState, event) {
    if (!event) return gameState;
    
    const effects = {
      description: event.description,
      npcMultiplier: event.npcMod || 1,
      resourceEffects: {},
      assetRestrictions: {}
    };
    
    // Apply resource modifiers
    if (event.waterMod) {
      effects.resourceEffects.water = event.waterMod;
    }
    
    if (event.noWater) {
      effects.resourceEffects.water = 0;
    }
    
    if (event.noElectric) {
      effects.resourceEffects.electric = 0;
    }
    
    // Apply asset restrictions
    if (event.noTents) {
      effects.assetRestrictions.tent = false;
    }
    
    if (event.preferTents) {
      effects.assetRestrictions.tent = true;
    }
    
    return {
      ...gameState,
      currentEvent: event,
      eventEffects: effects
    };
  }

  /**
   * Calculate NPC generation based on season and events
   */
  static calculateNPCGeneration(gameState) {
    const season = SEASONS[gameState.quarter];
    const baseNPCs = GAME_TIMING.BASE_NPCS_PER_TURN;
    
    let npcMultiplier = season.npcMultiplier || 1;
    
    // Apply event modifier
    if (gameState.currentEvent && gameState.currentEvent.npcMod) {
      npcMultiplier *= gameState.currentEvent.npcMod;
    }
    
    const npcsToGenerate = Math.floor(baseNPCs * npcMultiplier);
    
    return {
      count: Math.max(0, npcsToGenerate),
      multiplier: npcMultiplier,
      baseCount: baseNPCs
    };
  }

  /**
   * Check if assets are affected by current event
   */
  static getAssetRestrictions(gameState) {
    if (!gameState.currentEvent) return {};
    
    const restrictions = {};
    
    if (gameState.currentEvent.noTents) {
      restrictions.tent = { allowed: false, reason: 'Storm warning - no tents allowed' };
    }
    
    if (gameState.currentEvent.preferTents) {
      restrictions.tent = { preferred: true, reason: 'Festival - tents preferred' };
    }
    
    return restrictions;
  }

  /**
   * Calculate resource generation with event effects
   */
  static calculateResourceGeneration(player, gameState) {
    const effects = gameState.eventEffects || {};
    let electricGenerated = 0;
    let waterGenerated = 0;
    
    for (const [tileId, slot] of Object.entries(player.slots || {})) {
      if (!slot.assetType) continue;
      
      const asset = this.getAssetConfig(slot.assetType);
      if (!asset) continue;
      
      // Check if asset is affected by events
      if (effects.resourceEffects) {
        if (effects.resourceEffects.electric === 0 && asset.produces?.electric) {
          continue; // No electric generation due to blackout
        }
        if (effects.resourceEffects.water === 0 && asset.produces?.water) {
          continue; // No water generation due to drought
        }
      }
      
      // Calculate generation
      if (asset.produces?.electric) {
        electricGenerated += asset.produces.electric;
      }
      if (asset.produces?.water) {
        waterGenerated += asset.produces.water;
      }
    }
    
    return {
      electric: electricGenerated,
      water: waterGenerated,
      total: electricGenerated + waterGenerated
    };
  }

  /**
   * Calculate resource consumption with event effects
   */
  static calculateResourceConsumption(player, gameState) {
    const effects = gameState.eventEffects || {};
    let electricConsumed = 0;
    let waterConsumed = 0;
    
    for (const npc of player.npcs) {
      if (!npc.placed) continue;
      
      // Base consumption per guest
      const baseElectricPerGuest = 1;
      const baseWaterPerGuest = 1;
      
      // Apply event modifiers
      let electricMultiplier = 1;
      let waterMultiplier = 1;
      
      if (effects.resourceEffects?.water && effects.resourceEffects.water > 1) {
        waterMultiplier = effects.resourceEffects.water;
      }
      
      electricConsumed += npc.guests * baseElectricPerGuest * electricMultiplier;
      waterConsumed += npc.guests * baseWaterPerGuest * waterMultiplier;
    }
    
    return {
      electric: electricConsumed,
      water: waterConsumed,
      total: electricConsumed + waterConsumed
    };
  }

  /**
   * Get season information
   */
  static getSeasonInfo(quarter) {
    return SEASONS[quarter] || { name: 'Unknown', npcMultiplier: 1, events: [] };
  }

  /**
   * Get event information
   */
  static getEventInfo(eventKey) {
    return EVENTS[eventKey] || null;
  }

  /**
   * Get all events for a season
   */
  static getSeasonEvents(quarter) {
    const season = SEASONS[quarter];
    if (!season) return [];
    
    return season.events.map(eventKey => ({
      key: eventKey,
      ...EVENTS[eventKey]
    })).filter(event => event); // Filter out null events
  }

  /**
   * Check if event is active
   */
  static isEventActive(gameState, eventKey) {
    return gameState.currentEvent && gameState.currentEvent.key === eventKey;
  }

  /**
   * Get event duration and remaining turns
   */
  static getEventDuration(gameState) {
    if (!gameState.currentEvent) return { current: 0, total: 0, remaining: 0 };
    
    // Events last for the entire quarter (3 rounds)
    const total = GAME_TIMING.ROUNDS_PER_QUARTER;
    const current = (gameState.round - 1) % GAME_TIMING.ROUNDS_PER_QUARTER + 1;
    const remaining = total - current;
    
    return { current, total, remaining };
  }

  /**
   * Get event impact summary
   */
  static getEventImpactSummary(gameState) {
    if (!gameState.currentEvent) return null;
    
    const event = gameState.currentEvent;
    const duration = this.getEventDuration(gameState);
    
    return {
      name: event.name,
      description: event.description,
      duration: duration,
      effects: {
        npcGeneration: event.npcMod ? `${event.npcMod}x` : 'Normal',
        resources: this.getResourceEffectDescription(event),
        assets: this.getAssetEffectDescription(event)
      }
    };
  }

  /**
   * Get resource effect description
   */
  static getResourceEffectDescription(event) {
    const effects = [];
    
    if (event.waterMod) {
      effects.push(`Water usage: ${event.waterMod}x`);
    }
    if (event.noWater) {
      effects.push('Water generation: Disabled');
    }
    if (event.noElectric) {
      effects.push('Electric generation: Disabled');
    }
    
    return effects.length > 0 ? effects : ['Normal'];
  }

  /**
   * Get asset effect description
   */
  static getAssetEffectDescription(event) {
    const effects = [];
    
    if (event.noTents) {
      effects.push('Tents: Not allowed');
    }
    if (event.preferTents) {
      effects.push('Tents: Preferred');
    }
    
    return effects.length > 0 ? effects : ['No restrictions'];
  }

  /**
   * Get asset configuration (would be imported from Asset module)
   */
  static getAssetConfig(assetType) {
    // This would be imported from Asset module
    // For now, return basic structure
    const configs = {
      generator: { produces: { electric: 5 } },
      watertank: { produces: { water: 5 } }
    };
    return configs[assetType] || null;
  }

  /**
   * Validate event data
   */
  static validateEvent(event) {
    const required = ['name', 'description'];
    for (const field of required) {
      if (!(field in event)) {
        return { valid: false, reason: `Missing field: ${field}` };
      }
    }
    
    return { valid: true };
  }
}
