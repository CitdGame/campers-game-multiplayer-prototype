// Crate & Gacha Definitions
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
