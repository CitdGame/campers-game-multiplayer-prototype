import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/landing.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/game.html'));
});

// Game state storage
const lobbies = new Map();
const players = new Map();

// Generate lobby code
function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Generate player ID
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Create player
function createPlayer(name) {
  return {
    id: generateId(),
    name: name,
    money: 500,
    slots: 5,
    electric: 5,
    water: 5,
    coins: { generic: 2, Hippies: 0, Familie: 0, Snob: 0 },
    npcs: [],
    assets: {}
  };
}

// Create initial game state
function createGameState(players) {
  return {
    players: players,
    currentPlayerIndex: 0,
    year: 1,
    quarter: 1,
    round: 1,
    event: null,
    board: {},
    npcs: []
  };
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  let currentLobby = null;
  let playerData = null;

  socket.on('createLobby', ({ name }) => {
    const code = generateCode();
    const player = createPlayer(name);
    player.socketId = socket.id;
    
    const lobby = {
      code: code,
      host: player.id,
      players: [player],
      gameState: null,
      gameStarted: false
    };
    
    lobbies.set(code, lobby);
    currentLobby = code;
    playerData = player;
    players.set(socket.id, { lobby: code, playerId: player.id });
    
    socket.join(code);
    socket.emit('lobbyCreated', { code, players: lobby.players });
    console.log(`Lobby created: ${code} by ${name}`);
  });

  socket.on('joinLobby', ({ code, name }) => {
    const lobby = lobbies.get(code.toUpperCase());
    
    if (!lobby) {
      socket.emit('error', 'Lobby nicht gefunden');
      return;
    }
    
    if (lobby.players.length >= 8) {
      socket.emit('error', 'Lobby ist voll');
      return;
    }
    
    if (lobby.gameStarted) {
      socket.emit('Error', 'Spiel bereits gestartet');
      return;
    }
    
    const player = createPlayer(name);
    player.socketId = socket.id;
    lobby.players.push(player);
    
    currentLobby = code.toUpperCase();
    playerData = player;
    players.set(socket.id, { lobby: code.toUpperCase(), playerId: player.id });
    
    socket.join(code.toUpperCase());
    socket.emit('lobbyJoined', { code: code.toUpperCase(), players: lobby.players });
    io.to(code.toUpperCase()).emit('playerJoined', { players: lobby.players });
    console.log(`Player ${name} joined lobby ${code.toUpperCase()}`);
  });

  // Solo game handling
  let soloGame = null; // Store solo game state
  
  socket.on('startSolo', (playerName) => {
    console.log(`Starting solo game for ${playerName}`);
    
    const player = createPlayer(playerName);
    player.socketId = socket.id;
    
    soloGame = {
      gameState: createGameState([player]),
      currentPlayerIndex: 0
    };
    
    // Give player the starting tile
    const startTileId = "0,0";
    soloGame.gameState.board[startTileId] = 0;
    soloGame.gameState.players[0].slots = { [startTileId]: { assetType: null, guestCount: 0 } };
    
    // No initial NPCs - players need to use coins to request guests
    
    socket.emit('soloStarted', {
      gameState: soloGame.gameState,
      myPlayerIndex: 0
    });
  });

  socket.on('buyTile', ({ tileId }) => {
    // Handle solo game
    if (soloGame) {
      const player = soloGame.gameState.players[0];
      
      // Check if tile is unclaimed
      if (soloGame.gameState.board[tileId] !== undefined) {
        socket.emit('error', 'Feld bereits besetzt');
        return;
      }
      
      // Check adjacency
      const [q, r] = tileId.split(',').map(Number);
      const neighbors = [
        [q+1, r], [q-1, r], [q, r+1], [q, r-1], [q+1, r-1], [q-1, r+1]
      ];
      
      let isAdjacent = false;
      for (const [nq, nr] of neighbors) {
        const neighborId = `${nq},${nr}`;
        if (player.slots && player.slots[neighborId]) {
          isAdjacent = true;
          break;
        }
      }
      
      if (!isAdjacent && Object.keys(player.slots || {}).length > 0) {
        socket.emit('error', 'Feld muss an deinen Campingplatz angrenzen');
        return;
      }
      
      // Check money
      if (player.money < 100) {
        socket.emit('error', 'Nicht genug Geld');
        return;
      }
      
      // Buy tile
      player.money -= 100;
      if (!player.slots) player.slots = {};
      player.slots[tileId] = { assetType: null, guestCount: 0 };
      soloGame.gameState.board[tileId] = 0;
      
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
      return;
    }
    
    // Handle multiplayer game
    const p = players.get(socket.id);
    if (!p) return;
    
    const lobby = lobbies.get(p.lobby);
    if (!lobby || !lobby.gameState) return;
    
    const playerIndex = lobby.gameState.players.findIndex(pl => pl.id === p.playerId);
    if (playerIndex !== lobby.gameState.currentPlayerIndex) return;
    
    // Check if tile is unclaimed
    if (lobby.gameState.board[tileId] !== undefined) {
      socket.emit('error', 'Feld bereits besetzt');
      return;
    }
    
    // Check adjacency
    const [q, r] = tileId.split(',').map(Number);
    const neighbors = [
      [q+1, r], [q-1, r], [q, r+1], [q, r-1], [q+1, r-1], [q-1, r+1]
    ];
    
    const player = lobby.gameState.players[playerIndex];
    let isAdjacent = false;
    for (const [nq, nr] of neighbors) {
      const neighborId = `${nq},${nr}`;
      if (player.slots && player.slots[neighborId]) {
        isAdjacent = true;
        break;
      }
    }
    
    if (!isAdjacent && Object.keys(player.slots || {}).length > 0) {
      socket.emit('error', 'Feld muss an deinen Campingplatz angrenzen');
      return;
    }
    
    // Check money (100€ per tile)
    if (player.money < 100) {
      socket.emit('error', 'Nicht genug Geld');
      return;
    }
    
    // Buy tile
    player.money -= 100;
    if (!player.slots) player.slots = {};
    player.slots[tileId] = { assetType: null, guestCount: 0 };
    lobby.gameState.board[tileId] = playerIndex;
    
    io.to(p.lobby).emit('gameState', lobby.gameState);
  });

  // Asset definitions
  const ASSETS = {
    tent: { price: 50, slots: 1, capacity: 2 },
    glamping: { price: 100, slots: 1, capacity: 4, upgradeFrom: 'tent', upgradePrice: 50 },
    caravan: { price: 150, slots: 2, capacity: 4 },
    bungalow: { price: 300, slots: 3, capacity: 6, upgradeFrom: null, upgradePrice: 200 },
    luxurybungalow: { price: 500, slots: 3, capacity: 8, upgradeFrom: 'bungalow', upgradePrice: 200 },
    generator: { price: 200, slots: 2, produces: { electric: 5 } },
    watertank: { price: 150, slots: 2, produces: { water: 5 } },
    sportsfield: { price: 250, slots: 3 },
    campfire: { price: 100, slots: 1 },
    sauna: { price: 350, slots: 2 },
    stage: { price: 400, slots: 3 }
  };

  // Events for quarters
  const EVENTS = {
    rain: { name: 'Dauerregen', description: 'NPCs pro Zug halbieren sich', npcMod: 0.5 },
    boom: { name: 'Tourismusboom', description: 'Region zum Weltkulturerbe erklärt!', npcMod: 2 },
    storm: { name: 'Sturmwarnung', description: 'NPCs wollen nicht in Zelten übernachten', noTents: true },
    festival: { name: 'Festival', description: 'NPCs wollen bevorzugt in Zelten', preferTents: true },
    heat: { name: 'Hitzewelle', description: 'Erhöhter Wasserverbrauch', waterMod: 2 },
    drought: { name: 'Dürre', description: 'Wassertanks generieren kein Wasser', noWater: true },
    blackout: { name: 'Blackout', description: 'Generatoren generieren keinen Strom', noElectric: true }
  };

  // Generate event for quarter
  function generateQuarterEvent(quarter) {
    if (quarter === 1 || quarter === 4) {
      return null;
    }
    const eventKeys = Object.keys(EVENTS);
    return EVENTS[eventKeys[Math.floor(Math.random() * eventKeys.length)]];
  }

  // NPC asset requirements by type
  const NPC_ASSET_REQUIREMENTS = {
    Hippies: { allowed: ['tent', 'glamping', 'caravan', 'bungalow'], maxSize: 6 },
    Familie: { allowed: ['glamping', 'caravan', 'bungalow'], maxSize: 6 },
    Snob: { allowed: ['glamping', 'bungalow', 'luxurybungalow'], maxSize: 6 }
  };

  // NPC sharing rules
  function canShareWithExisting(npcType, existingGuests) {
    if (existingGuests.length === 0) return true;
    
    const existingType = existingGuests[0].type;
    
    if (npcType === 'Snob') return false;
    if (npcType === 'Hippies' && existingType === 'Hippies') return true;
    if (npcType === 'Familie' && existingType === 'Familie') return true;
    return false;
  }

  // Calculate income, resources, and advance turn
  function processEndTurn(gameState, playerIndex, isSolo = false) {
    const player = gameState.players[playerIndex];
    let income = 0;
    let electricChange = 0;
    let waterChange = 0;
    const event = gameState.event || {};

    // Resource generation from assets
    for (const [tileId, slot] of Object.entries(player.slots || {})) {
      if (!slot.assetType) continue;
      const asset = ASSETS[slot.assetType];
      if (!asset) continue;

      if (asset.produces) {
        if (asset.produces.electric && !event.noElectric) {
          electricChange += asset.produces.electric;
        }
        if (asset.produces.water && !event.noWater) {
          waterChange += asset.produces.water;
        }
      }
    }

    // Process placed NPCs
    const npcsToRemove = [];
    for (const npc of player.npcs) {
      if (!npc.placed) continue;
      
      // Calculate income for this turn
      income += npc.income;
      
      // Resource consumption
      const waterMod = event.waterMod || 1;
      const electricMod = event.noTents && (npc.assignedAsset === 'tent') ? 0 : 1;
      
      const waterNeeded = Math.ceil(npc.needs.water * waterMod * electricMod);
      const electricNeeded = npc.needs.electric * electricMod;
      
      // Check if resources available
      if (player.electric >= electricNeeded && player.water >= waterNeeded) {
        player.electric -= electricNeeded;
        player.water -= waterNeeded;
      } else {
        // Penalty for missing resources - NPC leaves early
        npcsToRemove.push(npc);
        income = Math.floor(income * 0.5);
      }
      
      // Decrease stay duration
      npc.stayDuration--;
      if (npc.stayDuration <= 0) {
        npcsToRemove.push(npc);
      }
    }

    // Remove NPCs that left
    for (const npc of npcsToRemove) {
      const idx = player.npcs.indexOf(npc);
      if (idx > -1) {
        player.npcs.splice(idx, 1);
        // Free up space on the tile
        for (const [tileId, slot] of Object.entries(player.slots || {})) {
          if (slot.guestCount > 0) {
            slot.guestCount -= npc.guests;
            if (slot.guestCount < 0) slot.guestCount = 0;
            break;
          }
        }
      }
    }

    // Apply resource changes
    player.electric = Math.max(0, player.electric + electricChange);
    player.water = Math.max(0, player.water + waterChange);

    // Add income
    player.money += income;

    // Give +2 generic coins
    player.coins.generic = Math.min(10, player.coins.generic + 2);

    // Advance round/quarter/year
    gameState.round++;
    if (gameState.round > 3) {
      gameState.round = 1;
      gameState.quarter++;
      
      if (gameState.quarter > 4) {
        gameState.quarter = 1;
        gameState.year++;
        
        // Check victory condition (12 rounds = 4 quarters × 3 rounds)
        if (gameState.year > 1) {
          return { gameOver: true, winner: calculateWinner(gameState) };
        }
      }
      
      // Generate new event for new quarter
      gameState.event = generateQuarterEvent(gameState.quarter);
    }

    // Auto-generate NPCs based on season (but not on the very first turn)
    const npcMod = event.npcMod || 1;
    const baseNPCs = 2;
    const npcsToGenerate = Math.floor(baseNPCs * npcMod);
    
    // Don't auto-generate NPCs on the first turn - players should use coins
    if (gameState.round > 1 || gameState.year > 1) {
      for (let i = 0; i < npcsToGenerate; i++) {
        const newNpc = generateGuest(null);
        newNpc.expiresIn = 3;
        gameState.npcs.push(newNpc);
      }
    }

    return {
      income,
      electricChange,
      waterChange,
      gameOver: false
    };
  }

  // Calculate winner based on points
  function calculateWinner(gameState) {
    let bestPlayer = null;
    let bestScore = -1;

    for (const player of gameState.players) {
      const score = calculateScore(player);
      if (score > bestScore) {
        bestScore = score;
        bestPlayer = player;
      }
    }

    return { winner: bestPlayer, score: bestScore };
  }

  // Calculate player score
  function calculateScore(player) {
    let score = player.money;
    
    // Points for NPCs currently staying
    for (const npc of player.npcs) {
      score += npc.income * npc.stayDuration;
    }
    
    // Points for assets
    for (const [tileId, slot] of Object.entries(player.slots || {})) {
      if (slot.assetType) {
        score += (ASSETS[slot.assetType]?.price || 0) / 10;
      }
    }
    
    return Math.floor(score);
  }

  // endTurn handler
  socket.on('endTurn', () => {
    const isSoloGame = soloGame !== null;
    const gameState = isSoloGame ? soloGame.gameState : null;
    const lobby = !isSoloGame ? players.get(socket.id) : null;
    
    if (!isSoloGame && (!lobby || !lobby.lobby)) return;
    
    const game = isSoloGame ? soloGame : lobbies.get(lobby.lobby);
    if (!game || !game.gameState) return;
    
    const playerIndex = isSoloGame ? 0 : game.gameState.players.findIndex(pl => pl.id === players.get(socket.id)?.playerId);
    
    if (playerIndex === -1 || playerIndex !== game.gameState.currentPlayerIndex) return;
    
    const result = processEndTurn(game.gameState, playerIndex, isSoloGame);
    
    if (result.gameOver) {
      if (isSoloGame) {
        socket.emit('gameOver', result.winner);
      } else {
        io.to(lobby.lobby).emit('gameOver', result.winner);
      }
      return;
    }
    
    // Advance to next player
    game.gameState.currentPlayerIndex = (game.gameState.currentPlayerIndex + 1) % game.gameState.players.length;
    
    // Give coins to new current player
    const nextPlayer = game.gameState.players[game.gameState.currentPlayerIndex];
    nextPlayer.coins.generic = Math.min(10, nextPlayer.coins.generic + 2);
    
    if (isSoloGame) {
      socket.emit('turnSummary', {
        income: result.income,
        electricChange: result.electricChange,
        waterChange: result.waterChange,
        gameState: soloGame.gameState
      });
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
    } else {
      io.to(lobby.lobby).emit('turnSummary', {
        income: result.income,
        electricChange: result.electricChange,
        waterChange: result.waterChange
      });
      io.to(lobby.lobby).emit('gameState', game.gameState);
    }
  });

  // Place NPC on tile
  socket.on('placeNPC', ({ npcId, tileId }) => {
    const isSoloGame = soloGame !== null;
    const gameState = isSoloGame ? soloGame.gameState : null;
    
    if (!isSoloGame) {
      const p = players.get(socket.id);
      if (!p) return;
      const lobby = lobbies.get(p.lobby);
      if (!lobby || !lobby.gameState) return;
      if (lobby.gameState.currentPlayerIndex !== lobby.gameState.players.findIndex(pl => pl.id === p.playerId)) return;
      gameState = lobby.gameState;
    }
    
    const playerIndex = 0;
    const player = gameState.players[playerIndex];
    
    const npc = player.npcs.find(n => n.id === npcId);
    if (!npc) {
      socket.emit('error', 'Gast nicht gefunden');
      return;
    }
    
    const slot = player.slots[tileId];
    if (!slot || !slot.assetType) {
      socket.emit('error', 'Feld hat kein Asset');
      return;
    }
    
    const asset = ASSETS[slot.assetType];
    if (!asset || !asset.capacity) {
      socket.emit('error', 'Dieses Asset kann keine Gäste aufnehmen');
      return;
    }
    
    // Check NPC type requirements
    const requirements = NPC_ASSET_REQUIREMENTS[npc.type];
    if (!requirements || !requirements.allowed.includes(slot.assetType)) {
      socket.emit('error', `${npc.type} können hier nicht übernachten`);
      return;
    }
    
    if (npc.guests > asset.capacity) {
      socket.emit('error', 'Nicht genug Kapazität');
      return;
    }
    
    // Check sharing rules
    if (slot.guestCount > 0) {
      const existingGuests = player.npcs.filter(n => n.placed && n.assignedTileId === tileId);
      if (!canShareWithExisting(npc.type, existingGuests)) {
        socket.emit('error', 'Diese Gäste können nicht mit anderen teilen');
        return;
      }
    }
    
    // Check special requirements
    if (npc.special) {
      // Check if player has the required asset anywhere
      const hasSpecialAsset = Object.values(player.slots).some(s => s.assetType === npc.special);
      if (!hasSpecialAsset) {
        socket.emit('error', `Benötigtes Asset nicht vorhanden: ${npc.special}`);
        return;
      }
    }
    
    // Place NPC
    npc.placed = true;
    npc.assignedTileId = tileId;
    npc.assignedAsset = slot.assetType;
    slot.guestCount = (slot.guestCount || 0) + npc.guests;
    
    if (isSoloGame) {
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
    } else {
      const p = players.get(socket.id);
      io.to(p.lobby).emit('gameState', gameState);
    }
  });

  // Upgrade asset handler
  socket.on('upgradeAsset', ({ tileId }) => {
    const isSoloGame = soloGame !== null;
    const gameState = isSoloGame ? soloGame.gameState : null;
    
    if (!isSoloGame) {
      const p = players.get(socket.id);
      if (!p) return;
      const lobby = lobbies.get(p.lobby);
      if (!lobby || !lobby.gameState) return;
      if (lobby.gameState.currentPlayerIndex !== lobby.gameState.players.findIndex(pl => pl.id === p.playerId)) return;
      gameState = lobby.gameState;
    }
    
    const playerIndex = 0;
    const player = gameState.players[playerIndex];
    
    const slot = player.slots[tileId];
    if (!slot || !slot.assetType) {
      socket.emit('error', 'Kein Asset zum Upgraden');
      return;
    }
    
    const currentAsset = ASSETS[slot.assetType];
    if (!currentAsset || !currentAsset.upgradeFrom) {
      socket.emit('error', 'Dieses Asset kann nicht upgegradet werden');
      return;
    }
    
    const upgradePrice = currentAsset.upgradePrice;
    if (player.money < upgradePrice) {
      socket.emit('error', 'Nicht genug Geld');
      return;
    }
    
    // Upgrade
    player.money -= upgradePrice;
    slot.assetType = currentAsset.upgradeFrom;
    const newAsset = ASSETS[slot.assetType];
    slot.capacity = newAsset.capacity;
    
    if (isSoloGame) {
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
    } else {
      const p = players.get(socket.id);
      io.to(p.lobby).emit('gameState', gameState);
    }
  });

  // Remove NPC from placement
  socket.on('removeNPC', ({ npcId }) => {
    const isSoloGame = soloGame !== null;
    const gameState = isSoloGame ? soloGame.gameState : null;
    
    if (!isSoloGame) {
      const p = players.get(socket.id);
      if (!p) return;
      const lobby = lobbies.get(p.lobby);
      if (!lobby || !lobby.gameState) return;
      gameState = lobby.gameState;
    }
    
    const playerIndex = 0;
    const player = gameState.players[playerIndex];
    
    const npc = player.npcs.find(n => n.id === npcId);
    if (!npc || !npc.placed) {
      socket.emit('error', 'Gast nicht gefunden oder nicht platziert');
      return;
    }
    
    // Free up space on the tile
    if (npc.assignedTileId && player.slots[npc.assignedTileId]) {
      player.slots[npc.assignedTileId].guestCount = Math.max(0, (player.slots[npc.assignedTileId].guestCount || 0) - npc.guests);
    }
    
    // Remove NPC
    npc.placed = false;
    npc.assignedTileId = null;
    npc.assignedAsset = null;
    
    if (isSoloGame) {
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
    } else {
      const p = players.get(socket.id);
      io.to(p.lobby).emit('gameState', gameState);
    }
  });

  // Get leaderboard
  socket.on('getLeaderboard', () => {
    const isSoloGame = soloGame !== null;
    const gameState = isSoloGame ? soloGame.gameState : null;
    
    if (!isSoloGame) {
      const p = players.get(socket.id);
      if (!p) return;
      const lobby = lobbies.get(p.lobby);
      if (!lobby || !lobby.gameState) return;
      gameState = lobby.gameState;
    }
    
    const leaderboard = gameState.players.map(player => ({
      name: player.name,
      score: calculateScore(player),
      money: player.money,
      npcs: player.npcs.length,
      slots: Object.keys(player.slots || {}).length
    })).sort((a, b) => b.score - a.score);
    
    socket.emit('leaderboard', leaderboard);
  });

  socket.on('buyAsset', ({ type, tileId }) => {
    // Handle solo game
    if (soloGame) {
      const player = soloGame.gameState.players[0];
      const asset = ASSETS[type];
      
      if (!asset) {
        socket.emit('error', 'Unbekannter Asset-Typ');
        return;
      }
      
      const targetTileId = tileId;
      const slot = player.slots && player.slots[targetTileId];
      
      if (!slot) {
        socket.emit('error', 'Du besitzt dieses Feld nicht');
        return;
      }
      
      if (slot.assetType) {
        socket.emit('error', 'Feld bereits belegt');
        return;
      }
      
      // Check money
      if (player.money < asset.price) {
        socket.emit('error', 'Nicht genug Geld');
        return;
      }
      
      // Buy asset
      player.money -= asset.price;
      player.slots[targetTileId] = { 
        assetType: type, 
        guestCount: 0,
        capacity: asset.capacity || 0
      };
      
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
      return;
    }
    
    // Handle multiplayer game
    const p = players.get(socket.id);
    if (!p) return;
    
    const lobby = lobbies.get(p.lobby);
    if (!lobby || !lobby.gameState) return;
    
    const playerIndex = lobby.gameState.players.findIndex(pl => pl.id === p.playerId);
    if (playerIndex !== lobby.gameState.currentPlayerIndex) return;
    
    const player = lobby.gameState.players[playerIndex];
    const asset = ASSETS[type];
    
    if (!asset) {
      socket.emit('error', 'Unbekannter Asset-Typ');
      return;
    }
    
    // If no tileId provided, find first empty owned tile
    let targetTileId = tileId;
    if (!targetTileId) {
      for (const [tid, slot] of Object.entries(player.slots || {})) {
        if (!slot.assetType) {
          targetTileId = tid;
          break;
        }
      }
    }
    
    if (!targetTileId) {
      socket.emit('error', 'Kein freier Slot verfügbar');
      return;
    }
    
    const slot = player.slots && player.slots[targetTileId];
    if (!slot) {
      socket.emit('error', 'Du besitzt dieses Feld nicht');
      return;
    }
    
    if (slot.assetType) {
      socket.emit('error', 'Feld bereits belegt');
      return;
    }
    
    // Check if player has enough tiles for the asset
    if (!player.slots || Object.keys(player.slots).length < asset.slots) {
      socket.emit('error', 'Nicht genug Felder für dieses Asset');
      return;
    }
    
    // Check money
    if (player.money < asset.price) {
      socket.emit('error', 'Nicht genug Geld');
      return;
    }
    
    // Buy asset - occupy required number of tiles
    player.money -= asset.price;
    
    // Mark the main tile with the asset
    if (!player.slots[targetTileId]) player.slots = {};
    player.slots[targetTileId] = { 
      assetType: type, 
      guestCount: 0,
      capacity: asset.capacity || 0
    };
    
    // Mark additional tiles as occupied by this asset
    if (asset.slots > 1) {
      let marked = 1;
      for (const [tid, s] of Object.entries(player.slots)) {
        if (tid !== targetTileId && !s.assetType && !s.occupiedBy) {
          player.slots[tid] = { ...player.slots[tid], occupiedBy: targetTileId };
          marked++;
          if (marked >= asset.slots) break;
        }
      }
    }
    
    io.to(p.lobby).emit('gameState', lobby.gameState);
  });

  socket.on('moveAsset', ({ fromTileId, toTileId }) => {
    // Handle solo game
    if (soloGame) {
      const player = soloGame.gameState.players[0];
      
      const fromSlot = player.slots && player.slots[fromTileId];
      const toSlot = player.slots && player.slots[toTileId];
      
      if (!fromSlot || !fromSlot.assetType) {
        socket.emit('error', 'Quell-Feld hat kein Asset');
        return;
      }
      
      if (!toSlot || toSlot.assetType) {
        socket.emit('error', 'Ziel-Feld ist nicht leer');
        return;
      }
      
      // Move the asset
      player.slots[toTileId] = { ...fromSlot };
      delete player.slots[fromTileId];
      
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
      return;
    }
    
    // Handle multiplayer game
    const p = players.get(socket.id);
    if (!p) return;
    
    const lobby = lobbies.get(p.lobby);
    if (!lobby || !lobby.gameState) return;
    
    const playerIndex = lobby.gameState.players.findIndex(pl => pl.id === p.playerId);
    if (playerIndex !== lobby.gameState.currentPlayerIndex) return;
    
    const player = lobby.gameState.players[playerIndex];
    
    const fromSlot = player.slots && player.slots[fromTileId];
    const toSlot = player.slots && player.slots[toTileId];
    
    if (!fromSlot || !fromSlot.assetType) {
      socket.emit('error', 'Quell-Feld hat kein Asset');
      return;
    }
    
    if (!toSlot || toSlot.assetType) {
      socket.emit('error', 'Ziel-Feld ist nicht leer');
      return;
    }
    
    // Move the asset
    player.slots[toTileId] = { ...fromSlot };
    delete player.slots[fromTileId];
    
    io.to(p.lobby).emit('gameState', lobby.gameState);
  });

  socket.on('deleteAsset', ({ tileId }) => {
    // Handle solo game
    if (soloGame) {
      const player = soloGame.gameState.players[0];
      
      const slot = player.slots && player.slots[tileId];
      
      if (!slot || !slot.assetType) {
        socket.emit('error', 'Feld hat kein Asset');
        return;
      }
      
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
      
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
      return;
    }
    
    // Handle multiplayer game
    const p = players.get(socket.id);
    if (!p) return;
    
    const lobby = lobbies.get(p.lobby);
    if (!lobby || !lobby.gameState) return;
    
    const playerIndex = lobby.gameState.players.findIndex(pl => pl.id === p.playerId);
    if (playerIndex !== lobby.gameState.currentPlayerIndex) return;
    
    const player = lobby.gameState.players[playerIndex];
    
    const slot = player.slots && player.slots[tileId];
    
    if (!slot || !slot.assetType) {
      socket.emit('error', 'Feld hat kein Asset');
      return;
    }
    
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
    
    io.to(p.lobby).emit('gameState', lobby.gameState);
  });

  // Guest names
  const GUEST_NAMES = [
    'Hans', 'Klaus', 'Wolfgang', 'Gerhard', 'Helmut', 'Werner', ' Manfred', 'Günter',
    'Maria', 'Helga', 'Ursula', 'Lieselotte', 'Gertrud', 'Brigitte', 'Elfriede', 'Hilde',
    'Klaus-Dieter', 'Hans-Jürgen', 'Wulfgang', 'Günter-Helmut', 'Friedrich', 'Erich', 'Walter'
  ];

  const GUEST_TYPES = ['Hippies', 'Familie', 'Snob'];

  function generateGuest(type) {
    const name = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
    const guests = Math.floor(Math.random() * 4) + 1;
    const income = guests * (10 + Math.floor(Math.random() * 20));
    
    return {
      id: generateId(),
      name: name,
      type: type || GUEST_TYPES[Math.floor(Math.random() * GUEST_TYPES.length)],
      guests: guests,
      income: income,
      stayDuration: Math.floor(Math.random() * 3) + 1,
      needs: {
        beds: guests,
        electricity: Math.floor(guests / 2),
        water: Math.floor(guests / 2)
      },
      special: Math.random() > 0.7 ? ['sportsfield', 'campfire', 'sauna', 'stage'][Math.floor(Math.random() * 4)] : null,
      expiresIn: 3
    };
  }

  socket.on('requestGuest', ({ type }) => {
    // Handle solo game
    if (soloGame) {
      const player = soloGame.gameState.players[0];
      const coinType = type || 'generic';
      
      if (player.coins[coinType] <= 0) {
        socket.emit('error', 'Keine Münzen dieses Typs verfügbar');
        return;
      }
      
      player.coins[coinType]--;
      const guest = generateGuest(type === 'generic' ? null : type);
      soloGame.gameState.npcs.push(guest);
      
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
      return;
    }
    
    // Handle multiplayer
    const p = players.get(socket.id);
    if (!p) return;
    
    const lobby = lobbies.get(p.lobby);
    if (!lobby || !lobby.gameState) return;
    
    const playerIndex = lobby.gameState.players.findIndex(pl => pl.id === p.playerId);
    if (playerIndex !== lobby.gameState.currentPlayerIndex) return;
    
    const player = lobby.gameState.players[playerIndex];
    const coinType = type || 'generic';
    
    if (player.coins[coinType] <= 0) {
      socket.emit('error', 'Keine Münzen dieses Typs verfügbar');
      return;
    }
    
    player.coins[coinType]--;
    const guest = generateGuest(type === 'generic' ? null : type);
    lobby.gameState.npcs.push(guest);
    
    io.to(p.lobby).emit('gameState', lobby.gameState);
  });

  socket.on('acceptNPC', ({ npcId }) => {
    // Handle solo game
    if (soloGame) {
      const player = soloGame.gameState.players[0];
      const npcIndex = soloGame.gameState.npcs.findIndex(n => n.id === npcId);
      
      if (npcIndex === -1) {
        socket.emit('error', 'Gast nicht gefunden');
        return;
      }
      
      const npc = soloGame.gameState.npcs[npcIndex];
      soloGame.gameState.npcs.splice(npcIndex, 1);
      npc.accepted = true;
      player.npcs.push(npc);
      
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
      return;
    }
    
    // Handle multiplayer
    const p = players.get(socket.id);
    if (!p) return;
    
    const lobby = lobbies.get(p.lobby);
    if (!lobby || !lobby.gameState) return;
    
    const playerIndex = lobby.gameState.players.findIndex(pl => pl.id === p.playerId);
    if (playerIndex !== lobby.gameState.currentPlayerIndex) return;
    
    const player = lobby.gameState.players[playerIndex];
    const npcIndex = lobby.gameState.npcs.findIndex(n => n.id === npcId);
    
    if (npcIndex === -1) {
      socket.emit('error', 'Gast nicht gefunden');
      return;
    }
    
    const npc = lobby.gameState.npcs[npcIndex];
    lobby.gameState.npcs.splice(npcIndex, 1);
    npc.accepted = true;
    player.npcs.push(npc);
    
    io.to(p.lobby).emit('gameState', lobby.gameState);
  });

  socket.on('runPromotion', ({ type, cost }) => {
    // Handle solo game
    if (soloGame) {
      const player = soloGame.gameState.players[0];
      
      if (player.money < cost) {
        socket.emit('error', 'Nicht genug Geld');
        return;
      }
      
      player.money -= cost;
      player.coins[type] = (player.coins[type] || 0) + 1;
      
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
      return;
    }
    
    // Handle multiplayer
    const p = players.get(socket.id);
    if (!p) return;
    
    const lobby = lobbies.get(p.lobby);
    if (!lobby || !lobby.gameState) return;
    
    const playerIndex = lobby.gameState.players.findIndex(pl => pl.id === p.playerId);
    if (playerIndex !== lobby.gameState.currentPlayerIndex) return;
    
    const player = lobby.gameState.players[playerIndex];
    
    if (player.money < cost) {
      socket.emit('error', 'Nicht genug Geld');
      return;
    }
    
    player.money -= cost;
    player.coins[type] = (player.coins[type] || 0) + 1;
    
    io.to(p.lobby).emit('gameState', lobby.gameState);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const p = players.get(socket.id);
    if (!p) return;
    
    const lobby = lobbies.get(p.lobby);
    if (!lobby) return;
    
    // Remove player from lobby
    const playerIndex = lobby.players.findIndex(pl => pl.id === p.playerId);
    if (playerIndex > -1) {
      lobby.players.splice(playerIndex, 1);
    }
    
    // If no players left, delete lobby
    if (lobby.players.length === 0) {
      lobbies.delete(p.lobby);
    } else {
      io.to(p.lobby).emit('playerJoined', { players: lobby.players });
    }
    
    players.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
