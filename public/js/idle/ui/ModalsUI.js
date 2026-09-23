// ModalsUI: Manages World Map Modal, Events Modal, and Crate Unboxing Overlay
import { WORLD_BIOMES, getCampKey, getEarthRegionDef } from '../config/worlds.js';
import { CURRENT_EVENT_DEF } from '../config/events.js';
import { MANAGER_DEFS } from '../config/managers.js';
import { CRATE_DEFS } from '../config/crates.js';

export class ModalsUI {
  constructor(game) {
    this.game = game;
  }

  get state() {
    return this.game.state;
  }

  get ui() {
    return this.game.ui;
  }

  // --- WORLD MODAL ---
  openWorldModal() {
    if (!this.ui?.worldModal) return;

    const world = this.state.world || 1;
    const region = this.state.region || 1;
    const camp = this.state.camp || 1;
    const maxWorld = this.state.maxUnlockedWorld || 1;
    const maxRegion = this.state.maxUnlockedRegion || 1;
    const maxCamp = this.state.maxUnlockedCamp || 1;
    const regDef = getEarthRegionDef(region);
    const achDefs = this.game.getActiveAchievementDefs();
    const claimedCount = achDefs.filter(a => this.state.achievements?.[a.id]?.claimed).length;
    const allDone = achDefs.length > 0 && claimedCount >= achDefs.length;

    // Total empire passive income from other camps
    const empireIdleRate = this.game.getTotalOtherCampsIdleRate();

    // Is the player currently visiting an older campsite?
    const isVisitingOlderCamp = (world < maxWorld) || (world === maxWorld && region < maxRegion) || (world === maxWorld && region === maxRegion && camp < maxCamp);

    if (this.ui.worldModalTitle) {
      this.ui.worldModalTitle.textContent = `${regDef.flag} WELT ${world}: ERDE • REGION ${region}`;
    }

    if (this.ui.worldModalInfo) {
      this.ui.worldModalInfo.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #1b4329;">
          <span>🌍 Welt ${world} (Planet Erde)</span>
          <span>📍 Region ${region} / 100</span>
        </div>
        <div style="font-size: 11px; color: #1e8449; font-weight: bold;">
          ${regDef.flag} ${regDef.name} (${regDef.country} • ${regDef.continent})
        </div>
        <div style="font-size: 11px; color: #2980b9;">
          Thema: <em>${regDef.theme}</em> • ⛺ <strong>${regDef.styleName}</strong>
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

  // --- SONDEREVENTS MODAL ---
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
      this.game.addGems(m.amount);
      this.game.showFloatText(this.game.player.x, this.game.player.y - 18, `💎 +${m.amount} Gems!`, '#3498db');
    } else if (m.type === 'crate') {
      if (!this.state.crates[m.crateId]) this.state.crates[m.crateId] = { count: 0 };
      this.state.crates[m.crateId].count = (this.state.crates[m.crateId].count || 0) + 1;
      this.game.showFloatText(this.game.player.x, this.game.player.y - 18, `📦 +1 Goldene Kiste!`, '#f39c12');
    } else if (m.type === 'vault_boost') {
      this.game.addEmpireGold(m.gold);
      this.game.buyIncomeBoost(m.boostSeconds, 2.0, 0);
      this.game.showFloatText(this.game.player.x, this.game.player.y - 18, `🏛️ +$${m.gold} Gold & ⚡ Boost!`, '#ffd700');
    } else if (m.type === 'emperor_pack') {
      if (!this.state.crates[m.crateId]) this.state.crates[m.crateId] = { count: 0 };
      this.state.crates[m.crateId].count = (this.state.crates[m.crateId].count || 0) + 1;
      this.game.addGems(m.gems);
      this.game.showFloatText(this.game.player.x, this.game.player.y - 18, `👑 Kaiser-Kiste & +${m.gems} Gems!`, '#9b59b6');
    }

    window.soundFX?.playFanfare();
    this.game.updateHUD();
    this.game.updateBadges();
    this.renderEventsModal();
    this.game.saveState();
  }

  // --- CRATE UNBOXING MODAL ---
  openCrate(crateId) {
    const def = CRATE_DEFS[crateId];
    if (!def) return;

    if (def.currency === 'gems') {
      if ((this.state.gems || 0) < def.cost) {
        this.game.showFloatText(this.game.player.x, this.game.player.y - 15, '💎 Not enough Gems!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      this.state.gems -= def.cost;
    } else if (crateId === 'free') {
      if (this.state.crates.freeTimer > 0) return;
      this.state.crates.freeTimer = def.cooldown;
    } else {
      if (this.state.cash < def.cost) {
        this.game.showFloatText(this.game.player.x, this.game.player.y - 15, '💵 Not enough Cash!', '#e74c3c');
        window.soundFX?.playThud();
        return;
      }
      this.state.cash -= def.cost;
    }

    this.game.pendingLoot = this.game.generateCrateLoot(crateId);

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

    this.game.updateHUD();
    this.game.renderDrawerContent();
    this.game.updateBadges();
    this.game.saveState();
  }

  revealCrateLoot() {
    if (!this.game.pendingLoot) return;
    window.soundFX?.playChestOpen();

    this.ui.crateBoxStage.style.display = 'none';
    this.ui.crateRewardsContainer.style.display = 'flex';
    this.ui.btnCollectLoot.style.display = 'block';

    // Build revealed card tiles
    let html = '';
    const cardEntries = Object.entries(this.game.pendingLoot.cards);
    cardEntries.forEach(([id, count]) => {
      const mDef = MANAGER_DEFS[id];
      if (!mDef) return;
      const curCards = this.state.managers[id]?.cards || 0;
      const curLvl = this.state.managers[id]?.level || 0;
      const reqCards = curLvl === 0 ? mDef.unlockCards : (mDef.levels[curLvl]?.cardsReq || 0);

      html += `
        <div class="reward-card-tile ${mDef.rarity}">
          <div style="font-size: 24px;">${mDef.icon}</div>
          <div style="font-size: 11px; font-weight: bold; color: #142819;">${mDef.name}</div>
          <div style="font-size: 13px; font-weight: 800; color: #27ae60;">+${count} Cards</div>
          <div style="font-size: 9px; color: #7f8c8d;">Total: ${curCards + count}/${reqCards}</div>
        </div>
      `;
    });

    if (this.game.pendingLoot.cash > 0) {
      html += `
        <div class="reward-card-tile common" style="grid-column: span 2; background: #e8f8f5; border-color: #27ae60;">
          <div style="font-size: 24px;">💵</div>
          <div style="font-size: 13px; font-weight: 800; color: #27ae60;">+$${this.game.pendingLoot.cash} Instant Cash!</div>
        </div>
      `;
    }

    this.ui.crateRewardsContainer.innerHTML = html;
  }

  collectPendingLoot() {
    if (!this.game.pendingLoot) return;

    // Apply cards
    Object.entries(this.game.pendingLoot.cards).forEach(([id, count]) => {
      if (!this.state.managers[id]) {
        this.state.managers[id] = { level: 0, cards: 0 };
      }
      this.state.managers[id].cards = (this.state.managers[id].cards || 0) + count;
    });

    // Apply cash
    if (this.game.pendingLoot.cash > 0) {
      this.game.addCash(this.game.pendingLoot.cash);
    }

    this.game.pendingLoot = null;
    this.ui.crateModal.style.display = 'none';
    window.soundFX?.playFanfare();

    this.game.updateHUD();
    this.game.renderDrawerContent();
    this.game.updateBadges();
    this.game.saveState();
  }
}
