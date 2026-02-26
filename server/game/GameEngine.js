import { ECONOMY, GAME_TIMING, SCORING } from '../config/gameConfig.js';
import { AssetManager } from './AssetManager.js';
import { NPCManager } from './NPCManager.js';
import { EventManager } from './EventManager.js';

/**
 * Game Engine - Core game logic and turn processing
 */
export class GameEngine {
  /**
   * Create a new player
   */
  static createPlayer(name) {
    return {
      id: this.generateId(),
      name: name,
      money: ECONOMY.STARTING_MONEY,
      slots: ECONOMY.STARTING_SLOTS,
      electric: ECONOMY.STARTING_ELECTRIC,
      water: ECONOMY.STARTING_WATER,
      coins: { 
        generic: ECONOMY.STARTING_GENERIC_COINS, 
        Hippies: 0, 
        Familie: 0, 
        Snob: 0 
      },
      npcs: [],
      assets: {},
      score: 0
    };
  }

  /**
   * Create initial game state
   */
  static createGameState(players) {
    const gameState = {
      players: players,
      currentPlayerIndex: 0,
      year: 1,
      quarter: 1,
      round: 1,
      event: null,
      board: {},
      npcs: [],
      currentEvent: null,
      eventEffects: null,
      startedAt: Date.now()
    };
    
    // Give each player a starting tile
    this.giveStartingTiles(gameState);
    
    return gameState;
  }

  /**
   * Give starting tiles to players
   */
  static giveStartingTiles(gameState) {
    const positions = [
      "0,0",    // Center
      "-1,0",   // West
      "1,0",    // East
      "0,-1",   // Northwest
      "0,1",    // Southeast
      "-1,1",   // Southwest
      "1,-1",   // Northeast
      "-1,-1"   // Far West
    ];
    
    for (let i = 0; i < gameState.players.length && i < positions.length; i++) {
      const tileId = positions[i];
      gameState.board[tileId] = i;
      gameState.players[i].slots = { [tileId]: { assetType: null, guestCount: 0 } };
    }
  }

  /**
   * Process end of turn
   */
  static processEndTurn(gameState, playerIndex, isSoloGame = false) {
    const player = gameState.players[playerIndex];
    let income = 0;
    let electricChange = 0;
    let waterChange = 0;
    
    // Calculate income from NPCs
    income = NPCManager.calculateTotalIncome(player);
    player.money += income;
    
    // Calculate resource generation
    const generation = EventManager.calculateResourceGeneration(player, gameState);
    const consumption = EventManager.calculateResourceConsumption(player, gameState);
    
    electricChange = generation.electric - consumption.electric;
    waterChange = generation.water - consumption.water;
    
    player.electric = Math.max(0, Math.min(100, player.electric + electricChange));
    player.water = Math.max(0, Math.min(100, player.water + waterChange));
    
    // Update NPC durations
    const expiredNPCs = NPCManager.updateNPCDurations(player);
    
    // Check for quarter/year progression
    const wasNewQuarter = this.advanceTime(gameState);
    
    // Generate new event if new quarter
    if (wasNewQuarter) {
      gameState.currentEvent = EventManager.generateQuarterEvent(gameState.quarter);
      if (gameState.currentEvent) {
        gameState = EventManager.applyEventEffects(gameState, gameState.currentEvent);
      }
    }
    
    // Generate new NPCs (but not on first turn)
    if (gameState.round > 1 || gameState.year > 1) {
      const npcGen = EventManager.calculateNPCGeneration(gameState);
      for (let i = 0; i < npcGen.count; i++) {
        const newNpc = NPCManager.generateNPC();
        newNpc.expiresIn = GAME_TIMING.NPC_EXPIRE_ROUNDS;
        gameState.npcs.push(newNpc);
      }
    }
    
    // Check victory condition
    if (gameState.year > 1 && gameState.quarter > 1 && gameState.round > 1) {
      return { 
        gameOver: true, 
        winner: this.calculateWinner(gameState),
        income,
        electricChange,
        waterChange,
        expiredNPCs
      };
    }
    
    return {
      income,
      electricChange,
      waterChange,
      gameOver: false,
      expiredNPCs,
      newEvent: gameState.currentEvent
    };
  }

  /**
   * Advance game time (rounds, quarters, years)
   */
  static advanceTime(gameState) {
    const oldQuarter = gameState.quarter;
    
    gameState.round++;
    
    if (gameState.round > GAME_TIMING.ROUNDS_PER_QUARTER) {
      gameState.round = 1;
      gameState.quarter++;
      
      if (gameState.quarter > GAME_TIMING.QUARTERS_PER_YEAR) {
        gameState.quarter = 1;
        gameState.year++;
      }
    }
    
    return gameState.quarter !== oldQuarter;
  }

  /**
   * Give coins to current player
   */
  static giveCoins(player) {
    player.coins.generic = Math.min(
      ECONOMY.MAX_COINS_PER_TYPE, 
      player.coins.generic + ECONOMY.COINS_PER_TURN
    );
  }

  /**
   * Request a guest using coins
   */
  static requestGuest(player, coinType) {
    if (!player.coins[coinType] || player.coins[coinType] <= 0) {
      throw new Error(`No ${coinType} coins available`);
    }
    
    player.coins[coinType]--;
    
    const npcType = coinType === 'generic' ? null : coinType;
    const guest = NPCManager.generateNPC(npcType);
    
    return guest;
  }

  /**
   * Run a promotion to get specific coins
   */
  static runPromotion(player, promotionType) {
    const promotion = ECONOMY.PROMOTIONS[promotionType];
    if (!promotion) {
      throw new Error('Unknown promotion type');
    }
    
    if (player.money < promotion.cost) {
      throw new Error('Not enough money for promotion');
    }
    
    player.money -= promotion.cost;
    player.coins[promotion.coinType] = Math.min(
      ECONOMY.MAX_COINS_PER_TYPE,
      player.coins[promotion.coinType] + 1
    );
    
    return {
      success: true,
      promotion: promotion,
      newCoin: promotion.coinType
    };
  }

  /**
   * Calculate winner based on scores
   */
  static calculateWinner(gameState) {
    let bestPlayer = null;
    let bestScore = -1;
    
    for (const player of gameState.players) {
      const score = this.calculateScore(player);
      player.score = score;
      
      if (score > bestScore) {
        bestScore = score;
        bestPlayer = player;
      }
    }
    
    return { winner: bestPlayer, score: bestScore };
  }

  /**
   * Calculate player score
   */
  static calculateScore(player) {
    let score = 0;
    
    // Money score
    score += player.money * SCORING.MONEY_WEIGHT;
    
    // Asset score
    const assetValue = AssetManager.calculateAssetValue(player);
    score += assetValue * SCORING.ASSET_WEIGHT;
    
    // Guest score
    for (const npc of player.npcs) {
      if (npc.placed) {
        score += npc.income * npc.stayDuration * SCORING.GUEST_WEIGHT;
      }
    }
    
    return Math.floor(score);
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
    
    if (!Array.isArray(gameState.players) || gameState.players.length === 0) {
      return { valid: false, reason: 'Invalid players array' };
    }
    
    if (gameState.currentPlayerIndex < 0 || gameState.currentPlayerIndex >= gameState.players.length) {
      return { valid: false, reason: 'Invalid currentPlayerIndex' };
    }
    
    return { valid: true };
  }

  /**
   * Get game statistics
   */
  static getGameStats(gameState) {
    const stats = {
      duration: this.getGameDuration(gameState),
      currentTurn: `${gameState.year}Q${gameState.quarter}R${gameState.round}`,
      totalRounds: gameState.year * GAME_TIMING.QUARTERS_PER_YEAR * GAME_TIMING.ROUNDS_PER_QUARTER + 
                   (gameState.quarter - 1) * GAME_TIMING.ROUNDS_PER_QUARTER + 
                   gameState.round,
      players: gameState.players.map(p => ({
        name: p.name,
        score: this.calculateScore(p),
        money: p.money,
        assets: Object.keys(p.slots || {}).filter(tileId => p.slots[tileId].assetType).length,
        guests: p.npcs.filter(n => n.placed).length
      })),
      currentEvent: gameState.currentEvent ? {
        name: gameState.currentEvent.name,
        description: gameState.currentEvent.description
      } : null
    };
    
    return stats;
  }

  /**
   * Get game duration
   */
  static getGameDuration(gameState) {
    const startedAt = gameState.startedAt || Date.now();
    const duration = Date.now() - startedAt;
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return { minutes, seconds, totalMs: duration };
  }

  /**
   * Check if game is over
   */
  static isGameOver(gameState) {
    return gameState.year > 1 && gameState.quarter > 1 && gameState.round > 1;
  }

  /**
   * Generate unique ID
   */
  static generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  /**
   * Get next player index
   */
  static getNextPlayerIndex(gameState) {
    return (gameState.currentPlayerIndex + 1) % gameState.players.length;
  }

  /**
   * Check if it's a player's turn
   */
  static isPlayerTurn(gameState, playerId) {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    return playerIndex === gameState.currentPlayerIndex;
  }

  /**
   * Get current player
   */
  static getCurrentPlayer(gameState) {
    return gameState.players[gameState.currentPlayerIndex];
  }

  /**
   * Get game summary for leaderboard
   */
  static getGameSummary(gameState) {
    const sortedPlayers = [...gameState.players]
      .map(p => ({ ...p, score: this.calculateScore(p) }))
      .sort((a, b) => b.score - a.score);
    
    return {
      duration: this.getGameDuration(gameState),
      winner: sortedPlayers[0],
      players: sortedPlayers,
      totalRounds: this.getGameStats(gameState).totalRounds,
      finalEvent: gameState.currentEvent
    };
  }
}
