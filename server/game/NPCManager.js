import { NPC_TYPES, GUEST_NAMES, GAME_TIMING } from '../config/gameConfig.js';

/**
 * NPC Manager - Handles all NPC-related operations and validation
 */
export class NPCManager {
  /**
   * Generate a new NPC
   */
  static generateNPC(type = null) {
    const npcType = type || this.getRandomNPCType();
    const config = NPC_TYPES[npcType];
    
    if (!config) {
      throw new Error(`Unknown NPC type: ${npcType}`);
    }
    
    const groupSize = Math.floor(Math.random() * (config.maxGroupSize - config.minGroupSize + 1)) + config.minGroupSize;
    const income = groupSize * (config.baseIncome + Math.floor(Math.random() * config.variance));
    
    return {
      id: this.generateId(),
      name: this.getRandomGuestName(),
      type: npcType,
      guests: groupSize,
      income: income,
      placed: false,
      tileId: null,
      stayDuration: GAME_TIMING.NPC_EXPIRE_ROUNDS,
      createdAt: Date.now()
    };
  }

  /**
   * Generate multiple NPCs
   */
  static generateNPCs(count, type = null) {
    const npcs = [];
    for (let i = 0; i < count; i++) {
      npcs.push(this.generateNPC(type));
    }
    return npcs;
  }

  /**
   * Check if an NPC can be placed in a specific asset
   */
  static canPlaceNPC(npc, assetType, currentOccupancy = 0) {
    const config = NPC_TYPES[npc.type];
    if (!config) {
      return { canPlace: false, reason: 'Unknown NPC type' };
    }
    
    // Check if NPC type is allowed in this asset
    if (!config.allowedAssets.includes(assetType)) {
      return { canPlace: false, reason: `${npc.type} cannot stay in ${assetType}` };
    }
    
    // Check asset size limits
    const assetConfig = this.getAssetConfig(assetType);
    if (!assetConfig) {
      return { canPlace: false, reason: 'Unknown asset type' };
    }
    
    if (npc.guests > assetConfig.capacity) {
      return { canPlace: false, reason: `NPC group too large for asset capacity` };
    }
    
    // Check if asset has space
    if (currentOccupancy + npc.guests > assetConfig.capacity) {
      return { canPlace: false, reason: 'Not enough space in asset' };
    }
    
    return { canPlace: true };
  }

  /**
   * Place an NPC in an asset
   */
  static placeNPC(player, npcId, tileId) {
    const npc = player.npcs.find(n => n.id === npcId);
    if (!npc) {
      throw new Error('NPC not found');
    }
    
    if (npc.placed) {
      throw new Error('NPC already placed');
    }
    
    const slot = player.slots?.[tileId];
    if (!slot || !slot.assetType) {
      throw new Error('No valid asset on this tile');
    }
    
    const canPlace = this.canPlaceNPC(npc, slot.assetType, slot.guestCount || 0);
    if (!canPlace.canPlace) {
      throw new Error(canPlace.reason);
    }
    
    // Place the NPC
    npc.placed = true;
    npc.tileId = tileId;
    
    // Update slot
    if (!slot.npcs) slot.npcs = [];
    slot.npcs.push(npcId);
    slot.guestCount = (slot.guestCount || 0) + npc.guests;
    
    return { success: true, npc: npc };
  }

  /**
   * Remove an NPC from an asset
   */
  static removeNPC(player, npcId) {
    const npc = player.npcs.find(n => n.id === npcId);
    if (!npc) {
      throw new Error('NPC not found');
    }
    
    if (!npc.placed || !npc.tileId) {
      throw new Error('NPC not placed in any asset');
    }
    
    const slot = player.slots?.[npc.tileId];
    if (slot) {
      // Remove from slot
      if (slot.npcs) {
        slot.npcs = slot.npcs.filter(id => id !== npcId);
      }
      slot.guestCount = Math.max(0, (slot.guestCount || 0) - npc.guests);
    }
    
    // Update NPC
    npc.placed = false;
    npc.tileId = null;
    
    return { success: true, npc: npc };
  }

  /**
   * Get compatible NPCs for an asset
   */
  static getCompatibleNPCs(player, assetType, tileId) {
    const slot = player.slots?.[tileId];
    const currentOccupancy = slot?.guestCount || 0;
    const assetConfig = this.getAssetConfig(assetType);
    
    if (!assetConfig) return [];
    
    return player.npcs
      .filter(npc => !npc.placed)
      .filter(npc => this.canPlaceNPC(npc, assetType, currentOccupancy).canPlace)
      .sort((a, b) => b.income - a.income); // Sort by income (highest first)
  }

  /**
   * Get NPCs that are expiring soon
   */
  static getExpiringNPCs(player, roundsLeft = 1) {
    return player.npcs
      .filter(npc => npc.placed && npc.stayDuration <= roundsLeft)
      .sort((a, b) => a.stayDuration - b.stayDuration);
  }

  /**
   * Update NPC stay durations and remove expired ones
   */
  static updateNPCDurations(player) {
    const expiredNPCs = [];
    
    for (const npc of player.npcs) {
      if (npc.placed) {
        npc.stayDuration--;
        if (npc.stayDuration <= 0) {
          expiredNPCs.push(npc);
          this.removeNPC(player, npc.id);
        }
      }
    }
    
    return expiredNPCs;
  }

  /**
   * Calculate total income from all placed NPCs
   */
  static calculateTotalIncome(player) {
    let totalIncome = 0;
    
    for (const npc of player.npcs) {
      if (npc.placed) {
        totalIncome += npc.income;
      }
    }
    
    return totalIncome;
  }

  /**
   * Get NPC statistics
   */
  static getNPCStats(player) {
    const stats = {
      total: player.npcs.length,
      placed: player.npcs.filter(n => n.placed).length,
      unplaced: player.npcs.filter(n => !n.placed).length,
      byType: {},
      totalIncome: 0,
      averageIncome: 0
    };
    
    // Count by type
    for (const npc of player.npcs) {
      if (!stats.byType[npc.type]) {
        stats.byType[npc.type] = { total: 0, placed: 0, income: 0 };
      }
      stats.byType[npc.type].total++;
      if (npc.placed) {
        stats.byType[npc.type].placed++;
        stats.totalIncome += npc.income;
      }
    }
    
    // Calculate average income
    const placedNPCs = player.npcs.filter(n => n.placed);
    if (placedNPCs.length > 0) {
      stats.averageIncome = stats.totalIncome / placedNPCs.length;
    }
    
    return stats;
  }

  /**
   * Get random NPC type
   */
  static getRandomNPCType() {
    const types = Object.keys(NPC_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get random guest name
   */
  static getRandomGuestName() {
    return GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
  }

  /**
   * Generate unique ID
   */
  static generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  /**
   * Get asset configuration (would be imported from Asset module)
   */
  static getAssetConfig(assetType) {
    // This would be imported from Asset module
    // For now, return basic structure
    const configs = {
      tent: { capacity: 2 },
      glamping: { capacity: 4 },
      caravan: { capacity: 4 },
      bungalow: { capacity: 6 },
      luxurybungalow: { capacity: 8 }
    };
    return configs[assetType] || null;
  }

  /**
   * Validate NPC data
   */
  static validateNPC(npc) {
    const required = ['id', 'name', 'type', 'guests', 'income'];
    for (const field of required) {
      if (!(field in npc)) {
        return { valid: false, reason: `Missing field: ${field}` };
      }
    }
    
    if (!NPC_TYPES[npc.type]) {
      return { valid: false, reason: `Invalid NPC type: ${npc.type}` };
    }
    
    if (npc.guests < 1 || npc.guests > 8) {
      return { valid: false, reason: 'Invalid guest count' };
    }
    
    if (npc.income < 0) {
      return { valid: false, reason: 'Invalid income' };
    }
    
    return { valid: true };
  }
}
