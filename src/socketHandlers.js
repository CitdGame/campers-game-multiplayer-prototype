const {
  createGameState,
  createPlayer,
  generateCode,
  generateNPCsForQuarter,
  generateNPC,
  isHighSeason,
  getEventsForQuarter,
  getEventEffects,
  getAssetByType,
  GAME_CONFIG
} = require('./gameLogic');

const lobbies = new Map();
const players = new Map();

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('createLobby', (playerName) => {
      const code = generateCode();
      const gameState = createGameState();
      
      // Initialize events for Q1 (winter - 1 event)
      gameState.events = getEventsForQuarter(1);
      
      const player = createPlayer(socket.id, playerName, 0);
      gameState.players.push(player);
      
      // Generate initial NPCs with event effects (more at start)
      const eventEffects = getEventEffects(gameState.events);
      const hs = isHighSeason(1);
      const npcMultiplier = eventEffects.npcMultiplier || 1;
      const baseCount = hs ? 3 : 2;
      const initialNpcCount = Math.max(2, Math.round(baseCount * npcMultiplier));
      
      for (let i = 0; i < initialNpcCount; i++) {
        gameState.npcs.push(generateNPC(1, hs, eventEffects));
      }
      
      lobbies.set(code, gameState);
      socket.join(code);
      players.set(socket.id, { code, playerIndex: 0 });
      
      socket.emit('lobbyCreated', { code, player });
      io.to(code).emit('playerJoined', { players: gameState.players });
    });

    socket.on('joinLobby', ({ code, playerName }) => {
      const gameState = lobbies.get(code);
      if (!gameState) {
        socket.emit('error', 'Lobby nicht gefunden');
        return;
      }
      if (gameState.players.length >= GAME_CONFIG.maxPlayers) {
        socket.emit('error', `Lobby ist voll (max. ${GAME_CONFIG.maxPlayers} Spieler)`);
        return;
      }
      if (gameState.phase !== 'lobby') {
        socket.emit('error', 'Spiel bereits gestartet');
        return;
      }
      
      const player = createPlayer(socket.id, playerName, gameState.players.length);
      gameState.players.push(player);
      socket.join(code);
      players.set(socket.id, { code, playerIndex: gameState.players.length - 1 });
      
      socket.emit('lobbyJoined', { code, player, players: gameState.players });
      io.to(code).emit('playerJoined', { players: gameState.players });
    });

    socket.on('startGame', () => {
      const data = players.get(socket.id);
      if (!data) return;
      
      const gameState = lobbies.get(data.code);
      if (!gameState) return;
      if (gameState.players.length < GAME_CONFIG.minPlayers) {
        socket.emit('error', `Mindestens ${GAME_CONFIG.minPlayers} Spieler benötigt`);
        return;
      }
      
      gameState.phase = 'turn';
      io.to(data.code).emit('gameStarted', gameState);
    });

    socket.on('buySpace', () => {
      const data = players.get(socket.id);
      if (!data) return;
      
      const gameState = lobbies.get(data.code);
      if (!gameState) return;
      
      const player = gameState.players[data.playerIndex];
      if (!player) return;
      
      if (gameState.currentPlayerIndex !== data.playerIndex) {
        socket.emit('error', 'Nicht dein Zug');
        return;
      }
      
      if (player.money < GAME_CONFIG.spaceExpansionCost) {
        socket.emit('error', 'Nicht genug Geld');
        return;
      }
      
      player.money -= GAME_CONFIG.spaceExpansionCost;
      player.space += GAME_CONFIG.spaceExpansionAmount;
      
      io.to(data.code).emit('gameStateUpdated', gameState);
    });

    socket.on('buyAsset', (assetType) => {
      const data = players.get(socket.id);
      if (!data) return;
      
      const gameState = lobbies.get(data.code);
      if (!gameState) return;
      
      const player = gameState.players[data.playerIndex];
      if (!player) return;
      
      if (gameState.currentPlayerIndex !== data.playerIndex) {
        socket.emit('error', 'Nicht dein Zug');
        return;
      }
      
      const asset = getAssetByType(assetType);
      if (!asset) {
        socket.emit('error', 'Unbekanntes Asset');
        return;
      }
      
      if (player.money < asset.price) {
        socket.emit('error', 'Nicht genug Geld');
        return;
      }
      
      if (player.space - player.usedSpace < asset.space) {
        socket.emit('error', 'Nicht genug Fläche');
        return;
      }
      
      player.money -= asset.price;
      player.usedSpace += asset.space;
      player.assets.push({ ...asset, id: Math.random().toString(36).substr(2, 9) });
      
      if (asset.produces) {
        if (asset.produces.electricity) player.electricity += asset.produces.electricity;
        if (asset.produces.water) player.water += asset.produces.water;
      }
      
      io.to(data.code).emit('gameStateUpdated', gameState);
    });

    socket.on('acceptNPC', ({ npcId, assetId }) => {
      const data = players.get(socket.id);
      if (!data) return;
      
      const gameState = lobbies.get(data.code);
      if (!gameState) return;
      
      const player = gameState.players[data.playerIndex];
      if (!player) return;
      
      if (gameState.currentPlayerIndex !== data.playerIndex) {
        socket.emit('error', 'Nicht dein Zug');
        return;
      }
      
      const npc = gameState.npcs.find(n => n.id === npcId);
      if (!npc) {
        socket.emit('error', 'NPC nicht gefunden');
        return;
      }
      
      if (npc.accepted) {
        socket.emit('error', 'Bereits angenommen');
        return;
      }
      
      const asset = player.assets.find(a => a.id === assetId);
      if (!asset || asset.type !== 'sleeping') {
        socket.emit('error', 'Ungültiger Schlafplatz');
        return;
      }
      
      const currentOccupied = asset.guests?.length || 0;
      const available = asset.capacity - currentOccupied;
      
      if (available < npc.guests) {
        socket.emit('error', `Nicht genug freie Plätze in ${asset.name} (${available} frei, ${npc.guests} benötigt)`);
        return;
      }
      
      if (player.electricity < npc.needs.electricity) {
        socket.emit('error', 'Nicht genug Strom');
        return;
      }
      
      if (player.water < npc.needs.water) {
        socket.emit('error', 'Nicht genug Wasser');
        return;
      }
      
      for (const need of npc.specialNeeds) {
        const hasAsset = player.assets.some(a => a.satisfies && a.satisfies.includes(need));
        if (!hasAsset) {
          socket.emit('error', `Benötigtes Asset nicht vorhanden: ${need}`);
          return;
        }
      }
      
      player.electricity -= npc.needs.electricity;
      player.water -= npc.needs.water;
      npc.accepted = true;
      npc.assignedTo = player.id;
      npc.assignedAssetId = assetId;
      npc.remainingNights = npc.nights;
      
      if (!asset.guests) asset.guests = [];
      asset.guests.push({
        npcId: npc.id,
        name: npc.name,
        guests: npc.guests,
        remainingNights: npc.nights
      });
      
      player.score += npc.income;
      
      io.to(data.code).emit('gameStateUpdated', gameState);
    });

    socket.on('rejectNPC', (npcId) => {
      const data = players.get(socket.id);
      if (!data) return;
      
      const gameState = lobbies.get(data.code);
      if (!gameState) return;
      
      const player = gameState.players[data.playerIndex];
      if (!player) return;
      
      if (gameState.currentPlayerIndex !== data.playerIndex) {
        socket.emit('error', 'Nicht dein Zug');
        return;
      }
      
      const npc = gameState.npcs.find(n => n.id === npcId);
      if (!npc) return;
      
      npc.rejected = true;
      
      io.to(data.code).emit('gameStateUpdated', gameState);
    });

    socket.on('endTurn', () => {
      const data = players.get(socket.id);
      if (!data) return;
      
      const gameState = lobbies.get(data.code);
      if (!gameState) return;
      
      const player = gameState.players[data.playerIndex];
      if (!player) return;
      
      if (gameState.currentPlayerIndex !== data.playerIndex) {
        socket.emit('error', 'Nicht dein Zug');
        return;
      }
      
      const acceptedNPCs = gameState.npcs.filter(n => n.assignedTo === player.id);
      const roundIncome = acceptedNPCs.reduce((sum, n) => sum + Math.floor(n.income / n.nights), 0);
      player.money += roundIncome;
      
      for (const asset of player.assets) {
        if (asset.type === 'sleeping' && asset.guests) {
          for (const guest of asset.guests) {
            guest.remainingNights--;
          }
          asset.guests = asset.guests.filter(g => g.remainingNights > 0);
        }
      }
      
      const stillStaying = gameState.npcs.filter(n => n.assignedTo === player.id && n.remainingNights > 0);
      for (const npc of stillStaying) {
        player.electricity += npc.needs.electricity;
        player.water += npc.needs.water;
      }
      
      // Generate resources from generators and watertanks each turn
      let electricityGain = 0;
      let waterGain = 0;
      for (const asset of player.assets) {
        if (asset.type === 'resource') {
          if (asset.produces?.electricity) {
            electricityGain += asset.produces.electricity;
          }
          if (asset.produces?.water) {
            waterGain += asset.produces.water;
          }
        }
      }
      
      player.electricity += electricityGain;
      player.water += waterGain;
      
      // Add new NPCs each turn based on season and events
      const hs = isHighSeason(gameState.quarter);
      const events = gameState.events || [];
      const eventEffects = getEventEffects(events);
      const npcMultiplier = eventEffects.npcMultiplier || 1;
      
      // Base: 2 NPCs high season, 1 NPC low season
      // Then apply event multiplier
      let baseCount = hs ? 2 : 1;
      let newNpcCount = Math.max(1, Math.round(baseCount * npcMultiplier));
      
      for (let i = 0; i < newNpcCount; i++) {
        gameState.npcs.push(generateNPC(gameState.quarter, hs, eventEffects));
      }
      gameState.npcs = gameState.npcs.filter(n => n.accepted || n.remainingNights === undefined || n.remainingNights > 0);
      
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      
      if (gameState.currentPlayerIndex === 0) {
        gameState.round++;
        
        if (gameState.round > GAME_CONFIG.roundsPerQuarter) {
          gameState.round = 1;
          gameState.quarter++;
          
          if (gameState.quarter > GAME_CONFIG.quartersPerYear) {
            gameState.quarter = 1;
            gameState.year++;
          }
          
          gameState.events = getEventsForQuarter(gameState.quarter);
          
          io.to(data.code).emit('quarterChanged', {
            quarter: gameState.quarter,
            year: gameState.year,
            events: gameState.events
          });
        }
      }
      
      io.to(data.code).emit('gameStateUpdated', gameState);
    });

    socket.on('disconnect', () => {
      const data = players.get(socket.id);
      if (data) {
        const gameState = lobbies.get(data.code);
        if (gameState) {
          gameState.players = gameState.players.filter(p => p.id !== socket.id);
          
          if (gameState.players.length === 0) {
            lobbies.delete(data.code);
          } else {
            io.to(data.code).emit('playerJoined', { players: gameState.players });
            
            if (data.playerIndex < gameState.currentPlayerIndex) {
              gameState.currentPlayerIndex--;
            }
            if (gameState.currentPlayerIndex >= gameState.players.length) {
              gameState.currentPlayerIndex = 0;
            }
          }
        }
        players.delete(socket.id);
      }
    });
  });
}

module.exports = { setupSocketHandlers, lobbies, players };
