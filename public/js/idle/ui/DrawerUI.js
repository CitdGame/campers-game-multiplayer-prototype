// DrawerUI: Manages 16-Bit Retro Bottom Drawer Content (Managers, Upgrades, Crates, Shop, Goals)
import { MANAGER_DEFS, MANAGER_PREREQS, getManagerWage, getTotalStaffWage } from '../config/managers.js';
import { CRATE_DEFS } from '../config/crates.js';
import { FRANCHISE_UPGRADE_DEFS } from '../config/franchise.js';
import { WORLD_BIOMES, getCampKey, getCampSizeInfo, getEarthRegionDef } from '../config/worlds.js';

export class DrawerUI {
  constructor(game) {
    this.game = game;
  }

  get state() { return this.game.state; }
  get ui() { return this.game.ui; }
  get activeMainTab() { return this.game.activeMainTab; }
  set activeMainTab(v) { this.game.activeMainTab = v; }
  get activeManagerFilter() { return this.game.activeManagerFilter; }
  set activeManagerFilter(v) { this.game.activeManagerFilter = v; }
  get completedPads() { return this.game.completedPads; }
  get hasWaterPump() { return this.game.hasWaterPump; }
  get hasGenerator() { return this.game.hasGenerator; }
  get hasKiosk() { return this.game.hasKiosk; }
  get hasSportsField() { return this.game.hasSportsField; }
  get pitches() { return this.game.pitches; }
  get currentBiome() { return this.game.currentBiome; }

  getActiveAchievementDefs() { return this.game.getActiveAchievementDefs(); }
  getCurrentCampData() { return this.game.getCurrentCampData(); }
  getCurrentCampActiveRate() { return this.game.getCurrentCampActiveRate(); }
  getTotalOtherCampsIdleRate() { return this.game.getTotalOtherCampsIdleRate(); }
  activateOrUpgradeManager(id) { return this.game.activateOrUpgradeManager(id); }
  buyFranchiseUpgrade(id) { return this.game.buyFranchiseUpgrade(id); }
  buyTimeSkip(sec, cost, label) { return this.game.buyTimeSkip(sec, cost, label); }
  buyIncomeBoost(dur, mult, cost) { return this.game.buyIncomeBoost(dur, mult, cost); }
  buyIAPGems(amt, price, tier) { return this.game.buyIAPGems(amt, price, tier); }
  openCrate(id) { return this.game.openCrate(id); }
  claimAchievement(id) { return this.game.claimAchievement(id); }
  showFloatText(...args) { return this.game.showFloatText(...args); }
  updateHUD() { return this.game.updateHUD(); }
  updateBadges() { return this.game.updateBadges(); }
  saveState() { return this.game.saveState(); }
  switchCamp(...args) { return this.game.switchCamp(...args); }
  advanceToNextCamp(...args) { return this.game.advanceToNextCamp(...args); }
  resetGame(...args) { return this.game.resetGame(...args); }

  render(resetScroll = false) {
    return this.renderDrawerContent(resetScroll);
  }

  renderDrawerContent(resetScroll = false) {
    if (!this.ui.drawerContentList) return;
    const prevScroll = resetScroll ? 0 : (this.ui.drawerContentList.scrollTop || 0);

    if (this.activeMainTab === 'managers') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'flex';
      let html = '';

      const totalWages = getTotalStaffWage(this.state.managers);
      const isOnStrike = !!this.game.staffOnStrike;

      html += `
        <div class="payroll-overview-bar ${isOnStrike ? 'strike' : ''}">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 16px;">💼</span>
            <div>
              <div>Lohnkosten: <strong style="color: ${isOnStrike ? '#c0392b' : '#27ae60'};">$${totalWages}/s</strong></div>
              <div style="font-size: 9px; color: #7f8c8d; font-weight: normal;">Alle 5s fällig (-$${Math.round(totalWages * 5)})</div>
            </div>
          </div>
          <span style="font-size: 10px; font-weight: bold; color: ${isOnStrike ? '#c0392b' : '#1e8449'};">
            ${isOnStrike ? '⚠️ STREIK (Kein Geld!)' : (totalWages > 0 ? '✅ Löhne bezahlt' : 'Kein Personal')}
          </span>
        </div>
      `;

      const list = Object.values(MANAGER_DEFS).filter(def => {
        if (this.activeManagerFilter === 'all') return true;
        return def.category === this.activeManagerFilter;
      });

      list.forEach(def => {
        const stateObj = this.state.managers[def.id] || { level: 0, cards: 0 };
        const curLvl = stateObj.level;
        const curCards = stateObj.cards || 0;
        const isMax = curLvl >= def.maxLevel;

        const curWage = getManagerWage(def.id, curLvl);
        const nextWage = !isMax ? getManagerWage(def.id, curLvl + 1) : curWage;
        const wageDiff = Math.round((nextWage - curWage) * 10) / 10;

        let reqCards = 0;
        let cost = 0;
        let currentPerk = 'Status: Inaktiv (Gesperrt)';
        let nextPerk = 'Maximales Level erreicht';

        if (curLvl > 0) {
          currentPerk = `Aktiv: ${def.levels[curLvl - 1].desc}`;
        }

        if (!isMax) {
          if (curLvl === 0) {
            reqCards = def.unlockCards;
            cost = def.levels[0].cost;
            nextPerk = `Freischalten: ${def.levels[0].desc}`;
          } else {
            const nextLvlConfig = def.levels[curLvl];
            reqCards = nextLvlConfig.cardsReq;
            cost = nextLvlConfig.cost;
            nextPerk = `Nächstes: ${nextLvlConfig.desc}`;
          }
        }

        // Card progress bar
        let cardMeterHtml = '';
        if (isMax) {
          cardMeterHtml = `
            <div class="card-meter-bar">
              <div class="card-meter-fill ready" style="width: 100%;"></div>
              <div class="card-meter-text">⭐ FULL POWER</div>
            </div>
          `;
        } else {
          const pct = reqCards > 0 ? Math.min(100, Math.round((curCards / reqCards) * 100)) : 0;
          const isReady = reqCards > 0 && curCards >= reqCards;
          cardMeterHtml = `
            <div class="card-meter-bar">
              <div class="card-meter-fill ${isReady ? 'ready' : ''}" style="width: ${pct}%;"></div>
              <div class="card-meter-text">${curCards} / ${reqCards} Cards</div>
            </div>
          `;
        }

        // Check prerequisite
        const prereq = MANAGER_PREREQS[def.id];
        const prereqMet = !prereq || prereq.isMet(this);

        // Action button
        let actionBtnHtml = '';
        if (isMax) {
          actionBtnHtml = `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`;
        } else if (curLvl === 0) {
          if (!prereqMet) {
            actionBtnHtml = `<button class="btn-manager-action locked" disabled>🔒 Gesperrt</button>`;
          } else {
            const hasCards = curCards >= reqCards;
            const hasCash = this.state.cash >= cost;
            if (hasCards && hasCash) {
              actionBtnHtml = `<button class="btn-manager-action activate ready-pulse" data-action="manager" data-id="${def.id}">Einstellen ($${cost})</button>`;
            } else if (!hasCards) {
              actionBtnHtml = `<button class="btn-manager-action need-cards" disabled>${curCards}/${reqCards} Cards</button>`;
            } else {
              actionBtnHtml = `<button class="btn-manager-action activate" disabled>Einstellen ($${cost})</button>`;
            }
          }
        } else {
          const hasCards = curCards >= reqCards;
          const hasCash = this.state.cash >= cost;
          if (hasCards && hasCash) {
            actionBtnHtml = `<button class="btn-manager-action ready-pulse" data-action="manager" data-id="${def.id}">Lvl ${curLvl + 1} ($${cost})</button>`;
          } else if (!hasCards) {
            actionBtnHtml = `<button class="btn-manager-action need-cards" disabled>${curCards}/${reqCards} Cards</button>`;
          } else {
            actionBtnHtml = `<button class="btn-manager-action" disabled>Lvl ${curLvl + 1} ($${cost})</button>`;
          }
        }

        // Level badge
        let lvlBadgeHtml = '';
        if (curLvl === 0) {
          lvlBadgeHtml = `<span class="lvl-badge locked">${prereqMet ? 'Gesperrt' : '🔒 Gesperrt'}</span>`;
        } else if (isMax) {
          lvlBadgeHtml = `<span class="lvl-badge max">⭐ MAX</span>`;
        } else {
          lvlBadgeHtml = `<span class="lvl-badge active">Lvl ${curLvl}/${def.maxLevel}</span>`;
        }

        let prereqNotice = '';
        if (curLvl === 0 && !prereqMet && prereq) {
          prereqNotice = `<div class="manager-lock-req">🔒 Voraussetzung: ${prereq.label}</div>`;
        }

        html += `
          <div class="manager-card rarity-${def.rarity}">
            <div class="manager-top-row">
              <div class="manager-identity">
                <div class="manager-avatar">${def.icon}</div>
                <div class="manager-name-col">
                  <div class="manager-title">${def.name}</div>
                  <div class="manager-role">${def.roleName}</div>
                </div>
              </div>
              <div style="display: flex; gap: 4px; align-items: center;">
                <span class="rarity-pill ${def.rarity}">${def.rarity}</span>
                ${lvlBadgeHtml}
              </div>
            </div>

            ${cardMeterHtml}

            <div class="manager-salary-row">
              <span class="salary-tag">🧾 Gehalt: <strong>$${curWage}/s</strong></span>
              ${!isMax ? `<span class="salary-next">→ Lvl ${curLvl + 1}: <strong>$${nextWage}/s</strong> (+ $${wageDiff}/s)</span>` : '<span style="color:#27ae60; font-weight:bold;">⭐ Max. Gehalt</span>'}
            </div>

            <div class="manager-perks-row">${currentPerk}</div>
            <div class="manager-next-perk">${nextPerk}</div>
            ${prereqNotice}

            <div class="manager-action-row">
              <span style="font-size: 10px; color: #7f8c8d;">${def.desc}</span>
              ${actionBtnHtml}
            </div>
          </div>
        `;
      });

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'crates') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      const freeReady = this.state.crates.freeTimer <= 0;
      const freeTimerSec = Math.ceil(this.state.crates.freeTimer);

      let html = `
        <div style="font-size: 12px; color: #1b4329; font-weight: bold; margin-bottom: 4px;">
          📦 SUPPLY CRATES & LOOT BOXES
        </div>
        <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
          Open supply crates to unbox Manager Cards and cash drops!
        </div>

        <!-- Free Crate -->
        <div class="crate-card">
          <div class="crate-icon-box">🎁</div>
          <div class="crate-details">
            <div class="crate-name">Free Supply Crate</div>
            <div class="crate-desc">${CRATE_DEFS.free.desc}</div>
            ${freeReady
              ? `<div class="crate-timer-badge" style="color: #27ae60;">✨ READY TO UNBOX!</div>`
              : `<div class="crate-timer-badge">⏱️ Free in ${freeTimerSec}s</div>`
            }
          </div>
          ${freeReady
            ? `<button class="btn-crate-buy free-claim" data-action="crate" data-id="free">CLAIM FREE! 🎁</button>`
            : `<button class="btn-crate-buy" disabled>⏱️ ${freeTimerSec}s</button>`
          }
        </div>

        <!-- Wooden Crate -->
        <div class="crate-card">
          <div class="crate-icon-box">📦</div>
          <div class="crate-details">
            <div class="crate-name">Wooden Supply Crate</div>
            <div class="crate-desc">${CRATE_DEFS.wooden.desc}</div>
            <div style="font-size: 11px; font-weight: bold; color: #27ae60;">Cost: $80</div>
          </div>
          <button class="btn-crate-buy" ${this.state.cash >= 80 ? '' : 'disabled'} data-action="crate" data-id="wooden">
            Open ($80)
          </button>
        </div>

        <!-- Golden Crate -->
        <div class="crate-card">
          <div class="crate-icon-box">👑</div>
          <div class="crate-details">
            <div class="crate-name">Golden Resort Crate</div>
            <div class="crate-desc">${CRATE_DEFS.golden.desc}</div>
            <div style="font-size: 11px; font-weight: bold; color: #f39c12;">Cost: $220 • Guaranteed Epic!</div>
          </div>
          <button class="btn-crate-buy" ${this.state.cash >= 220 ? '' : 'disabled'} data-action="crate" data-id="golden" style="background: #f39c12;">
            Open ($220)
          </button>
        </div>

        <!-- Mythic Crate -->
        <div class="crate-card" style="border-left: 6px solid #2980b9;">
          <div class="crate-icon-box">🔮</div>
          <div class="crate-details">
            <div class="crate-name">Mythic Supply Crate</div>
            <div class="crate-desc">${CRATE_DEFS.mythic.desc}</div>
            <div style="font-size: 11px; font-weight: bold; color: #2980b9;">Cost: 100 💎 Gems • 2+ Epics!</div>
          </div>
          <button class="btn-crate-buy" ${(this.state.gems || 0) >= 100 ? '' : 'disabled'} data-action="crate" data-id="mythic" style="background: linear-gradient(135deg, #3498db, #2980b9);">
            Open (100 💎)
          </button>
        </div>

        <!-- Emperor Vault -->
        <div class="crate-card" style="border-left: 6px solid #f39c12;">
          <div class="crate-icon-box">👑</div>
          <div class="crate-details">
            <div class="crate-name">Emperor Vault</div>
            <div class="crate-desc">${CRATE_DEFS.emperor.desc}</div>
            <div style="font-size: 11px; font-weight: bold; color: #d4ac0d;">Cost: 250 💎 Gems • 6+ Epics Jackpot!</div>
          </div>
          <button class="btn-crate-buy" ${(this.state.gems || 0) >= 250 ? '' : 'disabled'} data-action="crate" data-id="emperor" style="background: linear-gradient(135deg, #f1c40f, #d4ac0d); color: #142819;">
            Open (250 💎)
          </button>
        </div>
      `;

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'shop') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      const curGems = this.state.gems || 0;
      const boostActive = (this.state.boostTimer || 0) > 0;
      const boostSec = Math.ceil(this.state.boostTimer || 0);
      const bHrs = Math.floor(boostSec / 3600);
      const bMins = Math.floor((boostSec % 3600) / 60);
      const bSecs = boostSec % 60;
      const boostTimeStr = `${bHrs > 0 ? bHrs + 'h ' : ''}${bMins}m ${bSecs < 10 ? '0' : ''}${bSecs}s`;

      const activeRate = Math.max(3.0, this.getCurrentCampActiveRate());
      const empireRate = this.getTotalOtherCampsIdleRate();
      const effMult = boostActive ? (this.state.boostMultiplier || 2.0) : 1.0;
      const totalSecRate = (activeRate + empireRate) * effMult;

      const warp1hVal = Math.round(totalSecRate * 3600);
      const warp4hVal = Math.round(totalSecRate * 14400);
      const warp24hVal = Math.round(totalSecRate * 86400);

      let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div>
            <div style="font-size: 13px; color: #1b4f72; font-weight: bold;">
              💎 GEM VAULT & RESORT STORE
            </div>
            <div style="font-size: 11px; color: #666;">
              Acquire Gems via Achievements & Store to unlock game-changing Power-Ups!
            </div>
          </div>
          <div class="hud-pill gems" style="font-size: 14px; padding: 4px 8px;">
            💎 <strong>${curGems.toLocaleString()}</strong>
          </div>
        </div>

        <!-- SECTION 1: POWER-UPS & TIME WARPS -->
        <div class="shop-section-title">
          <span>⚡</span> POWER-UPS & TIME WARPS
        </div>

        <!-- 1h Time Warp -->
        <div class="shop-item-card warp">
          <div class="shop-item-info">
            <div class="shop-item-icon">⏱️</div>
            <div class="shop-item-text">
              <div class="shop-item-name">1-Hour Time Warp</div>
              <div class="shop-item-desc">Instantly warp forward 1 hour of active + empire campsite revenue!</div>
              <div class="shop-item-tag">Payout: +$${warp1hVal.toLocaleString()} Cash</div>
            </div>
          </div>
          <button class="btn-shop-buy warp" ${curGems >= 30 ? '' : 'disabled'} data-action="buy_timeskip" data-seconds="3600" data-cost="30" data-label="1h Warp">
            💎 30
          </button>
        </div>

        <!-- 4h Time Warp -->
        <div class="shop-item-card warp">
          <div class="shop-item-info">
            <div class="shop-item-icon">⏳</div>
            <div class="shop-item-text">
              <div class="shop-item-name">4-Hour Time Warp</div>
              <div class="shop-item-desc">Warps 4 hours of total production into your vault right now!</div>
              <div class="shop-item-tag">Payout: +$${warp4hVal.toLocaleString()} Cash</div>
            </div>
          </div>
          <button class="btn-shop-buy warp" ${curGems >= 80 ? '' : 'disabled'} data-action="buy_timeskip" data-seconds="14400" data-cost="80" data-label="4h Warp">
            💎 80
          </button>
        </div>

        <!-- 24h Mega Warp -->
        <div class="shop-item-card warp">
          <div class="shop-item-info">
            <div class="shop-item-icon">🌌</div>
            <div class="shop-item-text">
              <div class="shop-item-name">24-Hour Mega Warp</div>
              <div class="shop-item-desc">One full day of automated multi-campsite revenue in a single flash!</div>
              <div class="shop-item-tag">Payout: +$${warp24hVal.toLocaleString()} Cash</div>
            </div>
          </div>
          <button class="btn-shop-buy warp" ${curGems >= 250 ? '' : 'disabled'} data-action="buy_timeskip" data-seconds="86400" data-cost="250" data-label="24h Mega Warp">
            💎 250
          </button>
        </div>

        <!-- 2x Income Boost (2 Hours) -->
        <div class="shop-item-card boost">
          <div class="shop-item-info">
            <div class="shop-item-icon">⚡</div>
            <div class="shop-item-text">
              <div class="shop-item-name">2x Revenue Boost (2 Hours)</div>
              <div class="shop-item-desc">Doubles all checkouts, trash tips, kiosk sales & empire income!</div>
              <div class="shop-item-tag">${boostActive ? `Active: ${boostTimeStr} remaining` : '+100% Profit for 2 Hours'}</div>
            </div>
          </div>
          <button class="btn-shop-buy boost" ${curGems >= 50 ? '' : 'disabled'} data-action="buy_boost" data-duration="7200" data-multiplier="2.0" data-cost="50">
            💎 50
          </button>
        </div>

        <!-- 3x Super Boost (4 Hours) -->
        <div class="shop-item-card boost">
          <div class="shop-item-info">
            <div class="shop-item-icon">🚀</div>
            <div class="shop-item-text">
              <div class="shop-item-name">3x Super Boost (4 Hours)</div>
              <div class="shop-item-desc">Triples all campsite income and empire passive streams!</div>
              <div class="shop-item-tag">+200% Profit for 4 Hours</div>
            </div>
          </div>
          <button class="btn-shop-buy boost" ${curGems >= 120 ? '' : 'disabled'} data-action="buy_boost" data-duration="14400" data-multiplier="3.0" data-cost="120">
            💎 120
          </button>
        </div>

        <!-- SECTION 2: SPECIAL GEM CRATES -->
        <div class="shop-section-title">
          <span>🔮</span> SPECIAL GEM CRATES
        </div>

        <!-- Mythic Supply Crate -->
        <div class="shop-item-card crate-mythic">
          <div class="shop-item-info">
            <div class="shop-item-icon">🔮</div>
            <div class="shop-item-text">
              <div class="shop-item-name">${CRATE_DEFS.mythic.name}</div>
              <div class="shop-item-desc">${CRATE_DEFS.mythic.desc}</div>
              <div class="shop-item-tag" style="color: #2980b9;">Guaranteed 2+ Epics & 4+ Rares</div>
            </div>
          </div>
          <button class="btn-shop-buy warp" ${curGems >= 100 ? '' : 'disabled'} data-action="crate" data-id="mythic">
            💎 100
          </button>
        </div>

        <!-- Emperor Vault -->
        <div class="shop-item-card crate-emperor">
          <div class="shop-item-info">
            <div class="shop-item-icon">👑</div>
            <div class="shop-item-text">
              <div class="shop-item-name">${CRATE_DEFS.emperor.name}</div>
              <div class="shop-item-desc">${CRATE_DEFS.emperor.desc}</div>
              <div class="shop-item-tag" style="color: #d4ac0d;">Guaranteed 6+ Epics & 10+ Rares + Mega Jackpot</div>
            </div>
          </div>
          <button class="btn-shop-buy gold" ${curGems >= 250 ? '' : 'disabled'} data-action="crate" data-id="emperor">
            💎 250
          </button>
        </div>

        <!-- SECTION 3: IN-APP PURCHASES (GEM STORE) -->
        <div class="shop-section-title">
          <span>💎</span> GEM STORE (IN-APP PURCHASES)
        </div>

        <!-- Tier 1 -->
        <div class="shop-item-card iap">
          <div class="shop-item-info">
            <div class="shop-item-icon">💎</div>
            <div class="shop-item-text">
              <div class="shop-item-name">Pouch of Gems</div>
              <div class="shop-item-desc">A handy satchel of shiny gems for immediate power-ups.</div>
              <div class="shop-item-tag" style="color: #27ae60;">+80 Gems</div>
            </div>
          </div>
          <button class="btn-shop-buy iap" data-action="buy_iap" data-gems="80" data-price="$0.99" data-tier="Pouch of Gems">
            $0.99
          </button>
        </div>

        <!-- Tier 2 -->
        <div class="shop-item-card iap">
          <div class="shop-item-info">
            <div class="shop-item-icon">💰</div>
            <div class="shop-item-text">
              <div class="shop-item-name">Sack of Gems <span style="color: #e67e22; font-size: 10px;">(+10% BONUS)</span></div>
              <div class="shop-item-desc">Great value pack to supercharge multiple campsite upgrades.</div>
              <div class="shop-item-tag" style="color: #27ae60;">+500 Gems</div>
            </div>
          </div>
          <button class="btn-shop-buy iap" data-action="buy_iap" data-gems="500" data-price="$4.99" data-tier="Sack of Gems">
            $4.99
          </button>
        </div>

        <!-- Tier 3 -->
        <div class="shop-item-card iap">
          <div class="shop-item-info">
            <div class="shop-item-icon">💎</div>
            <div class="shop-item-text">
              <div class="shop-item-name">Chest of Gems <span style="color: #e67e22; font-size: 10px;">(+25% BONUS)</span></div>
              <div class="shop-item-desc">Popular resort tycoon choice! Unlock Emperor Vaults with ease.</div>
              <div class="shop-item-tag" style="color: #27ae60;">+1,400 Gems</div>
            </div>
          </div>
          <button class="btn-shop-buy iap" data-action="buy_iap" data-gems="1400" data-price="$9.99" data-tier="Chest of Gems">
            $9.99
          </button>
        </div>

        <!-- Tier 4 -->
        <div class="shop-item-card iap">
          <div class="shop-item-info">
            <div class="shop-item-icon">👑</div>
            <div class="shop-item-text">
              <div class="shop-item-name">Mountain Vault <span style="color: #e67e22; font-size: 10px;">(+50% BEST VALUE)</span></div>
              <div class="shop-item-desc">Ultimate treasury! Enough gems to rule all regions across the globe.</div>
              <div class="shop-item-tag" style="color: #27ae60;">+3,600 Gems</div>
            </div>
          </div>
          <button class="btn-shop-buy iap" data-action="buy_iap" data-gems="3600" data-price="$19.99" data-tier="Mountain Vault">
            $19.99
          </button>
        </div>
      `;

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'goals') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      const achDefs = this.getActiveAchievementDefs();
      const allDone = achDefs.length > 0 && achDefs.every(a => this.state.achievements?.[a.id]?.claimed);
      const curSizeInfo = getCampSizeInfo(this.state.camp || 1);

      const regDef = getEarthRegionDef(this.state.region || 1);

      let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="font-size: 12px; color: #8e44ad; font-weight: bold;">
            🏆 CAMP ${this.state.camp || 1}: ${curSizeInfo.name}
          </div>
          <div style="font-size: 10px; color: #16a085; font-weight: bold;">
            ${regDef.flag} ${regDef.name}
          </div>
        </div>
        <div style="font-size: 10px; color: #2c3e50; margin-bottom: 4px;">
          🏷️ <strong>${curSizeInfo.tier}</strong> • 📐 ${curSizeInfo.size} (${curSizeInfo.pitches} Pitches Max) • ⛺ <em>${regDef.styleName}</em>
        </div>
        <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
          ${allDone ? '🎉 ALL ACHIEVEMENTS CLAIMED! Next campsite is unlocked!' : 'Claim all achievements to unlock the next bigger and more lucrative campsite!'}
        </div>
      `;

      if (allDone) {
        html += `
          <div style="background: #e8f8f5; border: 2px solid #27ae60; border-radius: 8px; padding: 10px; margin-bottom: 10px; text-align: center;">
            <div style="font-size: 13px; font-weight: bold; color: #1e8449; margin-bottom: 4px;">🌟 CAMPGROUND MASTERED!</div>
            <div style="font-size: 11px; color: #555; margin-bottom: 8px;">A new destination in this region is ready for your team.</div>
            <button class="btn-advance-camp" data-action="advance_camp">🚀 PACK UP & ADVANCE TO NEXT RESORT!</button>
          </div>
        `;
      }

      achDefs.forEach(ach => {
        const curStat = ach.getStat ? ach.getStat(this.state) : 0;
        const claimed = !!this.state.achievements?.[ach.id]?.claimed;
        const isDone = curStat >= ach.goal;
        const pct = Math.min(100, Math.round((curStat / ach.goal) * 100));

        let actionHtml = '';
        if (claimed) {
          actionHtml = `<span class="ach-status-label" style="color: #27ae60;">✓ Claimed</span>`;
        } else if (isDone) {
          actionHtml = `<button class="btn-claim-ach" data-action="goal" data-id="${ach.id}">CLAIM! 🎉</button>`;
        } else {
          actionHtml = `<span class="ach-status-label">${curStat} / ${ach.goal}</span>`;
        }

        html += `
          <div class="achievement-item ${claimed ? 'claimed' : ''}">
            <div class="ach-info">
              <div class="ach-header">
                <span>${ach.icon}</span>
                <span>${ach.title}</span>
              </div>
              <div class="ach-desc">${ach.desc}</div>
              <div class="ach-reward-tag">🎁 Reward: ${ach.rewardDesc}</div>
              <div class="ach-progress-bar">
                <div class="ach-progress-fill ${isDone ? 'done' : ''}" style="width: ${pct}%;"></div>
              </div>
            </div>
            ${actionHtml}
          </div>
        `;
      });

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'world') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      const world = this.state.world || 1;
      const region = this.state.region || 1;
      const camp = this.state.camp || 1;
      const maxWorld = this.state.maxUnlockedWorld || 1;
      const maxRegion = this.state.maxUnlockedRegion || 1;
      const maxCamp = this.state.maxUnlockedCamp || 1;
      const biome = this.currentBiome || WORLD_BIOMES[0];
      const achDefs = this.getActiveAchievementDefs();
      const claimedCount = achDefs.filter(a => this.state.achievements?.[a.id]?.claimed).length;
      const canAdvance = achDefs.length > 0 && claimedCount >= achDefs.length;
      const empireIdleRate = this.getTotalOtherCampsIdleRate();
      const isVisitingOlderCamp = (world < maxWorld) || (world === maxWorld && region < maxRegion) || (world === maxWorld && region === maxRegion && camp < maxCamp);
      const curSizeInfo = getCampSizeInfo(camp);

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

      let listHtml = '';
      for (let c = 1; c <= 10; c++) {
        const isUnlocked = (world < maxWorld) ||
                           (world === maxWorld && region < maxRegion) ||
                           (world === maxWorld && region === maxRegion && c <= maxCamp);
        const isCur = (c === camp);
        const cKey = getCampKey(world, region, c);
        const cData = this.state.camps?.[cKey];
        const isCleared = c < maxCamp || (cData && cData.idleRate > 0);
        const cSize = getCampSizeInfo(c);

        const mgrCount = isCur
          ? Object.values(this.state.managers || {}).filter(m => m.level > 0).length
          : (cData ? Object.values(cData.managers || {}).filter(m => m.level > 0).length : 0);

        const idleVal = isCur ? 0 : (cData?.idleRate || 0);

        listHtml += `
          <div class="camp-item-card ${isCur ? 'active-resort' : ''}">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <div style="font-weight: bold; font-size: 12px; color: #1b4329;">
                ${isCur ? '🏕️' : isCleared ? '✅' : isUnlocked ? '🔓' : '🔒'} Camp #${c}: ${cSize.name}
                ${isCur ? '<span style="color: #27ae60; font-size: 10px; margin-left: 4px;">(ACTIVE)</span>' : ''}
              </div>
              <div style="font-size: 10px; color: #7f8c8d;">
                🏷️ ${cSize.tier} • 📐 ${cSize.size} (${cSize.pitches} Pitches Max)
              </div>
              <div style="font-size: 10px; color: #666;">
                ${mgrCount > 0 ? `👔 ${mgrCount} Managers` : 'No staff yet'} • ${idleVal > 0 ? `<strong style="color: #b7950b;">+$${idleVal}/s Idle</strong>` : isCur ? 'Active Level' : 'Unexplored'}
              </div>
            </div>
            <div>
              ${isCur ? `
                <button class="btn-camp-visit current" disabled>Current</button>
              ` : isUnlocked ? `
                <button class="btn-camp-visit" data-action="visit_camp" data-camp="${c}" data-region="${region}" data-world="${world}">
                  Visit ✈️
                </button>
              ` : `
                <span style="font-size: 10px; color: #999;">Locked 🔒</span>
              `}
            </div>
          </div>
        `;
      }

      let html = `
        <div style="font-size: 12px; color: #1b4f72; font-weight: bold; margin-bottom: 4px;">
          🗺️ GLOBAL RESORT EXPEDITION
        </div>
        <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
          Each Region has 10 Campsites. Previous campsites continue idling in the background!
        </div>

        <div class="world-stat-box">
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; color: #1b4329;">
            <span>🌍 WORLD ${world} / 100</span>
            <span>📍 REGION ${region} / 100</span>
          </div>
          <div style="font-size: 11px; color: #2980b9;">
            Biome: <strong>${biome.name}</strong> (${biome.theme})
          </div>
          <div style="font-size: 11px; color: #555;">
            Current Resort: <strong>${curSizeInfo.name} (Camp #${camp})</strong> • 📐 ${curSizeInfo.size} (${curSizeInfo.tier})
            ${isVisitingOlderCamp ? ' <span style="color: #e67e22; font-weight: bold;">(Visiting Older Resort)</span>' : ''}
          </div>
          <div style="font-size: 11px; color: #27ae60; font-weight: bold;">
            Resort Objectives: ${claimedCount}/${achDefs.length} Claimed
          </div>
          <div style="font-size: 11px; color: #b7950b; font-weight: bold; margin-top: 2px;">
            ⚡ Empire Idle Revenue: +$${empireIdleRate.toFixed(1)}/sec
          </div>
        </div>

        <div class="world-stat-box" style="margin-top: 8px;">
          <div style="font-size: 11px; font-weight: bold; color: #1b4329; margin-bottom: 4px;">REGION CAMPSITES (10 STAGES)</div>
          <div class="world-level-grid">
            ${gridHtml}
          </div>
        </div>

        <div class="world-stat-box" style="margin-top: 8px;">
          <div style="font-size: 11px; font-weight: bold; color: #1b4329; margin-bottom: 4px;">AUTOMATED RESORTS & IDLE VISITS</div>
          <div style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
            ${listHtml}
          </div>
        </div>

        <div style="margin-top: 10px;">
          ${isVisitingOlderCamp ? `
            <button class="btn-advance-camp" data-action="return_highest_camp" style="background: linear-gradient(135deg, #3498db, #2980b9); margin-bottom: 8px;">
              🏕️ RETURN TO FRONTIER RESORT (Camp #${maxCamp})
            </button>
          ` : canAdvance ? `
            <button class="btn-advance-camp" data-action="advance_camp">
              🚀 PACK UP & ADVANCE TO NEXT RESORT!
            </button>
          ` : `
            <div style="text-align: center; font-size: 11px; color: #7f8c8d; padding: 6px;">
              🔒 Complete all ${achDefs.length} achievements in the Goals tab to unlock the next resort!
            </div>
          `}
        </div>
      `;

      this.ui.drawerContentList.innerHTML = html;

    } else if (this.activeMainTab === 'franchise' || this.activeMainTab === 'ranger') {
      if (this.ui.managerSubTabs) this.ui.managerSubTabs.style.display = 'none';

      if (!this.state.franchiseUpgrades) {
        this.state.franchiseUpgrades = {
          speedLevel: this.state.upgrades?.speedLevel || 1,
          capacityLevel: this.state.upgrades?.capacityLevel || 1,
          globalIncomeLevel: 0,
          seedCapitalLevel: 0,
          staffSpeedLevel: 0
        };
      }
      const upg = this.state.franchiseUpgrades;
      const vaultGold = Math.floor(this.state.empireGold || 0);

      // Upgrade 1: Ranger Speed
      const spdLvl = upg.speedLevel || 1;
      const spdCost = Math.round(40 * Math.pow(1.65, spdLvl - 1));
      const spdMax = spdLvl >= 10;

      // Upgrade 2: Ranger Cargo Capacity
      const capLvl = upg.capacityLevel || 1;
      const capCost = Math.round(50 * Math.pow(1.70, capLvl - 1));
      const capMax = capLvl >= 10;

      // Upgrade 3: Fast Investor (Deposit Speed)
      const investLvl = upg.investSpeedLevel || 1;
      const investCost = Math.round(45 * Math.pow(1.65, investLvl - 1));
      const investMax = investLvl >= 10;

      // Upgrade 4: Global Franchise Multiplier
      const incLvl = upg.globalIncomeLevel || 0;
      const incCost = Math.round(80 * Math.pow(1.85, incLvl));
      const incMax = incLvl >= 10;

      // Upgrade 5: Seed Capital
      const seedLvl = upg.seedCapitalLevel || 0;
      const seedCost = Math.round(60 * Math.pow(1.75, seedLvl));
      const seedMax = seedLvl >= 10;

      // Upgrade 6: Staff Cleaner Logistics
      const staffLvl = upg.staffSpeedLevel || 0;
      const staffCost = Math.round(55 * Math.pow(1.75, staffLvl));
      const staffMax = staffLvl >= 10;

      const html = `
        <div style="background: linear-gradient(135deg, #fef9e7, #fcf3cf); border: 2px solid #b7950b; border-radius: 8px; padding: 10px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: bold; color: #7d6608;">🏛️ EMPIRE VAULT TREASURY</div>
              <div style="font-size: 10px; color: #7f8c8d;">Accumulated passive revenue from automated resorts worldwide</div>
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #b7950b;">
              $${vaultGold.toLocaleString()}
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: #1b4329; font-weight: bold; margin-bottom: 4px;">
          ⭐ WORLDWIDE FRANCHISE & RANGER UPGRADES
        </div>
        <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
          These upgrades are permanent and apply across all 100 Regions & 10 Campsites!
        </div>

        <!-- 1. Ranger Speed -->
        <div class="manager-card rarity-rare">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">👟</div>
              <div class="manager-name-col">
                <div class="manager-title">Ranger Sprint</div>
                <div class="manager-role">Movement Speed (Global)</div>
              </div>
            </div>
            <span class="lvl-badge ${spdMax ? 'max' : 'active'}">Lvl ${spdLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Speed: ${this.state.rangerSpeed} px/s</div>
          <div class="manager-next-perk">${spdMax ? '⭐ MAX Level reached' : `Next: +16 px/s (${this.state.rangerSpeed + 16} px/s)`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Walk faster everywhere</span>
            ${spdMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= spdCost ? 'ready-pulse' : ''}" ${vaultGold >= spdCost ? '' : 'disabled'} data-action="franchise" data-id="ranger_speed">Upgrade ($${spdCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 2. Ranger Backpack Capacity -->
        <div class="manager-card rarity-rare">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">🎒</div>
              <div class="manager-name-col">
                <div class="manager-title">Backpack Cargo</div>
                <div class="manager-role">Firewood Capacity (Global)</div>
              </div>
            </div>
            <span class="lvl-badge ${capMax ? 'max' : 'active'}">Lvl ${capLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Cargo: ${this.state.rangerCapacity} Firewood Slots</div>
          <div class="manager-next-perk">${capMax ? '⭐ MAX Level reached' : `Next: +2 Cargo Slots (${this.state.rangerCapacity + 2} Slots)`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Carry more wood at once</span>
            ${capMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= capCost ? 'ready-pulse' : ''}" ${vaultGold >= capCost ? '' : 'disabled'} data-action="franchise" data-id="ranger_cap">Upgrade ($${capCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 3. Fast Investor (Build Spending Speed) -->
        <div class="manager-card rarity-rare">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">💸</div>
              <div class="manager-name-col">
                <div class="manager-title">Fast Investor</div>
                <div class="manager-role">Build Spending Speed (+50% / lvl)</div>
              </div>
            </div>
            <span class="lvl-badge ${investMax ? 'max' : 'active'}">Lvl ${investLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Base Rate: $${Math.round(110 * (1 + (investLvl - 1) * 0.5))}/s (×${(1 + (investLvl - 1) * 0.5).toFixed(1)})</div>
          <div class="manager-next-perk">${investMax ? '⭐ MAX Level reached' : `Next: $${Math.round(110 * (1 + investLvl * 0.5))}/s (+50% faster construction transfer)`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Pour cash faster into build pads</span>
            ${investMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= investCost ? 'ready-pulse' : ''}" ${vaultGold >= investCost ? '' : 'disabled'} data-action="franchise" data-id="invest_speed">Upgrade ($${investCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 4. Global Franchise Multiplier -->
        <div class="manager-card rarity-epic">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">📈</div>
              <div class="manager-name-col">
                <div class="manager-title">Empire Revenue Multiplier</div>
                <div class="manager-role">Worldwide Profit (+15% / lvl)</div>
              </div>
            </div>
            <span class="lvl-badge ${incMax ? 'max' : incLvl > 0 ? 'active' : 'locked'}">Lvl ${incLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Bonus: +${incLvl * 15}% Income Worldwide</div>
          <div class="manager-next-perk">${incMax ? '⭐ MAX Level reached' : `Next: +${(incLvl + 1) * 15}% Total Revenue (+15% boost)`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Boosts active & idle profits</span>
            ${incMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= incCost ? 'ready-pulse' : ''}" ${vaultGold >= incCost ? '' : 'disabled'} data-action="franchise" data-id="global_income">Upgrade ($${incCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 5. Seed Capital -->
        <div class="manager-card rarity-epic">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">🪙</div>
              <div class="manager-name-col">
                <div class="manager-title">Franchise Seed Capital</div>
                <div class="manager-role">New Campsite Starting Cash</div>
              </div>
            </div>
            <span class="lvl-badge ${seedMax ? 'max' : seedLvl > 0 ? 'active' : 'locked'}">Lvl ${seedLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Starter Funds: $${(60 + seedLvl * 100).toLocaleString()} 💵</div>
          <div class="manager-next-perk">${seedMax ? '⭐ MAX Level reached' : `Next: Start each new campsite with $${(60 + (seedLvl + 1) * 100).toLocaleString()} 💵`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Instant jumpstart on fresh camps</span>
            ${seedMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= seedCost ? 'ready-pulse' : ''}" ${vaultGold >= seedCost ? '' : 'disabled'} data-action="franchise" data-id="seed_capital">Upgrade ($${seedCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- 6. Staff Cleaner Speed -->
        <div class="manager-card rarity-rare">
          <div class="manager-top-row">
            <div class="manager-identity">
              <div class="manager-avatar">🧹</div>
              <div class="manager-name-col">
                <div class="manager-title">Eco Fleet Logistics</div>
                <div class="manager-role">Cleaner Speed (+15% / lvl)</div>
              </div>
            </div>
            <span class="lvl-badge ${staffMax ? 'max' : staffLvl > 0 ? 'active' : 'locked'}">Lvl ${staffLvl}/10</span>
          </div>
          <div class="manager-perks-row">Current Bonus: +${staffLvl * 15}% Cleaner Speed Worldwide</div>
          <div class="manager-next-perk">${staffMax ? '⭐ MAX Level reached' : `Next: +${(staffLvl + 1) * 15}% Speed for Oliver, Chloe & Felix`}</div>
          <div class="manager-action-row">
            <span style="font-size: 10px; color: #7f8c8d;">Faster trash & cash pickup</span>
            ${staffMax
              ? `<button class="btn-manager-action maxed" disabled>⭐ MAX</button>`
              : `<button class="btn-manager-action ${vaultGold >= staffCost ? 'ready-pulse' : ''}" ${vaultGold >= staffCost ? '' : 'disabled'} data-action="franchise" data-id="staff_speed">Upgrade ($${staffCost.toLocaleString()} 🏛️)</button>`
            }
          </div>
        </div>

        <!-- Reset Resort -->
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed #d5dbdb; text-align: center;">
          <button class="btn-manager-action locked" data-action="reset" data-id="reset" style="width: 100%; padding: 8px 12px; font-size: 11px;">
            🔄 Resort komplett neu starten (Reset Save)
          </button>
        </div>
      `;

      this.ui.drawerContentList.innerHTML = html;
    }

    // Attach delegated click listeners to all action buttons in drawerContentList
    this.ui.drawerContentList.querySelectorAll('button:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const action = target.dataset.action;
        const id = target.dataset.id;
        if (!action) return;

        if (action === 'manager') {
          this.activateOrUpgradeManager(id);
        } else if (action === 'crate') {
          this.openCrate(id);
        } else if (action === 'buy_timeskip') {
          const sec = parseInt(target.dataset.seconds, 10);
          const cost = parseInt(target.dataset.cost, 10);
          const label = target.dataset.label || 'Time Warp';
          this.buyTimeSkip(sec, cost, label);
        } else if (action === 'buy_boost') {
          const duration = parseInt(target.dataset.duration, 10);
          const mult = parseFloat(target.dataset.multiplier);
          const cost = parseInt(target.dataset.cost, 10);
          this.buyIncomeBoost(duration, mult, cost);
        } else if (action === 'buy_iap') {
          const gems = parseInt(target.dataset.gems, 10);
          const price = target.dataset.price || '$0.99';
          const tier = target.dataset.tier || 'Gem Pack';
          this.buyIAPGems(gems, price, tier);
        } else if (action === 'goal') {
          this.claimAchievement(id);
        } else if (action === 'ranger' || action === 'franchise') {
          this.buyFranchiseUpgrade(id);
        } else if (action === 'advance_camp') {
          this.advanceToNextCamp();
        } else if (action === 'visit_camp') {
          const targetC = parseInt(target.dataset.camp, 10);
          const targetR = parseInt(target.dataset.region || this.state.region, 10);
          const targetW = parseInt(target.dataset.world || this.state.world, 10);
          if (targetC > 0) {
            this.switchCamp(targetW, targetR, targetC);
          }
        } else if (action === 'return_highest_camp') {
          const maxW = this.state.maxUnlockedWorld || 1;
          const maxR = this.state.maxUnlockedRegion || 1;
          const maxC = this.state.maxUnlockedCamp || 1;
          this.switchCamp(maxW, maxR, maxC);
        } else if (action === 'reset') {
          this.resetGame();
        }
      });
    });

    if (prevScroll > 0 && this.ui.drawerContentList) {
      this.ui.drawerContentList.scrollTop = prevScroll;
    }
  }
}
