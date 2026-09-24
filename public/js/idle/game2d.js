// Campers: Pocket Resort (2D Pixel Art Engine - Stardew Valley & Pokémon Style)
import { PixelRenderer, PIXEL_COLORS } from './pixelSprites.js';

export const SAVE_KEY = 'campers_pixel_save_v2';
export const SAVE_VERSION = 2;

// Game Configuration Modules
import { CURRENT_EVENT_DEF } from './config/events.js';
import { MANAGER_DEFS, WORKER_DEFS, MANAGER_PREREQS, getManagerWage, getTotalStaffWage } from './config/managers.js';
import { CRATE_DEFS } from './config/crates.js';
import { WORLD_BIOMES, CAMP_MAP_CONFIGS, getCampKey, getCampSizeInfo, getEarthRegionDef, EARTH_REGIONS_100 } from './config/worlds.js';
import { getCampAchievementDefs } from './config/achievements.js';
import { calculateCampActiveRate, calculateCampIdleRate } from './config/rates.js';
import { FRANCHISE_UPGRADE_DEFS } from './config/franchise.js';
import {
  getMaxBuildingLevel,
  getBuildingUpgradeCost,
  getBuildingIncomeMultiplier,
  getBuildingBonusCapacity,
  getTotalBuildingLevels,
  getHighestBuildingLevel
} from './config/buildings.js';
import { GameState } from './state/GameState.js';
import { EconomySystem } from './systems/EconomySystem.js';
import { DrawerUI } from './ui/DrawerUI.js';
import { MainMenuUI } from './ui/MainMenuUI.js';
import { HUDController } from './ui/HUDController.js';
import { ModalsUI } from './ui/ModalsUI.js';

// Re-export constants for full backwards/debug compatibility
export {
  CURRENT_EVENT_DEF,
  MANAGER_DEFS,
  WORKER_DEFS,
  MANAGER_PREREQS,
  CRATE_DEFS,
  WORLD_BIOMES,
  CAMP_MAP_CONFIGS,
  getCampKey,
  getCampSizeInfo,
  getCampAchievementDefs,
  calculateCampActiveRate,
  calculateCampIdleRate,
  FRANCHISE_UPGRADE_DEFS
};

class Campers2DGame {
  constructor() {
    this.canvas = document.getElementById('pixel-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Fixed internal pixel resolution for crisp 16-bit rendering
    this.vHeight = 440;
    this.vWidth = 260; // Recalculated on resize to fit aspect ratio
    this.camX = 0;
    this.camY = 0;
    this.frame = 0;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.initialPinchDist = null;
    this.initialZoom = 1.0;

    // Modular Architecture Subsystems
    this.stateStore = new GameState();
    this.economy = new EconomySystem(this);
    this.drawerUI = new DrawerUI(this);
    this.mainMenuUI = new MainMenuUI(this);
    this.hud = new HUDController(this);
    this.modalsUI = new ModalsUI(this);

    // Game Economy & State (Dual Currency: Local Camp Cash & Global Empire Vault)
    this.state = {
      cash: 150, // Local Camp Cash
      empireGold: 0, // Global Empire Vault (passive revenue from automated camps)
      gems: 25,
      boostTimer: 0,
      boostMultiplier: 1.0,
      world: 1,
      region: 1,
      camp: 1,
      maxUnlockedWorld: 1,
      maxUnlockedRegion: 1,
      maxUnlockedCamp: 1,
      campsCompleted: 0,
      camps: {},
      lastTimestamp: Date.now(),
      powerDemand: 0,
      powerCapacity: 5,
      waterDemand: 0,
      waterCapacity: 5,
      activeCampers: 0,
      campfireJoyTime: 0,
      rangerSpeed: 92, // px per second
      rangerCapacity: 4,
      assistantUnlocked: false,
      franchiseUpgrades: {
        speedLevel: 1,
        capacityLevel: 1,
        investSpeedLevel: 1,
        globalIncomeLevel: 0,
        seedCapitalLevel: 0,
        staffSpeedLevel: 0
      },
      upgrades: {
        speedLevel: 1,
        capacityLevel: 1
      },
      managers: {
        alex: { level: 0, cards: 0 },
        sam: { level: 0, cards: 0 },
        oliver: { level: 0, cards: 0 },
        chloe: { level: 0, cards: 0 },
        felix: { level: 0, cards: 0 },
        finn: { level: 0, cards: 0 },
        bella: { level: 0, cards: 0 },
        robin: { level: 0, cards: 0 }
      },
      crates: {
        freeTimer: 30
      },
      eventProgress: {
        eventId: CURRENT_EVENT_DEF.id,
        points: 0,
        claimed: {}
      },
      achievements: {
        first_checkin: { claimed: false },
        busy_reception: { claimed: false },
        campfire_glow: { claimed: false },
        eco_warrior: { claimed: false },
        clean_sweep: { claimed: false },
        first_expansion: { claimed: false },
        resort_builder: { claimed: false },
        master_angler: { claimed: false },
        snack_attack: { claimed: false },
        cash_flow: { claimed: false },
        power_grid: { claimed: false }
      },
      stats: {
        totalCampersServed: 0,
        woodBurned: 0,
        trashCollected: 0,
        pitchesBuilt: 0,
        utilitiesBuilt: 0,
        fishCaught: 0,
        kioskOrders: 0,
        totalCashEarned: 60
      },
      buildingLevels: {
        tent_1: 1,
        caravan_1: 1
      }
    };

    // Workers alias to managers for entity tracking
    this.state.workers = this.state.managers;

    this.workers = {};
    this.activeMainTab = 'managers';
    this.activeManagerFilter = 'all';
    this.pendingLoot = null;
    this.staffOnStrike = false;
    this.payrollTimer = 0;

    // Entities
    this.player = {
      x: 200,
      y: 470,
      dir: 'up',
      isMoving: false,
      walkCycle: 0,
      carriedItems: 0 // Count of wood logs carried Stardew-style over head
    };

    this.assistant = null;
    this.campers = [];
    this.pitches = [];
    this.buildPads = [];
    this.upgradePads = [];
    this.cashDrops = [];
    this.trashBags = [];
    this.floatTexts = [];
    this.particles = [];

    // Nature
    this.butterflies = [
      { x: 120, y: 280, color: '#f1c40f' },
      { x: 260, y: 380, color: '#5dade2' },
      { x: 340, y: 220, color: '#f48fb1' },
      { x: 140, y: 150, color: '#2ecc71' }
    ];

    // Controls
    this.joystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0, dist: 0 };
    this.keys = { up: false, down: false, left: false, right: false };

    // Timers
    this.camperSpawnTimer = 0;
    this.chopTimer = 0;
    this.fishingTimer = 0;
    this.checkinCooldown = 0;
    this.lastTime = performance.now();

    // Initialize systems
    this.isResetting = false;
    this.isMainMenuOpen = false;

    // Support clean URL reset via ?reset=1 or ?new=1
    if (typeof window !== 'undefined' && (window.location.search.includes('reset=1') || window.location.search.includes('new=1'))) {
      try {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem('campers_pixel_save');
      } catch (e) {}
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    this.completedPads = new Set();
    this.onResize();
    this.initControls();
    this.initUI();
    this.initWorld();
    this.loadState();
    this.closeMainMenu();

    window.addEventListener('beforeunload', () => this.saveState());

    // Start 60fps render loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  onResize() {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const aspect = screenW / screenH;

    this.vWidth = Math.round(this.vHeight * aspect);
    this.canvas.width = this.vWidth;
    this.canvas.height = this.vHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  initWorld() {
    const world = this.state.world || 1;
    const region = this.state.region || 1;
    const camp = this.state.camp || 1;

    // Progression difficulty and scale factors:
    // Camp 1 is smallest and easiest, Camp 10 is biggest and most challenging
    const campProg = (camp - 1) / 9; // 0.0 at camp 1, 1.0 at camp 10
    const regionBonus = (region - 1) * 0.12;
    const worldBonus = (world - 1) * 0.5;

    // Progressive exponential scaling: Camp 1 is 1.0x, Camp 5 is ~2.8x, Camp 10 is ~10.6x
    const campCostScale = Math.pow(1.30, camp - 1);
    const costMult = campCostScale * (1.0 + regionBonus + worldBonus);
    const incomeMult = Math.pow(campCostScale, 0.94) * (1.0 + regionBonus + worldBonus);
    this.costMult = costMult;
    this.incomeMult = incomeMult;

    // World Map dimensions scale dynamically using 10-tier configuration:
    // Camp 1: 380x540 (compact starter) -> Camp 10: 880x1240 (imperial grand resort)
    const campCfg = getCampSizeInfo(camp);
    this.worldW = campCfg.w;
    this.worldH = campCfg.h;

    // Earth Region definition (100 distinct real-world regions)
    this.currentRegionDef = getEarthRegionDef(region);
    this.currentBiome = this.currentRegionDef;
    this.accommodationStyle = this.currentRegionDef.accommodationStyle || 'classic';

    // Key Map Landmarks positioned relative to world size
    const centerX = Math.round(this.worldW / 2);
    this.receptionPos = { x: centerX, y: this.worldH - 140 };
    this.campfirePos = { x: centerX, y: Math.round(this.worldH * 0.48) };
    this.woodpilePos = { x: this.worldW - 85, y: Math.round(this.worldH * 0.48) };
    this.pondPos = { x: this.worldW - 95, y: 105 };
    this.pierPos = { x: this.worldW - 95, y: 133 };
    this.waterPos = { x: 75, y: 95 };
    this.genPos = { x: 75, y: 35 };
    this.kioskPos = { x: centerX + Math.min(130, Math.round(this.worldW * 0.28)), y: this.worldH - 210 };
    this.sportsFieldPos = { x: Math.max(75, Math.round(centerX - this.worldW * 0.32)), y: this.worldH - 210 };
    this.canoePos = { x: this.pondPos.x + 22, y: this.pondPos.y + 12 };
    this.saunaPos = { x: Math.max(85, Math.round(centerX - this.worldW * 0.32)), y: Math.round(this.worldH * 0.28) };

    this.hasWaterPump = false;
    this.hasGenerator = false;
    this.hasKiosk = false;
    this.hasSportsField = false;
    this.hasCanoeDock = false;
    this.hasSauna = false;

    // Reset runtime entities
    this.pitches = [];
    this.buildPads = [];
    this.upgradePads = [];
    this.cashDrops = [];
    this.trashBags = [];
    this.lootBags = [];
    this.floatTexts = [];
    this.particles = [];
    this.campers = [];
    this.raccoon = null;
    this.raccoonTimer = 45.0;
    this.vipCamper = null;
    this.vipTimer = 75.0;

    // --- STARTER PITCHES ---
    this.registerPitch({
      id: 'tent_1',
      name: 'Pup Tent #1',
      tier: 'tent',
      x: Math.round(centerX - 90),
      y: Math.round(this.worldH * 0.48),
      dropX: Math.round(centerX - 70),
      dropY: Math.round(this.worldH * 0.48) + 5,
      capacity: 2,
      guests: [],
      stayDuration: 4.5,
      stayTimer: 0,
      baseIncome: Math.round(35 * incomeMult),
      powerLoad: 0,
      waterLoad: 0
    });

    this.registerPitch({
      id: 'caravan_1',
      name: 'Caravan #1',
      tier: 'caravan',
      x: Math.round(centerX + 90),
      y: Math.round(this.worldH * 0.36),
      dropX: Math.round(centerX + 90),
      dropY: Math.round(this.worldH * 0.36) + 16,
      capacity: 3,
      guests: [],
      stayDuration: 7.5,
      stayTimer: 0,
      baseIncome: Math.round(95 * incomeMult),
      powerLoad: 1,
      waterLoad: 1
    });

    // --- BUILD PADS FOR PROGRESSIVE EXPANSION (UP TO 13 PITCHES) ---
    // Pad 1: Tent #2 (Camp 1+)
    this.createBuildPad({
      id: 'pad_tent_2',
      name: 'Pup Tent #2',
      cost: Math.round(110 * costMult),
      x: Math.round(centerX - 90),
      y: Math.round(this.worldH * 0.38),
      onComplete: (isRestoring = false) => {
        this.registerPitch({
          id: 'tent_2',
          name: 'Pup Tent #2',
          tier: 'tent',
          x: Math.round(centerX - 90),
          y: Math.round(this.worldH * 0.38),
          dropX: Math.round(centerX - 70),
          dropY: Math.round(this.worldH * 0.38) + 5,
          capacity: 2,
          guests: [],
          stayDuration: 4.5,
          stayTimer: 0,
          baseIncome: Math.round(35 * incomeMult),
          powerLoad: 0,
          waterLoad: 0
        });
      }
    });

    // Pad 2: Caravan #2 (Camp 1+)
    this.createBuildPad({
      id: 'pad_caravan_2',
      name: 'Caravan #2',
      cost: Math.round(220 * costMult),
      x: Math.round(centerX + 90),
      y: Math.round(this.worldH * 0.46),
      onComplete: (isRestoring = false) => {
        this.registerPitch({
          id: 'caravan_2',
          name: 'Caravan #2',
          tier: 'caravan',
          x: Math.round(centerX + 90),
          y: Math.round(this.worldH * 0.46),
          dropX: Math.round(centerX + 90),
          dropY: Math.round(this.worldH * 0.46) + 16,
          capacity: 3,
          guests: [],
          stayDuration: 7.5,
          stayTimer: 0,
          baseIncome: Math.round(105 * incomeMult),
          powerLoad: 1,
          waterLoad: 1
        });
      }
    });

    // Pad 3: Tent #3 (Camp 2+)
    if (camp >= 2) {
      this.createBuildPad({
        id: 'pad_tent_3',
        name: 'Pup Tent #3',
        cost: Math.round(280 * costMult),
        x: Math.round(centerX - 90),
        y: Math.round(this.worldH * 0.28),
        onComplete: (isRestoring = false) => {
          this.registerPitch({
            id: 'tent_3',
            name: 'Pup Tent #3',
            tier: 'tent',
            x: Math.round(centerX - 90),
            y: Math.round(this.worldH * 0.28),
            dropX: Math.round(centerX - 70),
            dropY: Math.round(this.worldH * 0.28) + 5,
            capacity: 2,
            guests: [],
            stayDuration: 8.0,
            stayTimer: 0,
            baseIncome: Math.round(30 * incomeMult),
            powerLoad: 0,
            waterLoad: 0
          });
        }
      });
    }

    // Pad 4: Glamping Dome (Camp 3+)
    if (camp >= 3) {
      this.createBuildPad({
        id: 'pad_glamp',
        name: 'Glamping Dome',
        cost: Math.round(580 * costMult),
        x: centerX,
        y: Math.round(this.worldH * 0.24),
        onComplete: (isRestoring = false) => {
          this.registerPitch({
            id: 'glamp_3',
            name: 'Glamping Dome',
            tier: 'glamping',
            x: centerX,
            y: Math.round(this.worldH * 0.24),
            dropX: centerX - 15,
            dropY: Math.round(this.worldH * 0.24) + 15,
            capacity: 2,
            guests: [],
            stayDuration: 14.0,
            stayTimer: 0,
            baseIncome: Math.round(140 * incomeMult),
            powerLoad: 2,
            waterLoad: 2
          });
          if (this.state.managers.felix?.level > 0) {
            this.spawnWorkerEntity('felix');
          }
        }
      });
    }
    // Pad 5: Retro Bus Caravan (Camp 4+)
    if (camp >= 4) {
      this.createBuildPad({
        id: 'pad_caravan_3',
        name: 'Retro Bus Caravan',
        cost: Math.round(480 * costMult),
        x: Math.round(centerX + 95),
        y: Math.round(this.worldH * 0.56),
        onComplete: (isRestoring = false) => {
          this.registerPitch({
            id: 'caravan_3',
            name: 'Retro Bus Caravan',
            tier: 'caravan',
            x: Math.round(centerX + 95),
            y: Math.round(this.worldH * 0.56),
            dropX: Math.round(centerX + 95),
            dropY: Math.round(this.worldH * 0.56) + 16,
            capacity: 3,
            guests: [],
            stayDuration: 12.0,
            stayTimer: 0,
            baseIncome: Math.round(85 * incomeMult),
            powerLoad: 1,
            waterLoad: 1
          });
        }
      });
    }

    // Pad 6: Log Cabin (Camp 5+)
    if (camp >= 5) {
      this.createBuildPad({
        id: 'pad_cabin',
        name: 'Log Cabin',
        cost: Math.round(850 * costMult),
        x: centerX,
        y: Math.round(this.worldH * 0.12),
        onComplete: (isRestoring = false) => {
          this.registerPitch({
            id: 'cabin_4',
            name: 'Log Cabin',
            tier: 'cabin',
            x: centerX,
            y: Math.round(this.worldH * 0.12),
            dropX: centerX + 20,
            dropY: Math.round(this.worldH * 0.12) + 15,
            capacity: 4,
            guests: [],
            stayDuration: 16.0,
            stayTimer: 0,
            baseIncome: Math.round(220 * incomeMult),
            powerLoad: 2,
            waterLoad: 2
          });
          if (this.state.managers.felix?.level > 0) {
            this.spawnWorkerEntity('felix');
          }
        }
      });
    }

    // Pad 7: Starlight Dome (Camp 6+)
    if (camp >= 6) {
      this.createBuildPad({
        id: 'pad_glamp_2',
        name: 'Starlight Dome',
        cost: Math.round(1200 * costMult),
        x: Math.round(centerX - 100),
        y: Math.round(this.worldH * 0.16),
        onComplete: (isRestoring = false) => {
          this.registerPitch({
            id: 'glamp_2',
            name: 'Starlight Dome',
            tier: 'glamping',
            x: Math.round(centerX - 100),
            y: Math.round(this.worldH * 0.16),
            dropX: Math.round(centerX - 85),
            dropY: Math.round(this.worldH * 0.16) + 15,
            capacity: 3,
            guests: [],
            stayDuration: 15.0,
            stayTimer: 0,
            baseIncome: Math.round(180 * incomeMult),
            powerLoad: 2,
            waterLoad: 2
          });
          if (this.state.managers.felix?.level > 0) {
            this.spawnWorkerEntity('felix');
          }
        }
      });
    }

    // Pad 8: Forest Chalet (Camp 7+)
    if (camp >= 7) {
      this.createBuildPad({
        id: 'pad_chalet',
        name: 'Forest Chalet',
        cost: Math.round(1650 * costMult),
        x: Math.round(centerX + 110),
        y: Math.round(this.worldH * 0.16),
        onComplete: (isRestoring = false) => {
          this.registerPitch({
            id: 'chalet_1',
            name: 'Forest Chalet',
            tier: 'chalet',
            x: Math.round(centerX + 110),
            y: Math.round(this.worldH * 0.16),
            dropX: Math.round(centerX + 110),
            dropY: Math.round(this.worldH * 0.16) + 16,
            capacity: 4,
            guests: [],
            stayDuration: 18.0,
            stayTimer: 0,
            baseIncome: Math.round(320 * incomeMult),
            powerLoad: 3,
            waterLoad: 3
          });
          if (this.state.managers.felix?.level > 0) {
            this.spawnWorkerEntity('felix');
          }
        }
      });
    }

    // Pad 9: Luxury RV Haven (Camp 8+)
    if (camp >= 8) {
      this.createBuildPad({
        id: 'pad_caravan_4',
        name: 'Luxury RV Haven',
        cost: Math.round(2200 * costMult),
        x: Math.round(centerX + 120),
        y: Math.round(this.worldH * 0.64),
        onComplete: (isRestoring = false) => {
          this.registerPitch({
            id: 'caravan_4',
            name: 'Luxury RV Haven',
            tier: 'caravan',
            x: Math.round(centerX + 120),
            y: Math.round(this.worldH * 0.64),
            dropX: Math.round(centerX + 120),
            dropY: Math.round(this.worldH * 0.64) + 16,
            capacity: 4,
            guests: [],
            stayDuration: 14.0,
            stayTimer: 0,
            baseIncome: Math.round(260 * incomeMult),
            powerLoad: 2,
            waterLoad: 2
          });
        }
      });
    }

    // Pad 10: Safari Wilderness Lodge (Camp 9+)
    if (camp >= 9) {
      this.createBuildPad({
        id: 'pad_lodge',
        name: 'Safari Lodge',
        cost: Math.round(3200 * costMult),
        x: Math.round(centerX - 120),
        y: Math.round(this.worldH * 0.08),
        onComplete: (isRestoring = false) => {
          this.registerPitch({
            id: 'lodge_1',
            name: 'Safari Lodge',
            tier: 'lodge',
            x: Math.round(centerX - 120),
            y: Math.round(this.worldH * 0.08),
            dropX: Math.round(centerX - 120),
            dropY: Math.round(this.worldH * 0.08) + 16,
            capacity: 5,
            guests: [],
            stayDuration: 20.0,
            stayTimer: 0,
            baseIncome: Math.round(480 * incomeMult),
            powerLoad: 3,
            waterLoad: 3
          });
          if (this.state.managers.felix?.level > 0) {
            this.spawnWorkerEntity('felix');
          }
        }
      });
    }

    // Pad 11: Imperial Royal Villa (Camp 10)
    if (camp >= 10) {
      this.createBuildPad({
        id: 'pad_villa',
        name: 'Imperial Royal Villa',
        cost: Math.round(5000 * costMult),
        x: Math.round(centerX + 120),
        y: Math.round(this.worldH * 0.08),
        onComplete: (isRestoring = false) => {
          this.registerPitch({
            id: 'villa_1',
            name: 'Imperial Royal Villa',
            tier: 'villa',
            x: Math.round(centerX + 120),
            y: Math.round(this.worldH * 0.08),
            dropX: Math.round(centerX + 120),
            dropY: Math.round(this.worldH * 0.08) + 16,
            capacity: 6,
            guests: [],
            stayDuration: 24.0,
            stayTimer: 0,
            baseIncome: Math.round(750 * incomeMult),
            powerLoad: 4,
            waterLoad: 4
          });
          if (this.state.managers.felix?.level > 0) {
            this.spawnWorkerEntity('felix');
          }
        }
      });
    }

    // --- UTILITIES & AMENITIES ---
    this.createBuildPad({
      id: 'pad_water',
      name: 'Water Well',
      cost: Math.round(65 * costMult),
      x: this.waterPos.x,
      y: this.waterPos.y,
      onComplete: (isRestoring = false) => {
        this.hasWaterPump = true;
        this.updateGridLoad();
        this.refreshUpgradePads();
        if (!isRestoring) this.showFloatText(this.waterPos.x, this.waterPos.y, '+💧 Water System!', '#3498db');
        this.updateHUD();
      }
    });

    this.createBuildPad({
      id: 'pad_gen',
      name: 'Generator',
      cost: Math.round(85 * costMult),
      x: this.genPos.x,
      y: this.genPos.y,
      onComplete: (isRestoring = false) => {
        this.hasGenerator = true;
        this.updateGridLoad();
        this.refreshUpgradePads();
        if (!isRestoring) this.showFloatText(this.genPos.x, this.genPos.y, '+⚡ Power Grid!', '#f1c40f');
        this.updateHUD();
      }
    });

    this.createBuildPad({
      id: 'pad_kiosk',
      name: 'Snack Kiosk',
      cost: Math.round(70 * costMult),
      x: this.kioskPos.x,
      y: this.kioskPos.y,
      onComplete: (isRestoring = false) => {
        this.hasKiosk = true;
        this.refreshUpgradePads();
        if (!isRestoring) this.showFloatText(this.kioskPos.x, this.kioskPos.y, '☕ Kiosk Open!', '#e67e22');
        this.updateHUD();
        if (this.state.managers.bella?.level > 0) {
          this.spawnWorkerEntity('bella');
        }
      }
    });

    if (camp >= 5) {
      this.createBuildPad({
        id: 'pad_sports',
        name: 'Sports Field',
        cost: Math.round(130 * costMult),
        x: this.sportsFieldPos.x,
        y: this.sportsFieldPos.y,
        onComplete: (isRestoring = false) => {
          this.hasSportsField = true;
          this.refreshUpgradePads();
          if (!isRestoring) this.showFloatText(this.sportsFieldPos.x, this.sportsFieldPos.y, '⚽ Sports Open!', '#27ae60');
          this.updateHUD();
        }
      });
    }

    if (camp >= 2) {
      this.createBuildPad({
        id: 'pad_canoe',
        name: 'Canoe Rental Dock',
        cost: Math.round(95 * costMult),
        x: this.canoePos.x,
        y: this.canoePos.y,
        onComplete: (isRestoring = false) => {
          this.hasCanoeDock = true;
          this.refreshUpgradePads();
          if (!isRestoring) this.showFloatText(this.canoePos.x, this.canoePos.y, '🛶 Canoe Rental Open!', '#3498db');
          this.updateHUD();
        }
      });
    }

    if (camp >= 4) {
      this.createBuildPad({
        id: 'pad_sauna',
        name: 'Alpine Sauna & Onsen',
        cost: Math.round(180 * costMult),
        x: this.saunaPos.x,
        y: this.saunaPos.y,
        onComplete: (isRestoring = false) => {
          this.hasSauna = true;
          this.refreshUpgradePads();
          this.updateGridLoad();
          if (!isRestoring) this.showFloatText(this.saunaPos.x, this.saunaPos.y, '♨️ Sauna & Springs Open!', '#e67e22');
          this.updateHUD();
        }
      });
    }

    this.createBuildPad({
      id: 'pad_robin',
      name: "Robin's Cards",
      cost: Math.round(75 * costMult),
      x: centerX + Math.min(130, Math.round(this.worldW * 0.28)),
      y: this.worldH - 140,
      onComplete: (isRestoring = false) => {
        if (!isRestoring) {
          if (!this.state.managers.robin) this.state.managers.robin = { level: 0, cards: 0 };
          this.state.managers.robin.cards += 3;
          window.soundFX?.playFanfare();
          this.showFloatText(centerX + Math.min(130, Math.round(this.worldW * 0.28)), this.worldH - 140, '🪵 +3 Epic Robin Cards!', '#9b59b6');
          this.updateHUD();
          this.updateBadges();
        }
      }
    });

    // Perimeter Trees adapted to world dimensions (with open bottom road for arriving campers)
    this.trees = [];
    for (let x = 20; x <= this.worldW - 20; x += 38) {
      this.trees.push({ x, y: 35 });
      if (Math.abs(x - centerX) > 42) {
        this.trees.push({ x, y: this.worldH - 25 });
      }
    }
    for (let y = 60; y <= this.worldH - 60; y += 42) {
      this.trees.push({ x: 25, y });
      this.trees.push({ x: this.worldW - 25, y });
    }

    // Keep player in bounds of dynamic map size
    if (this.player) {
      this.player.x = Math.max(35, Math.min(this.worldW - 35, this.player.x || centerX));
      this.player.y = Math.max(45, Math.min(this.worldH - 45, this.player.y || (this.receptionPos.y + 40)));
    }

    // Reposition any currently active workers to updated landmark coordinates
    if (this.state?.managers && this.workers) {
      Object.keys(this.state.managers).forEach(id => {
        if (this.state.managers[id]?.level > 0 && this.workers[id]) {
          const pos = this.getWorkerDefaultPos(id);
          this.workers[id].x = pos.x;
          this.workers[id].y = pos.y;
        }
      });
    }

    this.refreshUpgradePads();
    this.updateGridLoad();
  }

  createBuildPad(config) {
    this.buildPads.push({
      ...config,
      paid: 0,
      radius: 20,
      isCompleted: false
    });
  }

  registerPitch(pitchData) {
    if (!this.state.buildingLevels) this.state.buildingLevels = {};
    const lvl = this.state.buildingLevels[pitchData.id] || 1;
    this.state.buildingLevels[pitchData.id] = lvl;

    pitchData.level = lvl;
    pitchData.baseCapacity = pitchData.baseCapacity || pitchData.capacity;
    pitchData.capacity = pitchData.baseCapacity + getBuildingBonusCapacity(lvl);
    pitchData.incomeMult = getBuildingIncomeMultiplier(lvl);
    pitchData.rawBaseIncome = pitchData.rawBaseIncome || pitchData.baseIncome;
    pitchData.baseIncome = Math.round(pitchData.rawBaseIncome * pitchData.incomeMult);

    const existingIdx = this.pitches.findIndex(p => p.id === pitchData.id);
    if (existingIdx >= 0) {
      this.pitches[existingIdx] = pitchData;
    } else {
      this.pitches.push(pitchData);
    }
    if (this.ui) {
      this.refreshUpgradePads();
      this.updateGridLoad();
    }
    return pitchData;
  }

  refreshUpgradePads() {
    const world = this.state.world || 1;
    const region = this.state.region || 1;
    const camp = this.state.camp || 1;
    const maxLevel = getMaxBuildingLevel(world, region, camp);
    const costMult = this.costMult || 1.0;

    const previousPaid = {};
    if (this.upgradePads) {
      this.upgradePads.forEach(p => {
        previousPaid[p.buildingId] = p.paid || 0;
      });
    }

    const newUpgradePads = [];

    // 1. Pitches upgrade pads
    this.pitches.forEach(pitch => {
      const curLvl = this.state.buildingLevels?.[pitch.id] || 1;
      if (curLvl < maxLevel) {
        const cost = getBuildingUpgradeCost(pitch.id, curLvl, costMult);
        newUpgradePads.push({
          buildingId: pitch.id,
          buildingType: 'pitch',
          name: pitch.name,
          currentLevel: curLvl,
          targetLevel: curLvl + 1,
          maxLevel,
          cost,
          paid: Math.min(cost, previousPaid[pitch.id] || 0),
          x: pitch.x,
          y: pitch.y + 16,
          radius: 16
        });
      }
    });

    // 2. Utility upgrade pads
    if (this.hasGenerator) {
      const curLvl = this.state.buildingLevels?.['pad_gen'] || 1;
      if (curLvl < maxLevel) {
        const cost = getBuildingUpgradeCost('pad_gen', curLvl, costMult);
        newUpgradePads.push({
          buildingId: 'pad_gen',
          buildingType: 'utility',
          name: 'Generator',
          currentLevel: curLvl,
          targetLevel: curLvl + 1,
          maxLevel,
          cost,
          paid: Math.min(cost, previousPaid['pad_gen'] || 0),
          x: this.genPos.x,
          y: this.genPos.y + 16,
          radius: 16
        });
      }
    }

    if (this.hasWaterPump) {
      const curLvl = this.state.buildingLevels?.['pad_water'] || 1;
      if (curLvl < maxLevel) {
        const cost = getBuildingUpgradeCost('pad_water', curLvl, costMult);
        newUpgradePads.push({
          buildingId: 'pad_water',
          buildingType: 'utility',
          name: 'Water Well',
          currentLevel: curLvl,
          targetLevel: curLvl + 1,
          maxLevel,
          cost,
          paid: Math.min(cost, previousPaid['pad_water'] || 0),
          x: this.waterPos.x,
          y: this.waterPos.y + 16,
          radius: 16
        });
      }
    }

    if (this.hasKiosk) {
      const curLvl = this.state.buildingLevels?.['pad_kiosk'] || 1;
      if (curLvl < maxLevel) {
        const cost = getBuildingUpgradeCost('pad_kiosk', curLvl, costMult);
        newUpgradePads.push({
          buildingId: 'pad_kiosk',
          buildingType: 'utility',
          name: 'Snack Kiosk',
          currentLevel: curLvl,
          targetLevel: curLvl + 1,
          maxLevel,
          cost,
          paid: Math.min(cost, previousPaid['pad_kiosk'] || 0),
          x: this.kioskPos.x,
          y: this.kioskPos.y + 16,
          radius: 16
        });
      }
    }

    if (this.hasSportsField) {
      const curLvl = this.state.buildingLevels?.['pad_sports'] || 1;
      if (curLvl < maxLevel) {
        const cost = getBuildingUpgradeCost('pad_sports', curLvl, costMult);
        newUpgradePads.push({
          buildingId: 'pad_sports',
          buildingType: 'utility',
          name: 'Sports Field',
          currentLevel: curLvl,
          targetLevel: curLvl + 1,
          maxLevel,
          cost,
          paid: Math.min(cost, previousPaid['pad_sports'] || 0),
          x: this.sportsFieldPos.x,
          y: this.sportsFieldPos.y + 16,
          radius: 16
        });
      }
    }

    if (this.hasCanoeDock) {
      const curLvl = this.state.buildingLevels?.['pad_canoe'] || 1;
      if (curLvl < maxLevel) {
        const cost = getBuildingUpgradeCost('pad_canoe', curLvl, costMult);
        newUpgradePads.push({
          buildingId: 'pad_canoe',
          buildingType: 'utility',
          name: 'Canoe Dock',
          currentLevel: curLvl,
          targetLevel: curLvl + 1,
          maxLevel,
          cost,
          paid: Math.min(cost, previousPaid['pad_canoe'] || 0),
          x: this.canoePos.x,
          y: this.canoePos.y + 16,
          radius: 16
        });
      }
    }

    if (this.hasSauna) {
      const curLvl = this.state.buildingLevels?.['pad_sauna'] || 1;
      if (curLvl < maxLevel) {
        const cost = getBuildingUpgradeCost('pad_sauna', curLvl, costMult);
        newUpgradePads.push({
          buildingId: 'pad_sauna',
          buildingType: 'utility',
          name: 'Alpine Sauna',
          currentLevel: curLvl,
          targetLevel: curLvl + 1,
          maxLevel,
          cost,
          paid: Math.min(cost, previousPaid['pad_sauna'] || 0),
          x: this.saunaPos.x,
          y: this.saunaPos.y + 16,
          radius: 16
        });
      }
    }

    this.upgradePads = newUpgradePads;
  }

  updateUpgradePads(dt) {
    if (!this.upgradePads || this.upgradePads.length === 0) return;

    const investLvl = this.state.franchiseUpgrades?.investSpeedLevel || 1;
    const investMult = 1.0 + (investLvl - 1) * 0.50;

    for (let i = this.upgradePads.length - 1; i >= 0; i--) {
      const pad = this.upgradePads[i];
      const dist = Math.hypot(this.player.x - pad.x, this.player.y - pad.y);

      if (dist < pad.radius && this.state.cash > 0 && pad.paid < pad.cost) {
        pad.standTimer = (pad.standTimer || 0) + dt;
        const ramp = Math.min(6.0, 1.0 + pad.standTimer * 1.5);
        const ratePerSec = 160 * investMult * ramp;
        const needed = pad.cost - pad.paid;
        const stream = Math.min(this.state.cash, needed, ratePerSec * dt);

        if (stream > 0) {
          this.state.cash -= stream;
          pad.paid += stream;

          pad.popTimer = (pad.popTimer || 0) + dt;
          if (pad.popTimer >= 0.08) {
            window.soundFX?.playPop();
            pad.popTimer = 0;
          }

          if (Math.random() < 0.35) {
            this.particles.push({
              x: this.player.x + (Math.random() - 0.5) * 8,
              y: this.player.y - 12 + (Math.random() - 0.5) * 8,
              vx: (pad.x - this.player.x) * 1.8 + (Math.random() - 0.5) * 8,
              vy: (pad.y - this.player.y) * 1.8 + (Math.random() - 0.5) * 8,
              size: 2.0,
              life: 0.35,
              color: '#3498db'
            });
          }

          this.updateHUD();
        }

        if (pad.paid >= pad.cost) {
          const newLevel = pad.targetLevel;
          const mult = getBuildingIncomeMultiplier(newLevel);
          window.soundFX?.playFanfare();
          this.showFloatText(pad.x, pad.y - 12, `⭐ ${pad.name} Lv.${newLevel}! (+${Math.round((mult - 1) * 100)}% Ertrag)`, '#3498db');
          this.levelUpBuilding(pad.buildingId, pad.buildingType);
          break;
        }
      } else {
        pad.standTimer = 0;
      }
    }
  }

  levelUpBuilding(buildingId, type = 'pitch') {
    if (!this.state.buildingLevels) this.state.buildingLevels = {};
    const curLevel = this.state.buildingLevels[buildingId] || 1;
    const maxLevel = getMaxBuildingLevel(this.state.world, this.state.region, this.state.camp);
    if (curLevel >= maxLevel) return;

    const newLevel = curLevel + 1;
    this.state.buildingLevels[buildingId] = newLevel;

    const pitch = this.pitches.find(p => p.id === buildingId);
    if (pitch) {
      pitch.level = newLevel;
      pitch.capacity = (pitch.baseCapacity || pitch.capacity) + getBuildingBonusCapacity(newLevel);
      pitch.incomeMult = getBuildingIncomeMultiplier(newLevel);
      pitch.baseIncome = Math.round((pitch.rawBaseIncome || pitch.baseIncome) * pitch.incomeMult);
    }

    if (!this.state.stats) this.state.stats = {};
    this.state.stats.buildingUpgrades = (this.state.stats.buildingUpgrades || 0) + 1;
    this.state.stats.highestBuildingLevel = Math.max(this.state.stats.highestBuildingLevel || 1, newLevel);
    this.state.stats.totalBuildingLevels = getTotalBuildingLevels(this.state.buildingLevels);

    this.updateGridLoad();
    this.refreshUpgradePads();
    this.updateBadges();
    this.saveState();
  }

  getTotalCapacity() {
    return this.pitches.reduce((sum, p) => sum + p.capacity, 0);
  }

  getCurrentGuestsCount() {
    return this.pitches.reduce((sum, p) => sum + p.guests.length, 0);
  }

  updateGridLoad() {
    let power = 0;
    let water = 0;
    this.pitches.forEach(p => {
      power += (p.powerLoad || 0);
      water += (p.waterLoad || 0);
    });
    if (this.hasSauna) {
      water += 2;
    }
    this.state.powerDemand = power;
    this.state.waterDemand = water;

    const camp = this.state.camp || 1;
    let basePowerCap = 5;
    if (this.hasGenerator) {
      const genLvl = this.state.buildingLevels?.['pad_gen'] || 1;
      basePowerCap += (6 + Math.floor(camp * 0.5)) + (genLvl - 1) * 3;
    }
    this.state.powerCapacity = basePowerCap;

    let baseWaterCap = 5;
    if (this.hasWaterPump) {
      const waterLvl = this.state.buildingLevels?.['pad_water'] || 1;
      baseWaterCap += (6 + Math.floor(camp * 0.5)) + (waterLvl - 1) * 3;
    }
    this.state.waterCapacity = baseWaterCap;

    if (this.state.powerDemand > this.state.powerCapacity) {
      window.soundFX?.playOverload();
    }
    this.updateHUD();
  }

  // --- TOUCH JOYSTICK & KEYBOARD CONTROLS ---
  initControls() {
    window.addEventListener('resize', () => this.onResize());

    // Pinch-to-zoom (mobile touch) & Mouse Wheel zoom (desktop)
    window.addEventListener('wheel', (e) => {
      if (this.ui?.upgradesDrawer?.classList.contains('open') || this.isMainMenuOpen) return;
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0015;
      this.targetZoom = Math.max(0.65, Math.min(1.6, this.targetZoom + zoomDelta));
    }, { passive: false });

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        this.initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        this.initialZoom = this.targetZoom;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && this.initialPinchDist) {
        const curDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = curDist / this.initialPinchDist;
        this.targetZoom = Math.max(0.65, Math.min(1.6, this.initialZoom * ratio));
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        this.initialPinchDist = null;
      }
    }, { passive: true });

    const joyBase = document.getElementById('joystick-base');
    const joyKnob = document.getElementById('joystick-knob');

    const handleStart = (cx, cy) => {
      window.soundFX?.ensureContext();
      this.joystick.active = true;
      this.joystick.startX = cx;
      this.joystick.startY = cy;

      joyBase.style.display = 'block';
      joyBase.style.left = `${cx}px`;
      joyBase.style.top = `${cy}px`;
      joyKnob.style.transform = `translate(-50%, -50%) translate(0px, 0px)`;
    };

    const handleMove = (cx, cy) => {
      if (!this.joystick.active) return;
      const dx = cx - this.joystick.startX;
      const dy = cy - this.joystick.startY;
      const dist = Math.hypot(dx, dy);
      const maxDist = 42;
      const clamped = Math.min(dist, maxDist);
      const angle = Math.atan2(dy, dx);

      this.joystick.dx = Math.cos(angle) * (clamped / maxDist);
      this.joystick.dy = Math.sin(angle) * (clamped / maxDist);
      this.joystick.dist = clamped / maxDist;

      const kx = Math.cos(angle) * clamped;
      const ky = Math.sin(angle) * clamped;
      joyKnob.style.transform = `translate(-50%, -50%) translate(${kx}px, ${ky}px)`;
    };

    const handleEnd = () => {
      this.joystick.active = false;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      this.joystick.dist = 0;
      joyBase.style.display = 'none';
    };

    window.addEventListener('touchstart', (e) => {
      if (this.isMainMenuOpen) return;
      if (this.ui?.upgradesDrawer?.classList.contains('open')) return;
      if (this.ui?.worldModal && this.ui.worldModal.style.display !== 'none') return;
      if (this.ui?.crateModal && this.ui.crateModal.style.display !== 'none') return;
      if (this.ui?.eventsModal && this.ui.eventsModal.style.display !== 'none') return;
      if (e.target && e.target.closest && e.target.closest('button, .drawer, .bottom-bar, .top-hud, .banners-container, .modal-overlay, .crate-modal-overlay, .world-modal-overlay, .events-modal-overlay, .main-menu-overlay')) return;
      const t = e.touches[0];
      if (t.clientY > window.innerHeight * 0.35) {
        handleStart(t.clientX, t.clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isMainMenuOpen) return;
      if (this.joystick.active) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', handleEnd, { passive: true });
    window.addEventListener('touchcancel', handleEnd, { passive: true });

    // Mouse fallback
    let isMouseDown = false;
    window.addEventListener('mousedown', (e) => {
      if (this.isMainMenuOpen) return;
      if (this.ui?.upgradesDrawer?.classList.contains('open')) return;
      if (this.ui?.worldModal && this.ui.worldModal.style.display !== 'none') return;
      if (this.ui?.crateModal && this.ui.crateModal.style.display !== 'none') return;
      if (this.ui?.eventsModal && this.ui.eventsModal.style.display !== 'none') return;
      if (e.target && e.target.closest && e.target.closest('button, .drawer, .bottom-bar, .top-hud, .banners-container, .modal-overlay, .crate-modal-overlay, .world-modal-overlay, .events-modal-overlay, .main-menu-overlay')) return;
      if (e.clientY > window.innerHeight * 0.35) {
        isMouseDown = true;
        handleStart(e.clientX, e.clientY);
      }
    });
    window.addEventListener('mousemove', (e) => {
      if (this.isMainMenuOpen) return;
      if (isMouseDown) handleMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => {
      isMouseDown = false;
      handleEnd();
    });

    // Keyboard (WASD & Arrows, case-insensitive)
    window.addEventListener('keydown', (e) => {
      window.soundFX?.ensureContext();
      if (e.key === 'Escape') {
        if (this.ui?.eventsModal?.style.display === 'flex') {
          this.closeEventsModal();
        } else if (this.ui?.worldModal?.style.display === 'flex') {
          this.ui.worldModal.style.display = 'none';
        } else if (this.ui?.upgradesDrawer?.classList.contains('open')) {
          this.ui.upgradesDrawer.classList.remove('open');
        } else {
          this.toggleMainMenu();
        }
        return;
      }
      if (this.isMainMenuOpen) return;

      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') this.keys.up = true;
      if (k === 's' || e.key === 'ArrowDown') this.keys.down = true;
      if (k === 'a' || e.key === 'ArrowLeft') this.keys.left = true;
      if (k === 'd' || e.key === 'ArrowRight') this.keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
      if (this.isMainMenuOpen) {
        this.keys.up = false;
        this.keys.down = false;
        this.keys.left = false;
        this.keys.right = false;
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') this.keys.up = false;
      if (k === 's' || e.key === 'ArrowDown') this.keys.down = false;
      if (k === 'a' || e.key === 'ArrowLeft') this.keys.left = false;
      if (k === 'd' || e.key === 'ArrowRight') this.keys.right = false;
    });
  }

  initUI() {
    this.ui = {
      cash: document.getElementById('hud-cash'),
      hudVault: document.getElementById('hud-vault'),
      hudVaultPill: document.getElementById('hud-vault-pill'),
      hudGems: document.getElementById('hud-gems'),
      hudGemsPill: document.getElementById('hud-gems-pill'),
      power: document.getElementById('hud-power'),
      water: document.getElementById('hud-water'),
      campers: document.getElementById('hud-campers'),
      frenzyBanner: document.getElementById('frenzy-banner'),
      boostBanner: document.getElementById('boost-banner'),
      stackBadge: document.getElementById('stack-badge'),
      goalToastsContainer: document.getElementById('goal-toasts-container'),
      upgradesDrawer: document.getElementById('upgrades-drawer'),
      drawerTitle: document.getElementById('drawer-title'),
      btnCloseDrawer: document.getElementById('btn-close-drawer'),
      mainTabs: document.getElementById('main-drawer-tabs'),
      managerSubTabs: document.getElementById('manager-sub-tabs'),
      drawerContentList: document.getElementById('drawer-content-list'),
      soundBtn: document.getElementById('btn-sound'),
      btnReset: document.getElementById('btn-reset'),
      // Bottom buttons
      btnOpenManagers: document.getElementById('btn-open-managers'),
      btnOpenCrates: document.getElementById('btn-open-crates'),
      btnOpenShop: document.getElementById('btn-open-shop'),
      btnOpenGoals: document.getElementById('btn-open-goals'),
      // Badges
      badgeManagers: document.getElementById('badge-managers'),
      badgeCrates: document.getElementById('badge-crates'),
      badgeGoals: document.getElementById('badge-goals'),
      // World Progression elements
      btnOpenWorld: document.getElementById('btn-open-world'),
      hudWorldInfo: document.getElementById('hud-world-info'),
      hudEmpireIdle: document.getElementById('hud-empire-idle'),
      hudIdleRate: document.getElementById('hud-idle-rate'),
      campCompleteBanner: document.getElementById('camp-complete-banner'),
      worldModal: document.getElementById('world-modal'),
      worldModalTitle: document.getElementById('world-modal-title'),
      worldModalInfo: document.getElementById('world-modal-info'),
      regionCampsGrid: document.getElementById('region-camps-grid'),
      regionCampsList: document.getElementById('region-camps-list'),
      btnReturnHighestCamp: document.getElementById('btn-return-highest-camp'),
      btnAdvanceCamp: document.getElementById('btn-advance-camp'),
      btnCloseWorldModal: document.getElementById('btn-close-world-modal'),
      // Crate modal
      crateModal: document.getElementById('crate-modal'),
      crateModalTitle: document.getElementById('crate-modal-title'),
      crateBoxStage: document.getElementById('crate-box-stage'),
      crateEmojiBounce: document.getElementById('crate-emoji-bounce'),
      crateInstruction: document.getElementById('crate-instruction'),
      crateRewardsContainer: document.getElementById('crate-rewards-container'),
      rewardsCardsRow: document.getElementById('rewards-cards-row'),
      rewardCashBanner: document.getElementById('reward-cash-banner'),
      btnCollectLoot: document.getElementById('btn-collect-loot'),
      // Main Menu elements
      mainMenu: document.getElementById('idle-main-menu'),
      btnOpenMainMenu: document.getElementById('btn-open-main-menu'),
      btnMenuPlay: document.getElementById('btn-menu-play'),
      btnMenuLevels: document.getElementById('btn-menu-levels'),
      btnMenuFranchise: document.getElementById('btn-menu-franchise'),
      btnMenuEvents: document.getElementById('btn-menu-events'),
      btnMenuCrates: document.getElementById('btn-menu-crates'),
      menuBtnSound: document.getElementById('menu-btn-sound'),
      menuBtnMultiplayer: document.getElementById('menu-btn-multiplayer'),
      menuCash: document.getElementById('menu-cash'),
      menuVault: document.getElementById('menu-vault'),
      menuGems: document.getElementById('menu-gems'),
      menuEmpireIdle: document.getElementById('menu-empire-idle'),
      menuIdleRate: document.getElementById('menu-idle-rate'),
      menuCampBadge: document.getElementById('menu-camp-badge'),
      menuCampText: document.getElementById('menu-camp-text'),
      menuCampDesc: document.getElementById('menu-camp-desc'),
      menuLevelSub: document.getElementById('menu-level-sub'),
      menuFranchiseSub: document.getElementById('menu-franchise-sub'),
      menuCrateSub: document.getElementById('menu-crate-sub'),
      menuVaultPill: document.getElementById('menu-vault-pill'),
      menuGemsPill: document.getElementById('menu-gems-pill'),
      btnCloseMainMenu: document.getElementById('btn-close-main-menu'),
      // Regional Trail elements
      btnPrevRegion: document.getElementById('btn-prev-region'),
      btnNextRegion: document.getElementById('btn-next-region'),
      trailRegionTitle: document.getElementById('trail-region-title'),
      trailWorldSubtitle: document.getElementById('trail-world-subtitle'),
      trailProgressFill: document.getElementById('trail-progress-fill'),
      trailProgressText: document.getElementById('trail-progress-text'),
      regionTrailList: document.getElementById('region-trail-list'),
      // Events modal
      eventsModal: document.getElementById('events-modal'),
      btnCloseEventsModal: document.getElementById('btn-close-events-modal'),
      eventTimerBadge: document.getElementById('event-timer-badge'),
      eventPointsText: document.getElementById('event-points-text'),
      eventPointsFill: document.getElementById('event-points-fill'),
      eventMilestonesList: document.getElementById('event-milestones-list')
    };

    const openDrawerTab = (tabName) => {
      window.soundFX?.playUiTap();
      const resolvedTab = tabName === 'ranger' ? 'franchise' : tabName;
      this.activeMainTab = resolvedTab;
      if (this.ui.mainTabs) {
        this.ui.mainTabs.querySelectorAll('.main-tab-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.mainTab === resolvedTab || (resolvedTab === 'franchise' && btn.dataset.mainTab === 'ranger'));
        });
      }
      if (resolvedTab === 'managers' && this.ui.managerSubTabs) {
        this.ui.managerSubTabs.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.toggle('active', (btn.dataset.tab || 'all') === this.activeManagerFilter);
        });
      }
      if (this.ui.drawerContentList) {
        this.ui.drawerContentList.scrollTop = 0;
      }
      this.ui.upgradesDrawer?.classList.add('open');
      this.renderDrawerContent();
    };

    this.ui.btnOpenManagers?.addEventListener('click', () => openDrawerTab('managers'));
    this.ui.btnOpenCrates?.addEventListener('click', () => openDrawerTab('crates'));
    this.ui.btnOpenShop?.addEventListener('click', () => openDrawerTab('shop'));
    this.ui.hudGemsPill?.addEventListener('click', () => openDrawerTab('shop'));
    this.ui.hudVaultPill?.addEventListener('click', () => openDrawerTab('franchise'));
    this.ui.btnOpenGoals?.addEventListener('click', () => openDrawerTab('goals'));
    this.ui.goalToastsContainer?.addEventListener('click', (e) => {
      const toast = e.target.closest('.goal-toast');
      if (toast && toast.dataset.achId) {
        this.hud?.claimGoalToast(toast.dataset.achId);
      }
    });

    // Main Menu Listeners
    this.ui.btnOpenMainMenu?.addEventListener('click', () => this.openMainMenu());
    this.ui.btnCloseMainMenu?.addEventListener('click', () => this.closeMainMenu());
    this.ui.btnMenuPlay?.addEventListener('click', () => this.closeMainMenu());

    // Clicking outside container closes menu
    this.ui.mainMenu?.addEventListener('click', (e) => {
      if (e.target === this.ui.mainMenu) {
        this.closeMainMenu();
      }
    });

    // Subtitle quick return button delegation
    this.ui.trailWorldSubtitle?.addEventListener('click', (e) => {
      const jumpBtn = e.target.closest('#btn-jump-active-camp');
      if (jumpBtn) {
        this.selectedMenuRegion = this.state.region || 1;
        this.renderRegionTrail();
        window.soundFX?.playPop();
      }
    });

    // Currency pills inside main menu
    this.ui.menuVaultPill?.addEventListener('click', () => {
      this.drawerOpenedFromMenu = true;
      this.closeMainMenu();
      openDrawerTab('franchise');
    });
    this.ui.menuGemsPill?.addEventListener('click', () => {
      this.drawerOpenedFromMenu = true;
      this.closeMainMenu();
      openDrawerTab('shop');
    });

    // Dock buttons
    this.ui.btnMenuLevels?.addEventListener('click', () => {
      this.worldModalOpenedFromMenu = true;
      this.closeMainMenu();
      this.openWorldModal();
    });
    this.ui.btnMenuFranchise?.addEventListener('click', () => {
      this.drawerOpenedFromMenu = true;
      this.closeMainMenu();
      openDrawerTab('franchise');
    });
    this.ui.btnMenuEvents?.addEventListener('click', () => {
      this.openEventsModal();
    });
    this.ui.btnMenuCrates?.addEventListener('click', () => {
      this.drawerOpenedFromMenu = true;
      this.closeMainMenu();
      openDrawerTab('crates');
    });
    this.ui.menuBtnSound?.addEventListener('click', () => {
      const isMuted = window.soundFX?.toggleMute();
      if (this.ui.soundBtn) this.ui.soundBtn.textContent = isMuted ? '🔇' : '🔊';
      if (this.ui.menuBtnSound) this.ui.menuBtnSound.textContent = isMuted ? '🔇 Sound: Aus' : '🔊 Sound: An';
    });
    this.ui.menuBtnMultiplayer?.addEventListener('click', () => {
      window.location.href = '/';
    });

    // Regional Trail Navigation Listeners
    this.ui.btnPrevRegion?.addEventListener('click', () => {
      const curReg = this.selectedMenuRegion || this.state.region || 1;
      if (curReg > 1) {
        this.selectedMenuRegion = curReg - 1;
        this.renderRegionTrail();
        window.soundFX?.playPop();
      }
    });

    this.ui.btnNextRegion?.addEventListener('click', () => {
      const curReg = this.selectedMenuRegion || this.state.region || 1;
      const maxReg = this.state.maxUnlockedRegion || this.state.region || 1;
      if (curReg < maxReg) {
        this.selectedMenuRegion = curReg + 1;
        this.renderRegionTrail();
        window.soundFX?.playPop();
      }
    });

    // Trail Node selection / Play click listener
    this.ui.regionTrailList?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-play-camp]');
      const node = e.target.closest('.trail-node[data-camp-num]');
      const campNum = btn ? parseInt(btn.dataset.playCamp, 10) : (node ? parseInt(node.dataset.campNum, 10) : null);
      if (!campNum) return;

      const selRegion = this.selectedMenuRegion || this.state.region || 1;
      const curWorld = this.state.world || 1;
      const maxWorld = this.state.maxUnlockedWorld || 1;
      const maxRegion = this.state.maxUnlockedRegion || 1;
      const maxCamp = this.state.maxUnlockedCamp || 1;

      // If clicking current active camp, immediately resume game!
      if (this.state.world === curWorld && this.state.region === selRegion && this.state.camp === campNum) {
        this.closeMainMenu();
        return;
      }

      const isUnlocked = (curWorld < maxWorld) ||
                         (curWorld === maxWorld && selRegion < maxRegion) ||
                         (curWorld === maxWorld && selRegion === maxRegion && campNum <= maxCamp);

      if (!isUnlocked) {
        window.soundFX?.playError();
        return;
      }

      this.drawerOpenedFromMenu = false;
      this.worldModalOpenedFromMenu = false;
      this.switchCamp(curWorld, selRegion, campNum);
      this.closeMainMenu();
    });

    // Events Modal Listeners
    this.ui.btnCloseEventsModal?.addEventListener('click', () => this.closeEventsModal());
    this.ui.eventMilestonesList?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-claim-milestone]');
      if (!btn) return;
      this.claimEventMilestone(btn.dataset.claimMilestone);
    });

    // World & Progression events
    this.ui.btnOpenWorld?.addEventListener('click', () => this.openWorldModal());
    this.ui.hudEmpireIdle?.addEventListener('click', () => {
      this.worldModalOpenedFromMenu = false;
      this.openWorldModal();
    });
    this.ui.campCompleteBanner?.addEventListener('click', () => this.advanceToNextCamp());
    this.ui.btnCloseWorldModal?.addEventListener('click', () => {
      if (this.ui.worldModal) this.ui.worldModal.style.display = 'none';
      if (this.worldModalOpenedFromMenu) {
        this.worldModalOpenedFromMenu = false;
        this.openMainMenu();
      }
    });
    this.ui.btnAdvanceCamp?.addEventListener('click', () => this.advanceToNextCamp());
    this.ui.btnReturnHighestCamp?.addEventListener('click', () => {
      const maxW = this.state.maxUnlockedWorld || 1;
      const maxR = this.state.maxUnlockedRegion || 1;
      const maxC = this.state.maxUnlockedCamp || 1;
      this.switchCamp(maxW, maxR, maxC);
    });

    // Delegated click listener for camp visit buttons in the world modal
    this.ui.regionCampsList?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-visit-camp]');
      if (!btn) return;
      const targetCamp = parseInt(btn.dataset.visitCamp, 10);
      const targetRegion = parseInt(btn.dataset.visitRegion || this.state.region, 10);
      const targetWorld = parseInt(btn.dataset.visitWorld || this.state.world, 10);
      if (targetCamp > 0) {
        this.drawerOpenedFromMenu = false;
        this.worldModalOpenedFromMenu = false;
        this.switchCamp(targetWorld, targetRegion, targetCamp);
      }
    });

    this.ui.btnCloseDrawer?.addEventListener('click', () => {
      this.ui.upgradesDrawer?.classList.remove('open');
      if (this.drawerOpenedFromMenu) {
        this.drawerOpenedFromMenu = false;
        this.openMainMenu();
      }
    });

    this.ui.soundBtn?.addEventListener('click', () => {
      const isMuted = window.soundFX?.toggleMute();
      this.ui.soundBtn.textContent = isMuted ? '🔇' : '🔊';
      if (this.ui.menuBtnSound) this.ui.menuBtnSound.textContent = isMuted ? '🔇 Sound: Aus' : '🔊 Sound: An';
    });

    this.ui.btnReset?.addEventListener('click', () => {
      this.resetGame();
    });

    // Main section tabs
    this.ui.mainTabs?.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.main-tab-btn');
      if (!tabBtn) return;
      openDrawerTab(tabBtn.dataset.mainTab);
    });

    // Sub-category filter tabs for managers
    this.ui.managerSubTabs?.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.tab-btn');
      if (!tabBtn) return;
      this.ui.managerSubTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      this.activeManagerFilter = tabBtn.dataset.tab || 'all';
      if (this.ui.drawerContentList) {
        this.ui.drawerContentList.scrollTop = 0;
      }
      this.renderDrawerContent();
    });

    // Crate Unboxing click listener on crate stage
    this.ui.crateBoxStage?.addEventListener('click', () => {
      this.revealCrateLoot();
    });

    // Collect loot button click
    this.ui.btnCollectLoot?.addEventListener('click', () => {
      this.collectPendingLoot();
    });

    // Offline Welcome Back modal buttons
    document.getElementById('btn-offline-claim')?.addEventListener('click', () => {
      this.modalsUI.claimOfflineEarnings(false);
    });
    document.getElementById('btn-offline-double')?.addEventListener('click', () => {
      this.modalsUI.claimOfflineEarnings(true);
    });

    this.updateHUD();
    this.updateBadges();
    this.checkCampgroundCompletion();
    this.renderDrawerContent();
  }

  // --- MAIN MENU HUB SYSTEM (Delegated to MainMenuUI) ---
  openMainMenu() { this.mainMenuUI.open(); }
  closeMainMenu() { this.mainMenuUI.close(); }
  toggleMainMenu() { this.mainMenuUI.toggle(); }
  updateMainMenuCurrencies() { this.mainMenuUI.updateCurrencies(); }
  updateMainMenuContent() { this.mainMenuUI.updateCurrencies(); this.mainMenuUI.renderRegionTrail(); }
  renderRegionTrail() { this.mainMenuUI.renderRegionTrail(); }

  // --- SONDEREVENTS SYSTEM ---
  addEventPoints(amount = 1) {
    if (!this.state.eventProgress) {
      this.state.eventProgress = {
        eventId: CURRENT_EVENT_DEF.id,
        points: 0,
        claimed: {}
      };
    }
    this.state.eventProgress.points = (this.state.eventProgress.points || 0) + amount;
    if (this.ui?.eventsModal?.style.display === 'flex') {
      this.renderEventsModal();
    }
  }

  openEventsModal() { this.modalsUI.openEventsModal(); }
  closeEventsModal() { this.modalsUI.closeEventsModal(); }
  renderEventsModal() { this.modalsUI.renderEventsModal(); }
  claimEventMilestone(id) { this.modalsUI.claimEventMilestone(id); }

  addCash(amount, isRaw = false) {
    const globalMult = 1.0 + (this.state.franchiseUpgrades?.globalIncomeLevel || 0) * 0.15;
    let finalAmount = isRaw ? amount : Math.round(amount * globalMult);
    if (!isRaw && this.state.boostTimer > 0 && this.state.boostMultiplier > 1.0) {
      finalAmount = Math.round(finalAmount * this.state.boostMultiplier);
    }
    this.state.cash += finalAmount;
    if (!this.state.stats) this.state.stats = {};
    this.state.stats.totalCashEarned = (this.state.stats.totalCashEarned || 0) + finalAmount;

    // Check if enough cash to end staff strike
    if (this.staffOnStrike) {
      const totalWageRate = getTotalStaffWage(this.state.managers);
      const minPayroll = Math.max(5, Math.round(totalWageRate * 2.5));
      if (this.state.cash >= minPayroll) {
        this.processStaffPayroll(2.5);
      }
    }

    this.updateHUD();
    this.updateBadges();
  }

  processStaffPayroll(seconds = 5.0) {
    const totalWageRate = getTotalStaffWage(this.state.managers);
    if (totalWageRate <= 0) {
      this.staffOnStrike = false;
      return;
    }
    const payrollCost = Math.round(totalWageRate * seconds);

    if (this.state.cash >= payrollCost) {
      this.state.cash -= payrollCost;
      const wasOnStrike = this.staffOnStrike;
      this.staffOnStrike = false;
      if (!this.state.stats) this.state.stats = {};
      this.state.stats.totalWagesPaid = (this.state.stats.totalWagesPaid || 0) + payrollCost;
      this.updateHUD();

      if (wasOnStrike) {
        this.showFloatText(this.player.x, this.player.y - 18, `✅ Gehälter bezahlt (-$${payrollCost})!`, '#2ecc71');
        window.soundFX?.playCoin();
      } else {
        this.showFloatText(this.player.x, this.player.y - 18, `🧾 Gehälter: -$${payrollCost}`, '#e74c3c');
      }

      if (this.ui?.upgradesDrawer?.classList.contains('open') && this.activeMainTab === 'managers') {
        this.renderDrawerContent();
      }
    } else {
      // Insufficient cash: staff pauses work until paid, but player savings are protected!
      this.staffOnStrike = true;
      this.showFloatText(this.player.x, this.player.y - 18, `⚠️ Lohnrückstand ($${payrollCost})! Personal pausiert!`, '#e74c3c');
      window.soundFX?.playThud();

      if (this.ui?.upgradesDrawer?.classList.contains('open') && this.activeMainTab === 'managers') {
        this.renderDrawerContent();
      }
    }
  }

  addEmpireGold(amount) {
    this.state.empireGold = (this.state.empireGold || 0) + amount;
    this.updateHUD();
  }

  spendEmpireGold(amount) {
    if ((this.state.empireGold || 0) < amount) return false;
    this.state.empireGold -= amount;
    this.updateHUD();
    return true;
  }

  addGems(amount) {
    this.state.gems = (this.state.gems || 0) + amount;
    this.updateHUD();
    this.saveState();
  }

  getCurrentCampData() {
    const w = this.state.world || 1;
    const r = this.state.region || 1;
    const c = this.state.camp || 1;
    return {
      world: w,
      region: r,
      camp: c,
      managers: this.state.managers || {},
      completedPads: Array.from(this.completedPads || []),
      hasWaterPump: !!this.hasWaterPump,
      hasGenerator: !!this.hasGenerator,
      hasKiosk: !!this.hasKiosk,
      hasSportsField: !!this.hasSportsField,
      achievements: this.state.achievements || {},
      stats: this.state.stats || {}
    };
  }

  getCurrentCampActiveRate() {
    return calculateCampActiveRate(this.getCurrentCampData());
  }

  buyTimeSkip(sec, cost, label) { this.economy.buyTimeSkip(sec, cost, label); }
  buyIncomeBoost(dur, mult, cost) { this.economy.buyIncomeBoost(dur, mult, cost); }
  buyIAPGems(amt, price, tier) { this.economy.buyIAPGems(amt, price, tier); }
  hireOrUpgradeWorker(id) {
    if (id === 'ranger_speed' || id === 'ranger_cap') {
      this.buyRangerUpgrade(id);
    } else {
      this.activateOrUpgradeManager(id);
    }
  }
  buyFranchiseUpgrade(id) { this.economy.buyFranchiseUpgrade(id); }
  buyRangerUpgrade(id) {
    this.buyFranchiseUpgrade(id);
  }

  getWorkerDefaultPos(id) {
    const centerX = Math.round(this.worldW / 2);
    switch (id) {
      case 'alex':
        return { x: this.receptionPos.x - 8, y: this.receptionPos.y };
      case 'sam':
        return { x: this.receptionPos.x + 8, y: this.receptionPos.y };
      case 'oliver':
        return { x: centerX - 100, y: Math.round(this.worldH * 0.45) };
      case 'chloe':
        return { x: centerX + 100, y: Math.round(this.worldH * 0.45) };
      case 'felix':
        return { x: centerX, y: Math.round(this.worldH * 0.16) };
      case 'finn':
        return { x: this.pierPos.x, y: this.pierPos.y };
      case 'bella':
        return { x: this.kioskPos.x, y: this.kioskPos.y + 6 };
      case 'robin':
        return { x: this.woodpilePos.x - 20, y: this.woodpilePos.y };
      default:
        return { x: centerX, y: this.receptionPos.y };
    }
  }

  getItemPitchTier(item) {
    if (item.pitchTier) return item.pitchTier;
    if (item.pitchId) {
      const p = this.pitches.find(pitch => pitch.id === item.pitchId);
      if (p) return p.tier;
    }
    // Find closest pitch to item
    let closestPitch = null;
    let minDist = Infinity;
    for (let i = 0; i < this.pitches.length; i++) {
      const p = this.pitches[i];
      const px = p.dropX ?? p.x;
      const py = p.dropY ?? p.y;
      const d = Math.hypot(px - item.x, py - item.y);
      if (d < minDist) {
        minDist = d;
        closestPitch = p;
      }
    }
    return closestPitch ? closestPitch.tier : 'tent';
  }

  spawnWorkerEntity(id) {
    const def = MANAGER_DEFS[id];
    if (!def) return;
    if (this.workers[id]) return;
    if (id === 'bella' && !this.hasKiosk) return;
    if (id === 'oliver' && !this.pitches.some(p => p.tier === 'tent')) return;
    if (id === 'chloe' && !this.pitches.some(p => p.tier === 'caravan')) return;
    if (id === 'felix' && !this.pitches.some(p => p.tier === 'glamping' || p.tier === 'cabin' || p.tier === 'chalet' || p.tier === 'lodge' || p.tier === 'villa')) return;

    const pos = this.getWorkerDefaultPos(id);
    this.workers[id] = {
      id,
      name: def.name,
      role: def.role,
      x: pos.x,
      y: pos.y,
      dir: 'down',
      walkCycle: 0,
      timer: 0,
      carriedItems: 0,
      target: null,
      bubble: null,
      bubbleTimer: 0
    };
  }

  activateOrUpgradeManager(id) {
    const def = MANAGER_DEFS[id];
    if (!def) return;

    if (!this.state.managers[id]) {
      this.state.managers[id] = { level: 0, cards: 0 };
    }
    const currentLevel = this.state.managers[id].level;
    if (currentLevel >= def.maxLevel) return;

    let cardsReq = 0;
    let cost = 0;

    if (currentLevel === 0) {
      const prereq = MANAGER_PREREQS[id];
      if (prereq && !prereq.isMet(this)) {
        this.showFloatText(this.player.x, this.player.y - 12, `🔒 ${prereq.label}`, '#e74c3c');
        window.soundFX?.playPop();
        return;
      }
      cardsReq = def.unlockCards;
      cost = def.levels[0].cost;
    } else {
      const nextLevelConfig = def.levels[currentLevel];
      if (!nextLevelConfig) return;
      cardsReq = nextLevelConfig.cardsReq;
      cost = nextLevelConfig.cost;
    }

    if (this.state.managers[id].cards < cardsReq) return;
    if (this.state.cash < cost) return;

    this.state.managers[id].cards -= cardsReq;
    this.state.cash -= cost;
    this.state.managers[id].level++;
    const newLevel = this.state.managers[id].level;

    // Ensure worker entity is spawned and active in world if requirements met
    if (!this.workers[id]) {
      this.spawnWorkerEntity(id);
      if (this.workers[id]) {
        this.showFloatText(def.x, def.y - 12, `${def.icon} ${def.name} Activated!`, '#2ecc71');
      } else {
        this.showFloatText(this.player.x, this.player.y - 12, `${def.icon} ${def.name} Hired (Awaiting Facility)!`, '#2ecc71');
      }
    } else {
      this.showFloatText(this.workers[id].x, this.workers[id].y - 12, `⭐ ${def.name} Lvl ${newLevel}!`, '#f1c40f');
    }

    window.soundFX?.playBuild();
    this.updateHUD();
    this.renderDrawerContent();
    this.updateBadges();
    this.saveState();
  }

  generateCrateLoot(id) { return this.economy.generateCrateLoot(id); }
  openCrate(id) { this.modalsUI.openCrate(id); }
  revealCrateLoot() { this.modalsUI.revealCrateLoot(); }
  collectPendingLoot() { this.modalsUI.collectPendingLoot(); }

  getActiveAchievementDefs() {
    const w = this.state.world || 1;
    const r = this.state.region || 1;
    const c = this.state.camp || 1;
    return getCampAchievementDefs(w, r, c);
  }

  checkCampgroundCompletion() {
    if (!this.ui) return;
    const achDefs = this.getActiveAchievementDefs();
    const allClaimed = achDefs.length > 0 && achDefs.every(a => this.state.achievements?.[a.id]?.claimed);

    if (allClaimed) {
      if (this.ui?.campCompleteBanner) {
        this.ui.campCompleteBanner.style.display = 'flex';
      }
      if (this.ui?.btnOpenWorld) {
        this.ui.btnOpenWorld.classList.add('unlock-ready');
      }
      this.showFloatText(this.player.x, this.player.y - 24, '🚀 ALL GOALS COMPLETE! NEXT RESORT UNLOCKED!', '#f1c40f');
    } else {
      if (this.ui?.campCompleteBanner) {
        this.ui.campCompleteBanner.style.display = 'none';
      }
      if (this.ui?.btnOpenWorld) {
        this.ui.btnOpenWorld.classList.remove('unlock-ready');
      }
    }
  }

  saveCurrentCampData() {
    const w = this.state.world || 1;
    const r = this.state.region || 1;
    const c = this.state.camp || 1;
    const campKey = getCampKey(w, r, c);

    const padsPaid = {};
    this.buildPads.forEach(p => {
      if (p.paid > 0 && !p.isCompleted) {
        padsPaid[p.id] = Math.round(p.paid * 10) / 10;
      }
    });

    const campData = {
      world: w,
      region: r,
      camp: c,
      managers: JSON.parse(JSON.stringify(this.state.managers || {})),
      completedPads: Array.from(this.completedPads || []),
      padsPaid,
      hasWaterPump: !!this.hasWaterPump,
      hasGenerator: !!this.hasGenerator,
      hasKiosk: !!this.hasKiosk,
      hasSportsField: !!this.hasSportsField,
      achievements: JSON.parse(JSON.stringify(this.state.achievements || {})),
      stats: JSON.parse(JSON.stringify(this.state.stats || {})),
      buildingLevels: JSON.parse(JSON.stringify(this.state.buildingLevels || {})),
      pitchesBuilt: this.state.stats?.pitchesBuilt || 0,
      cash: this.state.cash,
      lastVisited: Date.now()
    };

    campData.idleRate = calculateCampIdleRate(campData);
    if (!this.state.camps) this.state.camps = {};
    this.state.camps[campKey] = campData;
    return campData;
  }

  getTotalOtherCampsIdleRate() {
    if (!this.state.camps) return 0;
    const curKey = getCampKey(this.state.world, this.state.region, this.state.camp);
    let sum = 0;
    Object.entries(this.state.camps).forEach(([key, data]) => {
      if (key !== curKey) {
        sum += (data.idleRate || 0);
      }
    });
    return Math.round(sum * 10) / 10;
  }

  switchCamp(targetWorld, targetRegion, targetCamp) {
    if (this.state.world === targetWorld && this.state.region === targetRegion && this.state.camp === targetCamp) {
      if (this.ui.worldModal) this.ui.worldModal.style.display = 'none';
      if (this.ui.upgradesDrawer) this.ui.upgradesDrawer.classList.remove('open');
      return;
    }

    // 1. Save active campsite state before switching
    this.saveCurrentCampData();
    this.hud?.resetGoalToasts();

    // 2. Switch active coordinates
    this.state.world = targetWorld;
    this.state.region = targetRegion;
    this.state.camp = targetCamp;

    const campKey = getCampKey(targetWorld, targetRegion, targetCamp);
    const existing = this.state.camps?.[campKey];

    if (existing) {
      // Restore existing campsite with its active managers, local cash and built facilities
      this.state.cash = existing.cash !== undefined ? existing.cash : 60;
      this.state.managers = JSON.parse(JSON.stringify(existing.managers || {}));
      this.state.workers = this.state.managers;
      this.completedPads = new Set(existing.completedPads || []);
      this.state.achievements = JSON.parse(JSON.stringify(existing.achievements || {}));
      this.state.stats = JSON.parse(JSON.stringify(existing.stats || {}));
      this.hasWaterPump = !!existing.hasWaterPump;
      this.hasGenerator = !!existing.hasGenerator;
      this.hasKiosk = !!existing.hasKiosk;
      this.hasSportsField = !!existing.hasSportsField;
      this.state.buildingLevels = JSON.parse(JSON.stringify(existing.buildingLevels || { tent_1: 1, caravan_1: 1 }));
    } else {
      // Fresh new campsite: starts with base funds + franchise seed capital!
      const seedBonus = (this.state.franchiseUpgrades?.seedCapitalLevel || 0) * 100;
      this.state.cash = 150 + seedBonus;
      this.state.managers = {
        alex: { level: 0, cards: 0 },
        sam: { level: 0, cards: 0 },
        oliver: { level: 0, cards: 0 },
        chloe: { level: 0, cards: 0 },
        felix: { level: 0, cards: 0 },
        finn: { level: 0, cards: 0 },
        bella: { level: 0, cards: 0 },
        robin: { level: 0, cards: 0 }
      };
      this.state.workers = this.state.managers;
      this.completedPads = new Set();
      this.state.achievements = {};
      this.state.stats = {
        totalCampersServed: 0,
        woodBurned: 0,
        trashCollected: 0,
        pitchesBuilt: 0,
        utilitiesBuilt: 0,
        fishCaught: 0,
        kioskOrders: 0,
        totalCashEarned: this.state.cash
      };
      this.hasWaterPump = false;
      this.hasGenerator = false;
      this.hasKiosk = false;
      this.hasSportsField = false;
      this.state.buildingLevels = { tent_1: 1, caravan_1: 1 };
    }

    // 3. Clear active staff entities and re-init world for target camp
    this.workers = {};
    this.initWorld();

    // Restore completed pads in new world layout
    if (existing && existing.completedPads) {
      existing.completedPads.forEach(padId => {
        const idx = this.buildPads.findIndex(p => p.id === padId);
        if (idx >= 0) {
          const pad = this.buildPads[idx];
          pad.isCompleted = true;
          pad.paid = pad.cost;
          pad.onComplete(true);
          this.buildPads.splice(idx, 1);
        }
      });
      if (existing.padsPaid) {
        this.buildPads.forEach(pad => {
          if (existing.padsPaid[pad.id]) {
            pad.paid = Math.min(existing.padsPaid[pad.id], pad.cost);
          }
        });
      }
    }

    this.updateGridLoad();

    // 4. Place player and camera
    this.player.x = this.receptionPos.x;
    this.player.y = this.receptionPos.y + 40;
    this.player.carriedItems = 0;
    this.snapCameraToPlayer();

    // 5. Spawn active managers for this camp
    Object.keys(this.state.managers).forEach(id => {
      if (this.state.managers[id]?.level > 0) {
        this.spawnWorkerEntity(id);
      }
    });

    // Close modals and menu
    if (this.ui.worldModal) this.ui.worldModal.style.display = 'none';
    if (this.ui.upgradesDrawer) this.ui.upgradesDrawer.classList.remove('open');
    if (this.ui.campCompleteBanner) this.ui.campCompleteBanner.style.display = 'none';
    if (this.ui.mainMenu) this.ui.mainMenu.style.display = 'none';
    this.isMainMenuOpen = false;

    window.soundFX?.playFanfare();
    this.showFloatText(this.player.x, this.player.y - 18, `🏕️ Camp #${targetCamp} (${this.currentBiome?.name})!`, '#2ecc71');

    this.updateHUD();
    this.updateBadges();
    this.checkCampgroundCompletion();
    this.saveState();
  }

  advanceToNextCamp() {
    const curCamp = this.state.camp || 1;
    const curRegion = this.state.region || 1;
    const curWorld = this.state.world || 1;

    let nextCamp = curCamp + 1;
    let nextRegion = curRegion;
    let nextWorld = curWorld;
    let isNewRegion = false;
    let isNewWorld = false;

    if (nextCamp > 10) {
      nextCamp = 1;
      nextRegion += 1;
      isNewRegion = true;

      if (nextRegion > 100) {
        nextRegion = 1;
        nextWorld += 1;
        isNewWorld = true;
      }
    }

    let msg = `Advance to Campground #${nextCamp} in Region ${nextRegion}? (Previous camps continue to idle and generate passive income!)`;
    if (isNewWorld) {
      msg = `🎉 CONGRATULATIONS! You cleared all 100 Regions! Unlock World ${nextWorld}: Region 1, Camp 1? (Previous camps continue to idle!)`;
    } else if (isNewRegion) {
      msg = `🎉 REGION ${curRegion} CLEARED! Unlock Region ${nextRegion} (Camp 1) with a new Biome? (Previous camps continue to idle!)`;
    }

    if (!confirm(msg)) return;

    this.state.campsCompleted = (this.state.campsCompleted || 0) + 1;

    // Track highest unlocked stages
    if (nextWorld > (this.state.maxUnlockedWorld || 1)) {
      this.state.maxUnlockedWorld = nextWorld;
      this.state.maxUnlockedRegion = nextRegion;
      this.state.maxUnlockedCamp = nextCamp;
    } else if (nextWorld === (this.state.maxUnlockedWorld || 1)) {
      if (nextRegion > (this.state.maxUnlockedRegion || 1)) {
        this.state.maxUnlockedRegion = nextRegion;
        this.state.maxUnlockedCamp = nextCamp;
      } else if (nextRegion === (this.state.maxUnlockedRegion || 1)) {
        if (nextCamp > (this.state.maxUnlockedCamp || 1)) {
          this.state.maxUnlockedCamp = nextCamp;
        }
      }
    }

    // Preserve and bonus starter cash for the new camp scaled to its tier
    const campCostScale = Math.pow(1.30, nextCamp - 1);
    const transitionBonus = Math.round(50 * campCostScale + (nextRegion - 1) * 120 + (nextWorld - 1) * 600);
    this.addCash(transitionBonus);

    // Switch to new camp!
    this.switchCamp(nextWorld, nextRegion, nextCamp);
  }

  openWorldModal() { this.modalsUI.openWorldModal(); }

  claimAchievement(id) { this.economy.claimAchievement(id); }

  renderDrawerContent(resetScroll = false) { this.drawerUI.render(resetScroll); }

  updateBadges() { this.hud.updateBadges(); }
  updateHUD() { this.hud.updateHUD(); }

  // --- MAIN 60FPS GAME LOOP ---
  loop(timestamp) {
    requestAnimationFrame(this.loop);
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    this.frame++;

    this.update(dt);
    this.render();
  }

  update(dt) {
    if (this.state.crates && this.state.crates.freeTimer > 0) {
      this.state.crates.freeTimer = Math.max(0, this.state.crates.freeTimer - dt);
    }

    if (this.state.boostTimer > 0) {
      this.state.boostTimer = Math.max(0, this.state.boostTimer - dt);
      if (this.state.boostTimer <= 0) {
        this.state.boostMultiplier = 1.0;
        this.updateHUD();
      }
    }

    // Real-time passive empire revenue from all other automated campsites -> Empire Vault Gold
    const idleRate = this.getTotalOtherCampsIdleRate();
    if (idleRate > 0) {
      const effMult = (this.state.boostTimer > 0 && this.state.boostMultiplier > 1.0) ? this.state.boostMultiplier : 1.0;
      const globalMult = 1.0 + (this.state.franchiseUpgrades?.globalIncomeLevel || 0) * 0.15;
      const earned = idleRate * dt * effMult * globalMult;
      this.addEmpireGold(earned);
      if (!this.state.stats) this.state.stats = {};
      this.state.stats.totalVaultGoldEarned = (this.state.stats.totalVaultGoldEarned || 0) + earned;

      this.empireIdleTicker = (this.empireIdleTicker || 0) + dt;
      if (this.empireIdleTicker >= 4.0) {
        this.empireIdleTicker = 0;
        const batch = Math.round(idleRate * 4.0 * effMult * globalMult);
        if (batch >= 1) {
          this.showFloatText(this.player.x, this.player.y - 24, `🏛️ Vault: +$${batch}`, '#ffd700');
        }
      }
    }

    // Staff Salaries / Payroll Cycle (Operating Expenses)
    const staffWageRate = getTotalStaffWage(this.state.managers);
    if (staffWageRate > 0) {
      this.payrollTimer = (this.payrollTimer || 0) + dt;
      if (this.payrollTimer >= 5.0) {
        this.payrollTimer = 0;
        this.processStaffPayroll(5.0);
      }
    } else {
      this.staffOnStrike = false;
      this.payrollTimer = 0;
    }

    if (this.frame % 30 === 0) {
      this.updateBadges();
      if (this.state.boostTimer > 0) {
        this.updateHUD();
      }
      if (this.isMainMenuOpen) {
        this.updateMainMenuCurrencies();
      }
      if (this.ui?.upgradesDrawer?.classList.contains('open') && (this.activeMainTab === 'crates' || this.activeMainTab === 'shop' || this.activeMainTab === 'franchise')) {
        this.renderDrawerContent();
      }
    }

    // Smooth zoom interpolation
    this.zoom += (this.targetZoom - this.zoom) * 0.15;

    // Ambient soundscape (birds, crackling fire, pond water)
    const distToCampfire = Math.hypot(this.player.x - this.campfirePos.x, this.player.y - this.campfirePos.y);
    const distToPond = Math.hypot(this.player.x - this.pondPos.x, this.player.y - this.pondPos.y);
    const isNearCampfire = distToCampfire < 90 || this.state.campfireJoyTime > 0;
    const isNearWater = distToPond < 100;
    window.soundFX?.updateAmbient(dt, isNearCampfire, isNearWater);

    this.updatePlayer(dt);
    this.updateCamera();
    this.updateCampers(dt);
    this.updatePitches(dt);
    this.updateBuildPads(dt);
    this.updateUpgradePads(dt);
    this.updateWoodChopping(dt);
    this.updateCampfire(dt);
    this.updateFishing(dt);
    this.updateKiosk(dt);
    this.updateCanoeDock(dt);
    this.updateSauna(dt);
    this.updateTrashBags(dt);
    this.updateLootBags(dt);
    this.updateRaccoon(dt);
    this.updateVIP(dt);
    this.updateCashDrops(dt);
    this.updateStaffWorkers(dt);
    this.updateParticles(dt);
    this.updateFloatTexts(dt);
  }

  updatePlayer(dt) {
    if (this.isMainMenuOpen) {
      this.player.isMoving = false;
      return;
    }

    let vx = 0;
    let vy = 0;

    if (this.joystick.active) {
      vx = this.joystick.dx;
      vy = this.joystick.dy;
    } else {
      if (this.keys.up) vy -= 1;
      if (this.keys.down) vy += 1;
      if (this.keys.left) vx -= 1;
      if (this.keys.right) vx += 1;
      if (vx !== 0 && vy !== 0) {
        vx *= 0.707;
        vy *= 0.707;
      }
    }

    const isMoving = Math.hypot(vx, vy) > 0.05;
    this.player.isMoving = isMoving;

    if (isMoving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.player.dir = vx > 0 ? 'right' : 'left';
      } else {
        this.player.dir = vy > 0 ? 'down' : 'up';
      }

      this.player.x += vx * this.state.rangerSpeed * dt;
      this.player.y += vy * this.state.rangerSpeed * dt;

      this.player.x = Math.max(35, Math.min(this.worldW - 35, this.player.x));
      this.player.y = Math.max(45, Math.min(this.worldH - 45, this.player.y));

      this.player.walkCycle += dt * 10;

      // Dust puff particles
      if (this.frame % 8 === 0) {
        this.particles.push({
          x: this.player.x + (Math.random() - 0.5) * 6,
          y: this.player.y + 2,
          vx: -vx * 8 + (Math.random() - 0.5) * 4,
          vy: -vy * 8 - Math.random() * 6,
          size: 2,
          life: 0.25,
          color: '#d4b373'
        });
      }
    } else {
      this.player.walkCycle = 0;
    }
  }

  updateCamera() {
    const curZoom = this.zoom || 1.0;
    const effW = this.vWidth / curZoom;
    const effH = this.vHeight / curZoom;

    let targetCenterX;
    if (effW >= this.worldW) {
      targetCenterX = this.worldW / 2;
    } else {
      targetCenterX = Math.max(effW / 2, Math.min(this.worldW - effW / 2, this.player.x));
    }

    let targetCenterY;
    if (effH >= this.worldH) {
      targetCenterY = this.worldH / 2;
    } else {
      targetCenterY = Math.max(effH / 2, Math.min(this.worldH - effH / 2, this.player.y));
    }

    const targetCamX = targetCenterX - this.vWidth / 2;
    const targetCamY = targetCenterY - this.vHeight / 2;

    this.camX += (targetCamX - this.camX) * 0.12;
    this.camY += (targetCamY - this.camY) * 0.12;
  }

  snapCameraToPlayer() {
    const curZoom = this.zoom || 1.0;
    const effW = this.vWidth / curZoom;
    const effH = this.vHeight / curZoom;

    let targetCenterX;
    if (effW >= this.worldW) {
      targetCenterX = this.worldW / 2;
    } else {
      targetCenterX = Math.max(effW / 2, Math.min(this.worldW - effW / 2, this.player.x));
    }

    let targetCenterY;
    if (effH >= this.worldH) {
      targetCenterY = this.worldH / 2;
    } else {
      targetCenterY = Math.max(effH / 2, Math.min(this.worldH - effH / 2, this.player.y));
    }

    this.camX = targetCenterX - this.vWidth / 2;
    this.camY = targetCenterY - this.vHeight / 2;
  }

  // --- RECEPTION & MULTI-GUEST CHECK-IN ---
  updateCampers(dt) {
    this.camperSpawnTimer += dt;
    const isJoy = this.state.campfireJoyTime > 0;
    const spawnThreshold = isJoy ? 2.2 : 3.5;
    const queueCampers = this.campers.filter(c => c.state === 'queueing');

    if (this.camperSpawnTimer > spawnThreshold && queueCampers.length < 10) {
      this.camperSpawnTimer = 0;
      this.spawnCamperGroup();
    }

    if (this.checkinCooldown > 0) {
      this.checkinCooldown -= dt;
    }

    // Is Ranger standing at the Reception desk?
    const distToReception = Math.hypot(this.player.x - this.receptionPos.x, this.player.y - this.receptionPos.y);
    const canCheckin = distToReception < 28 && this.checkinCooldown <= 0;

    // Check in waiting camper parties if open beds exist
    if (canCheckin && queueCampers.length > 0) {
      // Group queueing campers into distinct parties in arrival order
      const partyMap = new Map();
      queueCampers.forEach(c => {
        if (!partyMap.has(c.partyId)) {
          partyMap.set(c.partyId, []);
        }
        partyMap.get(c.partyId).push(c);
      });

      // Check each waiting party in queue order
      for (const [partyId, party] of partyMap.entries()) {
        const partyLeader = party[0];
        const partySize = party.length;
        const waitTime = partyLeader.queueWaitTime || 0;

        const pitch = this.findAvailablePitch(partyLeader.requestedTier, partySize, waitTime);
        if (pitch) {
          this.checkinCooldown = 0.20; // Rapid smooth check-in cadence

          const isUpgrade = pitch.tier !== partyLeader.requestedTier;
          party.forEach((camper) => {
            camper.state = 'walking_to_pitch';
            camper.targetPitch = pitch;
            camper.spotIndex = pitch.guests.length;
            pitch.guests.push(camper);
            camper.bubble = isUpgrade ? '✨' : '❤️';
          });

          window.soundFX?.playCheckin();
          const basePerGuest = pitch.baseIncome ? Math.round(pitch.baseIncome / pitch.capacity) : 15;
          const clerkTip = (this.state.managers.alex?.level > 1 ? 5 : 0) + (this.state.managers.sam?.level > 0 ? 5 : 0);
          const fee = (Math.max(6, Math.round(basePerGuest * 0.35)) + clerkTip) * partySize;
          this.addCash(fee);
          if (!this.state.stats) this.state.stats = {};
          this.state.stats.totalCampersServed = (this.state.stats.totalCampersServed || 0) + partySize;
          this.showFloatText(this.player.x, this.player.y - 10, `+$${fee} -> ${pitch.name} (${partySize})`, '#f1c40f');
          break; // Check in one party per cycle
        }
      }
    }

    // Update each camper movement & state
    for (let i = this.campers.length - 1; i >= 0; i--) {
      const camper = this.campers[i];

      if (camper.state === 'queueing') {
        camper.queueWaitTime = (camper.queueWaitTime || 0) + dt;
        const queueIdx = queueCampers.indexOf(camper);
        const queueY = this.receptionPos.y + 26 + queueIdx * 18;
        const queueX = this.receptionPos.x + (camper.groupOffset || 0);

        const dy = queueY - camper.y;
        const dx = queueX - camper.x;

        if (Math.hypot(dx, dy) > 2) {
          camper.x += Math.sign(dx) * 25 * dt;
          camper.y += (dy > 0 ? 1 : -1) * 35 * dt;
          camper.dir = dy > 0 ? 'down' : 'up';
          camper.walkCycle += dt * 8;
        } else {
          camper.dir = 'up';
          camper.walkCycle = 0;
          camper.bubble = camper.requestedBubble || '⛺';
        }
      } else if (camper.state === 'walking_to_pitch') {
        // Offset so multiple guests in the same pitch don't overlap
        const offsets = [
          { x: -8, y: 10 },
          { x: 8, y: 10 },
          { x: 0, y: 15 },
          { x: 0, y: 6 }
        ];
        const off = offsets[camper.spotIndex % offsets.length] || { x: 0, y: 10 };
        const tx = camper.targetPitch.x + off.x;
        const ty = camper.targetPitch.y + off.y;

        const dx = tx - camper.x;
        const dy = ty - camper.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3) {
          camper.x += (dx / dist) * 45 * dt;
          camper.y += (dy / dist) * 45 * dt;
          camper.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          camper.walkCycle += dt * 8;
        } else {
          camper.state = 'relaxing';
          camper.dir = 'down';
          camper.walkCycle = 0;
          camper.bubble = '💤';
        }
      } else if (camper.state === 'leaving') {
        camper.y += 45 * dt;
        camper.dir = 'down';
        camper.walkCycle += dt * 8;
        camper.bubble = '💵';
        if (Math.random() < 0.004 && this.trashBags.length < 15) {
          const originTier = camper.targetPitch?.tier;
          const originId = camper.targetPitch?.id;
          this.trashBags.push({
            x: camper.x,
            y: camper.y,
            pitchId: originId,
            pitchTier: originTier
          });
        }
        if (camper.y > this.worldH + 20) {
          this.campers.splice(i, 1);
          this.updateHUD();
        }
      }
    }
  }

  // Determines the camper's requested accommodation tier & speech bubble emoji based on archetype
  chooseCamperRequest(archetype) {
    const builtTiers = new Set(this.pitches.map(p => p.tier));

    let options = [];
    if (archetype === 'Hippies') {
      options = [
        { tier: 'tent', bubble: '⛺', weight: 60 },
        { tier: 'caravan', bubble: '🚐', weight: 25 },
        { tier: 'glamping', bubble: '🛖', weight: 15 }
      ];
    } else if (archetype === 'Families') {
      options = [
        { tier: 'caravan', bubble: '🚐', weight: 40 },
        { tier: 'cabin', bubble: '🏠', weight: 25 },
        { tier: 'chalet', bubble: '🏡', weight: 15 },
        { tier: 'lodge', bubble: '🪵', weight: 12 },
        { tier: 'tent', bubble: '⛺', weight: 8 }
      ];
    } else { // Snobs
      options = [
        { tier: 'glamping', bubble: '🛖', weight: 30 },
        { tier: 'cabin', bubble: '🏠', weight: 25 },
        { tier: 'chalet', bubble: '🏡', weight: 20 },
        { tier: 'lodge', bubble: '🪵', weight: 15 },
        { tier: 'villa', bubble: '🏰', weight: 10 }
      ];
    }

    // Weight selection prioritizing built facilities while showing diverse archetype demand
    let totalWeight = 0;
    const weighted = options.map(opt => {
      const isBuilt = builtTiers.has(opt.tier);
      const w = isBuilt ? opt.weight * 2 : Math.max(10, Math.floor(opt.weight * 0.4));
      totalWeight += w;
      return { ...opt, w };
    });

    let rnd = Math.random() * totalWeight;
    for (const opt of weighted) {
      if (rnd <= opt.w) {
        return { requestedTier: opt.tier, requestedBubble: opt.bubble };
      }
      rnd -= opt.w;
    }

    return { requestedTier: options[0].tier, requestedBubble: options[0].bubble };
  }

  // Spawns individuals or groups (Hippies duo, Family party of 3, Snob couple)
  spawnCamperGroup() {
    const types = ['Hippies', 'Families', 'Snobs'];
    const type = types[Math.floor(Math.random() * types.length)];
    const partyId = Math.random().toString(36).substring(2, 7);

    // Group size: Solo (1), Pair (2), or Family of 3
    let groupSize = 1;
    if (type === 'Families') {
      groupSize = Math.random() < 0.65 ? 3 : 2;
    } else if (type === 'Snobs') {
      groupSize = Math.random() < 0.5 ? 2 : 1;
    } else {
      groupSize = Math.random() < 0.5 ? 2 : 1;
    }

    const { requestedTier, requestedBubble } = this.chooseCamperRequest(type);

    for (let g = 0; g < groupSize; g++) {
      this.campers.push({
        partyId,
        type,
        requestedTier,
        requestedBubble,
        queueWaitTime: 0,
        groupOffset: (g - (groupSize - 1) / 2) * 10,
        spotIndex: 0,
        x: this.receptionPos.x + (g - (groupSize - 1) / 2) * 10,
        y: this.worldH - 10 - g * 12,
        dir: 'up',
        walkCycle: 0,
        state: 'queueing',
        targetPitch: null,
        bubble: requestedBubble
      });
    }
    this.updateHUD();
  }

  findAvailablePitch(requestedTier, partySize, waitTime = 0) {
    // 1. Exact tier match that can fit the party
    for (const p of this.pitches) {
      const freeSlots = p.capacity - p.guests.length;
      if (p.tier === requestedTier && freeSlots >= partySize) {
        return p;
      }
    }

    // 2. If this exact tier is currently built in camp, they prefer to wait for it (up to 7.5 seconds)
    const tierIsBuilt = this.pitches.some(p => p.tier === requestedTier);
    if (tierIsBuilt && waitTime < 7.5) {
      return null;
    }

    // 3. Alternative/Upgrade: Any pitch that can fit the party
    const tierPriority = { 'villa': 7, 'lodge': 6, 'chalet': 5, 'cabin': 4, 'glamping': 3, 'caravan': 2, 'tent': 1 };
    const candidates = this.pitches.filter(p => (p.capacity - p.guests.length) >= partySize);
    if (candidates.length > 0) {
      candidates.sort((a, b) => (tierPriority[b.tier] || 0) - (tierPriority[a.tier] || 0));
      return candidates[0];
    }

    return null;
  }

  // --- PITCHES & SIMULTANEOUS CHECKOUTS ---
  updatePitches(dt) {
    const isJoy = this.state.campfireJoyTime > 0;
    const speed = isJoy ? 1.5 : 1.0;

    this.pitches.forEach(p => {
      // If pitch has checked-in guests relaxing
      if (p.guests.length > 0 && p.guests.some(g => g.state === 'relaxing')) {
        p.stayTimer += dt * speed;

        if (p.stayTimer >= p.stayDuration) {
          // Checkout all guests currently at this pitch!
          const guestCount = p.guests.length;
          p.guests.forEach(camper => {
            camper.state = 'leaving';
            camper.bubble = '💵';
          });

          // Payout proportional to number of occupants and building upgrade level
          const guestRatio = guestCount / (p.baseCapacity || p.capacity || 1);
          let totalIncome = Math.round(p.baseIncome * (isJoy ? 1.5 : 1.0) * guestRatio);

          // Overload penalty: If power or water demand exceeds capacity, income drops by 50%
          if (this.state.powerDemand > this.state.powerCapacity || this.state.waterDemand > this.state.waterCapacity) {
            totalIncome = Math.max(1, Math.round(totalIncome * 0.5));
          }

          // Drop cash bundles
          this.cashDrops.push({
            x: p.dropX,
            y: p.dropY,
            amount: totalIncome,
            pitchId: p.id,
            pitchTier: p.tier
          });

          // Chance of leaving a trash bag
          if (Math.random() < 0.85) {
            this.trashBags.push({
              x: p.dropX + 10,
              y: p.dropY,
              pitchId: p.id,
              pitchTier: p.tier
            });
          }

          p.guests = [];
          p.stayTimer = 0;
          if (!this.state.stats) this.state.stats = {};
          this.state.stats.totalCampersServed = (this.state.stats.totalCampersServed || 0) + guestCount;
          this.updateHUD();
        }
      }
    });
  }

  updateCashDrops(dt) {
    for (let i = this.cashDrops.length - 1; i >= 0; i--) {
      const drop = this.cashDrops[i];
      const dist = Math.hypot(this.player.x - drop.x, this.player.y - drop.y);

      if (dist < 26) {
        this.cashDrops.splice(i, 1);
        this.addCash(drop.amount);
        window.soundFX?.playCoin();
        if (navigator.vibrate) navigator.vibrate(15);
        this.showFloatText(drop.x, drop.y, `+$${drop.amount}`, '#2ecc71');
      }
    }
  }

  updateTrashBags(dt) {
    for (let i = this.trashBags.length - 1; i >= 0; i--) {
      const tb = this.trashBags[i];
      const dist = Math.hypot(this.player.x - tb.x, this.player.y - tb.y);
      if (dist < 22) {
        this.trashBags.splice(i, 1);
        this.addCash(25);
        if (!this.state.stats) this.state.stats = {};
        this.state.stats.trashCollected = (this.state.stats.trashCollected || 0) + 1;
        window.soundFX?.playPop();
        this.showFloatText(tb.x, tb.y, '🧹 +$25 Cleaned!', '#f39c12');
      }
    }
  }

  // --- TRASH RACCOON & LOOT BAGS (INTERACTIVE RANDOM EVENT) ---
  updateLootBags(dt) {
    for (let i = this.lootBags.length - 1; i >= 0; i--) {
      const bag = this.lootBags[i];
      const dist = Math.hypot(this.player.x - bag.x, this.player.y - bag.y);
      if (dist < 22) {
        this.lootBags.splice(i, 1);
        const campScale = Math.pow(1.30, (this.state.camp || 1) - 1);
        const cashWon = Math.round((70 + Math.random() * 80) * campScale);
        this.addCash(cashWon);

        // 45% chance of 1-2 gems
        let gemsWon = 0;
        if (Math.random() < 0.45) {
          gemsWon = Math.random() < 0.25 ? 2 : 1;
          this.addGems(gemsWon);
        }

        // 30% chance of random manager card
        let cardText = '';
        if (Math.random() < 0.30) {
          const mgrKeys = Object.keys(this.state.managers || {});
          if (mgrKeys.length > 0) {
            const randomKey = mgrKeys[Math.floor(Math.random() * mgrKeys.length)];
            if (!this.state.managers[randomKey]) {
              this.state.managers[randomKey] = { level: 0, cards: 0 };
            }
            this.state.managers[randomKey].cards = (this.state.managers[randomKey].cards || 0) + 1;
            const mgrDef = MANAGER_DEFS[randomKey];
            cardText = `, +1 ${mgrDef?.name || randomKey}`;
            this.updateBadges();
          }
        }

        if (!this.state.stats) this.state.stats = {};
        this.state.stats.raccoonsChased = (this.state.stats.raccoonsChased || 0) + 1;

        window.soundFX?.playChestOpen();
        if (navigator.vibrate) navigator.vibrate(25);
        const gemText = gemsWon > 0 ? ` +${gemsWon} 💎` : '';
        this.showFloatText(bag.x, bag.y, `🎒 Beute: +$${cashWon} 💵${gemText}${cardText}!`, '#f1c40f');
        this.updateHUD();
      }
    }
  }

  updateRaccoon(dt) {
    if (!this.raccoon) {
      this.raccoonTimer -= dt;
      if (this.raccoonTimer <= 0) {
        // Spawn wild raccoon from random map border
        const side = Math.floor(Math.random() * 4);
        let startX = 20, startY = 20;
        if (side === 0) { startX = Math.random() * (this.worldW - 40) + 20; startY = 25; }
        else if (side === 1) { startX = Math.random() * (this.worldW - 40) + 20; startY = this.worldH - 25; }
        else if (side === 2) { startX = 25; startY = Math.random() * (this.worldH - 40) + 20; }
        else { startX = this.worldW - 25; startY = Math.random() * (this.worldH - 40) + 20; }

        // Pick a camp target to snoop around
        let target = { x: this.woodpilePos.x, y: this.woodpilePos.y };
        if (this.trashBags.length > 0) {
          target = { x: this.trashBags[0].x, y: this.trashBags[0].y };
        } else if (Math.random() < 0.5) {
          target = { x: this.campfirePos.x + 25, y: this.campfirePos.y + 10 };
        }

        this.raccoon = {
          x: startX,
          y: startY,
          targetX: target.x,
          targetY: target.y,
          state: 'sniffing',
          speed: 40,
          walkCycle: 0,
          dir: startX < target.x ? 'right' : 'left',
          bubble: '🦝',
          sniffTimer: 0
        };

        window.soundFX?.playScurry();
        this.showFloatText(startX, startY - 12, '🦝 Ein frecher Waschbär schleicht ins Camp!', '#e67e22');
      }
      return;
    }

    const r = this.raccoon;
    r.walkCycle += dt * (r.state === 'fleeing' ? 14 : 7);

    // Check interaction with Ranger
    const distToPlayer = Math.hypot(this.player.x - r.x, this.player.y - r.y);
    if (r.state === 'sniffing' && distToPlayer < 28) {
      // Ranger chased / startled the raccoon!
      r.state = 'fleeing';
      r.speed = 95;
      r.bubble = '🦝💨!';

      // Drop Loot Bag at current location
      this.lootBags.push({ x: r.x, y: r.y });

      // Run off to nearest map border
      const fleeX = r.x < this.worldW / 2 ? -30 : this.worldW + 30;
      const fleeY = r.y < this.worldH / 2 ? -30 : this.worldH + 30;
      r.targetX = fleeX;
      r.targetY = fleeY;
      r.dir = fleeX > r.x ? 'right' : 'left';

      window.soundFX?.playScurry();
      if (navigator.vibrate) navigator.vibrate(20);
      this.showFloatText(r.x, r.y - 12, '💨 Waschbär verscheucht! Loot-Beutel fallengelassen! 🎒', '#f39c12');
    }

    // Move raccoon towards target
    const dx = r.targetX - r.x;
    const dy = r.targetY - r.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 4) {
      const step = r.speed * dt;
      r.x += (dx / dist) * Math.min(step, dist);
      r.y += (dy / dist) * Math.min(step, dist);
      r.dir = dx >= 0 ? 'right' : 'left';
    } else {
      if (r.state === 'fleeing') {
        // Escaped off-screen
        this.raccoon = null;
        this.raccoonTimer = 90.0 + Math.random() * 60.0;
        return;
      } else {
        // Idle sniffing then pick new target or head out
        r.sniffTimer += dt;
        if (r.sniffTimer > 5.0) {
          r.targetX = Math.random() < 0.5 ? -30 : this.worldW + 30;
          r.targetY = Math.random() * this.worldH;
          r.state = 'fleeing';
          r.speed = 50;
        }
      }
    }
  }

  // --- VIP INFLUENCER EVENT (60S RESORT-WIDE 2X FRENZY BOOST) ---
  updateVIP(dt) {
    if (!this.vipCamper) {
      this.vipTimer -= dt;
      if (this.vipTimer <= 0) {
        // Spawn VIP Influencer from entrance road
        const centerX = Math.round(this.worldW / 2);
        const luxuryPitch = this.pitches.find(p => p.tier === 'villa' || p.tier === 'lodge' || p.tier === 'chalet' || p.tier === 'cabin' || p.tier === 'glamping') || this.pitches[0];
        const targetPos = luxuryPitch ? { x: luxuryPitch.x, y: luxuryPitch.y + 14 } : { x: this.receptionPos.x, y: this.receptionPos.y + 20 };

        this.vipCamper = {
          x: centerX,
          y: this.worldH + 12,
          targetX: targetPos.x,
          targetY: targetPos.y,
          state: 'arriving',
          speed: 40,
          walkCycle: 0,
          dir: 'up',
          bubble: '🤳📸',
          partyTimer: 0,
          flashTimer: 0
        };

        window.soundFX?.playFanfare();
        this.showFloatText(centerX, this.worldH - 18, '🤳 Ein VIP-Influencer besucht dein Resort!', '#9b59b6');
      }
      return;
    }

    const vip = this.vipCamper;

    if (vip.state === 'arriving') {
      vip.walkCycle += dt * 8;
      const dx = vip.targetX - vip.x;
      const dy = vip.targetY - vip.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        const step = vip.speed * dt;
        vip.x += (dx / dist) * Math.min(step, dist);
        vip.y += (dy / dist) * Math.min(step, dist);
        vip.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      } else {
        // Arrived at destination! Trigger 60s 2x Boost + Big Tip Drop!
        vip.state = 'partying';
        vip.partyTimer = 0;
        vip.bubble = '✨📸';

        this.state.boostTimer = Math.max(this.state.boostTimer || 0, 60);
        this.state.boostMultiplier = 2.0;

        const campScale = Math.pow(1.30, (this.state.camp || 1) - 1);
        const vipTip = Math.round(250 * campScale);
        this.addCash(vipTip);

        if (!this.state.stats) this.state.stats = {};
        this.state.stats.vipVisits = (this.state.stats.vipVisits || 0) + 1;

        window.soundFX?.playCameraFlash();
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
        this.showFloatText(vip.x, vip.y - 18, `⭐ VIP INFLUENCER: 2X RESORT FRENZY (60s)! +$${vipTip} 💵`, '#f1c40f');
        this.updateHUD();
      }
    } else if (vip.state === 'partying') {
      vip.partyTimer += dt;
      vip.flashTimer += dt;
      vip.walkCycle = Math.sin(vip.partyTimer * 4);

      // Camera flash sparkles
      if (vip.flashTimer >= 1.6) {
        vip.flashTimer = 0;
        window.soundFX?.playCameraFlash();
        for (let k = 0; k < 6; k++) {
          this.particles.push({
            x: vip.x + (Math.random() - 0.5) * 24,
            y: vip.y - 10 + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: 2.5,
            life: 0.35,
            color: Math.random() < 0.5 ? '#fff' : '#f1c40f'
          });
        }
      }

      if (vip.partyTimer >= 12.0) {
        // VIP departs
        vip.state = 'leaving';
        vip.targetX = Math.round(this.worldW / 2);
        vip.targetY = this.worldH + 25;
        vip.bubble = '🕶️💖';
        vip.speed = 42;
      }
    } else if (vip.state === 'leaving') {
      vip.walkCycle += dt * 8;
      const dx = vip.targetX - vip.x;
      const dy = vip.targetY - vip.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        const step = vip.speed * dt;
        vip.x += (dx / dist) * Math.min(step, dist);
        vip.y += (dy / dist) * Math.min(step, dist);
        vip.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      } else {
        // Left the resort
        this.vipCamper = null;
        this.vipTimer = 180.0 + Math.random() * 80.0;
      }
    }
  }

  // --- FISHING AT THE TRANQUIL POND ---
  updateFishing(dt) {
    const distToPier = Math.hypot(this.player.x - this.pierPos.x, this.player.y - this.pierPos.y);
    if (distToPier < 20) {
      this.fishingTimer += dt;
      if (this.frame % 30 === 0) {
        this.showFloatText(this.pierPos.x, this.pierPos.y - 12, '🎣 Fishing...', '#5dade2');
      }
      if (this.fishingTimer > 1.8) {
        this.fishingTimer = 0;
        this.addCash(40);
        if (!this.state.stats) this.state.stats = {};
        this.state.stats.fishCaught = (this.state.stats.fishCaught || 0) + 1;
        window.soundFX?.playCoin();
        this.showFloatText(this.pierPos.x, this.pierPos.y - 14, '🐟 Rainbow Trout +$40!', '#2ecc71');
      }
    } else {
      this.fishingTimer = 0;
    }
  }

  // --- SNACK KIOSK VISITS ---
  updateKiosk(dt) {
    if (!this.hasKiosk) return;
    if (this.frame % 100 === 0 && this.campers.length > 0) {
      const kioskLvl = this.state.buildingLevels?.['pad_kiosk'] || 1;
      const kioskMult = getBuildingIncomeMultiplier(kioskLvl);
      const sale = Math.round(22 * kioskMult);
      this.addCash(sale);
      if (!this.state.stats) this.state.stats = {};
      this.state.stats.kioskOrders = (this.state.stats.kioskOrders || 0) + 1;
      this.showFloatText(this.kioskPos.x, this.kioskPos.y - 15, `🍦 Kiosk Sale +$${sale}`, '#e67e22');
    }
  }

  // --- CANOE RENTAL DOCK ---
  updateCanoeDock(dt) {
    if (!this.hasCanoeDock) return;
    if (this.frame % 120 === 0 && this.campers.length > 0) {
      const canoeLvl = this.state.buildingLevels?.['pad_canoe'] || 1;
      const canoeMult = getBuildingIncomeMultiplier(canoeLvl);
      const rental = Math.round(35 * canoeMult);
      this.addCash(rental);
      if (!this.state.stats) this.state.stats = {};
      this.state.stats.canoeRentals = (this.state.stats.canoeRentals || 0) + 1;
      window.soundFX?.playWaterSplash();
      this.showFloatText(this.canoePos.x, this.canoePos.y - 15, `🛶 Canoe Rental +$${rental}`, '#3498db');
    }
  }

  // --- ALPINE SAUNA & ONSEN ---
  updateSauna(dt) {
    if (!this.hasSauna) return;
    if (this.frame % 140 === 0 && this.campers.length > 0) {
      const saunaLvl = this.state.buildingLevels?.['pad_sauna'] || 1;
      const saunaMult = getBuildingIncomeMultiplier(saunaLvl);
      const fee = Math.round(55 * saunaMult);
      this.addCash(fee);
      if (!this.state.stats) this.state.stats = {};
      this.state.stats.saunaVisits = (this.state.stats.saunaVisits || 0) + 1;
      window.soundFX?.playWaterSplash();
      this.showFloatText(this.saunaPos.x, this.saunaPos.y - 15, `♨️ Sauna Bath +$${fee}`, '#e67e22');
    }
  }

  // --- BUILD PADS (STAND-TO-PAY) ---
  updateBuildPads(dt) {
    const investLvl = this.state.franchiseUpgrades?.investSpeedLevel || 1;
    const investMult = 1.0 + (investLvl - 1) * 0.50; // +50% base transfer speed per level

    for (let i = this.buildPads.length - 1; i >= 0; i--) {
      const pad = this.buildPads[i];
      if (pad.isCompleted) continue;

      const dist = Math.hypot(this.player.x - pad.x, this.player.y - pad.y);
      if (dist < pad.radius && this.state.cash > 0 && pad.paid < pad.cost) {
        pad.standTimer = (pad.standTimer || 0) + dt;
        // Continuous standing ramp-up (ramps up to 6x over 3 seconds)
        const ramp = Math.min(6.0, 1.0 + pad.standTimer * 1.5);
        const ratePerSec = 180 * investMult * ramp;
        const needed = pad.cost - pad.paid;
        const stream = Math.min(this.state.cash, needed, ratePerSec * dt);

        if (stream > 0) {
          this.state.cash -= stream;
          pad.paid += stream;

          pad.popTimer = (pad.popTimer || 0) + dt;
          if (pad.popTimer >= 0.08) {
            window.soundFX?.playPop();
            pad.popTimer = 0;
          }

          // Visual spark stream into build pad
          if (Math.random() < 0.35) {
            this.particles.push({
              x: this.player.x + (Math.random() - 0.5) * 10,
              y: this.player.y - 12 + (Math.random() - 0.5) * 10,
              vx: (pad.x - this.player.x) * 1.8 + (Math.random() - 0.5) * 10,
              vy: (pad.y - this.player.y) * 1.8 + (Math.random() - 0.5) * 10,
              size: 2.2,
              life: 0.35,
              color: '#2ecc71'
            });
          }

          this.updateHUD();
        }

        if (pad.paid >= pad.cost) {
          pad.isCompleted = true;
          this.completedPads.add(pad.id);
          this.buildPads.splice(i, 1);
          window.soundFX?.playBuild();
          this.showFloatText(pad.x, pad.y - 12, `🎉 Built ${pad.name}!`, '#f1c40f');

          if (pad.id?.startsWith('pad_tent') || pad.id?.startsWith('pad_caravan') || pad.id?.startsWith('pad_glamp') || pad.id?.startsWith('pad_cabin') || pad.id?.startsWith('pad_chalet') || pad.id?.startsWith('pad_lodge') || pad.id?.startsWith('pad_villa')) {
            if (!this.state.stats) this.state.stats = {};
            this.state.stats.pitchesBuilt = (this.state.stats.pitchesBuilt || 0) + 1;
          } else if (pad.id === 'pad_water' || pad.id === 'pad_gen' || pad.id === 'pad_sports') {
            if (!this.state.stats) this.state.stats = {};
            this.state.stats.utilitiesBuilt = (this.state.stats.utilitiesBuilt || 0) + 1;
          }

          pad.onComplete(false);

          // Spawn any cleaner workers that were awaiting this new facility
          ['oliver', 'chloe', 'felix', 'bella'].forEach(workerId => {
            if (this.state.managers[workerId]?.level > 0 && !this.workers[workerId]) {
              this.spawnWorkerEntity(workerId);
            }
          });

          this.updateBadges();
          this.saveState();
          break;
        }
      } else {
        pad.standTimer = 0;
      }
    }
  }

  // --- WOOD CHOPPING & CAMPFIRE ---
  updateWoodChopping(dt) {
    const dist = Math.hypot(this.player.x - this.woodpilePos.x, this.player.y - this.woodpilePos.y);
    if (dist < 26) {
      this.chopTimer += dt;
      if (this.chopTimer > 0.6) {
        this.chopTimer = 0;
        if (this.player.carriedItems < this.state.rangerCapacity) {
          this.player.carriedItems++;
          this.addEventPoints(1);
          window.soundFX?.playChop();
          this.updateHUD();
        }
      }
    } else {
      this.chopTimer = 0;
    }
  }

  updateCampfire(dt) {
    // Campfire embers
    if (Math.random() < 0.25) {
      this.particles.push({
        x: this.campfirePos.x + (Math.random() - 0.5) * 10,
        y: this.campfirePos.y - 6,
        vx: (Math.random() - 0.5) * 6,
        vy: -16 - Math.random() * 10,
        size: 1.5,
        life: 0.6,
        color: Math.random() < 0.5 ? '#f39c12' : '#e74c3c'
      });
    }

    const dist = Math.hypot(this.player.x - this.campfirePos.x, this.player.y - this.campfirePos.y);
    if (dist < 26 && this.player.carriedItems > 0) {
      this.chopTimer += dt;
      if (this.chopTimer > 0.4) {
        this.chopTimer = 0;
        this.player.carriedItems--;
        window.soundFX?.playPop();
        this.state.campfireJoyTime += 15.0; // +15s Frenzy
        if (!this.state.stats) this.state.stats = {};
        this.state.stats.woodBurned = (this.state.stats.woodBurned || 0) + 1;
        this.showFloatText(this.campfirePos.x, this.campfirePos.y - 10, '🔥 Joy Frenzy +15s!', '#e67e22');
        this.updateHUD();
        this.updateBadges();
      }
    }

    if (this.state.campfireJoyTime > 0) {
      this.state.campfireJoyTime -= dt;
      if (this.ui.frenzyBanner) {
        this.ui.frenzyBanner.style.display = 'block';
        this.ui.frenzyBanner.textContent = `🔥 JOY FRENZY (1.5x): ${Math.ceil(this.state.campfireJoyTime)}s`;
      }
    } else {
      if (this.ui.frenzyBanner) this.ui.frenzyBanner.style.display = 'none';
    }
  }

  // --- HELPER STAFF ROBIN AUTOMATION ---
  // --- INDEPENDENT STAFF WORKERS AUTOMATION ---
  updateStaffWorkers(dt) {
    if (this.staffOnStrike) {
      // All active workers display unpaid strike bubble and pause automation
      Object.values(this.workers).forEach(worker => {
        worker.bubble = '💸';
        worker.bubbleTimer = 1.0;
        worker.target = null;
        worker.walkCycle = 0;
      });
      return;
    }

    // 1. Front Desk Clerks: Alex (Desk #1) and Sam (Desk #2)
    const queueCampers = this.campers.filter(c => c.state === 'queueing');

    ['alex', 'sam'].forEach(clerkId => {
      const stateObj = this.state.workers[clerkId];
      if (!stateObj || stateObj.level <= 0) return;
      const worker = this.workers[clerkId];
      if (!worker) return;

      const def = WORKER_DEFS[clerkId];
      const lvlConfig = def.levels[stateObj.level - 1];
      const speedInterval = lvlConfig.speed || 1.5;
      const bonusTip = lvlConfig.tip || 0;

      worker.timer -= dt;
      if (worker.bubbleTimer > 0) {
        worker.bubbleTimer -= dt;
        if (worker.bubbleTimer <= 0) worker.bubble = null;
      }

      if (worker.timer <= 0 && queueCampers.length > 0) {
        // Group queueing campers into distinct parties
        const partyMap = new Map();
        queueCampers.forEach(c => {
          if (!partyMap.has(c.partyId)) {
            partyMap.set(c.partyId, []);
          }
          partyMap.get(c.partyId).push(c);
        });

        for (const [partyId, party] of partyMap.entries()) {
          const partyLeader = party[0];
          const partySize = party.length;
          const waitTime = partyLeader.queueWaitTime || 0;

          const pitch = this.findAvailablePitch(partyLeader.requestedTier, partySize, waitTime);
          if (pitch) {
            worker.timer = speedInterval;
            worker.bubble = '🛎️';
            worker.bubbleTimer = 0.8;

            const isUpgrade = pitch.tier !== partyLeader.requestedTier;
            party.forEach((camper) => {
              camper.state = 'walking_to_pitch';
              camper.targetPitch = pitch;
              camper.spotIndex = pitch.guests.length;
              pitch.guests.push(camper);
              camper.bubble = isUpgrade ? '✨' : '❤️';
            });

            window.soundFX?.playCheckin();
            const basePerGuest = pitch.baseIncome ? Math.round(pitch.baseIncome / pitch.capacity) : 15;
            const fee = (Math.max(6, Math.round(basePerGuest * 0.35)) * partySize) + bonusTip;
            this.addCash(fee);
            this.addEventPoints(partySize);
            if (!this.state.stats) this.state.stats = {};
            this.state.stats.totalCampersServed = (this.state.stats.totalCampersServed || 0) + partySize;
            const tipStr = bonusTip > 0 ? ` (+$${bonusTip} tip)` : '';
            this.showFloatText(worker.x, worker.y - 12, `🛎️ +$${fee} (${worker.name})${tipStr}`, '#f1c40f');
            break;
          }
        }
      }
    });

    // 2. Building-Type Dedicated Cleaners:
    // - Oliver: ONLY cleans Tents (pup tents, safari tipis, yurt pitches with tier 'tent')
    // - Chloe: ONLY cleans Caravans (classic caravans, retro buses, RVs with tier 'caravan')
    // - Felix: ONLY cleans Cabins & Luxury Lodges (glamping domes, chalets, lodges, villas)
    const centerX = Math.round(this.worldW / 2);
    const cleaners = [
      {
        id: 'oliver',
        allowedTiers: ['tent'],
        defaultPos: { x: centerX - 100, y: Math.round(this.worldH * 0.45) }
      },
      {
        id: 'chloe',
        allowedTiers: ['caravan'],
        defaultPos: { x: centerX + 100, y: Math.round(this.worldH * 0.45) }
      },
      {
        id: 'felix',
        allowedTiers: ['cabin', 'glamping', 'chalet', 'lodge', 'villa'],
        defaultPos: { x: centerX, y: Math.round(this.worldH * 0.16) }
      }
    ];

    cleaners.forEach(({ id, allowedTiers, defaultPos }) => {
      const stateObj = this.state.workers[id];
      if (!stateObj || stateObj.level <= 0) return;
      if (!this.pitches.some(p => allowedTiers.includes(p.tier))) return;
      const worker = this.workers[id];
      if (!worker) return;

      const def = WORKER_DEFS[id];
      const lvlConfig = def.levels[stateObj.level - 1];
      const baseMoveSpeed = lvlConfig.speed || 55;
      const staffMult = 1.0 + (this.state.franchiseUpgrades?.staffSpeedLevel || 0) * 0.15;
      const moveSpeed = baseMoveSpeed * staffMult;
      const trashBonus = lvlConfig.bonus || 0;

      const isAllowedItem = (item) => {
        const itemTier = this.getItemPitchTier(item);
        return allowedTiers.includes(itemTier);
      };

      // Search exclusively among cash drops belonging to this cleaner's building type
      let targetCash = null;
      let minCashDist = Infinity;
      for (let i = 0; i < this.cashDrops.length; i++) {
        const cd = this.cashDrops[i];
        if (isAllowedItem(cd)) {
          const d = Math.hypot(cd.x - worker.x, cd.y - worker.y);
          if (d < minCashDist) {
            minCashDist = d;
            targetCash = cd;
          }
        }
      }

      // Search exclusively among trash bags belonging to this cleaner's building type
      let targetTrash = null;
      let minTrashDist = Infinity;
      for (let i = 0; i < this.trashBags.length; i++) {
        const tb = this.trashBags[i];
        if (isAllowedItem(tb)) {
          const d = Math.hypot(tb.x - worker.x, tb.y - worker.y);
          if (d < minTrashDist) {
            minTrashDist = d;
            targetTrash = tb;
          }
        }
      }

      // Prioritize nearest allowed item of this cleaner's building type (cash has priority if nearby)
      let targetItem = null;
      let isCash = false;
      if (targetCash && targetTrash) {
        if (minCashDist <= minTrashDist * 1.25) {
          targetItem = targetCash;
          isCash = true;
        } else {
          targetItem = targetTrash;
          isCash = false;
        }
      } else if (targetCash) {
        targetItem = targetCash;
        isCash = true;
      } else if (targetTrash) {
        targetItem = targetTrash;
        isCash = false;
      }

      if (targetItem) {
        const dx = targetItem.x - worker.x;
        const dy = targetItem.y - worker.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3) {
          worker.x += (dx / dist) * moveSpeed * dt;
          worker.y += (dy / dist) * moveSpeed * dt;
          worker.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          worker.walkCycle += dt * 8;
        } else {
          if (isCash) {
            const idx = this.cashDrops.indexOf(targetItem);
            if (idx >= 0) {
              const drop = this.cashDrops.splice(idx, 1)[0];
              this.addCash(drop.amount);
              this.addEventPoints(1);
              window.soundFX?.playCoin();
              this.showFloatText(drop.x, drop.y, `+$${drop.amount} (${worker.name})`, '#2ecc71');
            }
          } else {
            const idx = this.trashBags.indexOf(targetItem);
            if (idx >= 0) {
              this.trashBags.splice(idx, 1);
              const reward = 25 + trashBonus;
              this.addCash(reward);
              this.addEventPoints(1);
              if (!this.state.stats) this.state.stats = {};
              this.state.stats.trashCollected = (this.state.stats.trashCollected || 0) + 1;
              window.soundFX?.playPop();
              this.showFloatText(worker.x, worker.y - 10, `🧹 +$${reward} (${worker.name})`, '#f39c12');
            }
          }
        }
      } else {
        // Idle patrol: patrol exclusively around pitches of their designated building type
        const myPitches = this.pitches.filter(p => allowedTiers.includes(p.tier));
        let patrolX = defaultPos.x;
        let patrolY = defaultPos.y;
        if (myPitches.length > 0) {
          const pIdx = Math.floor((this.frame * 0.004 + (id === 'oliver' ? 0 : id === 'chloe' ? 1 : 2)) % myPitches.length);
          const activePitch = myPitches[pIdx];
          patrolX = activePitch.dropX ?? activePitch.x;
          patrolY = (activePitch.dropY ?? activePitch.y) + 8;
        }

        const angle = (this.frame * 0.018) + (id === 'oliver' ? 0 : id === 'chloe' ? 2 : 4);
        const targetX = patrolX + Math.cos(angle) * 18;
        const targetY = patrolY + Math.sin(angle) * 12;
        const dx = targetX - worker.x;
        const dy = targetY - worker.y;
        if (Math.hypot(dx, dy) > 2) {
          worker.x += dx * 0.04;
          worker.y += dy * 0.04;
          worker.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          worker.walkCycle += dt * 4;
        } else {
          worker.walkCycle = 0;
        }
      }
    });

    // 3. Fisherman Finn (Tranquil Pond Pier)
    const finnState = this.state.workers['finn'];
    if (finnState && finnState.level > 0 && this.workers['finn']) {
      const worker = this.workers['finn'];
      const def = WORKER_DEFS['finn'];
      const lvlConfig = def.levels[finnState.level - 1];

      worker.x = this.pierPos.x;
      worker.y = this.pierPos.y;
      worker.dir = 'down';

      worker.timer -= dt;
      if (worker.timer <= 0) {
        worker.timer = lvlConfig.interval || 3.0;
        const payout = lvlConfig.income || 35;
        this.addCash(payout);
        if (!this.state.stats) this.state.stats = {};
        this.state.stats.fishCaught = (this.state.stats.fishCaught || 0) + 1;
        window.soundFX?.playCoin();

        for (let p = 0; p < 4; p++) {
          this.particles.push({
            x: this.pierPos.x + 18 + (Math.random() - 0.5) * 6,
            y: this.pierPos.y + 10,
            vx: (Math.random() - 0.5) * 12,
            vy: -8 - Math.random() * 8,
            size: 2,
            life: 0.4,
            color: '#85c1e9'
          });
        }
        this.showFloatText(worker.x + 8, worker.y - 12, `🐟 +$${payout} (Finn)`, '#3498db');
      }
    }

    // 4. Kiosk Barista Bella (Snack Kiosk)
    const bellaState = this.state.workers['bella'];
    if (bellaState && bellaState.level > 0 && this.workers['bella'] && this.hasKiosk) {
      const worker = this.workers['bella'];
      const def = WORKER_DEFS['bella'];
      const lvlConfig = def.levels[bellaState.level - 1];

      worker.x = this.kioskPos.x;
      worker.y = this.kioskPos.y + 6;
      worker.dir = 'down';

      worker.timer -= dt;
      if (worker.timer <= 0) {
        worker.timer = lvlConfig.interval || 3.5;
        const payout = lvlConfig.income || 30;
        this.addCash(payout);
        if (!this.state.stats) this.state.stats = {};
        this.state.stats.kioskOrders = (this.state.stats.kioskOrders || 0) + 1;
        window.soundFX?.playPop();
        this.showFloatText(worker.x, worker.y - 14, `☕ +$${payout} (Bella)`, '#e67e22');
      }
    }

    // 5. Lumberjack & Fire Tender Robin
    const robinState = this.state.workers['robin'];
    if (robinState && robinState.level > 0 && this.workers['robin']) {
      const worker = this.workers['robin'];
      const def = WORKER_DEFS['robin'];
      const lvlConfig = def.levels[robinState.level - 1];
      const maxCap = lvlConfig.capacity || 1;
      const moveSpeed = lvlConfig.speed || 65;
      const frenzyAdd = lvlConfig.frenzyAdd || 20;
      const bonusTip = lvlConfig.tip || 0;

      const needsWood = this.state.campfireJoyTime < 35 && worker.carriedItems < maxCap;

      if (needsWood) {
        const dx = this.woodpilePos.x - worker.x;
        const dy = this.woodpilePos.y - worker.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 6) {
          worker.x += (dx / dist) * moveSpeed * dt;
          worker.y += (dy / dist) * moveSpeed * dt;
          worker.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          worker.walkCycle += dt * 8;
        } else {
          worker.carriedItems = maxCap;
          worker.walkCycle = 0;
          window.soundFX?.playChop();
        }
      } else if (worker.carriedItems > 0) {
        const dx = this.campfirePos.x - worker.x;
        const dy = this.campfirePos.y - worker.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
          worker.x += (dx / dist) * moveSpeed * dt;
          worker.y += (dy / dist) * moveSpeed * dt;
          worker.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          worker.walkCycle += dt * 8;
        } else {
          worker.carriedItems = 0;
          this.state.campfireJoyTime += frenzyAdd;
          if (!this.state.stats) this.state.stats = {};
          this.state.stats.woodBurned = (this.state.stats.woodBurned || 0) + maxCap;
          if (bonusTip > 0) this.addCash(bonusTip);
          window.soundFX?.playPop();
          const tipStr = bonusTip > 0 ? ` +$${bonusTip} Tip` : '';
          this.showFloatText(this.campfirePos.x, this.campfirePos.y - 12, `🔥 +${frenzyAdd}s Frenzy (Robin)${tipStr}`, '#e67e22');
        }
      } else {
        const angle = this.frame * 0.02;
        const targetX = this.campfirePos.x + Math.cos(angle) * 32;
        const targetY = this.campfirePos.y + Math.sin(angle) * 32;
        const dx = targetX - worker.x;
        const dy = targetY - worker.y;
        worker.x += dx * 0.04;
        worker.y += dy * 0.04;
        worker.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        worker.walkCycle += dt * 6;
      }
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  showFloatText(x, y, text, color = '#2ecc71') { this.hud.showFloatText(x, y, text, color); }
  updateFloatTexts(dt) { this.hud.updateFloatTexts(dt); }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.vWidth, this.vHeight);

    ctx.save();
    // Center zoom transform
    ctx.translate(this.vWidth / 2, this.vHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.vWidth / 2, -this.vHeight / 2);

    // Offset by camera
    ctx.translate(-Math.floor(this.camX), -Math.floor(this.camY));

    // 0. Wilderness Forest Backdrop (seamless fill beyond campsite edges to prevent voids)
    const biome = this.currentBiome || WORLD_BIOMES[0];
    const pal = biome.palette;
    const bgPad = 600;
    ctx.fillStyle = pal.grassDark || '#142819';
    ctx.fillRect(-bgPad, -bgPad, this.worldW + bgPad * 2, this.worldH + bgPad * 2);

    // Subtle wilderness tree silhouettes in the outer area
    ctx.fillStyle = 'rgba(10, 25, 15, 0.35)';
    for (let bx = -bgPad + 20; bx < this.worldW + bgPad; bx += 36) {
      ctx.fillRect(bx, -35, 6, 12);
      ctx.fillRect(bx + 18, -65, 6, 12);
      ctx.fillRect(bx, this.worldH + 25, 6, 12);
      ctx.fillRect(bx + 18, this.worldH + 55, 6, 12);
    }

    // 1. Lush Biome Meadow & Palette
    ctx.fillStyle = pal.grassMid || PIXEL_COLORS.grassMid;
    ctx.fillRect(0, 0, this.worldW, this.worldH);

    // Grass blade details & wildflowers
    ctx.fillStyle = pal.grassLight || PIXEL_COLORS.grassLight;
    for (let x = 16; x < this.worldW; x += 32) {
      for (let y = 16; y < this.worldH; y += 32) {
        ctx.fillRect(x, y, 2, 3);
        ctx.fillRect(x + 1, y - 1, 2, 2);
      }
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(80, 260, 2, 2);
    ctx.fillRect(240, 290, 2, 2);
    ctx.fillRect(310, 390, 2, 2);
    ctx.fillRect(140, 480, 2, 2);

    // 2. Tranquil Fishing Pond
    PixelRenderer.drawPond(ctx, this.pondPos.x, this.pondPos.y, 100, 60, this.frame);

    // 3. Dirt Trail Paths (Themed)
    ctx.fillStyle = pal.dirtMid || PIXEL_COLORS.dirtMid;

    const centerX = Math.round(this.worldW / 2);
    // Main South Entrance path from bottom of map up to reception
    ctx.fillRect(centerX - 16, this.receptionPos.y - 12, 32, this.worldH - (this.receptionPos.y - 12));

    // Central promenade connecting Reception up through the center to north lodges
    const northY = Math.round(this.worldH * 0.08);
    ctx.fillRect(centerX - 16, northY, 32, (this.receptionPos.y - 12) - northY);

    // Campfire plaza clearing around campfire
    ctx.fillRect(this.campfirePos.x - 38, this.campfirePos.y - 28, 76, 56);

    // Lateral paths connecting West tent meadow and East caravan lane
    const midY = Math.round(this.worldH * 0.46);
    const lateralSpan = Math.min(centerX - 35, 140);
    ctx.fillRect(centerX - lateralSpan, midY, lateralSpan * 2, 28);
    // West vertical tent lane
    ctx.fillRect(centerX - lateralSpan, Math.round(this.worldH * 0.26), 34, Math.round(this.worldH * 0.22));
    // East vertical caravan lane
    ctx.fillRect(centerX + lateralSpan - 34, Math.round(this.worldH * 0.32), 34, Math.round(this.worldH * 0.36));

    // North wings connecting Glamping / Chalets / Safari Lodges
    ctx.fillRect(centerX - lateralSpan, Math.round(this.worldH * 0.15), lateralSpan * 2, 26);
    if (this.state.camp >= 7) {
      ctx.fillRect(centerX - lateralSpan, Math.round(this.worldH * 0.08), lateralSpan * 2, 24);
    }

    // Path to Woodpile
    ctx.fillRect(this.campfirePos.x, this.campfirePos.y - 8, Math.max(0, this.woodpilePos.x - this.campfirePos.x), 16);

    // Path to Pond Pier
    ctx.fillRect(this.pondPos.x - 14, this.pondPos.y + 30, 26, Math.min(80, Math.round(this.worldH * 0.12)));
    ctx.fillRect(Math.min(centerX + 16, this.pondPos.x - 20), this.pondPos.y + 30, Math.max(20, this.pondPos.x - centerX), 20);

    // Path to Kiosk
    ctx.fillRect(centerX, this.kioskPos.y - 4, Math.max(20, this.kioskPos.x - centerX), 20);

    // Path to Sports Field (Camp 5+)
    if (this.hasSportsField || this.state.camp >= 5) {
      ctx.fillRect(this.sportsFieldPos.x, this.sportsFieldPos.y - 4, Math.max(20, centerX - this.sportsFieldPos.x), 20);
    }

    // Shaded dirt borders
    ctx.fillStyle = pal.dirtDark || PIXEL_COLORS.dirtDark;
    ctx.fillRect(centerX - 17, this.receptionPos.y - 12, 1, this.worldH - (this.receptionPos.y - 12));
    ctx.fillRect(centerX + 16, this.receptionPos.y - 12, 1, this.worldH - (this.receptionPos.y - 12));
    ctx.fillRect(centerX - lateralSpan, midY - 1, lateralSpan * 2, 1);
    ctx.fillRect(centerX - lateralSpan, midY + 28, lateralSpan * 2, 1);

    // 4. Buildings & Stations
    PixelRenderer.drawReceptionDesk(ctx, this.receptionPos.x, this.receptionPos.y);
    PixelRenderer.drawCampfire(ctx, this.campfirePos.x, this.campfirePos.y, this.frame);
    PixelRenderer.drawWoodpile(ctx, this.woodpilePos.x, this.woodpilePos.y);

    if (this.hasWaterPump) {
      PixelRenderer.drawWaterPump(ctx, this.waterPos.x, this.waterPos.y);
      const waterLvl = this.state.buildingLevels?.['pad_water'] || 1;
      ctx.save();
      ctx.fillStyle = 'rgba(41, 128, 185, 0.9)';
      ctx.fillRect(this.waterPos.x - 14, this.waterPos.y - 24, 28, 8);
      ctx.strokeStyle = '#111';
      ctx.strokeRect(this.waterPos.x - 14, this.waterPos.y - 24, 28, 8);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ Lv.${waterLvl}`, this.waterPos.x, this.waterPos.y - 18);
      ctx.restore();
    }
    if (this.hasGenerator) {
      PixelRenderer.drawGenerator(ctx, this.genPos.x, this.genPos.y, this.frame);
      const genLvl = this.state.buildingLevels?.['pad_gen'] || 1;
      ctx.save();
      ctx.fillStyle = 'rgba(41, 128, 185, 0.9)';
      ctx.fillRect(this.genPos.x - 14, this.genPos.y - 24, 28, 8);
      ctx.strokeStyle = '#111';
      ctx.strokeRect(this.genPos.x - 14, this.genPos.y - 24, 28, 8);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ Lv.${genLvl}`, this.genPos.x, this.genPos.y - 18);
      ctx.restore();
    }
    if (this.hasKiosk) {
      PixelRenderer.drawKiosk(ctx, this.kioskPos.x, this.kioskPos.y, this.frame);
      const kioskLvl = this.state.buildingLevels?.['pad_kiosk'] || 1;
      ctx.save();
      ctx.fillStyle = 'rgba(41, 128, 185, 0.9)';
      ctx.fillRect(this.kioskPos.x - 14, this.kioskPos.y - 24, 28, 8);
      ctx.strokeStyle = '#111';
      ctx.strokeRect(this.kioskPos.x - 14, this.kioskPos.y - 24, 28, 8);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ Lv.${kioskLvl}`, this.kioskPos.x, this.kioskPos.y - 18);
      ctx.restore();
    }
    if (this.hasSportsField) {
      PixelRenderer.drawSportsField(ctx, this.sportsFieldPos.x, this.sportsFieldPos.y);
      const sportsLvl = this.state.buildingLevels?.['pad_sports'] || 1;
      ctx.save();
      ctx.fillStyle = 'rgba(41, 128, 185, 0.9)';
      ctx.fillRect(this.sportsFieldPos.x - 14, this.sportsFieldPos.y - 24, 28, 8);
      ctx.strokeStyle = '#111';
      ctx.strokeRect(this.sportsFieldPos.x - 14, this.sportsFieldPos.y - 24, 28, 8);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ Lv.${sportsLvl}`, this.sportsFieldPos.x, this.sportsFieldPos.y - 18);
      ctx.restore();
    }
    if (this.hasCanoeDock) {
      PixelRenderer.drawCanoeDock(ctx, this.canoePos.x, this.canoePos.y, this.frame);
      const canoeLvl = this.state.buildingLevels?.['pad_canoe'] || 1;
      ctx.save();
      ctx.fillStyle = 'rgba(41, 128, 185, 0.9)';
      ctx.fillRect(this.canoePos.x - 14, this.canoePos.y - 24, 28, 8);
      ctx.strokeStyle = '#111';
      ctx.strokeRect(this.canoePos.x - 14, this.canoePos.y - 24, 28, 8);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ Lv.${canoeLvl}`, this.canoePos.x, this.canoePos.y - 18);
      ctx.restore();
    }
    if (this.hasSauna) {
      PixelRenderer.drawSauna(ctx, this.saunaPos.x, this.saunaPos.y, this.frame);
      const saunaLvl = this.state.buildingLevels?.['pad_sauna'] || 1;
      ctx.save();
      ctx.fillStyle = 'rgba(41, 128, 185, 0.9)';
      ctx.fillRect(this.saunaPos.x - 14, this.saunaPos.y - 24, 28, 8);
      ctx.strokeStyle = '#111';
      ctx.strokeRect(this.saunaPos.x - 14, this.saunaPos.y - 24, 28, 8);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ Lv.${saunaLvl}`, this.saunaPos.x, this.saunaPos.y - 18);
      ctx.restore();
    }

    // 5. Accommodations / Pitches (Drawn with regional architecture and occupancy badges)
    this.pitches.forEach(p => {
      PixelRenderer.drawPitch(ctx, p.x, p.y, p.tier, this.accommodationStyle || 'classic', this.frame, pal);

      // Pitch Occupancy Badge (e.g. 👥 2/2 or 🟢 0/3)
      ctx.save();
      const isFull = p.guests.length >= p.capacity;
      ctx.fillStyle = isFull ? 'rgba(231, 76, 60, 0.85)' : p.guests.length > 0 ? 'rgba(241, 196, 15, 0.85)' : 'rgba(39, 174, 96, 0.85)';
      ctx.fillRect(p.x - 14, p.y - 28, 28, 9);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x - 14, p.y - 28, 28, 9);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.guests.length}/${p.capacity} beds`, p.x, p.y - 21);

      // Pitch Level Badge
      const lvl = p.level || 1;
      ctx.fillStyle = 'rgba(41, 128, 185, 0.9)';
      ctx.fillRect(p.x - 14, p.y - 39, 28, 9);
      ctx.strokeStyle = '#111';
      ctx.strokeRect(p.x - 14, p.y - 39, 28, 9);
      ctx.fillStyle = '#f1c40f';
      ctx.fillText(`★ Lv.${lvl}`, p.x, p.y - 32);
      ctx.restore();
    });

    // 6. Stand-to-Pay Build Pads
    this.buildPads.forEach(pad => {
      ctx.save();
      ctx.translate(pad.x, pad.y);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer dashed ring
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -this.frame * 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill progress disc
      const progress = pad.paid / pad.cost;
      if (progress > 0) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.65)';
        ctx.beginPath();
        ctx.arc(0, 0, pad.radius * progress, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fff';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`$${Math.ceil(pad.cost - pad.paid)}`, 0, -2);
      ctx.fillText(pad.name, 0, 6);

      ctx.restore();
    });

    // 6b. Stand-to-Pay Upgrade Pads (Blue / Gold Ring with Star)
    this.upgradePads.forEach(pad => {
      ctx.save();
      ctx.translate(pad.x, pad.y);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer dashed cyan/blue ring
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.lineDashOffset = -this.frame * 0.4;
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill progress disc
      const progress = pad.paid / pad.cost;
      if (progress > 0) {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.65)';
        ctx.beginPath();
        ctx.arc(0, 0, pad.radius * progress, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`$${Math.ceil(pad.cost - pad.paid)}`, 0, -2);
      ctx.fillStyle = '#f1c40f';
      ctx.fillText(`★ Lv.${pad.targetLevel}`, 0, 6);

      ctx.restore();
    });

    // 7. Cash Drops & Trash Bags
    this.cashDrops.forEach(cd => {
      PixelRenderer.drawCash(ctx, cd.x, cd.y);
    });

    this.trashBags.forEach(tb => {
      PixelRenderer.drawTrashBag(ctx, tb.x, tb.y);
    });

    // 7b. Dropped Loot Bags (from startled Raccoon)
    this.lootBags.forEach(lb => {
      PixelRenderer.drawLootBag(ctx, lb.x, lb.y, this.frame);
    });

    // 8. Campers (All queueing, walking, relaxing, and leaving campers)
    this.campers.forEach(c => {
      PixelRenderer.drawCamper(ctx, c.x, c.y, c.type, c.dir, c.walkCycle);
      if (c.bubble) {
        PixelRenderer.drawSpeechBubble(ctx, c.x, c.y, c.bubble, this.frame);
      }
    });

    // 8b. VIP Influencer Camper Event
    if (this.vipCamper) {
      PixelRenderer.drawCamper(ctx, this.vipCamper.x, this.vipCamper.y, 'VIP', this.vipCamper.dir, this.vipCamper.walkCycle);
      if (this.vipCamper.bubble) {
        PixelRenderer.drawSpeechBubble(ctx, this.vipCamper.x, this.vipCamper.y, this.vipCamper.bubble, this.frame);
      }
    }

    // 8c. Wild Trash Raccoon Event
    if (this.raccoon) {
      PixelRenderer.drawRaccoon(ctx, this.raccoon.x, this.raccoon.y, this.raccoon.dir, this.raccoon.walkCycle, this.raccoon.state === 'fleeing');
      if (this.raccoon.bubble) {
        PixelRenderer.drawSpeechBubble(ctx, this.raccoon.x, this.raccoon.y - 6, this.raccoon.bubble, this.frame);
      }
    }

    // 9. Staff Workers (Alex, Sam, Oliver, Chloe, Felix, Finn, Bella, Robin)
    Object.values(this.workers).forEach(worker => {
      const stateObj = this.state.workers[worker.id];
      if (!stateObj || stateObj.level <= 0) return;
      if (worker.id === 'bella' && !this.hasKiosk) return;
      if (worker.id === 'felix' && !this.pitches.some(p => p.tier === 'glamping' || p.tier === 'cabin' || p.tier === 'chalet' || p.tier === 'lodge' || p.tier === 'villa')) return;

      PixelRenderer.drawStaffWorker(ctx, worker.x, worker.y, worker.role, worker.dir, worker.walkCycle, worker.carriedItems);
      if (worker.bubble) {
        PixelRenderer.drawSpeechBubble(ctx, worker.x, worker.y, worker.bubble, this.frame);
      }
    });

    // 10. Player (Camp Ranger)
    PixelRenderer.drawRanger(ctx, this.player.x, this.player.y, this.player.dir, this.player.walkCycle, this.player.carriedItems);

    // 11. Particles (Dust & Campfire Embers)
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    });

    // 12. Nature: Butterflies
    this.butterflies.forEach(b => {
      PixelRenderer.drawButterfly(ctx, b.x, b.y, this.frame, b.color);
    });

    // 13. Perimeter Trees (Themed to Biome)
    this.trees.forEach(t => {
      PixelRenderer.drawBiomeTree(ctx, t.x, t.y, this.frame, biome.treeType, pal);
    });

    // 14. Floating Texts
    this.floatTexts.forEach(ft => {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 2;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  }

  resetGame(force = false) {
    if (force || confirm('Resort wirklich komplett neu starten (Reset)? Alle Upgrades, Plätze und Manager werden auf 0 zurückgesetzt.')) {
      this.isResetting = true;
      try {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem('campers_pixel_save');
        if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
      } catch (e) {}
      window.location.replace(window.location.pathname);
    }
  }

  saveState() {
    if (this.isResetting) return;
    try {
      this.saveCurrentCampData();

      localStorage.setItem(SAVE_KEY, JSON.stringify({
        saveVersion: SAVE_VERSION,
        world: this.state.world || 1,
        region: this.state.region || 1,
        camp: this.state.camp || 1,
        maxUnlockedWorld: this.state.maxUnlockedWorld || 1,
        maxUnlockedRegion: this.state.maxUnlockedRegion || 1,
        maxUnlockedCamp: this.state.maxUnlockedCamp || 1,
        campsCompleted: this.state.campsCompleted || 0,
        cash: this.state.cash,
        empireGold: this.state.empireGold || 0,
        franchiseUpgrades: this.state.franchiseUpgrades,
        gems: this.state.gems ?? 25,
        boostTimer: Math.max(0, this.state.boostTimer || 0),
        boostMultiplier: this.state.boostMultiplier || 1.0,
        upgrades: this.state.upgrades,
        crates: this.state.crates,
        eventProgress: this.state.eventProgress,
        camps: this.state.camps,
        buildingLevels: this.state.buildingLevels,
        lastTimestamp: Date.now()
      }));
    } catch (e) {
      console.warn(e);
    }
  }

  loadState() {
    try {
      try {
        localStorage.removeItem('campers_pixel_save');
      } catch (e) {}

      const d = localStorage.getItem(SAVE_KEY);
      if (!d) return;
      const p = JSON.parse(d);
      if (!p || p.saveVersion !== SAVE_VERSION) {
        localStorage.removeItem(SAVE_KEY);
        return;
      }

      if (p.camps && typeof p.camps === 'object') {
        this.state.camps = p.camps;
      }
      if (p.world !== undefined) this.state.world = p.world;
      if (p.region !== undefined) this.state.region = p.region;
      if (p.camp !== undefined) this.state.camp = p.camp;
      if (p.maxUnlockedWorld !== undefined) this.state.maxUnlockedWorld = p.maxUnlockedWorld;
      if (p.maxUnlockedRegion !== undefined) this.state.maxUnlockedRegion = p.maxUnlockedRegion;
      if (p.maxUnlockedCamp !== undefined) this.state.maxUnlockedCamp = p.maxUnlockedCamp;
      this.state.maxUnlockedWorld = Math.max(this.state.maxUnlockedWorld || 1, this.state.world || 1);
      this.state.maxUnlockedRegion = Math.max(this.state.maxUnlockedRegion || 1, this.state.region || 1);
      this.state.maxUnlockedCamp = Math.max(this.state.maxUnlockedCamp || 1, this.state.camp || 1);
      if (p.campsCompleted !== undefined) this.state.campsCompleted = p.campsCompleted;

      if (p.cash !== undefined) this.state.cash = p.cash;
      if (p.empireGold !== undefined) this.state.empireGold = p.empireGold;
      if (p.franchiseUpgrades && typeof p.franchiseUpgrades === 'object') {
        this.state.franchiseUpgrades = { ...this.state.franchiseUpgrades, ...p.franchiseUpgrades };
        this.state.rangerSpeed = 92 + ((this.state.franchiseUpgrades.speedLevel || 1) - 1) * 16;
        this.state.rangerCapacity = 4 + ((this.state.franchiseUpgrades.capacityLevel || 1) - 1) * 2;
      }
      if (p.gems !== undefined) this.state.gems = p.gems;
      else this.state.gems = 25;
      if (p.boostTimer !== undefined) this.state.boostTimer = Math.max(0, p.boostTimer);
      if (p.boostMultiplier !== undefined) this.state.boostMultiplier = p.boostMultiplier;

      if (p.upgrades) this.state.upgrades = p.upgrades;
      if (p.crates) this.state.crates = { ...this.state.crates, ...p.crates };
      if (p.eventProgress && typeof p.eventProgress === 'object') {
        this.state.eventProgress = p.eventProgress;
      }

      const campKey = getCampKey(this.state.world, this.state.region, this.state.camp);
      const curCampData = this.state.camps?.[campKey];

      if (curCampData) {
        this.state.managers = JSON.parse(JSON.stringify(curCampData.managers || {}));
        this.state.workers = this.state.managers;
        this.completedPads = new Set(curCampData.completedPads || []);
        this.state.achievements = JSON.parse(JSON.stringify(curCampData.achievements || {}));
        this.state.stats = JSON.parse(JSON.stringify(curCampData.stats || {}));
        this.state.buildingLevels = JSON.parse(JSON.stringify(curCampData.buildingLevels || { tent_1: 1, caravan_1: 1 }));
        this.hasWaterPump = !!curCampData.hasWaterPump;
        this.hasGenerator = !!curCampData.hasGenerator;
        this.hasKiosk = !!curCampData.hasKiosk;
        this.hasSportsField = !!curCampData.hasSportsField;
      } else if (p.managers) {
        // Fallback for previous single-campsite saves
        this.state.managers = p.managers;
        this.state.workers = this.state.managers;
        this.completedPads = new Set(p.completedPads || []);
        this.state.achievements = p.achievements || {};
        this.state.stats = p.stats || {};
        this.state.buildingLevels = p.buildingLevels || { tent_1: 1, caravan_1: 1 };
        this.hasWaterPump = !!p.hasWaterPump;
        this.hasGenerator = !!p.hasGenerator;
        this.hasKiosk = !!p.hasKiosk;
        this.hasSportsField = !!p.hasSportsField;
      }

      this.initWorld();

      // Restore completed build pads in world
      if (this.completedPads.size > 0) {
        this.completedPads.forEach(padId => {
          const idx = this.buildPads.findIndex(pad => pad.id === padId);
          if (idx >= 0) {
            const pad = this.buildPads[idx];
            pad.isCompleted = true;
            pad.paid = pad.cost;
            pad.onComplete(true);
            this.buildPads.splice(idx, 1);
          }
        });
      }

      // Restore partial payments on pads
      const padsPaid = curCampData?.padsPaid || p.padsPaid;
      if (padsPaid && typeof padsPaid === 'object') {
        this.buildPads.forEach(pad => {
          if (padsPaid[pad.id]) {
            pad.paid = Math.min(padsPaid[pad.id], pad.cost);
          }
        });
      }

      // Restore and spawn active managers for this camp
      Object.keys(this.state.managers).forEach(id => {
        if (this.state.managers[id]?.level > 0 && !this.workers[id]) {
          this.spawnWorkerEntity(id);
        }
      });

      // Calculate offline earnings with boost support -> Active Camp Cash & Empire Vault Gold
      const lastSaved = p.lastTimestamp || 0;
      if (lastSaved > 0) {
        const now = Date.now();
        const elapsedSec = Math.min(28800, Math.max(0, (now - lastSaved) / 1000)); // Cap at 8 hours (28,800s)
        if (elapsedSec >= 30) {
          // 1. Empire Vault Gold from other automated campsites
          const totalIdleRate = this.getTotalOtherCampsIdleRate();
          const globalMult = 1.0 + (this.state.franchiseUpgrades?.globalIncomeLevel || 0) * 0.15;

          // 2. Active Camp Cash from current resort operations
          const campActiveRate = calculateCampActiveRate({
            world: this.state.world || 1,
            region: this.state.region || 1,
            camp: this.state.camp || 1,
            completedPads: Array.from(this.completedPads || []),
            managers: this.state.managers,
            buildingLevels: this.state.buildingLevels,
            hasWaterPump: this.hasWaterPump,
            hasKiosk: this.hasKiosk
          });
          const activeOfflineRate = Math.max(0, campActiveRate * 0.50);

          let offlineVaultGold = 0;
          let offlineCampCash = 0;

          if (this.state.boostTimer > 0) {
            const boostedSec = Math.min(elapsedSec, this.state.boostTimer);
            const normalSec = Math.max(0, elapsedSec - boostedSec);
            const boostMult = this.state.boostMultiplier || 2.0;

            offlineVaultGold = Math.round((totalIdleRate * (boostedSec * boostMult + normalSec)) * globalMult);
            offlineCampCash = Math.round(activeOfflineRate * (boostedSec * boostMult + normalSec));

            this.state.boostTimer = Math.max(0, this.state.boostTimer - elapsedSec);
            if (this.state.boostTimer <= 0) this.state.boostMultiplier = 1.0;
          } else {
            offlineVaultGold = Math.round(totalIdleRate * elapsedSec * globalMult);
            offlineCampCash = Math.round(activeOfflineRate * elapsedSec);
          }

          if (offlineCampCash > 0 || offlineVaultGold > 0) {
            setTimeout(() => {
              this.modalsUI.showOfflineWelcome({
                elapsedSec,
                campCash: offlineCampCash,
                vaultGold: offlineVaultGold
              });
            }, 600);
          }
        }
      }

      this.updateGridLoad();
      this.updateHUD();
      this.updateBadges();
      this.checkCampgroundCompletion();
      if (this.isMainMenuOpen) {
        this.selectedMenuRegion = this.state.region || 1;
        this.updateMainMenuCurrencies();
        this.renderRegionTrail();
      }
    } catch (e) {
      console.warn(e);
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.campersGame = new Campers2DGame();
  });
}
