// Campers: Pocket Resort (2D Arcade Idle Prototype Engine)
import { ModelFactory } from './models.js';

class CampersIdleGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.clock = new THREE.Clock();

    // Game Economy & State
    this.state = {
      cash: 40, // Starter cash
      pinecones: 0,
      powerDemand: 0,
      powerCapacity: 5,
      waterDemand: 0,
      waterCapacity: 5,
      activeCampers: 0,
      totalCampersServed: 0,
      campfireJoyTime: 0,
      rangerSpeed: 7.2,
      rangerCapacity: 4,
      assistantUnlocked: false,
      upgrades: {
        speedLevel: 1,
        capacityLevel: 1,
        tentIncomeLevel: 1
      }
    };

    // Entities
    this.buildPads = [];
    this.pitches = [];
    this.campers = [];
    this.cashDrops = [];
    this.carriedItems = [];
    this.particles = [];
    this.floatTexts = [];

    // Controls
    this.joystick = { active: false, startX: 0, startY: 0, moveX: 0, moveY: 0, angle: 0, dist: 0 };
    this.keys = { forward: false, backward: false, left: false, right: false };

    // Init Three.js and components
    this.initThree();
    this.buildCampground();
    this.initPlayer();
    this.initPadsAndPitches();
    this.initControls();
    this.initUI();
    this.loadState();

    // Start loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Camper spawn timer
    this.camperSpawnTimer = 0;
    this.chopTimer = 0;
  }

  initThree() {
    this.pixelScale = 3; // 3x chunky pixel factor

    // Scene with cozy retro sky
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6bb5e5);
    this.scene.fog = new THREE.Fog(0x6bb5e5, 50, 110);

    // Renderer in low-res pixelated mode
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Chunky hard pixel shadows
    this.container.appendChild(this.renderer.domElement);

    // True Isometric Orthographic Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.orthoSize = 13.5;
    this.camera = new THREE.OrthographicCamera(
      -this.orthoSize * aspect,
      this.orthoSize * aspect,
      this.orthoSize,
      -this.orthoSize,
      -100,
      500
    );
    // Classic 1:1.2:1 axonometric isometric projection
    this.camOffset = new THREE.Vector3(26, 30, 26);
    this.camera.position.copy(this.camOffset);
    this.camera.lookAt(0, 0, 0);

    this.applyPixelScale();

    // Ambient & Directional Sun Lighting with high contrast cel-shading
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x3d7026, 0.85);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff8e7, 1.3);
    this.sunLight.position.set(30, 50, 25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    const d = 30;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    window.addEventListener('resize', () => this.onResize());
  }

  applyPixelScale() {
    const w = Math.max(160, Math.floor(window.innerWidth / this.pixelScale));
    const h = Math.max(240, Math.floor(window.innerHeight / this.pixelScale));
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(w, h, false);
    const canvas = this.renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.imageRendering = 'pixelated';
  }

  togglePixelScale() {
    // Cycle between 2x (fine pixel), 3x (chunky retro), 4x (8-bit)
    if (this.pixelScale === 2) this.pixelScale = 3;
    else if (this.pixelScale === 3) this.pixelScale = 4;
    else this.pixelScale = 2;

    this.applyPixelScale();
    return `${this.pixelScale}x`;
  }

  onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.left = -this.orthoSize * aspect;
    this.camera.right = this.orthoSize * aspect;
    this.camera.top = this.orthoSize;
    this.camera.bottom = -this.orthoSize;
    this.camera.updateProjectionMatrix();

    this.applyPixelScale();
  }

  buildCampground() {
    // 1. Lush grass terrain
    const groundGeo = new THREE.PlaneGeometry(100, 100, 20, 20);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x5fa438 });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // 2. Dirt Trail Paths winding through camp
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xdfb76c });

    // Main entrance trail
    const trail1 = new THREE.Mesh(new THREE.PlaneGeometry(4, 28), pathMat);
    trail1.rotation.x = -Math.PI / 2;
    trail1.position.set(0, 0.02, 10);
    trail1.receiveShadow = true;
    this.scene.add(trail1);

    // Lateral loop connecting pitches
    const trail2 = new THREE.Mesh(new THREE.PlaneGeometry(32, 3.5), pathMat);
    trail2.rotation.x = -Math.PI / 2;
    trail2.position.set(0, 0.02, 0);
    trail2.receiveShadow = true;
    this.scene.add(trail2);

    // North trail leading to utilities & lake
    const trail3 = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 18), pathMat);
    trail3.rotation.x = -Math.PI / 2;
    trail3.position.set(-6, 0.02, -8);
    trail3.receiveShadow = true;
    this.scene.add(trail3);

    // 3. Central Campfire Hearth
    this.campfire = ModelFactory.createCampfireHearth();
    this.campfire.position.set(0, 0, 0);
    this.scene.add(this.campfire);

    // 4. Reception Check-In Desk
    this.reception = ModelFactory.createReceptionDesk();
    this.reception.position.set(0, 0, 15);
    this.scene.add(this.reception);

    // 5. Wood Chopping Clearing
    this.woodpile = ModelFactory.createWoodpile();
    this.woodpile.position.set(13, 0, -8);
    this.scene.add(this.woodpile);

    // 6. Natural Scenery: Trees and Rocks around perimeter
    const treePositions = [
      [-16, 12], [-14, 18], [-18, 5], [-19, -6], [-15, -16],
      [15, 16], [18, 10], [17, 3], [19, -12], [14, -18],
      [-8, -19], [0, -21], [8, -19], [-4, 22], [7, 24]
    ];

    treePositions.forEach((pos, idx) => {
      const tree = ModelFactory.createTree(idx % 3);
      tree.position.set(pos[0], 0, pos[1]);
      tree.scale.setScalar(0.9 + Math.random() * 0.3);
      this.scene.add(tree);
    });

    for (let i = 0; i < 14; i++) {
      const rock = ModelFactory.createRock();
      const angle = (i / 14) * Math.PI * 2;
      const dist = 22 + Math.random() * 6;
      rock.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      this.scene.add(rock);
    }
  }

  initPlayer() {
    this.player = {
      x: 0,
      z: 11,
      y: 0,
      vx: 0,
      vz: 0,
      angle: 0,
      walkCycle: 0,
      isMoving: false
    };

    this.playerMesh = ModelFactory.createRangerAvatar();
    this.playerMesh.position.set(this.player.x, 0, this.player.z);
    this.scene.add(this.playerMesh);
  }

  initPadsAndPitches() {
    // Pitch 1: Pup Tent Pitch (Unlocked from start)
    const pitch1Mesh = ModelFactory.createPupTentPitch();
    pitch1Mesh.position.set(-8, 0, 0);
    this.scene.add(pitch1Mesh);

    const pitch1 = {
      id: 'pitch_tent_1',
      name: 'Pup Tent #1',
      tier: 'tent',
      mesh: pitch1Mesh,
      pos: new THREE.Vector3(-8, 0, 0),
      cashDropPoint: new THREE.Vector3(-6.9, 0.45, 0.9),
      camperSpot: new THREE.Vector3(-8.2, 0, -0.2),
      isOccupied: false,
      occupant: null,
      stayDuration: 8.0,
      stayTimer: 0,
      baseIncome: 25,
      powerLoad: 0,
      waterLoad: 0,
      level: 1
    };
    this.pitches.push(pitch1);

    // Stand-To-Pay Build Pads:
    // Pad 1: Caravan Pitch #2 ($75)
    this.createBuildPad({
      id: 'pad_caravan',
      name: 'Caravan Pitch',
      cost: 75,
      pos: new THREE.Vector3(8, 0, 0),
      onComplete: () => this.unlockCaravanPitch(new THREE.Vector3(8, 0, 0))
    });

    // Pad 2: Water Well Pump ($110)
    this.createBuildPad({
      id: 'pad_water',
      name: 'Water Well',
      cost: 110,
      pos: new THREE.Vector3(-12, 0, -10),
      onComplete: () => this.unlockWaterPump(new THREE.Vector3(-12, 0, -10))
    });

    // Pad 3: Generator Shed ($140)
    this.createBuildPad({
      id: 'pad_generator',
      name: 'Generator Shed',
      cost: 140,
      pos: new THREE.Vector3(-4, 0, -14),
      onComplete: () => this.unlockGenerator(new THREE.Vector3(-4, 0, -14))
    });

    // Pad 4: Glamping Dome Pitch #3 ($220)
    this.createBuildPad({
      id: 'pad_glamping',
      name: 'Glamping Dome',
      cost: 220,
      pos: new THREE.Vector3(-8, 0, 8),
      onComplete: () => this.unlockGlampingPitch(new THREE.Vector3(-8, 0, 8))
    });

    // Pad 5: Assistant Ranger Bunk ($180)
    this.createBuildPad({
      id: 'pad_assistant',
      name: 'Hire Assistant Robin',
      cost: 180,
      pos: new THREE.Vector3(8, 0, 8),
      onComplete: () => this.unlockAssistantRanger(new THREE.Vector3(8, 0, 8))
    });
  }

  createBuildPad(config) {
    const padGroup = new THREE.Group();
    padGroup.position.copy(config.pos);

    // Glowing Outer Circle
    const outerGeo = new THREE.RingGeometry(1.5, 1.7, 32);
    const outerMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f, side: THREE.DoubleSide });
    const outerRing = new THREE.Mesh(outerGeo, outerMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.04;
    padGroup.add(outerRing);

    // Progress Disc Fill
    const discGeo = new THREE.CircleGeometry(1.48, 32);
    const discMat = new THREE.MeshBasicMaterial({ color: 0x27ae60, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.03;
    disc.scale.set(0.01, 0.01, 1);
    padGroup.add(disc);

    this.scene.add(padGroup);

    const pad = {
      ...config,
      paid: 0,
      group: padGroup,
      outerRing,
      disc,
      isCompleted: false
    };

    this.buildPads.push(pad);
  }

  unlockCaravanPitch(pos) {
    const mesh = ModelFactory.createCaravanPitch();
    mesh.position.copy(pos);
    mesh.scale.set(0.1, 0.1, 0.1);
    this.scene.add(mesh);

    // Elastic pop animation
    this.animateSpawn(mesh);

    const pitch = {
      id: 'pitch_caravan_2',
      name: 'Caravan Pitch #2',
      tier: 'caravan',
      mesh,
      pos,
      cashDropPoint: new THREE.Vector3(pos.x, 0.5, pos.z + 1.3),
      camperSpot: new THREE.Vector3(pos.x, 0, pos.z - 0.2),
      isOccupied: false,
      occupant: null,
      stayDuration: 12.0,
      stayTimer: 0,
      baseIncome: 65,
      powerLoad: 1,
      waterLoad: 1,
      level: 1
    };
    this.pitches.push(pitch);
    this.updateGridLoad();
  }

  unlockWaterPump(pos) {
    const mesh = ModelFactory.createWaterPump();
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.animateSpawn(mesh);

    this.state.waterCapacity += 5;
    this.showFloatText(pos, '+5 💧 Water!', '#3498db');
    this.updateHUD();
  }

  unlockGenerator(pos) {
    const mesh = ModelFactory.createGenerator();
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.animateSpawn(mesh);

    this.state.powerCapacity += 5;
    this.showFloatText(pos, '+5 ⚡ Power!', '#f1c40f');
    this.updateHUD();
  }

  unlockGlampingPitch(pos) {
    const mesh = ModelFactory.createGlampingPitch();
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.animateSpawn(mesh);

    const pitch = {
      id: 'pitch_glamping_3',
      name: 'Glamping Dome #3',
      tier: 'glamping',
      mesh,
      pos,
      cashDropPoint: new THREE.Vector3(pos.x - 1.2, 0.55, pos.z + 0.9),
      camperSpot: new THREE.Vector3(pos.x, 0, pos.z - 0.2),
      isOccupied: false,
      occupant: null,
      stayDuration: 16.0,
      stayTimer: 0,
      baseIncome: 150,
      powerLoad: 2,
      waterLoad: 2,
      level: 1
    };
    this.pitches.push(pitch);
    this.updateGridLoad();
  }

  unlockAssistantRanger(pos) {
    this.state.assistantUnlocked = true;
    this.assistantMesh = ModelFactory.createRangerAvatar();
    this.assistantMesh.position.copy(pos);
    // Green shirt for assistant
    this.assistantMesh.userData.body.material = new THREE.MeshLambertMaterial({ color: 0x27ae60 });
    this.scene.add(this.assistantMesh);
    this.animateSpawn(this.assistantMesh);

    this.assistant = {
      x: pos.x,
      z: pos.z,
      target: null,
      speed: 5.5,
      walkCycle: 0
    };

    this.showFloatText(pos, '🧑‍🌾 Robin Hired!', '#2ecc71');
  }

  animateSpawn(object) {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.08;
      const s = 1 + Math.sin(t * Math.PI) * 0.3;
      object.scale.set(s, s, s);
      if (t >= 1) {
        object.scale.set(1, 1, 1);
        clearInterval(interval);
      }
    }, 16);
  }

  updateGridLoad() {
    let power = 0;
    let water = 0;
    this.pitches.forEach(p => {
      power += p.powerLoad;
      water += p.waterLoad;
    });
    this.state.powerDemand = power;
    this.state.waterDemand = water;

    if (this.state.powerDemand > this.state.powerCapacity) {
      window.soundFX?.playOverload();
    }
    this.updateHUD();
  }

  // --- TOUCH JOYSTICK & KEYBOARD CONTROLS ---
  initControls() {
    const joyZone = document.getElementById('joystick-zone');
    const joyBase = document.getElementById('joystick-base');
    const joyKnob = document.getElementById('joystick-knob');

    const handleStart = (clientX, clientY) => {
      window.soundFX?.ensureContext();
      this.joystick.active = true;
      this.joystick.startX = clientX;
      this.joystick.startY = clientY;

      joyBase.style.display = 'block';
      joyBase.style.left = `${clientX}px`;
      joyBase.style.top = `${clientY}px`;
      joyKnob.style.transform = `translate(-50%, -50%) translate(0px, 0px)`;
    };

    const handleMove = (clientX, clientY) => {
      if (!this.joystick.active) return;
      const dx = clientX - this.joystick.startX;
      const dy = clientY - this.joystick.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 48;
      const clampedDist = Math.min(dist, maxDist);
      const angle = Math.atan2(dy, dx);

      this.joystick.angle = angle;
      this.joystick.dist = clampedDist / maxDist;
      this.joystick.moveX = Math.cos(angle) * this.joystick.dist;
      this.joystick.moveY = Math.sin(angle) * this.joystick.dist;

      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;
      joyKnob.style.transform = `translate(-50%, -50%) translate(${knobX}px, ${knobY}px)`;
    };

    const handleEnd = () => {
      this.joystick.active = false;
      this.joystick.dist = 0;
      this.joystick.moveX = 0;
      this.joystick.moveY = 0;
      joyBase.style.display = 'none';
    };

    // Touch events for mobile
    window.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      if (touch.clientY > window.innerHeight * 0.35) {
        handleStart(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.joystick.active) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', handleEnd, { passive: true });
    window.addEventListener('touchcancel', handleEnd, { passive: true });

    // Mouse fallback for desktop testing
    let isMouseDown = false;
    window.addEventListener('mousedown', (e) => {
      if (e.clientY > window.innerHeight * 0.35 && e.target.tagName !== 'BUTTON') {
        isMouseDown = true;
        handleStart(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isMouseDown) handleMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
      handleEnd();
    });

    // Keyboard fallback (WASD & Arrows)
    window.addEventListener('keydown', (e) => {
      window.soundFX?.ensureContext();
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') this.keys.forward = true;
      if (k === 's' || e.key === 'ArrowDown') this.keys.backward = true;
      if (k === 'a' || e.key === 'ArrowLeft') this.keys.left = true;
      if (k === 'd' || e.key === 'ArrowRight') this.keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') this.keys.forward = false;
      if (k === 's' || e.key === 'ArrowDown') this.keys.backward = false;
      if (k === 'a' || e.key === 'ArrowLeft') this.keys.left = false;
      if (k === 'd' || e.key === 'ArrowRight') this.keys.right = false;
    });
  }

  initUI() {
    this.ui = {
      cash: document.getElementById('hud-cash'),
      power: document.getElementById('hud-power'),
      water: document.getElementById('hud-water'),
      campers: document.getElementById('hud-campers'),
      frenzyBanner: document.getElementById('frenzy-banner'),
      stackBadge: document.getElementById('stack-badge'),
      upgradesDrawer: document.getElementById('upgrades-drawer'),
      btnUpgrades: document.getElementById('btn-upgrades'),
      btnCloseDrawer: document.getElementById('btn-close-drawer'),
      soundBtn: document.getElementById('btn-sound'),
      pixelBtn: document.getElementById('btn-pixel-scale')
    };

    this.ui.btnUpgrades?.addEventListener('click', () => {
      this.ui.upgradesDrawer.classList.toggle('open');
    });

    this.ui.btnCloseDrawer?.addEventListener('click', () => {
      this.ui.upgradesDrawer.classList.remove('open');
    });

    this.ui.soundBtn?.addEventListener('click', () => {
      const isMuted = window.soundFX?.toggleMute();
      this.ui.soundBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    this.ui.pixelBtn?.addEventListener('click', () => {
      const scaleStr = this.togglePixelScale();
      this.ui.pixelBtn.textContent = `👾 ${scaleStr}`;
      window.soundFX?.playPop();
    });

    // Upgrade buttons
    document.getElementById('btn-upg-speed')?.addEventListener('click', () => {
      const cost = 50 * this.state.upgrades.speedLevel;
      if (this.state.cash >= cost) {
        this.state.cash -= cost;
        this.state.upgrades.speedLevel++;
        this.state.rangerSpeed += 1.2;
        window.soundFX?.playBuild();
        this.updateHUD();
      }
    });

    document.getElementById('btn-upg-cap')?.addEventListener('click', () => {
      const cost = 60 * this.state.upgrades.capacityLevel;
      if (this.state.cash >= cost) {
        this.state.cash -= cost;
        this.state.upgrades.capacityLevel++;
        this.state.rangerCapacity += 2;
        window.soundFX?.playBuild();
        this.updateHUD();
      }
    });

    this.updateHUD();
  }

  updateHUD() {
    if (this.ui.cash) this.ui.cash.textContent = `$${Math.floor(this.state.cash)}`;
    if (this.ui.power) {
      this.ui.power.textContent = `${this.state.powerDemand}/${this.state.powerCapacity} kW`;
      this.ui.power.parentElement.classList.toggle('overload', this.state.powerDemand > this.state.powerCapacity);
    }
    if (this.ui.water) {
      this.ui.water.textContent = `${this.state.waterDemand}/${this.state.waterCapacity} m³`;
      this.ui.water.parentElement.classList.toggle('overload', this.state.waterDemand > this.state.waterCapacity);
    }
    if (this.ui.campers) this.ui.campers.textContent = `${this.state.activeCampers}`;

    if (this.ui.stackBadge) {
      this.ui.stackBadge.textContent = `🪵 ${this.carriedItems.length}/${this.state.rangerCapacity}`;
    }

    // Update upgrade drawer buttons text
    const spdBtn = document.getElementById('btn-upg-speed');
    if (spdBtn) {
      spdBtn.textContent = `+$1.2 Speed ($${50 * this.state.upgrades.speedLevel})`;
    }
    const capBtn = document.getElementById('btn-upg-cap');
    if (capBtn) {
      capBtn.textContent = `+2 Pack Slots ($${60 * this.state.upgrades.capacityLevel})`;
    }
  }

  // --- GAME ANIMATION & TICK LOOP ---
  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.1);

    this.updatePlayer(dt);
    this.updateCamera();
    this.updateCampers(dt);
    this.updatePitches(dt);
    this.updateBuildPads(dt);
    this.updateWoodChopping(dt);
    this.updateCampfire(dt);
    this.updateCashDrops(dt);
    this.updateAssistant(dt);
    this.updateVisuals(dt);

    this.renderer.render(this.scene, this.camera);
  }

  updatePlayer(dt) {
    let inputX = 0;
    let inputZ = 0;

    if (this.joystick.active) {
      // Invert Y for screen to isometric Z
      // 45 deg isometric camera rotation projection
      const joyAngle = this.joystick.angle;
      const mag = this.joystick.dist;
      // Rotate by isometric angle (~45 deg)
      const cosA = Math.cos(-Math.PI / 4);
      const sinA = Math.sin(-Math.PI / 4);
      const rawX = Math.cos(joyAngle) * mag;
      const rawY = Math.sin(joyAngle) * mag;

      inputX = rawX * cosA - rawY * sinA;
      inputZ = rawX * sinA + rawY * cosA;
    } else {
      if (this.keys.forward) { inputX -= 0.707; inputZ -= 0.707; }
      if (this.keys.backward) { inputX += 0.707; inputZ += 0.707; }
      if (this.keys.left) { inputX -= 0.707; inputZ += 0.707; }
      if (this.keys.right) { inputX += 0.707; inputZ -= 0.707; }
    }

    const isMoving = Math.abs(inputX) > 0.05 || Math.abs(inputZ) > 0.05;
    this.player.isMoving = isMoving;

    if (isMoving) {
      const targetAngle = Math.atan2(inputX, inputZ);
      this.player.angle = targetAngle;

      this.player.x += inputX * this.state.rangerSpeed * dt;
      this.player.z += inputZ * this.state.rangerSpeed * dt;

      // Bound within camping park
      this.player.x = Math.max(-22, Math.min(22, this.player.x));
      this.player.z = Math.max(-22, Math.min(22, this.player.z));

      this.player.walkCycle += dt * 14;
    } else {
      this.player.walkCycle = 0;
    }

    // Lerp mesh rotation & position
    this.playerMesh.position.x = this.player.x;
    this.playerMesh.position.z = this.player.z;
    this.playerMesh.rotation.y = this.player.angle;

    // Running bounce & leg swing
    const leftLeg = this.playerMesh.userData.leftLeg;
    const rightLeg = this.playerMesh.userData.rightLeg;
    const body = this.playerMesh.userData.body;

    if (leftLeg && rightLeg) {
      leftLeg.rotation.x = Math.sin(this.player.walkCycle) * 0.75;
      rightLeg.rotation.x = -Math.sin(this.player.walkCycle) * 0.75;
      body.position.y = 0.85 + Math.abs(Math.sin(this.player.walkCycle * 2)) * 0.08;
    }

    // Backpack Stack sway physics
    const stackAnchor = this.playerMesh.userData.stackAnchor;
    if (stackAnchor) {
      stackAnchor.rotation.x = isMoving ? 0.15 + Math.sin(this.player.walkCycle) * 0.05 : 0;
      stackAnchor.rotation.z = isMoving ? Math.sin(this.player.walkCycle * 0.5) * 0.08 : 0;
    }
  }

  updateCamera() {
    // Smoothly follow player
    const targetX = this.player.x + this.camOffset.x;
    const targetZ = this.player.z + this.camOffset.z;
    this.camera.position.x += (targetX - this.camera.position.x) * 0.08;
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.08;
    this.camera.lookAt(this.player.x, 0.5, this.player.z);
  }

  // --- CAMPERS & RECEPTION CHECK-IN ---
  updateCampers(dt) {
    this.camperSpawnTimer += dt;
    if (this.camperSpawnTimer > 6.0 && this.campers.length < 6) {
      this.camperSpawnTimer = 0;
      this.spawnCamper();
    }

    // Check if Ranger is standing at Reception desk to check in campers
    const distToReception = Math.hypot(this.player.x - this.reception.position.x, this.player.z - (this.reception.position.z - 1.5));
    const canAutoCheckin = distToReception < 2.5 || (this.state.assistantUnlocked && Math.random() < 0.02);

    for (let i = this.campers.length - 1; i >= 0; i--) {
      const camper = this.campers[i];

      if (camper.state === 'queueing') {
        // Walk towards reception queue line
        const queuePos = new THREE.Vector3(0, 0, 18 + i * 2.0);
        const d = camper.mesh.position.distanceTo(queuePos);
        if (d > 0.3) {
          camper.mesh.position.lerp(queuePos, 0.05);
          camper.mesh.lookAt(queuePos);
        } else {
          // Standing in queue: look towards desk
          camper.mesh.rotation.y = Math.PI;

          // If first in queue and Ranger is at desk, check in!
          if (i === 0 && canAutoCheckin) {
            const vacantPitch = this.findVacantPitch(camper.type);
            if (vacantPitch) {
              camper.state = 'walking_to_pitch';
              camper.targetPitch = vacantPitch;
              vacantPitch.isOccupied = true;
              vacantPitch.occupant = camper;
              window.soundFX?.playCheckin();

              // Bonus check-in fee to Ranger
              this.state.cash += 10;
              this.showFloatText(this.playerMesh.position, '+$10 Check-in', '#f1c40f');
              this.updateHUD();
            }
          }
        }
      } else if (camper.state === 'walking_to_pitch') {
        const dest = camper.targetPitch.camperSpot;
        const d = camper.mesh.position.distanceTo(dest);
        if (d > 0.4) {
          camper.mesh.position.lerp(dest, 0.04);
          camper.mesh.lookAt(dest);
        } else {
          camper.state = 'relaxing';
          camper.targetPitch.stayTimer = 0;
          camper.mesh.rotation.y = 0;
        }
      } else if (camper.state === 'leaving') {
        // Walk towards exit road
        const exitPos = new THREE.Vector3(0, 0, 30);
        camper.mesh.position.lerp(exitPos, 0.04);
        if (camper.mesh.position.z > 28) {
          this.scene.remove(camper.mesh);
          this.campers.splice(i, 1);
          this.state.activeCampers = Math.max(0, this.state.activeCampers - 1);
          this.updateHUD();
        }
      }
    }
  }

  spawnCamper() {
    const types = ['Hippies', 'Families', 'Snobs'];
    const type = types[Math.floor(Math.random() * types.length)];
    const mesh = ModelFactory.createCamperAvatar(type);
    mesh.position.set(0, 0, 28 + Math.random() * 4);
    this.scene.add(mesh);

    this.campers.push({
      type,
      mesh,
      state: 'queueing',
      targetPitch: null
    });
    this.state.activeCampers++;
    this.updateHUD();
  }

  findVacantPitch(camperType) {
    // Find matching unoccupied pitch
    for (const p of this.pitches) {
      if (!p.isOccupied) return p;
    }
    return null;
  }

  // --- PITCHES & CASH GENERATION ---
  updatePitches(dt) {
    const isJoyActive = this.state.campfireJoyTime > 0;
    const speedMult = isJoyActive ? 1.5 : 1.0;

    this.pitches.forEach(pitch => {
      if (pitch.isOccupied && pitch.occupant && pitch.occupant.state === 'relaxing') {
        pitch.stayTimer += dt * speedMult;

        if (pitch.stayTimer >= pitch.stayDuration) {
          // Stay completed! Guest checks out and leaves cash stacks!
          pitch.isOccupied = false;
          const camper = pitch.occupant;
          camper.state = 'leaving';
          pitch.occupant = null;
          pitch.stayTimer = 0;

          // Drop cash stack
          const income = pitch.baseIncome * (isJoyActive ? 1.5 : 1.0);
          this.spawnCashDrop(pitch.cashDropPoint, income);
          this.state.totalCampersServed++;
        }
      }
    });
  }

  spawnCashDrop(pos, amount) {
    const bundle = ModelFactory.createCashBundle();
    bundle.position.copy(pos);
    bundle.position.y += 0.2;
    this.scene.add(bundle);

    this.cashDrops.push({
      mesh: bundle,
      amount,
      pos: pos.clone()
    });
  }

  updateCashDrops(dt) {
    for (let i = this.cashDrops.length - 1; i >= 0; i--) {
      const drop = this.cashDrops[i];

      // Rotate gently
      drop.mesh.rotation.y += dt * 2;

      // Check distance to player
      const dist = drop.mesh.position.distanceTo(this.playerMesh.position);
      if (dist < 2.0) {
        // Collect cash!
        this.scene.remove(drop.mesh);
        this.cashDrops.splice(i, 1);
        this.state.cash += drop.amount;
        window.soundFX?.playCoin();
        this.showFloatText(drop.mesh.position, `+$${drop.amount}`, '#2ecc71');
        this.updateHUD();
      }
    }
  }

  // --- STAND-TO-PAY BUILD PADS ---
  updateBuildPads(dt) {
    for (let i = this.buildPads.length - 1; i >= 0; i--) {
      const pad = this.buildPads[i];
      if (pad.isCompleted) continue;

      // Rotate outer ring
      pad.outerRing.rotation.z += dt * 1.5;

      const dist = Math.hypot(this.player.x - pad.pos.x, this.player.z - pad.pos.z);
      if (dist < 1.8 && this.state.cash > 0 && pad.paid < pad.cost) {
        // Stream payment from player
        const payAmount = Math.min(this.state.cash, 1.5);
        this.state.cash -= payAmount;
        pad.paid += payAmount;

        window.soundFX?.playPop();

        // Update progress disc
        const progress = pad.paid / pad.cost;
        pad.disc.scale.set(progress, progress, 1);
        this.updateHUD();

        if (pad.paid >= pad.cost) {
          // Completed!
          pad.isCompleted = true;
          this.scene.remove(pad.group);
          this.buildPads.splice(i, 1);
          window.soundFX?.playBuild();
          pad.onComplete();
          break;
        }
      }
    }
  }

  // --- WOOD CHOPPING & SUPPLY STACKING ---
  updateWoodChopping(dt) {
    const dist = Math.hypot(this.player.x - this.woodpile.position.x, this.player.z - this.woodpile.position.z);
    if (dist < 2.4) {
      this.chopTimer += dt;
      if (this.chopTimer >= 0.7) {
        this.chopTimer = 0;
        if (this.carriedItems.length < this.state.rangerCapacity) {
          this.addCarriedItem('log');
          window.soundFX?.playChop();
          this.updateHUD();
        }
      }
    } else {
      this.chopTimer = 0;
    }
  }

  addCarriedItem(type) {
    const stackAnchor = this.playerMesh.userData.stackAnchor;
    if (!stackAnchor) return;

    const item = ModelFactory.createFirewoodItem();
    item.position.set(0, this.carriedItems.length * 0.22, 0);
    stackAnchor.add(item);
    this.carriedItems.push(item);
  }

  removeCarriedItem() {
    const stackAnchor = this.playerMesh.userData.stackAnchor;
    if (!stackAnchor || this.carriedItems.length === 0) return;

    const item = this.carriedItems.pop();
    stackAnchor.remove(item);
    return item;
  }

  // --- CENTRAL CAMPFIRE & FRENZY ---
  updateCampfire(dt) {
    // Flickering flame animation
    const flame = this.campfire.userData.flame;
    const fireLight = this.campfire.userData.fireLight;
    if (flame) {
      flame.scale.set(
        0.9 + Math.sin(Date.now() * 0.015) * 0.2,
        1.0 + Math.cos(Date.now() * 0.02) * 0.25,
        0.9 + Math.sin(Date.now() * 0.015) * 0.2
      );
    }
    if (fireLight) {
      fireLight.intensity = 1.4 + Math.sin(Date.now() * 0.025) * 0.6;
    }

    // Feeding campfire with wood from backpack
    const dist = Math.hypot(this.player.x - this.campfire.position.x, this.player.z - this.campfire.position.z);
    if (dist < 2.5 && this.carriedItems.length > 0) {
      this.chopTimer += dt;
      if (this.chopTimer > 0.4) {
        this.chopTimer = 0;
        this.removeCarriedItem();
        window.soundFX?.playPop();
        this.state.campfireJoyTime += 15.0; // +15s Frenzy
        this.showFloatText(this.campfire.position, '🔥 Campfire Joy +15s!', '#e67e22');
        this.updateHUD();
      }
    }

    if (this.state.campfireJoyTime > 0) {
      this.state.campfireJoyTime -= dt;
      if (this.ui.frenzyBanner) {
        this.ui.frenzyBanner.style.display = 'block';
        this.ui.frenzyBanner.textContent = `🔥 JOY FRENZY (1.5x Speed): ${Math.ceil(this.state.campfireJoyTime)}s`;
      }
    } else {
      if (this.ui.frenzyBanner) this.ui.frenzyBanner.style.display = 'none';
    }
  }

  // --- HELPER STAFF ROBIN AUTOMATION ---
  updateAssistant(dt) {
    if (!this.state.assistantUnlocked || !this.assistant) return;

    // Robin sweeps between pitches to pick up cash
    if (this.cashDrops.length > 0) {
      const nearestDrop = this.cashDrops[0];
      const targetPos = nearestDrop.mesh.position;
      const dx = targetPos.x - this.assistant.x;
      const dz = targetPos.z - this.assistant.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.5) {
        this.assistant.x += (dx / dist) * this.assistant.speed * dt;
        this.assistant.z += (dz / dist) * this.assistant.speed * dt;
        this.assistantMesh.position.set(this.assistant.x, 0, this.assistant.z);
        this.assistantMesh.rotation.y = Math.atan2(dx, dz);
      }
    } else {
      // Idle patrol near campfire
      const destX = Math.sin(Date.now() * 0.001) * 3;
      const destZ = Math.cos(Date.now() * 0.001) * 3;
      this.assistant.x += (destX - this.assistant.x) * 0.02;
      this.assistant.z += (destZ - this.assistant.z) * 0.02;
      this.assistantMesh.position.set(this.assistant.x, 0, this.assistant.z);
    }
  }

  // --- FLOATING TEXT & PARTICLES ---
  showFloatText(pos3D, text, color = '#2ecc71') {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.color = color;
    document.body.appendChild(el);

    const startPos = pos3D.clone();
    let life = 0;

    const updateFloat = () => {
      life += 0.025;
      startPos.y += 0.035;

      const screenPos = startPos.clone().project(this.camera);
      const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.opacity = `${1 - life}`;

      if (life < 1) {
        requestAnimationFrame(updateFloat);
      } else {
        el.remove();
      }
    };
    requestAnimationFrame(updateFloat);
  }

  updateVisuals(dt) {
    // Pine trees gentle sway
    // Can be hooked for additional particle updates
  }

  // --- PERSISTENCE ---
  saveState() {
    try {
      localStorage.setItem('campers_idle_save', JSON.stringify({
        cash: this.state.cash,
        upgrades: this.state.upgrades,
        lastSave: Date.now()
      }));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  loadState() {
    try {
      const data = localStorage.getItem('campers_idle_save');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.cash) this.state.cash = parsed.cash;
        if (parsed.upgrades) this.state.upgrades = parsed.upgrades;
      }
    } catch (e) {
      console.warn('LocalStorage load failed', e);
    }
  }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
  window.campersGame = new CampersIdleGame();
});
