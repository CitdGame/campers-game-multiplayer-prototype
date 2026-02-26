/**
 * TypeScript type definitions for Campers multiplayer game
 */

// Basic types
export type TileId = string;
export type PlayerId = string;
export type AssetType = 'tent' | 'glamping' | 'caravan' | 'bungalow' | 'luxurybungalow' | 'generator' | 'watertank' | 'sportsfield' | 'campfire' | 'sauna' | 'stage';
export type NPCType = 'Hippies' | 'Familie' | 'Snob';
export type CoinType = 'generic' | 'Hippies' | 'Familie' | 'Snob';
export type Quarter = 1 | 2 | 3 | 4;
export type EventType = 'rain' | 'boom' | 'storm' | 'festival' | 'heat' | 'drought' | 'blackout';

// Player interface
export interface Player {
  id: PlayerId;
  name: string;
  money: number;
  slots: Record<TileId, PlayerSlot>;
  electric: number;
  water: number;
  coins: Record<CoinType, number>;
  npcs: NPC[];
  assets: Record<string, any>;
  score?: number;
  socketId?: string;
}

// Player slot interface
export interface PlayerSlot {
  assetType: AssetType | null;
  guestCount: number;
  capacity?: number;
  npcs?: PlayerId[];
  builtAt?: number;
  occupiedBy?: TileId;
}

// NPC interface
export interface NPC {
  id: PlayerId;
  name: string;
  type: NPCType;
  guests: number;
  income: number;
  placed: boolean;
  tileId?: TileId;
  stayDuration: number;
  createdAt: number;
  expiresIn?: number;
}

// Game state interface
export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  year: number;
  quarter: Quarter;
  round: number;
  event: GameEvent | null;
  board: Record<TileId, number>;
  npcs: NPC[];
  currentEvent?: GameEvent | null;
  eventEffects?: EventEffects | null;
  startedAt: number;
}

// Game event interface
export interface GameEvent {
  name: string;
  description: string;
  npcMod?: number;
  waterMod?: number;
  noTents?: boolean;
  preferTents?: boolean;
  noWater?: boolean;
  noElectric?: boolean;
  quarters?: Quarter[];
}

// Event effects interface
export interface EventEffects {
  description: string;
  npcMultiplier: number;
  resourceEffects: Record<string, number>;
  assetRestrictions: Record<string, any>;
}

// Asset configuration interface
export interface AssetConfig {
  price: number;
  slots: number;
  capacity?: number;
  category: 'sleeping' | 'resource' | 'facility';
  upgradeFrom?: AssetType;
  upgradeTo?: AssetType | null | undefined;
  upgradePrice?: number;
  incomeMultiplier?: number;
  produces?: Record<string, number>;
  maintenance?: number;
  satisfies?: NPCType[];
}

// NPC configuration interface
export interface NPCConfig {
  name: string;
  baseIncome: number;
  variance: number;
  minGroupSize: number;
  maxGroupSize: number;
  allowedAssets: AssetType[];
  maxAssetSize: number;
  specialRequirements: string[];
  preferredAssets: AssetType[];
}

// Economy configuration interface
export interface EconomyConfig {
  STARTING_MONEY: number;
  STARTING_SLOTS: number;
  STARTING_ELECTRIC: number;
  STARTING_WATER: number;
  TILE_PRICE: number;
  STARTING_GENERIC_COINS: number;
  MAX_COINS_PER_TYPE: number;
  COINS_PER_TURN: number;
  PROMOTIONS: Record<string, PromotionConfig>;
}

// Promotion configuration interface
export interface PromotionConfig {
  cost: number;
  coinType: CoinType;
  name: string;
}

// Game timing configuration interface
export interface GameTimingConfig {
  ROUNDS_PER_QUARTER: number;
  QUARTERS_PER_YEAR: number;
  TOTAL_ROUNDS: number;
  NPC_EXPIRE_ROUNDS: number;
  BASE_NPCS_PER_TURN: number;
  MIN_PLAYERS: number;
  MAX_PLAYERS: number;
}

// Season configuration interface
export interface SeasonConfig {
  name: string;
  npcMultiplier: number;
  events: EventType[];
}

// Scoring configuration interface
export interface ScoringConfig {
  MONEY_WEIGHT: number;
  ASSET_WEIGHT: number;
  GUEST_WEIGHT: number;
  UPGRADE_WEIGHT: number;
}

// UI configuration interface
export interface UIConfig {
  COLORS: Record<string, string>;
  ICONS: Record<AssetType, string>;
  ASSET_NAMES: Record<AssetType, string>;
  PLAYER_ICONS: readonly string[];
}

// Validation configuration interface
export interface ValidationConfig {
  MAX_GUESTS_PER_ASSET: number;
  MAX_ASSETS_PER_PLAYER: number;
  MAX_MONEY: number;
  MIN_MONEY: number;
  MAX_RESOURCES: number;
  MIN_RESOURCES: number;
}

// Lobby interface
export interface Lobby {
  code: string;
  host: PlayerId;
  players: Player[];
  gameState: GameState | null;
  gameStarted: boolean;
  createdAt: number;
}

// Socket data interfaces
export interface SocketData {
  lobby: string;
  playerId: PlayerId;
}

// Game action interfaces
export interface BuyTileAction {
  type: 'buyTile';
  tileId: TileId;
}

export interface BuyAssetAction {
  type: 'buyAsset';
  assetType: AssetType;
  tileId: TileId;
}

export interface UpgradeAssetAction {
  type: 'upgradeAsset';
  tileId: TileId;
}

export interface MoveAssetAction {
  type: 'moveAsset';
  fromTileId: TileId;
  toTileId: TileId;
}

export interface DeleteAssetAction {
  type: 'deleteAsset';
  tileId: TileId;
}

export interface PlaceNPCAction {
  type: 'placeNPC';
  npcId: PlayerId;
  tileId: TileId;
}

export interface RemoveNPCAction {
  type: 'removeNPC';
  npcId: PlayerId;
}

export interface EndTurnAction {
  type: 'endTurn';
}

export type GameAction = BuyTileAction | BuyAssetAction | UpgradeAssetAction | MoveAssetAction | DeleteAssetAction | PlaceNPCAction | RemoveNPCAction | EndTurnAction;

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  canAfford?: boolean;
  hasSlots?: boolean;
  canPlace?: boolean;
  canUpgrade?: boolean;
  upgradeTo?: AssetType;
  cost?: number;
}

// Game result interface
export interface GameResult {
  income: number;
  electricChange: number;
  waterChange: number;
  gameOver: boolean;
  winner?: WinnerResult;
  expiredNPCs?: NPC[];
  newEvent?: GameEvent | null;
}

// Winner result interface
export interface WinnerResult {
  winner: Player;
  score: number;
}

// Game statistics interface
export interface GameStats {
  duration: {
    minutes: number;
    seconds: number;
    totalMs: number;
  };
  currentTurn: string;
  totalRounds: number;
  players: PlayerStats[];
  currentEvent?: {
    name: string;
    description: string;
  };
}

// Player statistics interface
export interface PlayerStats {
  name: string;
  score: number;
  money: number;
  assets: number;
  guests: number;
}

// NPC statistics interface
export interface NPCStats {
  total: number;
  placed: number;
  unplaced: number;
  byType: Record<NPCType, {
    total: number;
    placed: number;
    income: number;
  }>;
  totalIncome: number;
  averageIncome: number;
}

// Error handling interfaces
export interface GameError extends Error {
  code?: string;
  details?: any;
  isGameError?: boolean;
  isValidationError?: boolean;
  isNetworkError?: boolean;
  field?: string;
  value?: any;
  statusCode?: number;
}

export interface ErrorEntry {
  timestamp: string;
  level: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  stack?: string;
  context: string;
  userId?: string;
  id: string;
}

export interface ErrorStats {
  totalErrors: number;
  recentErrors: number;
  dailyErrors: number;
  totalWarnings: number;
  errorsByContext: Record<string, number>;
  errorsByUser: Record<string, number>;
  lastError: ErrorEntry | null;
}

// Socket event interfaces
export interface CreateLobbyData {
  name: string;
}

export interface JoinLobbyData {
  code: string;
  name: string;
}

export interface StartSoloData {
  playerName: string;
}

export interface RequestGuestData {
  coinType: CoinType;
}

export interface RunPromotionData {
  promotionType: string;
}

export interface PlaceNPCData {
  npcId: PlayerId;
  tileId: TileId;
}

export interface RemoveNPCData {
  npcId: PlayerId;
}

// Frontend specific types
export interface ViewPort {
  x: number;
  y: number;
  scale: number;
  minScale: number;
  maxScale: number;
}

export interface HexCoordinate {
  q: number;
  r: number;
  s: number;
}

export interface CanvasPosition {
  x: number;
  y: number;
}

// Animation types
export interface Animation {
  id: string;
  type: string;
  duration: number;
  startTime: number;
  from: any;
  to: any;
  easing?: (t: number) => number;
}

// Sound types
export interface SoundConfig {
  enabled: boolean;
  volume: number;
  sounds: Record<string, string>;
}

// Localization types
export interface LocalizationStrings {
  [key: string]: {
    [key: string]: string;
  };
}

// Configuration types
export interface GameConfig {
  ECONOMY: EconomyConfig;
  ASSETS: Record<AssetType, AssetConfig>;
  NPC_TYPES: Record<NPCType, NPCConfig>;
  EVENTS: Record<EventType, GameEvent>;
  GAME_TIMING: GameTimingConfig;
  SEASONS: Record<Quarter, SeasonConfig>;
  SCORING: ScoringConfig;
  UI: UIConfig;
  VALIDATION: ValidationConfig;
  GUEST_NAMES: string[];
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Generic function types
export type EventHandler<T = any> = (data: T) => void;
export type Validator<T> = (value: T) => ValidationResult;
export type AsyncFunction<T = any, R = any> = (...args: T[]) => Promise<R>;
export type SyncFunction<T = any, R = any> = (...args: T[]) => R;
