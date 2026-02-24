const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

const lobbies = new Map();
const players = new Map();

const NPC_NAMES = {
  Hippies: ['Luna', 'Sticky', 'Mellow', 'Sunny', 'Breeze', 'River', 'Pine', 'Cloud'],
  Families: ['Familie Müller', 'Familie Schmidt', 'Familie Weber', 'Familie Fischer', 'Familie Becker', 'Familie Meyer'],
  Snobs: ['Graf von Luxus', 'Baronessin', 'Herzogin', 'Fürst', 'Gräfin', 'Herr von Obersee']
};

const NPC_TYPES = ['Hippies', 'Families', 'Snobs'];

const ASSETS = {
  tent: { name: 'Zelt', price: 50, space: 1, type: 'sleeping', capacity: 2 },
  caravan: { name: 'Wohnwagen', price: 150, space: 2, type: 'sleeping', capacity: 4 },
  bungalow: { name: 'Bungalow', price: 300, space: 3, type: 'sleeping', capacity: 6 },
  generator: { name: 'Stromgenerator', price: 200, space: 2, type: 'resource', produces: { electricity: 5 } },
  watertank: { name: 'Wassertank', price: 150, space: 2, type: 'resource', produces: { water: 5 } },
  sportsfield: { name: 'Sportplatz', price: 250, space: 3, type: 'special', satisfies: ['Sports'] }
};

function generateNPC(quarter, isHighSeason, event = null) {
  const type = NPC_TYPES[Math.floor(Math.random() * NPC_TYPES.length)];
  const names = NPC_NAMES[type];
  const name = names[Math.floor(Math.random() * names.length)];
  
  let baseGuests = type === 'Hippies' ? 2 : type === 'Families' ? 4 : 2;
  if (event === 'festival') {
    baseGuests = Math.floor(baseGuests * 1.5);
  }
  const guests = baseGuests + Math.floor(Math.random() * 3);
  
  const nights = Math.floor(Math.random() * 3) + 1;
  
  let baseIncome = type === 'Hippies' ? 30 : type === 'Families' ? 80 : 120;
  if (event === 'festival') {
    baseIncome = Math.floor(baseIncome * 1.5);
  }
  const income = baseIncome * nights * guests;
  
  let electricity = guests * (type === 'Snobs' ? 3 : 1);
  let water = guests * (type === 'Families' ? 2 : 1);
  
  if (event === 'heatwave') {
    water = Math.floor(water * 1.5);
  }
  
  let specialNeeds = [];
  if (type === 'Families' && Math.random() < 0.3) {
    specialNeeds.push('Sports');
  }
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    type,
    guests,
    nights,
    income,
    needs: {
      electricity,
      water,
      sleepingSpots: guests
    },
    specialNeeds,
    quarter,
    accepted: false
  };
}

function createGameState() {
  return {
    quarter: 1,
    round: 1,
    year: 1,
    totalRounds: 12,
    players: [],
    npcs: [],
    currentPlayerIndex: 0,
    phase: 'lobby',
    event: null,
    turnAction: null
  };
}

function generateNPCsForQuarter(quarter, isHighSeason, event = null) {
  const count = isHighSeason ? 4 : 2;
  let npcs = [];
  for (let i = 0; i < count; i++) {
    npcs.push(generateNPC(quarter, isHighSeason, event));
  }
  return npcs;
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('createLobby', (playerName) => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const gameState = createGameState();
    
    const player = {
      id: socket.id,
      name: playerName || `Spieler ${gameState.players.length + 1}`,
      money: 500,
      space: 10,
      usedSpace: 0,
      electricity: 5,
      water: 5,
      assets: [],
      score: 0
    };
    
    gameState.players.push(player);
    gameState.npcs = generateNPCsForQuarter(1, true);
    
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
    if (gameState.players.length >= 6) {
      socket.emit('error', 'Lobby ist voll');
      return;
    }
    if (gameState.phase !== 'lobby') {
      socket.emit('error', 'Spiel bereits gestartet');
      return;
    }
    
    const player = {
      id: socket.id,
      name: playerName || `Spieler ${gameState.players.length + 1}`,
      money: 500,
      space: 10,
      usedSpace: 0,
      electricity: 5,
      water: 5,
      assets: [],
      score: 0
    };
    
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
    if (gameState.players.length < 2) {
      socket.emit('error', 'Mindestens 2 Spieler benötigt');
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
    
    const cost = 100;
    if (player.money < cost) {
      socket.emit('error', 'Nicht genug Geld');
      return;
    }
    
    player.money -= cost;
    player.space += 5;
    
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
    
    const asset = ASSETS[assetType];
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
      if (npc.remainingNights > 0) {
        player.electricity += npc.needs.electricity;
        player.water += npc.needs.water;
      }
    }
    
    player.electricity = Math.min(player.electricity + 2, player.assets.filter(a => a.type === 'resource').reduce((sum, a) => sum + (a.produces?.electricity || 0), 2));
    player.water = Math.min(player.water + 2, player.assets.filter(a => a.type === 'resource').reduce((sum, a) => sum + (a.produces?.water || 0), 2));
    
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    
    if (gameState.currentPlayerIndex === 0) {
      gameState.round++;
      
      const isHighSeason = gameState.quarter <= 2;
      const eventMultiplier = gameState.event === 'rain' ? 0.5 : gameState.event === 'festival' ? 1.5 : 1;
      
      const newNpcCount = isHighSeason ? Math.floor(2 * eventMultiplier) + 1 : Math.floor(1 * eventMultiplier) + 1;
      for (let i = 0; i < newNpcCount; i++) {
        gameState.npcs.push(generateNPC(gameState.quarter, isHighSeason, gameState.event));
      }
      gameState.npcs = gameState.npcs.filter(n => n.accepted || n.remainingNights === undefined || n.remainingNights > 0);
      
      if (gameState.round > 3) {
        gameState.round = 1;
        gameState.quarter++;
        
        if (gameState.quarter > 4) {
          gameState.quarter = 1;
          gameState.year++;
        }
        
        const events = [null, 'rain', 'festival', 'heatwave'];
        const eventRoll = Math.random();
        if (eventRoll < 0.2) {
          gameState.event = 'rain';
        } else if (eventRoll < 0.35) {
          gameState.event = 'festival';
        } else if (eventRoll < 0.45) {
          gameState.event = 'heatwave';
        } else {
          gameState.event = null;
        }
        
        io.to(data.code).emit('quarterChanged', { 
          quarter: gameState.quarter, 
          year: gameState.year,
          event: gameState.event
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
