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
    rain: { text: '🌧️ REGEN – Weniger Gäste!', class: 'rain' },
    storm: { text: '⛈️ STURM – Weniger Gäste!', class: 'rain' },
    heatwave: { text: '🔥 HITZEWELLE – Mehr Wasserbedarf!', class: 'heatwave' },
    cold: { text: '❄️ KÄLTE – Weniger Gäste!', class: 'rain' },
    drought: { text: '🏜️ DÜRRE – Weniger Wasser!', class: 'rain' },
    tourism_boom: { text: '📈 TOURISMUS-BOOM – Mehr Gäste!', class: 'festival' },
    recession: { text: '📉 REZESSION – Weniger Gäste!', class: 'rain' },
    luxury_trend: { text: '💎 LUXUS-TREND – Höhere Einnahmen!', class: 'festival' },
    minimalism_trend: { text: '📦 MINIMALISMUS – Normale Preise', class: '' },
    festival: { text: '🎉 FESTIVAL – Mehr Gäste!', class: 'festival' },
    sports_event: { text: '🏆 SPORT-EVENT – Mehr Gäste!', class: 'festival' },
    fishing_competition: { text: '🎣 ANGELWETTBEWERB – Mehr Gäste!', class: 'festival' },
    music_week: { text: '🎵 MUSIK-WOCHE – Mehr Gäste!', class: 'festival' },
    influencer_hype: { text: '📱 INFLUENCER – Mehr Gäste!', class: 'festival' },
    online_storm: { text: '💬 ONLINE-STORM – Weniger Gäste!', class: 'rain' },
    award: { text: '🏅 AUSZEICHNUNG – Mehr Gäste!', class: 'festival' },
    wildlife: { text: '🦌 WILTIERE – Bonus-Einnahmen!', class: '' }
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
  document.getElementById('spaceVal').textContent = `${player.usedSpace}/${player.space}`;
  document.getElementById('electricVal').textContent = player.electricity;
  document.getElementById('waterVal').textContent = player.water;
  
  const ownedAssets = document.getElementById('ownedAssets');
  if (player.assets.length === 0) {
    ownedAssets.innerHTML = '<span style="color:#888;font-size:12px;">Noch keine Assets</span>';
  } else {
    ownedAssets.innerHTML = player.assets.map(a => {
      if (a.type === 'sleeping') {
        const currentGuests = a.guests?.length || 0;
        const isOccupied = currentGuests > 0;
        const guestInfo = isOccupied ? a.guests.map(g => `<div style="font-size:10px;color:#666;">${g.name} (${g.remainingNights} Nächte)</div>`).join('') : '';
        return `
          <div class="owned-asset" style="${isOccupied ? 'background:#ffeaa7;' : ''}">
            <div style="font-size:20px;">🛏️</div>
            <div style="flex:1;">
              <div style="font-weight:700;font-size:13px;">${a.name}</div>
              <div style="font-size:11px;color:${isOccupied ? '#e67e22' : '#27ae60'};">
                ${currentGuests}/${a.capacity} belegt
              </div>
              ${guestInfo}
            </div>
          </div>
        `;
      }
      return `
        <div class="owned-asset">
          ${a.type === 'resource' ? (a.produces?.electricity ? '⚡' : '💧') : '⚽'}
          ${a.name}
        </div>
      `;
    }).join('');
  }
  
  renderPlayerList();
  renderNPCList();
  updateTurnIndicator();
  
  document.getElementById('buySpaceBtn').disabled = player.money < 100;
  
  if (gameState.year > 1 || gameState.quarter > 4 || (gameState.quarter === 4 && gameState.round > 3)) {
    showGameOver();
  }
}

function renderPlayerList() {
  const container = document.getElementById('playerList');
  container.innerHTML = gameState.players.map((p, i) => `
    <div class="player-card ${i === gameState.currentPlayerIndex ? 'active' : ''}">
      <div class="icon">${playerIcons[i]}</div>
      <div class="name">${p.name}</div>
      <div class="score">${p.score} Pkt</div>
    </div>
  `).join('');
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
  
  container.innerHTML = availableNPCs.map(npc => `
    <div class="npc-card">
      <div class="npc-header">
        <span class="npc-name">${npc.name}</span>
        <span class="npc-type ${npc.type.toLowerCase()}">${npc.type === 'Hippies' ? '🌿' : npc.type === 'Families' ? '👨‍👩‍👧' : '💎'} ${npc.type}</span>
      </div>
      <div class="npc-details">
        <div class="npc-detail"><div class="val">👥 ${npc.guests}</div><div class="lbl">Gäste</div></div>
        <div class="npc-detail"><div class="val">🌙 ${npc.nights}</div><div class="lbl">Nächte</div></div>
        <div class="npc-detail"><div class="val">💰 ${npc.income}</div><div class="lbl">Einnahmen</div></div>
      </div>
      <div class="npc-details">
        <div class="npc-detail"><div class="val">🛏️ ${npc.needs.sleepingSpots}</div><div class="lbl">Schlafpl.</div></div>
        <div class="npc-detail"><div class="val">⚡ ${npc.needs.electricity}</div><div class="lbl">Strom</div></div>
        <div class="npc-detail"><div class="val">💧 ${npc.needs.water}</div><div class="lbl">Wasser</div></div>
      </div>
      ${npc.specialNeeds.length > 0 ? `<div class="npc-special">✨ Benötigt: ${npc.specialNeeds.join(', ')}</div>` : ''}
      <div class="npc-actions">
        <button class="btn btn-green" onclick="acceptNPC('${npc.id}')">✓ Annehmen</button>
        <button class="btn btn-red" onclick="rejectNPC('${npc.id}')">✗ Ablehnen</button>
      </div>
    </div>
  `).join('');
}

function buySpace() {
  socket.emit('buySpace');
}

function buyAsset(type) {
  socket.emit('buyAsset', type);
}

function acceptNPC(npcId) {
  const npc = gameState.npcs.find(n => n.id === npcId);
  if (!npc) return;
  
  const player = gameState.players[myPlayerIndex];
  const sleepingAssets = player.assets.filter(a => a.type === 'sleeping');
  
  if (sleepingAssets.length === 0) {
    showError('Du hast keine Schlafplätze! Baue zuerst Zelte, Wohnwägen oder Bungalows.');
    return;
  }
  
  document.getElementById('selectedNpcName').textContent = npc.name;
  document.getElementById('selectedNpcGuests').textContent = npc.guests;
  
  const spotsList = document.getElementById('sleepingSpotsList');
  spotsList.innerHTML = sleepingAssets.map(asset => {
    const currentGuests = asset.guests?.length || 0;
    const available = asset.capacity - currentGuests;
    const canFit = available >= npc.guests;
    const hasEnoughResources = player.electricity >= npc.needs.electricity && player.water >= npc.needs.water;
    const isDisabled = !canFit || !hasEnoughResources;
    
    let guestInfo = '';
    if (asset.guests && asset.guests.length > 0) {
      guestInfo = `<div class="spot-guests">Belegt: ${asset.guests.map(g => `${g.name} (${g.remainingNacht})`).join(', ')}</div>`;
    }
    
    return `
      <div class="sleeping-spot-option ${isDisabled ? 'disabled' : ''}" onclick="${isDisabled ? '' : `selectSleepingSpot('${npcId}', '${asset.id}')`}">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:24px;">🛏️</span>
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

document.addEventListener('DOMContentLoaded', initTrees);
