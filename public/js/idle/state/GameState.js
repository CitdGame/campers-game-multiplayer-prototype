// GameState: Single Source of Truth for Player & Franchise Progress
import { CURRENT_EVENT_DEF } from '../config/events.js';
import { getCampKey } from '../config/worlds.js';

export const SAVE_KEY = 'campers_pixel_save_v2';
export const SAVE_VERSION = 2;

export function createInitialState() {
  return {
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
    buildingLevels: {
      tent_1: 1,
      caravan_1: 1
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
      pitch_upgrade: { claimed: false },
      resort_rating: { claimed: false },
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
    }
  };
}

export class GameState {
  constructor(initialData = null) {
    this.data = initialData || createInitialState();
    // Alias workers to managers
    this.data.workers = this.data.managers;
    this.listeners = new Map();
  }

  // Event Pub/Sub
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(payload, this.data); } catch (e) { console.error(e); }
      });
    }
  }

  // --- CURRENCY TRANSACTIONS ---
  addCash(amount, isRaw = false) {
    const globalMult = 1.0 + (this.data.franchiseUpgrades?.globalIncomeLevel || 0) * 0.15;
    const boostMult = this.data.boostTimer > 0 ? (this.data.boostMultiplier || 2.0) : 1.0;
    const finalAmount = isRaw ? amount : Math.round(amount * globalMult * boostMult);

    this.data.cash = (this.data.cash || 0) + finalAmount;
    if (!this.data.stats) this.data.stats = {};
    this.data.stats.totalCashEarned = (this.data.stats.totalCashEarned || 0) + finalAmount;
    this.emit('cashChanged', { amount: finalAmount, total: this.data.cash });
    return finalAmount;
  }

  spendCash(amount) {
    if (this.data.cash >= amount) {
      this.data.cash -= amount;
      this.emit('cashChanged', { amount: -amount, total: this.data.cash });
      return true;
    }
    return false;
  }

  addEmpireGold(amount) {
    this.data.empireGold = (this.data.empireGold || 0) + amount;
    this.emit('goldChanged', { amount, total: this.data.empireGold });
  }

  spendEmpireGold(amount) {
    if ((this.data.empireGold || 0) >= amount) {
      this.data.empireGold -= amount;
      this.emit('goldChanged', { amount: -amount, total: this.data.empireGold });
      return true;
    }
    return false;
  }

  addGems(amount) {
    this.data.gems = (this.data.gems || 0) + amount;
    this.emit('gemsChanged', { amount, total: this.data.gems });
  }

  spendGems(amount) {
    if ((this.data.gems || 0) >= amount) {
      this.data.gems -= amount;
      this.emit('gemsChanged', { amount: -amount, total: this.data.gems });
      return true;
    }
    return false;
  }

  addEventPoints(amount = 1) {
    if (!this.data.eventProgress) {
      this.data.eventProgress = {
        eventId: CURRENT_EVENT_DEF.id,
        points: 0,
        claimed: {}
      };
    }
    this.data.eventProgress.points = (this.data.eventProgress.points || 0) + amount;
    this.emit('eventProgressChanged', this.data.eventProgress);
  }

  // --- PERSISTENCE ---
  save(currentCampSnapshot = null) {
    try {
      if (currentCampSnapshot) {
        const campKey = getCampKey(this.data.world, this.data.region, this.data.camp);
        if (!this.data.camps) this.data.camps = {};
        this.data.camps[campKey] = currentCampSnapshot;
      }

      localStorage.setItem(SAVE_KEY, JSON.stringify({
        saveVersion: SAVE_VERSION,
        world: this.data.world || 1,
        region: this.data.region || 1,
        camp: this.data.camp || 1,
        maxUnlockedWorld: this.data.maxUnlockedWorld || 1,
        maxUnlockedRegion: this.data.maxUnlockedRegion || 1,
        maxUnlockedCamp: this.data.maxUnlockedCamp || 1,
        campsCompleted: this.data.campsCompleted || 0,
        cash: this.data.cash,
        empireGold: this.data.empireGold || 0,
        franchiseUpgrades: this.data.franchiseUpgrades,
        gems: this.data.gems ?? 25,
        boostTimer: Math.max(0, this.data.boostTimer || 0),
        boostMultiplier: this.data.boostMultiplier || 1.0,
        upgrades: this.data.upgrades,
        crates: this.data.crates,
        eventProgress: this.data.eventProgress,
        camps: this.data.camps,
        lastTimestamp: Date.now()
      }));
    } catch (e) {
      console.warn('GameState save failed:', e);
    }
  }

  load() {
    try {
      try { localStorage.removeItem('campers_pixel_save'); } catch (e) {}
      const d = localStorage.getItem(SAVE_KEY);
      if (!d) return null;
      const p = JSON.parse(d);
      if (!p || p.saveVersion !== SAVE_VERSION) {
        localStorage.removeItem(SAVE_KEY);
        return null;
      }
      return p;
    } catch (e) {
      console.warn('GameState load failed:', e);
      return null;
    }
  }

  reset() {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem('campers_pixel_save');
      if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    } catch (e) {}
    this.data = createInitialState();
    this.data.workers = this.data.managers;
  }
}
