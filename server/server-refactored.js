import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Import game modules
import { GameEngine } from './game/GameEngine.js';
import { AssetManager } from './game/AssetManager.js';
import { NPCManager } from './game/NPCManager.js';
import { EventManager } from './game/EventManager.js';
import { UI } from './config/gameConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/landing.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/game.html'));
});

// Game state storage
const lobbies = new Map();
const players = new Map();
let soloGame = null;

// Utility functions
function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Error handling middleware
function handleError(socket, error, context = '') {
  console.error(`Error in ${context}:`, error);
  socket.emit('error', error.message || 'An unexpected error occurred');
}

// Validation middleware
function validatePlayer(socket, callback) {
  const playerData = players.get(socket.id);
  if (!playerData) {
    socket.emit('error', 'Player not found');
    return false;
  }
  return callback(playerData);
}

function validateTurn(socket, gameState, playerId) {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex !== gameState.currentPlayerIndex) {
    socket.emit('error', 'Not your turn');
    return false;
  }
  return playerIndex;
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  let currentLobby = null;
  let playerData = null;

  // Lobby management
  socket.on('createLobby', ({ name }) => {
    try {
      const code = generateCode();
      const player = GameEngine.createPlayer(name);
      player.socketId = socket.id;
      
      const lobby = {
        code: code,
        host: player.id,
        players: [player],
        gameState: null,
        gameStarted: false,
        createdAt: Date.now()
      };
      
      lobbies.set(code, lobby);
      currentLobby = code;
      playerData = player;
      players.set(socket.id, { lobby: code, playerId: player.id });
      
      socket.join(code);
      socket.emit('lobbyCreated', { code, players: lobby.players });
      console.log(`Lobby created: ${code} by ${name}`);
    } catch (error) {
      handleError(socket, error, 'createLobby');
    }
  });

  socket.on('joinLobby', ({ code, name }) => {
    try {
      const lobby = lobbies.get(code.toUpperCase());
      
      if (!lobby) {
        socket.emit('error', 'Lobby nicht gefunden');
        return;
      }
      
      if (lobby.gameStarted) {
        socket.emit('error', 'Spiel bereits gestartet');
        return;
      }
      
      const player = GameEngine.createPlayer(name);
      player.socketId = socket.id;
      lobby.players.push(player);
      
      currentLobby = code;
      playerData = player;
      players.set(socket.id, { lobby: code, playerId: player.id });
      
      socket.join(code);
      io.to(code).emit('playerJoined', { players: lobby.players });
      console.log(`${name} joined lobby ${code}`);
    } catch (error) {
      handleError(socket, error, 'joinLobby');
    }
  });

  // Solo game handling
  socket.on('startSolo', (playerName) => {
    try {
      console.log(`Starting solo game for ${playerName}`);
      
      const player = GameEngine.createPlayer(playerName);
      player.socketId = socket.id;
      
      soloGame = {
        gameState: GameEngine.createGameState([player]),
        currentPlayerIndex: 0
      };
      
      // Give player the starting tile
      const startTileId = "0,0";
      soloGame.gameState.board[startTileId] = 0;
      soloGame.gameState.players[0].slots = { [startTileId]: { assetType: null, guestCount: 0 } };
      
      socket.emit('soloStarted', {
        gameState: soloGame.gameState,
        myPlayerIndex: 0
      });
    } catch (error) {
      handleError(socket, error, 'startSolo');
    }
  });

  // Game actions
  socket.on('buyTile', ({ tileId }) => {
    try {
      // Handle solo game
      if (soloGame) {
        const player = soloGame.gameState.players[0];
        
        // Check if tile is unclaimed
        if (soloGame.gameState.board[tileId] !== undefined) {
          socket.emit('error', 'Feld bereits besetzt');
          return;
        }
        
        // Check adjacency
        if (!checkAdjacent(tileId, 0, soloGame.gameState.board, player.slots)) {
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
        soloGame.gameState.board[tileId] = 0;
        player.slots[tileId] = { assetType: null, guestCount: 0 };
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
        return;
      }
      
      // Handle multiplayer game
      validatePlayer(socket, (p) => {
        const lobby = lobbies.get(p.lobby);
        if (!lobby || !lobby.gameState) return;
        
        const playerIndex = validateTurn(socket, lobby.gameState, p.playerId);
        if (playerIndex === false) return;
        
        const player = lobby.gameState.players[playerIndex];
        
        // Check if tile is unclaimed
        if (lobby.gameState.board[tileId] !== undefined) {
          socket.emit('error', 'Feld bereits besetzt');
          return;
        }
        
        // Check adjacency
        if (!checkAdjacent(tileId, playerIndex, lobby.gameState.board, player.slots)) {
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
        lobby.gameState.board[tileId] = playerIndex;
        player.slots[tileId] = { assetType: null, guestCount: 0 };
        
        io.to(p.lobby).emit('gameState', lobby.gameState);
      });
    } catch (error) {
      handleError(socket, error, 'buyTile');
    }
  });

  socket.on('buyAsset', ({ type, tileId }) => {
    try {
      // Handle solo game
      if (soloGame) {
        const player = soloGame.gameState.players[0];
        const result = AssetManager.placeAsset(player, tileId, type);
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
        return;
      }
      
      // Handle multiplayer game
      validatePlayer(socket, (p) => {
        const lobby = lobbies.get(p.lobby);
        if (!lobby || !lobby.gameState) return;
        
        const playerIndex = validateTurn(socket, lobby.gameState, p.playerId);
        if (playerIndex === false) return;
        
        const player = lobby.gameState.players[playerIndex];
        const result = AssetManager.placeAsset(player, tileId, type);
        
        io.to(p.lobby).emit('gameState', lobby.gameState);
      });
    } catch (error) {
      handleError(socket, error, 'buyAsset');
    }
  });

  socket.on('upgradeAsset', ({ tileId }) => {
    try {
      // Handle solo game
      if (soloGame) {
        const player = soloGame.gameState.players[0];
        const result = AssetManager.upgradeAsset(player, tileId);
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
        return;
      }
      
      // Handle multiplayer game
      validatePlayer(socket, (p) => {
        const lobby = lobbies.get(p.lobby);
        if (!lobby || !lobby.gameState) return;
        
        const playerIndex = validateTurn(socket, lobby.gameState, p.playerId);
        if (playerIndex === false) return;
        
        const player = lobby.gameState.players[playerIndex];
        const result = AssetManager.upgradeAsset(player, tileId);
        
        io.to(p.lobby).emit('gameState', lobby.gameState);
      });
    } catch (error) {
      handleError(socket, error, 'upgradeAsset');
    }
  });

  socket.on('moveAsset', ({ fromTileId, toTileId }) => {
    try {
      // Handle solo game
      if (soloGame) {
        const player = soloGame.gameState.players[0];
        const result = AssetManager.moveAsset(player, fromTileId, toTileId);
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
        return;
      }
      
      // Handle multiplayer game
      validatePlayer(socket, (p) => {
        const lobby = lobbies.get(p.lobby);
        if (!lobby || !lobby.gameState) return;
        
        const playerIndex = validateTurn(socket, lobby.gameState, p.playerId);
        if (playerIndex === false) return;
        
        const player = lobby.gameState.players[playerIndex];
        const result = AssetManager.moveAsset(player, fromTileId, toTileId);
        
        io.to(p.lobby).emit('gameState', lobby.gameState);
      });
    } catch (error) {
      handleError(socket, error, 'moveAsset');
    }
  });

  socket.on('deleteAsset', ({ tileId }) => {
    try {
      // Handle solo game
      if (soloGame) {
        const player = soloGame.gameState.players[0];
        const result = AssetManager.removeAsset(player, tileId);
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
        return;
      }
      
      // Handle multiplayer game
      validatePlayer(socket, (p) => {
        const lobby = lobbies.get(p.lobby);
        if (!lobby || !lobby.gameState) return;
        
        const playerIndex = validateTurn(socket, lobby.gameState, p.playerId);
        if (playerIndex === false) return;
        
        const player = lobby.gameState.players[playerIndex];
        const result = AssetManager.removeAsset(player, tileId);
        
        io.to(p.lobby).emit('gameState', lobby.gameState);
      });
    } catch (error) {
      handleError(socket, error, 'deleteAsset');
    }
  });

  socket.on('placeNPC', ({ npcId, tileId }) => {
    try {
      // Handle solo game
      if (soloGame) {
        const player = soloGame.gameState.players[0];
        const result = NPCManager.placeNPC(player, npcId, tileId);
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
        return;
      }
      
      // Handle multiplayer game
      validatePlayer(socket, (p) => {
        const lobby = lobbies.get(p.lobby);
        if (!lobby || !lobby.gameState) return;
        
        const playerIndex = validateTurn(socket, lobby.gameState, p.playerId);
        if (playerIndex === false) return;
        
        const player = lobby.gameState.players[playerIndex];
        const result = NPCManager.placeNPC(player, npcId, tileId);
        
        io.to(p.lobby).emit('gameState', lobby.gameState);
      });
    } catch (error) {
      handleError(socket, error, 'placeNPC');
    }
  });

  socket.on('removeNPC', ({ npcId }) => {
    try {
      // Handle solo game
      if (soloGame) {
        const player = soloGame.gameState.players[0];
        const result = NPCManager.removeNPC(player, npcId);
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
        return;
      }
      
      // Handle multiplayer game
      validatePlayer(socket, (p) => {
        const lobby = lobbies.get(p.lobby);
        if (!lobby || !lobby.gameState) return;
        
        const playerIndex = validateTurn(socket, lobby.gameState, p.playerId);
        if (playerIndex === false) return;
        
        const player = lobby.gameState.players[playerIndex];
        const result = NPCManager.removeNPC(player, npcId);
        
        io.to(p.lobby).emit('gameState', lobby.gameState);
      });
    } catch (error) {
      handleError(socket, error, 'removeNPC');
    }
  });

  socket.on('requestGuest', ({ coinType }) => {
    try {
      // Handle solo game
      if (soloGame) {
        const player = soloGame.gameState.players[0];
        const guest = GameEngine.requestGuest(player, coinType);
        soloGame.gameState.npcs.push(guest);
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
        return;
      }
      
      // Handle multiplayer game
      validatePlayer(socket, (p) => {
        const lobby = lobbies.get(p.lobby);
        if (!lobby || !lobby.gameState) return;
        
        const playerIndex = validateTurn(socket, lobby.gameState, p.playerId);
        if (playerIndex === false) return;
        
        const player = lobby.gameState.players[playerIndex];
        const guest = GameEngine.requestGuest(player, coinType);
        lobby.gameState.npcs.push(guest);
        
        io.to(p.lobby).emit('gameState', lobby.gameState);
      });
    } catch (error) {
      handleError(socket, error, 'requestGuest');
    }
  });

  socket.on('runPromotion', ({ promotionType }) => {
    try {
      // Handle solo game
      if (soloGame) {
        const player = soloGame.gameState.players[0];
        const result = GameEngine.runPromotion(player, promotionType);
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
        return;
      }
      
      // Handle multiplayer game
      validatePlayer(socket, (p) => {
        const lobby = lobbies.get(p.lobby);
        if (!lobby || !lobby.gameState) return;
        
        const playerIndex = validateTurn(socket, lobby.gameState, p.playerId);
        if (playerIndex === false) return;
        
        const player = lobby.gameState.players[playerIndex];
        const result = GameEngine.runPromotion(player, promotionType);
        
        io.to(p.lobby).emit('gameState', lobby.gameState);
      });
    } catch (error) {
      handleError(socket, error, 'runPromotion');
    }
  });

  socket.on('endTurn', () => {
    try {
      const isSoloGame = soloGame !== null;
      const gameState = isSoloGame ? soloGame.gameState : null;
      const lobby = !isSoloGame ? players.get(socket.id) : null;
      
      if (!isSoloGame && (!lobby || !lobby.lobby)) return;
      
      const game = isSoloGame ? soloGame : lobbies.get(lobby.lobby);
      if (!game || !game.gameState) return;
      
      const playerIndex = isSoloGame ? 0 : game.gameState.players.findIndex(pl => pl.id === players.get(socket.id)?.playerId);
      
      if (playerIndex === -1 || playerIndex !== game.gameState.currentPlayerIndex) return;
      
      const result = GameEngine.processEndTurn(game.gameState, playerIndex, isSoloGame);
      
      if (result.gameOver) {
        if (isSoloGame) {
          socket.emit('gameOver', result.winner);
        } else {
          io.to(lobby.lobby).emit('gameOver', result.winner);
        }
        return;
      }
      
      // Advance to next player
      game.gameState.currentPlayerIndex = GameEngine.getNextPlayerIndex(game.gameState);
      
      // Give coins to new current player
      const nextPlayer = GameEngine.getCurrentPlayer(game.gameState);
      GameEngine.giveCoins(nextPlayer);
      
      if (isSoloGame) {
        socket.emit('turnSummary', {
          income: result.income,
          electricChange: result.electricChange,
          waterChange: result.waterChange,
          expiredNPCs: result.expiredNPCs,
          newEvent: result.newEvent
        });
        
        socket.emit('soloStarted', {
          gameState: soloGame.gameState,
          myPlayerIndex: 0
        });
      } else {
        io.to(lobby.lobby).emit('turnSummary', result);
        io.to(lobby.lobby).emit('gameState', lobby.gameState);
      }
    } catch (error) {
      handleError(socket, error, 'endTurn');
    }
  });

  // Utility functions
  function checkAdjacent(tileId, playerIndex, board, playerSlots) {
    const [q, r] = tileId.split(',').map(Number);
    const neighbors = [
      [q+1, r], [q-1, r], [q, r+1], [q, r-1], [q+1, r-1], [q-1, r+1]
    ];
    
    let isAdjacent = false;
    for (const [nq, nr] of neighbors) {
      const neighborId = `${nq},${nr}`;
      if (playerSlots && playerSlots[neighborId]) {
        isAdjacent = true;
        break;
      }
    }
    
    return isAdjacent || Object.keys(playerSlots || {}).length === 0;
  }

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const playerData = players.get(socket.id);
    if (playerData && playerData.lobby) {
      const lobby = lobbies.get(playerData.lobby);
      if (lobby) {
        // Remove player from lobby
        lobby.players = lobby.players.filter(p => p.socketId !== socket.id);
        
        // Notify other players
        io.to(playerData.lobby).emit('playerLeft', { players: lobby.players });
        
        // Clean up empty lobby
        if (lobby.players.length === 0) {
          lobbies.delete(playerData.lobby);
        }
      }
    }
    
    players.delete(socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Campers server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to play`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
