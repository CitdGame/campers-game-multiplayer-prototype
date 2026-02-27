// Asset definitions for frontend - defined FIRST so it's available everywhere
const ASSETS = {
  tent: { price: 50, slots: 1, capacity: 2, upgradeTo: 'glamping', upgradePrice: 50 },
  glamping: { price: 100, slots: 1, capacity: 4 },
  caravan: { price: 150, slots: 2, capacity: 4 },
  bungalow: { price: 300, slots: 3, capacity: 6, upgradeTo: 'luxurybungalow', upgradePrice: 200 },
  luxurybungalow: { price: 500, slots: 3, capacity: 8 },
  generator: { price: 200, slots: 2 },
  watertank: { price: 150, slots: 2 },
  sportsfield: { price: 250, slots: 3 },
  campfire: { price: 100, slots: 1 },
  sauna: { price: 350, slots: 2 },
  stage: { price: 400, slots: 3 }
};

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
let hoveredTile = null; // Currently hovered tile
let movingAsset = false; // Whether we're in asset moving mode
let heldAsset = null; // Asset currently held by player (for new building flow)
let placementMode = false; // Whether we're in asset placement mode
let assetOrientation = 0; // 0=right, 1=down, 2=left, 3=up

// Get tiles for an asset based on orientation
function getTilesForOrientation(centerTileId, slots, orientation) {
  const tiles = [centerTileId];
  const [q, r] = centerTileId.split(',').map(Number);
  
  // Direction offsets for square grid: 0=right, 1=down, 2=left, 3=up
  const directions = [
    [1, 0],   // 0: right
    [0, 1],   // 1: down
    [-1, 0],  // 2: left
    [0, -1]   // 3: up
  ];
  
  const dir = directions[orientation];
  
  for (let i = 1; i < slots; i++) {
    const nq = q + (dir[0] * i);
    const nr = r + (dir[1] * i);
    tiles.push(`${nq},${nr}`);
  }
  
  return tiles;
}

// Check if tiles are valid for placement (owned and empty)
function areTilesValidForPlacement(tiles, playerSlots, oldTiles = []) {
  for (const tileId of tiles) {
    // Allow if it's in the old tiles list (reusing old position)
    if (oldTiles.includes(tileId)) continue;
    
    const slot = playerSlots?.[tileId];
    if (!slot || slot.assetType || slot.occupiedBy) {
      return false;
    }
  }
  return true;
}

// Update canPlaceAsset to accept old tiles for moving
function canPlaceAsset(tileId, asset, playerSlots, oldTiles = []) {
  if (asset.slots === 1) return true; // Single slot assets can always be placed
  
  // Calculate tiles based on orientation
  const tiles = getTilesForOrientation(tileId, asset.slots, assetOrientation);
  
  console.log('Checking placement for tile:', tileId, 'orientation:', assetOrientation, 'tiles:', tiles, 'oldTiles:', oldTiles);
  
  // Check if all tiles are valid (owned and empty, or in old tiles)
  const isValid = areTilesValidForPlacement(tiles, playerSlots, oldTiles);
  console.log('Can place:', isValid);
  
  return isValid;
}

// Get orientation name for display
function getOrientationName(orientation) {
  const names = ['→ Rechts', '↓ Unten', '← Links', '↑ Oben'];
  return names[orientation];
}

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

socket.on('connect', () => {
  console.log('Connected to server');
  // Test connection with heartbeat
  socket.emit('heartbeat');
});

socket.on('heartbeat_response', (data) => {
  console.log('Heartbeat response received:', data);
});

socket.on('soloStarted', (data) => {
  console.log('Solo game started!', data);
  myPlayerIndex = 0;
  gameState = data.gameState;
  document.getElementById('gamePage').style.display = 'block';
  updateGameUI();
  if (data.gameState.npcs) {
    updateGuestBadges(data.gameState.npcs.length);
  }
  
  // Initialize canvas after gamePage is visible
  setTimeout(() => {
    initHexCanvas();
  }, 100);
});

socket.on('gameState', (data) => {
  console.log('Game state updated');
  gameState = data;
  updateGameUI();
  renderHexGrid();
  if (data.npcs) {
    updateGuestBadges(data.npcs.length);
  }
  // Refresh guest panel if open
  if (document.getElementById('guestPanel').classList.contains('active')) {
    renderGuestPanel();
  }
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
  if (data.npcs) {
    updateGuestBadges(data.npcs.length);
  }
  // Refresh guest panel if open
  if (document.getElementById('guestPanel').classList.contains('active')) {
    renderGuestPanel();
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
  // Set canvas to fill container
  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
  
  // Update view center to match new canvas size
  view.x = canvas.width / 2;
  view.y = canvas.height / 2;
  
  renderHexGrid();
  setupCameraControls();
}

function updateCanvasTransform() {
  canvas.style.transform = `translate(${-view.x + canvas.width/2}px, ${-view.y + canvas.height/2}px) scale(${view.scale})`;
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
    // Track hovered tile when in placement or moving mode
    if (placementMode || movingAsset) {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const viewOffsetX = (rect.width / 2) / view.scale - view.x;
      const viewOffsetY = (rect.height / 2) / view.scale - view.y;
     
      const canvasX = clickX / view.scale + viewOffsetX;
      const canvasY = clickY / view.scale + viewOffsetY;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Find the tile under the mouse
      let foundTile = null;
      for (let row = -MAP_RADIUS; row <= MAP_RADIUS; row++) {
        for (let col = -MAP_RADIUS; col <= MAP_RADIUS; col++) {
          const q = col;
          const r = row;
          const s = -q - r;
          
          if (Math.abs(q) > MAP_RADIUS || Math.abs(r) > MAP_RADIUS || Math.abs(s) > MAP_RADIUS) continue;
          
          const x = centerX + (q - r) * (TILE_WIDTH / 2);
          const y = centerY + (q + r) * (TILE_HEIGHT / 2);
          
          const dist = Math.sqrt((canvasX - x) ** 2 + (canvasY - y) ** 2);
          if (dist < HEX_SIZE * 0.9) {
            foundTile = q + ',' + r;
            break;
          }
        }
        if (foundTile) break;
      }
      
      if (hoveredTile !== foundTile) {
        hoveredTile = foundTile;
        renderHexGrid();
      }
    }
    
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
    if (placementMode || movingAsset) {
      hoveredTile = null;
      renderHexGrid();
    }
  });
  
  board.style.cursor = cameraMode ? 'grab' : 'pointer';
}

function renderHexGrid() {
  if (!gameState) return;
  
  const player = gameState.players[myPlayerIndex];
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Use dynamic center based on canvas size
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
      
      drawIsometricHex(x, y, isMine, isUnclaimed, canBuy, ownerIndex, tileId, player);
      
      // Draw asset if owned - but skip tiles that are part of a multi-tile asset (they're drawn on the main tile)
      if (isMine && player.slots) {
        const slot = player.slots[tileId];
        // Only draw on main tile (no occupiedBy) or single-tile assets
        if (slot && slot.assetType && !slot.occupiedBy) {
          drawIsometricAsset(x, y, slot, tileId, player.slots);
        }
      }
    }
  }
}

function drawIsometricHex(x, y, isMine, isUnclaimed, canBuy, ownerIndex, tileId, player) {
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
  
  // Show multi-tile footprint preview
  if (placementMode && heldAsset && heldAsset.slots > 1 && ownerIndex === myPlayerIndex) {
    const tilesToOccupy = getTilesForAsset(tileId, heldAsset);
    const isMainTile = tilesToOccupy[0] === tileId;
    
    if (isMainTile) {
      // Show main tile highlight
      const canPlace = canPlaceAsset(tileId, heldAsset, player.slots);
      
      if (canPlace) {
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Show asset preview on main tile
        const icon = getAssetIcon(heldAsset.type);
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.7;
        ctx.fillText(icon, x, y);
        ctx.globalAlpha = 1.0;
        
        // Show slot requirement indicator
        ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
        ctx.font = '12px Arial';
        ctx.fillText(`Benötigt ${heldAsset.slots} Slots`, x, y + 25);
      } else {
        // Show red highlight for invalid placement
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Show reason
        ctx.fillStyle = 'rgba(244, 67, 54, 0.8)';
        ctx.font = '12px Arial';
        ctx.fillText('Nicht genug Platz!', x, y + 25);
      }
    } else if (tilesToOccupy.includes(tileId)) {
      // Show secondary tiles that will be occupied
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      
      // Show small indicator
      ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Show valid drop targets when moving - highlight hovered tile
  if (movingAsset && selectedTile && tileId === hoveredTile && isMine && !isUnclaimed) {
    const player = gameState.players[myPlayerIndex];
    const slot = player.slots && player.slots[tileId];
    if (slot && !slot.assetType) {
      // Show green highlight for valid drop target
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Animated glow for drop target
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.4)';
      ctx.lineWidth = 12;
      ctx.stroke();
    }
  }
  
  // HOVER HIGHLIGHTING - Show which tiles will be occupied when hovering
  if (hoveredTile && (placementMode || movingAsset)) {
    const player = gameState.players[myPlayerIndex];
    
    // Calculate which tiles would be occupied based on hovered position and orientation
    let tilesToOccupy = [];
    let canPlaceHover = false;
    
    if (placementMode && heldAsset) {
      // Building mode - use heldAsset
      tilesToOccupy = getTilesForAsset(hoveredTile, heldAsset, player.slots);
      canPlaceHover = canPlaceAsset(hoveredTile, heldAsset, player.slots);
    } else if (movingAsset && selectedTile) {
      // Moving mode - need to get the asset from the selected tile
      const selectedSlot = player.slots && player.slots[selectedTile];
      if (selectedSlot && selectedSlot.assetType) {
        const movingAssetData = ASSETS[selectedSlot.assetType];
        if (movingAssetData) {
          // Get old tiles that will be freed when moving
          const oldTiles = selectedSlot.tiles || [selectedTile];
          tilesToOccupy = getTilesForAsset(hoveredTile, movingAssetData, player.slots);
          canPlaceHover = canPlaceAsset(hoveredTile, movingAssetData, player.slots, oldTiles);
        }
      }
    }
    
    // Check if current tile is in the hover footprint
    if (tilesToOccupy.length > 0) {
      const isHovered = tileId === hoveredTile;
      const isInFootprint = tilesToOccupy.includes(tileId);
      
      if (isHovered || isInFootprint) {
        // Highlight color based on validity
        const highlightColor = canPlaceHover ? '#4CAF50' : '#F44336';
        const glowColor = canPlaceHover ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.4)';
        
        // Draw thick highlight border
        ctx.strokeStyle = highlightColor;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Draw glow effect
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 10;
        ctx.stroke();
        
        // If it's the main (hovered) tile, show asset preview
        if (isHovered && canPlaceHover) {
          let assetType = null;
          if (placementMode && heldAsset) {
            assetType = heldAsset.type;
          } else if (movingAsset && selectedTile) {
            const selectedSlot = player.slots && player.slots[selectedTile];
            if (selectedSlot) assetType = selectedSlot.assetType;
          }
          
          if (assetType) {
            const icon = getAssetIcon(assetType);
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.8;
            ctx.fillText(icon, x, y - 10);
            ctx.globalAlpha = 1.0;
          }
        }
        
        // Show label for main tile
        if (isHovered) {
          ctx.fillStyle = canPlaceHover ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(canPlaceHover ? '✓' : '✗', x, y + 25);
        }
        
        // Show small indicator for footprint tiles
        if (isInFootprint && !isHovered) {
          ctx.fillStyle = canPlaceHover ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)';
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
  
  // Show held asset preview in placement mode
  if (placementMode && heldAsset && ownerIndex === myPlayerIndex && !player.slots[tileId]) {
    // Show placement preview
    const canPlace = canPlaceAsset(tileId, heldAsset, player.slots);
    
    if (canPlace) {
      // Show green highlight for valid placement
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Show asset preview
      const icon = getAssetIcon(heldAsset.type);
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.7;
      ctx.fillText(icon, x, y);
      ctx.globalAlpha = 1.0;
      
      // Show slot requirement indicator
      ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
      ctx.font = '12px Arial';
      ctx.fillText(`Benötigt ${heldAsset.slots} Slots`, x, y + 25);
    } else {
      // Show red highlight for invalid placement
      ctx.strokeStyle = '#F44336';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Show reason
      ctx.fillStyle = 'rgba(244, 67, 54, 0.8)';
      ctx.font = '12px Arial';
      ctx.fillText('Nicht genug Platz!', x, y + 25);
    }
  }
  
  // Show multi-slot asset footprint preview
  if (placementMode && heldAsset && heldAsset.slots > 1 && ownerIndex === myPlayerIndex && !player.slots[tileId]) {
    const canPlace = canPlaceAsset(tileId, heldAsset, player.slots);
    if (canPlace) {
      // Show adjacent slots that will be used
      const [q, r] = tileId.split(',').map(Number);
      const neighbors = [
        [q+1, r], [q-1, r], [q, r+1], [q, r-1], [q+1, r-1], [q-1, r+1]
      ];
      
      let slotsUsed = 1; // Current tile
      for (let i = 0; i < Math.min(heldAsset.slots - 1, neighbors.length); i++) {
        const [nq, nr] = neighbors[i];
        const neighborId = `${nq},${nr}`;
        if (!player.slots[neighborId]) {
          const nx = centerX + (nq - nr) * (TILE_WIDTH / 2);
          const ny = centerY + (nq + nr) * (TILE_HEIGHT / 2);
          
          // Draw small indicator for adjacent slots
          ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
          ctx.beginPath();
          ctx.arc(nx, ny, 8, 0, Math.PI * 2);
          ctx.fill();
          
          slotsUsed++;
        }
      }
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

function drawIsometricAsset(x, y, slot, tileId, allSlots) {
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
  
  // Check if this is a multi-tile asset
  const isMultiTile = slot.tiles && slot.tiles.length > 1;
  
  if (isMultiTile && tileId && allSlots) {
    // Calculate center position of all tiles in the asset
    // Use x, y passed to function which are the canvas coordinates of this tile
    const boardCenterX = canvas.width / 2;
    const boardCenterY = canvas.height / 2;
    
    let totalX = 0, totalY = 0;
    const tilePositions = [];
    
    for (const tid of slot.tiles) {
      const [q, r] = tid.split(',').map(Number);
      const tx = boardCenterX + (q - r) * (TILE_WIDTH / 2);
      const ty = boardCenterY + (q + r) * (TILE_HEIGHT / 2);
      totalX += tx;
      totalY += ty;
      tilePositions.push({ x: tx, y: ty });
    }
    
    const centerX_merged = totalX / slot.tiles.length;
    const centerY_merged = totalY / slot.tiles.length;
    
    // Draw merged tile background (larger to cover all tiles)
    ctx.fillStyle = 'rgba(124, 179, 66, 0.8)';
    ctx.beginPath();
    ctx.ellipse(centerX_merged, centerY_merged, hw * slot.tiles.length * 0.6, hh * slot.tiles.length * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw border around merged tiles
    ctx.strokeStyle = '#33691E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX_merged, centerY_merged, hw * slot.tiles.length * 0.6, hh * slot.tiles.length * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw the asset icon at the merged center
    ctx.font = `${28 + slot.tiles.length * 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, centerX_merged, centerY_merged - 10);
    
    // Draw guest count if occupied
    if (slot.guestCount > 0) {
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX_merged + hw * 0.5, centerY_merged - hh * 0.5, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.fillText(slot.guestCount, centerX_merged + hw * 0.5, centerY_merged - hh * 0.5);
    }
  } else {
    // Single tile asset - original drawing
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
}

function checkAdjacent(tileId, playerIndex, board, slots) {
  // Support both old 2-arg and new 4-arg calls
  // When 4 args: board=gameState.board, slots=player.slots
  const playerSlots = arguments.length >= 4 ? slots : gameState.players[playerIndex]?.slots;
  if (!playerSlots) return false;
  
  const [q, r] = tileId.split(',').map(Number);
  
  // All 6 neighbors in axial coordinates
  const neighbors = [
    [q+1, r], [q-1, r], [q, r+1], [q, r-1], [q+1, r-1], [q-1, r+1]
  ];
  
  // Check if any neighbor is owned by player
  for (const [nq, nr] of neighbors) {
    const neighborId = String(nq) + ',' + String(nr);
    if (playerSlots[neighborId]) {
      return true;
    }
  }
  return false;
}

// Click handler on canvas element
canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  const viewOffsetX = (rect.width / 2) / view.scale - view.x;
  const viewOffsetY = (rect.height / 2) / view.scale - view.y;
 
  const canvasX = clickX / view.scale + viewOffsetX;
  const canvasY = clickY / view.scale + viewOffsetY;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
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
        
        // Handle asset placement in placement mode
        if (placementMode && heldAsset && ownerIndex === myPlayerIndex) {
          console.log('=== CLIENT PLACEMENT DEBUG ===');
          console.log('Placement mode:', placementMode);
          console.log('Held asset:', heldAsset);
          console.log('Owner index:', ownerIndex, 'My player index:', myPlayerIndex);
          console.log('Tile ID:', tileId);
          
          const slot = player.slots[tileId];
          const isEmpty = !slot || !slot.assetType;
          console.log('Slot:', slot, 'Is empty:', isEmpty);
          
          if (isEmpty) {
            // Check if we have enough adjacent owned & empty tiles for multi-slot assets
            const canPlace = canPlaceAsset(tileId, heldAsset, player.slots);
            console.log('Can place asset:', canPlace);
            
            if (canPlace) {
              // Get all tiles to occupy for this asset
              const tilesToOccupy = getTilesForAsset(tileId, heldAsset, player.slots);
              console.log('Tiles to occupy:', tilesToOccupy);
              
              // Place asset on multiple tiles
              console.log('Emitting buyAsset event...');
              socket.emit('buyAsset', { type: heldAsset.type, tileId: tilesToOccupy, orientation: assetOrientation });
              cancelPlacement();
              return;
            } else {
              showError(`Nicht genug benachbarte Tiles! Benötige: ${heldAsset.slots}, Verfügbar: ${canPlace ? 'Ja' : 'Nein'}`);
              return;
            }
          }
          console.log('=== END CLIENT PLACEMENT DEBUG ===');
        }
        
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
          let slot = player.slots[tileId];
          let actualTileId = tileId;
          
          console.log('[CLIENT] Clicked on owned tile:', tileId, 'slot:', slot);
          
          // If this tile is occupied by another (part of multi-tile asset), use the main tile
          if (slot && slot.occupiedBy) {
            actualTileId = slot.occupiedBy;
            slot = player.slots[actualTileId];
            console.log('[CLIENT] Using main tile:', actualTileId, 'slot:', slot);
          }
          
          if (!slot || !slot.assetType) {
            // Handle asset moving
            if (movingAsset && selectedTile && selectedTile !== tileId) {
              console.log('[CLIENT] Emitting moveAsset:', selectedTile, '->', tileId);
              socket.emit('moveAsset', { fromTileId: selectedTile, toTileId: tileId, orientation: assetOrientation });
              cancelMoveAsset();
              return;
            } else if (movingAsset) {
              console.log('[CLIENT] Move check failed - movingAsset:', movingAsset, 'selectedTile:', selectedTile, 'tileId:', tileId);
            }
            
            // Normal tile selection for asset placement
            selectedTile = (selectedTile === tileId) ? null : tileId;
            renderHexGrid();
            return;
          }
          
          // Show asset details modal for placed assets
          console.log('[CLIENT] Showing asset details for:', actualTileId, 'slot:', slot);
          showAssetDetails(actualTileId, slot);
          return;
        }
        
        // Buy adjacent unowned tile
        console.log('[CLIENT] Checking tile purchase - ownerIndex:', ownerIndex, 'gameState exists:', !!gameState);
        console.log('[CLIENT] Player slots:', player.slots);
        console.log('[CLIENT] Board state:', gameState.board);
        
        // Check if player already owns this tile (prevent race condition)
        const alreadyOwned = player.slots && player.slots[tileId];
        if (alreadyOwned) {
          console.log('[CLIENT] Tile already owned by player, skipping purchase');
          return;
        }
        
        // Check if tile is unclaimed and player has money
        const playerMoney = player.money || 0;
        const hasMoney = playerMoney >= 100;
        
        // Check adjacency OR allow first purchase (when player has no tiles yet)
        const ownedTileCount = player.slots ? Object.keys(player.slots).length : 0;
        const isFirstTile = ownedTileCount === 0;
        const isAdjacent = checkAdjacent(tileId, myPlayerIndex);
        
        if (ownerIndex === undefined && (isAdjacent || isFirstTile) && hasMoney) {
          console.log('[CLIENT] Emitting buyTile for:', tileId);
          socket.emit('buyTile', { tileId: tileId });
          return;
        } else if (ownerIndex === undefined && !hasMoney) {
          showError('Nicht genug Geld! Du brauchst 100€ um ein Feld zu kaufen.');
          return;
        } else if (ownerIndex === undefined && !isAdjacent && !isFirstTile) {
          showError('Das Feld muss an deinen Campingplatz angrenzen!');
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

function updateGuestBadges(count) {
  // Update modal header badge
  const modalBadge = document.getElementById('requestCountBadge');
  if (modalBadge) {
    modalBadge.textContent = count;
    modalBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }
  
  // Update button badge
  const btnBadge = document.getElementById('guestBtnBadge');
  if (btnBadge) {
    btnBadge.textContent = count;
    btnBadge.style.display = count > 0 ? 'block' : 'none';
  }
}

function renderGuestPanel() {
  if (!gameState) return;
  const player = gameState.players[myPlayerIndex];
  
  document.getElementById('coinGeneric').textContent = player.coins.generic;
  document.getElementById('coinHippies').textContent = player.coins.Hippies || 0;
  document.getElementById('coinFamilie').textContent = player.coins.Familie || 0;
  document.getElementById('coinSnob').textContent = player.coins.Snob || 0;
  
  // Update request count badge
  const requestCount = gameState.npcs ? gameState.npcs.length : 0;
  updateGuestBadges(requestCount);
  
  const npcList = document.getElementById('npcList');
  let html = '';
  
  // Available NPCs to accept
  if (gameState.npcs && gameState.npcs.length > 0) {
    html += '<div style="font-weight:700;margin:10px 0 5px;">Anfragen:</div>';
    for (const npc of gameState.npcs) {
      const typeIcon = { 'Hippies': '🌿', 'Familie': '👨‍👩‍👧‍👦', 'Snob': '👑' }[npc.type] || '🪙';
      const totalEarnings = npc.income * npc.stayDuration;
      const preferredAsset = getPreferredAsset(npc.type);
      
      // Check if player can fulfill needs
      const canFulfill = player.electric >= npc.needs.electric && player.water >= npc.needs.water;
      const needColor = canFulfill ? '#4caf50' : '#f44336';
      const needIcon = canFulfill ? '✓' : '✗';
      
      html += `
        <div style="background:#fff;border:1px solid #ddd;padding:12px;margin:5px 0;border-radius:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:16px;"><b>${npc.name}</b> ${typeIcon}</span>
            <span style="background:#e3f2fd;padding:3px 8px;border-radius:12px;font-size:12px;">${npc.guests} Pers.</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:8px;">
            <div style="background:#f5f5f5;padding:8px;border-radius:6px;">
              <div style="color:#888;">Aufenthalt</div>
              <div style="font-weight:bold;">${npc.stayDuration} Nächte</div>
            </div>
            <div style="background:#f5f5f5;padding:8px;border-radius:6px;">
              <div style="color:#888;">Einkommen</div>
              <div style="font-weight:bold;color:var(--green-dark);">${totalEarnings}€ total</div>
              <div style="color:#666;">${npc.income}€/Nacht</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:8px;">
            <div style="background:#fff3e0;padding:8px;border-radius:6px;">
              <div style="color:#888;">⚡ Strom</div>
              <div style="font-weight:bold;color:${needColor};">${npc.needs.electric} <span style="color:${needColor};">${needIcon}</span></div>
              <div style="color:#666;">Du: ${player.electric}</div>
            </div>
            <div style="background:#e0f7fa;padding:8px;border-radius:6px;">
              <div style="color:#888;">💧 Wasser</div>
              <div style="font-weight:bold;color:${needColor};">${npc.needs.water} <span style="color:${needColor};">${needIcon}</span></div>
              <div style="color:#666;">Du: ${player.water}</div>
            </div>
          </div>
          ${preferredAsset ? `<div style="font-size:11px;color:#666;margin-bottom:8px;">🏠 Bevorzugt: ${preferredAsset}</div>` : ''}
          ${npc.special ? `<div style="font-size:11px;color:#e67e22;margin-bottom:8px;">⭐ Sonderwunsch: ${npc.special}</div>` : ''}
          <button class="btn btn-green" style="width:100%;padding:8px;" onclick="acceptNPC('${npc.id}')">Annehmen</button>
        </div>
      `;
    }
  } else {
    html += '<div style="color:#888;padding:20px;text-align:center;background:#f5f5f5;border-radius:8px;margin-top:10px;">Keine Anfragen verfügbar</div>';
  }
  
  // Accepted NPCs - show where they are placed or allow placement
  if (player.npcs && player.npcs.length > 0) {
    html += '<div style="font-weight:700;margin:15px 0 5px;">Deine Gäste:</div>';
    for (const npc of player.npcs) {
      const typeIcon = { 'Hippies': '🌿', 'Familie': '👨‍👩‍👧‍👦', 'Snob': '👑' }[npc.type] || '🪙';
      const totalEarnings = npc.income * npc.stayDuration;
      const earnedSoFar = npc.income * (npc.nightsStayed || 0);
      
      if (npc.placed) {
        const assetName = getAssetName(npc.tileId ? player.slots?.[npc.tileId]?.assetType : '', true);
        html += `
          <div style="background:#e8f5e9;border:1px solid #4caf50;padding:12px;margin:5px 0;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:16px;"><b>${npc.name}</b> ${typeIcon}</span>
              <span style="background:#c8e6c9;padding:3px 8px;border-radius:12px;font-size:12px;">${npc.guests} Pers.</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:8px;">
              <div style="background:#fff;padding:8px;border-radius:6px;">
                <div style="color:#888;">📍 Unterkunft</div>
                <div style="font-weight:bold;">${assetName}</div>
              </div>
              <div style="background:#fff;padding:8px;border-radius:6px;">
                <div style="color:#888;">⏱️ Nächte</div>
                <div style="font-weight:bold;">${npc.nightsRemaining || npc.stayDuration} übrig</div>
              </div>
            </div>
            <div style="font-size:12px;display:flex;justify-content:space-between;">
              <span style="color:#4caf50;">💰 ${earnedSoFar}€ verdient</span>
              <span style="color:#888;">${totalEarnings}€ total möglich</span>
            </div>
          </div>
        `;
      } else {
        html += `
          <div style="background:#fff3e0;border:1px solid #ff9800;padding:12px;margin:5px 0;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:16px;"><b>${npc.name}</b> ${typeIcon}</span>
              <span style="background:#ffe0b2;padding:3px 8px;border-radius:12px;font-size:12px;">${npc.guests} Pers.</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:8px;">
              <div style="background:#fff;padding:8px;border-radius:6px;">
                <div style="color:#888;">Aufenthalt</div>
                <div style="font-weight:bold;">${npc.stayDuration} Nächte</div>
              </div>
              <div style="background:#fff;padding:8px;border-radius:6px;">
                <div style="color:#888;">Einkommen</div>
                <div style="font-weight:bold;color:var(--green-dark);">${totalEarnings}€ total</div>
              </div>
            </div>
            <div style="font-size:12px;color:#666;margin-bottom:8px;">Noch nicht platziert</div>
            <button class="btn btn-orange" style="width:100%;padding:8px;" onclick="promptPlaceNPC('${npc.id}')">Platzieren</button>
          </div>
        `;
      }
    }
  }
  
  npcList.innerHTML = html;
}

function getPreferredAsset(type) {
  const preferences = {
    'Hippies': '⛺ Zelt oder 🏕️ Glamping',
    'Familie': '🏕️ Glamping, 🚐 Caravan oder 🏠 Bungalow',
    'Snob': '🏕️ Glamping oder 🏰 Luxus-Bungalow'
  };
  return preferences[type] || '';
}

function getAssetName(type, useIcon = false) {
  const names = {
    tent: useIcon ? '⛺ Zelt' : 'Zelt',
    glamping: useIcon ? '🏕️ Glamping' : 'Glamping',
    caravan: useIcon ? '🚐 Caravan' : 'Caravan',
    bungalow: useIcon ? '🏠 Bungalow' : 'Bungalow',
    luxurybungalow: useIcon ? '🏰 Luxus-Bungalow' : 'Luxus-Bungalow',
    generator: useIcon ? '⚡ Generator' : 'Generator',
    watertank: useIcon ? '💧 Wassertank' : 'Wassertank',
    sportsfield: useIcon ? '⚽ Sportplatz' : 'Sportplatz',
    campfire: useIcon ? '🔥 Lagerfeuer' : 'Lagerfeuer',
    sauna: useIcon ? '🧖 Sauna' : 'Sauna',
    stage: useIcon ? '🎭 Bühne' : 'Bühne'
  };
  return names[type] || type;
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
  const player = gameState.players[myPlayerIndex];
  console.log('[buyAsset] player.money:', player.money, 'type:', typeof player.money);
  const asset = ASSETS[type];
  console.log('[buyAsset] asset.price:', asset.price, 'type:', typeof asset.price);
  
  // Check if player has enough money
  if (player.money < asset.price) {
    showError(`Nicht genug Geld! Du brauchst ${asset.price}€, hast aber nur ${player.money}€`);
    return;
  }
  
  // Check if player has enough free slots
  const freeSlots = countFreeSlots(player);
  if (freeSlots < asset.slots) {
    showError(`Nicht genug Platz! Du brauchst ${asset.slots} freie Slots, hast aber nur ${freeSlots}`);
    return;
  }
  
  // Start building flow
  heldAsset = { type, ...asset };
  placementMode = true;
  selectedTile = null;
  assetOrientation = 0; // Reset orientation for new asset
  
  // Close build panel and show placement hint
  closeBuildPanel();
  showPlacementHint(asset);
  
  // Change cursor to indicate placement mode
  document.body.style.cursor = 'crosshair';
  
  renderHexGrid();
}

function showPlacementHint(asset) {
  const hint = document.createElement('div');
  hint.id = 'placementHint';
  hint.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #4CAF50, #2196F3);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    z-index: 1000;
    text-align: center;
    font-weight: bold;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease-out;
  `;
  
  const icon = getAssetIcon(asset.type);
  const orientationText = asset.slots > 1 ? ` (${getOrientationName(assetOrientation)}) - R zum Drehen` : '';
  hint.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 8px;">${icon}</div>
    <div style="font-size: 14px;">Platziere ${asset.name || asset.type}${orientationText}</div>
    <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">Klicke auf ${asset.slots} freie Slots</div>
    <button class="btn btn-red" style="margin-top: 10px; padding: 5px 15px; font-size: 12px;" onclick="cancelPlacement()">Abbrechen</button>
  `;
  
  document.body.appendChild(hint);
  
  // Show held asset display
  showHeldAssetDisplay(asset);
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

function showHeldAssetDisplay(asset) {
  const display = document.getElementById('heldAssetDisplay');
  const info = document.getElementById('heldAssetInfo');
  
  if (display && info) {
    const icon = getAssetIcon(asset.type);
    info.innerHTML = `
      <div style="font-size: 20px; margin-bottom: 5px;">${icon}</div>
      <div style="font-size: 12px; font-weight: bold;">${asset.name || asset.type}</div>
      <div style="font-size: 10px; opacity: 0.8;">Benötigt ${asset.slots} Slots</div>
    `;
    display.style.display = 'block';
  }
}

function hideHeldAssetDisplay() {
  const display = document.getElementById('heldAssetDisplay');
  if (display) {
    display.style.display = 'none';
  }
}

function cancelPlacement() {
  heldAsset = null;
  placementMode = false;
  document.body.style.cursor = 'default';
  
  const hint = document.getElementById('placementHint');
  if (hint) hint.remove();
  
  hideHeldAssetDisplay();
  renderHexGrid();
}

function countFreeSlots(player) {
  const ownedTiles = Object.keys(player.slots || {});
  const totalSlots = player.slots || 0; // This should be the total slots player owns
  return Math.max(0, totalSlots - ownedTiles.length);
}

function getAssetIcon(type) {
  const icons = {
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
  return icons[type] || '❓';
}

function getTilesForAsset(centerTileId, asset, playerSlots) {
  if (asset.slots === 1) {
    return [centerTileId]; // Single slot assets just use the clicked tile
  }
  
  // Use orientation to determine which tiles to use
  const tiles = getTilesForOrientation(centerTileId, asset.slots, assetOrientation);
  
  console.log('Center tile:', centerTileId, 'Orientation:', assetOrientation, 'Tiles:', tiles);
  
  return tiles;
}

// canPlaceAsset is defined earlier at line 61

function acceptNPC(npcId) {
  socket.emit('acceptNPC', { npcId });
}

function requestGuest(type) {
  socket.emit('requestGuest', { type });
}

function runPromotion(type, cost) {
  socket.emit('runPromotion', { type, cost });
}

function upgradeAsset(tileId) {
  socket.emit('upgradeAsset', { tileId });
  setTimeout(() => {
    if (document.getElementById('assetDetailsModal').classList.contains('active')) {
      const player = gameState?.players[myPlayerIndex];
      const slot = player?.slots?.[currentAssetTileId];
      if (slot) {
        showAssetDetails(currentAssetTileId, slot);
      }
    }
  }, 100);
}

function placeNPC(npcId, tileId) {
  socket.emit('placeNPC', { npcId, tileId });
  setTimeout(() => {
    if (document.getElementById('guestPanel').classList.contains('active')) {
      renderGuestPanel();
    }
    if (document.getElementById('assetDetailsModal').classList.contains('active')) {
      const player = gameState?.players[myPlayerIndex];
      const slot = player?.slots?.[currentAssetTileId];
      if (slot) {
        showAssetDetails(currentAssetTileId, slot);
      }
    }
  }, 100);
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
  console.log('[CLIENT] showAssetDetails called');
  currentAssetTileId = tileId;
  const player = gameState.players[myPlayerIndex];
  const asset = ASSETS[slot.assetType];
  
    console.log('[CLIENT] asset:', asset);
    console.log('[CLIENT] assetNames defined');
    
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
  console.log('[CLIENT] isSleepingPlace:', isSleepingPlace);
  
  let html = '';
  
  // Show capacity for sleeping places
  if (isSleepingPlace) {
    console.log('[CLIENT] Building capacity section...');
    const capacity = asset?.capacity || 0;
    const used = slot.guestCount || 0;
    html += `<div style="margin-bottom:15px;padding:10px;background:#f5f5f5;border-radius:8px;">
      Kapazität: ${used}/${capacity} Gäste
    </div>`;
  }
  console.log('[CLIENT] Past capacity section');
  
  // Show guests currently placed here
  const placedGuests = slot.npcs && slot.npcs.length > 0 
    ? slot.npcs.map(id => player.npcs?.find(n => n.id === id)).filter(Boolean)
    : player.npcs?.filter(n => n.placed && n.tileId === tileId) || [];
  console.log('[CLIENT] placedGuests:', placedGuests);
  
  // Show unassigned guests that can fit here
  if (isSleepingPlace) {
    console.log('[CLIENT] Checking compatible guests section...');
    const unassignedGuests = player.npcs?.filter(n => !n.placed) || [];
    console.log('[CLIENT] unassignedGuests:', unassignedGuests);
    
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
  if (asset?.upgradeTo) {
    const upgradeName = asset.upgradeTo === 'glamping' ? 'Glamping' : 'Luxus-Bungalow';
    const upgradeCost = asset.upgradePrice;
    html += `<button class="btn btn-orange" onclick="upgradeAsset('${tileId}');window.closeAssetDetails();">⬆️ Upgraden (${upgradeCost}€)</button>`;
  
  
  html += '</div>';
  
  document.getElementById('assetDetailsTitle').innerHTML = `📍 ${assetNames[slot.assetType] || slot.assetType}`;
  document.getElementById('assetDetailsContent').innerHTML = html;
  console.log('[CLIENT] About to add modal active, html length:', html.length);
  document.getElementById('assetDetailsModal').classList.add('active');
  console.log('[CLIENT] Modal active:', document.getElementById('assetDetailsModal').classList.contains('active'));
}

function closeAssetDetails() {
  console.log('[CLIENT] closeAssetDetails called - stack trace:');
  console.trace();
  document.getElementById('assetDetailsModal').classList.remove('active');
  currentAssetTileId = null;
}

// Also make it globally accessible
window.testCloseAssetDetails = closeAssetDetails;

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
  console.log('[CLIENT] startMoveAsset called for tile:', tileId);
  closeAssetDetails();
  cancelPlacement(); // Cancel any placement mode
  selectedTile = tileId;
  movingAsset = true;
  renderHexGrid();
  
  // Show hint for moving - positioned at top with padding
  const hint = document.createElement('div');
  hint.id = 'moveHint';
  hint.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.9);color:white;padding:15px 25px;border-radius:10px;z-index:1000;text-align:center;max-width:90%;';
  hint.innerHTML = `<div style="margin-bottom:10px;">🔄 Klicke auf ein leeres Feld, um das Asset zu verschieben (${getOrientationName(assetOrientation)}) - R zum Drehen</div><button class="btn btn-red" onclick="cancelMoveAsset()">Abbrechen</button>`;
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

function closeTurnSummary() {
  document.getElementById('turnSummaryModal').classList.remove('active');
}

window.addEventListener('resize', initHexCanvas);

// Rotate asset with R key
window.addEventListener('keydown', (e) => {
  if ((placementMode || movingAsset) && (heldAsset || selectedTile) && e.key.toLowerCase() === 'r') {
    assetOrientation = (assetOrientation + 1) % 4;
    console.log('Rotated to orientation:', assetOrientation);
    renderHexGrid();
    
    // Update the hint if it exists
    const hint = document.getElementById('placementHint') || document.getElementById('moveHint');
    if (hint) {
      if (placementMode && heldAsset) {
        hint.innerHTML = `<div style="margin-bottom:10px;">🔨Asset platzieren: ${getAssetName(heldAsset.type)} (${getOrientationName(assetOrientation)}) - R zum Drehen</div><button class="btn btn-red" onclick="cancelPlacement()">Abbrechen</button>`;
      } else if (movingAsset && selectedTile) {
        hint.innerHTML = `<div style="margin-bottom:10px;">🔄 Asset verschieben (${getOrientationName(assetOrientation)}) - R zum Drehen</div><button class="btn btn-red" style="margin-top:10px;" onclick="cancelMoveAsset()">Abbrechen</button>`;
      }
    }
  }
})

// Make functions globally accessible for HTML onclick handlers
window.closeAssetDetails = closeAssetDetails;
window.deleteAsset = deleteAsset;
window.startMoveAsset = startMoveAsset;
window.cancelMoveAsset = cancelMoveAsset;
window.cancelPlacement = cancelPlacement;
window.upgradeAsset = upgradeAsset;
window.placeNPC = placeNPC;
window.removeNPC = removeNPC;
window.acceptNPC = acceptNPC;
}