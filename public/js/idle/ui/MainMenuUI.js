// MainMenuUI: Primary Hub Screen, Regional Trail (Pfad der 10 Camps), and Navigation
import { WORLD_BIOMES, getCampKey, getCampSizeInfo, getEarthRegionDef } from '../config/worlds.js';

export class MainMenuUI {
  constructor(game) {
    this.game = game;
  }

  get state() {
    return this.game.state;
  }

  get ui() {
    return this.game.ui;
  }

  get isMainMenuOpen() {
    return this.game.isMainMenuOpen;
  }

  set isMainMenuOpen(val) {
    this.game.isMainMenuOpen = val;
  }

  get selectedMenuRegion() {
    return this.game.selectedMenuRegion;
  }

  set selectedMenuRegion(val) {
    this.game.selectedMenuRegion = val;
  }

  open() {
    this.isMainMenuOpen = true;
    this.selectedMenuRegion = this.state.region || 1;
    if (this.ui?.upgradesDrawer) this.ui.upgradesDrawer.classList.remove('open');
    if (this.ui?.worldModal) this.ui.worldModal.style.display = 'none';
    if (this.ui?.crateModal) this.ui.crateModal.style.display = 'none';
    if (this.ui?.eventsModal) this.ui.eventsModal.style.display = 'none';
    if (this.ui?.mainMenu) {
      this.ui.mainMenu.style.display = 'flex';
      this.updateCurrencies();
      this.renderRegionTrail();
    }
  }

  close() {
    this.isMainMenuOpen = false;
    if (this.ui?.mainMenu) {
      this.ui.mainMenu.style.display = 'none';
    }
    window.soundFX?.playPop();
  }

  toggle() {
    if (this.isMainMenuOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  updateCurrencies() {
    if (!this.ui?.mainMenu || !this.isMainMenuOpen) return;
    const otherRate = this.game.getTotalOtherCampsIdleRate();

    if (this.ui.menuCash) this.ui.menuCash.textContent = `$${Math.floor(this.state.cash || 0).toLocaleString()}`;
    if (this.ui.menuVault) this.ui.menuVault.textContent = `$${Math.floor(this.state.empireGold || 0).toLocaleString()}`;
    if (this.ui.menuGems) this.ui.menuGems.textContent = Math.floor(this.state.gems || 0).toLocaleString();
    if (this.ui.menuIdleRate) {
      if (this.ui.menuEmpireIdle) this.ui.menuEmpireIdle.style.display = otherRate > 0 ? 'flex' : 'none';
      this.ui.menuIdleRate.textContent = `+$${otherRate.toFixed(1)}/s`;
    }

    if (this.ui.menuCrateSub) {
      const freeTimer = this.state.crates?.freeTimer || 0;
      if (freeTimer <= 0) {
        this.ui.menuCrateSub.textContent = 'Kiste bereit! 🎁';
        this.ui.menuCrateSub.style.color = '#27ae60';
        this.ui.menuCrateSub.style.fontWeight = 'bold';
      } else {
        const m = Math.floor(freeTimer / 60);
        const s = Math.floor(freeTimer % 60);
        this.ui.menuCrateSub.textContent = `Gratis in ${m}:${s < 10 ? '0' : ''}${s}`;
        this.ui.menuCrateSub.style.color = '#5d6d7e';
        this.ui.menuCrateSub.style.fontWeight = 'normal';
      }
    }
  }

  renderRegionTrail() {
    if (!this.ui?.regionTrailList) return;

    const curWorld = this.state.world || 1;
    const curRegion = this.state.region || 1;
    const curCamp = this.state.camp || 1;
    const maxWorld = this.state.maxUnlockedWorld || 1;
    const maxRegion = this.state.maxUnlockedRegion || 1;
    const maxCamp = this.state.maxUnlockedCamp || 1;

    if (!this.selectedMenuRegion) {
      this.selectedMenuRegion = curRegion;
    }
    // Clamp within unlocked bounds
    this.selectedMenuRegion = Math.max(1, Math.min(this.selectedMenuRegion, maxRegion));
    const selReg = this.selectedMenuRegion;

    // Region nav buttons
    if (this.ui.btnPrevRegion) {
      this.ui.btnPrevRegion.disabled = (selReg <= 1);
    }
    if (this.ui.btnNextRegion) {
      this.ui.btnNextRegion.disabled = (selReg >= maxRegion);
    }

    // Earth 100 Region info
    const regDef = getEarthRegionDef(selReg);

    if (this.ui.trailRegionTitle) {
      this.ui.trailRegionTitle.textContent = `${regDef.flag} REGION ${selReg}: ${regDef.name.toUpperCase()}`;
    }
    if (this.ui.trailWorldSubtitle) {
      const isViewingActive = (selReg === curRegion);
      this.ui.trailWorldSubtitle.innerHTML = `${regDef.continent} • ${regDef.country} • <em>${regDef.theme}</em> • ⛺ <strong>${regDef.styleName}</strong>${!isViewingActive ? `<br><button id="btn-jump-active-camp" style="margin-top: 5px; background: #27ae60; color: #fff; border: 1px solid #142819; border-radius: 4px; font-size: 9px; padding: 3px 8px; cursor: pointer; font-family: monospace;">📍 Zurück zu aktiver Region ${curRegion}</button>` : ''}`;
    }

    // Calculate progression along this region's 10 campsites
    let clearedCount = 0;
    for (let c = 1; c <= 10; c++) {
      const isCleared = (curWorld < maxWorld) ||
                        (curWorld === maxWorld && selReg < maxRegion) ||
                        (curWorld === maxWorld && selReg === maxRegion && c < maxCamp) ||
                        (this.state.camps?.[getCampKey(curWorld, selReg, c)]?.idleRate > 0);
      if (isCleared) clearedCount++;
    }

    const progressPct = Math.round((clearedCount / 10) * 100);
    if (this.ui.trailProgressFill) {
      this.ui.trailProgressFill.style.width = `${Math.max(8, progressPct)}%`;
    }
    if (this.ui.trailProgressText) {
      this.ui.trailProgressText.textContent = `${clearedCount} / 10 Camps abgeschlossen`;
    }

    // Generate 10 trail nodes
    let html = '';
    for (let c = 1; c <= 10; c++) {
      const cfg = getCampSizeInfo(c);
      const isCurrent = (curWorld === this.state.world && selReg === curRegion && c === curCamp);
      const isUnlocked = isCurrent ||
                         (curWorld < maxWorld) ||
                         (curWorld === maxWorld && selReg < maxRegion) ||
                         (curWorld === maxWorld && selReg === maxRegion && c <= maxCamp);
      const cKey = getCampKey(curWorld, selReg, c);
      const cData = this.state.camps?.[cKey];
      const isCleared = !isCurrent && (
                        (curWorld < maxWorld) ||
                        (curWorld === maxWorld && selReg < maxRegion) ||
                        (curWorld === maxWorld && selReg === maxRegion && c < maxCamp) ||
                        (cData && cData.idleRate > 0)
      );

      // Node state class
      const nodeClass = isCurrent
        ? 'trail-node active-node'
        : isCleared
          ? 'trail-node cleared-node'
          : isUnlocked
            ? 'trail-node'
            : 'trail-node locked-node';

      // Icon & visual cues
      const icon = isCurrent ? '🏕️' : isCleared ? '🏰' : isUnlocked ? '⛺' : '🔒';

      // Status text
      let statusHtml = '';
      if (isCurrent) {
        statusHtml = '<span class="trail-node-status" style="color: #27ae60;">⭐ JETZT AKTIV</span>';
      } else if (isCleared) {
        const idleVal = cData?.idleRate || 0;
        if (idleVal > 0) {
          statusHtml = `<span class="trail-node-status" style="color: #b7950b;">🏛️ +$${idleVal.toFixed(1)}/s Tresor-Gold</span>`;
        } else {
          statusHtml = '<span class="trail-node-status" style="color: #27ae60;">✓ Abgeschlossen & Automatisiert</span>';
        }
      } else if (isUnlocked) {
        statusHtml = '<span class="trail-node-status" style="color: #2980b9;">⚡ Bereit zur Erkundung</span>';
      } else {
        statusHtml = `<span class="trail-node-status" style="color: #95a5a6;">🔒 Schließe Camp #${c - 1} ab</span>`;
      }

      // Button
      let btnHtml = '';
      if (isCurrent) {
        btnHtml = `<button class="btn-trail-go current-play" data-play-camp="${c}">▶️ SPIELEN</button>`;
      } else if (isUnlocked) {
        btnHtml = `<button class="btn-trail-go visit" data-play-camp="${c}">BESUCHEN ✈️</button>`;
      } else {
        btnHtml = `<button class="btn-trail-go" disabled>GESPERRT</button>`;
      }

      html += `
        <div class="${nodeClass}" data-camp-num="${c}">
          <div class="trail-node-icon">${icon}</div>
          <div class="trail-node-info">
            <div class="trail-node-name">
              <span>Camp #${c}: ${cfg.name}</span>
            </div>
            <div class="trail-node-meta">
              ${cfg.tier} • Bis zu ${cfg.pitches} Stellplätze
            </div>
            ${statusHtml}
          </div>
          <div>
            ${btnHtml}
          </div>
        </div>
      `;
    }

    this.ui.regionTrailList.innerHTML = html;
  }
}
