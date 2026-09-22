// Procedural Voxel / Pixel-Art 2D Models for Campers: Pocket Resort using Three.js

const PALETTE = {
  grass: 0x4fa328,
  grassDark: 0x3d821e,
  dirtPath: 0xd9ae61,
  woodDark: 0x4e311a,
  woodLight: 0xa16f3d,
  woodBark: 0x382012,
  tentRed: 0xd93829,
  tentYellow: 0xf5b025,
  tentTeal: 0x16a085,
  caravanMint: 0x3ebfa5,
  caravanCream: 0xffffff,
  domeGlass: 0x85c1e9,
  waterBlue: 0x2980b9,
  metal: 0x7f8c8d,
  metalDark: 0x34495e,
  gold: 0xf39c12,
  cashGreen: 0x27ae60,
  cashBand: 0xecf0f1,
  rangerKhaki: 0xcca052,
  rangerGreen: 0x245422,
  skinTone: 0xf5cba7,
  stoneGray: 0x8a9597,
  fireOrange: 0xe67e22,
  fireRed: 0xc0392b,
  fireYellow: 0xf1c40f
};

// Reusable standard materials (lazy loaded to guarantee THREE is initialized)
let _mats = null;
function getMats() {
  if (!_mats) {
    _mats = {
      grass: new THREE.MeshToonMaterial({ color: PALETTE.grass }),
      path: new THREE.MeshToonMaterial({ color: PALETTE.dirtPath }),
      woodDark: new THREE.MeshToonMaterial({ color: PALETTE.woodDark }),
      woodLight: new THREE.MeshToonMaterial({ color: PALETTE.woodLight }),
      woodBark: new THREE.MeshToonMaterial({ color: PALETTE.woodBark }),
      tentRed: new THREE.MeshToonMaterial({ color: PALETTE.tentRed }),
      tentYellow: new THREE.MeshToonMaterial({ color: PALETTE.tentYellow }),
      tentTeal: new THREE.MeshToonMaterial({ color: PALETTE.tentTeal }),
      caravanMint: new THREE.MeshToonMaterial({ color: PALETTE.caravanMint }),
      caravanCream: new THREE.MeshToonMaterial({ color: PALETTE.caravanCream }),
      water: new THREE.MeshToonMaterial({ color: PALETTE.waterBlue, transparent: true, opacity: 0.85 }),
      stone: new THREE.MeshToonMaterial({ color: PALETTE.stoneGray }),
      metal: new THREE.MeshToonMaterial({ color: PALETTE.metal }),
      metalDark: new THREE.MeshToonMaterial({ color: PALETTE.metalDark }),
      cash: new THREE.MeshToonMaterial({ color: PALETTE.cashGreen }),
      cashBand: new THREE.MeshToonMaterial({ color: PALETTE.cashBand }),
      log: new THREE.MeshToonMaterial({ color: PALETTE.woodLight }),
      domeGlass: new THREE.MeshToonMaterial({ color: PALETTE.domeGlass, transparent: true, opacity: 0.8 }),
      rangerKhaki: new THREE.MeshToonMaterial({ color: PALETTE.rangerKhaki }),
      rangerGreen: new THREE.MeshToonMaterial({ color: PALETTE.rangerGreen }),
      skin: new THREE.MeshToonMaterial({ color: PALETTE.skinTone })
    };
  }
  return _mats;
}

const MATS = new Proxy({}, {
  get(target, prop) {
    return getMats()[prop];
  }
});

export class ModelFactory {
  // --- VOXEL / PIXEL ART PINE TREE ---
  static createTree(variant = 0) {
    const group = new THREE.Group();

    // Trunk (chunky pixel box)
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), MATS.woodBark);
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Stepped voxel foliage tiers (Crossy Road / Voxel style)
    const leafColors = [0x2e7d32, 0x1e824c, 0x27ae60];
    const leafMat = new THREE.MeshToonMaterial({ color: leafColors[variant % 3] });

    // Tier 1 (Base wide)
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.65, 2.2), leafMat);
    t1.position.y = 1.25;
    t1.castShadow = true;
    group.add(t1);

    // Tier 2 (Mid)
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 1.6), leafMat);
    t2.position.y = 1.85;
    t2.castShadow = true;
    group.add(t2);

    // Tier 3 (Top narrow)
    const t3 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 1.0), leafMat);
    t3.position.y = 2.45;
    t3.castShadow = true;
    group.add(t3);

    // Tier 4 (Crown point)
    const t4 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), leafMat);
    t4.position.y = 3.0;
    t4.castShadow = true;
    group.add(t4);

    return group;
  }

  // --- PIXEL BOULDER ---
  static createRock() {
    const group = new THREE.Group();
    // Stepped boxy rock
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.8), MATS.stone);
    base.position.y = 0.22;
    base.castShadow = true;
    group.add(base);

    const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.55), MATS.stone);
    top.position.set(0.1, 0.55, 0.05);
    top.castShadow = true;
    group.add(top);

    return group;
  }

  // --- VOXEL / PIXEL ART RANGER AVATAR ---
  static createRangerAvatar() {
    const group = new THREE.Group();

    // Body (Shirt)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.45), MATS.rangerKhaki);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    // Belt
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 0.48), MATS.woodDark);
    belt.position.y = 0.5;
    group.add(belt);

    // Head (Cube)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), MATS.skin);
    head.position.y = 1.4;
    head.castShadow = true;
    group.add(head);

    // Pixel Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2c3e50 });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.05), eyeMat);
    leftEye.position.set(-0.15, 1.45, 0.28);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.05), eyeMat);
    rightEye.position.set(0.15, 1.45, 0.28);
    group.add(rightEye);

    // Pixel Ranger Hat Brim (Flat chunky box)
    const brim = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 1.05), MATS.rangerKhaki);
    brim.position.y = 1.7;
    brim.castShadow = true;
    group.add(brim);

    // Hat Crown (Tall cube)
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.55), MATS.rangerKhaki);
    crown.position.y = 1.9;
    crown.castShadow = true;
    group.add(crown);

    // Hat Band
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.1, 0.58), MATS.rangerGreen);
    band.position.y = 1.78;
    group.add(band);

    // Backpack (Chunky leather pack)
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.3), MATS.woodBark);
    pack.position.set(0, 0.9, -0.32);
    pack.castShadow = true;
    group.add(pack);

    // Stack anchor (where carried items stack upward)
    const stackAnchor = new THREE.Group();
    stackAnchor.position.set(0, 1.25, -0.32);
    group.add(stackAnchor);
    group.userData.stackAnchor = stackAnchor;

    // Legs (Boots)
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.22), MATS.rangerGreen);
    leftLeg.position.set(-0.18, 0.22, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.22), MATS.rangerGreen);
    rightLeg.position.set(0.18, 0.22, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    group.userData.leftLeg = leftLeg;
    group.userData.rightLeg = rightLeg;
    group.userData.body = body;

    return group;
  }

  // --- VOXEL / PIXEL ART CAMPER AVATAR ---
  static createCamperAvatar(type = 'Hippies') {
    const group = new THREE.Group();

    let shirtColor = 0x9b59b6; // Hippie purple
    let hatColor = null;

    if (type === 'Families') {
      shirtColor = 0x3498db; // Family cyan
    } else if (type === 'Snobs') {
      shirtColor = 0x2c3e50; // Snob dark blazer
      hatColor = 0x1c2833;
    }

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.4), new THREE.MeshToonMaterial({ color: shirtColor }));
    body.position.y = 0.72;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), MATS.skin);
    head.position.y = 1.25;
    head.castShadow = true;
    group.add(head);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), eyeMat);
    eyeL.position.set(-0.13, 1.28, 0.25);
    group.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), eyeMat);
    eyeR.position.set(0.13, 1.28, 0.25);
    group.add(eyeR);

    if (type === 'Hippies') {
      // Pink pixel headband
      const headband = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.52), new THREE.MeshToonMaterial({ color: 0xe91e63 }));
      headband.position.y = 1.4;
      group.add(headband);
    } else if (type === 'Snobs') {
      // Pixel top hat / fedora
      const hatBrim = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.7), new THREE.MeshToonMaterial({ color: hatColor }));
      hatBrim.position.y = 1.5;
      group.add(hatBrim);

      const hatTop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 0.4), new THREE.MeshToonMaterial({ color: hatColor }));
      hatTop.position.y = 1.66;
      group.add(hatTop);
    }

    // Legs
    const pantsMat = new THREE.MeshToonMaterial({ color: 0x34495e });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.18), pantsMat);
    leftLeg.position.set(-0.14, 0.2, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.18), pantsMat);
    rightLeg.position.set(0.14, 0.2, 0);
    group.add(rightLeg);

    group.userData.type = type;
    return group;
  }

  // --- VOXEL PUP TENT PITCH ---
  static createPupTentPitch() {
    const group = new THREE.Group();

    // Wooden pixel plank deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 3.6), MATS.woodLight);
    deck.position.y = 0.08;
    deck.receiveShadow = true;
    group.add(deck);

    // Voxel Tent Structure (Stepped pixel prism)
    const tentGroup = new THREE.Group();
    tentGroup.position.set(-0.3, 0.15, -0.3);

    const tierCount = 7;
    for (let i = 0; i < tierCount; i++) {
      const w = 2.0 - i * 0.26;
      const h = 0.22;
      const d = 2.2;
      const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MATS.tentRed);
      block.position.y = i * 0.22 + 0.11;
      block.castShadow = true;
      tentGroup.add(block);
    }
    // Tent Ridge beam
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 2.3), MATS.tentYellow);
    ridge.position.y = tierCount * 0.22 + 0.05;
    tentGroup.add(ridge);

    group.add(tentGroup);

    // Pixel Checkout Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.8), MATS.woodDark);
    table.position.set(1.1, 0.25, 0.9);
    table.castShadow = true;
    group.add(table);

    const cashDropPoint = new THREE.Group();
    cashDropPoint.position.set(1.1, 0.55, 0.9);
    group.add(cashDropPoint);
    group.userData.cashDropPoint = cashDropPoint;

    // Pitch Signpost
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.0, 0.15), MATS.woodDark);
    post.position.set(-1.4, 0.5, 1.4);
    group.add(post);

    const board = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.1), MATS.woodLight);
    board.position.set(-1.4, 0.85, 1.4);
    group.add(board);

    return group;
  }

  // --- VOXEL RETRO CARAVAN PITCH ---
  static createCaravanPitch() {
    const group = new THREE.Group();

    // Gravel base
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 4.4), MATS.stone);
    base.position.y = 0.06;
    base.receiveShadow = true;
    group.add(base);

    // Caravan Body (Boxy rounded pixel trailer)
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.4, 1.6), MATS.caravanMint);
    body.position.set(0, 0.95, -0.3);
    body.castShadow = true;
    group.add(body);

    // White Roof Tier
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.4), MATS.caravanCream);
    roof.position.set(0, 1.75, -0.3);
    roof.castShadow = true;
    group.add(roof);

    // Pixel Window
    const winMat = new THREE.MeshBasicMaterial({ color: 0x34495e });
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.05), winMat);
    win.position.set(0, 1.1, 0.51);
    group.add(win);

    // Pixel Wheels (Chunky square blocks)
    const wheelMat = new THREE.MeshToonMaterial({ color: 0x1a252f });
    const wheelL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.3), wheelMat);
    wheelL.position.set(-0.7, 0.28, 0.52);
    group.add(wheelL);

    const wheelR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.3), wheelMat);
    wheelR.position.set(0.7, 0.28, 0.52);
    group.add(wheelR);

    // Yellow Awning (Chunky cantilever)
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.2), MATS.tentYellow);
    awning.position.set(0, 1.45, 0.95);
    awning.castShadow = true;
    group.add(awning);

    // Cash Drop Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.7), MATS.woodDark);
    table.position.set(0, 0.25, 1.4);
    table.castShadow = true;
    group.add(table);

    const cashDropPoint = new THREE.Group();
    cashDropPoint.position.set(0, 0.55, 1.4);
    group.add(cashDropPoint);
    group.userData.cashDropPoint = cashDropPoint;

    return group;
  }

  // --- VOXEL GLAMPING GEO-DOME PITCH ---
  static createGlampingPitch() {
    const group = new THREE.Group();

    // Octagon pixel deck
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.2, 8), MATS.woodDark);
    deck.position.y = 0.1;
    deck.receiveShadow = true;
    group.add(deck);

    // Stepped voxel dome
    const domeGroup = new THREE.Group();
    domeGroup.position.set(0, 0.2, -0.2);

    const domeTiers = [
      { r: 1.8, h: 0.5 },
      { r: 1.5, h: 0.45 },
      { r: 1.1, h: 0.4 },
      { r: 0.6, h: 0.3 }
    ];

    domeTiers.forEach((tier, idx) => {
      let y = 0;
      for (let j = 0; j < idx; j++) y += domeTiers[j].h;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(tier.r * 1.8, tier.h, tier.r * 1.8), MATS.domeGlass);
      mesh.position.y = y + tier.h / 2;
      mesh.castShadow = true;
      domeGroup.add(mesh);
    });
    group.add(domeGroup);

    // Cash Drop Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), MATS.woodLight);
    table.position.set(-1.2, 0.3, 0.9);
    table.castShadow = true;
    group.add(table);

    const cashDropPoint = new THREE.Group();
    cashDropPoint.position.set(-1.2, 0.6, 0.9);
    group.add(cashDropPoint);
    group.userData.cashDropPoint = cashDropPoint;

    return group;
  }

  // --- VOXEL CAMPFIRE HEARTH ---
  static createCampfireHearth() {
    const group = new THREE.Group();

    // Ring of 8 voxel stone cubes
    const stoneCount = 8;
    for (let i = 0; i < stoneCount; i++) {
      const angle = (i / stoneCount) * Math.PI * 2;
      const stone = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), MATS.stone);
      stone.position.set(Math.cos(angle) * 1.0, 0.15, Math.sin(angle) * 1.0);
      stone.castShadow = true;
      group.add(stone);
    }

    // Ash Bed
    const ash = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.6), new THREE.MeshToonMaterial({ color: 0x222222 }));
    ash.position.y = 0.05;
    group.add(ash);

    // Crossed Voxel Firewood Logs
    const log1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 1.3), MATS.woodDark);
    log1.position.set(0, 0.2, 0);
    log1.rotation.y = Math.PI / 4;
    group.add(log1);

    const log2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 1.3), MATS.woodDark);
    log2.position.set(0, 0.2, 0);
    log2.rotation.y = -Math.PI / 4;
    group.add(log2);

    // Stepped Voxel Flame (Animated)
    const flameGroup = new THREE.Group();
    flameGroup.position.y = 0.45;

    const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), new THREE.MeshBasicMaterial({ color: PALETTE.fireRed }));
    f1.position.y = 0.2;
    flameGroup.add(f1);

    const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.45), new THREE.MeshBasicMaterial({ color: PALETTE.fireOrange }));
    f2.position.y = 0.55;
    flameGroup.add(f2);

    const f3 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.25), new THREE.MeshBasicMaterial({ color: PALETTE.fireYellow }));
    f3.position.y = 0.85;
    flameGroup.add(f3);

    group.add(flameGroup);
    group.userData.flame = flameGroup;

    // Flickering Point Light
    const fireLight = new THREE.PointLight(0xff9900, 1.8, 8);
    fireLight.position.set(0, 1.0, 0);
    group.add(fireLight);
    group.userData.fireLight = fireLight;

    return group;
  }

  // --- VOXEL RECEPTION DESK ---
  static createReceptionDesk() {
    const group = new THREE.Group();

    // Wooden deck floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.15, 2.8), MATS.woodLight);
    floor.position.y = 0.08;
    floor.receiveShadow = true;
    group.add(floor);

    // Counter Desk (Pixel blocks)
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.95, 0.7), MATS.woodDark);
    counter.position.set(0, 0.55, 0);
    counter.castShadow = true;
    group.add(counter);

    // Reception Bell (Gold pixel cube)
    const bell = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshToonMaterial({ color: PALETTE.gold }));
    bell.position.set(0.6, 1.1, 0);
    group.add(bell);

    // Canopy Posts (Voxel pillars)
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), MATS.woodDark);
    postL.position.set(-1.4, 1.1, -1.0);
    group.add(postL);

    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), MATS.woodDark);
    postR.position.set(1.4, 1.1, -1.0);
    group.add(postR);

    // Teal Canopy Roof
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.15, 2.6), MATS.tentTeal);
    canopy.position.set(0, 2.25, 0);
    canopy.castShadow = true;
    group.add(canopy);

    return group;
  }

  // --- VOXEL WOODPILE & CHOPPING BLOCK ---
  static createWoodpile() {
    const group = new THREE.Group();

    // Chopping Stump (Hexagonal pixel log)
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.7, 6), MATS.woodBark);
    stump.position.set(0, 0.35, 0);
    stump.castShadow = true;
    group.add(stump);

    // Voxel Axe stuck in stump
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), MATS.woodLight);
    handle.position.set(0.15, 0.9, 0);
    handle.rotation.z = -0.3;
    group.add(handle);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.3), MATS.metal);
    blade.position.set(0.28, 0.95, 0);
    blade.rotation.z = -0.3;
    group.add(blade);

    // Stacked firewood logs (Pixel rectangular logs)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3 - r; c++) {
        const log = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.25), MATS.woodLight);
        log.position.set(1.2 + (c - (3 - r) / 2) * 0.3, 0.15 + r * 0.24, -0.2);
        log.castShadow = true;
        group.add(log);
      }
    }

    return group;
  }

  // --- VOXEL GENERATOR SHED ---
  static createGenerator() {
    const group = new THREE.Group();

    // Concrete pad
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 2.0), MATS.stone);
    pad.position.y = 0.08;
    pad.receiveShadow = true;
    group.add(pad);

    // Industrial Yellow Voxel Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.2), new THREE.MeshToonMaterial({ color: PALETTE.gold }));
    body.position.set(0, 0.68, 0);
    body.castShadow = true;
    group.add(body);

    // Black Exhaust Chimney
    const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 0.25), MATS.metalDark);
    pipe.position.set(0.55, 1.5, -0.35);
    group.add(pipe);

    // Vent Grill
    const grill = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.05), MATS.metalDark);
    grill.position.set(0, 0.75, 0.62);
    group.add(grill);

    return group;
  }

  // --- VOXEL WATER WELL PUMP ---
  static createWaterPump() {
    const group = new THREE.Group();

    // Square brick well
    const well = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.8), MATS.stone);
    well.position.y = 0.4;
    well.castShadow = true;
    group.add(well);

    // Water Surface
    const water = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.4), MATS.water);
    water.position.y = 0.6;
    group.add(water);

    // Wooden Posts
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 0.18), MATS.woodDark);
    postL.position.set(-0.8, 1.2, 0);
    group.add(postL);

    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 0.18), MATS.woodDark);
    postR.position.set(0.8, 1.2, 0);
    group.add(postR);

    // Well Roof (Stepped pixel gable)
    const roof1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 1.8), MATS.tentRed);
    roof1.position.set(0, 2.05, 0);
    group.add(roof1);

    const roof2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.8), MATS.tentRed);
    roof2.position.set(0, 2.25, 0);
    group.add(roof2);

    return group;
  }

  // --- PIXEL CASH BUNDLE ---
  static createCashBundle() {
    const group = new THREE.Group();
    // Green dollar block
    const geo = new THREE.BoxGeometry(0.48, 0.16, 0.3);
    const mesh = new THREE.Mesh(geo, MATS.cash);
    mesh.castShadow = true;
    group.add(mesh);

    // White paper band
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.17, 0.31), MATS.cashBand);
    group.add(band);

    return group;
  }

  // --- PIXEL FIREWOOD LOG ---
  static createFirewoodItem() {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.18), MATS.log);
    mesh.castShadow = true;
    group.add(mesh);
    return group;
  }
}
