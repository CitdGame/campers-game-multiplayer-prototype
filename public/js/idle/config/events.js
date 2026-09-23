// Weekly Sonderevents Configuration
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
