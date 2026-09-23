// HUDController: Top HUD Stats, Badges, Overlays, and Floating Texts
import { MANAGER_DEFS, MANAGER_PREREQS } from '../config/managers.js';

export class HUDController {
  constructor(game) {
    this.game = game;
    this.notifiedGoalIds = new Set();
    this.activeGoalToasts = new Map(); // achId -> { element, timer, ach }
  }

  get state() {
    return this.game.state;
  }

  get ui() {
    return this.game.ui;
  }

  showFloatText(worldX, worldY, text, color = '#2ecc71') {
    this.game.floatTexts.push({
      x: worldX,
      y: worldY,
      text: text,
      color: color,
      life: 1.0,
      vy: -22
    });
  }

  updateFloatTexts(dt) {
    for (let i = this.game.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.game.floatTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.game.floatTexts.splice(i, 1);
      }
    }
  }

  // --- MULTI-GOAL TOAST POPUP SYSTEM (Stacked vertically, 20s lifespan) ---
  checkAndTriggerGoalToast(ach) {
    if (this.notifiedGoalIds.has(ach.id)) return;
    this.notifiedGoalIds.add(ach.id);
    this.spawnGoalToast(ach);
  }

  spawnGoalToast(ach) {
    if (this.activeGoalToasts.has(ach.id)) return;
    if (this.state.achievements?.[ach.id]?.claimed) return;

    const container = this.ui?.goalToastsContainer || document.getElementById('goal-toasts-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'goal-toast';
    toast.dataset.achId = ach.id;
    toast.title = 'Tippen um Belohnung direkt einzulösen!';
    toast.innerHTML = `
      <div class="goal-toast-icon">${ach.icon || '🏆'}</div>
      <div class="goal-toast-body">
        <div class="goal-toast-badge">⭐ ZIEL ERREICHT!</div>
        <div class="goal-toast-title">${ach.title}</div>
        <div class="goal-toast-reward">🎁 ${ach.rewardDesc || 'Belohnung abholen!'}</div>
      </div>
      <div class="goal-toast-claim-tag">CLAIM 🎉</div>
    `;

    toast.addEventListener('click', (e) => {
      e.stopPropagation();
      this.claimGoalToast(ach.id);
    });

    container.appendChild(toast);
    window.soundFX?.playCheckin();

    // Keep popup for 20 seconds before auto-dismissing
    const timer = setTimeout(() => {
      this.dismissGoalToast(ach.id);
    }, 20000);

    this.activeGoalToasts.set(ach.id, { element: toast, timer, ach });
  }

  dismissGoalToast(achId) {
    if (!this.activeGoalToasts.has(achId)) return;
    const item = this.activeGoalToasts.get(achId);
    clearTimeout(item.timer);
    this.activeGoalToasts.delete(achId);

    item.element.classList.add('toast-leave');
    setTimeout(() => {
      item.element.remove();
    }, 220);
  }

  claimGoalToast(achId) {
    this.dismissGoalToast(achId);
    this.game.claimAchievement(achId);
  }

  claimActiveGoalToast() {
    // Fallback: claim first visible toast if any
    const firstKey = this.activeGoalToasts.keys().next().value;
    if (firstKey) {
      this.claimGoalToast(firstKey);
    }
  }

  resetGoalToasts() {
    for (const [id, item] of this.activeGoalToasts.entries()) {
      clearTimeout(item.timer);
      item.element.remove();
    }
    this.activeGoalToasts.clear();
    this.notifiedGoalIds.clear();
    const container = this.ui?.goalToastsContainer || document.getElementById('goal-toasts-container');
    if (container) container.innerHTML = '';
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
          if (prereq && !prereq.isMet(this.game)) return;
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
    const achDefs = this.game.getActiveAchievementDefs();
    achDefs.forEach(ach => {
      const claimed = this.state.achievements?.[ach.id]?.claimed;
      const curStat = ach.getStat ? ach.getStat(this.state) : 0;
      const isDone = curStat >= ach.goal;
      if (!claimed && isDone) {
        unclaimedGoals++;
        this.checkAndTriggerGoalToast(ach);
      }
    });

    // If any active toast was claimed elsewhere (e.g. in drawer), dismiss it
    for (const [achId] of this.activeGoalToasts.entries()) {
      if (this.state.achievements?.[achId]?.claimed) {
        this.dismissGoalToast(achId);
      }
    }

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
    const curGuests = this.game.getCurrentGuestsCount();
    const totCap = this.game.getTotalCapacity();

    if (this.ui?.cash) {
      this.ui.cash.textContent = `$${Math.floor(this.state.cash)}`;
      if (this.ui.cash.parentElement) {
        this.ui.cash.parentElement.classList.toggle('strike', !!this.game.staffOnStrike);
        this.ui.cash.parentElement.title = this.game.staffOnStrike ?
          '⚠️ STREIK: Zu wenig Bargeld für Gehälter! Personal pausiert!' :
          'Camp Cash (Lokales Campingplatz-Bargeld)';
      }
    }
    if (this.ui?.power) {
      this.ui.power.textContent = `${this.state.powerDemand}/${this.state.powerCapacity} kW`;
      this.ui.power.parentElement?.classList?.toggle('overload', this.state.powerDemand > this.state.powerCapacity);
    }
    if (this.ui?.water) {
      this.ui.water.textContent = `${this.state.waterDemand}/${this.state.waterCapacity} m³`;
      this.ui.water.parentElement?.classList?.toggle('overload', this.state.waterDemand > this.state.waterCapacity);
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
      this.ui.stackBadge.textContent = `🪵 ${this.game.player.carriedItems}/${this.state.rangerCapacity}`;
    }

    if (this.ui?.hudWorldInfo) {
      const w = this.state.world || 1;
      const r = this.state.region || 1;
      const c = this.state.camp || 1;
      this.ui.hudWorldInfo.textContent = `W${w} R${r}: C${c}`;
    }

    // Empire Idle Income Pill
    const totalIdleRate = this.game.getTotalOtherCampsIdleRate();
    if (this.ui?.hudEmpireIdle && this.ui?.hudIdleRate) {
      if (totalIdleRate > 0) {
        this.ui.hudEmpireIdle.style.display = 'flex';
        this.ui.hudIdleRate.textContent = `+$${totalIdleRate.toFixed(1)}/s`;
      } else {
        this.ui.hudEmpireIdle.style.display = 'none';
      }
    }

    this.game.checkCampgroundCompletion();
    this.updateBadges();
    if (this.game.isMainMenuOpen) {
      this.game.updateMainMenuContent();
    }

    // Refresh buttons if drawer is open
    if (this.ui?.upgradesDrawer?.classList.contains('open')) {
      if (this.game.activeMainTab === 'ranger') {
        this.ui.drawerContentList?.querySelectorAll('button[data-action="ranger"]').forEach(btn => {
          const id = btn.dataset.id;
          let cost = 0;
          if (id === 'ranger_speed') cost = 50 * this.state.upgrades.speedLevel;
          else if (id === 'ranger_cap') cost = 60 * this.state.upgrades.capacityLevel;
          btn.disabled = this.state.cash < cost;
        });
      } else if (this.game.activeMainTab === 'crates') {
        this.ui.drawerContentList?.querySelectorAll('button[data-action="crate"]').forEach(btn => {
          const id = btn.dataset.id;
          if (id === 'wooden') btn.disabled = this.state.cash < 80;
          else if (id === 'golden') btn.disabled = this.state.cash < 220;
          else if (id === 'mythic') btn.disabled = (this.state.gems || 0) < 100;
          else if (id === 'emperor') btn.disabled = (this.state.gems || 0) < 250;
        });
      } else if (this.game.activeMainTab === 'shop') {
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
}
