import { ASSETS, ECONOMY, VALIDATION } from '../config/gameConfig.js';
import { AssetType, Player, TileId, ValidationResult } from '../../types/index.js';

/**
 * Asset Manager - Handles all asset-related operations and validation
 */
export class AssetManager {
  /**
   * Check if a player can afford an asset
   */
  static canAffordAsset(player: Player, assetType: AssetType): ValidationResult {
    const asset = ASSETS[assetType];
    if (!asset) return { valid: false, reason: 'Unknown asset type' };
    
    if (player.money < asset.price) {
      return { valid: false, reason: 'Not enough money' };
    }
    
    return { valid: true, canAfford: true };
  }

  /**
   * Check if player has enough slots for an asset
   */
  static hasEnoughSlots(player: Player, assetType: AssetType): ValidationResult {
    const asset = ASSETS[assetType];
    if (!asset) return { valid: false, reason: 'Unknown asset type' };
    
    const playerSlots = Object.keys(player.slots || {}).length;
    const requiredSlots = asset.slots;
    
    if (playerSlots < requiredSlots) {
      return { valid: false, reason: `Need ${requiredSlots} slots, have ${playerSlots}` };
    }
    
    return { valid: true, hasSlots: true };
  }

  /**
   * Validate asset placement on a specific tile
   */
  static canPlaceAsset(player: Player, tileId: TileId, assetType: AssetType): ValidationResult {
    const asset = ASSETS[assetType];
    if (!asset) return { valid: false, reason: 'Unknown asset type' };
    
    // Check if player owns the tile
    if (!player.slots || !player.slots[tileId]) {
      return { valid: false, reason: 'You do not own this tile' };
    }
    
    // Check if tile is empty
    const slot = player.slots[tileId];
    if (slot.assetType) {
      return { valid: false, reason: 'Tile already occupied' };
    }
    
    // Check affordability
    const affordCheck = this.canAffordAsset(player, assetType);
    if (!affordCheck.valid) {
      return affordCheck;
    }
    
    // Check slot requirements
    const slotCheck = this.hasEnoughSlots(player, assetType);
    if (!slotCheck.valid) {
      return slotCheck;
    }
    
    return { valid: true, canPlace: true };
  }

  /**
   * Place an asset for a player
   */
  static placeAsset(player: Player, tileId: TileId, assetType: AssetType): { success: boolean; cost: number } {
    const validation = this.canPlaceAsset(player, tileId, assetType);
    if (!validation.canPlace) {
      throw new Error(validation.reason || 'Cannot place asset');
    }
    
    const asset = ASSETS[assetType];
    
    // Deduct cost
    player.money -= asset.price;
    
    // Place asset
    if (!player.slots[tileId]) player.slots[tileId] = { assetType: null, guestCount: 0 };
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
  static canUpgradeAsset(player: Player, tileId: TileId): ValidationResult & { upgradeTo?: AssetType; cost?: number } {
    const slot = player.slots?.[tileId];
    if (!slot || !slot.assetType) {
      return { valid: false, reason: 'No asset on this tile' };
    }
    
    const asset = ASSETS[slot.assetType];
    if (!asset || !asset.upgradeTo) {
      return { valid: false, reason: 'Asset cannot be upgraded' };
    }
    
    const upgradedAsset = ASSETS[asset.upgradeTo];
    if (!upgradedAsset) {
      return { valid: false, reason: 'Upgrade target not found' };
    }
    
    if (player.money < (upgradedAsset.upgradePrice || 0)) {
      return { valid: false, reason: 'Not enough money for upgrade' };
    }
    
    return { 
      valid: true, 
      canUpgrade: true,
      upgradeTo: asset.upgradeTo, 
      cost: upgradedAsset.upgradePrice 
    };
  }

  /**
   * Upgrade an asset
   */
  static upgradeAsset(player: Player, tileId: TileId): { success: boolean; oldAsset: AssetType; newAsset: AssetType; cost: number } {
    const validation = this.canUpgradeAsset(player, tileId);
    if (!validation.canUpgrade) {
      throw new Error(validation.reason || 'Cannot upgrade asset');
    }
    
    const slot = player.slots[tileId];
    const oldAssetType = slot.assetType!;
    const newAssetType = validation.upgradeTo!;
    const cost = validation.cost || 0;
    
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
  static moveAsset(player: Player, fromTileId: TileId, toTileId: TileId): { success: boolean; movedAsset: AssetType } {
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
  static removeAsset(player: Player, tileId: TileId): { success: boolean; removedAsset: AssetType } {
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
          npc.tileId = undefined;
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
  static getAssetInfo(assetType: AssetType) {
    return ASSETS[assetType] || null;
  }

  /**
   * Get all assets of a specific category
   */
  static getAssetsByCategory(category: 'sleeping' | 'resource' | 'facility'): Record<AssetType, typeof ASSETS[AssetType]> {
    return Object.entries(ASSETS)
      .filter(([_, asset]) => asset.category === category)
      .reduce((acc, [key, asset]) => {
        acc[key as AssetType] = asset;
        return acc;
      }, {} as Record<AssetType, typeof ASSETS[AssetType]>);
  }

  /**
   * Calculate total asset value for a player
   */
  static calculateAssetValue(player: Player): number {
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
  static getAssetsForNPC(npcType: 'Hippies' | 'Familie' | 'Snob'): Array<{ type: AssetType } & typeof ASSETS[AssetType]> {
    const npcConfig = this.getNPCConfig(npcType);
    if (!npcConfig) return [];
    
    return Object.entries(ASSETS)
      .filter(([_, asset]) => npcConfig.allowedAssets.includes(_ as AssetType))
      .map(([key, asset]) => ({ type: key as AssetType, ...asset }));
  }

  /**
   * Get NPC configuration
   */
  static getNPCConfig(npcType: 'Hippies' | 'Familie' | 'Snob') {
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
