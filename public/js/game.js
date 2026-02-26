const socket = io({ path: '/socket.io' });

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
let selectedTile = null; // Currently selected tile for placing assets
let movingAsset = false; // Whether we're in asset moving mode

const urlParams = new URLSearchParams(window.location.search);

socket.on('connect', () => {
  console.log('Connected to server');
  
  if (urlParams.get('solo') === 'true') {
    isSolo = true;
    const playerName = urlParams.get('name') || localStorage.getItem('soloPlayerName') || 'Spieler';
    if (urlParams.get('name')) {
      localStorage.setItem('soloPlayerName', urlParams.get('name'));
    }
    console.log('Starting solo game as:', playerName);
    socket.emit('startSolo', playerName);
  }
});

socket.on('soloStarted', (data) => {
  console.log('Solo game started!', data);
  myPlayerIndex = 0;
  gameState = data.gameState;
  document.getElementById('gamePage').style.display = 'block';
  updateGameUI();
  
  // Initialize canvas after gamePage is visible
  setTimeout(() => {
    initHexCanvas();
  }, 100);
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

function zoomIn() {
  if (view.scale < view.maxScale) {
    view.scale *= 1.2;
    updateCanvasTransform();
  }
}

function zoomOut() {
  if (view.scale > view.minScale) {
    view.scale /= 1.2;
    updateCanvasTransform();
  }
}

function resetView() {
  view.x = BOARD_WIDTH / 2;
  view.y = BOARD_HEIGHT / 2;
  view.scale = 1;
  updateCanvasTransform();
}

function toggleCameraMode() {
  cameraMode = !cameraMode;
  const btn = document.getElementById('cameraToggle');
  
  if (cameraMode) {
    btn.classList.remove('active');
    board.style.cursor = 'grab';
  } else {
    btn.classList.add('active');
    board.style.cursor = 'pointer';
  }
}

function createLobby() {
  const name = document.getElementById('playerName').value.trim() || 'Spieler';
  socket.emit('createLobby', { name });
}

function joinLobby() {
  const name = document.getElementById('playerName').value.trim() || 'Spieler';
  const code = document.getElementById('joinCode').value.trim().toUpperCase();
  if (code.length < 4) {
    showError('Bitte gib einen gültigen Code ein!');
    return;
  }
  socket.emit('joinLobby', { code, name });
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
});

socket.on('gameStarted', (data) => {
  gameState = data.gameState;
  myPlayerIndex = data.myPlayerIndex;
  document.getElementById('landingPage').style.display = 'none';
  document.getElementById('lobbyPage').style.display = 'none';
  document.getElementById('gamePage').style.display = 'block';
  updateGameUI();
  
  // Wait for canvas to be visible before initializing
  setTimeout(() => {
    initHexCanvas();
  }, 100);
});

socket.on('gameState', (data) => {
  gameState = data;
  updateGameUI();
  if (canvas.width > 0) {
    renderHexGrid();
  } else {
    setTimeout(() => initHexCanvas(), 100);
  }
});

function startGame() {
  socket.emit('startGame', { lobbyCode });
}

function copyCode() {
  navigator.clipboard.writeText(lobbyCode);
  alert('Code kopiert: ' + lobbyCode);
}

function updateGameUI() {
  if (!gameState) return;
  
  const player = gameState.players[myPlayerIndex];
  
  document.getElementById('moneyVal').textContent = player.money;
  document.getElementById('electricVal').textContent = player.electric;
  document.getElementById('waterVal').textContent = player.water;
  document.getElementById('yearVal').textContent = gameState.year;
  document.getElementById('quarterVal').textContent = gameState.quarter;
  document.getElementById('roundVal').textContent = gameState.round;
  
  const season = gameState.quarter <= 1 || gameState.quarter >= 4 ? 'Neben' : 'Haupt';
  document.getElementById('seasonVal').textContent = season;
  
  if (gameState.event) {
    document.getElementById('eventBanner').textContent = '📢 ' + gameState.event.name + ': ' + gameState.event.description;
    document.getElementById('eventBanner').style.display = 'block';
  } else {
    document.getElementById('eventBanner').style.display = 'none';
  }
  
  updateTurnIndicator();
  renderHexGrid();
}

const canvas = document.getElementById('hexCanvas');
const ctx = canvas.getContext('2d');
const board = document.getElementById('gameBoard');

// Isometric hex settings
const HEX_SIZE = 40;
const TILE_WIDTH = HEX_SIZE * 2;
const TILE_HEIGHT = HEX_SIZE * 1.5;
const MAP_RADIUS = 6;

// Board dimensions (fixed size)
const BOARD_WIDTH = (MAP_RADIUS * 2 + 3) * TILE_WIDTH;
const BOARD_HEIGHT = (MAP_RADIUS * 2 + 3) * TILE_HEIGHT;

// View/zoom settings
let view = {
  x: 0,
  y: 0,
  scale: 1,
  minScale: 0.5,
  maxScale: 2
};

let isDragging = false;
let dragStart = { x: 0, y: 0 };
let cameraMode = true; // Default: camera mode on, so drag pans the board

function initHexCanvas() {
  // Set fixed canvas size for the board
  canvas.width = BOARD_WIDTH;
  canvas.height = BOARD_HEIGHT;
  
  // Center the view initially
  view.x = BOARD_WIDTH / 2;
  view.y = BOARD_HEIGHT / 2;
  updateCanvasTransform();
  
  renderHexGrid();
  setupCameraControls();
}

function updateCanvasTransform() {
  canvas.style.transform = `translate(${-view.x + BOARD_WIDTH/2}px, ${-view.y + BOARD_HEIGHT/2}px) scale(${view.scale})`;
  canvas.style.transformOrigin = 'center center';
}

function setupCameraControls() {
  // Mouse wheel zoom
  board.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = view.scale * zoomFactor;
    
    if (newScale >= view.minScale && newScale <= view.maxScale) {
      view.scale = newScale;
      updateCanvasTransform();
    }
  });
  
  // Mouse drag pan (only when cameraMode is on)
  board.addEventListener('mousedown', (e) => {
    if (!cameraMode) return; // Don't drag when in tile selection mode
    isDragging = true;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
    board.style.cursor = 'grabbing';
  });
  
  board.addEventListener('mousemove', (e) => {
    if (isDragging && cameraMode) {
      view.x += (e.clientX - dragStart.x) / view.scale;
      view.y += (e.clientY - dragStart.y) / view.scale;
      dragStart.x = e.clientX;
      dragStart.y = e.clientY;
      updateCanvasTransform();
    }
  });
  
  board.addEventListener('mouseup', () => {
    isDragging = false;
    board.style.cursor = cameraMode ? 'grab' : 'pointer';
  });
  
  board.addEventListener('mouseleave', () => {
    isDragging = false;
    board.style.cursor = cameraMode ? 'grab' : 'pointer';
  });
  
  board.style.cursor = cameraMode ? 'grab' : 'pointer';
}

function renderHexGrid() {
  if (!gameState) return;
  
  const player = gameState.players[myPlayerIndex];
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Fixed center since we're using CSS transforms for view
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const mapRadius = MAP_RADIUS;
  
  // Draw wooden board background
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw inner playing surface
  const boardInset = 20;
  ctx.fillStyle = '#6D4C41';
  ctx.fillRect(boardInset, boardInset, canvas.width - boardInset*2, canvas.height - boardInset*2);
  
  // Render hexes in isometric view
  for (let row = -mapRadius; row <= mapRadius; row++) {
    for (let col = -mapRadius; col <= mapRadius; col++) {
      // Convert to axial coordinates
      const q = col;
      const r = row;
      const s = -q - r;
      
      // Skip if outside hex-shaped map
      if (Math.abs(q) > mapRadius || Math.abs(r) > mapRadius || Math.abs(s) > mapRadius) continue;
      
      // Convert to pixel position (isometric)
      const x = centerX + (q - r) * (TILE_WIDTH / 2);
      const y = centerY + (q + r) * (TILE_HEIGHT / 2);
      
      const tileId = `${q},${r}`;
      const ownerIndex = gameState.board[tileId];
      const isMine = ownerIndex === myPlayerIndex;
      const isUnclaimed = ownerIndex === undefined;
      const isAdjacent = checkAdjacent(tileId, myPlayerIndex);
      const canBuy = isUnclaimed && isAdjacent && player.money >= 100;
      
      drawIsometricHex(x, y, isMine, isUnclaimed, canBuy, ownerIndex, tileId);
      
      // Draw asset if owned
      if (isMine && player.slots) {
        const slot = player.slots[tileId];
        if (slot && slot.assetType) {
          drawIsometricAsset(x, y, slot);
        }
      }
    }
  }
}

function drawIsometricHex(x, y, isMine, isUnclaimed, canBuy, ownerIndex, tileId) {
  const hw = TILE_WIDTH / 2;
  const hh = TILE_HEIGHT / 2;
  const isSelected = selectedTile === tileId;
  
  // Draw tile shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.moveTo(x + 4, y - hh + 4);
  ctx.lineTo(x + hw + 4, y + 4);
  ctx.lineTo(x + 4, y + hh + 4);
  ctx.lineTo(x - hw + 4, y + 4);
  ctx.closePath();
  ctx.fill();
  
  // Main tile shape
  ctx.beginPath();
  ctx.moveTo(x, y - hh);
  ctx.lineTo(x + hw, y);
  ctx.lineTo(x, y + hh);
  ctx.lineTo(x - hw, y);
  ctx.closePath();
  
  // Fill based on ownership - board game style
  if (isMine) {
    const gradient = ctx.createLinearGradient(x - hw, y - hh, x + hw, y + hh);
    gradient.addColorStop(0, '#7CB342');
    gradient.addColorStop(1, '#558B2F');
    ctx.fillStyle = gradient;
  } else if (canBuy) {
    const gradient = ctx.createLinearGradient(x - hw, y - hh, x + hw, y + hh);
    gradient.addColorStop(0, '#FFD54F');
    gradient.addColorStop(1, '#FFCA28');
    ctx.fillStyle = gradient;
  } else if (isUnclaimed) {
    const gradient = ctx.createLinearGradient(x - hw, y - hh, x + hw, y + hh);
    gradient.addColorStop(0, '#AED581');
    gradient.addColorStop(1, '#9CCC65');
    ctx.fillStyle = gradient;
  } else {
    const gradient = ctx.createLinearGradient(x - hw, y - hh, x + hw, y + hh);
    gradient.addColorStop(0, '#B0BEC5');
    gradient.addColorStop(1, '#90A4AE');
    ctx.fillStyle = gradient;
  }
  
  ctx.fill();
  
  // Tile border - like a physical board
  ctx.strokeStyle = isMine ? '#33691E' : '#5D4037';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Selection highlight
  if (isSelected) {
    if (movingAsset) {
      // Moving mode - show blue highlight for source tile
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 5;
      ctx.stroke();
      
      // Animated selection glow
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.3)';
      ctx.lineWidth = 10;
      ctx.stroke();
    } else {
      // Normal selection - orange highlight
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 5;
      ctx.stroke();
      
      // Animated selection glow
      ctx.strokeStyle = 'rgba(255, 87, 34, 0.3)';
      ctx.lineWidth = 10;
      ctx.stroke();
    }
  }
  
  // Show valid drop targets when moving
  if (movingAsset && selectedTile && tileId !== selectedTile && isMine && !isUnclaimed) {
    const player = gameState.players[myPlayerIndex];
    const slot = player.slots && player.slots[tileId];
    if (slot && !slot.assetType) {
      // Show green highlight for valid drop targets
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Animated glow for drop targets
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
      ctx.lineWidth = 8;
      ctx.stroke();
    }
  }
  
  // Inner highlight for 3D effect
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - hw + 5, y);
  ctx.lineTo(x, y - hh + 5);
  ctx.stroke();
  
  // Draw grass detail on tiles
  if (!isUnclaimed && ownerIndex !== undefined) {
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 3; i++) {
      const gx = x + (Math.random() - 0.5) * hw * 0.8;
      const gy = y + (Math.random() - 0.5) * hh * 0.8;
      ctx.beginPath();
      ctx.arc(gx, gy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawIsometricAsset(x, y, slot) {
  const hw = TILE_WIDTH / 2;
  const hh = TILE_HEIGHT / 2;
  
  const assetIcons = {
    tent: '⛺',
    glamping: '🏕️',
    caravan: '🚐',
    bungalow: '🏠',
    luxurybungalow: '🏰',
    generator: '⚡',
    watertank: '💧',
    sportsfield: '⚽',
    campfire: '🔥',
    sauna: '🧖',
    stage: '🎭'
  };
  
  const icon = assetIcons[slot.assetType] || '📦';
  
  // Draw shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + hh - 5, hw * 0.5, hh * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw asset icon (slightly raised)
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x, y - 10);
  
  // Draw guest count if occupied
  if (slot.guestCount > 0) {
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.fillText(`👥${slot.guestCount}`, x, y + hh - 8);
    ctx.strokeText(`👥${slot.guestCount}`, x, y + hh - 8);
  }
}

function checkAdjacent(tileId, playerIndex) {
  const player = gameState.players[playerIndex];
  if (!player.slots) return false;
  
  const [q, r] = tileId.split(',').map(Number);
  
  // All 6 neighbors in axial coordinates
  const neighbors = [
    [q+1, r], [q-1, r], [q, r+1], [q, r-1], [q+1, r-1], [q-1, r+1]
  ];
  
  // Check if any neighbor is owned by player
  for (const [nq, nr] of neighbors) {
    const neighborId = String(nq) + ',' + String(nr);
    if (player.slots[neighborId]) {
      return true;
    }
  }
  return false;
}

// Click handler on board element
board.addEventListener('click', function(e) {
  if (!gameState) return;
  
  // Get click position relative to canvas (the visible board area)
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  // Account for view transform - canvas is scaled and translated
  // The visible area's top-left in canvas coordinates:
  const viewOffsetX = (rect.width / 2) / view.scale - view.x;
  const viewOffsetY = (rect.height / 2) / view.scale - view.y;
  
  const canvasX = clickX / view.scale + viewOffsetX;
  const canvasY = clickY / view.scale + viewOffsetY;
  
  const centerX = BOARD_WIDTH / 2;
  const centerY = BOARD_HEIGHT / 2;
  const mapRadius = MAP_RADIUS;
  
  console.log('Click at:', clickX, clickY, '-> canvas:', canvasX, canvasY);
  
  // Find clicked tile
  for (let row = -mapRadius; row <= mapRadius; row++) {
    for (let col = -mapRadius; col <= mapRadius; col++) {
      const q = col;
      const r = row;
      const s = -q - r;
      
      if (Math.abs(q) > mapRadius || Math.abs(r) > mapRadius || Math.abs(s) > mapRadius) continue;
      
      const x = centerX + (q - r) * (TILE_WIDTH / 2);
      const y = centerY + (q + r) * (TILE_HEIGHT / 2);
      
      const dist = Math.sqrt((canvasX - x) ** 2 + (canvasY - y) ** 2);
      if (dist < HEX_SIZE * 0.9) {
        const tileId = q + ',' + r;
        const ownerIndex = gameState.board[tileId];
        const player = gameState.players[myPlayerIndex];
        
        // Handle NPC placement if pending
        if (window.pendingNPCId && ownerIndex === myPlayerIndex && player.slots && player.slots[tileId]) {
          const slot = player.slots[tileId];
          if (slot && slot.assetType) {
            placeNPC(window.pendingNPCId, tileId);
            window.pendingNPCId = null;
            return;
          }
        }
        
        // Select empty owned tile for asset placement or handle asset moving
        if (ownerIndex === myPlayerIndex && player.slots && player.slots[tileId]) {
          const slot = player.slots[tileId];
          if (!slot || !slot.assetType) {
            // Handle asset moving
            if (movingAsset && selectedTile && selectedTile !== tileId) {
              socket.emit('moveAsset', { fromTileId: selectedTile, toTileId: tileId });
              cancelMoveAsset();
              return;
            }
            
            // Normal tile selection for asset placement
            selectedTile = (selectedTile === tileId) ? null : tileId;
            renderHexGrid();
            return;
          }
          
          // Show asset details modal for placed assets
          showAssetDetails(tileId, slot);
          return;
        }
        
        // Buy adjacent unowned tile
        if (ownerIndex === undefined && checkAdjacent(tileId, myPlayerIndex)) {
          socket.emit('buyTile', { tileId: tileId });
          return;
        }
        
        // Deselect
        if (selectedTile) {
          selectedTile = null;
          renderHexGrid();
        }
        return;
      }
    }
  }
});

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
  
  let html = '';
  for (const npc of availableNPCs) {
    const expiresIn = npc.expiresIn || 3;
    html += `
      <div style="background:#f5f5f5;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <b>${npc.name}</b> (${npc.type})
          <div style="font-size:12px;color:#666;">
            👥${npc.guests} | 💰${npc.income}/Nacht | ⏳${expiresIn} Züge
          </div>
        </div>
        <button class="btn btn-green" style="padding:8px 16px;font-size:14px;" onclick="acceptNPC('${npc.id}')">Annehmen</button>
      </div>
    `;
  }
  container.innerHTML = html;
}

function renderCoins() {
  const player = gameState.players[myPlayerIndex];
  const coins = player.coins || { generic: 2, Hippies: 0, Familie: 0, Snob: 0 };
  
  document.getElementById('coinGeneric').textContent = coins.generic;
  document.getElementById('coinHippies').textContent = coins.Hippies;
  document.getElementById('coinFamilie').textContent = coins.Familie;
  document.getElementById('coinSnob').textContent = coins.Snob;
}

function openBuildPanel() {
  const panel = document.getElementById('buildPanel');
  panel.classList.add('active');
  
  // Update hint based on selection
  const hint = panel.querySelector('p');
  if (selectedTile) {
    hint.textContent = `✓ Feld ${selectedTile} ausgewählt - wähle ein Asset`;
    hint.style.color = 'var(--green-dark)';
  } else {
    hint.textContent = '💡 Klicke zuerst auf ein freies Feld, um ein Asset zu platzieren';
    hint.style.color = '#666';
  }
}

function closeBuildPanel() {
  document.getElementById('buildPanel').classList.remove('active');
}

function openGuestPanel() {
  document.getElementById('guestPanel').classList.add('active');
  renderGuestPanel();
}

function closeGuestPanel() {
  document.getElementById('guestPanel').classList.remove('active');
}

function renderGuestPanel() {
  if (!gameState) return;
  const player = gameState.players[myPlayerIndex];
  
  document.getElementById('coinGeneric').textContent = player.coins.generic;
  document.getElementById('coinHippies').textContent = player.coins.Hippies || 0;
  document.getElementById('coinFamilie').textContent = player.coins.Familie || 0;
  document.getElementById('coinSnob').textContent = player.coins.Snob || 0;
  
  const npcList = document.getElementById('npcList');
  let html = '';
  
  // Available NPCs to accept
  if (gameState.npcs && gameState.npcs.length > 0) {
    html += '<div style="font-weight:700;margin:10px 0 5px;">Anfragen:</div>';
    for (const npc of gameState.npcs) {
      const typeIcon = { 'Hippies': '🌿', 'Familie': '👨‍👩‍👧‍👦', 'Snob': '👑' }[npc.type] || '🪙';
      html += `
        <div style="background:#fff;border:1px solid #ddd;padding:10px;margin:5px 0;border-radius:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span><b>${npc.name}</b> ${typeIcon}</span>
            <span style="color:#666;">${npc.guests} Pers., ${npc.stayDuration} Nächte</span>
          </div>
          <div style="font-size:12px;color:#888;">Einkommen: ${npc.income}€/Nacht | Bedarf: ⚡${npc.needs.electric} 💧${npc.needs.water}</div>
          ${npc.special ? `<div style="font-size:11px;color:#e67e22;">Sonderwunsch: ${npc.special}</div>` : ''}
          <button class="btn btn-green" style="margin-top:5px;padding:5px 15px;" onclick="acceptNPC('${npc.id}')">Annehmen</button>
        </div>
      `;
    }
  } else {
    html += '<div style="color:#888;padding:10px;">Keine Anfragen verfügbar</div>';
  }
  
  // Accepted NPCs - show where they are placed or allow placement
  if (player.npcs && player.npcs.length > 0) {
    html += '<div style="font-weight:700;margin:15px 0 5px;">Deine Gäste:</div>';
    for (const npc of player.npcs) {
      const typeIcon = { 'Hippies': '🌿', 'Familie': '👨‍👩‍👧‍👦', 'Snob': '👑' }[npc.type] || '🪙';
      if (npc.placed) {
        html += `
          <div style="background:#e8f5e9;border:1px solid #4caf50;padding:10px;margin:5px 0;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;">
              <span><b>${npc.name}</b> ${typeIcon}</span>
              <span>${npc.stayDuration} Nächte</span>
            </div>
            <div style="font-size:12px;color:#666;">📍 Auf Platz</div>
          </div>
        `;
      } else {
        html += `
          <div style="background:#fff3e0;border:1px solid #ff9800;padding:10px;margin:5px 0;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;">
              <span><b>${npc.name}</b> ${typeIcon}</span>
              <span>${npc.stayDuration} Nächte</span>
            </div>
            <div style="font-size:12px;color:#666;">Noch nicht platziert - wähle ein Feld zum Platzieren</div>
            <button class="btn btn-orange" style="margin-top:5px;padding:5px 15px;" onclick="promptPlaceNPC('${npc.id}')">Platzieren</button>
          </div>
        `;
      }
    }
  }
  
  npcList.innerHTML = html;
}

function promptPlaceNPC(npcId) {
  alert('Klicke auf ein Feld mit einem Schlafplatz-Asset um den Gast zu platzieren');
  window.pendingNPCId = npcId;
  closeGuestPanel();
}

function openPlayerList() {
  document.getElementById('playerPanel').classList.add('active');
  renderPlayerList();
}

function closePlayerList() {
  document.getElementById('playerPanel').classList.remove('active');
}

function renderPlayerList() {
  const container = document.getElementById('playerList');
  const sorted = [...gameState.players].sort((a, b) => b.money - a.money);
  
  let html = '';
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const isMe = p.id === gameState.players[myPlayerIndex].id;
    html += `
      <div style="background:${isMe ? 'var(--green-light)' : '#f5f5f5'};padding:12px;border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;">
        <span><b>${i + 1}. ${p.name}</b></span>
        <span>💰${p.money}</span>
      </div>
    `;
  }
  container.innerHTML = html;
}

function endTurn() {
  socket.emit('endTurn');
}

function buySlot() {
  socket.emit('buySlot');
}

function buyAsset(type) {
  if (selectedTile) {
    socket.emit('buyAsset', { type, tileId: selectedTile });
    selectedTile = null;
    renderHexGrid();
    closeBuildPanel();
  } else {
    alert('Bitte wähle zuerst ein freies Feld auf dem Spielbrett aus!');
  }
}

function acceptNPC(npcId) {
  socket.emit('acceptNPC', { npcId });
}

function requestGuest(type) {
  socket.emit('requestGuest', { type });
  setTimeout(() => renderGuestPanel(), 100);
}

function runPromotion(type, cost) {
  socket.emit('runPromotion', { type, cost });
  setTimeout(() => renderGuestPanel(), 100);
}

function upgradeAsset(tileId) {
  socket.emit('upgradeAsset', { tileId });
}

function placeNPC(npcId, tileId) {
  socket.emit('placeNPC', { npcId, tileId });
}

socket.on('turnSummary', (data) => {
  const container = document.getElementById('turnSummary');
  let eventHtml = '';
  if (data.gameState && data.gameState.event) {
    eventHtml = `<p style="color: #ff6b6b;">📢 ${data.gameState.event.name}: ${data.gameState.event.description}</p>`;
  }
  container.innerHTML = `
    ${eventHtml}
    <p style="margin-bottom:10px;">Einnahmen: +${data.income}€</p>
    <p>Strom: ${data.electricChange > 0 ? '+' : ''}${data.electricChange}</p>
    <p>Wasser: ${data.waterChange > 0 ? '+' : ''}${data.waterChange}</p>
    <p>Runde: ${data.gameState?.round || 1}, Quartal: ${data.gameState?.quarter || 1}, Jahr: ${data.gameState?.year || 1}</p>
  `;
  document.getElementById('turnSummaryModal').classList.add('active');
  
  if (data.gameState) {
    gameState = data.gameState;
    updateGameUI();
    renderHexGrid();
  }
});

socket.on('leaderboard', (data) => {
  const container = document.getElementById('leaderboardContent');
  let html = '<table style="width:100%;"><tr><th>Spieler</th><th>Score</th><th>Geld</th><th>Gäste</th><th>Flächen</th></tr>';
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    html += `<tr ${i === 0 ? 'style="background:#gold;"' : ''}>
      <td>${i + 1}. ${p.name}</td>
      <td>${p.score}</td>
      <td>${p.money}€</td>
      <td>${p.npcs}</td>
      <td>${p.slots}</td>
    </tr>`;
  }
  html += '</table>';
  container.innerHTML = html;
  document.getElementById('leaderboardModal').classList.add('active');
});

socket.on('gameOver', (data) => {
  const container = document.getElementById('turnSummary');
  container.innerHTML = `
    <h2>🎉 Spiel beendet!</h2>
    <p>Gewinner: <strong>${data.winner.name}</strong></p>
    <p>Score: ${data.score}</p>
    <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;cursor:pointer;">Neues Spiel</button>
  `;
  document.getElementById('turnSummaryModal').classList.add('active');
});

function showLeaderboard() {
  socket.emit('getLeaderboard');
}

function closeLeaderboard() {
  document.getElementById('leaderboardModal').classList.remove('active');
}

let currentAssetTileId = null;

function showAssetDetails(tileId, slot) {
  currentAssetTileId = tileId;
  const player = gameState.players[myPlayerIndex];
  const asset = ASSETS[slot.assetType];
  
  const assetNames = {
    tent: '⛺ Zelt',
    glamping: '🏕️ Glamping',
    caravan: '🚐 Caravan',
    bungalow: '🏠 Bungalow',
    luxurybungalow: '🏰 Luxus-Bungalow',
    powerplant: '⚡ Kraftwerk',
    watertank: '💧 Wassertank',
    sportsfield: '⚽ Sportplatz',
    fireplace: '🔥 Lagerfeuer',
    sauna: '🧖 Sauna',
    stage: '🎭 Bühne'
  };
  
  const isSleepingPlace = ['tent', 'glamping', 'caravan', 'bungalow', 'luxurybungalow'].includes(slot.assetType);
  
  let html = `<div style="margin-bottom:15px;"><b>${assetNames[slot.assetType] || slot.assetType}</b></div>`;
  
  // Show capacity for sleeping places
  if (isSleepingPlace) {
    const capacity = asset?.capacity || 0;
    const used = slot.guestCount || 0;
    html += `<div style="margin-bottom:15px;padding:10px;background:#f5f5f5;border-radius:8px;">
      Kapazität: ${used}/${capacity} Gäste
    </div>`;
  }
  
  // Show guests currently placed here
  if (isSleepingPlace && slot.npcs && slot.npcs.length > 0) {
    html += '<div style="font-weight:700;margin:10px 0;">👥 Aktuelle Gäste:</div>';
    for (const npcId of slot.npcs) {
      const npc = player.npcs?.find(n => n.id === npcId);
      if (npc) {
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#e8f5e8;border-radius:6px;margin-bottom:5px;">
          <span>${npc.name} (${npc.type}) - ${npc.income}€/Nacht</span>
          <button class="btn btn-red" style="padding:4px 8px;font-size:12px;" onclick="removeNPC('${npcId}')">Entfernen</button>
        </div>`;
      }
    }
  }
  
  // Show unassigned guests that can fit here
  if (isSleepingPlace) {
    const unassignedGuests = player.npcs?.filter(n => !n.placed) || [];
    
    // Filter guests based on asset type compatibility (from GDD)
    const compatibleGuests = unassignedGuests.filter(npc => {
      switch (slot.assetType) {
        case 'tent':
          // Hippies can stay in tents (max 2 persons)
          return npc.type === 'Hippies' && npc.guests <= 2;
        case 'glamping':
          // Families and Snobs can stay in glamping tents (max 4 persons)
          return (npc.type === 'Familie' || npc.type === 'Snob') && npc.guests <= 4;
        case 'caravan':
          // All types can stay in caravans (max 4 persons)
          return npc.guests <= 4;
        case 'bungalow':
          // Hippies and Families can stay in bungalows (max 6 persons)
          return (npc.type === 'Hippies' || npc.type === 'Familie') && npc.guests <= 6;
        case 'luxurybungalow':
          // Snobs and Families can stay in luxury bungalows (max 8 persons)
          return (npc.type === 'Snob' || npc.type === 'Familie') && npc.guests <= 8;
        default:
          return false;
      }
    });
    
    if (compatibleGuests.length > 0) {
      const availableCapacity = (asset?.capacity || 0) - (slot.guestCount || 0);
      if (availableCapacity > 0) {
        html += '<div style="font-weight:700;margin:10px 0;">➕ Hier platzierbar:</div>';
        for (const npc of compatibleGuests) {
          html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#f0f8ff;border-radius:6px;margin-bottom:5px;">
            <span>${npc.name} (${npc.type}) - ${npc.income}€/Nacht</span>
            <button class="btn btn-green" style="padding:4px 8px;font-size:12px;" onclick="placeNPC('${npc.id}', '${tileId}')">Platzieren</button>
          </div>`;
        }
      } else {
        html += '<div style="color:#666;font-style:italic;margin:10px 0;">🚫 Keine freie Kapazität</div>';
      }
    } else {
      html += '<div style="color:#666;font-style:italic;margin:10px 0;">📭 Keine kompatiblen Gäste verfügbar</div>';
    }
  }
  
  // Action buttons
  html += '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">';
  
  // Move button
  html += `<button class="btn btn-blue" onclick="startMoveAsset('${tileId}')">🔄 Verschieben</button>`;
  
  // Delete button
  html += `<button class="btn btn-red" onclick="deleteAsset('${tileId}')">🗑️ Löschen</button>`;
  
  // Upgrade button
  if ((slot.assetType === 'tent' || slot.assetType === 'bungalow') && asset?.upgradeFrom !== undefined) {
    const upgradeName = slot.assetType === 'tent' ? 'Glamping' : 'Luxus-Bungalow';
    const upgradeCost = asset.upgradePrice;
    html += `<button class="btn btn-orange" onclick="upgradeAsset('${tileId}');closeAssetDetails();">⬆️ Upgraden (${upgradeCost}€)</button>`;
  }
  
  html += '</div>';
  
  document.getElementById('assetDetailsTitle').innerHTML = `📍 ${assetNames[slot.assetType] || slot.assetType}`;
  document.getElementById('assetDetailsContent').innerHTML = html;
  document.getElementById('assetDetailsModal').classList.add('active');
}

function closeAssetDetails() {
  document.getElementById('assetDetailsModal').classList.remove('active');
  currentAssetTileId = null;
}

function removeNPC(npcId) {
  socket.emit('removeNPC', { npcId });
  setTimeout(() => {
    if (currentAssetTileId) {
      const player = gameState.players[myPlayerIndex];
      const slot = player.slots[currentAssetTileId];
      if (slot) showAssetDetails(currentAssetTileId, slot);
    }
  }, 100);
}

// Asset management functions
function startMoveAsset(tileId) {
  closeAssetDetails();
  selectedTile = tileId;
  movingAsset = true;
  renderHexGrid();
  
  // Show hint for moving
  const hint = document.createElement('div');
  hint.id = 'moveHint';
  hint.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px;border-radius:10px;z-index:1000;text-align:center;';
  hint.innerHTML = '<div>🔄 Klicke auf ein leeres Feld, um das Asset zu verschieben</div><button class="btn btn-red" style="margin-top:10px;" onclick="cancelMoveAsset()">Abbrechen</button>';
  document.body.appendChild(hint);
}

function cancelMoveAsset() {
  movingAsset = false;
  selectedTile = null;
  renderHexGrid();
  const hint = document.getElementById('moveHint');
  if (hint) hint.remove();
}

function deleteAsset(tileId) {
  if (confirm('Möchtest du dieses Asset wirklich löschen?')) {
    socket.emit('deleteAsset', { tileId });
    closeAssetDetails();
  }
}

// Asset definitions for frontend
const ASSETS = {
  tent: { price: 50, slots: 1, capacity: 2, upgradeFrom: 'tent', upgradePrice: 50 },
  glamping: { price: 100, slots: 1, capacity: 4, upgradeFrom: 'tent', upgradePrice: 50 },
  caravan: { price: 150, slots: 2, capacity: 4 },
  bungalow: { price: 300, slots: 3, capacity: 6, upgradeFrom: null, upgradePrice: 200 },
  luxurybungalow: { price: 500, slots: 3, capacity: 8, upgradeFrom: 'bungalow', upgradePrice: 200 },
  generator: { price: 200, slots: 2 },
  watertank: { price: 150, slots: 2 },
  sportsfield: { price: 250, slots: 3 },
  campfire: { price: 100, slots: 1 },
  sauna: { price: 350, slots: 2 },
  stage: { price: 400, slots: 3 }
};

function closeTurnSummary() {
  document.getElementById('turnSummaryModal').classList.remove('active');
}

window.addEventListener('resize', initHexCanvas);
