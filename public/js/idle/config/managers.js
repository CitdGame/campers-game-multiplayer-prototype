// Manager & Staff Worker Definitions and Prerequisites
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
      { level: 1, cardsReq: 1, cost: 25, speed: 2.0, tip: 0, wage: 0.8, desc: 'Auto check-in every 2.0s' },
      { level: 2, cardsReq: 2, cost: 60, speed: 1.3, tip: 5, wage: 1.8, desc: 'Check-in every 1.3s +$5 tip' },
      { level: 3, cardsReq: 4, cost: 120, speed: 0.8, tip: 12, wage: 3.8, desc: 'Check-in every 0.8s +$12 tip' },
      { level: 4, cardsReq: 8, cost: 240, speed: 0.4, tip: 22, wage: 8.0, desc: 'Master Concierge: 0.4s +$22 tip' }
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
      { level: 1, cardsReq: 2, cost: 50, speed: 1.8, tip: 5, wage: 1.4, desc: 'Dual lane auto-checkin (1.8s +$5 tip)' },
      { level: 2, cardsReq: 4, cost: 110, speed: 1.0, tip: 12, wage: 3.0, desc: 'Fast track lane (1.0s +$12 tip)' },
      { level: 3, cardsReq: 8, cost: 220, speed: 0.5, tip: 25, wage: 6.5, desc: 'VIP Express (0.5s +$25 tip)' }
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
      { level: 1, cardsReq: 1, cost: 20, speed: 52, bonus: 0, wage: 0.6, desc: 'Sweeps West Tents at 52 px/s' },
      { level: 2, cardsReq: 2, cost: 45, speed: 78, bonus: 5, wage: 1.5, desc: 'Roller Skates (78 px/s +$5 trash bonus)' },
      { level: 3, cardsReq: 4, cost: 90, speed: 105, bonus: 15, wage: 3.2, desc: 'Turbo Sweeper (105 px/s +$15 trash bonus)' }
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
      { level: 1, cardsReq: 2, cost: 40, speed: 56, bonus: 5, wage: 1.0, desc: 'Sweeps East Caravans at 56 px/s +$5' },
      { level: 2, cardsReq: 4, cost: 95, speed: 82, bonus: 12, wage: 2.2, desc: 'Speed boost (82 px/s +$12 trash bonus)' },
      { level: 3, cardsReq: 8, cost: 180, speed: 112, bonus: 22, wage: 4.8, desc: 'Eco-Mop Pro (112 px/s +$22 trash bonus)' }
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
      { level: 1, cardsReq: 3, cost: 70, speed: 60, bonus: 10, wage: 1.8, desc: 'Sweeps Forest Lodges at 60 px/s +$10' },
      { level: 2, cardsReq: 5, cost: 150, speed: 88, bonus: 20, wage: 3.8, desc: 'Polished Butler (88 px/s +$20 trash bonus)' },
      { level: 3, cardsReq: 10, cost: 260, speed: 120, bonus: 35, wage: 8.0, desc: 'White Glove Service (120 px/s +$35 trash bonus)' }
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
      { level: 1, cardsReq: 2, cost: 45, interval: 3.6, income: 30, wage: 1.6, desc: 'Catches fish every 3.6s ($30/catch)' },
      { level: 2, cardsReq: 4, cost: 95, interval: 2.5, income: 50, wage: 3.8, desc: 'Carbon Rod: Fish every 2.5s ($50/catch)' },
      { level: 3, cardsReq: 8, cost: 180, interval: 1.6, income: 80, wage: 8.5, desc: 'Golden Lures: Fish every 1.6s ($80/catch)' },
      { level: 4, cardsReq: 15, cost: 320, interval: 1.0, income: 130, wage: 18.0, desc: 'Trophy Angler: Fish every 1.0s ($130/catch)' }
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
      { level: 1, cardsReq: 1, cost: 30, interval: 4.0, income: 25, wage: 1.4, desc: 'Serves snacks every 4.0s ($25/sale)' },
      { level: 2, cardsReq: 3, cost: 70, interval: 2.8, income: 45, wage: 3.2, desc: 'Espresso Bar: Serves every 2.8s ($45/sale)' },
      { level: 3, cardsReq: 6, cost: 140, interval: 1.8, income: 75, wage: 7.0, desc: 'Gourmet Treats: Serves every 1.8s ($75/sale)' },
      { level: 4, cardsReq: 12, cost: 260, interval: 1.1, income: 120, wage: 15.0, desc: 'Cafe Delite: Serves every 1.1s ($120/sale)' }
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
      { level: 1, cardsReq: 3, cost: 60, capacity: 1, speed: 60, frenzyAdd: 18, wage: 1.2, desc: 'Hauls 1 log at 60 px/s (+18s Frenzy)' },
      { level: 2, cardsReq: 5, cost: 140, capacity: 2, speed: 78, frenzyAdd: 28, wage: 2.6, desc: 'Log Cart: Hauls 2 logs at 78 px/s (+28s Frenzy)' },
      { level: 3, cardsReq: 10, cost: 250, capacity: 3, speed: 98, frenzyAdd: 42, tip: 25, wage: 5.5, desc: 'Timber Master: 3 logs (+42s Frenzy +$25 Tip)' }
    ]
  }
};

export const WORKER_DEFS = MANAGER_DEFS;

export function getManagerWage(managerId, level) {
  const def = MANAGER_DEFS[managerId];
  if (!def || !level || level <= 0) return 0;
  const lvlConfig = def.levels[level - 1];
  return lvlConfig?.wage || 0;
}

export function getTotalStaffWage(managersState) {
  if (!managersState) return 0;
  let total = 0;
  for (const [id, m] of Object.entries(managersState)) {
    if (m && m.level > 0) {
      total += getManagerWage(id, m.level);
    }
  }
  return Math.round(total * 10) / 10;
}

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
