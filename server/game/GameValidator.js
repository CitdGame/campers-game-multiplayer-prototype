import { VALIDATION, GAME_TIMING, ECONOMY } from '../config/gameConfig.js';

/**
 * Game Validator - Validates all game rules and constraints
 */
export class GameValidator {
  /**
   * Validate player data
   */
  static validatePlayer(player) {
    const required = ['id', 'name', 'money', 'slots', 'electric', 'water', 'coins', 'npcs'];
    for (const field of required) {
      if (!(field in player)) {
        return { valid: false, reason: `Missing field: ${field}` };
      }
    }
    
    // Validate money
    if (typeof player.money !== 'number' || player.money < VALIDATION.MIN_MONEY || player.money > VALIDATION.MAX_MONEY) {
      return { valid: false, reason: `Invalid money amount: ${player.money}` };
    }
    
    // Validate resources
    if (typeof player.electric !== 'number' || player.electric < VALIDATION.MIN_RESOURCES || player.electric > VALIDATION.MAX_RESOURCES) {
      return { valid: false, reason: `Invalid electric amount: ${player.electric}` };
    }
    
    if (typeof player.water !== 'number' || player.water < VALIDATION.MIN_RESOURCES || player.water > VALIDATION.MAX_RESOURCES) {
      return { valid: false, reason: `Invalid water amount: ${player.water}` };
    }
    
    // Validate coins
    if (!player.coins || typeof player.coins !== 'object') {
      return { valid: false, reason: 'Invalid coins object' };
    }
    
    const coinTypes = ['generic', 'Hippies', 'Familie', 'Snob'];
    for (const coinType of coinTypes) {
      if (typeof player.coins[coinType] !== 'number' || player.coins[coinType] < 0 || player.coins[coinType] > ECONOMY.MAX_COINS_PER_TYPE) {
        return { valid: false, reason: `Invalid ${coinType} coins: ${player.coins[coinType]}` };
      }
    }
    
    // Validate NPCs array
    if (!Array.isArray(player.npcs)) {
      return { valid: false, reason: 'NPCs must be an array' };
    }
    
    if (player.npcs.length > VALIDATION.MAX_GUESTS_PER_ASSET * 10) { // Reasonable limit
      return { valid: false, reason: 'Too many NPCs' };
    }
    
    return { valid: true };
  }

  /**
   * Validate game state
   */
  static validateGameState(gameState) {
    const required = ['players', 'currentPlayerIndex', 'year', 'quarter', 'round'];
    for (const field of required) {
      if (!(field in gameState)) {
        return { valid: false, reason: `Missing field: ${field}` };
      }
    }
    
    // Validate players
    if (!Array.isArray(gameState.players) || gameState.players.length < 1 || gameState.players.length > GAME_TIMING.MAX_PLAYERS) {
      return { valid: false, reason: `Invalid players array: ${gameState.players?.length || 0} players` };
    }
    
    // Validate each player
    for (let i = 0; i < gameState.players.length; i++) {
      const playerValidation = this.validatePlayer(gameState.players[i]);
      if (!playerValidation.valid) {
        return { valid: false, reason: `Player ${i}: ${playerValidation.reason}` };
      }
    }
    
    // Validate current player index
    if (typeof gameState.currentPlayerIndex !== 'number' || gameState.currentPlayerIndex < 0 || gameState.currentPlayerIndex >= gameState.players.length) {
      return { valid: false, reason: `Invalid currentPlayerIndex: ${gameState.currentPlayerIndex}` };
    }
    
    // Validate time
    if (typeof gameState.year !== 'number' || gameState.year < 1 || gameState.year > 2) {
      return { valid: false, reason: `Invalid year: ${gameState.year}` };
    }
    
    if (typeof gameState.quarter !== 'number' || gameState.quarter < 1 || gameState.quarter > GAME_TIMING.QUARTERS_PER_YEAR) {
      return { valid: false, reason: `Invalid quarter: ${gameState.quarter}` };
    }
    
    if (typeof gameState.round !== 'number' || gameState.round < 1 || gameState.round > GAME_TIMING.ROUNDS_PER_QUARTER) {
      return { valid: false, reason: `Invalid round: ${gameState.round}` };
    }
    
    // Validate board
    if (gameState.board && typeof gameState.board !== 'object') {
      return { valid: false, reason: 'Board must be an object' };
    }
    
    return { valid: true };
  }

  /**
   * Validate tile coordinates
   */
  static validateTileId(tileId) {
    if (typeof tileId !== 'string') {
      return { valid: false, reason: 'Tile ID must be a string' };
    }
    
    const parts = tileId.split(',');
    if (parts.length !== 2) {
      return { valid: false, reason: 'Tile ID must be in format "q,r"' };
    }
    
    const q = parseInt(parts[0]);
    const r = parseInt(parts[1]);
    
    if (isNaN(q) || isNaN(r)) {
      return { valid: false, reason: 'Tile coordinates must be numbers' };
    }
    
    // Check if within reasonable bounds (hex grid with radius 10)
    const s = -q - r;
    if (Math.abs(q) > 10 || Math.abs(r) > 10 || Math.abs(s) > 10) {
      return { valid: false, reason: 'Tile coordinates out of bounds' };
    }
    
    return { valid: true };
  }

  /**
   * Validate asset placement
   */
  static validateAssetPlacement(player, tileId, assetType) {
    // Validate tile ID
    const tileValidation = this.validateTileId(tileId);
    if (!tileValidation.valid) {
      return tileValidation;
    }
    
    // Check if player owns the tile
    if (!player.slots || !player.slots[tileId]) {
      return { valid: false, reason: 'Player does not own this tile' };
    }
    
    // Check if tile is empty
    const slot = player.slots[tileId];
    if (slot.assetType) {
      return { valid: false, reason: 'Tile already has an asset' };
    }
    
    return { valid: true };
  }

  /**
   * Validate NPC placement
   */
  static validateNPCPlacement(player, npcId, tileId) {
    // Find NPC
    const npc = player.npcs.find(n => n.id === npcId);
    if (!npc) {
      return { valid: false, reason: 'NPC not found' };
    }
    
    // Check if NPC is already placed
    if (npc.placed) {
      return { valid: false, reason: 'NPC already placed' };
    }
    
    // Validate tile ID
    const tileValidation = this.validateTileId(tileId);
    if (!tileValidation.valid) {
      return tileValidation;
    }
    
    // Check if tile has an asset
    const slot = player.slots?.[tileId];
    if (!slot || !slot.assetType) {
      return { valid: false, reason: 'Tile must have an asset' };
    }
    
    // Check capacity
    const currentOccupancy = slot.guestCount || 0;
    if (currentOccupancy + npc.guests > VALIDATION.MAX_GUESTS_PER_ASSET) {
      return { valid: false, reason: 'Asset would exceed maximum capacity' };
    }
    
    return { valid: true };
  }

  /**
   * Validate game action
   */
  static validateGameAction(gameState, playerIndex, action) {
    // Check if it's the player's turn
    if (playerIndex !== gameState.currentPlayerIndex) {
      return { valid: false, reason: 'Not your turn' };
    }
    
    // Validate action type
    const validActions = ['buyTile', 'buyAsset', 'upgradeAsset', 'moveAsset', 'deleteAsset', 'placeNPC', 'removeNPC', 'endTurn'];
    if (!validActions.includes(action.type)) {
      return { valid: false, reason: `Invalid action type: ${action.type}` };
    }
    
    // Action-specific validation
    switch (action.type) {
      case 'buyTile':
        return this.validateBuyTileAction(gameState, playerIndex, action);
      case 'buyAsset':
        return this.validateBuyAssetAction(gameState, playerIndex, action);
      case 'upgradeAsset':
        return this.validateUpgradeAssetAction(gameState, playerIndex, action);
      case 'moveAsset':
        return this.validateMoveAssetAction(gameState, playerIndex, action);
      case 'deleteAsset':
        return this.validateDeleteAssetAction(gameState, playerIndex, action);
      case 'placeNPC':
        return this.validatePlaceNPCAction(gameState, playerIndex, action);
      case 'removeNPC':
        return this.validateRemoveNPCAction(gameState, playerIndex, action);
      case 'endTurn':
        return { valid: true }; // Always valid
      default:
        return { valid: false, reason: 'Unknown action type' };
    }
  }

  /**
   * Validate buy tile action
   */
  static validateBuyTileAction(gameState, playerIndex, action) {
    const player = gameState.players[playerIndex];
    
    // Check money
    if (player.money < ECONOMY.TILE_PRICE) {
      return { valid: false, reason: 'Not enough money to buy tile' };
    }
    
    // Validate tile ID
    const tileValidation = this.validateTileId(action.tileId);
    if (!tileValidation.valid) {
      return tileValidation;
    }
    
    // Check if tile is unclaimed
    if (gameState.board[action.tileId] !== undefined) {
      return { valid: false, reason: 'Tile already claimed' };
    }
    
    return { valid: true };
  }

  /**
   * Validate buy asset action
   */
  static validateBuyAssetAction(gameState, playerIndex, action) {
    const player = gameState.players[playerIndex];
    
    // Validate tile ID and placement
    const placementValidation = this.validateAssetPlacement(player, action.tileId, action.assetType);
    if (!placementValidation.valid) {
      return placementValidation;
    }
    
    return { valid: true };
  }

  /**
   * Validate upgrade asset action
   */
  static validateUpgradeAssetAction(gameState, playerIndex, action) {
    const player = gameState.players[playerIndex];
    
    // Validate tile ID
    const tileValidation = this.validateTileId(action.tileId);
    if (!tileValidation.valid) {
      return tileValidation;
    }
    
    // Check if tile has an asset
    const slot = player.slots?.[action.tileId];
    if (!slot || !slot.assetType) {
      return { valid: false, reason: 'No asset to upgrade' };
    }
    
    return { valid: true };
  }

  /**
   * Validate move asset action
   */
  static validateMoveAssetAction(gameState, playerIndex, action) {
    const player = gameState.players[playerIndex];
    
    // Validate from tile
    const fromTileValidation = this.validateTileId(action.fromTileId);
    if (!fromTileValidation.valid) {
      return fromTileValidation;
    }
    
    // Validate to tile
    const toTileValidation = this.validateTileId(action.toTileId);
    if (!toTileValidation.valid) {
      return toTileValidation;
    }
    
    // Check if source tile has an asset
    const fromSlot = player.slots?.[action.fromTileId];
    if (!fromSlot || !fromSlot.assetType) {
      return { valid: false, reason: 'Source tile has no asset' };
    }
    
    // Check if target tile is empty
    const toSlot = player.slots?.[action.toTileId];
    if (toSlot && toSlot.assetType) {
      return { valid: false, reason: 'Target tile already occupied' };
    }
    
    return { valid: true };
  }

  /**
   * Validate delete asset action
   */
  static validateDeleteAssetAction(gameState, playerIndex, action) {
    const player = gameState.players[playerIndex];
    
    // Validate tile ID
    const tileValidation = this.validateTileId(action.tileId);
    if (!tileValidation.valid) {
      return tileValidation;
    }
    
    // Check if tile has an asset
    const slot = player.slots?.[action.tileId];
    if (!slot || !slot.assetType) {
      return { valid: false, reason: 'No asset to delete' };
    }
    
    return { valid: true };
  }

  /**
   * Validate place NPC action
   */
  static validatePlaceNPCAction(gameState, playerIndex, action) {
    const player = gameState.players[playerIndex];
    
    return this.validateNPCPlacement(player, action.npcId, action.tileId);
  }

  /**
   * Validate remove NPC action
   */
  static validateRemoveNPCAction(gameState, playerIndex, action) {
    const player = gameState.players[playerIndex];
    
    // Find NPC
    const npc = player.npcs.find(n => n.id === action.npcId);
    if (!npc) {
      return { valid: false, reason: 'NPC not found' };
    }
    
    // Check if NPC is placed
    if (!npc.placed) {
      return { valid: false, reason: 'NPC not placed' };
    }
    
    return { valid: true };
  }

  /**
   * Validate lobby code
   */
  static validateLobbyCode(code) {
    if (typeof code !== 'string') {
      return { valid: false, reason: 'Lobby code must be a string' };
    }
    
    if (code.length !== 4) {
      return { valid: false, reason: 'Lobby code must be 4 characters' };
    }
    
    if (!/^[A-Z0-9]{4}$/.test(code)) {
      return { valid: false, reason: 'Lobby code must contain only uppercase letters and numbers' };
    }
    
    return { valid: true };
  }

  /**
   * Validate player name
   */
  static validatePlayerName(name) {
    if (typeof name !== 'string') {
      return { valid: false, reason: 'Player name must be a string' };
    }
    
    if (name.length < 1 || name.length > 20) {
      return { valid: false, reason: 'Player name must be 1-20 characters' };
    }
    
    if (!/^[a-zA-Z0-9äöüÄÖÜß\s]+$/.test(name)) {
      return { valid: false, reason: 'Player name contains invalid characters' };
    }
    
    return { valid: true };
  }

  /**
   * Validate game progression
   */
  static validateGameProgression(gameState) {
    // Check if game should be over
    if (gameState.year > 1 && gameState.quarter > 1 && gameState.round > 1) {
      return { gameOver: true, reason: 'Game completed' };
    }
    
    // Check for invalid time progression
    if (gameState.round < 1 || gameState.round > GAME_TIMING.ROUNDS_PER_QUARTER) {
      return { valid: false, reason: `Invalid round: ${gameState.round}` };
    }
    
    if (gameState.quarter < 1 || gameState.quarter > GAME_TIMING.QUARTERS_PER_YEAR) {
      return { valid: false, reason: `Invalid quarter: ${gameState.quarter}` };
    }
    
    return { valid: true, gameOver: false };
  }

  /**
   * Sanitize input data
   */
  static sanitizeInput(data, type) {
    switch (type) {
      case 'string':
        return typeof data === 'string' ? data.trim().substring(0, 100) : '';
      case 'number':
        return typeof data === 'number' && !isNaN(data) ? data : 0;
      case 'boolean':
        return Boolean(data);
      case 'object':
        return data && typeof data === 'object' ? data : {};
      case 'array':
        return Array.isArray(data) ? data : [];
      default:
        return data;
    }
  }

  /**
   * Validate and sanitize socket data
   */
  static validateSocketData(data, schema) {
    const result = { valid: true, data: {}, errors: [] };
    
    for (const [key, rules] of Object.entries(schema)) {
      if (rules.required && !(key in data)) {
        result.valid = false;
        result.errors.push(`Missing required field: ${key}`);
        continue;
      }
      
      if (key in data) {
        const value = this.sanitizeInput(data[key], rules.type);
        
        if (rules.validate && !rules.validate(value)) {
          result.valid = false;
          result.errors.push(`Invalid value for ${key}: ${value}`);
        } else {
          result.data[key] = value;
        }
      }
    }
    
    return result;
  }
}
