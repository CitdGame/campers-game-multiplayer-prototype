/**
 * Frontend Game Configuration
 * Shared constants and configuration values
 */

// Import server config (would be imported in a real build system)
// For now, we'll define the frontend-specific values

// UI Configuration
export const UI = {
  COLORS: {
    PLAYER_TILE: '#7CB342',
    PLAYER_BORDER: '#33691E',
    BUYABLE_TILE: '#FFD54F',
    UNCLAIMED_TILE: '#AED581',
    OTHER_PLAYER_TILE: '#B0BEC5',
    SELECTED_TILE: '#FF5722',
    MOVING_TILE: '#2196F3',
    VALID_DROP_TARGET: '#4CAF50'
  },
  ICONS: {
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
  },
  ASSET_NAMES: {
    tent: 'Zelt',
    glamping: 'Glamping',
    caravan: 'Caravan',
    bungalow: 'Bungalow',
    luxurybungalow: 'Luxus-Bungalow',
    generator: 'Kraftwerk',
    watertank: 'Wassertank',
    sportsfield: 'Sportplatz',
    campfire: 'Lagerfeuer',
    sauna: 'Sauna',
    stage: 'Bühne'
  },
  PLAYER_ICONS: ['🏕️','🎒','🌲','🔥','🎣','⛺','🌻','🏔️']
};

// Asset Configuration (frontend subset)
export const ASSETS = {
  tent: { price: 50, slots: 1, capacity: 2, category: 'sleeping' },
  glamping: { price: 100, slots: 1, capacity: 4, category: 'sleeping' },
  caravan: { price: 150, slots: 2, capacity: 4, category: 'sleeping' },
  bungalow: { price: 300, slots: 3, capacity: 6, category: 'sleeping' },
  luxurybungalow: { price: 500, slots: 3, capacity: 8, category: 'sleeping' },
  generator: { price: 200, slots: 2, category: 'resource' },
  watertank: { price: 150, slots: 2, category: 'resource' },
  sportsfield: { price: 250, slots: 3, category: 'facility' },
  campfire: { price: 100, slots: 1, category: 'facility' },
  sauna: { price: 350, slots: 2, category: 'facility' },
  stage: { price: 400, slots: 3, category: 'facility' }
};

// NPC Compatibility Rules
export const NPC_COMPATIBILITY = {
  Hippies: {
    name: 'Hippies',
    allowedAssets: ['tent', 'glamping', 'caravan', 'bungalow'],
    maxGroupSize: 6,
    description: 'Lieben einfaches Leben und Natur'
  },
  Familie: {
    name: 'Familie',
    allowedAssets: ['glamping', 'caravan', 'bungalow', 'luxurybungalow'],
    maxGroupSize: 8,
    description: 'Brauchen Komfort und Sicherheit'
  },
  Snob: {
    name: 'Snob',
    allowedAssets: ['glamping', 'bungalow', 'luxurybungalow'],
    maxGroupSize: 8,
    description: 'Suchen Luxus und Exklusivität'
  }
};

// Game Timing
export const GAME_TIMING = {
  ROUNDS_PER_QUARTER: 3,
  QUARTERS_PER_YEAR: 4,
  TOTAL_ROUNDS: 12
};

// Animation and Visual Settings
export const VISUAL = {
  HEX_SIZE: 30,
  TILE_WIDTH: 52,
  TILE_HEIGHT: 60,
  BOARD_WIDTH: 800,
  BOARD_HEIGHT: 600,
  MAP_RADIUS: 8,
  ANIMATION_DURATION: 300,
  FADE_DURATION: 200
};

// Sound Effects (placeholders)
export const SOUNDS = {
  PLACE_ASSET: 'place_asset.mp3',
  REMOVE_ASSET: 'remove_asset.mp3',
  COIN_SPEND: 'coin_spend.mp3',
  GUEST_PLACE: 'guest_place.mp3',
  TURN_END: 'turn_end.mp3',
  ERROR: 'error.mp3',
  SUCCESS: 'success.mp3'
};

// Localization
export const STRINGS = {
  GERMAN: {
    MONEY: 'Geld',
    ELECTRIC: 'Strom',
    WATER: 'Wasser',
    COINS: 'Münzen',
    ASSETS: 'Assets',
    GUESTS: 'Gäste',
    TURN: 'Zug',
    YEAR: 'Jahr',
    QUARTER: 'Quartal',
    ROUND: 'Runde',
    SEASON: 'Saison',
    ERROR: 'Fehler',
    SUCCESS: 'Erfolg',
    CONFIRM: 'Bestätigen',
    CANCEL: 'Abbrechen',
    PLACE: 'Platzieren',
    REMOVE: 'Entfernen',
    UPGRADE: 'Upgraden',
    MOVE: 'Verschieben',
    DELETE: 'Löschen',
    BUY: 'Kaufen',
    SELL: 'Verkaufen',
    START: 'Starten',
    END: 'Beenden',
    NEXT: 'Weiter',
    BACK: 'Zurück',
    CLOSE: 'Schließen',
    SAVE: 'Speichern',
    LOAD: 'Laden',
    SETTINGS: 'Einstellungen',
    HELP: 'Hilfe',
    ABOUT: 'Über',
    EXIT: 'Beenden'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  GERMAN: {
    NOT_ENOUGH_MONEY: 'Nicht genug Geld',
    TILE_OCCUPIED: 'Feld bereits belegt',
    NOT_YOUR_TURN: 'Du bist nicht am Zug',
    INVALID_ASSET: 'Ungültiger Asset-Typ',
    NO_GUESTS_AVAILABLE: 'Keine Gäste verfügbar',
    ASSET_FULL: 'Asset ist voll',
    INVALID_POSITION: 'Ungültige Position',
    NETWORK_ERROR: 'Verbindungsfehler',
    GAME_FULL: 'Spiel ist voll',
    LOBBY_NOT_FOUND: 'Lobby nicht gefunden',
    ALREADY_IN_GAME: 'Bereits im Spiel',
    INVALID_CODE: 'Ungültiger Code',
    PERMISSION_DENIED: 'Zugriff verweigert'
  }
};

// Success Messages
export const SUCCESS_MESSAGES = {
  GERMAN: {
    ASSET_PLACED: 'Asset platziert',
    GUEST_PLACED: 'Gast platziert',
    ASSET_UPGRADED: 'Asset upgegradet',
    ASSET_MOVED: 'Asset verschoben',
    ASSET_REMOVED: 'Asset entfernt',
    GUEST_REMOVED: 'Gast entfernt',
    TILE_BOUGHT: 'Feld gekauft',
    PROMOTION_STARTED: 'Promotion gestartet',
    TURN_COMPLETED: 'Zug beendet',
    GAME_STARTED: 'Spiel gestartet',
    GAME_WON: 'Spiel gewonnen'
  }
};

// Help Text
export const HELP_TEXT = {
  GERMAN: {
    GAME_BASICS: 'Baue deinen Campingplatz und manage Gäste, um die meisten Siegespunkte zu erzielen.',
    ASSETS: 'Platziere Assets auf deinen Feldern, um Gäste unterzubringen und Ressourcen zu generieren.',
    GUESTS: 'Verwende Münzen, um Gäste anzufordern und platziere sie in passenden Assets.',
    EVENTS: 'Jedes Quartal gibt es Ereignisse, die das Spiel beeinflussen.',
    VICTORY: 'Das Spiel endet nach 12 Runden (4 Quartale). Der Spieler mit den meisten Punkten gewinnt.',
    CONTROLS: 'Klicke auf Felder, um Aktionen auszuführen. Benutze die Buttons oben für weitere Optionen.'
  }
};

// Validation Rules
export const VALIDATION = {
  PLAYER_NAME_MIN_LENGTH: 1,
  PLAYER_NAME_MAX_LENGTH: 20,
  LOBBY_CODE_LENGTH: 4,
  MAX_CHAT_MESSAGE_LENGTH: 200,
  MAX_ASSETS_PER_PLAYER: 20,
  MAX_GUESTS_PER_ASSET: 8
};

// Performance Settings
export const PERFORMANCE = {
  MAX_PARTICLES: 100,
  UPDATE_INTERVAL: 1000, // ms
  ANIMATION_FPS: 30,
  CANVAS_RESOLUTION: 1.0,
  LAZY_LOAD_DISTANCE: 500
};

// Development Settings
export const DEV = {
  DEBUG_MODE: false,
  SHOW_FPS: false,
  SHOW_GRID: false,
  SHOW_COORDS: false,
  ENABLE_CHEATS: false,
  AUTO_SAVE: true,
  LOG_LEVEL: 'info' // 'debug', 'info', 'warn', 'error'
};

// Export default configuration
export const CONFIG = {
  UI,
  ASSETS,
  NPC_COMPATIBILITY,
  GAME_TIMING,
  VISUAL,
  SOUNDS,
  STRINGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HELP_TEXT,
  VALIDATION,
  PERFORMANCE,
  DEV
};

// Helper functions
export function getAssetIcon(assetType) {
  return UI.ICONS[assetType] || '📦';
}

export function getAssetName(assetType) {
  return UI.ASSET_NAMES[assetType] || assetType;
}

export function getNPCTypeName(npcType) {
  return NPC_COMPATIBILITY[npcType]?.name || npcType;
}

export function formatMoney(amount) {
  return `${amount}€`;
}

export function formatNumber(num) {
  return num.toLocaleString('de-DE');
}

export function getPlayerIcon(playerIndex) {
  return UI.PLAYER_ICONS[playerIndex % UI.PLAYER_ICONS.length];
}

export function getSeasonName(quarter) {
  const seasons = ['', 'Nebensaison', 'Hauptsaison', 'Hauptsaison', 'Nebensaison'];
  return seasons[quarter] || 'Unbekannt';
}

export function getErrorMessage(errorKey, language = 'GERMAN') {
  return ERROR_MESSAGES[language]?.[errorKey] || errorKey;
}

export function getSuccessMessage(successKey, language = 'GERMAN') {
  return SUCCESS_MESSAGES[language]?.[successKey] || successKey;
}

export function isDebugMode() {
  return DEV.DEBUG_MODE || window.location.hostname === 'localhost';
}

export function logDebug(message, ...args) {
  if (isDebugMode()) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
}

export function logError(message, ...args) {
  console.error(`[ERROR] ${message}`, ...args);
}

export function logInfo(message, ...args) {
  console.info(`[INFO] ${message}`, ...args);
}

export function logWarn(message, ...args) {
  console.warn(`[WARN] ${message}`, ...args);
}
