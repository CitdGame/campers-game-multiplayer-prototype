// Building & Pitch Upgrade Level Formulas and Scaling

export function getMaxBuildingLevel(world = 1, region = 1, camp = 1) {
  let baseMax = 10;
  if (camp === 1) baseMax = 10;
  else if (camp === 2) baseMax = 20;
  else baseMax = 25 + (camp - 3) * 5; // camp 3 -> 25, camp 4 -> 30 ... camp 10 -> 60

  const regionBonus = (region - 1) * 10;
  const worldBonus = (world - 1) * 50;
  return baseMax + regionBonus + worldBonus;
}

export const BASE_BUILDING_UPGRADE_COSTS = {
  tent_1: 45,
  caravan_1: 85,
  pad_tent_2: 55,
  tent_2: 55,
  pad_caravan_2: 100,
  caravan_2: 100,
  pad_tent_3: 75,
  tent_3: 75,
  pad_glamp: 180,
  glamp_3: 180,
  pad_caravan_3: 160,
  caravan_3: 160,
  pad_cabin: 260,
  cabin_4: 260,
  pad_glamp_2: 360,
  glamp_2: 360,
  pad_chalet: 520,
  chalet_1: 520,
  pad_caravan_4: 720,
  caravan_4: 720,
  pad_lodge: 1050,
  lodge_1: 1050,
  pad_villa: 1600,
  villa_1: 1600,
  pad_water: 60,
  pad_gen: 75,
  pad_kiosk: 65,
  pad_sports: 120,
  pad_canoe: 85,
  pad_sauna: 140
};

export function getBuildingUpgradeCost(id, currentLevel = 1, costMult = 1.0) {
  const base = BASE_BUILDING_UPGRADE_COSTS[id] || 55;
  // Steep exponential curve ~34% per level for drastic price increase
  return Math.max(25, Math.round(base * Math.pow(1.34, currentLevel - 1) * costMult));
}

export function getBuildingIncomeMultiplier(level = 1) {
  if (level <= 1) return 1.0;
  // +25% base income per level
  let mult = 1.0 + (level - 1) * 0.25;

  // Huge Milestone Multipliers
  if (level >= 10) mult *= 2.0; // 2x milestone bonus at level 10
  if (level >= 20) mult *= 2.0; // 2x milestone bonus at level 20
  if (level >= 25) mult *= 2.5; // 2.5x milestone bonus at level 25
  if (level >= 50) mult *= 3.0; // 3x milestone bonus at level 50

  return Math.round(mult * 100) / 100;
}

export function getBuildingBonusCapacity(level = 1) {
  let bonus = 0;
  if (level >= 10) bonus += 1;
  if (level >= 25) bonus += 1;
  if (level >= 50) bonus += 1;
  return bonus;
}

export function getTotalBuildingLevels(buildingLevels = {}) {
  let total = 0;
  for (const lvl of Object.values(buildingLevels)) {
    total += (lvl || 1);
  }
  return total;
}

export function getHighestBuildingLevel(buildingLevels = {}) {
  let max = 1;
  for (const lvl of Object.values(buildingLevels)) {
    if (lvl > max) max = lvl;
  }
  return max;
}
