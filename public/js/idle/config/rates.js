// Campsite Economy and Idle Turnover Calculation Formulas
import { getTotalStaffWage } from './managers.js';

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

  // Canoe Rental Dock
  if (campData.hasCanoeDock) {
    const canoeLvl = campData.buildingLevels?.['pad_canoe'] || 1;
    totalRate += (3.5 * incomeMult) * (1.0 + (canoeLvl - 1) * 0.25);
  }

  // Alpine Sauna & Hot Springs
  if (campData.hasSauna && campData.hasWaterPump) {
    const saunaLvl = campData.buildingLevels?.['pad_sauna'] || 1;
    totalRate += (6.5 * incomeMult) * (1.0 + (saunaLvl - 1) * 0.25);
  }

  // Robin (Campfire Joy Frenzy boost)
  if (mgrs.robin?.level > 0) {
    const boost = 1.0 + 0.18 * mgrs.robin.level;
    totalRate *= boost;
  }

  // Building Upgrade Levels bonus (+10% active throughput per building level above 1)
  const bLevels = campData.buildingLevels || {};
  let totalUpgrades = 0;
  for (const lvl of Object.values(bLevels)) {
    if (lvl > 1) totalUpgrades += (lvl - 1);
  }
  if (totalUpgrades > 0) {
    totalRate *= (1.0 + Math.min(15.0, totalUpgrades * 0.10));
  }

  // Deduct staff salaries / operating expenses
  const totalWages = getTotalStaffWage(mgrs);
  const netRate = Math.max(0.5, totalRate - totalWages);

  return Math.round(netRate * 10) / 10;
}

export function calculateCampIdleRate(campData) {
  const activeRate = calculateCampActiveRate(campData);
  // Franchise Passive Efficiency (45% of active throughput for idle background campsites)
  const franchisePassiveEfficiency = 0.45;
  return Math.round(activeRate * franchisePassiveEfficiency * 10) / 10;
}
