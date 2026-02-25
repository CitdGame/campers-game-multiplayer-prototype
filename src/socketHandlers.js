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

const { GUEST_POINT_TYPES, PROMOTIONS } = require('./gameData');

// Use global to avoid module caching issues
global.gameLobbies = global.gameLobbies || new Map();
global.gamePlayers = global.gamePlayers || new Map();
const lobbies = global.gameLobbies;
const players = global.gamePlayers;

const GLOBAL_LOBBY_ID = global.gameLobbies.has('GLOBAL_ID') ? global.gameLobbies.get('GLOBAL_ID') : Math.random().toString(36).substr(2, 8);
global.gameLobbies.set('GLOBAL_ID', GLOBAL_LOBBY_ID);

let loadCount = 0;
loadCount++;
console.log('socketHandlers.js loaded #', loadCount, 'GLOBAL_LOBBY_ID:', GLOBAL_LOBBY_ID, 'lobbies size:', lobbies.size);

let setupCount = 0;
function setupSocketHandlers(io) {
  setupCount++;
  console.log('setupSocketHandlers called #', setupCount, 'GLOBAL_ID:', GLOBAL_LOBBY_ID, 'size:', lobbies.size);
  
  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id, 'GLOBAL_ID:', GLOBAL_LOBBY_ID, 'lobbies size:', lobbies.size);

    // Solo game handlers
    socket.on('startSolo', (playerName) => {
      console.log('startSolo:', playerName, 'GLOBAL_ID:', GLOBAL_LOBBY_ID, 'size BEFORE:', lobbies.size);
      const code = 'SOLO-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      
      const gameState = createGameState();
      gameState.events = getEventsForQuarter(1);
      gameState.isSolo = true;
      
      const player = createPlayer(socket.id, playerName || 'Du', 0);
      gameState.players.push(player);
      
      lobbies.set(code, gameState);
      console.log('Stored', code, 'Map now:', Array.from(lobbies.keys()));
      socket.join(code);
      players.set(socket.id, { code, playerIndex: 0 });
      
      console.log('Lobbies now:', lobbies.size);
      socket.emit('soloStarted', { gameState });
      io.to(code).emit('gameStarted', gameState);
    });

    // Remove joinSolo - we don't need it anymore
    // socket.on('joinSolo', (code) => {

    // Multiplayer handlers
    socket.on('createLobby', (playerName) => {
      const code = generateCode();
      const gameState = createGameState();
      
      // Initialize events for Q1 (winter - 1 event)
      gameState.events = getEventsForQuarter(1);
      
      const player = createPlayer(socket.id, playerName, 0);
      gameState.players.push(player);
      
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

    socket.on('buySlot', () => {
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
      
      if (player.money < GAME_CONFIG.slotExpansionCost) {
        socket.emit('error', 'Nicht genug Geld');
        return;
      }
      
      player.money -= GAME_CONFIG.slotExpansionCost;
      player.slots += GAME_CONFIG.slotExpansionAmount;
      player.slotArray = [...player.slotArray, ...Array(GAME_CONFIG.slotExpansionAmount).fill(null)];
      
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
      
      // Find free slots
      const freeSlots = player.slotArray.filter(s => s === null).length;
      if (freeSlots < asset.space) {
        socket.emit('error', `Nicht genug freie Slots (${freeSlots} frei, ${asset.space} benötigt)`);
        return;
      }
      
      player.money -= asset.price;
      player.usedSlots += asset.space;
      
      const newAsset = { ...asset, assetType: assetType, id: Math.random().toString(36).substr(2, 9), slotsNeeded: asset.space };
      
      // Fill slots with the asset
      let slotsFilled = 0;
      for (let i = 0; i < player.slotArray.length && slotsFilled < asset.space; i++) {
        if (player.slotArray[i] === null) {
          player.slotArray[i] = newAsset;
          slotsFilled++;
        }
      }
      
      player.assets.push(newAsset);
      
      if (asset.produces) {
        if (asset.produces.electricity) player.electricity += asset.produces.electricity;
        if (asset.produces.water) player.water += asset.produces.water;
      }
      
      io.to(data.code).emit('gameStateUpdated', gameState);
    });

    socket.on('upgradeAsset', (assetId) => {
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
      
      const asset = player.assets.find(a => a.id === assetId);
      if (!asset || !asset.assetType || !['tent', 'glamping', 'caravan', 'bungalow', 'luxurybungalow'].includes(asset.assetType)) {
        socket.emit('error', 'Ungültiges Asset');
        return;
      }
      
      if (asset.guestCount && asset.guestCount > 0) {
        socket.emit('error', 'Asset ist belegt, Upgrade nicht möglich');
        return;
      }
      
      const UPGRADES = { tent: { to: 'glamping', cost: 150 }, bungalow: { to: 'luxurybungalow', cost: 300 } };
      const upgrade = UPGRADES[asset.assetType];
      if (!upgrade) {
        socket.emit('error', 'Dieses Asset kann nicht upgegraded werden');
        return;
      }
      
      if (player.money < upgrade.cost) {
        socket.emit('error', 'Nicht genug Geld');
        return;
      }
      
      const newAsset = getAssetByType(upgrade.to);
      if (!newAsset) {
        socket.emit('error', 'Upgrade-Ziel nicht gefunden');
        return;
      }
      
      const slotDiff = newAsset.space - (asset.slotsNeeded || asset.space);
      const freeSlots = player.slotArray.filter(s => s === null).length;
      if (slotDiff > 0 && freeSlots < slotDiff) {
        socket.emit('error', `Nicht genug freie Slots (${freeSlots} frei, ${slotDiff} zusätzlich benötigt)`);
        return;
      }
      
      player.money -= upgrade.cost;
      player.usedSlots += slotDiff;
      
      // Fill additional slots if needed
      if (slotDiff > 0) {
        asset.slotsNeeded = newAsset.space;
        let slotsFilled = 0;
        for (let i = 0; i < player.slotArray.length && slotsFilled < slotDiff; i++) {
          if (player.slotArray[i] === null) {
            player.slotArray[i] = asset;
            slotsFilled++;
          }
        }
      }
      
      asset.type = newAsset.type;
      asset.assetType = upgrade.to;
      asset.name = newAsset.name;
      asset.capacity = newAsset.capacity;
      asset.space = newAsset.space;
      
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
      if (!asset || !asset.assetType || !['tent', 'glamping', 'caravan', 'bungalow', 'luxurybungalow'].includes(asset.assetType)) {
        socket.emit('error', 'Ungültiger Schlafplatz');
        return;
      }
      
      const currentOccupied = asset.guestCount || 0;
      
      // Check NPC type compatibility for sharing
      if (currentOccupied > 0) {
        // Snobs always stay alone
        if (npc.type === 'Snobs' || asset.guestType === 'Snobs') {
          socket.emit('error', 'Snobs mögen keine Mitbewohner!');
          return;
        }
        // Other types must match
        if (asset.guestType && asset.guestType !== npc.type) {
          socket.emit('error', `Nur ${asset.guestType} können dieses Asset teilen!`);
          return;
        }
      }
      
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
      
      if (!asset.guestCount) {
        asset.guestCount = 0;
        asset.guestType = npc.type;
      }
      asset.guestCount += npc.guests;
      asset.remainingNights = Math.max(asset.remainingNights || 0, npc.nights);
      asset.incomePerNight = (asset.incomePerNight || 0) + (npc.income / npc.nights);
      
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
        if (asset.assetType && ['tent', 'glamping', 'caravan', 'bungalow', 'luxurybungalow'].includes(asset.assetType)) {
          if (asset.remainingNights > 0) {
            asset.remainingNights--;
            if (asset.remainingNights <= 0) {
              asset.guestCount = 0;
              asset.remainingNights = 0;
            }
          }
        }
      }
      
      // Mark NPCs that have completed their stay
      for (const npc of gameState.npcs) {
        if (npc.accepted && npc.remainingNights <= 0) {
          npc.accepted = false;
        }
      }
      
      const stillStaying = gameState.npcs.filter(n => n.assignedTo === player.id && n.remainingNights > 0);
      for (const npc of stillStaying) {
        player.electricity += npc.needs.electricity;
        player.water += npc.needs.water;
      }
      
      // Generate resources from generators and watertanks each turn
      const events = gameState.events || [];
      const eventEffects = getEventEffects(events);
      
      let electricityGain = 0;
      let waterGain = 0;
      for (const asset of player.assets) {
        const isGenerator = asset.assetType === 'generator';
        const isWatertank = asset.assetType === 'watertank';
        if (isGenerator || isWatertank) {
          if (isGenerator && asset.produces?.electricity) {
            const multiplier = eventEffects.electricityMultiplier !== undefined ? eventEffects.electricityMultiplier : 1;
            electricityGain += Math.floor(asset.produces.electricity * multiplier);
          }
          if (isWatertank && asset.produces?.water) {
            const multiplier = eventEffects.waterMultiplier !== undefined ? eventEffects.waterMultiplier : 1;
            waterGain += Math.floor(asset.produces.water * multiplier);
          }
        }
      }
      
      player.electricity += electricityGain;
      player.water += waterGain;
      
      // Give 2 generic coins each turn (players use coins to request guests)
      player.coins.generic = (player.coins.generic || 0) + 2;
      
      // Clean up NPCs that have completed their stay (move them to available pool)
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

    socket.on('requestGuest', (pointType) => {
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
      
      // Validate point type
      const validTypes = ['generic', 'Hippies', 'Families', 'Snobs'];
      if (!validTypes.includes(pointType)) {
        socket.emit('error', 'Ungültiger Münztyp');
        return;
      }
      
      // Check if player has the coin
      if ((player.coins[pointType] || 0) <= 0) {
        socket.emit('error', `Keine ${pointType === 'generic' ? 'generischen' : pointType + '-'}Münzen verfügbar`);
        return;
      }
      
      // Use the coin
      player.coins[pointType]--;
      
      // Generate NPC (forced type unless generic)
      const forcedType = pointType === 'generic' ? null : pointType;
      const hs = isHighSeason(gameState.quarter);
      const npc = generateNPC(gameState.quarter, hs, getEventEffects(gameState.events), forcedType);
      gameState.npcs.push(npc);
      
      io.to(data.code).emit('gameStateUpdated', gameState);
    });

    socket.on('runPromotion', (promotionType) => {
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
      
      const promotion = PROMOTIONS[promotionType];
      if (!promotion) {
        socket.emit('error', 'Ungültige Promotion');
        return;
      }
      
      if (player.money < promotion.cost) {
        socket.emit('error', 'Nicht genug Geld');
        return;
      }
      
      player.money -= promotion.cost;
      player.coins[promotion.type] = (player.coins[promotion.type] || 0) + promotion.yields;
      
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
