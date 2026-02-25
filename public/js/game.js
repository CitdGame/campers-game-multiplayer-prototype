const socket = io();

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err);
  showError('Verbindungsfehler: ' + err.message);
});

socket.on('error', (msg) => {
  showError(msg);
});

let myPlayerIndex = 0;
let gameState = null;
let lobbyCode = '';
let isSolo = false;

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('solo') === 'true') {
  isSolo = true;
  
  // Hide multiplayer panels
  document.getElementById('landingPage').style.display = 'none';
  
  // Start solo game after socket connects
  socket.on('connect', () => {
    const playerName = localStorage.getItem('soloPlayerName') || 'Spieler';
    socket.emit('startSolo', playerName);
  });
}

socket.on('soloStarted', (data) => {
  myPlayerIndex = 0;
  gameState = data.gameState;
  document.getElementById('gamePage').style.display = 'block';
  updateGameUI();
});

const playerIcons = ['🏕️','🎒','🌲','🔥','🎣','⛺','🌻','🏔️'];

function renderPlayerSlots(players) {
  const container = document.getElementById('playerSlots');
  container.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const filled = i < players.length;
    const div = document.createElement('div');
    div.className = `slot ${filled ? 'filled' : ''}`;
    div.innerHTML = filled ? `<b>${playerIcons[i]}</b><br>${players[i].name}` : 'Wartet…';
    container.appendChild(div);
  }
  
  const status = document.getElementById('lobbyStatus');
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    if (players.length < 2) {
      status.textContent = `Warte auf Spieler… (${players.length}/8) – mind. 2 benötigt`;
      startBtn.disabled = true;
    } else {
      status.textContent = `${players.length} Spieler bereit – Du kannst starten!`;
      startBtn.disabled = false;
    }
  }
}

function showError(msg) {
  document.getElementById('errorMsg').textContent = msg;
  document.getElementById('errorModal').classList.add('active');
}

function closeError() {
  document.getElementById('errorModal').classList.remove('active');
}

function createLobby() {
  const name = document.getElementById('playerName').value.trim() || 'Spieler';
  socket.emit('createLobby', name);
}

function joinLobby() {
  const name = document.getElementById('playerName').value.trim() || 'Spieler';
  const code = document.getElementById('joinCode').value.trim().toUpperCase();
  if (code.length < 4) {
    showError('Bitte gib einen gültigen Code ein!');
    return;
  }
  socket.emit('joinLobby', { code, playerName: name });
}

socket.on('lobbyCreated', (data) => {
  lobbyCode = data.code;
  myPlayerIndex = 0;
  document.getElementById('lobbyCode').textContent = lobbyCode;
  document.getElementById('landingPage').style.display = 'none';
  document.getElementById('lobbyPage').style.display = 'block';
  renderPlayerSlots(data.players);
});

socket.on('lobbyJoined', (data) => {
  lobbyCode = data.code;
  myPlayerIndex = data.players.length - 1;
  document.getElementById('lobbyCode').textContent = lobbyCode;
  document.getElementById('landingPage').style.display = 'none';
  document.getElementById('lobbyPage').style.display = 'block';
  renderPlayerSlots(data.players);
});

socket.on('playerJoined', (data) => {
  renderPlayerSlots(data.players);
  if (gameState) {
    updateGameState(data);
  }
});

socket.on('error', (msg) => {
  showError(msg);
});

function startGame() {
  socket.emit('startGame');
}

function copyCode() {
  navigator.clipboard.writeText(lobbyCode);
  alert('Code kopiert!');
}

socket.on('gameStarted', (state) => {
  gameState = state;
  document.getElementById('lobbyPage').style.display = 'none';
  document.getElementById('gamePage').style.display = 'block';
  updateGameUI();
});

socket.on('gameStateUpdated', (state) => {
  const prevQuarter = gameState ? gameState.quarter : 0;
  const prevRound = gameState ? gameState.round : 0;
  gameState = state;
  updateGameUI();
  
  if (state.round === 1 && (prevQuarter !== state.quarter || prevRound !== state.round)) {
    if (state.npcs.length > 0) {
      showError(`Neues Quartal ${state.quarter}! ${state.npcs.length} Gäste warten.`);
    }
  }
});

socket.on('quarterChanged', (data) => {
  const events = data.events || [];
  const EVENT_NAMES = {
    rain: 'Regen', storm: 'Sturm', heatwave: 'Hitzewelle', cold: 'Kälte', drought: 'Dürre',
    tourism_boom: 'Tourismus-Boom', recession: 'Rezession', luxury_trend: 'Luxus-Trend', minimalism_trend: 'Minimalismus',
    festival: 'Festival', sports_event: 'Sport-Event', fishing_competition: 'Angelwettbewerb', music_week: 'Musik-Woche',
    influencer_hype: 'Influencer', online_storm: 'Online-Storm', award: 'Auszeichnung', wildlife: 'Wildtiere'
  };
  const EVENT_ICONS = {
    rain: '🌧️', storm: '⛈️', heatwave: '🔥', cold: '❄️', drought: '🏜️',
    tourism_boom: '📈', recession: '📉', luxury_trend: '💎', minimalism_trend: '📦',
    festival: '🎉', sports_event: '🏆', fishing_competition: '🎣', music_week: '🎵',
    influencer_hype: '📱', online_storm: '💬', award: '🏅', wildlife: '🦌'
  };
  
  let eventMsg = '';
  if (events.length > 0) {
    eventMsg = events.map(e => `${EVENT_ICONS[e] || ''} ${EVENT_NAMES[e] || e}`).join(', ');
  }
  
  if (eventMsg) {
    showError(`Quartal ${data.quarter} beginnt mit: ${eventMsg}`);
  } else {
    showError(`Quartal ${data.quarter} beginnt!`);
  }
});

function updateGameUI() {
  document.getElementById('yearVal').textContent = gameState.year;
  document.getElementById('quarterVal').textContent = gameState.quarter;
  document.getElementById('roundVal').textContent = gameState.round;
  
  const isHighSeason = gameState.quarter === 2 || gameState.quarter === 3;
  document.getElementById('seasonVal').textContent = isHighSeason ? 'Haupt' : 'Neben';
  
  // Update seasonal background
  const scene = document.querySelector('.scene');
  const seasonClasses = { 1: 'winter', 2: 'spring', 3: 'summer', 4: 'autumn' };
  scene.className = 'scene ' + (seasonClasses[gameState.quarter] || 'spring');
  
  const eventBanner = document.getElementById('eventBanner');
  const events = gameState.events || [];
  
  const EVENT_LABELS = {
    rain: { text: '🌧️ DAUERREGEN – Weniger Gäste!', class: 'rain' },
    storm: { text: '⛈️ STURMWARNUNG – Keine Zelte!', class: 'rain' },
    heatwave: { text: '🔥 HITZEWELLE – Mehr Wasserbedarf!', class: 'heatwave' },
    drought: { text: '🏜️ DÜRRE – Kein Wasser!', class: 'rain' },
    blackout: { text: '⚡ BLACKOUT – Kein Strom!', class: 'rain' },
    tourism_boom: { text: '📈 TOURISMUS-BOOM – Mehr Gäste!', class: 'festival' },
    festival: { text: '🎉 FESTIVAL – Zelte bevorzugt!', class: 'festival' }
  };
  
  if (events.length > 0) {
    const eventTexts = events.map(e => EVENT_LABELS[e]?.text || e).join(' | ');
    const eventClass = events.map(e => EVENT_LABELS[e]?.class || '').find(c => c) || '';
    eventBanner.textContent = eventTexts;
    eventBanner.className = `event-banner ${eventClass}`;
    eventBanner.style.display = 'block';
  } else {
    eventBanner.style.display = 'none';
  }
  
  const player = gameState.players[myPlayerIndex];
  document.getElementById('moneyVal').textContent = player.money;
  document.getElementById('electricVal').textContent = player.electricity;
  document.getElementById('waterVal').textContent = player.water;
  
  // Update coin counts
  const coins = player.coins || { generic: 0, Hippies: 0, Families: 0, Snobs: 0 };
  document.getElementById('coinGeneric').textContent = coins.generic || 0;
  document.getElementById('coinHippies').textContent = coins.Hippies || 0;
  document.getElementById('coinFamilies').textContent = coins.Families || 0;
  document.getElementById('coinSnobs').textContent = coins.Snobs || 0;
  
  renderPlayerList();
  renderNPCList();
  renderSlots();
  updateTurnIndicator();
  
  document.getElementById('buySlotBtn').disabled = player.money < 100;
  
  if (gameState.year > 1 || gameState.quarter > 4 || (gameState.quarter === 4 && gameState.round > 3)) {
    showGameOver();
  }
}

function renderPlayerList() {
  const container = document.getElementById('playerList');
  container.innerHTML = gameState.players.map((p, i) => `
    <div class="player-card ${i === gameState.currentPlayerIndex ? 'active' : ''}" onclick="showPlayerDetails(${i})" style="cursor:pointer;">
      <div class="icon">${playerIcons[i]}</div>
      <div class="name">${p.name}</div>
      <div class="score">${p.score} Pkt</div>
    </div>
  `).join('');
}

function showPlayerDetails(playerIndex) {
  const p = gameState.players[playerIndex];
  if (!p) return;
  
  const isMe = playerIndex === myPlayerIndex;
  const isActive = playerIndex === gameState.currentPlayerIndex;
  const ASSET_NAMES = { tent: 'Zelt', glamping: 'Glamping', caravan: 'Caravan', bungalow: 'Bungalow', luxurybungalow: 'Luxus-Bungalow', generator: 'Generator', watertank: 'Wassertank', sportsfield: 'Sportplatz', campfire: 'Lagerfeuer', sauna: 'Sauna', stage: 'Bühne' };
  const ASSET_ICONS = { tent: '⛺', glamping: '🏕️', caravan: '🚐', bungalow: '🏠', luxurybungalow: '🏰', generator: '⚡', watertank: '💧', sportsfield: '⚽', campfire: '🔥', sauna: '🧖', stage: '🎭' };
  
  const slotArray = p.slotArray || [];
  const occupiedSlots = slotArray.filter(s => s !== null).length;
  const totalSlots = slotArray.length;
  
  // Group assets by type
  const assetCounts = {};
  const assetList = [];
  const seen = new Set();
  for (const slot of slotArray) {
    if (slot && !seen.has(slot.id)) {
      seen.add(slot.id);
      assetList.push(slot);
    }
  }
  
  let html = `<div style="font-size:14px;">
    <div style="margin-bottom:12px;">
      <span style="font-size:24px;">${playerIcons[playerIndex]}</span>
      <b>${p.name}</b>${isMe ? ' (Du)' : ''}${isActive ? ' ⏳' : ''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
      <div style="background:#f5f5f5;padding:8px;border-radius:6px;">💰 <b>${p.money}€</b></div>
      <div style="background:#f5f5f5;padding:8px;border-radius:6px;">🏆 <b>${p.score} Pkt</b></div>
    </div>
    <div style="background:#f5f5f5;padding:8px;border-radius:6px;margin-bottom:12px;">
      🎪 Slots: ${occupiedSlots}/${totalSlots}
    </div>
    <div style="font-weight:700;margin-bottom:8px;">🏕️ Campingplatz:</div>`;
  
  if (assetList.length === 0) {
    html += '<div style="color:#888;font-style:italic;">Leerer Platz</div>';
  } else {
    for (const asset of assetList) {
      const icon = ASSET_ICONS[asset.assetType] || '📦';
      const name = ASSET_NAMES[asset.assetType] || asset.name;
      const occupied = asset.guestCount > 0 ? ` (${asset.guestCount} Gäste)` : '';
      html += `<div style="padding:6px;margin-bottom:4px;background:#fff;border-radius:4px;">
        ${icon} ${name}${occupied}
      </div>`;
    }
  }
  
  html += '</div>';
  
  document.getElementById('playerDetailsTitle').innerHTML = `${playerIcons[playerIndex]} ${p.name}`;
  document.getElementById('playerDetailsContent').innerHTML = html;
  document.getElementById('playerDetailsModal').style.display = 'flex';
}

function renderSlots() {
  const container = document.getElementById('slotsGrid');
  const player = gameState.players[myPlayerIndex];
  const slotArray = player.slotArray || [];
  const isMyTurn = gameState.currentPlayerIndex === myPlayerIndex;
  
  const ASSET_ICONS = { tent: '⛺', glamping: '🏕️', caravan: '🚐', bungalow: '🏠', luxurybungalow: '🏰', generator: '⚡', watertank: '💧', sportsfield: '⚽', campfire: '🔥', sauna: '🧖', stage: '🎭' };
  const SLEEPING_TYPES = ['tent', 'glamping', 'caravan', 'bungalow', 'luxurybungalow'];
  const UPGRADES = { tent: { to: 'glamping', cost: 150 }, bungalow: { to: 'luxurybungalow', cost: 300 } };
  
  // Group consecutive slots by asset
  const groups = [];
  let currentGroup = null;
  
  for (let i = 0; i < slotArray.length; i++) {
    const slot = slotArray[i];
    if (slot === null) {
      if (currentGroup) {
        groups.push(currentGroup);
        currentGroup = null;
      }
      groups.push({ type: 'empty', indices: [i] });
    } else {
      if (currentGroup && currentGroup.assetId === slot.id) {
        currentGroup.indices.push(i);
      } else {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = { type: 'asset', asset: slot, indices: [i], assetId: slot.id };
      }
    }
  }
  if (currentGroup) {
    groups.push(currentGroup);
  }
  
  container.innerHTML = groups.map(group => {
    if (group.type === 'empty') {
      return `<div class="slot empty" data-index="${group.indices[0]}" style="width:50px;height:50px;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;background:#f9f9f9;border-radius:8px;">⬜</div>`;
    }
    const slot = group.asset;
    const icon = ASSET_ICONS[slot.assetType] || '📦';
    const size = group.indices.length;
    const width = 50 + (size - 1) * 54;
    const isSleeping = SLEEPING_TYPES.includes(slot.assetType);
    const isOccupied = slot.guestCount > 0;
    const upgrade = UPGRADES[slot.assetType];
    const canUpgrade = upgrade && !isOccupied && isMyTurn && player.money >= upgrade.cost;
    
    let extraInfo = '';
    let slotHeight = 50;
    if (isSleeping && isOccupied) {
      extraInfo = `<div style="font-size:10px;background:#ffeaa7;padding:2px 4px;border-radius:4px;margin-top:4px;">👥${slot.guestCount}/${slot.capacity} (${slot.remainingNights}N)</div>`;
      slotHeight = 65;
    }
    
    let upgradeBtn = '';
    if (canUpgrade) {
      const upgradeName = slot.assetType === 'tent' ? 'Glamping' : 'Luxus';
      const currentSlots = slot.slotsNeeded || slot.space;
      const newSlots = slot.assetType === 'tent' ? 2 : 4;
      const extraSlots = newSlots - currentSlots;
      const slotText = extraSlots > 0 ? `+${extraSlots} Slots` : 'gleiche Slots';
      upgradeBtn = `<button class="btn btn-orange" style="font-size:8px;padding:2px 4px;margin-top:2px;" onclick="event.stopPropagation();upgradeAsset('${slot.id}')" title="${upgradeName} - ${upgrade.cost}€ - ${slotText}">⬆️ ${upgrade.cost}€</button>`;
      slotHeight = 65;
    }
    
    return `<div class="slot occupied" data-index="${group.indices[0]}" style="width:${width}px;height:${slotHeight}px;border:2px solid var(--green-mid);display:flex;flex-direction:column;align-items:center;justify-content:center;background:${isOccupied ? '#ffeaa7' : '#e8f5e9'};border-radius:8px;font-size:24px;position:relative;cursor:pointer;" onclick="showAssetDetails('${slot.id}')" title="${slot.name} (${size} Slots)">${icon}${extraInfo}${upgradeBtn}</div>`;
  }).join('');
}

function updateTurnIndicator() {
  const indicator = document.getElementById('turnIndicator');
  const isMyTurn = gameState.currentPlayerIndex === myPlayerIndex;
  
  if (isMyTurn) {
    indicator.textContent = '🎯 Du bist dran!';
    indicator.style.background = 'var(--yellow)';
  } else {
    const player = gameState.players[gameState.currentPlayerIndex];
    indicator.textContent = `⏳ ${player.name} ist dran…`;
    indicator.style.background = 'var(--green-light)';
  }
  
  document.getElementById('endTurnBtn').disabled = !isMyTurn;
}

function renderNPCList() {
  const container = document.getElementById('npcList');
  const availableNPCs = gameState.npcs.filter(n => !n.accepted);
  
  if (availableNPCs.length === 0) {
    container.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">Keine Anfragen verfügbar</p>';
    return;
  }
  
  const TIER_NAMES = { tent: 'Zelt', glamping: 'Glamping', caravan: 'Caravan', bungalow: 'Bungalow', luxurybungalow: 'Luxus-Bungalow' };
  const NEED_NAMES = { Sports: 'Sportplatz', Campfire: 'Lagerfeuer', Sauna: 'Sauna', Stage: 'Bühne' };
  
  container.innerHTML = availableNPCs.map(npc => {
    const incomePerNight = Math.floor(npc.income / npc.nights);
    const nightLabel = npc.nights === 1 ? 'Nacht' : 'Nächte';
    const specialNeedsText = npc.specialNeeds.length > 0 ? ` | ✨ ${npc.specialNeeds.map(n => NEED_NAMES[n] || n).join(', ')}` : '';
    return `
    <div class="npc-card" style="padding:10px;margin-bottom:8px;">
      <div class="npc-header" style="margin-bottom:6px;">
        <span class="npc-name" style="font-weight:700;">${npc.name}</span>
        <span class="npc-type ${npc.type.toLowerCase()}" style="font-size:12px;">${npc.type === 'Hippies' ? '🌿' : npc.type === 'Families' ? '👨‍👩‍👧' : '💎'} ${npc.type}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;margin-bottom:6px;">
        <div>🌙 ${npc.nights} ${nightLabel}</div>
        <div>👥 ${npc.guests} Schlafpl.</div>
        <div>💰 ${incomePerNight}/Nacht</div>
        <div>💰 ${npc.income} Total</div>
        <div>⚡ ${npc.needs.electricity}</div>
        <div>💧 ${npc.needs.water}</div>
      </div>
      <div style="font-size:12px;margin-bottom:6px;">
        🏠 ${TIER_NAMES[npc.tierRequirement] || npc.tierRequirement || 'Zelt'}${specialNeedsText}
      </div>
      <button class="btn btn-green" style="width:100%;font-size:14px;padding:8px;" onclick="acceptNPC('${npc.id}')">✓ Annehmen</button>
    </div>
  `}).join('');
}

function buySlot() {
  socket.emit('buySlot');
}

function buyAsset(type) {
  socket.emit('buyAsset', type);
}

function showUpgradeTip() {
  alert('💡 Upgrade-Möglichkeiten:\n\n⛺ Zelt → 🏕️ Glamping: 150€\n   (2 Pers → 4 Pers)\n\n🏠 Bungalow → 🏰 Luxus-Bungalow: 300€\n   (6 Pers → 8 Pers)\n\nKlicke auf ein leeres Zelt oder Bungalow auf deinem Platz, um es zu upgraden!');
}

function showAssetDetails(assetId) {
  const player = gameState.players[myPlayerIndex];
  const asset = player.slotArray.find(s => s && s.id === assetId);
  if (!asset) return;
  
  const ASSET_NAMES = { tent: 'Zelt', glamping: 'Glamping', caravan: 'Caravan', bungalow: 'Bungalow', luxurybungalow: 'Luxus-Bungalow', generator: 'Generator', watertank: 'Wassertank', sportsfield: 'Sportplatz', campfire: 'Lagerfeuerstelle', sauna: 'Sauna', stage: 'Open-Air Bühne' };
  const SLEEPING_TYPES = ['tent', 'glamping', 'caravan', 'bungalow', 'luxurybungalow'];
  const TYPE_NAMES = { Hippie: 'Hippie', Family: 'Familie', Snob: 'Snob' };
  
  const isSleeping = SLEEPING_TYPES.includes(asset.assetType);
  const slots = asset.slotsNeeded || asset.space;
  const beds = asset.capacity || 0;
  
  let guestInfo = '';
  if (isSleeping && asset.guestCount > 0) {
    const npc = gameState.npcs.find(n => n.assignedAssetId === assetId);
    const guestName = npc ? npc.name : 'Unbekannt';
    const guestType = TYPE_NAMES[asset.guestType] || asset.guestType;
    const nights = asset.remainingNights || 0;
    guestInfo = `\n👥 Gast: ${guestName}\n📋 Typ: ${guestType}\n🌙 Dauer: ${nights} ${nights === 1 ? 'Nacht' : 'Nächte'}`;
  }
  
  const details = `📍 ${ASSET_NAMES[asset.assetType] || asset.name}
⬜ Slots: ${slots}${isSleeping ? `\n🛏️ Betten: ${beds}` : ''}${guestInfo}`;
  
  alert(details);
}

function upgradeAsset(assetId) {
  socket.emit('upgradeAsset', assetId);
}

function acceptNPC(npcId) {
  const npc = gameState.npcs.find(n => n.id === npcId);
  if (!npc) return;
  
  const player = gameState.players[myPlayerIndex];
  const sleepingAssets = player.assets.filter(a => a.assetType && ['tent', 'glamping', 'caravan', 'bungalow', 'luxurybungalow'].includes(a.assetType));
  
  if (sleepingAssets.length === 0) {
    showError('Du hast keine Schlafplätze! Baue zuerst Zelte, Caravans oder Bungalows.');
    return;
  }
  
  const tierRequirements = { tent: 0, glamping: 1, caravan: 2, bungalow: 3, luxurybungalow: 4 };
  const npcTierLevel = tierRequirements[npc.tierRequirement] || 0;
  
  // Check current events for tier preferences
  const events = gameState.events || [];
  const EVENT_TIER_EFFECTS = {
    storm: { dislikedTier: 'tent' },
    festival: { preferredTier: 'tent' }
  };
  let currentPreferredTier = null;
  let currentDislikedTier = null;
  for (const event of events) {
    if (EVENT_TIER_EFFECTS[event]?.preferredTier) currentPreferredTier = EVENT_TIER_EFFECTS[event].preferredTier;
    if (EVENT_TIER_EFFECTS[event]?.dislikedTier) currentDislikedTier = EVENT_TIER_EFFECTS[event].dislikedTier;
  }
  
  // Guest limits per NPC type per asset type from GDD
  const NPC_GUEST_LIMITS = {
    Hippies: { tent: 2, caravan: 4, bungalow: 6 },
    Families: { glamping: 4, caravan: 4, bungalow: 6 },
    Snobs: { glamping: 2, bungalow: 4, luxurybungalow: 6 }
  };
  const maxGuestsForThisNPC = NPC_GUEST_LIMITS[npc.type]?.[npc.tierRequirement] || 999;
  
  let tierEligibleAssets = sleepingAssets.filter(a => {
    const assetTierLevel = tierRequirements[a.assetType] || 0;
    return assetTierLevel >= npcTierLevel;
  });
  
  // Filter by event-based preferences
  if (currentDislikedTier) {
    const before = tierEligibleAssets.length;
    tierEligibleAssets = tierEligibleAssets.filter(a => a.type !== currentDislikedTier);
    if (tierEligibleAssets.length === 0 && before > 0) {
      showError(`Bei Sturm können keine Zelte verwendet werden!`);
      return;
    }
  }
  
  const hasSpecialAssets = npc.specialNeeds.every(need => 
    player.assets.some(a => a.satisfies?.includes(need))
  );
  
  if (!hasSpecialAssets) {
    const missingNeeds = npc.specialNeeds.filter(need => 
      !player.assets.some(a => a.satisfies?.includes(need))
    );
    showError(`Fehlende Einrichtungen: ${missingNeeds.join(', ')}`);
    return;
  }
  
  if (tierEligibleAssets.length === 0) {
    showError(`Benötige ${npc.tierRequirement} (deine: ${sleepingAssets.map(a => a.type).join(', ') || 'keine'})`);
    return;
  }
  
  document.getElementById('selectedNpcName').textContent = npc.name;
  document.getElementById('selectedNpcGuests').textContent = npc.guests;
  
  const spotsList = document.getElementById('sleepingSpotsList');
  spotsList.innerHTML = tierEligibleAssets.map(asset => {
    const currentGuests = asset.guestCount || 0;
    const maxAllowedForNPC = NPC_GUEST_LIMITS[npc.type]?.[asset.assetType] || asset.capacity;
    const available = maxAllowedForNPC - currentGuests;
    const canFit = available >= npc.guests;
    const hasEnoughResources = player.electricity >= npc.needs.electricity && player.water >= npc.needs.water;
    const isDisabled = !canFit || !hasEnoughResources;
    
    let guestInfo = '';
    if (asset.guestCount && asset.guestCount > 0) {
      guestInfo = `<div class="spot-guests">Belegt: ${asset.guestCount} Gäste (${asset.remainingNights} Nächte)</div>`;
    }
    
    const assetIcons = { tent: '⛺', glamping: '🏕️', caravan: '🚐', bungalow: '🏠', luxurybungalow: '🏰' };
    
    return `
      <div class="sleeping-spot-option ${isDisabled ? 'disabled' : ''}" onclick="${isDisabled ? '' : `selectSleepingSpot('${npcId}', '${asset.id}')`}">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:24px;">${assetIcons[asset.assetType] || '🛏️'}</span>
          <div>
            <div class="spot-name">${asset.name}</div>
            <div class="spot-capacity">Kapazität: ${asset.capacity} | Frei: ${available}</div>
            ${guestInfo}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('sleepingSpotModal').classList.add('active');
}

function selectSleepingSpot(npcId, assetId) {
  closeSleepingSpotModal();
  socket.emit('acceptNPC', { npcId, assetId });
}

function closeSleepingSpotModal() {
  document.getElementById('sleepingSpotModal').classList.remove('active');
}

function rejectNPC(npcId) {
  socket.emit('rejectNPC', npcId);
}

function requestGuest(pointType) {
  socket.emit('requestGuest', pointType);
}

function runPromotion(promotionType) {
  socket.emit('runPromotion', promotionType);
}

function endTurn() {
  socket.emit('endTurn');
}

function showGameOver() {
  const sorted = [...gameState.players].sort((a, b) => b.score - a.score);
  const container = document.getElementById('winnerList');
  container.innerHTML = sorted.map((p, i) => `
    <div class="winner-item">
      <span>${i + 1}. ${p.name}</span>
      <span>${p.score} Punkte</span>
    </div>
  `).join('');
  document.getElementById('gameOverModal').classList.add('active');
}
