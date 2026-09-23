// EconomySystem: Handles Shop Purchases, Upgrades, Boosts, and Loot Generation
import { CRATE_DEFS } from '../config/crates.js';
import { MANAGER_DEFS } from '../config/managers.js';
import { FRANCHISE_UPGRADE_DEFS } from '../config/franchise.js';

export class EconomySystem {
  constructor(game) {
    this.game = game;
  }

  get state() {
    return this.game.state;
  }

  // --- FRANCHISE UPGRADES ---
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
      if (!this.game.spendEmpireGold(cost)) {
        this.game.showFloatText(this.game.player.x, this.game.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.speedLevel++;
      this.state.upgrades.speedLevel = upg.speedLevel;
      this.state.rangerSpeed = 92 + (upg.speedLevel - 1) * 16;
      window.soundFX?.playBuild();
      this.game.showFloatText(this.game.player.x, this.game.player.y - 12, `👟 Speed Up! (${this.state.rangerSpeed}px/s)`, '#2ecc71');
      this.game.updateHUD();
      this.game.renderDrawerContent();
      this.game.saveState();
      return;
    }

    if (id === 'ranger_cap') {
      const curLvl = upg.capacityLevel || 1;
      if (curLvl >= 10) return;
      const cost = Math.round(50 * Math.pow(1.70, curLvl - 1));
      if (!this.game.spendEmpireGold(cost)) {
        this.game.showFloatText(this.game.player.x, this.game.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.capacityLevel++;
      this.state.upgrades.capacityLevel = upg.capacityLevel;
      this.state.rangerCapacity = 4 + (upg.capacityLevel - 1) * 2;
      window.soundFX?.playBuild();
      this.game.showFloatText(this.game.player.x, this.game.player.y - 12, `🎒 +2 Backpack Cargo! (${this.state.rangerCapacity})`, '#2ecc71');
      this.game.updateHUD();
      this.game.renderDrawerContent();
      this.game.saveState();
      return;
    }

    if (id === 'invest_speed') {
      const curLvl = upg.investSpeedLevel || 1;
      if (curLvl >= 10) return;
      const cost = Math.round(45 * Math.pow(1.65, curLvl - 1));
      if (!this.game.spendEmpireGold(cost)) {
        this.game.showFloatText(this.game.player.x, this.game.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.investSpeedLevel = curLvl + 1;
      window.soundFX?.playBuild();
      this.game.showFloatText(this.game.player.x, this.game.player.y - 12, `💸 Spend Speed Up! (Lvl ${upg.investSpeedLevel})`, '#2ecc71');
      this.game.updateHUD();
      this.game.renderDrawerContent();
      this.game.saveState();
      return;
    }

    if (id === 'global_income') {
      const curLvl = upg.globalIncomeLevel || 0;
      if (curLvl >= 10) return;
      const cost = Math.round(80 * Math.pow(1.85, curLvl));
      if (!this.game.spendEmpireGold(cost)) {
        this.game.showFloatText(this.game.player.x, this.game.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.globalIncomeLevel = curLvl + 1;
      window.soundFX?.playBuild();
      this.game.showFloatText(this.game.player.x, this.game.player.y - 12, `📈 +15% Global Revenue! (+${upg.globalIncomeLevel * 15}%)`, '#f1c40f');
      this.game.updateHUD();
      this.game.renderDrawerContent();
      this.game.saveState();
      return;
    }

    if (id === 'seed_capital') {
      const curLvl = upg.seedCapitalLevel || 0;
      if (curLvl >= 10) return;
      const cost = Math.round(60 * Math.pow(1.75, curLvl));
      if (!this.game.spendEmpireGold(cost)) {
        this.game.showFloatText(this.game.player.x, this.game.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.seedCapitalLevel = curLvl + 1;
      window.soundFX?.playBuild();
      this.game.showFloatText(this.game.player.x, this.game.player.y - 12, `🪙 Seed Capital +$100! (+$${upg.seedCapitalLevel * 100})`, '#f1c40f');
      this.game.updateHUD();
      this.game.renderDrawerContent();
      this.game.saveState();
      return;
    }

    if (id === 'staff_speed') {
      const curLvl = upg.staffSpeedLevel || 0;
      if (curLvl >= 10) return;
      const cost = Math.round(55 * Math.pow(1.75, curLvl));
      if (!this.game.spendEmpireGold(cost)) {
        this.game.showFloatText(this.game.player.x, this.game.player.y - 12, '🏛️ Not enough Empire Gold!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      upg.staffSpeedLevel = curLvl + 1;
      window.soundFX?.playBuild();
      this.game.showFloatText(this.game.player.x, this.game.player.y - 12, `🧹 Cleaners Speed +15%! (+${upg.staffSpeedLevel * 15}%)`, '#2ecc71');
      this.game.updateHUD();
      this.game.renderDrawerContent();
      this.game.saveState();
      return;
    }
  }

  // --- TIME SKIP (TIME WARP) ---
  buyTimeSkip(seconds, costGems, label = 'Time Warp') {
    if ((this.state.gems || 0) < costGems) {
      this.game.showFloatText(this.game.player.x, this.game.player.y - 15, '💎 Not enough Gems!', '#e74c3c');
      window.soundFX?.playThud();
      return;
    }
    this.state.gems -= costGems;

    const activeRate = Math.max(3.0, this.game.getCurrentCampActiveRate());
    const empireRate = this.game.getTotalOtherCampsIdleRate();
    const effMult = (this.state.boostTimer > 0 && this.state.boostMultiplier > 1.0) ? this.state.boostMultiplier : 1.0;
    const globalMult = 1.0 + (this.state.franchiseUpgrades?.globalIncomeLevel || 0) * 0.15;

    const activePayout = Math.round(activeRate * effMult * globalMult * seconds);
    const empirePayout = Math.round(empireRate * effMult * globalMult * seconds);

    this.game.addCash(activePayout, true);
    if (empirePayout > 0) {
      this.game.addEmpireGold(empirePayout);
    }
    window.soundFX?.playFanfare();

    const vaultMsg = empirePayout > 0 ? ` & +$${empirePayout.toLocaleString()} 🏛️` : '';
    this.game.showFloatText(this.game.player.x, this.game.player.y - 20, `⏱️ ${label}: +$${activePayout.toLocaleString()} 💵${vaultMsg}!`, '#f1c40f');
    for (let p = 0; p < 8; p++) {
      this.game.particles.push({
        x: this.game.player.x + (Math.random() - 0.5) * 20,
        y: this.game.player.y - 10 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 25,
        vy: -20 - Math.random() * 20,
        size: 2.5,
        life: 0.8,
        color: '#f1c40f'
      });
    }
    this.game.updateHUD();
    this.game.renderDrawerContent();
    this.game.saveState();
  }

  // --- INCOME BOOST ---
  buyIncomeBoost(durationSeconds, multiplier, costGems) {
    if ((this.state.gems || 0) < costGems) {
      this.game.showFloatText(this.game.player.x, this.game.player.y - 15, '💎 Not enough Gems!', '#e74c3c');
      window.soundFX?.playThud();
      return;
    }
    this.state.gems -= costGems;

    this.state.boostTimer = (this.state.boostTimer || 0) + durationSeconds;
    this.state.boostMultiplier = Math.max(this.state.boostMultiplier || 1.0, multiplier);

    window.soundFX?.playFanfare();
    this.game.showFloatText(this.game.player.x, this.game.player.y - 20, `⚡ ${multiplier}x Boost Active!`, '#9b59b6');
    for (let p = 0; p < 8; p++) {
      this.game.particles.push({
        x: this.game.player.x + (Math.random() - 0.5) * 20,
        y: this.game.player.y - 10 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 25,
        vy: -20 - Math.random() * 20,
        size: 2.5,
        color: '#9b59b6',
        life: 0.8
      });
    }

    this.game.updateHUD();
    this.game.renderDrawerContent();
    this.game.saveState();
  }

  // --- IAP GEMS ---
  buyIAPGems(gemAmount, priceStr, tierName = 'Gem Pack') {
    this.game.addGems(gemAmount);
    window.soundFX?.playFanfare();
    this.game.showFloatText(this.game.player.x, this.game.player.y - 20, `💎 +${gemAmount.toLocaleString()} Gems (${priceStr})!`, '#2980b9');
    for (let p = 0; p < 12; p++) {
      this.game.particles.push({
        x: this.game.player.x + (Math.random() - 0.5) * 24,
        y: this.game.player.y - 10 + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 30,
        vy: -25 - Math.random() * 25,
        size: 3,
        color: '#3498db',
        life: 1.0
      });
    }

    this.game.updateHUD();
    this.game.renderDrawerContent();
    this.game.saveState();
  }

  // --- CRATE LOOT GENERATOR ---
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

  // --- CLAIM ACHIEVEMENT ---
  claimAchievement(achId) {
    if (!this.state.achievements) this.state.achievements = {};
    
    // Normalize state for this achievement so it can be claimed even if previously undefined
    if (typeof this.state.achievements[achId] === 'boolean') {
      this.state.achievements[achId] = { claimed: this.state.achievements[achId] };
    } else if (!this.state.achievements[achId] || typeof this.state.achievements[achId] !== 'object') {
      this.state.achievements[achId] = { claimed: false };
    }

    const achState = this.state.achievements[achId];
    if (achState.claimed) return;

    const defs = this.game.getActiveAchievementDefs();
    const def = defs.find(d => d.id === achId);
    if (!def) return;

    const currentVal = def.getStat ? def.getStat(this.state) : 0;
    if (currentVal < def.goal) return;

    achState.claimed = true;
    window.soundFX?.playFanfare();

    if (def.reward?.cash) {
      this.game.addCash(def.reward.cash, true);
    }
    if (def.reward?.gems) {
      this.game.addGems(def.reward.gems);
    }
    if (def.reward?.cards) {
      if (!this.state.managers) this.state.managers = {};
      Object.entries(def.reward.cards).forEach(([id, count]) => {
        if (!this.state.managers[id]) {
          this.state.managers[id] = { level: 0, cards: 0 };
        }
        this.state.managers[id].cards = (this.state.managers[id].cards || 0) + count;
      });
    }

    const px = this.game.player ? this.game.player.x : 200;
    const py = this.game.player ? this.game.player.y : 200;
    this.game.showFloatText(px, py - 20, `🏆 ${def.title} Claimed!`, '#f1c40f');
    this.game.updateHUD();
    this.game.updateBadges();
    this.game.renderDrawerContent();
    this.game.checkCampgroundCompletion();
    this.game.saveState();
  }
}
