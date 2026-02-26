import { ASSETS, ECONOMY, VALIDATION } from '../config/gameConfig.js';

/**
 * Asset Manager - Handles all asset-related operations and validation
 */
export class AssetManager {
  /**
   * Check if a player can afford an asset
   */
  static canAffordAsset(player, assetType) {
    const asset = ASSETS[assetType];
    if (!asset) return { canAfford: false, reason: 'Unknown asset type' };
    
    if (player.money < asset.price) {
      return { canAfford: false, reason: 'Not enough money' };
    }
    
    return { canAfford: true };
  }

  /**
   * Check if player has enough slots for an asset
   */
  static hasEnoughSlots(player, assetType) {
    const asset = ASSETS[assetType];
    if (!asset) return { hasSlots: false, reason: 'Unknown asset type' };
    
    const playerSlots = Object.keys(player.slots || {}).length;
    const requiredSlots = asset.slots;
    
    if (playerSlots < requiredSlots) {
      return { hasSlots: false, reason: `Need ${requiredSlots} slots, have ${playerSlots}` };
    }
    
    return { hasSlots: true };
  }

  /**
   * Validate asset placement on a specific tile
   */
  static canPlaceAsset(player, tileId, assetType) {
    const asset = ASSETS[assetType];
    if (!asset) return { canPlace: false, reason: 'Unknown asset type' };
    
    // Check if player owns the tile
    if (!player.slots || !player.slots[tileId]) {
      return { canPlace: false, reason: 'You do not own this tile' };
    }
    
    // Check if tile is empty
    const slot = player.slots[tileId];
    if (slot.assetType) {
      return { canPlace: false, reason: 'Tile already occupied' };
    }
    
    // Check affordability
    const affordCheck = this.canAffordAsset(player, assetType);
    if (!affordCheck.canAfford) {
      return affordCheck;
    }
    
    // Check slot requirements
    const slotCheck = this.hasEnoughSlots(player, assetType);
    if (!slotCheck.hasSlots) {
      return slotCheck;
    }
    
    return { canPlace: true };
  }

  /**
   * Place an asset for a player
   */
  static placeAsset(player, tileId, assetType) {
    const validation = this.canPlaceAsset(player, tileId, assetType);
    if (!validation.canPlace) {
      throw new Error(validation.reason);
    }
    
    const asset = ASSETS[assetType];
    
    // Deduct cost
    player.money -= asset.price;
    
    // Place asset
    if (!player.slots[tileId]) player.slots[tileId] = {};
    player.slots[tileId] = {
      assetType: assetType,
      guestCount: 0,
      capacity: asset.capacity || 0,
      npcs: [],
      builtAt: Date.now()
    };
    
    // Handle multi-tile assets
    if (asset.slots > 1) {
      let marked = 1;
      for (const [tid, slot] of Object.entries(player.slots)) {
        if (tid !== tileId && !slot.assetType && !slot.occupiedBy) {
          player.slots[tid] = { ...player.slots[tid], occupiedBy: tileId };
          marked++;
          if (marked >= asset.slots) break;
        }
      }
    }
    
    return { success: true, cost: asset.price };
  }

  /**
   * Check if an asset can be upgraded
   */
  static canUpgradeAsset(player, tileId) {
    const slot = player.slots?.[tileId];
    if (!slot || !slot.assetType) {
      return { canUpgrade: false, reason: 'No asset on this tile' };
    }
    
    const asset = ASSETS[slot.assetType];
    if (!asset || !asset.upgradeTo) {
      return { canUpgrade: false, reason: 'Asset cannot be upgraded' };
    }
    
    const upgradedAsset = ASSETS[asset.upgradeTo];
    if (!upgradedAsset) {
      return { canUpgrade: false, reason: 'Upgrade target not found' };
    }
    
    if (player.money < upgradedAsset.upgradePrice) {
      return { canUpgrade: false, reason: 'Not enough money for upgrade' };
    }
    
    return { canUpgrade: true, upgradeTo: asset.upgradeTo, cost: upgradedAsset.upgradePrice };
  }

  /**
   * Upgrade an asset
   */
  static upgradeAsset(player, tileId) {
    const validation = this.canUpgradeAsset(player, tileId);
    if (!validation.canUpgrade) {
      throw new Error(validation.reason);
    }
    
    const slot = player.slots[tileId];
    const oldAssetType = slot.assetType;
    const newAssetType = validation.upgradeTo;
    const cost = validation.cost;
    
    // Deduct cost
    player.money -= cost;
    
    // Update asset
    slot.assetType = newAssetType;
    slot.capacity = ASSETS[newAssetType].capacity || slot.capacity;
    
    return { success: true, oldAsset: oldAssetType, newAsset: newAssetType, cost };
  }

  /**
   * Move an asset to another tile
   */
  static moveAsset(player, fromTileId, toTileId) {
    const fromSlot = player.slots?.[fromTileId];
    const toSlot = player.slots?.[toTileId];
    
    if (!fromSlot || !fromSlot.assetType) {
      throw new Error('Source tile has no asset');
    }
    
    if (!toSlot || toSlot.assetType) {
      throw new Error('Target tile is not empty');
    }
    
    // Move the asset
    player.slots[toTileId] = { ...fromSlot };
    delete player.slots[fromTileId];
    
    return { success: true, movedAsset: fromSlot.assetType };
  }

  /**
   * Remove an asset
   */
  static removeAsset(player, tileId) {
    const slot = player.slots?.[tileId];
    if (!slot || !slot.assetType) {
      throw new Error('No asset on this tile');
    }
    
    const assetType = slot.assetType;
    
    // Remove any guests from this asset
    if (slot.npcs && slot.npcs.length > 0) {
      for (const npcId of slot.npcs) {
        const npc = player.npcs.find(n => n.id === npcId);
        if (npc) {
          npc.placed = false;
          npc.tileId = null;
        }
      }
    }
    
    // Delete the asset
    delete player.slots[tileId];
    
    return { success: true, removedAsset: assetType };
  }

  /**
   * Get asset information
   */
  static getAssetInfo(assetType) {
    return ASSETS[assetType] || null;
  }

  /**
   * Get all assets of a specific category
   */
  static getAssetsByCategory(category) {
    return Object.entries(ASSETS)
      .filter(([_, asset]) => asset.category === category)
      .reduce((acc, [key, asset]) => {
        acc[key] = asset;
        return acc;
      }, {});
  }

  /**
   * Calculate total asset value for a player
   */
  static calculateAssetValue(player) {
    let totalValue = 0;
    
    for (const [tileId, slot] of Object.entries(player.slots || {})) {
      if (slot.assetType) {
        const asset = ASSETS[slot.assetType];
        if (asset) {
          totalValue += asset.price;
        }
      }
    }
    
    return totalValue;
  }

  /**
   * Get assets that can satisfy NPC requirements
   */
  static getAssetsForNPC(npcType) {
    const npcConfig = this.getNPCConfig(npcType);
    if (!npcConfig) return [];
    
    return Object.entries(ASSETS)
      .filter(([_, asset]) => npcConfig.allowedAssets.includes(_))
      .map(([key, asset]) => ({ type: key, ...asset }));
  }

  /**
   * Get NPC configuration (would be imported from NPC module)
   */
  static getNPCConfig(npcType) {
    // This would be imported from NPC module
    // For now, return basic structure
    const configs = {
      Hippies: { allowedAssets: ['tent', 'glamping', 'caravan', 'bungalow'] },
      Familie: { allowedAssets: ['glamping', 'caravan', 'bungalow', 'luxurybungalow'] },
      Snob: { allowedAssets: ['glamping', 'bungalow', 'luxurybungalow'] }
    };
    return configs[npcType] || null;
  }
}
