// Global Franchise Empire Upgrades
export const FRANCHISE_UPGRADE_DEFS = {
  ranger_speed: {
    id: 'ranger_speed',
    name: 'Ranger Sprint',
    icon: '👟',
    maxLevel: 10,
    costFormula: (lvl) => Math.round(40 * Math.pow(1.65, lvl - 1)),
    desc: 'Increases player run speed (+16 px/s per lvl)',
    getStat: (lvl) => `${92 + (lvl - 1) * 16} px/s`
  },
  ranger_cap: {
    id: 'ranger_cap',
    name: 'Heavy Backpack',
    icon: '🎒',
    maxLevel: 10,
    costFormula: (lvl) => Math.round(50 * Math.pow(1.70, lvl - 1)),
    desc: 'Increases wood carrying capacity (+2 cargo per lvl)',
    getStat: (lvl) => `${4 + (lvl - 1) * 2} items`
  },
  invest_speed: {
    id: 'invest_speed',
    name: 'Fast Investor',
    icon: '💸',
    maxLevel: 10,
    costFormula: (lvl) => Math.round(45 * Math.pow(1.65, lvl - 1)),
    desc: 'Pours cash into build pads 50% faster per level',
    getStat: (lvl) => `+${(lvl - 1) * 50}% speed`
  },
  global_income: {
    id: 'global_income',
    name: 'Empire Franchise Boost',
    icon: '📈',
    maxLevel: 10,
    costFormula: (lvl) => Math.round(80 * Math.pow(1.85, lvl)),
    desc: 'Permanent +15% revenue multiplier across all campsites',
    getStat: (lvl) => `+${lvl * 15}% revenue`
  },
  seed_capital: {
    id: 'seed_capital',
    name: 'Franchise Seed Capital',
    icon: '🪙',
    maxLevel: 10,
    costFormula: (lvl) => Math.round(60 * Math.pow(1.75, lvl)),
    desc: 'Grants +$100 bonus starting cash when unlocking new camps',
    getStat: (lvl) => `+$${lvl * 100} cash`
  },
  staff_speed: {
    id: 'staff_speed',
    name: 'Motivated Staff',
    icon: '🧹',
    maxLevel: 10,
    costFormula: (lvl) => Math.round(55 * Math.pow(1.75, lvl)),
    desc: 'Boosts walk speed of all camp cleaners & helpers by +15%',
    getStat: (lvl) => `+${lvl * 15}% speed`
  }
};
