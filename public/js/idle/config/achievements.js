// Camp Achievement Definitions Generator
import { getMaxBuildingLevel, getHighestBuildingLevel, getTotalBuildingLevels } from './buildings.js';

export function getCampAchievementDefs(world = 1, region = 1, camp = 1) {
  // Balanced progression curve across 10 camps per region
  const campScale = Math.pow(1.24, camp - 1) * (1.0 + (region - 1) * 0.10 + (world - 1) * 0.4);
  const maxLvl = getMaxBuildingLevel(world, region, camp);

  const mAlex = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mSam = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mRobin = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mOliver = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mChloe = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mFelix = Math.min(10, 2 + Math.floor(camp * 0.7));
  const mFinn = Math.min(10, 2 + Math.floor(camp * 0.6));
  const mBella = Math.min(10, 2 + Math.floor(camp * 0.6));

  const c1 = 3;
  const c10 = Math.min(80, Math.round(18 + camp * 5));
  const w3 = Math.min(30, Math.round(6 + camp * 2.2));
  const t5 = Math.min(45, Math.round(10 + camp * 3));
  const t15 = Math.min(90, Math.round(22 + camp * 6));
  const p2 = 1;
  const p5 = Math.min(8, Math.max(2, Math.floor(1.2 + camp * 0.8)));
  const f3 = Math.min(25, Math.round(5 + camp * 2));
  const k3 = Math.min(30, Math.round(6 + camp * 2.2));
  const cashGoal = Math.round(1500 * campScale);
  const utilGoal = camp >= 5 ? 3 : 2;

  // Building upgrade targets
  const targetPitchLvl = Math.min(maxLvl, Math.max(3, Math.floor(maxLvl * 0.5)));
  const targetTotalLvl = Math.min(maxLvl * 4, Math.round(10 + camp * 4));

  const cashReward = (base) => Math.round(base * Math.pow(campScale, 0.88));

  return [
    {
      id: 'first_checkin',
      title: 'First Arrivals',
      icon: '🏕️',
      desc: `Check in ${c1} camper parties`,
      goal: c1,
      getStat: (s) => s.stats?.totalCampersServed || 0,
      rewardDesc: `+${mAlex} Alex, +1 Oliver, +$${cashReward(80)}, +10 💎`,
      reward: { cards: { alex: mAlex, oliver: 1 }, cash: cashReward(80), gems: 10 }
    },
    {
      id: 'busy_reception',
      title: 'Bustling Resort',
      icon: '📋',
      desc: `Check in ${c10} camper parties`,
      goal: c10,
      getStat: (s) => s.stats?.totalCampersServed || 0,
      rewardDesc: `+${mSam} Sam Cards, +$${cashReward(150)}, +15 💎`,
      reward: { cards: { sam: mSam }, cash: cashReward(150), gems: 15 }
    },
    {
      id: 'campfire_glow',
      title: 'Campfire Warmth',
      icon: '🔥',
      desc: `Feed firewood to the campfire ${w3} times`,
      goal: w3,
      getStat: (s) => s.stats?.woodBurned || 0,
      rewardDesc: `+${mRobin} Robin Cards, +$${cashReward(110)}, +10 💎`,
      reward: { cards: { robin: mRobin }, cash: cashReward(110), gems: 10 }
    },
    {
      id: 'eco_warrior',
      title: 'Clean Campground',
      icon: '🧹',
      desc: `Sweep up ${t5} trash bags`,
      goal: t5,
      getStat: (s) => s.stats?.trashCollected || 0,
      rewardDesc: `+${mOliver} Oliver Cards, +$${cashReward(100)}, +10 💎`,
      reward: { cards: { oliver: mOliver }, cash: cashReward(100), gems: 10 }
    },
    {
      id: 'clean_sweep',
      title: 'Zero Waste Hero',
      icon: '🧽',
      desc: `Sweep up ${t15} trash bags`,
      goal: t15,
      getStat: (s) => s.stats?.trashCollected || 0,
      rewardDesc: `+${mChloe} Chloe Cards, +$${cashReward(160)}, +15 💎`,
      reward: { cards: { chloe: mChloe }, cash: cashReward(160), gems: 15 }
    },
    {
      id: 'pitch_upgrade',
      title: 'Quality Stays',
      icon: '⭐',
      desc: `Upgrade any building to Level ${targetPitchLvl}`,
      goal: targetPitchLvl,
      getStat: (s) => getHighestBuildingLevel(s.buildingLevels),
      rewardDesc: `+${mChloe} Chloe Cards, +$${cashReward(180)}, +15 💎`,
      reward: { cards: { chloe: mChloe }, cash: cashReward(180), gems: 15 }
    },
    {
      id: 'resort_rating',
      title: 'Resort Expansion',
      icon: '🏡',
      desc: `Reach Total Building Levels of ${targetTotalLvl}`,
      goal: targetTotalLvl,
      getStat: (s) => getTotalBuildingLevels(s.buildingLevels),
      rewardDesc: `+${mFelix} Felix Cards, +$${cashReward(250)}, +20 💎`,
      reward: { cards: { felix: mFelix }, cash: cashReward(250), gems: 20 }
    },
    {
      id: 'master_angler',
      title: 'Pond Fisherman',
      icon: '🎣',
      desc: `Catch ${f3} prize fish at the pond pier`,
      goal: f3,
      getStat: (s) => s.stats?.fishCaught || 0,
      rewardDesc: `+${mFinn} Finn Cards, +$${cashReward(140)}, +15 💎`,
      reward: { cards: { finn: mFinn }, cash: cashReward(140), gems: 15 }
    },
    {
      id: 'snack_attack',
      title: 'Kiosk Barista',
      icon: '☕',
      desc: `Make ${k3} sales at the Snack Kiosk`,
      goal: k3,
      getStat: (s) => s.stats?.kioskOrders || 0,
      rewardDesc: `+${mBella} Bella Cards, +$${cashReward(130)}, +15 💎`,
      reward: { cards: { bella: mBella }, cash: cashReward(130), gems: 15 }
    },
    {
      id: 'cash_flow',
      title: 'Gold Rush',
      icon: '💵',
      desc: `Earn a total of $${cashGoal} campsite revenue`,
      goal: cashGoal,
      getStat: (s) => s.stats?.totalCashEarned || 0,
      rewardDesc: `+${mRobin} Robin, +${mFelix} Felix, +$${cashReward(300)}, +25 💎`,
      reward: { cards: { robin: mRobin, felix: mFelix }, cash: cashReward(300), gems: 25 }
    },
    {
      id: 'power_grid',
      title: 'Power & Water',
      icon: '⚡',
      desc: camp >= 5 ? 'Build Generator, Water Well & Sports Field' : 'Build Generator Shed & Water Pump',
      goal: utilGoal,
      getStat: (s) => s.stats?.utilitiesBuilt || 0,
      rewardDesc: `+${mSam} Sam, +${mFinn} Finn, +$${cashReward(200)}, +20 💎`,
      reward: { cards: { sam: mSam, finn: mFinn }, cash: cashReward(200), gems: 20 }
    }
  ];
}
