// Campers: Pocket Resort (2D Pixel Art Engine - Stardew Valley & Pokémon Style)
import { PixelRenderer, PIXEL_COLORS } from './pixelSprites.js';

export const SAVE_KEY = 'campers_pixel_save_v2';
export const SAVE_VERSION = 2;

export const CURRENT_EVENT_DEF = {
  id: 'forest_festival_2026',
  name: '🔥 Großes Waldfestival',
  subtitle: 'Lagerfeuer-Nacht & Festtags-Jubel',
  desc: 'Verdiene Event-Punkte durch Check-Ins, Müllsammeln & Lagerfeuer, um epische Franchise-Belohnungen einzulösen!',
  durationHours: 64,
  milestones: [
    { id: 'm1', points: 15, title: 'Edelstein-Paket', rewardText: '💎 35 Gems', type: 'gems', amount: 35 },
    { id: 'm2', points: 40, title: 'Goldene Vorratskiste', rewardText: '📦 Goldene Kiste', type: 'crate', crateId: 'golden' },
    { id: 'm3', points: 80, title: 'Empire Tresor-Prämie', rewardText: '🏛️ $450 Gold + ⚡ 1h Boost', type: 'vault_boost', gold: 450, boostSeconds: 3600 },
    { id: 'm4', points: 150, title: 'Kaiserlicher Hauptpreis', rewardText: '👑 Kaiser-Kiste + 💎 100 Gems', type: 'emperor_pack', crateId: 'emperor', gems: 100 }
  ]
};

export const MANAGER_DEFS = {
  alex: {
    id: 'alex',
    name: 'Clerk Alex',
    role: 'receptionist',
    roleName: 'Front Desk Clerk #1',
    category: 'frontdesk',
    rarity: 'common',
    icon: '🧑‍💼',
    desc: 'Auto-checks in arriving campers at the front desk',
    unlockCards: 1,
    maxLevel: 4,
    x: 192,
    y: 522,
    levels: [
      { level: 1, cardsReq: 1, cost: 25, speed: 2.0, tip: 0, desc: 'Auto check-in every 2.0s' },
      { level: 2, cardsReq: 2, cost: 60, speed: 1.3, tip: 5, desc: 'Check-in every 1.3s +$5 tip' },
      { level: 3, cardsReq: 4, cost: 120, speed: 0.8, tip: 12, desc: 'Check-in every 0.8s +$12 tip' },
      { level: 4, cardsReq: 8, cost: 240, speed: 0.4, tip: 22, desc: 'Master Concierge: 0.4s +$22 tip' }
    ]
  },
  sam: {
    id: 'sam',
    name: 'Clerk Sam',
    role: 'receptionist_2',
    roleName: 'Front Desk Clerk #2',
    category: 'frontdesk',
    rarity: 'rare',
    icon: '🧑‍💻',
    desc: 'Adds 2nd check-in counter lane to clear waves 2x faster',
    unlockCards: 2,
    maxLevel: 3,
    x: 208,
    y: 522,
    levels: [
      { level: 1, cardsReq: 2, cost: 50, speed: 1.8, tip: 5, desc: 'Dual lane auto-checkin (1.8s +$5 tip)' },
      { level: 2, cardsReq: 4, cost: 110, speed: 1.0, tip: 12, desc: 'Fast track lane (1.0s +$12 tip)' },
      { level: 3, cardsReq: 8, cost: 220, speed: 0.5, tip: 25, desc: 'VIP Express (0.5s +$25 tip)' }
    ]
  },
  oliver: {
    id: 'oliver',
    name: 'Oliver',
    role: 'cleaner_tent',
    roleName: 'Tent Meadow Cleaner',
    category: 'cleaner',
    rarity: 'common',
    icon: '🧹',
    desc: 'Patrols West Meadow, sweeps tent trash & collects cash drops',
    zone: 'tent',
    unlockCards: 1,
    maxLevel: 3,
    x: 100,
    y: 300,
    levels: [
      { level: 1, cardsReq: 1, cost: 20, speed: 52, bonus: 0, desc: 'Sweeps West Tents at 52 px/s' },
      { level: 2, cardsReq: 2, cost: 45, speed: 78, bonus: 5, desc: 'Roller Skates (78 px/s +$5 trash bonus)' },
      { level: 3, cardsReq: 4, cost: 90, speed: 105, bonus: 15, desc: 'Turbo Sweeper (105 px/s +$15 trash bonus)' }
    ]
  },
  chloe: {
    id: 'chloe',
    name: 'Chloe',
    role: 'cleaner_caravan',
    roleName: 'Caravan Lane Cleaner',
    category: 'cleaner',
    rarity: 'rare',
    icon: '🧽',
    desc: 'Patrols East Lane, sweeps caravan trash & collects cash drops',
    zone: 'caravan',
    unlockCards: 2,
    maxLevel: 3,
    x: 300,
    y: 260,
    levels: [
      { level: 1, cardsReq: 2, cost: 40, speed: 56, bonus: 5, desc: 'Sweeps East Caravans at 56 px/s +$5' },
      { level: 2, cardsReq: 4, cost: 95, speed: 82, bonus: 12, desc: 'Speed boost (82 px/s +$12 trash bonus)' },
      { level: 3, cardsReq: 8, cost: 180, speed: 112, bonus: 22, desc: 'Eco-Mop Pro (112 px/s +$22 trash bonus)' }
    ]
  },
  felix: {
    id: 'felix',
    name: 'Felix',
    role: 'cleaner_cabin',
    roleName: 'Forest Lodge Cleaner',
    category: 'cleaner',
    rarity: 'epic',
    icon: '✨',
    desc: 'Patrols North Forest, sweeps luxury trash & VIP cash piles',
    zone: 'cabin',
    unlockCards: 3,
    maxLevel: 3,
    x: 200,
    y: 120,
    levels: [
      { level: 1, cardsReq: 3, cost: 70, speed: 60, bonus: 10, desc: 'Sweeps Forest Lodges at 60 px/s +$10' },
      { level: 2, cardsReq: 5, cost: 150, speed: 88, bonus: 20, desc: 'Polished Butler (88 px/s +$20 trash bonus)' },
      { level: 3, cardsReq: 10, cost: 260, speed: 120, bonus: 35, desc: 'White Glove Service (120 px/s +$35 trash bonus)' }
    ]
  },
  finn: {
    id: 'finn',
    name: 'Finn',
    role: 'fisher',
    roleName: 'Master Fisherman',
    category: 'specialist',
    rarity: 'rare',
    icon: '🎣',
    desc: 'Auto-fishes on the tranquil pond pier and sells prized catches',
    unlockCards: 2,
    maxLevel: 4,
    x: 370,
    y: 136,
    levels: [
      { level: 1, cardsReq: 2, cost: 45, interval: 3.6, income: 30, desc: 'Catches fish every 3.6s ($30/catch)' },
      { level: 2, cardsReq: 4, cost: 95, interval: 2.5, income: 50, desc: 'Carbon Rod: Fish every 2.5s ($50/catch)' },
      { level: 3, cardsReq: 8, cost: 180, interval: 1.6, income: 80, desc: 'Golden Lures: Fish every 1.6s ($80/catch)' },
      { level: 4, cardsReq: 15, cost: 320, interval: 1.0, income: 130, desc: 'Trophy Angler: Fish every 1.0s ($130/catch)' }
    ]
  },
  bella: {
    id: 'bella',
    name: 'Bella',
    role: 'barista',
    roleName: 'Kiosk Barista',
    category: 'specialist',
    rarity: 'common',
    icon: '☕',
    desc: 'Staffs the Snack Kiosk, serving campers coffee, snacks & ice cream',
    unlockCards: 1,
    maxLevel: 4,
    x: 320,
    y: 456,
    levels: [
      { level: 1, cardsReq: 1, cost: 30, interval: 4.0, income: 25, desc: 'Serves snacks every 4.0s ($25/sale)' },
      { level: 2, cardsReq: 3, cost: 70, interval: 2.8, income: 45, desc: 'Espresso Bar: Serves every 2.8s ($45/sale)' },
      { level: 3, cardsReq: 6, cost: 140, interval: 1.8, income: 75, desc: 'Gourmet Treats: Serves every 1.8s ($75/sale)' },
      { level: 4, cardsReq: 12, cost: 260, interval: 1.1, income: 120, desc: 'Cafe Delite: Serves every 1.1s ($120/sale)' }
    ]
  },
  robin: {
    id: 'robin',
    name: 'Robin',
    role: 'lumberjack',
    roleName: 'Fire Tender & Woodcutter',
    category: 'specialist',
    rarity: 'epic',
    icon: '🪵',
    desc: 'Hauls firewood to campfire for nonstop Joy Frenzy (1.5x Multiplier)',
    unlockCards: 3,
    maxLevel: 3,
    x: 360,
    y: 340,
    levels: [
      { level: 1, cardsReq: 3, cost: 60, capacity: 1, speed: 60, frenzyAdd: 18, desc: 'Hauls 1 log at 60 px/s (+18s Frenzy)' },
      { level: 2, cardsReq: 5, cost: 140, capacity: 2, speed: 78, frenzyAdd: 28, desc: 'Log Cart: Hauls 2 logs at 78 px/s (+28s Frenzy)' },
      { level: 3, cardsReq: 10, cost: 250, capacity: 3, speed: 98, frenzyAdd: 42, tip: 25, desc: 'Timber Master: 3 logs (+42s Frenzy +$25 Tip)' }
    ]
  }
};

export const WORKER_DEFS = MANAGER_DEFS;

export const MANAGER_PREREQS = {
  alex: {
    label: 'Check in 1st camper party',
    isMet: (game) => (game.state.stats?.totalCampersServed || 0) >= 1
  },
  oliver: {
    label: 'Sweep 1 trash bag or serve 3 campers',
    isMet: (game) => (game.state.stats?.trashCollected || 0) >= 1 || (game.state.stats?.totalCampersServed || 0) >= 3
  },
  sam: {
    label: 'Serve 10 campers or build a pitch',
    isMet: (game) => (game.state.stats?.totalCampersServed || 0) >= 10 || (game.state.stats?.pitchesBuilt || 0) >= 1
  },
  chloe: {
    label: 'Build Caravan #2 or serve 6 campers',
    isMet: (game) => game.completedPads?.has('pad_caravan_2') || (game.state.stats?.totalCampersServed || 0) >= 6
  },
  robin: {
    label: 'Feed Campfire 3 times or build Robin\'s Cards',
    isMet: (game) => (game.state.stats?.woodBurned || 0) >= 3 || game.completedPads?.has('pad_robin')
  },
  finn: {
    label: 'Build Water Well or catch 3 fish',
    isMet: (game) => game.hasWaterPump || (game.state.stats?.fishCaught || 0) >= 3
  },
  bella: {
    label: 'Build Snack Kiosk',
    isMet: (game) => !!game.hasKiosk
  },
  felix: {
    label: 'Build Glamping Dome, Cabin or Chalet',
    isMet: (game) => game.pitches.some(p => p.tier === 'glamping' || p.tier === 'cabin' || p.tier === 'chalet' || p.tier === 'lodge' || p.tier === 'villa')
  }
};

export const CRATE_DEFS = {
  free: {
    id: 'free',
    name: 'Free Supply Crate',
    icon: '🎁',
    cost: 0,
    cooldown: 90,
    minCards: 2,
    maxCards: 3,
    minCash: 25,
    maxCash: 50,
    desc: 'Contains 2-3 Manager Cards + $25-$50 Cash Bonus'
  },
  wooden: {
    id: 'wooden',
    name: 'Wooden Supply Crate',
    icon: '📦',
    cost: 80,
    minCards: 4,
    maxCards: 5,
    minCash: 40,
    maxCash: 80,
    guaranteedRare: true,
    desc: 'Guarantees 4-5 Cards + at least 1 Rare Card + Cash Bonus'
  },
  golden: {
    id: 'golden',
    name: 'Golden Resort Crate',
    icon: '👑',
    cost: 220,
    minCards: 8,
    maxCards: 10,
    minCash: 100,
    maxCash: 220,
    guaranteedEpic: true,
    guaranteedRare: true,
    desc: 'Guarantees 8-10 Cards + Epic Manager Card + Mega Cash!'
  },
  mythic: {
    id: 'mythic',
    name: 'Mythic Supply Crate',
    icon: '🔮',
    currency: 'gems',
    cost: 100,
    minCards: 14,
    maxCards: 18,
    minCash: 350,
    maxCash: 800,
    guaranteedEpic: true,
    guaranteedRare: true,
    desc: 'Guarantees 14-18 Cards + 2+ Epics & 4+ Rares + Huge Cash!'
  },
  emperor: {
    id: 'emperor',
    name: 'Emperor Vault',
    icon: '👑',
    currency: 'gems',
    cost: 250,
    minCards: 32,
    maxCards: 42,
    minCash: 1200,
    maxCash: 3000,
    guaranteedEpic: true,
    guaranteedRare: true,
    desc: 'Guarantees 32-42 Cards + 6+ Epics & 10+ Rares + Mega Jackpot!'
  }
};

export const WORLD_BIOMES = [
  {
    id: 'forest',
    name: 'Pine Haven Forest',
    theme: 'Meadow & Pines',
    treeType: 'pine',
    palette: {
      grassLight: '#62b535',
      grassMid: '#4b9824',
      grassDark: '#367219',
      dirtMid: '#cf9e54',
      dirtDark: '#996f30',
      waterLight: '#5dade2',
      waterMid: '#2980b9',
      waterDark: '#1b4f72',
      treeLeaf: '#4b9824',
      treeShadow: '#367219'
    }
  },
  {
    id: 'coastal',
    name: 'Azure Cove Coast',
    theme: 'Sandy Beach & Palm Bay',
    treeType: 'palm',
    palette: {
      grassLight: '#f9e79f',
      grassMid: '#f5cba7',
      grassDark: '#d4ac0d',
      dirtMid: '#e59866',
      dirtDark: '#ba4a00',
      waterLight: '#48c9b0',
      waterMid: '#1abc9c',
      waterDark: '#117864',
      treeLeaf: '#27ae60',
      treeShadow: '#196f3d'
    }
  },
  {
    id: 'alpine',
    name: 'Alpine Peak Ridge',
    theme: 'Snowy Conifers & Crisp Air',
    treeType: 'pine',
    palette: {
      grassLight: '#d5dbdb',
      grassMid: '#aeb6bf',
      grassDark: '#566573',
      dirtMid: '#85929e',
      dirtDark: '#34495e',
      waterLight: '#aed6f1',
      waterMid: '#5dade2',
      waterDark: '#2874a6',
      treeLeaf: '#2e4053',
      treeShadow: '#1b2631'
    }
  },
  {
    id: 'desert',
    name: 'Sunfire Canyon Oasis',
    theme: 'Cactus Groves & Red Rocks',
    treeType: 'cactus',
    palette: {
      grassLight: '#f8c471',
      grassMid: '#eb984e',
      grassDark: '#ca6f1e',
      dirtMid: '#d35400',
      dirtDark: '#873600',
      waterLight: '#76d7c4',
      waterMid: '#17a589',
      waterDark: '#117a65',
      treeLeaf: '#1e8449',
      treeShadow: '#145a32'
    }
  },
  {
    id: 'mystic',
    name: 'Emerald Whispers Valley',
    theme: 'Luminescent Flora & Ancient Trees',
    treeType: 'pine',
    palette: {
      grassLight: '#a3e4d7',
      grassMid: '#48c9b0',
      grassDark: '#16a085',
      dirtMid: '#bb8fce',
      dirtDark: '#6c3483',
      waterLight: '#bb8fce',
      waterMid: '#8e44ad',
      waterDark: '#512e5f',
      treeLeaf: '#117864',
      treeShadow: '#0e6251'
    }
  }
];

export function getCampKey(world = 1, region = 1, camp = 1) {
  return `w${world}_r${region}_c${camp}`;
}

export const CAMP_MAP_CONFIGS = [
  { camp: 1, w: 380, h: 540, pitches: 4, name: 'Forest Outpost', tier: 'Starter Glade' },
  { camp: 2, w: 420, h: 600, pitches: 5, name: 'Trailside Camp', tier: 'Expanding Clearing' },
  { camp: 3, w: 465, h: 670, pitches: 6, name: 'Riverbend Park', tier: 'Lakeside Camp' },
  { camp: 4, w: 515, h: 740, pitches: 7, name: 'Meadow Valley', tier: 'Holiday Meadow' },
  { camp: 5, w: 570, h: 820, pitches: 8, name: 'Pine Ridge Resort', tier: 'Active Resort' },
  { camp: 6, w: 630, h: 900, pitches: 9, name: 'Sunny Oasis Park', tier: 'Holiday Park' },
  { camp: 7, w: 690, h: 980, pitches: 10, name: 'Mountain Haven', tier: 'Luxury Alpine Resort' },
  { camp: 8, w: 750, h: 1060, pitches: 11, name: 'Emerald Wilderness', tier: 'Expansive Eco Paradise' },
  { camp: 9, w: 810, h: 1140, pitches: 12, name: 'Grand Vista Resort', tier: 'Mega Vacation Complex' },
  { camp: 10, w: 880, h: 1240, pitches: 13, name: 'Imperial Empire Sanctuary', tier: 'Imperial Grand Resort' }
];

export function getCampSizeInfo(camp = 1) {
  const c = CAMP_MAP_CONFIGS[Math.min(9, Math.max(0, camp - 1))];
  return {
    ...c,
    size: `${c.w}x${c.h}`
  };
}

export function calculateCampActiveRate(campData) {
  if (!campData || !campData.managers) return 0;
  const mgrs = campData.managers;
  let totalRate = 0;

  const w = campData.world || 1;
  const r = campData.region || 1;
  const c = campData.camp || 1;
  const campProg = (c - 1) / 9;
  const campScale = Math.pow(1.30, c - 1);
  const incomeMult = Math.pow(campScale, 0.94) * (1.0 + (r - 1) * 0.12 + (w - 1) * 0.5);

  // 1. Pitches revenue: requires front desk clerk (Alex or Sam)
  const hasClerk = (mgrs.alex?.level > 0) || (mgrs.sam?.level > 0);
  const pads = campData.completedPads || [];
  const extraPitches = Array.isArray(pads) ? pads.filter(p =>
    p.startsWith('pad_tent') ||
    p.startsWith('pad_caravan') ||
    p.startsWith('pad_glamp') ||
    p.startsWith('pad_cabin') ||
    p.startsWith('pad_chalet') ||
    p.startsWith('pad_lodge') ||
    p.startsWith('pad_villa')
  ).length : 0;
  const pitchCount = 2 + extraPitches;

  if (hasClerk) {
    totalRate += pitchCount * (3.8 * incomeMult);
    const alexLvl = mgrs.alex?.level || 0;
    const samLvl = mgrs.sam?.level || 0;
    totalRate += alexLvl * (2.2 * incomeMult);
    totalRate += samLvl * (3.0 * incomeMult);
  } else {
    // Basic turnover from manual checkins
    totalRate += pitchCount * (1.8 * incomeMult);
  }

  // 2. Cleaners (Oliver, Chloe, Felix)
  const oliverLvl = mgrs.oliver?.level || 0;
  const chloeLvl = mgrs.chloe?.level || 0;
  const felixLvl = mgrs.felix?.level || 0;
  totalRate += oliverLvl * (2.0 * incomeMult);
  totalRate += chloeLvl * (2.8 * incomeMult);
  totalRate += felixLvl * (4.2 * incomeMult);

  // 3. Specialists
  // Finn (Fisherman)
  if (mgrs.finn?.level > 0 && campData.hasWaterPump) {
    const finnRates = [0, 8.5, 20.0, 50.0, 130.0];
    const rVal = finnRates[mgrs.finn.level] || 8.5;
    totalRate += rVal * (1.0 + campProg * 0.25);
  }

  // Bella (Snack Kiosk)
  if (mgrs.bella?.level > 0 && campData.hasKiosk) {
    const bellaRates = [0, 6.5, 16.0, 42.0, 110.0];
    const bVal = bellaRates[mgrs.bella.level] || 6.5;
    totalRate += bVal * (1.0 + campProg * 0.25);
  }

  // Robin (Campfire Joy Frenzy boost)
  if (mgrs.robin?.level > 0) {
    const boost = 1.0 + 0.18 * mgrs.robin.level;
    totalRate *= boost;
  }

  return Math.round(totalRate * 10) / 10;
}

export function calculateCampIdleRate(campData) {
  const activeRate = calculateCampActiveRate(campData);
  // Franchise Passive Efficiency (28% of active throughput for idle background campsites)
  const franchisePassiveEfficiency = 0.28;
  return Math.round(activeRate * franchisePassiveEfficiency * 10) / 10;
}

export function getCampAchievementDefs(world = 1, region = 1, camp = 1) {
  // Balanced progression curve across 10 camps per region
  const campScale = Math.pow(1.26, camp - 1) * (1.0 + (region - 1) * 0.10 + (world - 1) * 0.4);

  const mAlex = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mSam = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mRobin = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mOliver = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mChloe = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mFelix = Math.min(10, 2 + Math.floor(camp * 0.7));
  const mFinn = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mBella = Math.min(10, 2 + Math.floor(camp * 0.6));

  const c1 = 1;
  const c10 = Math.min(32, Math.round(8 + camp * 1.6));
  const w3 = Math.min(15, Math.round(2 + camp * 0.9));
  const t5 = Math.min(20, Math.round(4 + camp * 1.2));
  const t15 = Math.min(45, Math.round(10 + camp * 2.4));
  const p2 = 1;
  const p5 = Math.min(8, Math.max(2, Math.floor(1.2 + camp * 0.8)));
  const f3 = Math.min(12, Math.round(2 + camp * 0.8));
  const k3 = Math.min(15, Math.round(2 + camp * 0.9));
  const cashGoal = Math.round(200 * campScale);
  const utilGoal = camp >= 5 ? 3 : 2;

  const cashReward = (base) => Math.round(base * Math.pow(campScale, 0.88));

  return [
    {
      id: 'first_checkin',
      title: 'First Arrival',
      icon: '🏕️',
      desc: `Check in 1 camper party`,
      goal: c1,
      getStat: (s) => s.stats?.totalCampersServed || 0,
      rewardDesc: `+${mAlex} Alex Cards, +$${cashReward(30)}, +5 💎`,
      reward: { cards: { alex: mAlex }, cash: cashReward(30), gems: 5 }
    },
    {
      id: 'busy_reception',
      title: 'Bustling Resort',
      icon: '📋',
      desc: `Check in ${c10} camper parties`,
      goal: c10,
      getStat: (s) => s.stats?.totalCampersServed || 0,
      rewardDesc: `+${mSam} Sam Cards, +$${cashReward(60)}, +10 💎`,
      reward: { cards: { sam: mSam }, cash: cashReward(60), gems: 10 }
    },
    {
      id: 'campfire_glow',
      title: 'Campfire Warmth',
      icon: '🔥',
      desc: `Feed firewood to the campfire ${w3} times`,
      goal: w3,
      getStat: (s) => s.stats?.woodBurned || 0,
      rewardDesc: `+${mRobin} Robin Cards, +$${cashReward(50)}, +8 💎`,
      reward: { cards: { robin: mRobin }, cash: cashReward(50), gems: 8 }
    },
    {
      id: 'eco_warrior',
      title: 'Clean Campground',
      icon: '🧹',
      desc: `Sweep up ${t5} trash bags`,
      goal: t5,
      getStat: (s) => s.stats?.trashCollected || 0,
      rewardDesc: `+${mOliver} Oliver Cards, +$${cashReward(40)}, +6 💎`,
      reward: { cards: { oliver: mOliver }, cash: cashReward(40), gems: 6 }
    },
    {
      id: 'clean_sweep',
      title: 'Zero Waste Hero',
      icon: '🧽',
      desc: `Sweep up ${t15} trash bags`,
      goal: t15,
      getStat: (s) => s.stats?.trashCollected || 0,
      rewardDesc: `+${mChloe} Chloe Cards, +$${cashReward(80)}, +12 💎`,
      reward: { cards: { chloe: mChloe }, cash: cashReward(80), gems: 12 }
    },
    {
      id: 'first_expansion',
      title: 'Camp Expansion',
      icon: '⛺',
      desc: `Build ${p2} accommodation pitch`,
      goal: p2,
      getStat: (s) => s.stats?.pitchesBuilt || 0,
      rewardDesc: `+${mChloe} Chloe Cards, +$${cashReward(50)}, +8 💎`,
      reward: { cards: { chloe: mChloe }, cash: cashReward(50), gems: 8 }
    },
    {
      id: 'resort_builder',
      title: 'Resort Mogul',
      icon: '🏡',
      desc: `Build ${p5} accommodation pitches`,
      goal: p5,
      getStat: (s) => s.stats?.pitchesBuilt || 0,
      rewardDesc: `+${mFelix} Felix Cards, +$${cashReward(120)}, +15 💎`,
      reward: { cards: { felix: mFelix }, cash: cashReward(120), gems: 15 }
    },
    {
      id: 'master_angler',
      title: 'Pond Fisherman',
      icon: '🎣',
      desc: `Catch ${f3} prize fish at the pond pier`,
      goal: f3,
      getStat: (s) => s.stats?.fishCaught || 0,
      rewardDesc: `+${mFinn} Finn Cards, +$${cashReward(70)}, +10 💎`,
      reward: { cards: { finn: mFinn }, cash: cashReward(70), gems: 10 }
    },
    {
      id: 'snack_attack',
      title: 'Kiosk Barista',
      icon: '☕',
      desc: `Make ${k3} sales at the Snack Kiosk`,
      goal: k3,
      getStat: (s) => s.stats?.kioskOrders || 0,
      rewardDesc: `+${mBella} Bella Cards, +$${cashReward(60)}, +10 💎`,
      reward: { cards: { bella: mBella }, cash: cashReward(60), gems: 10 }
    },
    {
      id: 'cash_flow',
      title: 'Gold Rush',
      icon: '💵',
      desc: `Earn a total of $${cashGoal} campsite revenue`,
      goal: cashGoal,
      getStat: (s) => s.stats?.totalCashEarned || 0,
      rewardDesc: `+${mRobin} Robin, +${mFelix} Felix, +$${cashReward(150)}, +20 💎`,
      reward: { cards: { robin: mRobin, felix: mFelix }, cash: cashReward(150), gems: 20 }
    },
    {
      id: 'power_grid',
      title: 'Power & Water',
      icon: '⚡',
      desc: camp >= 5 ? 'Build Generator, Water Well & Sports Field' : 'Build Generator Shed & Water Pump',
      goal: utilGoal,
      getStat: (s) => s.stats?.utilitiesBuilt || 0,
      rewardDesc: `+${mSam} Sam, +${mFinn} Finn, +$${cashReward(100)}, +12 💎`,
      reward: { cards: { sam: mSam, finn: mFinn }, cash: cashReward(100), gems: 12 }
    }
  ];
}

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

    // Game Economy & State (Dual Currency: Local Camp Cash & Global Empire Vault)
    this.state = {
      cash: 60, // Local Camp Cash
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
      }
    };

    // Workers alias to managers for entity tracking
    this.state.workers = this.state.managers;

    this.workers = {};
    this.activeMainTab = 'managers';
    this.activeManagerFilter = 'all';
    this.pendingLoot = null;

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
    this.isMainMenuOpen = true;

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
    this.initWorld();
    this.initControls();
    this.initUI();
    this.loadState();
    this.openMainMenu();

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

    // World Map dimensions scale dynamically using 10-tier configuration:
    // Camp 1: 380x540 (compact starter) -> Camp 10: 880x1240 (imperial grand resort)
    const campCfg = getCampSizeInfo(camp);
    this.worldW = campCfg.w;
    this.worldH = campCfg.h;

    // Biome theme index (cycles every 2 regions through 5 biomes)
    const biomeIdx = Math.floor((region - 1) / 2) % WORLD_BIOMES.length;
    this.currentBiome = WORLD_BIOMES[biomeIdx];

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

    this.hasWaterPump = false;
    this.hasGenerator = false;
    this.hasKiosk = false;
    this.hasSportsField = false;

    // Reset runtime entities
    this.pitches = [];
    this.buildPads = [];
    this.cashDrops = [];
    this.trashBags = [];
    this.floatTexts = [];
    this.particles = [];
    this.campers = [];

    // --- STARTER PITCHES ---
    this.pitches.push({
      id: 'tent_1',
      name: 'Pup Tent #1',
      tier: 'tent',
      x: Math.round(centerX - 90),
      y: Math.round(this.worldH * 0.48),
      dropX: Math.round(centerX - 70),
      dropY: Math.round(this.worldH * 0.48) + 5,
      capacity: 2,
      guests: [],
      stayDuration: 7.0,
      stayTimer: 0,
      baseIncome: Math.round(25 * incomeMult),
      powerLoad: 0,
      waterLoad: 0
    });

    this.pitches.push({
      id: 'caravan_1',
      name: 'Caravan #1',
      tier: 'caravan',
      x: Math.round(centerX + 90),
      y: Math.round(this.worldH * 0.36),
      dropX: Math.round(centerX + 90),
      dropY: Math.round(this.worldH * 0.36) + 16,
      capacity: 3,
      guests: [],
      stayDuration: 11.0,
      stayTimer: 0,
      baseIncome: Math.round(65 * incomeMult),
      powerLoad: 1,
      waterLoad: 1
    });

    // --- BUILD PADS FOR PROGRESSIVE EXPANSION (UP TO 13 PITCHES) ---
    // Pad 1: Tent #2 (Camp 1+)
    this.createBuildPad({
      id: 'pad_tent_2',
      name: 'Pup Tent #2',
      cost: Math.round(45 * costMult),
      x: Math.round(centerX - 90),
      y: Math.round(this.worldH * 0.38),
      onComplete: (isRestoring = false) => {
        this.pitches.push({
          id: 'tent_2',
          name: 'Pup Tent #2',
          tier: 'tent',
          x: Math.round(centerX - 90),
          y: Math.round(this.worldH * 0.38),
          dropX: Math.round(centerX - 70),
          dropY: Math.round(this.worldH * 0.38) + 5,
          capacity: 2,
          guests: [],
          stayDuration: 7.0,
          stayTimer: 0,
          baseIncome: Math.round(25 * incomeMult),
          powerLoad: 0,
          waterLoad: 0
        });
        this.updateGridLoad();
      }
    });

    // Pad 2: Caravan #2 (Camp 1+)
    this.createBuildPad({
      id: 'pad_caravan_2',
      name: 'Caravan #2',
      cost: Math.round(95 * costMult),
      x: Math.round(centerX + 90),
      y: Math.round(this.worldH * 0.46),
      onComplete: (isRestoring = false) => {
        this.pitches.push({
          id: 'caravan_2',
          name: 'Caravan #2',
          tier: 'caravan',
          x: Math.round(centerX + 90),
          y: Math.round(this.worldH * 0.46),
          dropX: Math.round(centerX + 90),
          dropY: Math.round(this.worldH * 0.46) + 16,
          capacity: 3,
          guests: [],
          stayDuration: 11.0,
          stayTimer: 0,
          baseIncome: Math.round(70 * incomeMult),
          powerLoad: 1,
          waterLoad: 1
        });
        this.updateGridLoad();
      }
    });

    // Pad 3: Tent #3 (Camp 2+)
    if (camp >= 2) {
      this.createBuildPad({
        id: 'pad_tent_3',
        name: 'Pup Tent #3',
        cost: Math.round(65 * costMult),
        x: Math.round(centerX - 90),
        y: Math.round(this.worldH * 0.28),
        onComplete: (isRestoring = false) => {
          this.pitches.push({
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
          this.updateGridLoad();
        }
      });
    }

    // Pad 4: Glamping Dome (Camp 3+)
    if (camp >= 3) {
      this.createBuildPad({
        id: 'pad_glamp',
        name: 'Glamping Dome',
        cost: Math.round(200 * costMult),
        x: centerX,
        y: Math.round(this.worldH * 0.24),
        onComplete: (isRestoring = false) => {
          this.pitches.push({
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
          this.updateGridLoad();
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
        cost: Math.round(180 * costMult),
        x: Math.round(centerX + 95),
        y: Math.round(this.worldH * 0.56),
        onComplete: (isRestoring = false) => {
          this.pitches.push({
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
          this.updateGridLoad();
        }
      });
    }

    // Pad 6: Log Cabin (Camp 5+)
    if (camp >= 5) {
      this.createBuildPad({
        id: 'pad_cabin',
        name: 'Log Cabin',
        cost: Math.round(280 * costMult),
        x: centerX,
        y: Math.round(this.worldH * 0.12),
        onComplete: (isRestoring = false) => {
          this.pitches.push({
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
          this.updateGridLoad();
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
        cost: Math.round(350 * costMult),
        x: Math.round(centerX - 100),
        y: Math.round(this.worldH * 0.16),
        onComplete: (isRestoring = false) => {
          this.pitches.push({
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
          this.updateGridLoad();
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
        cost: Math.round(480 * costMult),
        x: Math.round(centerX + 110),
        y: Math.round(this.worldH * 0.16),
        onComplete: (isRestoring = false) => {
          this.pitches.push({
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
          this.updateGridLoad();
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
        cost: Math.round(620 * costMult),
        x: Math.round(centerX + 120),
        y: Math.round(this.worldH * 0.64),
        onComplete: (isRestoring = false) => {
          this.pitches.push({
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
          this.updateGridLoad();
        }
      });
    }

    // Pad 10: Safari Wilderness Lodge (Camp 9+)
    if (camp >= 9) {
      this.createBuildPad({
        id: 'pad_lodge',
        name: 'Safari Lodge',
        cost: Math.round(850 * costMult),
        x: Math.round(centerX - 120),
        y: Math.round(this.worldH * 0.08),
        onComplete: (isRestoring = false) => {
          this.pitches.push({
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
          this.updateGridLoad();
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
        cost: Math.round(1350 * costMult),
        x: Math.round(centerX + 120),
        y: Math.round(this.worldH * 0.08),
        onComplete: (isRestoring = false) => {
          this.pitches.push({
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
          this.updateGridLoad();
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
      cost: Math.round(110 * costMult),
      x: this.waterPos.x,
      y: this.waterPos.y,
      onComplete: (isRestoring = false) => {
        this.hasWaterPump = true;
        this.state.waterCapacity += 6 + Math.floor(camp * 0.5);
        if (!isRestoring) this.showFloatText(this.waterPos.x, this.waterPos.y, '+💧 Water System!', '#3498db');
        this.updateHUD();
      }
    });

    this.createBuildPad({
      id: 'pad_gen',
      name: 'Generator',
      cost: Math.round(140 * costMult),
      x: this.genPos.x,
      y: this.genPos.y,
      onComplete: (isRestoring = false) => {
        this.hasGenerator = true;
        this.state.powerCapacity += 6 + Math.floor(camp * 0.5);
        if (!isRestoring) this.showFloatText(this.genPos.x, this.genPos.y, '+⚡ Power Grid!', '#f1c40f');
        this.updateHUD();
      }
    });

    this.createBuildPad({
      id: 'pad_kiosk',
      name: 'Snack Kiosk',
      cost: Math.round(90 * costMult),
      x: this.kioskPos.x,
      y: this.kioskPos.y,
      onComplete: (isRestoring = false) => {
        this.hasKiosk = true;
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
          if (!isRestoring) this.showFloatText(this.sportsFieldPos.x, this.sportsFieldPos.y, '⚽ Sports Open!', '#27ae60');
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
  }

  createBuildPad(config) {
    this.buildPads.push({
      ...config,
      paid: 0,
      radius: 20,
      isCompleted: false
    });
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
      power += p.powerLoad;
      water += p.waterLoad;
    });
    this.state.powerDemand = power;
    this.state.waterDemand = water;

    if (this.state.powerDemand > this.state.powerCapacity) {
      window.soundFX?.playOverload();
    }
    this.updateHUD();
  }

  // --- TOUCH JOYSTICK & KEYBOARD CONTROLS ---
  initControls() {
    window.addEventListener('resize', () => this.onResize());

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
      if (e.clientY > window.innerHeight * 0.35 && e.target.tagName !== 'BUTTON') {
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

    this.updateHUD();
    this.updateBadges();
    this.checkCampgroundCompletion();
    this.renderDrawerContent();
  }

  // --- MAIN MENU HUB SYSTEM ---
  openMainMenu() {
    this.isMainMenuOpen = true;
    this.selectedMenuRegion = this.state.region || 1;
    if (this.ui?.upgradesDrawer) this.ui.upgradesDrawer.classList.remove('open');
    if (this.ui?.worldModal) this.ui.worldModal.style.display = 'none';
    if (this.ui?.crateModal) this.ui.crateModal.style.display = 'none';
    if (this.ui?.eventsModal) this.ui.eventsModal.style.display = 'none';
    if (this.ui?.mainMenu) {
      this.ui.mainMenu.style.display = 'flex';
      this.updateMainMenuCurrencies();
      this.renderRegionTrail();
    }
  }

  closeMainMenu() {
    this.isMainMenuOpen = false;
    if (this.ui?.mainMenu) {
      this.ui.mainMenu.style.display = 'none';
    }
    window.soundFX?.playPop();
  }

  toggleMainMenu() {
    if (this.isMainMenuOpen) {
      this.closeMainMenu();
    } else {
      this.openMainMenu();
    }
  }

  updateMainMenuCurrencies() {
    if (!this.ui?.mainMenu || !this.isMainMenuOpen) return;
    const otherRate = this.getTotalOtherCampsIdleRate();

    if (this.ui.menuCash) this.ui.menuCash.textContent = `$${Math.floor(this.state.cash || 0).toLocaleString()}`;
    if (this.ui.menuVault) this.ui.menuVault.textContent = `$${Math.floor(this.state.empireGold || 0).toLocaleString()}`;
    if (this.ui.menuGems) this.ui.menuGems.textContent = Math.floor(this.state.gems || 0).toLocaleString();
    if (this.ui.menuIdleRate) {
      if (this.ui.menuEmpireIdle) this.ui.menuEmpireIdle.style.display = otherRate > 0 ? 'flex' : 'none';
      this.ui.menuIdleRate.textContent = `+$${otherRate.toFixed(1)}/s`;
    }

    if (this.ui.menuCrateSub) {
      const freeTimer = this.state.crates?.freeTimer || 0;
      if (freeTimer <= 0) {
        this.ui.menuCrateSub.textContent = 'Kiste bereit! 🎁';
        this.ui.menuCrateSub.style.color = '#27ae60';
        this.ui.menuCrateSub.style.fontWeight = 'bold';
      } else {
        const m = Math.floor(freeTimer / 60);
        const s = Math.floor(freeTimer % 60);
        this.ui.menuCrateSub.textContent = `Gratis in ${m}:${s < 10 ? '0' : ''}${s}`;
        this.ui.menuCrateSub.style.color = '#5d6d7e';
        this.ui.menuCrateSub.style.fontWeight = 'normal';
      }
    }
  }

  updateMainMenuContent() {
    if (!this.ui?.mainMenu) return;
    this.updateMainMenuCurrencies();
    this.renderRegionTrail();
  }

  renderRegionTrail() {
    if (!this.ui?.regionTrailList) return;

    const curWorld = this.state.world || 1;
    const curRegion = this.state.region || 1;
    const curCamp = this.state.camp || 1;
    const maxWorld = this.state.maxUnlockedWorld || 1;
    const maxRegion = this.state.maxUnlockedRegion || 1;
    const maxCamp = this.state.maxUnlockedCamp || 1;

    if (!this.selectedMenuRegion) {
      this.selectedMenuRegion = curRegion;
    }
    // Clamp within unlocked bounds
    this.selectedMenuRegion = Math.max(1, Math.min(this.selectedMenuRegion, maxRegion));
    const selReg = this.selectedMenuRegion;

    // Region nav buttons
    if (this.ui.btnPrevRegion) {
      this.ui.btnPrevRegion.disabled = (selReg <= 1);
    }
    if (this.ui.btnNextRegion) {
      this.ui.btnNextRegion.disabled = (selReg >= maxRegion);
    }

    // Biome info for this region
    const biomeIdx = Math.floor((selReg - 1) / 2) % WORLD_BIOMES.length;
    const biome = WORLD_BIOMES[biomeIdx] || WORLD_BIOMES[0];

    if (this.ui.trailRegionTitle) {
      this.ui.trailRegionTitle.textContent = `REGION ${selReg}: ${biome.name.toUpperCase()}`;
    }
    if (this.ui.trailWorldSubtitle) {
      const isViewingActive = (selReg === curRegion);
      this.ui.trailWorldSubtitle.innerHTML = `Welt ${curWorld} • ${biome.theme}${!isViewingActive ? `<br><button id="btn-jump-active-camp" style="margin-top: 5px; background: #27ae60; color: #fff; border: 1px solid #142819; border-radius: 4px; font-size: 9px; padding: 3px 8px; cursor: pointer; font-family: monospace;">📍 Zurück zu aktiver Region ${curRegion}</button>` : ''}`;
    }

    // Calculate progression along this region's 10 campsites
    let clearedCount = 0;
    for (let c = 1; c <= 10; c++) {
      const isCleared = (curWorld < maxWorld) ||
                        (curWorld === maxWorld && selReg < maxRegion) ||
                        (curWorld === maxWorld && selReg === maxRegion && c < maxCamp) ||
                        (this.state.camps?.[getCampKey(curWorld, selReg, c)]?.idleRate > 0);
      if (isCleared) clearedCount++;
    }

    const progressPct = Math.round((clearedCount / 10) * 100);
    if (this.ui.trailProgressFill) {
      this.ui.trailProgressFill.style.width = `${Math.max(8, progressPct)}%`;
    }
    if (this.ui.trailProgressText) {
      this.ui.trailProgressText.textContent = `${clearedCount} / 10 Camps abgeschlossen`;
    }

    // Generate 10 trail nodes
    let html = '';
    for (let c = 1; c <= 10; c++) {
      const cfg = getCampSizeInfo(c);
      const isCurrent = (curWorld === this.state.world && selReg === curRegion && c === curCamp);
      const isUnlocked = isCurrent ||
                         (curWorld < maxWorld) ||
                         (curWorld === maxWorld && selReg < maxRegion) ||
                         (curWorld === maxWorld && selReg === maxRegion && c <= maxCamp);
      const cKey = getCampKey(curWorld, selReg, c);
      const cData = this.state.camps?.[cKey];
      const isCleared = !isCurrent && (
                        (curWorld < maxWorld) ||
                        (curWorld === maxWorld && selReg < maxRegion) ||
                        (curWorld === maxWorld && selReg === maxRegion && c < maxCamp) ||
                        (cData && cData.idleRate > 0)
      );

      // Node state class
      const nodeClass = isCurrent
        ? 'trail-node active-node'
        : isCleared
          ? 'trail-node cleared-node'
          : isUnlocked
            ? 'trail-node'
            : 'trail-node locked-node';

      // Icon & visual cues
      const icon = isCurrent ? '🏕️' : isCleared ? '🏰' : isUnlocked ? '⛺' : '🔒';

      // Status text
      let statusHtml = '';
      if (isCurrent) {
        statusHtml = '<span class="trail-node-status" style="color: #27ae60;">⭐ JETZT AKTIV</span>';
      } else if (isCleared) {
        const idleVal = cData?.idleRate || 0;
        if (idleVal > 0) {
          statusHtml = `<span class="trail-node-status" style="color: #b7950b;">🏛️ +$${idleVal.toFixed(1)}/s Tresor-Gold</span>`;
        } else {
          statusHtml = '<span class="trail-node-status" style="color: #27ae60;">✓ Abgeschlossen & Automatisiert</span>';
        }
      } else if (isUnlocked) {
        statusHtml = '<span class="trail-node-status" style="color: #2980b9;">⚡ Bereit zur Erkundung</span>';
      } else {
        statusHtml = `<span class="trail-node-status" style="color: #95a5a6;">🔒 Schließe Camp #${c - 1} ab</span>`;
      }

      // Button
      let btnHtml = '';
      if (isCurrent) {
        btnHtml = `<button class="btn-trail-go current-play" data-play-camp="${c}">▶️ SPIELEN</button>`;
      } else if (isUnlocked) {
        btnHtml = `<button class="btn-trail-go visit" data-play-camp="${c}">BESUCHEN ✈️</button>`;
      } else {
        btnHtml = `<button class="btn-trail-go" disabled>GESPERRT</button>`;
      }

      html += `
        <div class="${nodeClass}" data-camp-num="${c}">
          <div class="trail-node-icon">${icon}</div>
          <div class="trail-node-info">
            <div class="trail-node-name">
              <span>Camp #${c}: ${cfg.name}</span>
            </div>
            <div class="trail-node-meta">
              ${cfg.tier} • Bis zu ${cfg.pitches} Stellplätze
            </div>
            ${statusHtml}
          </div>
          <div>
            ${btnHtml}
          </div>
        </div>
      `;
    }

    this.ui.regionTrailList.innerHTML = html;
  }

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

  openEventsModal() {
    if (!this.ui?.eventsModal) return;
    this.ui.eventsModal.style.display = 'flex';
    this.renderEventsModal();
  }

  closeEventsModal() {
    if (this.ui?.eventsModal) {
      this.ui.eventsModal.style.display = 'none';
    }
  }

  renderEventsModal() {
    if (!this.ui?.eventsModal) return;
    const progress = this.state.eventProgress || { points: 0, claimed: {} };
    const curPts = progress.points || 0;
    const maxMilestonePts = 150;

    if (this.ui.eventPointsText) {
      this.ui.eventPointsText.textContent = `🔥 ${curPts} / ${maxMilestonePts} Punkte`;
    }
    if (this.ui.eventPointsFill) {
      const pct = Math.min(100, Math.round((curPts / maxMilestonePts) * 100));
      this.ui.eventPointsFill.style.width = `${pct}%`;
    }

    if (this.ui.eventMilestonesList) {
      let html = '';
      CURRENT_EVENT_DEF.milestones.forEach((m, idx) => {
        const isClaimed = !!progress.claimed?.[m.id];
        const canClaim = !isClaimed && curPts >= m.points;

        html += `
          <div style="background: white; border: 2px solid ${canClaim ? '#27ae60' : isClaimed ? '#bdc3c7' : '#142819'}; border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center; gap: 8px; box-shadow: 0 2px 0 #142819; ${isClaimed ? 'opacity: 0.65;' : ''}">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="font-size: 24px;">${idx === 3 ? '👑' : idx === 2 ? '🏛️' : idx === 1 ? '📦' : '💎'}</div>
              <div>
                <div style="font-size: 12px; font-weight: bold; color: #142819;">${m.title}</div>
                <div style="font-size: 11px; color: #27ae60; font-weight: bold;">${m.rewardText}</div>
                <div style="font-size: 9px; color: #7f8c8d;">Benötigt: ${m.points} Festival-Punkte</div>
              </div>
            </div>
            <div>
              ${isClaimed
                ? `<button class="btn-manager-action maxed" disabled style="font-size: 11px; padding: 6px 10px;">✅ Eingelöst</button>`
                : canClaim
                  ? `<button class="btn-manager-action ready-pulse" data-claim-milestone="${m.id}" style="font-size: 11px; padding: 6px 12px; background: #2ecc71; color: white;">🎁 Abholen</button>`
                  : `<button class="btn-manager-action" disabled style="font-size: 10px; padding: 6px 10px; background: #eaeded; color: #7f8c8d;">🔒 ${curPts}/${m.points}</button>`
              }
            </div>
          </div>
        `;
      });
      this.ui.eventMilestonesList.innerHTML = html;
    }
  }

  claimEventMilestone(milestoneId) {
    if (!this.state.eventProgress) return;
    const progress = this.state.eventProgress;
    if (progress.claimed?.[milestoneId]) return;

    const m = CURRENT_EVENT_DEF.milestones.find(item => item.id === milestoneId);
    if (!m) return;
    if ((progress.points || 0) < m.points) return;

    if (!progress.claimed) progress.claimed = {};
    progress.claimed[milestoneId] = true;

    // Grant reward
    if (m.type === 'gems') {
      this.addGems(m.amount);
      this.showFloatText(this.player.x, this.player.y - 18, `💎 +${m.amount} Gems!`, '#3498db');
    } else if (m.type === 'crate') {
      if (!this.state.crates[m.crateId]) this.state.crates[m.crateId] = { count: 0 };
      this.state.crates[m.crateId].count = (this.state.crates[m.crateId].count || 0) + 1;
      this.showFloatText(this.player.x, this.player.y - 18, `📦 +1 Goldene Kiste!`, '#f39c12');
    } else if (m.type === 'vault_boost') {
      this.addEmpireGold(m.gold);
      this.buyIncomeBoost(m.boostSeconds, 2.0, 0);
      this.showFloatText(this.player.x, this.player.y - 18, `🏛️ +$${m.gold} Gold & ⚡ Boost!`, '#ffd700');
    } else if (m.type === 'emperor_pack') {
      if (!this.state.crates[m.crateId]) this.state.crates[m.crateId] = { count: 0 };
      this.state.crates[m.crateId].count = (this.state.crates[m.crateId].count || 0) + 1;
      this.addGems(m.gems);
      this.showFloatText(this.player.x, this.player.y - 18, `👑 Kaiser-Kiste & +${m.gems} Gems!`, '#9b59b6');
    }

    window.soundFX?.playFanfare();
    this.updateHUD();
    this.updateBadges();
    this.renderEventsModal();
    this.saveState();
  }

  addCash(amount, isRaw = false) {
    const globalMult = 1.0 + (this.state.franchiseUpgrades?.globalIncomeLevel || 0) * 0.15;
    let finalAmount = isRaw ? amount : Math.round(amount * globalMult);
    if (!isRaw && this.state.boostTimer > 0 && this.state.boostMultiplier > 1.0) {
      finalAmount = Math.round(finalAmount * this.state.boostMultiplier);
    }
    this.state.cash += finalAmount;
    if (!this.state.stats) this.state.stats = {};
    this.state.stats.totalCashEarned = (this.state.stats.totalCashEarned || 0) + finalAmount;
    this.updateHUD();
    this.updateBadges();
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

  buyTimeSkip(seconds, costGems, label = 'Time Warp') {
    if ((this.state.gems || 0) < costGems) {
      this.showFloatText(this.player.x, this.player.y - 15, '💎 Not enough Gems!', '#e74c3c');
      window.soundFX?.playThud();
      return;
    }
    this.state.gems -= costGems;

    const activeRate = Math.max(3.0, this.getCurrentCampActiveRate());
    const empireRate = this.getTotalOtherCampsIdleRate();
    const effMult = (this.state.boostTimer > 0 && this.state.boostMultiplier > 1.0) ? this.state.boostMultiplier : 1.0;
    const globalMult = 1.0 + (this.state.franchiseUpgrades?.globalIncomeLevel || 0) * 0.15;

    const activePayout = Math.round(activeRate * effMult * globalMult * seconds);
    const empirePayout = Math.round(empireRate * effMult * globalMult * seconds);

    this.addCash(activePayout, true);
    if (empirePayout > 0) {
      this.addEmpireGold(empirePayout);
    }
    window.soundFX?.playFanfare();

    const vaultMsg = empirePayout > 0 ? ` & +$${empirePayout.toLocaleString()} 🏛️` : '';
    this.showFloatText(this.player.x, this.player.y - 20, `⏱️ ${label}: +$${activePayout.toLocaleString()} 💵${vaultMsg}!`, '#f1c40f');
    for (let p = 0; p < 8; p++) {
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 20,
        y: this.player.y - 10 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 25,
        vy: -20 - Math.random() * 20,
        size: 2.5,
        life: 0.8,
        color: '#f1c40f'
      });
    }
    this.updateHUD();
    this.renderDrawerContent();
    this.saveState();
  }

  buyIncomeBoost(durationSeconds, multiplier, costGems) {
    if ((this.state.gems || 0) < costGems) {
      this.showFloatText(this.player.x, this.player.y - 15, '💎 Not enough Gems!', '#e74c3c');
      window.soundFX?.playThud();
      return;
    }
    this.state.gems -= costGems;

    this.state.boostTimer = (this.state.boostTimer || 0) + durationSeconds;
    this.state.boostMultiplier = Math.max(this.state.boostMultiplier || 1.0, multiplier);

    window.soundFX?.playFanfare();
    this.showFloatText(this.player.x, this.player.y - 20, `⚡ ${multiplier}x Boost Active!`, '#9b59b6');
    for (let p = 0; p < 8; p++) {
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 20,
        y: this.player.y - 10 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 25,
        vy: -20 - Math.random() * 20,
        size: 2.5,
        color: '#9b59b6',
        life: 0.8
      });
    }

    this.updateHUD();
    this.renderDrawerContent();
    this.saveState();
  }

  buyIAPGems(gemAmount, priceStr, tierName = 'Gem Pack') {
    this.addGems(gemAmount);
    window.soundFX?.playFanfare();
    this.showFloatText(this.player.x, this.player.y - 20, `💎 +${gemAmount.toLocaleString()} Gems (${priceStr})!`, '#2980b9');
    for (let p = 0; p < 12; p++) {
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 24,
        y: this.player.y - 10 + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 30,
        vy: -25 - Math.random() * 25,
        size: 3,
        color: '#3498db',
        life: 1.0
      });
    }

    this.updateHUD();
    this.renderDrawerContent();
    this.saveState();
  }

  hireOrUpgradeWorker(id) {
    if (id === 'ranger_speed' || id === 'ranger_cap') {
      this.buyRangerUpgrade(id);
    } else {
      this.activateOrUpgradeManager(id);
    }
  }

  buyFranchiseUpgrade(id) {
    if (!this.state.franchiseUpgrades) {
      this.state.franchiseUpgrades = {
        speedLevel: this.state.upgrades?.speedLevel || 1,
        capacityLevel: this.state.upgrades?.capacityLevel || 1,
        investSpeedLevel: 1,
        globalIncomeLevel: 0,
        seedCapitalLevel: 0,
        staffSpeedLevel: 0
      };
    }
    const upg = this.state.franchiseUpgrades;

    if (id === 'ranger_speed') {
      const curLvl = upg.speedLevel || 1;
      if (curLvl >= 10) return;
      const cost = Math.round(40 * Math.pow(1.65, curLvl - 1));
      if (!this.spendEmpireGold(cost)) {
        this.showFloatText(this.player.x, this.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.speedLevel++;
      this.state.upgrades.speedLevel = upg.speedLevel;
      this.state.rangerSpeed = 92 + (upg.speedLevel - 1) * 16;
      window.soundFX?.playBuild();
      this.showFloatText(this.player.x, this.player.y - 12, `👟 Speed Up! (${this.state.rangerSpeed}px/s)`, '#2ecc71');
      this.updateHUD();
      this.renderDrawerContent();
      this.saveState();
      return;
    }

    if (id === 'ranger_cap') {
      const curLvl = upg.capacityLevel || 1;
      if (curLvl >= 10) return;
      const cost = Math.round(50 * Math.pow(1.70, curLvl - 1));
      if (!this.spendEmpireGold(cost)) {
        this.showFloatText(this.player.x, this.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.capacityLevel++;
      this.state.upgrades.capacityLevel = upg.capacityLevel;
      this.state.rangerCapacity = 4 + (upg.capacityLevel - 1) * 2;
      window.soundFX?.playBuild();
      this.showFloatText(this.player.x, this.player.y - 12, `🎒 +2 Backpack Cargo! (${this.state.rangerCapacity})`, '#2ecc71');
      this.updateHUD();
      this.renderDrawerContent();
      this.saveState();
      return;
    }

    if (id === 'invest_speed') {
      const curLvl = upg.investSpeedLevel || 1;
      if (curLvl >= 10) return;
      const cost = Math.round(45 * Math.pow(1.65, curLvl - 1));
      if (!this.spendEmpireGold(cost)) {
        this.showFloatText(this.player.x, this.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.investSpeedLevel = curLvl + 1;
      window.soundFX?.playBuild();
      this.showFloatText(this.player.x, this.player.y - 12, `💸 Spend Speed Up! (Lvl ${upg.investSpeedLevel})`, '#2ecc71');
      this.updateHUD();
      this.renderDrawerContent();
      this.saveState();
      return;
    }

    if (id === 'global_income') {
      const curLvl = upg.globalIncomeLevel || 0;
      if (curLvl >= 10) return;
      const cost = Math.round(80 * Math.pow(1.85, curLvl));
      if (!this.spendEmpireGold(cost)) {
        this.showFloatText(this.player.x, this.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.globalIncomeLevel = curLvl + 1;
      window.soundFX?.playBuild();
      this.showFloatText(this.player.x, this.player.y - 12, `📈 +15% Global Revenue! (+${upg.globalIncomeLevel * 15}%)`, '#f1c40f');
      this.updateHUD();
      this.renderDrawerContent();
      this.saveState();
      return;
    }

    if (id === 'seed_capital') {
      const curLvl = upg.seedCapitalLevel || 0;
      if (curLvl >= 10) return;
      const cost = Math.round(60 * Math.pow(1.75, curLvl));
      if (!this.spendEmpireGold(cost)) {
        this.showFloatText(this.player.x, this.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.seedCapitalLevel = curLvl + 1;
      window.soundFX?.playBuild();
      this.showFloatText(this.player.x, this.player.y - 12, `🪙 Seed Capital +$100! (+$${upg.seedCapitalLevel * 100})`, '#f1c40f');
      this.updateHUD();
      this.renderDrawerContent();
      this.saveState();
      return;
    }

    if (id === 'staff_speed') {
      const curLvl = upg.staffSpeedLevel || 0;
      if (curLvl >= 10) return;
      const cost = Math.round(55 * Math.pow(1.75, curLvl));
      if (!this.spendEmpireGold(cost)) {
        this.showFloatText(this.player.x, this.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.staffSpeedLevel = curLvl + 1;
      window.soundFX?.playBuild();
      this.showFloatText(this.player.x, this.player.y - 12, `🧹 Cleaners Speed +15%! (+${upg.staffSpeedLevel * 15}%)`, '#2ecc71');
      this.updateHUD();
      this.renderDrawerContent();
      this.saveState();
      return;
    }
  }

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

  spawnWorkerEntity(id) {
    const def = MANAGER_DEFS[id];
    if (!def) return;
    if (this.workers[id]) return;
    if (id === 'bella' && !this.hasKiosk) return;
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

  generateCrateLoot(crateId) {
    const def = CRATE_DEFS[crateId] || CRATE_DEFS.free;
    const totalCards = Math.floor(Math.random() * (def.maxCards - def.minCards + 1)) + def.minCards;
    const cashBonus = Math.floor(Math.random() * (def.maxCash - def.minCash + 1)) + def.minCash;

    const commonPool = ['alex', 'oliver', 'bella'];
    const rarePool = ['sam', 'chloe', 'finn'];
    const epicPool = ['felix', 'robin'];

    const chosenCards = {};
    let cardsLeft = totalCards;

    if (def.guaranteedEpic) {
      const epicCount = (crateId === 'emperor') ? 6 : (crateId === 'mythic') ? 2 : 1;
      for (let e = 0; e < epicCount; e++) {
        if (cardsLeft <= 0) break;
        const epicId = epicPool[Math.floor(Math.random() * epicPool.length)];
        const count = Math.min(cardsLeft, (crateId === 'emperor') ? 2 : 1);
        chosenCards[epicId] = (chosenCards[epicId] || 0) + count;
        cardsLeft -= count;
      }
    }

    if (def.guaranteedRare && cardsLeft > 0) {
      const rareCount = (crateId === 'emperor') ? 10 : (crateId === 'mythic') ? 4 : 1;
      for (let r = 0; r < rareCount; r++) {
        if (cardsLeft <= 0) break;
        const rareId = rarePool[Math.floor(Math.random() * rarePool.length)];
        const count = Math.min(cardsLeft, (crateId === 'emperor') ? 2 : 1);
        chosenCards[rareId] = (chosenCards[rareId] || 0) + count;
        cardsLeft -= count;
      }
    }

    while (cardsLeft > 0) {
      const rand = Math.random();
      let pool = commonPool;
      if (rand < 0.15) pool = epicPool;
      else if (rand < 0.45) pool = rarePool;

      const id = pool[Math.floor(Math.random() * pool.length)];
      chosenCards[id] = (chosenCards[id] || 0) + 1;
      cardsLeft--;
    }

    return {
      crateName: def.name,
      cards: chosenCards,
      cash: cashBonus
    };
  }

  openCrate(crateId) {
    const def = CRATE_DEFS[crateId];
    if (!def) return;

    if (def.currency === 'gems') {
      if ((this.state.gems || 0) < def.cost) {
        this.showFloatText(this.player.x, this.player.y - 15, '💎 Not enough Gems!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      this.state.gems -= def.cost;
    } else if (crateId === 'free') {
      if (this.state.crates.freeTimer > 0) return;
      this.state.crates.freeTimer = def.cooldown;
    } else {
      if (this.state.cash < def.cost) {
        this.showFloatText(this.player.x, this.player.y - 15, '💵 Not enough Cash!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      this.state.cash -= def.cost;
    }

    this.pendingLoot = this.generateCrateLoot(crateId);

    // Setup unboxing modal
    if (this.ui.crateModal) {
      this.ui.crateModalTitle.textContent = `${def.icon || '🎁'} ${def.name.toUpperCase()}`;
      if (this.ui.crateEmojiBounce) this.ui.crateEmojiBounce.textContent = def.icon || '📦';
      this.ui.crateBoxStage.style.display = 'flex';
      this.ui.crateInstruction.textContent = 'TAP CRATE TO UNBOX!';
      this.ui.crateRewardsContainer.style.display = 'none';
      this.ui.btnCollectLoot.style.display = 'none';
      this.ui.crateModal.style.display = 'flex';
    }

    this.updateHUD();
    this.renderDrawerContent();
    this.updateBadges();
    this.saveState();
  }

  revealCrateLoot() {
    if (!this.pendingLoot) return;
    window.soundFX?.playChestOpen();

    this.ui.crateBoxStage.style.display = 'none';
    this.ui.crateRewardsContainer.style.display = 'flex';
    this.ui.btnCollectLoot.style.display = 'block';

    // Build revealed card tiles
    let html = '';
    const cardEntries = Object.entries(this.pendingLoot.cards);
    cardEntries.forEach(([id, count]) => {
      const mDef = MANAGER_DEFS[id];
      if (!mDef) return;
      const curCards = this.state.managers[id]?.cards || 0;
      const curLvl = this.state.managers[id]?.level || 0;
      const reqCards = curLvl === 0 ? mDef.unlockCards : (mDef.levels[curLvl]?.cardsReq || 0);

      html += `
        <div class="revealed-card ${mDef.rarity}">
          <div class="revealed-icon">${mDef.icon}</div>
          <div class="revealed-name">${mDef.name}</div>
          <div class="rarity-pill ${mDef.rarity}">${mDef.rarity}</div>
          <div class="revealed-count">+${count} Cards</div>
          <div class="revealed-meter">Has: ${curCards + count}${reqCards > 0 ? ` / ${reqCards}` : ''}</div>
        </div>
      `;
    });

    this.ui.rewardsCardsRow.innerHTML = html;
    this.ui.rewardCashBanner.textContent = `💵 +$${this.pendingLoot.cash} Bonus Cash!`;

    window.soundFX?.playCardFlip();
    setTimeout(() => {
      window.soundFX?.playFanfare();
    }, 220);
  }

  collectPendingLoot() {
    if (!this.pendingLoot) {
      if (this.ui.crateModal) this.ui.crateModal.style.display = 'none';
      return;
    }

    // Apply cards
    Object.entries(this.pendingLoot.cards).forEach(([id, count]) => {
      if (this.state.managers[id]) {
        this.state.managers[id].cards = (this.state.managers[id].cards || 0) + count;
      }
    });

    // Apply cash
    this.addCash(this.pendingLoot.cash);
    window.soundFX?.playCoin();

    this.pendingLoot = null;
    if (this.ui.crateModal) this.ui.crateModal.style.display = 'none';

    this.updateHUD();
    this.renderDrawerContent();
    this.updateBadges();
    this.saveState();
  }

  getActiveAchievementDefs() {
    const w = this.state.world || 1;
    const r = this.state.region || 1;
    const c = this.state.camp || 1;
    return getCampAchievementDefs(w, r, c);
  }

  checkCampgroundCompletion() {
    const achDefs = this.getActiveAchievementDefs();
    const allClaimed = achDefs.every(a => this.state.achievements[a.id]?.claimed);

    if (allClaimed) {
      if (this.ui.campCompleteBanner) {
        this.ui.campCompleteBanner.style.display = 'flex';
      }
      if (this.ui.btnOpenWorld) {
        this.ui.btnOpenWorld.classList.add('unlock-ready');
      }
      this.showFloatText(this.player.x, this.player.y - 24, '🚀 ALL GOALS COMPLETE! NEXT RESORT UNLOCKED!', '#f1c40f');
    } else {
      if (this.ui.campCompleteBanner) {
        this.ui.campCompleteBanner.style.display = 'none';
      }
      if (this.ui.btnOpenWorld) {
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
    } else {
      // Fresh new campsite: starts with base funds + franchise seed capital!
      const seedBonus = (this.state.franchiseUpgrades?.seedCapitalLevel || 0) * 100;
      this.state.cash = 60 + seedBonus;
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
    this.camX = Math.max(0, Math.min(this.worldW - this.vWidth, this.player.x - this.vWidth / 2));
    this.camY = Math.max(0, Math.min(this.worldH - this.vHeight, this.player.y - this.vHeight / 2));

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

  openWorldModal() {
    if (!this.ui.worldModal) return;
    const world = this.state.world || 1;
    const region = this.state.region || 1;
    const camp = this.state.camp || 1;
    const maxWorld = this.state.maxUnlockedWorld || 1;
    const maxRegion = this.state.maxUnlockedRegion || 1;
    const maxCamp = this.state.maxUnlockedCamp || 1;
    const biome = this.currentBiome || WORLD_BIOMES[0];
    const achDefs = this.getActiveAchievementDefs();
    const claimedCount = achDefs.filter(a => this.state.achievements[a.id]?.claimed).length;
    const allDone = claimedCount >= achDefs.length;

    // Total empire passive income from other camps
    const empireIdleRate = this.getTotalOtherCampsIdleRate();

    // Is the player currently visiting an older campsite?
    const isVisitingOlderCamp = (world < maxWorld) || (world === maxWorld && region < maxRegion) || (world === maxWorld && region === maxRegion && camp < maxCamp);

    if (this.ui.worldModalTitle) {
      this.ui.worldModalTitle.textContent = `🌍 WORLD ${world} • REGION ${region}`;
    }

    if (this.ui.worldModalInfo) {
      this.ui.worldModalInfo.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #1b4329;">
          <span>🌍 World ${world} / 100</span>
          <span>📍 Region ${region} / 100</span>
        </div>
        <div style="font-size: 11px; color: #2980b9;">
          Biome: <strong>${biome.name}</strong> (${biome.theme})
        </div>
        <div style="font-size: 11px; color: #444;">
          Campsite Level: <strong>Camp #${camp} / 10</strong>
          ${isVisitingOlderCamp ? ' <span style="color: #e67e22; font-weight: bold;">(Visiting Older Resort)</span>' : ''}
        </div>
        <div style="font-size: 11px; color: ${allDone ? '#27ae60' : '#8e44ad'}; font-weight: bold;">
          Achievements: ${claimedCount} / ${achDefs.length} Claimed ${allDone ? '✓ (COMPLETED!)' : ''}
        </div>
        <div style="font-size: 11px; color: #b7950b; font-weight: bold; margin-top: 2px;">
          ⚡ Empire Idle Revenue: +$${empireIdleRate.toFixed(1)}/sec
        </div>
      `;
    }

    if (this.ui.regionCampsGrid) {
      let gridHtml = '';
      for (let c = 1; c <= 10; c++) {
        const isUnlocked = (world < maxWorld) ||
                           (world === maxWorld && region < maxRegion) ||
                           (world === maxWorld && region === maxRegion && c <= maxCamp);
        const isCur = (c === camp);
        const isCleared = c < maxCamp || (this.state.camps?.[getCampKey(world, region, c)]?.idleRate > 0);
        gridHtml += `
          <div class="camp-node ${isCleared ? 'cleared' : ''} ${isCur ? 'current' : ''}">
            <span>${isCur ? '🏕️' : isCleared ? '✅' : isUnlocked ? '🔓' : '🔒'}</span>
            <span>Camp ${c}</span>
          </div>
        `;
      }
      this.ui.regionCampsGrid.innerHTML = gridHtml;
    }

    if (this.ui.regionCampsList) {
      let listHtml = '';
      for (let c = 1; c <= 10; c++) {
        const isUnlocked = (world < maxWorld) ||
                           (world === maxWorld && region < maxRegion) ||
                           (world === maxWorld && region === maxRegion && c <= maxCamp);
        const isCur = (c === camp);
        const cKey = getCampKey(world, region, c);
        const cData = this.state.camps?.[cKey];
        const isCleared = c < maxCamp || (cData && cData.idleRate > 0);

        const mgrCount = isCur
          ? Object.values(this.state.managers || {}).filter(m => m.level > 0).length
          : (cData ? Object.values(cData.managers || {}).filter(m => m.level > 0).length : 0);

        const idleVal = isCur ? 0 : (cData?.idleRate || 0);

        listHtml += `
          <div class="camp-item-card ${isCur ? 'active-resort' : ''}">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <div style="font-weight: bold; font-size: 12px; color: #1b4329;">
                ${isCur ? '🏕️' : isCleared ? '✅' : isUnlocked ? '🔓' : '🔒'} Camp #${c}
                ${isCur ? '<span style="color: #27ae60; font-size: 10px; margin-left: 4px;">(ACTIVE)</span>' : ''}
              </div>
              <div style="font-size: 10px; color: #666;">
                ${mgrCount > 0 ? `👔 ${mgrCount} Managers` : 'No managers yet'} • ${idleVal > 0 ? `<strong style="color: #b7950b;">+$${idleVal}/s Idle</strong>` : isCur ? 'Active Level' : 'Unexplored'}
              </div>
            </div>
            <div>
              ${isCur ? `
                <button class="btn-camp-visit current" disabled>Current</button>
              ` : isUnlocked ? `
                <button class="btn-camp-visit" data-visit-camp="${c}" data-visit-region="${region}" data-visit-world="${world}">
                  Visit ✈️
                </button>
              ` : `
                <span style="font-size: 10px; color: #999;">Locked 🔒</span>
              `}
            </div>
          </div>
        `;
      }
      this.ui.regionCampsList.innerHTML = listHtml;
    }

    // Button to return to highest unlocked camp if visiting an older one
    if (this.ui.btnReturnHighestCamp) {
      if (isVisitingOlderCamp) {
        this.ui.btnReturnHighestCamp.style.display = 'block';
        this.ui.btnReturnHighestCamp.textContent = `🏕️ RETURN TO FRONTIER RESORT (Camp #${maxCamp})`;
      } else {
        this.ui.btnReturnHighestCamp.style.display = 'none';
      }
    }

    if (this.ui.btnAdvanceCamp) {
      this.ui.btnAdvanceCamp.style.display = (allDone && !isVisitingOlderCamp) ? 'block' : 'none';
    }

    this.ui.worldModal.style.display = 'flex';
  }

  claimAchievement(achId) {
    const achDefs = this.getActiveAchievementDefs();
    const ach = achDefs.find(a => a.id === achId);
    if (!ach) return;

    if (!this.state.achievements[achId]) {
      this.state.achievements[achId] = { claimed: false };
    }
    if (this.state.achievements[achId].claimed) return;

    const current = ach.getStat(this.state);
    if (current < ach.goal) return;

    this.state.achievements[achId].claimed = true;

    // Grant rewards
    if (ach.reward.cards) {
      Object.entries(ach.reward.cards).forEach(([id, count]) => {
        if (this.state.managers[id]) {
          this.state.managers[id].cards = (this.state.managers[id].cards || 0) + count;
        }
      });
    }
    if (ach.reward.cash) {
      this.addCash(ach.reward.cash);
    }
    if (ach.reward.gems) {
      this.addGems(ach.reward.gems);
    }

    window.soundFX?.playFanfare();
    const gemText = ach.reward.gems ? ` (+${ach.reward.gems} 💎)` : '';
    this.showFloatText(this.player.x, this.player.y - 14, `🏆 ${ach.title} Claimed!${gemText}`, '#f1c40f');

    // Check if ALL achievements of current campsite are completed
    this.checkCampgroundCompletion();

    this.updateHUD();
    this.renderDrawerContent();
    this.updateBadges();
    this.saveState();
  }

  renderDrawerContent(resetScroll = false) {
    if (!this.ui.drawerContentList) return;
    const prevScroll = resetScroll ? 0 : (this.ui.drawerContentList.scrollTop || 0);

    if (this.activeMainTab === 'managers') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'flex';
      let html = '';

      const list = Object.values(MANAGER_DEFS).filter(def => {
        if (this.activeManagerFilter === 'all') return true;
        return def.category === this.activeManagerFilter;
      });

      list.forEach(def => {
        const stateObj = this.state.managers[def.id] || { level: 0, cards: 0 };
        const curLvl = stateObj.level;
        const curCards = stateObj.cards || 0;
        const isMax = curLvl >= def.maxLevel;

        let reqCards = 0;
        let cost = 0;
        let currentPerk = 'Status: Inactive (Locked)';
        let nextPerk = 'Max level reached';

        if (curLvl > 0) {
          currentPerk = `Active: ${def.levels[curLvl - 1].desc}`;
        }

        if (!isMax) {
          if (curLvl === 0) {
            reqCards = def.unlockCards;
            cost = def.levels[0].cost;
            nextPerk = `Unlock: ${def.levels[0].desc}`;
          } else {
            const nextLvlConfig = def.levels[curLvl];
            reqCards = nextLvlConfig.cardsReq;
            cost = nextLvlConfig.cost;
            nextPerk = `Next: ${nextLvlConfig.desc}`;
          }
        }

        // Card progress bar
        let cardMeterHtml = '';
        if (isMax) {
          cardMeterHtml = `
            <div class="card-meter-bar">
              <div class="card-meter-fill ready" style="width: 100%;"></div>
              <div class="card-meter-text">⭐ FULL POWER</div>
            </div>
          `;
        } else {
          const pct = reqCards > 0 ? Math.min(100, Math.round((curCards / reqCards) * 100)) : 0;
          const isReady = reqCards > 0 && curCards >= reqCards;
          cardMeterHtml = `
            <div class="card-meter-bar">
              <div class="card-meter-fill ${isReady ? 'ready' : ''}" style="width: ${pct}%;"></div>
              <div class="card-meter-text">${curCards} / ${reqCards} Cards</div>
            </div>
          `;
        }

        // Check prerequisite
        const prereq = MANAGER_PREREQS[def.id];
        const prereqMet = !prereq || prereq.isMet(this);

        // Action button
        let actionBtnHtml = '';
        if (isMax) {
          actionBtnHtml = `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`;
        } else if (curLvl === 0) {
          if (!prereqMet) {
            actionBtnHtml = `<button class="btn-manager-action locked" disabled>🔒 Locked</button>`;
          } else {
            const hasCards = curCards >= reqCards;
            const hasCash = this.state.cash >= cost;
            if (hasCards && hasCash) {
              actionBtnHtml = `<button class="btn-manager-action activate ready-pulse" data-action="manager" data-id="${def.id}">Activate ($${cost})</button>`;
            } else if (!hasCards) {
              actionBtnHtml = `<button class="btn-manager-action need-cards" disabled>${curCards}/${reqCards} Cards</button>`;
            } else {
              actionBtnHtml = `<button class="btn-manager-action activate" disabled>Activate ($${cost})</button>`;
            }
          }
        } else {
          const hasCards = curCards >= reqCards;
          const hasCash = this.state.cash >= cost;
          if (hasCards && hasCash) {
            actionBtnHtml = `<button class="btn-manager-action ready-pulse" data-action="manager" data-id="${def.id}">Lvl ${curLvl + 1} ($${cost})</button>`;
          } else if (!hasCards) {
            actionBtnHtml = `<button class="btn-manager-action need-cards" disabled>${curCards}/${reqCards} Cards</button>`;
          } else {
            actionBtnHtml = `<button class="btn-manager-action" disabled>Lvl ${curLvl + 1} ($${cost})</button>`;
          }
        }

        // Level badge
        let lvlBadgeHtml = '';
        if (curLvl === 0) {
          lvlBadgeHtml = `<span class="lvl-badge locked">${prereqMet ? 'Locked' : '🔒 Locked'}</span>`;
        } else if (isMax) {
          lvlBadgeHtml = `<span class="lvl-badge max">⭐ MAX</span>`;
        } else {
          lvlBadgeHtml = `<span class="lvl-badge active">Lvl ${curLvl}/${def.maxLevel}</span>`;
        }

        let prereqNotice = '';
        if (curLvl === 0 && !prereqMet && prereq) {
          prereqNotice = `<div class="manager-lock-req">🔒 Prerequisite: ${prereq.label}</div>`;
        }

        html += `
          <div class="manager-card rarity-${def.rarity}">
            <div class="manager-top-row">
              <div class="manager-identity">
                <div class="manager-avatar">${def.icon}</div>
                <div class="manager-name-col">
                  <div class="manager-title">${def.name}</div>
                  <div class="manager-role">${def.roleName}</div>
                </div>
              </div>
              <div style="display: flex; gap: 4px; align-items: center;">
                <span class="rarity-pill ${def.rarity}">${def.rarity}</span>
                ${lvlBadgeHtml}
              </div>
            </div>

            ${cardMeterHtml}

            <div class="manager-perks-row">${currentPerk}</div>
            <div class="manager-next-perk">${nextPerk}</div>
            ${prereqNotice}

            <div class="manager-action-row">
              <span style="font-size: 10px; color: #7f8c8d;">${def.desc}</span>
              ${actionBtnHtml}
            </div>
          </div>
        `;
      });

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'crates') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      const freeReady = this.state.crates.freeTimer <= 0;
      const freeTimerSec = Math.ceil(this.state.crates.freeTimer);

      let html = `
        <div style="font-size: 12px; color: #1b4329; font-weight: bold; margin-bottom: 4px;">
          📦 SUPPLY CRATES & LOOT BOXES
        </div>
        <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
          Open supply crates to unbox Manager Cards and cash drops!
        </div>

        <!-- Free Crate -->
        <div class="crate-card">
          <div class="crate-icon-box">🎁</div>
          <div class="crate-details">
            <div class="crate-name">Free Supply Crate</div>
            <div class="crate-desc">${CRATE_DEFS.free.desc}</div>
            ${freeReady
              ? `<div class="crate-timer-badge" style="color: #27ae60;">✨ READY TO UNBOX!</div>`
              : `<div class="crate-timer-badge">⏱️ Free in ${freeTimerSec}s</div>`
            }
          </div>
          ${freeReady
            ? `<button class="btn-crate-buy free-claim" data-action="crate" data-id="free">CLAIM FREE! 🎁</button>`
            : `<button class="btn-crate-buy" disabled>⏱️ ${freeTimerSec}s</button>`
          }
        </div>

        <!-- Wooden Crate -->
        <div class="crate-card">
          <div class="crate-icon-box">📦</div>
          <div class="crate-details">
            <div class="crate-name">Wooden Supply Crate</div>
            <div class="crate-desc">${CRATE_DEFS.wooden.desc}</div>
            <div style="font-size: 11px; font-weight: bold; color: #27ae60;">Cost: $80</div>
          </div>
          <button class="btn-crate-buy" ${this.state.cash >= 80 ? '' : 'disabled'} data-action="crate" data-id="wooden">
            Open ($80)
          </button>
        </div>

        <!-- Golden Crate -->
        <div class="crate-card">
          <div class="crate-icon-box">👑</div>
          <div class="crate-details">
            <div class="crate-name">Golden Resort Crate</div>
            <div class="crate-desc">${CRATE_DEFS.golden.desc}</div>
            <div style="font-size: 11px; font-weight: bold; color: #f39c12;">Cost: $220 • Guaranteed Epic!</div>
          </div>
          <button class="btn-crate-buy" ${this.state.cash >= 220 ? '' : 'disabled'} data-action="crate" data-id="golden" style="background: #f39c12;">
            Open ($220)
          </button>
        </div>

        <!-- Mythic Crate -->
        <div class="crate-card" style="border-left: 6px solid #2980b9;">
          <div class="crate-icon-box">🔮</div>
          <div class="crate-details">
            <div class="crate-name">Mythic Supply Crate</div>
            <div class="crate-desc">${CRATE_DEFS.mythic.desc}</div>
            <div style="font-size: 11px; font-weight: bold; color: #2980b9;">Cost: 100 💎 Gems • 2+ Epics!</div>
          </div>
          <button class="btn-crate-buy" ${(this.state.gems || 0) >= 100 ? '' : 'disabled'} data-action="crate" data-id="mythic" style="background: linear-gradient(135deg, #3498db, #2980b9);">
            Open (100 💎)
          </button>
        </div>

        <!-- Emperor Vault -->
        <div class="crate-card" style="border-left: 6px solid #f39c12;">
          <div class="crate-icon-box">👑</div>
          <div class="crate-details">
            <div class="crate-name">Emperor Vault</div>
            <div class="crate-desc">${CRATE_DEFS.emperor.desc}</div>
            <div style="font-size: 11px; font-weight: bold; color: #d4ac0d;">Cost: 250 💎 Gems • 6+ Epics Jackpot!</div>
          </div>
          <button class="btn-crate-buy" ${(this.state.gems || 0) >= 250 ? '' : 'disabled'} data-action="crate" data-id="emperor" style="background: linear-gradient(135deg, #f1c40f, #d4ac0d); color: #142819;">
            Open (250 💎)
          </button>
        </div>
      `;

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'shop') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      const curGems = this.state.gems || 0;
      const boostActive = (this.state.boostTimer || 0) > 0;
      const boostSec = Math.ceil(this.state.boostTimer || 0);
      const bHrs = Math.floor(boostSec / 3600);
      const bMins = Math.floor((boostSec % 3600) / 60);
      const bSecs = boostSec % 60;
      const boostTimeStr = `${bHrs > 0 ? bHrs + 'h ' : ''}${bMins}m ${bSecs < 10 ? '0' : ''}${bSecs}s`;

      const activeRate = Math.max(3.0, this.getCurrentCampActiveRate());
      const empireRate = this.getTotalOtherCampsIdleRate();
      const effMult = boostActive ? (this.state.boostMultiplier || 2.0) : 1.0;
      const totalSecRate = (activeRate + empireRate) * effMult;

      const warp1hVal = Math.round(totalSecRate * 3600);
      const warp4hVal = Math.round(totalSecRate * 14400);
      const warp24hVal = Math.round(totalSecRate * 86400);

      let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div>
            <div style="font-size: 13px; color: #1b4f72; font-weight: bold;">
              💎 GEM VAULT & RESORT STORE
            </div>
            <div style="font-size: 11px; color: #666;">
              Acquire Gems via Achievements & Store to unlock game-changing Power-Ups!
            </div>
          </div>
          <div class="hud-pill gems" style="font-size: 14px; padding: 4px 8px;">
            💎 <strong>${curGems.toLocaleString()}</strong>
          </div>
        </div>

        <!-- SECTION 1: POWER-UPS & TIME WARPS -->
        <div class="shop-section-title">
          <span>⚡</span> POWER-UPS & TIME WARPS
        </div>

        <!-- 1h Time Warp -->
        <div class="shop-item-card warp">
          <div class="shop-item-info">
            <div class="shop-item-icon">⏱️</div>
            <div class="shop-item-text">
              <div class="shop-item-name">1-Hour Time Warp</div>
              <div class="shop-item-desc">Instantly warp forward 1 hour of active + empire campsite revenue!</div>
              <div class="shop-item-tag">Payout: +$${warp1hVal.toLocaleString()} Cash</div>
            </div>
          </div>
          <button class="btn-shop-buy warp" ${curGems >= 30 ? '' : 'disabled'} data-action="buy_timeskip" data-seconds="3600" data-cost="30" data-label="1h Warp">
            💎 30
          </button>
        </div>

        <!-- 4h Time Warp -->
        <div class="shop-item-card warp">
          <div class="shop-item-info">
            <div class="shop-item-icon">⏳</div>
            <div class="shop-item-text">
              <div class="shop-item-name">4-Hour Time Warp</div>
              <div class="shop-item-desc">Warps 4 hours of total production into your vault right now!</div>
              <div class="shop-item-tag">Payout: +$${warp4hVal.toLocaleString()} Cash</div>
            </div>
          </div>
          <button class="btn-shop-buy warp" ${curGems >= 80 ? '' : 'disabled'} data-action="buy_timeskip" data-seconds="14400" data-cost="80" data-label="4h Warp">
            💎 80
          </button>
        </div>

        <!-- 24h Mega Warp -->
        <div class="shop-item-card warp">
          <div class="shop-item-info">
            <div class="shop-item-icon">🌌</div>
            <div class="shop-item-text">
              <div class="shop-item-name">24-Hour Mega Warp</div>
              <div class="shop-item-desc">One full day of automated multi-campsite revenue in a single flash!</div>
              <div class="shop-item-tag">Payout: +$${warp24hVal.toLocaleString()} Cash</div>
            </div>
          </div>
          <button class="btn-shop-buy warp" ${curGems >= 250 ? '' : 'disabled'} data-action="buy_timeskip" data-seconds="86400" data-cost="250" data-label="24h Mega Warp">
            💎 250
          </button>
        </div>

        <!-- 2x Income Boost (2 Hours) -->
        <div class="shop-item-card boost">
          <div class="shop-item-info">
            <div class="shop-item-icon">⚡</div>
            <div class="shop-item-text">
              <div class="shop-item-name">2x Revenue Boost (2 Hours)</div>
              <div class="shop-item-desc">Doubles all checkouts, trash tips, kiosk sales & empire income!</div>
              <div class="shop-item-tag">${boostActive ? `Active: ${boostTimeStr} remaining` : '+100% Profit for 2 Hours'}</div>
            </div>
          </div>
          <button class="btn-shop-buy boost" ${curGems >= 50 ? '' : 'disabled'} data-action="buy_boost" data-duration="7200" data-multiplier="2.0" data-cost="50">
            💎 50
          </button>
        </div>

        <!-- 3x Super Boost (4 Hours) -->
        <div class="shop-item-card boost">
          <div class="shop-item-info">
            <div class="shop-item-icon">🚀</div>
            <div class="shop-item-text">
              <div class="shop-item-name">3x Super Boost (4 Hours)</div>
              <div class="shop-item-desc">Triples all campsite income and empire passive streams!</div>
              <div class="shop-item-tag">+200% Profit for 4 Hours</div>
            </div>
          </div>
          <button class="btn-shop-buy boost" ${curGems >= 120 ? '' : 'disabled'} data-action="buy_boost" data-duration="14400" data-multiplier="3.0" data-cost="120">
            💎 120
          </button>
        </div>

        <!-- SECTION 2: SPECIAL GEM CRATES -->
        <div class="shop-section-title">
          <span>🔮</span> SPECIAL GEM CRATES
        </div>

        <!-- Mythic Supply Crate -->
        <div class="shop-item-card crate-mythic">
          <div class="shop-item-info">
            <div class="shop-item-icon">🔮</div>
            <div class="shop-item-text">
              <div class="shop-item-name">${CRATE_DEFS.mythic.name}</div>
              <div class="shop-item-desc">${CRATE_DEFS.mythic.desc}</div>
              <div class="shop-item-tag" style="color: #2980b9;">Guaranteed 2+ Epics & 4+ Rares</div>
            </div>
          </div>
          <button class="btn-shop-buy warp" ${curGems >= 100 ? '' : 'disabled'} data-action="crate" data-id="mythic">
            💎 100
          </button>
        </div>

        <!-- Emperor Vault -->
        <div class="shop-item-card crate-emperor">
          <div class="shop-item-info">
            <div class="shop-item-icon">👑</div>
            <div class="shop-item-text">
              <div class="shop-item-name">${CRATE_DEFS.emperor.name}</div>
              <div class="shop-item-desc">${CRATE_DEFS.emperor.desc}</div>
              <div class="shop-item-tag" style="color: #d4ac0d;">Guaranteed 6+ Epics & 10+ Rares + Mega Jackpot</div>
            </div>
          </div>
          <button class="btn-shop-buy gold" ${curGems >= 250 ? '' : 'disabled'} data-action="crate" data-id="emperor">
            💎 250
          </button>
        </div>

        <!-- SECTION 3: IN-APP PURCHASES (GEM STORE) -->
        <div class="shop-section-title">
          <span>💎</span> GEM STORE (IN-APP PURCHASES)
        </div>

        <!-- Tier 1 -->
        <div class="shop-item-card iap">
          <div class="shop-item-info">
            <div class="shop-item-icon">💎</div>
            <div class="shop-item-text">
              <div class="shop-item-name">Pouch of Gems</div>
              <div class="shop-item-desc">A handy satchel of shiny gems for immediate power-ups.</div>
              <div class="shop-item-tag" style="color: #27ae60;">+80 Gems</div>
            </div>
          </div>
          <button class="btn-shop-buy iap" data-action="buy_iap" data-gems="80" data-price="$0.99" data-tier="Pouch of Gems">
            $0.99
          </button>
        </div>

        <!-- Tier 2 -->
        <div class="shop-item-card iap">
          <div class="shop-item-info">
            <div class="shop-item-icon">💰</div>
            <div class="shop-item-text">
              <div class="shop-item-name">Sack of Gems <span style="color: #e67e22; font-size: 10px;">(+10% BONUS)</span></div>
              <div class="shop-item-desc">Great value pack to supercharge multiple campsite upgrades.</div>
              <div class="shop-item-tag" style="color: #27ae60;">+500 Gems</div>
            </div>
          </div>
          <button class="btn-shop-buy iap" data-action="buy_iap" data-gems="500" data-price="$4.99" data-tier="Sack of Gems">
            $4.99
          </button>
        </div>

        <!-- Tier 3 -->
        <div class="shop-item-card iap">
          <div class="shop-item-info">
            <div class="shop-item-icon">💎</div>
            <div class="shop-item-text">
              <div class="shop-item-name">Chest of Gems <span style="color: #e67e22; font-size: 10px;">(+25% BONUS)</span></div>
              <div class="shop-item-desc">Popular resort tycoon choice! Unlock Emperor Vaults with ease.</div>
              <div class="shop-item-tag" style="color: #27ae60;">+1,400 Gems</div>
            </div>
          </div>
          <button class="btn-shop-buy iap" data-action="buy_iap" data-gems="1400" data-price="$9.99" data-tier="Chest of Gems">
            $9.99
          </button>
        </div>

        <!-- Tier 4 -->
        <div class="shop-item-card iap">
          <div class="shop-item-info">
            <div class="shop-item-icon">👑</div>
            <div class="shop-item-text">
              <div class="shop-item-name">Mountain Vault <span style="color: #e67e22; font-size: 10px;">(+50% BEST VALUE)</span></div>
              <div class="shop-item-desc">Ultimate treasury! Enough gems to rule all regions across the globe.</div>
              <div class="shop-item-tag" style="color: #27ae60;">+3,600 Gems</div>
            </div>
          </div>
          <button class="btn-shop-buy iap" data-action="buy_iap" data-gems="3600" data-price="$19.99" data-tier="Mountain Vault">
            $19.99
          </button>
        </div>
      `;

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'goals') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      const achDefs = this.getActiveAchievementDefs();
      const allDone = achDefs.every(a => this.state.achievements[a.id]?.claimed);
      const curSizeInfo = getCampSizeInfo(this.state.camp || 1);

      let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="font-size: 12px; color: #8e44ad; font-weight: bold;">
            🏆 CAMP ${this.state.camp || 1}: ${curSizeInfo.name}
          </div>
          <div style="font-size: 10px; color: #16a085; font-weight: bold;">
            WORLD ${this.state.world || 1} • REGION ${this.state.region || 1}
          </div>
        </div>
        <div style="font-size: 10px; color: #2c3e50; margin-bottom: 4px;">
          🏷️ <strong>${curSizeInfo.tier}</strong> • 📐 ${curSizeInfo.size} (${curSizeInfo.pitches} Pitches Max)
        </div>
        <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
          ${allDone ? '🎉 ALL ACHIEVEMENTS CLAIMED! Next campsite is unlocked!' : 'Claim all achievements to unlock the next bigger and more lucrative campsite!'}
        </div>
      `;

      if (allDone) {
        html += `
          <div style="background: #e8f8f5; border: 2px solid #27ae60; border-radius: 8px; padding: 10px; margin-bottom: 10px; text-align: center;">
            <div style="font-size: 13px; font-weight: bold; color: #1e8449; margin-bottom: 4px;">🌟 CAMPGROUND MASTERED!</div>
            <div style="font-size: 11px; color: #555; margin-bottom: 8px;">A new destination in this region is ready for your team.</div>
            <button class="btn-advance-camp" data-action="advance_camp">🚀 PACK UP & ADVANCE TO NEXT RESORT!</button>
          </div>
        `;
      }

      achDefs.forEach(ach => {
        const curStat = ach.getStat(this.state);
        const claimed = this.state.achievements[ach.id]?.claimed;
        const isDone = curStat >= ach.goal;
        const pct = Math.min(100, Math.round((curStat / ach.goal) * 100));

        let actionHtml = '';
        if (claimed) {
          actionHtml = `<span class="ach-status-label" style="color: #27ae60;">✓ Claimed</span>`;
        } else if (isDone) {
          actionHtml = `<button class="btn-claim-ach" data-action="goal" data-id="${ach.id}">CLAIM! 🎉</button>`;
        } else {
          actionHtml = `<span class="ach-status-label">${curStat} / ${ach.goal}</span>`;
        }

        html += `
          <div class="achievement-item ${claimed ? 'claimed' : ''}">
            <div class="ach-info">
              <div class="ach-header">
                <span>${ach.icon}</span>
                <span>${ach.title}</span>
              </div>
              <div class="ach-desc">${ach.desc}</div>
              <div class="ach-reward-tag">🎁 Reward: ${ach.rewardDesc}</div>
              <div class="ach-progress-bar">
                <div class="ach-progress-fill ${isDone ? 'done' : ''}" style="width: ${pct}%;"></div>
              </div>
            </div>
            ${actionHtml}
          </div>
        `;
      });

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'world') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      const world = this.state.world || 1;
      const region = this.state.region || 1;
      const camp = this.state.camp || 1;
      const maxWorld = this.state.maxUnlockedWorld || 1;
      const maxRegion = this.state.maxUnlockedRegion || 1;
      const maxCamp = this.state.maxUnlockedCamp || 1;
      const biome = this.currentBiome || WORLD_BIOMES[0];
      const achDefs = this.getActiveAchievementDefs();
      const claimedCount = achDefs.filter(a => this.state.achievements[a.id]?.claimed).length;
      const canAdvance = claimedCount >= achDefs.length;
      const empireIdleRate = this.getTotalOtherCampsIdleRate();
      const isVisitingOlderCamp = (world < maxWorld) || (world === maxWorld && region < maxRegion) || (world === maxWorld && region === maxRegion && camp < maxCamp);
      const curSizeInfo = getCampSizeInfo(camp);

      let gridHtml = '';
      for (let c = 1; c <= 10; c++) {
        const isUnlocked = (world < maxWorld) ||
                           (world === maxWorld && region < maxRegion) ||
                           (world === maxWorld && region === maxRegion && c <= maxCamp);
        const isCur = (c === camp);
        const isCleared = c < maxCamp || (this.state.camps?.[getCampKey(world, region, c)]?.idleRate > 0);
        gridHtml += `
          <div class="camp-node ${isCleared ? 'cleared' : ''} ${isCur ? 'current' : ''}">
            <span>${isCur ? '🏕️' : isCleared ? '✅' : isUnlocked ? '🔓' : '🔒'}</span>
            <span>Camp ${c}</span>
          </div>
        `;
      }

      let listHtml = '';
      for (let c = 1; c <= 10; c++) {
        const isUnlocked = (world < maxWorld) ||
                           (world === maxWorld && region < maxRegion) ||
                           (world === maxWorld && region === maxRegion && c <= maxCamp);
        const isCur = (c === camp);
        const cKey = getCampKey(world, region, c);
        const cData = this.state.camps?.[cKey];
        const isCleared = c < maxCamp || (cData && cData.idleRate > 0);
        const cSize = getCampSizeInfo(c);

        const mgrCount = isCur
          ? Object.values(this.state.managers || {}).filter(m => m.level > 0).length
          : (cData ? Object.values(cData.managers || {}).filter(m => m.level > 0).length : 0);

        const idleVal = isCur ? 0 : (cData?.idleRate || 0);

        listHtml += `
          <div class="camp-item-card ${isCur ? 'active-resort' : ''}">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <div style="font-weight: bold; font-size: 12px; color: #1b4329;">
                ${isCur ? '🏕️' : isCleared ? '✅' : isUnlocked ? '🔓' : '🔒'} Camp #${c}: ${cSize.name}
                ${isCur ? '<span style="color: #27ae60; font-size: 10px; margin-left: 4px;">(ACTIVE)</span>' : ''}
              </div>
              <div style="font-size: 10px; color: #7f8c8d;">
                🏷️ ${cSize.tier} • 📐 ${cSize.size} (${cSize.pitches} Pitches Max)
              </div>
              <div style="font-size: 10px; color: #666;">
                ${mgrCount > 0 ? `👔 ${mgrCount} Managers` : 'No staff yet'} • ${idleVal > 0 ? `<strong style="color: #b7950b;">+$${idleVal}/s Idle</strong>` : isCur ? 'Active Level' : 'Unexplored'}
              </div>
            </div>
            <div>
              ${isCur ? `
                <button class="btn-camp-visit current" disabled>Current</button>
              ` : isUnlocked ? `
                <button class="btn-camp-visit" data-action="visit_camp" data-camp="${c}" data-region="${region}" data-world="${world}">
                  Visit ✈️
                </button>
              ` : `
                <span style="font-size: 10px; color: #999;">Locked 🔒</span>
              `}
            </div>
          </div>
        `;
      }

      let html = `
        <div style="font-size: 12px; color: #1b4f72; font-weight: bold; margin-bottom: 4px;">
          🗺️ GLOBAL RESORT EXPEDITION
        </div>
        <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
          Each Region has 10 Campsites. Previous campsites continue idling in the background!
        </div>

        <div class="world-stat-box">
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; color: #1b4329;">
            <span>🌍 WORLD ${world} / 100</span>
            <span>📍 REGION ${region} / 100</span>
          </div>
          <div style="font-size: 11px; color: #2980b9;">
            Biome: <strong>${biome.name}</strong> (${biome.theme})
          </div>
          <div style="font-size: 11px; color: #555;">
            Current Resort: <strong>${curSizeInfo.name} (Camp #${camp})</strong> • 📐 ${curSizeInfo.size} (${curSizeInfo.tier})
            ${isVisitingOlderCamp ? ' <span style="color: #e67e22; font-weight: bold;">(Visiting Older Resort)</span>' : ''}
          </div>
          <div style="font-size: 11px; color: #27ae60; font-weight: bold;">
            Resort Objectives: ${claimedCount}/${achDefs.length} Claimed
          </div>
          <div style="font-size: 11px; color: #b7950b; font-weight: bold; margin-top: 2px;">
            ⚡ Empire Idle Revenue: +$${empireIdleRate.toFixed(1)}/sec
          </div>
        </div>

        <div class="world-stat-box" style="margin-top: 8px;">
          <div style="font-size: 11px; font-weight: bold; color: #1b4329; margin-bottom: 4px;">REGION CAMPSITES (10 STAGES)</div>
          <div class="world-level-grid">
            ${gridHtml}
          </div>
        </div>

        <div class="world-stat-box" style="margin-top: 8px;">
          <div style="font-size: 11px; font-weight: bold; color: #1b4329; margin-bottom: 4px;">AUTOMATED RESORTS & IDLE VISITS</div>
          <div style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
            ${listHtml}
          </div>
        </div>

        <div style="margin-top: 10px;">
          ${isVisitingOlderCamp ? `
            <button class="btn-advance-camp" data-action="return_highest_camp" style="background: linear-gradient(135deg, #3498db, #2980b9); margin-bottom: 8px;">
              🏕️ RETURN TO FRONTIER RESORT (Camp #${maxCamp})
            </button>
          ` : canAdvance ? `
            <button class="btn-advance-camp" data-action="advance_camp">
              🚀 PACK UP & ADVANCE TO NEXT RESORT!
            </button>
          ` : `
            <div style="text-align: center; font-size: 11px; color: #7f8c8d; padding: 6px;">
              🔒 Complete all 11 achievements in the Goals tab to unlock the next resort!
            </div>
          `}
        </div>
      `;

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'franchise' || this.activeMainTab === 'ranger') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      if (!this.state.franchiseUpgrades) {
        this.state.franchiseUpgrades = {
          speedLevel: this.state.upgrades?.speedLevel || 1,
          capacityLevel: this.state.upgrades?.capacityLevel || 1,
          globalIncomeLevel: 0,
          seedCapitalLevel: 0,
          staffSpeedLevel: 0
        };
      }
      const upg = this.state.franchiseUpgrades;
      const vaultGold = Math.floor(this.state.empireGold || 0);

      // Upgrade 1: Ranger Speed
      const spdLvl = upg.speedLevel || 1;
      const spdCost = Math.round(40 * Math.pow(1.65, spdLvl - 1));
      const spdMax = spdLvl >= 10;

      // Upgrade 2: Ranger Cargo Capacity
      const capLvl = upg.capacityLevel || 1;
      const capCost = Math.round(50 * Math.pow(1.70, capLvl - 1));
      const capMax = capLvl >= 10;

      // Upgrade 3: Fast Investor (Deposit Speed)
      const investLvl = upg.investSpeedLevel || 1;
      const investCost = Math.round(45 * Math.pow(1.65, investLvl - 1));
      const investMax = investLvl >= 10;

      // Upgrade 4: Global Franchise Multiplier
      const incLvl = upg.globalIncomeLevel || 0;
      const incCost = Math.round(80 * Math.pow(1.85, incLvl));
      const incMax = incLvl >= 10;

      // Upgrade 5: Seed Capital
      const seedLvl = upg.seedCapitalLevel || 0;
      const seedCost = Math.round(60 * Math.pow(1.75, seedLvl));
      const seedMax = seedLvl >= 10;

      // Upgrade 6: Staff Cleaner Logistics
      const staffLvl = upg.staffSpeedLevel || 0;
      const staffCost = Math.round(55 * Math.pow(1.75, staffLvl));
      const staffMax = staffLvl >= 10;

      const html = `
        <div style="background: linear-gradient(135deg, #fef9e7, #fcf3cf); border: 2px solid #b7950b; border-radius: 8px; padding: 10px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: bold; color: #7d6608;">🏛️ EMPIRE VAULT TREASURY</div>
              <div style="font-size: 10px; color: #7f8c8d;">Accumulated passive revenue from automated resorts worldwide</div>
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #b7950b;">
              $${vaultGold.toLocaleString()}
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: #1b4329; font-weight: bold; margin-bottom: 4px;">
          ⭐ WORLDWIDE FRANCHISE & RANGER UPGRADES
        </div>
        <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
          These upgrades are permanent and apply across all 100 Regions & 10 Campsites!
        </div>

        <!-- 1. Ranger Speed -->
        <div class="manager-card rarity-rare">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">👟</div>
              <div class="manager-name-col">
                <div class="manager-title">Ranger Sprint</div>
                <div class="manager-role">Movement Speed (Global)</div>
              </div>
            </div>
            <span class="lvl-badge ${spdMax ? 'max' : 'active'}">Lvl ${spdLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Speed: ${this.state.rangerSpeed} px/s</div>
          <div class="manager-next-perk">${spdMax ? '⭐ MAX Level reached' : `Next: +16 px/s (${this.state.rangerSpeed + 16} px/s)`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Walk faster everywhere</span>
            ${spdMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= spdCost ? 'ready-pulse' : ''}" ${vaultGold >= spdCost ? '' : 'disabled'} data-action="franchise" data-id="ranger_speed">Upgrade ($${spdCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 2. Ranger Backpack Capacity -->
        <div class="manager-card rarity-rare">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">🎒</div>
              <div class="manager-name-col">
                <div class="manager-title">Backpack Cargo</div>
                <div class="manager-role">Firewood Capacity (Global)</div>
              </div>
            </div>
            <span class="lvl-badge ${capMax ? 'max' : 'active'}">Lvl ${capLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Cargo: ${this.state.rangerCapacity} Firewood Slots</div>
          <div class="manager-next-perk">${capMax ? '⭐ MAX Level reached' : `Next: +2 Cargo Slots (${this.state.rangerCapacity + 2} Slots)`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Carry more wood at once</span>
            ${capMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= capCost ? 'ready-pulse' : ''}" ${vaultGold >= capCost ? '' : 'disabled'} data-action="franchise" data-id="ranger_cap">Upgrade ($${capCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 3. Fast Investor (Build Spending Speed) -->
        <div class="manager-card rarity-rare">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">💸</div>
              <div class="manager-name-col">
                <div class="manager-title">Fast Investor</div>
                <div class="manager-role">Build Spending Speed (+50% / lvl)</div>
              </div>
            </div>
            <span class="lvl-badge ${investMax ? 'max' : 'active'}">Lvl ${investLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Base Rate: $${Math.round(110 * (1 + (investLvl - 1) * 0.5))}/s (×${(1 + (investLvl - 1) * 0.5).toFixed(1)})</div>
          <div class="manager-next-perk">${investMax ? '⭐ MAX Level reached' : `Next: $${Math.round(110 * (1 + investLvl * 0.5))}/s (+50% faster construction transfer)`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Pour cash faster into build pads</span>
            ${investMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= investCost ? 'ready-pulse' : ''}" ${vaultGold >= investCost ? '' : 'disabled'} data-action="franchise" data-id="invest_speed">Upgrade ($${investCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 4. Global Franchise Multiplier -->
        <div class="manager-card rarity-epic">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">📈</div>
              <div class="manager-name-col">
                <div class="manager-title">Empire Revenue Multiplier</div>
                <div class="manager-role">Worldwide Profit (+15% / lvl)</div>
              </div>
            </div>
            <span class="lvl-badge ${incMax ? 'max' : incLvl > 0 ? 'active' : 'locked'}">Lvl ${incLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Bonus: +${incLvl * 15}% Income Worldwide</div>
          <div class="manager-next-perk">${incMax ? '⭐ MAX Level reached' : `Next: +${(incLvl + 1) * 15}% Total Revenue (+15% boost)`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Boosts active & idle profits</span>
            ${incMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= incCost ? 'ready-pulse' : ''}" ${vaultGold >= incCost ? '' : 'disabled'} data-action="franchise" data-id="global_income">Upgrade ($${incCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 5. Seed Capital -->
        <div class="manager-card rarity-epic">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">🪙</div>
              <div class="manager-name-col">
                <div class="manager-title">Franchise Seed Capital</div>
                <div class="manager-role">New Campsite Starting Cash</div>
              </div>
            </div>
            <span class="lvl-badge ${seedMax ? 'max' : seedLvl > 0 ? 'active' : 'locked'}">Lvl ${seedLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Starter Funds: $${(60 + seedLvl * 100).toLocaleString()} 💵</div>
          <div class="manager-next-perk">${seedMax ? '⭐ MAX Level reached' : `Next: Start each new campsite with $${(60 + (seedLvl + 1) * 100).toLocaleString()} 💵`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Instant jumpstart on fresh camps</span>
            ${seedMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= seedCost ? 'ready-pulse' : ''}" ${vaultGold >= seedCost ? '' : 'disabled'} data-action="franchise" data-id="seed_capital">Upgrade ($${seedCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 6. Staff Cleaner Speed -->
        <div class="manager-card rarity-rare">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">🧹</div>
              <div class="manager-name-col">
                <div class="manager-title">Eco Fleet Logistics</div>
                <div class="manager-role">Cleaner Speed (+15% / lvl)</div>
              </div>
            </div>
            <span class="lvl-badge ${staffMax ? 'max' : staffLvl > 0 ? 'active' : 'locked'}">Lvl ${staffLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Bonus: +${staffLvl * 15}% Cleaner Speed Worldwide</div>
          <div class="manager-next-perk">${staffMax ? '⭐ MAX Level reached' : `Next: +${(staffLvl + 1) * 15}% Speed for Oliver, Chloe & Felix`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Faster trash & cash pickup</span>
            ${staffMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= staffCost ? 'ready-pulse' : ''}" ${vaultGold >= staffCost ? '' : 'disabled'} data-action="franchise" data-id="staff_speed">Upgrade ($${staffCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- Reset Resort -->
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed #d5dbdb; text-align: center;">
          <button class="btn-manager-action locked" data-action="reset" data-id="reset" style="width: 100%; padding: 8px 12px; font-size: 11px;">
            🔄 Resort komplett neu starten (Reset Save)
          </button>
        </div>
      `;

      this.ui.drawerContentList.innerHTML = html;
    }

    // Attach delegated click listeners to all action buttons in drawerContentList
    this.ui.drawerContentList.querySelectorAll('button:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const action = target.dataset.action;
        const id = target.dataset.id;
        if (!action) return;

        if (action === 'manager') {
          this.activateOrUpgradeManager(id);
        } else if (action === 'crate') {
          this.openCrate(id);
        } else if (action === 'buy_timeskip') {
          const sec = parseInt(target.dataset.seconds, 10);
          const cost = parseInt(target.dataset.cost, 10);
          const label = target.dataset.label || 'Time Warp';
          this.buyTimeSkip(sec, cost, label);
        } else if (action === 'buy_boost') {
          const duration = parseInt(target.dataset.duration, 10);
          const mult = parseFloat(target.dataset.multiplier);
          const cost = parseInt(target.dataset.cost, 10);
          this.buyIncomeBoost(duration, mult, cost);
        } else if (action === 'buy_iap') {
          const gems = parseInt(target.dataset.gems, 10);
          const price = target.dataset.price || '$0.99';
          const tier = target.dataset.tier || 'Gem Pack';
          this.buyIAPGems(gems, price, tier);
        } else if (action === 'goal') {
          this.claimAchievement(id);
        } else if (action === 'ranger' || action === 'franchise') {
          this.buyFranchiseUpgrade(id);
        } else if (action === 'advance_camp') {
          this.advanceToNextCamp();
        } else if (action === 'visit_camp') {
          const targetC = parseInt(target.dataset.camp, 10);
          const targetR = parseInt(target.dataset.region || this.state.region, 10);
          const targetW = parseInt(target.dataset.world || this.state.world, 10);
          if (targetC > 0) {
            this.switchCamp(targetW, targetR, targetC);
          }
        } else if (action === 'return_highest_camp') {
          const maxW = this.state.maxUnlockedWorld || 1;
          const maxR = this.state.maxUnlockedRegion || 1;
          const maxC = this.state.maxUnlockedCamp || 1;
          this.switchCamp(maxW, maxR, maxC);
        } else if (action === 'reset') {
          this.resetGame();
        }
      });
    });

    if (prevScroll > 0 && this.ui.drawerContentList) {
      this.ui.drawerContentList.scrollTop = prevScroll;
    }
  }

  updateBadges() {
    // 1. Managers Badge: can any manager be activated or upgraded?
    let canUpgradeManager = false;
    Object.values(MANAGER_DEFS).forEach(def => {
      const stateObj = this.state.managers[def.id] || { level: 0, cards: 0 };
      if (stateObj.level < def.maxLevel) {
        let reqCards = 0;
        let cost = 0;
        if (stateObj.level === 0) {
          const prereq = MANAGER_PREREQS[def.id];
          if (prereq && !prereq.isMet(this)) return;
          reqCards = def.unlockCards;
          cost = def.levels[0].cost;
        } else {
          reqCards = def.levels[stateObj.level].cardsReq;
          cost = def.levels[stateObj.level].cost;
        }
        if (stateObj.cards >= reqCards && this.state.cash >= cost) {
          canUpgradeManager = true;
        }
      }
    });

    if (this.ui?.badgeManagers) {
      this.ui.badgeManagers.style.display = canUpgradeManager ? 'block' : 'none';
    }

    // 2. Crates Badge: is free crate ready?
    const freeReady = (this.state.crates?.freeTimer || 0) <= 0;
    if (this.ui?.badgeCrates) {
      this.ui.badgeCrates.style.display = freeReady ? 'block' : 'none';
      this.ui.badgeCrates.textContent = 'FREE';
    }

    // 3. Goals Badge: any unclaimed completed achievements?
    let unclaimedGoals = 0;
    const achDefs = this.getActiveAchievementDefs();
    achDefs.forEach(ach => {
      const claimed = this.state.achievements?.[ach.id]?.claimed;
      if (!claimed && ach.getStat(this.state) >= ach.goal) {
        unclaimedGoals++;
      }
    });

    if (this.ui?.badgeGoals) {
      if (unclaimedGoals > 0) {
        this.ui.badgeGoals.style.display = 'block';
        this.ui.badgeGoals.textContent = unclaimedGoals;
      } else {
        this.ui.badgeGoals.style.display = 'none';
      }
    }
  }

  updateHUD() {
    const curGuests = this.getCurrentGuestsCount();
    const totCap = this.getTotalCapacity();

    if (this.ui?.cash) this.ui.cash.textContent = `$${Math.floor(this.state.cash)}`;
    if (this.ui?.power) {
      this.ui.power.textContent = `${this.state.powerDemand}/${this.state.powerCapacity} kW`;
      this.ui.power.parentElement.classList.toggle('overload', this.state.powerDemand > this.state.powerCapacity);
    }
    if (this.ui?.water) {
      this.ui.water.textContent = `${this.state.waterDemand}/${this.state.waterCapacity} m³`;
      this.ui.water.parentElement.classList.toggle('overload', this.state.waterDemand > this.state.waterCapacity);
    }
    // Shows Active Guests / Total Sleeping Capacity (e.g. 🏕️ 6/14)
    if (this.ui?.campers) {
      this.ui.campers.textContent = `${curGuests}/${totCap}`;
    }

    if (this.ui?.hudGems) {
      this.ui.hudGems.textContent = Math.floor(this.state.gems || 0).toLocaleString();
    }

    if (this.ui?.hudVault) {
      this.ui.hudVault.textContent = '$' + Math.floor(this.state.empireGold || 0).toLocaleString();
    }

    // Active Revenue Boost Banner
    if (this.ui?.boostBanner) {
      if (this.state.boostTimer > 0) {
        this.ui.boostBanner.style.display = 'block';
        const bSec = Math.ceil(this.state.boostTimer);
        const hrs = Math.floor(bSec / 3600);
        const mins = Math.floor((bSec % 3600) / 60);
        const secs = bSec % 60;
        const timeStr = `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
        this.ui.boostBanner.textContent = `⚡ ${this.state.boostMultiplier}x BOOST ACTIVE (${timeStr})`;
      } else {
        this.ui.boostBanner.style.display = 'none';
      }
    }

    if (this.ui?.stackBadge) {
      this.ui.stackBadge.textContent = `🪵 ${this.player.carriedItems}/${this.state.rangerCapacity}`;
    }

    if (this.ui?.hudWorldInfo) {
      const w = this.state.world || 1;
      const r = this.state.region || 1;
      const c = this.state.camp || 1;
      this.ui.hudWorldInfo.textContent = `W${w} R${r}: C${c}`;
    }

    // Empire Idle Income Pill
    const totalIdleRate = this.getTotalOtherCampsIdleRate();
    if (this.ui?.hudEmpireIdle && this.ui?.hudIdleRate) {
      if (totalIdleRate > 0) {
        this.ui.hudEmpireIdle.style.display = 'flex';
        this.ui.hudIdleRate.textContent = `+$${totalIdleRate.toFixed(1)}/s`;
      } else {
        this.ui.hudEmpireIdle.style.display = 'none';
      }
    }

    this.checkCampgroundCompletion();
    this.updateBadges();
    if (this.isMainMenuOpen) {
      this.updateMainMenuContent();
    }

    // Refresh buttons if drawer is open
    if (this.ui?.upgradesDrawer?.classList.contains('open')) {
      if (this.activeMainTab === 'ranger') {
        this.ui.drawerContentList?.querySelectorAll('button[data-action="ranger"]').forEach(btn => {
          const id = btn.dataset.id;
          let cost = 0;
          if (id === 'ranger_speed') cost = 50 * this.state.upgrades.speedLevel;
          else if (id === 'ranger_cap') cost = 60 * this.state.upgrades.capacityLevel;
          btn.disabled = this.state.cash < cost;
        });
      } else if (this.activeMainTab === 'crates') {
        this.ui.drawerContentList?.querySelectorAll('button[data-action="crate"]').forEach(btn => {
          const id = btn.dataset.id;
          if (id === 'wooden') btn.disabled = this.state.cash < 80;
          else if (id === 'golden') btn.disabled = this.state.cash < 220;
          else if (id === 'mythic') btn.disabled = (this.state.gems || 0) < 100;
          else if (id === 'emperor') btn.disabled = (this.state.gems || 0) < 250;
        });
      } else if (this.activeMainTab === 'shop') {
        this.ui.drawerContentList?.querySelectorAll('button[data-action="buy_timeskip"]').forEach(btn => {
          const cost = parseInt(btn.dataset.cost, 10);
          btn.disabled = (this.state.gems || 0) < cost;
        });
        this.ui.drawerContentList?.querySelectorAll('button[data-action="buy_boost"]').forEach(btn => {
          const cost = parseInt(btn.dataset.cost, 10);
          btn.disabled = (this.state.gems || 0) < cost;
        });
        this.ui.drawerContentList?.querySelectorAll('button[data-action="crate"]').forEach(btn => {
          const id = btn.dataset.id;
          if (id === 'mythic') btn.disabled = (this.state.gems || 0) < 100;
          else if (id === 'emperor') btn.disabled = (this.state.gems || 0) < 250;
        });
      }
    }
  }

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

    this.updatePlayer(dt);
    this.updateCamera();
    this.updateCampers(dt);
    this.updatePitches(dt);
    this.updateBuildPads(dt);
    this.updateWoodChopping(dt);
    this.updateCampfire(dt);
    this.updateFishing(dt);
    this.updateKiosk(dt);
    this.updateTrashBags(dt);
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
    const targetX = this.player.x - this.vWidth / 2;
    const targetY = this.player.y - this.vHeight / 2;
    this.camX += (targetX - this.camX) * 0.12;
    this.camY += (targetY - this.camY) * 0.12;

    if (this.worldW <= this.vWidth) {
      this.camX = (this.worldW - this.vWidth) / 2;
    } else {
      this.camX = Math.max(0, Math.min(this.worldW - this.vWidth, this.camX));
    }

    if (this.worldH <= this.vHeight) {
      this.camY = (this.worldH - this.vHeight) / 2;
    } else {
      this.camY = Math.max(0, Math.min(this.worldH - this.vHeight, this.camY));
    }
  }

  // --- RECEPTION & MULTI-GUEST CHECK-IN ---
  updateCampers(dt) {
    this.camperSpawnTimer += dt;
    // Spawn faster and allow up to 20 queueing/active campers
    if (this.camperSpawnTimer > 3.2 && this.campers.length < 22) {
      this.camperSpawnTimer = 0;
      this.spawnCamperGroup();
    }

    if (this.checkinCooldown > 0) {
      this.checkinCooldown -= dt;
    }

    // Is Ranger standing at the Reception desk?
    const distToReception = Math.hypot(this.player.x - this.receptionPos.x, this.player.y - this.receptionPos.y);
    const canCheckin = distToReception < 28 && this.checkinCooldown <= 0;

    // Get queueing campers
    const queueCampers = this.campers.filter(c => c.state === 'queueing');

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
          this.checkinCooldown = 0.35; // Rapid smooth check-in cadence

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
          const fee = basePerGuest * partySize;
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

          // Payout proportional to number of occupants
          const totalIncome = (p.baseIncome * (isJoy ? 1.5 : 1.0)) * guestCount;

          // Drop cash bundles
          this.cashDrops.push({
            x: p.dropX,
            y: p.dropY,
            amount: totalIncome
          });

          // Chance of leaving a trash bag
          if (Math.random() < 0.5) {
            this.trashBags.push({ x: p.dropX + 10, y: p.dropY });
          }

          p.guests = [];
          p.stayTimer = 0;
          this.state.totalCampersServed += guestCount;
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
        this.addCash(15);
        if (!this.state.stats) this.state.stats = {};
        this.state.stats.trashCollected = (this.state.stats.trashCollected || 0) + 1;
        window.soundFX?.playPop();
        this.showFloatText(tb.x, tb.y, '🧹 +$15 Cleaned!', '#f39c12');
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
      if (this.fishingTimer > 2.6) {
        this.fishingTimer = 0;
        this.addCash(25);
        if (!this.state.stats) this.state.stats = {};
        this.state.stats.fishCaught = (this.state.stats.fishCaught || 0) + 1;
        window.soundFX?.playCoin();
        this.showFloatText(this.pierPos.x, this.pierPos.y - 14, '🐟 Rainbow Trout +$25!', '#2ecc71');
      }
    } else {
      this.fishingTimer = 0;
    }
  }

  // --- SNACK KIOSK VISITS ---
  updateKiosk(dt) {
    if (!this.hasKiosk) return;
    if (this.frame % 160 === 0 && this.campers.length > 0) {
      this.addCash(14);
      if (!this.state.stats) this.state.stats = {};
      this.state.stats.kioskOrders = (this.state.stats.kioskOrders || 0) + 1;
      this.showFloatText(this.kioskPos.x, this.kioskPos.y - 15, '🍦 Kiosk Sale +$14', '#e67e22');
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
        // Continuous standing ramp-up (ramps up to 5x over 3 seconds)
        const ramp = Math.min(5.0, 1.0 + pad.standTimer * 1.35);
        const ratePerSec = 110 * investMult * ramp;
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
            const fee = (basePerGuest * partySize) + bonusTip;
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

    // 2. Zone Cleaners: Oliver (Tents), Chloe (Caravans), Felix (Cabins/Domes)
    const centerX = Math.round(this.worldW / 2);
    const cleaners = [
      { id: 'oliver', zoneTest: (item) => item.x <= centerX, defaultPos: { x: centerX - 100, y: Math.round(this.worldH * 0.45) } },
      { id: 'chloe', zoneTest: (item) => item.x > centerX && item.y >= Math.round(this.worldH * 0.28), defaultPos: { x: centerX + 100, y: Math.round(this.worldH * 0.45) } },
      { id: 'felix', zoneTest: (item) => item.y < Math.round(this.worldH * 0.28), defaultPos: { x: centerX, y: Math.round(this.worldH * 0.16) } }
    ];

    cleaners.forEach(({ id, zoneTest, defaultPos }) => {
      const stateObj = this.state.workers[id];
      if (!stateObj || stateObj.level <= 0) return;
      if (id === 'felix' && !this.pitches.some(p => p.tier === 'glamping' || p.tier === 'cabin' || p.tier === 'chalet' || p.tier === 'lodge' || p.tier === 'villa')) return;
      const worker = this.workers[id];
      if (!worker) return;

      const def = WORKER_DEFS[id];
      const lvlConfig = def.levels[stateObj.level - 1];
      const baseMoveSpeed = lvlConfig.speed || 55;
      const staffMult = 1.0 + (this.state.franchiseUpgrades?.staffSpeedLevel || 0) * 0.15;
      const moveSpeed = baseMoveSpeed * staffMult;
      const trashBonus = lvlConfig.bonus || 0;

      let targetCash = this.cashDrops.find(zoneTest) || (this.cashDrops.length > 0 ? this.cashDrops[0] : null);
      let targetTrash = this.trashBags.find(zoneTest) || (this.trashBags.length > 0 ? this.trashBags[0] : null);

      let targetItem = targetCash || targetTrash;
      let isCash = !!targetCash;

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
              const reward = 15 + trashBonus;
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
        const angle = (this.frame * 0.015) + (id === 'oliver' ? 0 : id === 'chloe' ? 2 : 4);
        const targetX = defaultPos.x + Math.cos(angle) * 22;
        const targetY = defaultPos.y + Math.sin(angle) * 16;
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

  showFloatText(worldX, worldY, text, color = '#2ecc71') {
    this.floatTexts.push({
      x: worldX,
      y: worldY,
      text,
      color,
      life: 1.0
    });
  }

  updateFloatTexts(dt) {
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i];
      ft.y -= 22 * dt;
      ft.life -= dt * 1.2;
      if (ft.life <= 0) this.floatTexts.splice(i, 1);
    }
  }

  // --- RENDER 2D PIXEL ART WORLD ---
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.vWidth, this.vHeight);

    ctx.save();
    // Offset by camera
    ctx.translate(-Math.floor(this.camX), -Math.floor(this.camY));

    // 1. Lush Biome Meadow & Palette
    const biome = this.currentBiome || WORLD_BIOMES[0];
    const pal = biome.palette;

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
    }
    if (this.hasGenerator) {
      PixelRenderer.drawGenerator(ctx, this.genPos.x, this.genPos.y, this.frame);
    }
    if (this.hasKiosk) {
      PixelRenderer.drawKiosk(ctx, this.kioskPos.x, this.kioskPos.y, this.frame);
    }
    if (this.hasSportsField) {
      PixelRenderer.drawSportsField(ctx, this.sportsFieldPos.x, this.sportsFieldPos.y);
    }

    // 5. Accommodations / Pitches (Drawn with occupancy badges)
    this.pitches.forEach(p => {
      if (p.tier === 'tent') PixelRenderer.drawPupTent(ctx, p.x, p.y);
      if (p.tier === 'caravan') PixelRenderer.drawCaravan(ctx, p.x, p.y);
      if (p.tier === 'glamping') PixelRenderer.drawGlampingDome(ctx, p.x, p.y);
      if (p.tier === 'cabin') PixelRenderer.drawLogCabin(ctx, p.x, p.y);
      if (p.tier === 'chalet') PixelRenderer.drawChalet(ctx, p.x, p.y);
      if (p.tier === 'lodge') PixelRenderer.drawLodge(ctx, p.x, p.y);
      if (p.tier === 'villa') PixelRenderer.drawVilla(ctx, p.x, p.y);

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

    // 7. Cash Drops & Trash Bags
    this.cashDrops.forEach(cd => {
      PixelRenderer.drawCash(ctx, cd.x, cd.y);
    });

    this.trashBags.forEach(tb => {
      PixelRenderer.drawTrashBag(ctx, tb.x, tb.y);
    });

    // 8. Campers (All queueing, walking, relaxing, and leaving campers)
    this.campers.forEach(c => {
      PixelRenderer.drawCamper(ctx, c.x, c.y, c.type, c.dir, c.walkCycle);
      if (c.bubble) {
        PixelRenderer.drawSpeechBubble(ctx, c.x, c.y, c.bubble, this.frame);
      }
    });

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

      // Calculate offline earnings from previous automated campsites with boost support -> Empire Vault Gold
      const lastSaved = p.lastTimestamp || 0;
      if (lastSaved > 0) {
        const now = Date.now();
        const elapsedSec = Math.min(86400, Math.max(0, (now - lastSaved) / 1000));
        if (elapsedSec > 10) {
          const totalIdleRate = this.getTotalOtherCampsIdleRate();
          let offlineCash = 0;
          if (this.state.boostTimer > 0) {
            const boostedSec = Math.min(elapsedSec, this.state.boostTimer);
            const normalSec = Math.max(0, elapsedSec - boostedSec);
            offlineCash = Math.round(totalIdleRate * (boostedSec * (this.state.boostMultiplier || 2.0) + normalSec));
            this.state.boostTimer = Math.max(0, this.state.boostTimer - elapsedSec);
            if (this.state.boostTimer <= 0) this.state.boostMultiplier = 1.0;
          } else {
            offlineCash = Math.round(totalIdleRate * elapsedSec);
          }
          if (offlineCash > 0) {
            const globalMult = 1.0 + (this.state.franchiseUpgrades?.globalIncomeLevel || 0) * 0.15;
            const vaultGoldEarned = Math.round(offlineCash * globalMult);
            this.addEmpireGold(vaultGoldEarned);
            if (!this.state.stats) this.state.stats = {};
            this.state.stats.totalVaultGoldEarned = (this.state.stats.totalVaultGoldEarned || 0) + vaultGoldEarned;
            setTimeout(() => {
              this.showFloatText(this.player.x, this.player.y - 20, `💤 Offline Vault: +$${vaultGoldEarned} 🏛️!`, '#ffd700');
              window.soundFX?.playCoin();
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
