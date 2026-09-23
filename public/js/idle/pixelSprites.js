// PixelArt Drawing Utilities for Campers: Pocket Resort (Stardew Valley / Pokémon GBA Style)

export const PIXEL_COLORS = {
  // Terrain
  grassLight: '#62b535',
  grassMid: '#4b9824',
  grassDark: '#367219',
  dirtLight: '#e4be78',
  dirtMid: '#cf9e54',
  dirtDark: '#996f30',
  waterLight: '#5dade2',
  waterMid: '#2980b9',
  waterDark: '#1b4f72',

  // Wood & Structures
  woodLight: '#c28b52',
  woodMid: '#965e2e',
  woodDark: '#543217',
  stoneLight: '#b2babb',
  stoneMid: '#7f8c8d',
  stoneDark: '#34495e',

  // Tents & Highlights
  tentRed: '#e74c3c',
  tentRedDark: '#922b21',
  tentYellow: '#f39c12',
  tentYellowLight: '#f1c40f',
  caravanMint: '#1abc9c',
  caravanMintDark: '#16a085',
  caravanWhite: '#fdfefe',

  // Characters
  skin: '#f5cba7',
  skinShadow: '#dc9e78',
  rangerKhaki: '#d4ac0d',
  rangerKhakiDark: '#9a7d0a',
  rangerGreen: '#27ae60',
  rangerGreenDark: '#196f3d',
  hippiePurple: '#9b59b6',
  familyBlue: '#3498db',
  snobNavy: '#2c3e50',

  // Items
  cashGreen: '#2ecc71',
  cashWhite: '#ffffff',
  fireYellow: '#f1c40f',
  fireOrange: '#e67e22',
  fireRed: '#c0392b'
};

export class PixelRenderer {
  // Draw a pine tree in Stardew Valley / Pokémon style (32x48 px scaled)
  static drawPineTree(ctx, x, y, frame = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow on grass
    ctx.fillStyle = 'rgba(20, 50, 20, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-3, -10, 6, 12);
    ctx.fillStyle = PIXEL_COLORS.woodMid;
    ctx.fillRect(-2, -10, 3, 12);

    // Foliage Tiers (Layered Stardew Pine style)
    const tiers = [
      { y: -14, w: 22, h: 10 },
      { y: -22, w: 18, h: 9 },
      { y: -29, w: 14, h: 8 },
      { y: -36, w: 8, h: 8 }
    ];

    tiers.forEach((t, idx) => {
      // Outline / Dark shadow
      ctx.fillStyle = PIXEL_COLORS.grassDark;
      ctx.fillRect(-t.w / 2 - 1, t.y - 1, t.w + 2, t.h + 2);

      // Main foliage
      ctx.fillStyle = idx % 2 === 0 ? PIXEL_COLORS.grassMid : '#3d8621';
      ctx.fillRect(-t.w / 2, t.y, t.w, t.h);

      // Sunlit top edge
      ctx.fillStyle = PIXEL_COLORS.grassLight;
      ctx.fillRect(-t.w / 2 + 1, t.y, t.w - 2, 2);
      ctx.fillRect(-t.w / 4, t.y, t.w / 2, 3);
    });

    ctx.restore();
  }

  // Draw Camp Ranger (4-directional walk cycle)
  static drawRanger(ctx, x, y, dir = 'down', walkCycle = 0, carriedCount = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.abs(Math.sin(walkCycle)) * 2;
    const legOffset = Math.sin(walkCycle) * 3;

    // --- LEGS / BOOTS ---
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    if (dir === 'left' || dir === 'right') {
      ctx.fillRect(-4 + legOffset, -3 - bob, 4, 4);
      ctx.fillRect(0 - legOffset, -3 - bob, 4, 4);
    } else {
      ctx.fillRect(-5, -3 - bob + (legOffset > 0 ? -1 : 0), 4, 4);
      ctx.fillRect(1, -3 - bob + (legOffset < 0 ? -1 : 0), 4, 4);
    }

    // --- BODY (SHIRT & SHORTS) ---
    ctx.fillStyle = PIXEL_COLORS.rangerGreen;
    ctx.fillRect(-5, -8 - bob, 10, 5); // Shorts

    ctx.fillStyle = PIXEL_COLORS.rangerKhaki;
    ctx.fillRect(-6, -15 - bob, 12, 7); // Khaki Shirt
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-6, -9 - bob, 12, 2); // Belt

    // --- HEAD ---
    ctx.fillStyle = PIXEL_COLORS.skin;
    ctx.fillRect(-4, -21 - bob, 8, 7);

    // Face details
    if (dir === 'down') {
      ctx.fillStyle = '#111';
      ctx.fillRect(-3, -18 - bob, 2, 2); // Left Eye
      ctx.fillRect(1, -18 - bob, 2, 2);  // Right Eye
    } else if (dir === 'left') {
      ctx.fillStyle = '#111';
      ctx.fillRect(-4, -18 - bob, 2, 2); // Left profile eye
    } else if (dir === 'right') {
      ctx.fillStyle = '#111';
      ctx.fillRect(2, -18 - bob, 2, 2);  // Right profile eye
    }

    // --- RANGER HAT ---
    ctx.fillStyle = PIXEL_COLORS.rangerKhakiDark;
    ctx.fillRect(-8, -22 - bob, 16, 2); // Brim
    ctx.fillStyle = PIXEL_COLORS.rangerKhaki;
    ctx.fillRect(-5, -26 - bob, 10, 4); // Crown
    ctx.fillStyle = PIXEL_COLORS.rangerGreenDark;
    ctx.fillRect(-5, -23 - bob, 10, 1); // Hat Band

    // --- STARDEW VALLEY CARRIED ITEMS OVER HEAD ---
    if (carriedCount > 0) {
      for (let i = 0; i < Math.min(carriedCount, 4); i++) {
        const itemY = -30 - bob - (i * 5);
        // Wood log
        ctx.fillStyle = PIXEL_COLORS.woodDark;
        ctx.fillRect(-7, itemY - 1, 14, 5);
        ctx.fillStyle = PIXEL_COLORS.woodLight;
        ctx.fillRect(-6, itemY, 12, 3);
        ctx.fillStyle = PIXEL_COLORS.woodMid;
        ctx.fillRect(4, itemY, 2, 3); // Ring end
      }
    }

    ctx.restore();
  }

  // Draw Camper NPC (Hippies, Families, Snobs)
  static drawCamper(ctx, x, y, type = 'Hippies', dir = 'down', walkCycle = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.abs(Math.sin(walkCycle)) * 1.5;
    const leg = Math.sin(walkCycle) * 2;

    // Legs
    ctx.fillStyle = '#34495e';
    ctx.fillRect(-4, -3 - bob + (leg > 0 ? -1 : 0), 3, 3);
    ctx.fillRect(1, -3 - bob + (leg < 0 ? -1 : 0), 3, 3);

    // Body
    let shirtColor = PIXEL_COLORS.hippiePurple;
    if (type === 'Families') shirtColor = PIXEL_COLORS.familyBlue;
    if (type === 'Snobs') shirtColor = PIXEL_COLORS.snobNavy;

    ctx.fillStyle = shirtColor;
    ctx.fillRect(-5, -13 - bob, 10, 8);

    // Head
    ctx.fillStyle = PIXEL_COLORS.skin;
    ctx.fillRect(-4, -19 - bob, 8, 6);

    // Face / Accessories
    if (type === 'Hippies') {
      // Headband
      ctx.fillStyle = '#e91e63';
      ctx.fillRect(-5, -20 - bob, 10, 2);
      ctx.fillStyle = '#111';
      ctx.fillRect(-3, -16 - bob, 2, 2);
      ctx.fillRect(1, -16 - bob, 2, 2);
    } else if (type === 'Snobs') {
      // Fedora & Sunglasses
      ctx.fillStyle = '#1c2833';
      ctx.fillRect(-6, -21 - bob, 12, 2); // Brim
      ctx.fillRect(-4, -24 - bob, 8, 3);  // Crown
      ctx.fillStyle = '#000';
      ctx.fillRect(-4, -17 - bob, 8, 2);  // Shades
    } else {
      // Family Cap
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(-5, -21 - bob, 10, 3);
      ctx.fillStyle = '#111';
      ctx.fillRect(-3, -16 - bob, 2, 2);
      ctx.fillRect(1, -16 - bob, 2, 2);
    }

    ctx.restore();
  }

  // Draw Camp Staff Workers (Receptionists, Zone Cleaners, Fisherman, Barista, Lumberjack)
  static drawStaffWorker(ctx, x, y, role = 'receptionist', dir = 'down', walkCycle = 0, carriedCount = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.abs(Math.sin(walkCycle)) * 2;
    const legOffset = Math.sin(walkCycle) * 3;

    // Legs / Pants
    let pantsColor = '#2c3e50';
    if (role === 'cleaner_tent') pantsColor = '#2e4053';
    else if (role === 'cleaner_caravan') pantsColor = '#5d6d7e';
    else if (role === 'cleaner_cabin') pantsColor = '#145a32';
    else if (role === 'fisher') pantsColor = '#b7950b';
    else if (role === 'lumberjack') pantsColor = '#2471a3';

    ctx.fillStyle = pantsColor;
    if (dir === 'left' || dir === 'right') {
      ctx.fillRect(-4 + legOffset, -3 - bob, 4, 4);
      ctx.fillRect(0 - legOffset, -3 - bob, 4, 4);
    } else {
      ctx.fillRect(-5, -3 - bob + (legOffset > 0 ? -1 : 0), 4, 4);
      ctx.fillRect(1, -3 - bob + (legOffset < 0 ? -1 : 0), 4, 4);
    }

    // Shirt / Uniform Body
    let shirtColor = '#2980b9';
    if (role === 'receptionist' || role === 'receptionist_2') shirtColor = '#1b4f72';
    else if (role === 'cleaner_tent') shirtColor = '#f4d03f'; // Yellow hi-vis
    else if (role === 'cleaner_caravan') shirtColor = '#e67e22'; // Orange hi-vis
    else if (role === 'cleaner_cabin') shirtColor = '#27ae60'; // Green butler apron
    else if (role === 'fisher') shirtColor = '#f1c40f'; // Yellow rain slicker
    else if (role === 'barista') shirtColor = '#c0392b'; // Barista apron
    else if (role === 'lumberjack') shirtColor = '#b03a2e'; // Red plaid flannel

    ctx.fillStyle = shirtColor;
    ctx.fillRect(-5, -14 - bob, 10, 8);

    // Uniform details
    if (role === 'receptionist' || role === 'receptionist_2') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(-2, -14 - bob, 4, 3);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(1, -11 - bob, 2, 2);
    } else if (role === 'cleaner_tent' || role === 'cleaner_caravan') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(-5, -10 - bob, 10, 2);
    } else if (role === 'lumberjack') {
      ctx.fillStyle = '#17202a';
      ctx.fillRect(-5, -11 - bob, 10, 2);
      ctx.fillRect(-1, -14 - bob, 2, 8);
    }

    // Head
    ctx.fillStyle = PIXEL_COLORS.skin;
    ctx.fillRect(-4, -20 - bob, 8, 6);

    // Eyes
    ctx.fillStyle = '#111';
    if (dir === 'left') {
      ctx.fillRect(-4, -17 - bob, 2, 2);
    } else if (dir === 'right') {
      ctx.fillRect(2, -17 - bob, 2, 2);
    } else {
      ctx.fillRect(-3, -17 - bob, 2, 2);
      ctx.fillRect(1, -17 - bob, 2, 2);
    }

    // Hat / Hair / Accessories / Tools
    if (role === 'receptionist' || role === 'receptionist_2') {
      ctx.fillStyle = role === 'receptionist' ? '#2c3e50' : '#8e44ad';
      ctx.fillRect(-5, -22 - bob, 10, 3);
      ctx.fillStyle = '#111';
      ctx.fillRect(3, -19 - bob, 2, 3);
      ctx.fillRect(1, -16 - bob, 3, 1);
    } else if (role === 'cleaner_tent') {
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(-5, -22 - bob, 10, 3);
      ctx.fillRect(dir === 'left' ? -7 : 1, -20 - bob, 5, 1);
      // Handheld Broom
      ctx.fillStyle = '#b7950b';
      ctx.fillRect(dir === 'left' ? -8 : 6, -16 - bob, 2, 14);
      ctx.fillStyle = '#d4ac0d';
      ctx.fillRect(dir === 'left' ? -10 : 5, -3 - bob, 4, 4);
    } else if (role === 'cleaner_caravan') {
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(-5, -22 - bob, 10, 3);
      ctx.fillRect(-6, -20 - bob, 2, 4);
      // Handheld Mop
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(dir === 'left' ? -8 : 6, -16 - bob, 2, 14);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(dir === 'left' ? -10 : 5, -3 - bob, 4, 4);
    } else if (role === 'cleaner_cabin') {
      ctx.fillStyle = '#1c2833';
      ctx.fillRect(-6, -21 - bob, 12, 2);
      ctx.fillRect(-4, -25 - bob, 8, 4);
      // Feather duster
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(dir === 'left' ? -8 : 6, -18 - bob, 3, 5);
      ctx.fillStyle = '#b7950b';
      ctx.fillRect(dir === 'left' ? -7 : 7, -13 - bob, 2, 9);
    } else if (role === 'fisher') {
      ctx.fillStyle = '#52734d';
      ctx.fillRect(-7, -21 - bob, 14, 2);
      ctx.fillRect(-4, -25 - bob, 8, 4);
      // Fishing Rod
      ctx.strokeStyle = '#b7950b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(4, -12 - bob);
      ctx.lineTo(14, -24 - bob);
      ctx.stroke();
      // Fishing line down to water
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(14, -24 - bob);
      ctx.lineTo(18, 10);
      ctx.stroke();
      // Red/white bobber
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(17, 8, 3, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(17, 10, 3, 2);
    } else if (role === 'barista') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(-6, -22 - bob, 12, 2);
      ctx.fillRect(-4, -27 - bob, 8, 5);
      ctx.fillStyle = '#fff';
      ctx.fillRect(5, -12 - bob, 4, 5);
      ctx.fillStyle = '#784212';
      ctx.fillRect(6, -13 - bob, 2, 1);
    } else if (role === 'lumberjack') {
      ctx.fillStyle = '#6e2c00';
      ctx.fillRect(-5, -23 - bob, 10, 4);
      if (carriedCount > 0) {
        for (let i = 0; i < Math.min(carriedCount, 3); i++) {
          const itemY = -30 - bob - (i * 5);
          ctx.fillStyle = PIXEL_COLORS.woodDark;
          ctx.fillRect(-7, itemY - 1, 14, 5);
          ctx.fillStyle = PIXEL_COLORS.woodLight;
          ctx.fillRect(-6, itemY, 12, 3);
          ctx.fillStyle = PIXEL_COLORS.woodMid;
          ctx.fillRect(4, itemY, 2, 3);
        }
      }
    }

    ctx.restore();
  }

  // Draw Pup Tent (Stardew Style)
  static drawPupTent(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden deck slats
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-22, 6, 44, 10);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(-21, 7, 42, 8);

    // Tent Triangle (Canvas folds)
    ctx.fillStyle = PIXEL_COLORS.tentRedDark;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(-20, 8);
    ctx.lineTo(20, 8);
    ctx.closePath();
    ctx.fill();

    // Sunlit side
    ctx.fillStyle = PIXEL_COLORS.tentRed;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(0, 8);
    ctx.lineTo(20, 8);
    ctx.closePath();
    ctx.fill();

    // Entrance flap / Opening
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-7, 8);
    ctx.lineTo(7, 8);
    ctx.closePath();
    ctx.fill();

    // Yellow Ridge Guyline
    ctx.fillStyle = PIXEL_COLORS.tentYellow;
    ctx.fillRect(-1, -22, 2, 30);

    // Checkout table
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(16, 2, 12, 10);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(17, 3, 10, 4);

    ctx.restore();
  }

  // Draw Retro Caravan (Stardew / Pokemon Style)
  static drawCaravan(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#17202a';
    ctx.fillRect(-16, 8, 8, 8);
    ctx.fillRect(8, 8, 8, 8);

    // Body (Mint Green)
    ctx.fillStyle = PIXEL_COLORS.caravanMintDark;
    ctx.fillRect(-26, -14, 52, 24);
    ctx.fillStyle = PIXEL_COLORS.caravanMint;
    ctx.fillRect(-25, -13, 50, 22);

    // White Roof
    ctx.fillStyle = PIXEL_COLORS.caravanWhite;
    ctx.fillRect(-26, -18, 52, 6);

    // Windows
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-18, -10, 14, 10);
    ctx.fillRect(4, -10, 14, 10);
    // Curtain
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-18, -10, 4, 10);
    ctx.fillRect(14, -10, 4, 10);

    // Yellow/White Striped Awning
    ctx.fillStyle = PIXEL_COLORS.tentYellow;
    ctx.fillRect(-20, -2, 40, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-14, -2, 6, 4);
    ctx.fillRect(0, -2, 6, 4);
    ctx.fillRect(14, -2, 6, 4);

    ctx.restore();
  }

  // Draw Glamping Dome
  static drawGlampingDome(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Deck
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-24, 6, 48, 8);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(-23, 7, 46, 6);

    // Dome Arc
    ctx.fillStyle = 'rgba(133, 193, 233, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 6, 22, Math.PI, 0);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2980b9';
    ctx.stroke();

    // Geodesic Grid Lines
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(-14, 6);
    ctx.moveTo(0, -16);
    ctx.lineTo(14, 6);
    ctx.moveTo(-18, -4);
    ctx.lineTo(18, -4);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Campfire Hearth (Animated flames)
  static drawCampfire(ctx, x, y, frame = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Glow aura
    ctx.fillStyle = 'rgba(243, 156, 18, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, 24 + Math.sin(frame * 0.2) * 4, 0, Math.PI * 2);
    ctx.fill();

    // Stone ring
    const stoneAngles = [0, 0.78, 1.57, 2.35, 3.14, 3.92, 4.71, 5.49];
    stoneAngles.forEach(ang => {
      const sx = Math.cos(ang) * 12;
      const sy = Math.sin(ang) * 8;
      ctx.fillStyle = PIXEL_COLORS.stoneDark;
      ctx.fillRect(sx - 3, sy - 2, 6, 5);
      ctx.fillStyle = PIXEL_COLORS.stoneLight;
      ctx.fillRect(sx - 2, sy - 1, 4, 3);
    });

    // Crossed logs
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-8, -2, 16, 4);
    ctx.fillRect(-2, -6, 4, 12);

    // Pixel Flames (3-tiered flickering pixel stacks)
    const flicker = Math.sin(frame * 0.4) * 3;
    ctx.fillStyle = PIXEL_COLORS.fireRed;
    ctx.fillRect(-5, -10 + flicker, 10, 8);

    ctx.fillStyle = PIXEL_COLORS.fireOrange;
    ctx.fillRect(-3, -14 + flicker, 6, 8);

    ctx.fillStyle = PIXEL_COLORS.fireYellow;
    ctx.fillRect(-1, -18 + flicker, 2, 6);

    ctx.restore();
  }

  // Draw Reception Desk
  static drawReceptionDesk(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Deck
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-26, 4, 52, 10);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(-25, 5, 50, 8);

    // Counter Desk
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-18, -10, 36, 16);
    ctx.fillStyle = PIXEL_COLORS.woodMid;
    ctx.fillRect(-17, -9, 34, 4);

    // Gold Register Bell
    ctx.fillStyle = PIXEL_COLORS.tentYellowLight;
    ctx.fillRect(8, -13, 4, 4);

    // Canopy Pillars
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-22, -26, 3, 30);
    ctx.fillRect(19, -26, 3, 30);

    // Teal Striped Canopy Roof
    ctx.fillStyle = PIXEL_COLORS.tentTeal;
    ctx.fillRect(-26, -32, 52, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-18, -32, 6, 8);
    ctx.fillRect(-2, -32, 6, 8);
    ctx.fillRect(14, -32, 6, 8);

    // Sign "CHECK-IN"
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-16, -38, 32, 6);
    ctx.fillStyle = '#fff';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHECK-IN', 0, -33);

    ctx.restore();
  }

  // Draw Woodpile & Chopping Stump
  static drawWoodpile(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Tree Stump
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-12, -4, 12, 12);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(-11, -3, 10, 4); // Rings

    // Axe in stump
    ctx.fillStyle = PIXEL_COLORS.stoneLight;
    ctx.fillRect(-8, -10, 4, 6);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(-9, -15, 2, 10);

    // Stacked Logs
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3 - r; c++) {
        const lx = 4 + c * 8;
        const ly = 4 - r * 6;
        ctx.fillStyle = PIXEL_COLORS.woodDark;
        ctx.fillRect(lx, ly, 10, 5);
        ctx.fillStyle = PIXEL_COLORS.woodLight;
        ctx.fillRect(lx + 1, ly + 1, 8, 3);
      }
    }

    ctx.restore();
  }

  // Draw Water Pump / Well
  static drawWaterPump(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Stone Well Base
    ctx.fillStyle = PIXEL_COLORS.stoneDark;
    ctx.fillRect(-14, -4, 28, 14);
    ctx.fillStyle = PIXEL_COLORS.stoneLight;
    ctx.fillRect(-13, -3, 26, 12);

    // Water inside
    ctx.fillStyle = PIXEL_COLORS.waterLight;
    ctx.fillRect(-10, -2, 20, 6);

    // Wooden Roof posts
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-12, -22, 3, 20);
    ctx.fillRect(9, -22, 3, 20);

    // Red Shingled Roof
    ctx.fillStyle = PIXEL_COLORS.tentRedDark;
    ctx.fillRect(-16, -26, 32, 6);
    ctx.fillStyle = PIXEL_COLORS.tentRed;
    ctx.fillRect(-12, -30, 24, 5);

    ctx.restore();
  }

  // Draw Generator Shed
  static drawGenerator(ctx, x, y, frame = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Concrete Pad
    ctx.fillStyle = PIXEL_COLORS.stoneDark;
    ctx.fillRect(-16, 2, 32, 8);

    // Yellow Industrial Body
    ctx.fillStyle = '#b7950b';
    ctx.fillRect(-14, -14, 28, 18);
    ctx.fillStyle = PIXEL_COLORS.tentYellow;
    ctx.fillRect(-13, -13, 26, 16);

    // Lightning Bolt Emblem ⚡
    ctx.fillStyle = '#111';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', 0, -2);

    // Chimney & Puffing Pixel Smoke
    ctx.fillStyle = '#333';
    ctx.fillRect(6, -20, 4, 8);
    if (frame % 20 < 10) {
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.fillRect(7, -24, 3, 3);
      ctx.fillRect(8, -27, 4, 4);
    }

    ctx.restore();
  }

  // Draw Cash Bundle
  static drawCash(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    ctx.fillStyle = '#145a32';
    ctx.fillRect(-6, -3, 12, 7);
    ctx.fillStyle = PIXEL_COLORS.cashGreen;
    ctx.fillRect(-5, -2, 10, 5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-2, -2, 4, 5); // White strap

    ctx.restore();
  }

  // Draw Tranquil Fishing Pond with animated water highlights & wooden pier
  static drawPond(ctx, x, y, width = 90, height = 55, frame = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Deep water pond oval
    ctx.fillStyle = PIXEL_COLORS.waterDark;
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2 + 2, height / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PIXEL_COLORS.waterMid;
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shimmering water waves
    ctx.fillStyle = PIXEL_COLORS.waterLight;
    const waveOffset = Math.sin(frame * 0.08) * 4;
    ctx.fillRect(-20 + waveOffset, -8, 12, 2);
    ctx.fillRect(8 - waveOffset, -2, 14, 2);
    ctx.fillRect(-12 - waveOffset, 10, 16, 2);

    // Lilypads
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(-24, 6, 6, 4);
    ctx.fillRect(18, -12, 7, 5);
    // Lotus flower on lilypad
    ctx.fillStyle = '#f48fb1';
    ctx.fillRect(-22, 5, 2, 2);

    // Wooden Fishing Pier (South edge)
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-8, 10, 16, 22);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(-7, 11, 14, 20);
    // Planks
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    for (let p = 14; p < 32; p += 4) {
      ctx.fillRect(-7, p, 14, 1);
    }
    // Pier posts
    ctx.fillRect(-9, 30, 2, 6);
    ctx.fillRect(7, 30, 2, 6);

    ctx.restore();
  }

  // Draw Snack Kiosk (Ice cream & Coffee stall)
  static drawKiosk(ctx, x, y, frame = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Cabin Base
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-20, -14, 40, 24);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(-19, -13, 38, 22);

    // Serving Window
    ctx.fillStyle = '#111';
    ctx.fillRect(-14, -6, 28, 12);

    // Counter shelf
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-16, 5, 32, 3);

    // Striped Awning (Orange & White)
    ctx.fillStyle = PIXEL_COLORS.tentYellow;
    ctx.fillRect(-22, -18, 44, 7);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-16, -18, 6, 7);
    ctx.fillRect(-2, -18, 6, 7);
    ctx.fillRect(12, -18, 6, 7);

    // Sign "COFFEE & ICE"
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-16, -25, 32, 6);
    ctx.fillStyle = '#f1c40f';
    ctx.font = '5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('☕ KIOSK 🍦', 0, -20);

    ctx.restore();
  }

  // Draw Sports Field (Badminton / Soccer zone for Families)
  static drawSportsField(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // White pitch boundaries
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-26, -18, 52, 36);

    // Center line
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 18);
    ctx.stroke();

    // Badminton Net
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(0, 16);
    ctx.stroke();

    // Wooden posts
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-1, -18, 2, 4);
    ctx.fillRect(-1, 14, 2, 4);

    // Soccer ball on grass
    ctx.fillStyle = '#fff';
    ctx.fillRect(12, 4, 4, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(13, 5, 2, 2);

    ctx.restore();
  }

  // Draw Retro Speech Bubble over character heads
  static drawSpeechBubble(ctx, x, y, text, frame = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    const bob = Math.sin(frame * 0.1) * 1.5;
    const by = -32 + bob;

    // Bubble background
    ctx.fillStyle = '#fff';
    ctx.fillRect(-12, by - 7, 24, 14);
    // Tail
    ctx.beginPath();
    ctx.moveTo(-2, by + 7);
    ctx.lineTo(2, by + 7);
    ctx.lineTo(0, by + 10);
    ctx.closePath();
    ctx.fill();

    // 1px black pixel outline
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, by - 7, 24, 14);

    // Emoji or text inside (Tents, Caravans, Domes, Cabins)
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, by);

    ctx.restore();
  }

  // Draw Butterfly fluttering in flower meadows
  static drawButterfly(ctx, x, y, frame = 0, color = '#f1c40f') {
    ctx.save();
    const flitX = Math.sin(frame * 0.15) * 6;
    const flitY = Math.cos(frame * 0.2) * 4;
    ctx.translate(Math.floor(x + flitX), Math.floor(y + flitY));

    const flap = Math.abs(Math.sin(frame * 0.4)) * 3;
    ctx.fillStyle = color;
    // Wings
    ctx.fillRect(-3, -2 - flap, 2, 3);
    ctx.fillRect(1, -2 - flap, 2, 3);
    // Body
    ctx.fillStyle = '#111';
    ctx.fillRect(-1, -1, 2, 3);

    ctx.restore();
  }

  // Draw Trash Bag dropped on pitch checkout
  static drawTrashBag(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Dark green crumpled bag
    ctx.fillStyle = '#1b4f72';
    ctx.fillRect(-4, -4, 8, 7);
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(-3, -3, 6, 5);
    // Yellow tie
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-2, -5, 4, 2);

    ctx.restore();
  }

  // Draw Cozy Log Cabin / Bungalow (Stardew Valley Style)
  static drawLogCabin(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone Chimney (Left back)
    ctx.fillStyle = PIXEL_COLORS.stoneDark;
    ctx.fillRect(-22, -26, 8, 22);
    ctx.fillStyle = PIXEL_COLORS.stoneLight;
    ctx.fillRect(-21, -25, 6, 20);

    // Log Walls (Layered horizontal timber logs with rounded end cuts)
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-26, -12, 52, 24);

    for (let logY = -10; logY < 12; logY += 5) {
      ctx.fillStyle = PIXEL_COLORS.woodLight;
      ctx.fillRect(-25, logY, 50, 4);
      // Log end knots
      ctx.fillStyle = PIXEL_COLORS.woodDark;
      ctx.fillRect(-25, logY, 3, 4);
      ctx.fillRect(22, logY, 3, 4);
    }

    // Wooden Porch Deck
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-28, 10, 56, 6);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(-27, 11, 54, 4);

    // Front Door
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-6, -2, 12, 14);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(3, 4, 2, 2); // Brass knob

    // Glowing Warm Windows
    ctx.fillStyle = '#fef9e7';
    ctx.fillRect(-20, -4, 10, 8);
    ctx.fillRect(10, -4, 10, 8);
    // Window mullions
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-16, -4, 2, 8);
    ctx.fillRect(-20, 0, 10, 1);
    ctx.fillRect(14, -4, 2, 8);
    ctx.fillRect(10, 0, 10, 1);

    // Shingled Green Gable Roof
    ctx.fillStyle = '#145a32';
    ctx.fillRect(-30, -18, 60, 8);
    ctx.fillStyle = '#1e8449';
    ctx.fillRect(-26, -24, 52, 7);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(-20, -28, 40, 5);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(-12, -31, 24, 4);

    // Checkout table on porch
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(20, 4, 10, 8);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(21, 5, 8, 3);

    ctx.restore();
  }

  // Draw Swiss Alpine Chalet with flower boxes & steep snow-capped roof
  static drawChalet(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 36, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone foundation base
    ctx.fillStyle = '#5d6d7e';
    ctx.fillRect(-28, 4, 56, 12);
    ctx.fillStyle = '#85929e';
    ctx.fillRect(-27, 5, 54, 10);

    // Upper timber walls
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-26, -16, 52, 22);
    ctx.fillStyle = PIXEL_COLORS.woodLight;
    ctx.fillRect(-24, -14, 48, 18);

    // Alpine Balcony across facade
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-27, -2, 54, 4);
    // Balcony railings
    for (let rx = -25; rx <= 23; rx += 6) {
      ctx.fillRect(rx, -7, 2, 6);
    }
    ctx.fillRect(-26, -7, 52, 2);

    // Red geranium flower boxes on balcony
    ctx.fillStyle = '#145a32';
    ctx.fillRect(-24, -6, 20, 2);
    ctx.fillRect(4, -6, 20, 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-23, -8, 3, 2);
    ctx.fillRect(-17, -8, 3, 2);
    ctx.fillRect(-11, -8, 3, 2);
    ctx.fillRect(5, -8, 3, 2);
    ctx.fillRect(11, -8, 3, 2);
    ctx.fillRect(17, -8, 3, 2);

    // Front door
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-6, 4, 12, 12);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(3, 10, 2, 2);

    // Warm attic and lower windows
    ctx.fillStyle = '#fef9e7';
    ctx.fillRect(-18, 6, 8, 7);
    ctx.fillRect(10, 6, 8, 7);
    ctx.fillRect(-8, -14, 16, 6);
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-14, 6, 1, 7);
    ctx.fillRect(14, 6, 1, 7);
    ctx.fillRect(0, -14, 1, 6);

    // Steep A-frame Alpine Roof with Snow Rim
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(-32, -14);
    ctx.lineTo(32, -14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(-28, -15);
    ctx.lineTo(28, -15);
    ctx.closePath();
    ctx.fill();

    // Snow caps on roof
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(-6, -32, 12, 3);
    ctx.fillRect(-32, -16, 8, 3);
    ctx.fillRect(24, -16, 8, 3);

    ctx.restore();
  }

  // Draw Grand Mountain Safari Lodge with stone foundation & dual bay windows
  static drawLodge(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 42, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Stone masonry foundation
    ctx.fillStyle = '#34495e';
    ctx.fillRect(-32, 2, 64, 16);
    ctx.fillStyle = '#5d6d7e';
    ctx.fillRect(-31, 3, 62, 14);

    // Timber log walls
    ctx.fillStyle = '#6e2c00';
    ctx.fillRect(-30, -18, 60, 22);
    ctx.fillStyle = '#a04000';
    ctx.fillRect(-28, -16, 56, 18);

    // Front porch deck and pillars
    ctx.fillStyle = '#4a235a';
    ctx.fillRect(-12, -4, 24, 22);
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-14, -16, 4, 30);
    ctx.fillRect(10, -16, 4, 30);

    // Warm double bay windows
    ctx.fillStyle = '#f9e79f';
    ctx.fillRect(-26, -10, 10, 10);
    ctx.fillRect(16, -10, 10, 10);
    ctx.fillStyle = '#6e2c00';
    ctx.fillRect(-22, -10, 1, 10);
    ctx.fillRect(-26, -5, 10, 1);
    ctx.fillRect(20, -10, 1, 10);
    ctx.fillRect(16, -5, 10, 1);

    // Arched Timber Double Doors
    ctx.fillStyle = '#1b4f72';
    ctx.fillRect(-6, 2, 12, 14);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(2, 8, 2, 2);

    // Rustic Cedar Shake Roof
    ctx.fillStyle = '#784212';
    ctx.fillRect(-34, -22, 68, 8);
    ctx.fillStyle = '#a04000';
    ctx.fillRect(-30, -28, 60, 7);
    ctx.fillStyle = '#b9770e';
    ctx.fillRect(-22, -33, 44, 6);
    ctx.fillStyle = '#d4ac0d';
    ctx.fillRect(-14, -36, 28, 4);

    // Antler / Ridge Crest Trophy
    ctx.fillStyle = '#fcf3cf';
    ctx.fillRect(-3, -39, 6, 4);
    ctx.fillRect(-6, -41, 12, 2);

    // Lanterns with ambient glow
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-16, -2, 3, 4);
    ctx.fillRect(13, -2, 3, 4);

    ctx.restore();
  }

  // Draw Imperial Royal Estate Villa (Pinnacle Luxury Tier for Camp 10)
  static drawVilla(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.40)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 46, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Marble Stone Terrace
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(-36, 6, 72, 14);
    ctx.fillStyle = '#d5dbdb';
    ctx.fillRect(-35, 7, 70, 12);

    // Topiary shrubs in ornate pots
    ctx.fillStyle = '#b9770e';
    ctx.fillRect(-33, 7, 6, 6);
    ctx.fillRect(27, 7, 6, 6);
    ctx.fillStyle = '#1e8449';
    ctx.beginPath();
    ctx.arc(-30, 6, 5, 0, Math.PI * 2);
    ctx.arc(30, 6, 5, 0, Math.PI * 2);
    ctx.fill();

    // Grand Manor Walls (Cream Stucco)
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(-32, -20, 64, 28);
    ctx.fillStyle = '#eaeded';
    ctx.fillRect(-30, -18, 60, 24);

    // Royal Columns
    ctx.fillStyle = '#f2f4f4';
    ctx.fillRect(-22, -18, 4, 26);
    ctx.fillRect(-8, -18, 4, 26);
    ctx.fillRect(4, -18, 4, 26);
    ctx.fillRect(18, -18, 4, 26);

    // Royal Red Carpet Runner to Entrance
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-5, 6, 10, 14);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-6, 6, 1, 14);
    ctx.fillRect(5, 6, 1, 14);

    // Mahogany Arched Doors
    ctx.fillStyle = '#4a235a';
    ctx.fillRect(-5, -6, 10, 14);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(2, 0, 2, 2);

    // French Arch Windows with Golden Glow
    ctx.fillStyle = '#fef9e7';
    ctx.fillRect(-28, -12, 5, 12);
    ctx.fillRect(-17, -12, 8, 12);
    ctx.fillRect(9, -12, 8, 12);
    ctx.fillRect(23, -12, 5, 12);

    // Mansard Indigo/Gold Trimmed Roof
    ctx.fillStyle = '#1b2631';
    ctx.fillRect(-34, -26, 68, 8);
    ctx.fillStyle = '#2e4053';
    ctx.fillRect(-30, -32, 60, 7);
    ctx.fillStyle = '#1a5276';
    ctx.fillRect(-24, -38, 48, 7);

    // Gilded Imperial Gold Crest
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-6, -41, 12, 4);
    ctx.fillRect(-3, -44, 6, 4);
    ctx.fillRect(-1, -46, 2, 3);

    ctx.restore();
  }

  // Draw Biome-specific trees (Pine, Palm, Alpine Fir, Cactus, Crystal/Spooky)
  static drawBiomeTree(ctx, x, y, frame = 0, treeType = 'pine', palette = null) {
    if (treeType === 'cherry_blossom') {
      ctx.save();
      ctx.translate(Math.floor(x), Math.floor(y));
      // Shadow
      ctx.fillStyle = 'rgba(20, 40, 20, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      ctx.fillStyle = '#4a2311';
      ctx.fillRect(-3, -12, 6, 14);
      ctx.fillRect(-1, -16, 4, 5);
      // Sakura Blossom Canopy (Soft pink clouds)
      ctx.fillStyle = '#f48fb1';
      ctx.beginPath();
      ctx.arc(-8, -24, 12, 0, Math.PI * 2);
      ctx.arc(8, -24, 12, 0, Math.PI * 2);
      ctx.arc(0, -32, 13, 0, Math.PI * 2);
      ctx.fill();
      // Light blossom highlights
      ctx.fillStyle = '#fce4ec';
      ctx.beginPath();
      ctx.arc(-5, -28, 8, 0, Math.PI * 2);
      ctx.arc(5, -28, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (treeType === 'acacia') {
      ctx.save();
      ctx.translate(Math.floor(x), Math.floor(y));
      // Shadow
      ctx.fillStyle = 'rgba(30, 40, 10, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Slanted acacia trunk
      ctx.fillStyle = '#6e4726';
      ctx.fillRect(-2, -14, 5, 16);
      ctx.fillRect(-6, -22, 5, 9);
      ctx.fillRect(3, -22, 4, 9);
      // Flat umbrella canopy
      ctx.fillStyle = palette?.treeLeaf || '#4d7c0f';
      ctx.fillRect(-20, -27, 40, 5);
      ctx.fillRect(-24, -25, 48, 4);
      ctx.fillStyle = palette?.treeShadow || '#365314';
      ctx.fillRect(-16, -23, 32, 2);
      ctx.restore();
      return;
    }
    if (treeType === 'birch') {
      ctx.save();
      ctx.translate(Math.floor(x), Math.floor(y));
      // Shadow
      ctx.fillStyle = 'rgba(20, 40, 20, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pale white birch trunk with black notches
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(-2, -18, 4, 20);
      ctx.fillStyle = '#1c2833';
      ctx.fillRect(-2, -12, 2, 2);
      ctx.fillRect(0, -6, 2, 2);
      // Birch foliage
      ctx.fillStyle = palette?.treeLeaf || '#84cc16';
      ctx.beginPath();
      ctx.arc(0, -26, 12, 0, Math.PI * 2);
      ctx.arc(0, -36, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (treeType === 'bamboo') {
      ctx.save();
      ctx.translate(Math.floor(x), Math.floor(y));
      // Shadow
      ctx.fillStyle = 'rgba(20, 50, 20, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stalks
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(-6, -34, 3, 36);
      ctx.fillRect(0, -38, 3, 40);
      ctx.fillRect(6, -30, 3, 32);
      // Joints
      ctx.fillStyle = '#365314';
      ctx.fillRect(-7, -24, 5, 1);
      ctx.fillRect(-7, -14, 5, 1);
      ctx.fillRect(-1, -26, 5, 1);
      ctx.fillRect(-1, -16, 5, 1);
      ctx.fillRect(5, -20, 5, 1);
      // Leaves
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(-12, -30, 7, 3);
      ctx.fillRect(2, -36, 8, 3);
      ctx.fillRect(8, -26, 7, 3);
      ctx.restore();
      return;
    }
    if (treeType === 'cypress') {
      ctx.save();
      ctx.translate(Math.floor(x), Math.floor(y));
      // Shadow
      ctx.fillStyle = 'rgba(10, 30, 10, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Slender dark green column spire
      ctx.fillStyle = palette?.treeShadow || '#14532d';
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(-6, -4);
      ctx.lineTo(6, -4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = palette?.treeLeaf || '#166534';
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(0, -4);
      ctx.lineTo(5, -4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }
    if (treeType === 'palm') {
      ctx.save();
      ctx.translate(Math.floor(x), Math.floor(y));
      // Shadow
      ctx.fillStyle = 'rgba(20, 40, 20, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Curved trunk
      ctx.fillStyle = '#b7950b';
      ctx.fillRect(-2, -10, 5, 12);
      ctx.fillRect(0, -22, 5, 13);
      ctx.fillRect(3, -32, 5, 11);
      // Palm fronds
      ctx.fillStyle = palette?.treeLeaf || '#27ae60';
      ctx.fillRect(-16, -34, 18, 4);
      ctx.fillRect(-22, -30, 10, 4);
      ctx.fillRect(8, -34, 18, 4);
      ctx.fillRect(20, -30, 10, 4);
      ctx.fillRect(-6, -38, 16, 5);
      ctx.restore();
      return;
    }
    if (treeType === 'cactus') {
      ctx.save();
      ctx.translate(Math.floor(x), Math.floor(y));
      ctx.fillStyle = 'rgba(40, 30, 10, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Main stem
      ctx.fillStyle = palette?.treeLeaf || '#229954';
      ctx.fillRect(-3, -28, 6, 30);
      // Left arm
      ctx.fillRect(-10, -20, 8, 4);
      ctx.fillRect(-10, -24, 4, 8);
      // Right arm
      ctx.fillRect(2, -16, 8, 4);
      ctx.fillRect(6, -22, 4, 9);
      ctx.restore();
      return;
    }
    // Default Pine with dynamic palette support
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.fillStyle = 'rgba(20, 50, 20, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette?.woodDark || PIXEL_COLORS.woodDark;
    ctx.fillRect(-3, -10, 6, 12);
    ctx.fillStyle = palette?.woodMid || PIXEL_COLORS.woodMid;
    ctx.fillRect(-2, -10, 3, 12);

    const tiers = [
      { y: -14, w: 22, h: 10 },
      { y: -22, w: 18, h: 9 },
      { y: -29, w: 14, h: 8 },
      { y: -36, w: 8, h: 8 }
    ];
    const leafDark = palette?.treeShadow || PIXEL_COLORS.grassDark;
    const leafMid = palette?.treeLeaf || PIXEL_COLORS.grassMid;
    const leafLight = palette?.grassLight || PIXEL_COLORS.grassLight;

    tiers.forEach((t, idx) => {
      ctx.fillStyle = leafDark;
      ctx.fillRect(-t.w / 2 - 1, t.y - 1, t.w + 2, t.h + 2);
      ctx.fillStyle = idx % 2 === 0 ? leafMid : (palette?.treeShadow || '#3d8621');
      ctx.fillRect(-t.w / 2, t.y, t.w, t.h);
      ctx.fillStyle = leafLight;
      ctx.fillRect(-t.w / 2 + 1, t.y, t.w - 2, 2);
      ctx.fillRect(-t.w / 4, t.y, t.w / 2, 3);
    });
    ctx.restore();
  }

  // --- REGIONAL SIGNATURE CAMPING ASSETS (WORLD 1: PLANET EARTH) ---

  // 1. Central Asian Yurt (Kyrgyzstan, Mongolia, Kazakhstan)
  static drawYurt(ctx, x, y, palette = null) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden ring base
    ctx.fillStyle = PIXEL_COLORS.woodDark;
    ctx.fillRect(-22, 6, 44, 4);

    // Cylindrical felt wall (White/Cream felt with red geometric nomad pattern)
    ctx.fillStyle = '#f5f5dc'; // Beige felt
    ctx.fillRect(-20, -4, 40, 10);
    // Red nomad felt band
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-20, -1, 40, 3);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-16, 0, 3, 2);
    ctx.fillRect(-8, 0, 3, 2);
    ctx.fillRect(0, 0, 3, 2);
    ctx.fillRect(8, 0, 3, 2);
    ctx.fillRect(16, 0, 3, 2);

    // Conical Felt Dome Roof
    ctx.fillStyle = '#eaecee';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(-21, -4);
    ctx.lineTo(21, -4);
    ctx.closePath();
    ctx.fill();

    // Shadowed left side
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(-21, -4);
    ctx.lineTo(0, -4);
    ctx.closePath();
    ctx.fill();

    // Tunduk (Sacred Wooden Crown Ring on top)
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.ellipse(0, -22, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-3, -23, 6, 1);
    ctx.fillRect(-1, -24, 2, 3);

    // Wooden carved entrance door
    ctx.fillStyle = '#784212';
    ctx.fillRect(-5, 0, 10, 6);
    ctx.fillStyle = '#d35400';
    ctx.fillRect(-4, 1, 8, 4);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(2, 3, 1, 1); // Brass handle

    // Felt tie ropes
    ctx.fillStyle = '#922b21';
    ctx.fillRect(-14, -13, 28, 1);

    ctx.restore();
  }

  // 2. North American Tipi (Great Plains, Rocky Mountains, Yellowstone)
  static drawTipi(ctx, x, y, palette = null) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 24, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crossing wooden poles extending at top
    ctx.fillStyle = '#784212';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -32); ctx.lineTo(10, -18);
    ctx.moveTo(10, -32); ctx.lineTo(-10, -18);
    ctx.moveTo(0, -34); ctx.lineTo(0, -18);
    ctx.stroke();

    // Conical hide / canvas body
    ctx.fillStyle = '#d7ba89'; // Buckskin / raw canvas tone
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(-19, 8);
    ctx.lineTo(19, 8);
    ctx.closePath();
    ctx.fill();

    // Shading on left
    ctx.fillStyle = 'rgba(80, 50, 20, 0.18)';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(-19, 8);
    ctx.lineTo(0, 8);
    ctx.closePath();
    ctx.fill();

    // Buffalo & Sun motifs (Red & Turquoise painted bands)
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-12, -4, 24, 2);
    ctx.fillStyle = '#16a085';
    ctx.fillRect(-16, 2, 32, 2);

    // Flap opening
    ctx.fillStyle = '#1f1610';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-5, 8);
    ctx.lineTo(5, 8);
    ctx.closePath();
    ctx.fill();

    // Wooden pin pegs closing the seam
    ctx.fillStyle = '#784212';
    ctx.fillRect(-1, -18, 2, 1);
    ctx.fillRect(-1, -14, 2, 1);
    ctx.fillRect(-1, -10, 2, 1);

    ctx.restore();
  }

  // 3. African Safari Glamping Tent (Serengeti, Okavango, Kruger)
  static drawSafariTent(ctx, x, y, palette = null) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Raised Teak Wood Stilt Platform
    ctx.fillStyle = '#563517';
    ctx.fillRect(-24, 5, 48, 5);
    ctx.fillStyle = '#935116';
    ctx.fillRect(-23, 4, 46, 3);
    // Platform stilts
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-22, 9, 3, 5);
    ctx.fillRect(19, 9, 3, 5);
    ctx.fillRect(-2, 9, 3, 5);

    // Safari Khaki Outer Flysheet (Double-roof design against tropical sun)
    ctx.fillStyle = '#a0855b';
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(-22, -6);
    ctx.lineTo(22, -6);
    ctx.closePath();
    ctx.fill();

    // Inner Canvas Tent
    ctx.fillStyle = '#c8b18a';
    ctx.beginPath();
    ctx.moveTo(0, -19);
    ctx.lineTo(-18, 4);
    ctx.lineTo(18, 4);
    ctx.closePath();
    ctx.fill();

    // Front Veranda Opening with roll-up netting
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-8, -6, 16, 10);
    // Rolled up canvas flap
    ctx.fillStyle = '#7d6608';
    ctx.fillRect(-9, -9, 18, 3);

    // Safari camp chairs on deck
    ctx.fillStyle = '#d35400';
    ctx.fillRect(-18, 1, 5, 4);
    ctx.fillRect(13, 1, 5, 4);

    ctx.restore();
  }

  // 4. Bedouin Desert Tent (Sahara, Wadi Rum, Arabian Oasis)
  static drawBedouinTent(ctx, x, y, palette = null) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Low wide goat-hair woven tent (Black & Crimson stripes)
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.moveTo(-24, 4);
    ctx.lineTo(-12, -14);
    ctx.lineTo(12, -14);
    ctx.lineTo(24, 4);
    ctx.lineTo(24, 8);
    ctx.lineTo(-24, 8);
    ctx.closePath();
    ctx.fill();

    // Crimson and cream woven desert stripe
    ctx.fillStyle = '#922b21';
    ctx.fillRect(-18, -4, 36, 3);
    ctx.fillStyle = '#f5b041';
    ctx.fillRect(-16, -3, 32, 1);

    // Front opening showing patterned kilim rug inside
    ctx.fillStyle = '#b03a2e';
    ctx.fillRect(-10, 0, 20, 8);
    ctx.fillStyle = '#f4d03f';
    ctx.fillRect(-8, 3, 16, 2);

    // Wooden support poles
    ctx.fillStyle = '#784212';
    ctx.fillRect(-12, -16, 2, 24);
    ctx.fillRect(10, -16, 2, 24);

    ctx.restore();
  }

  // 5. Alpine Chalet / Berg-Biwak (Alps, Schwarzwald, Dolomites, Patagonia)
  static drawAlpineHut(ctx, x, y, palette = null) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Natural stone foundation
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(-20, 4, 40, 5);
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(-18, 5, 12, 3);

    // Dark Larch log walls
    ctx.fillStyle = '#543217';
    ctx.fillRect(-18, -10, 36, 14);
    ctx.fillStyle = '#784212';
    ctx.fillRect(-17, -8, 34, 3);
    ctx.fillRect(-17, -3, 34, 3);

    // Steep wooden shingle roof with stone weights
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(-24, -8);
    ctx.lineTo(24, -8);
    ctx.closePath();
    ctx.fill();

    // Shingle highlights
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-18, -14, 36, 2);
    ctx.fillRect(-12, -20, 24, 2);

    // Wooden door & Red Geranium window box
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-5, -4, 10, 8);
    ctx.fillStyle = '#e74c3c'; // Geraniums
    ctx.fillRect(9, -7, 6, 2);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(9, -5, 6, 1);

    ctx.restore();
  }

  // 6. Japanese Zen Ryokan Pod (Kyoto, Mount Fuji, East Asia)
  static drawRyokanPod(ctx, x, y, palette = null) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tatami porch platform
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-22, 4, 44, 5);
    ctx.fillStyle = '#d4ac0d'; // Bamboo / tatami edge
    ctx.fillRect(-20, 3, 40, 3);

    // Natural Cedar walls with Shoji paper panels
    ctx.fillStyle = '#784212';
    ctx.fillRect(-18, -12, 36, 15);
    ctx.fillStyle = '#fdfefe'; // White paper screen
    ctx.fillRect(-14, -8, 12, 10);
    ctx.fillRect(2, -8, 12, 10);

    // Shoji lattice grid
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-8, -8, 1, 10);
    ctx.fillRect(-14, -3, 12, 1);
    ctx.fillRect(8, -8, 1, 10);
    ctx.fillRect(2, -3, 12, 1);

    // Traditional curved Pagoda eaves roof
    ctx.fillStyle = '#1c2833';
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(-26, -10);
    ctx.lineTo(26, -10);
    ctx.closePath();
    ctx.fill();

    // Curved roof wing tips
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-26, -12, 3, 3);
    ctx.fillRect(23, -12, 3, 3);

    // Paper lantern hanging on side
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(19, -5, 4, 6);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(20, -3, 2, 2);

    ctx.restore();
  }

  // 7. Tropical Palapa & Bamboo Hut (Bali, Philippines, Caribbean, Hawaii)
  static drawPalapaHut(ctx, x, y, palette = null) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bamboo Stilts
    ctx.fillStyle = '#7d6608';
    ctx.fillRect(-18, 2, 4, 7);
    ctx.fillRect(14, 2, 4, 7);
    ctx.fillRect(-2, 2, 4, 7);

    // Open Bamboo deck
    ctx.fillStyle = '#d4ac0d';
    ctx.fillRect(-20, 0, 40, 4);

    // Thick Thatched Palm Frond Roof (layered golden thatch)
    ctx.fillStyle = '#9a7d0a';
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(-24, -4);
    ctx.lineTo(24, -4);
    ctx.closePath();
    ctx.fill();

    // Thatch fringes
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(-22, -6);
    ctx.lineTo(22, -6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b7950b';
    ctx.fillRect(-22, -4, 44, 2);

    // Tropical Hammock / colorful curtain
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(-10, -2, 8, 4);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(2, -2, 8, 4);

    ctx.restore();
  }

  // 8. Nordic Falu A-Frame (Norway, Lofoten, Lapland, Iceland)
  static drawNordicAFrame(ctx, x, y, palette = null) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Granite foundation
    ctx.fillStyle = '#566573';
    ctx.fillRect(-20, 5, 40, 5);

    // Steep A-frame roof rafters
    ctx.fillStyle = '#212f3d';
    ctx.beginPath();
    ctx.moveTo(0, -27);
    ctx.lineTo(-21, 6);
    ctx.lineTo(21, 6);
    ctx.closePath();
    ctx.fill();

    // Falu-red wooden gable facade
    ctx.fillStyle = '#922b21'; // Traditional Falu Red
    ctx.beginPath();
    ctx.moveTo(0, -23);
    ctx.lineTo(-16, 5);
    ctx.lineTo(16, 5);
    ctx.closePath();
    ctx.fill();

    // Large warm glowing window
    ctx.fillStyle = '#f9e79f';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(-8, -2);
    ctx.lineTo(8, -2);
    ctx.closePath();
    ctx.fill();

    // Dark window framing
    ctx.fillStyle = '#1c2833';
    ctx.fillRect(-1, -18, 2, 16);
    ctx.fillRect(-6, -8, 12, 1);

    // White corner trims (classic Nordic style)
    ctx.fillStyle = '#fdfefe';
    ctx.fillRect(-16, 3, 3, 2);
    ctx.fillRect(13, 3, 3, 2);

    ctx.restore();
  }

  // --- UNIVERSAL REGIONAL PITCH DISPATCHER ---
  static drawPitch(ctx, x, y, tier = 'tent', style = 'classic', frame = 0, palette = null) {
    if (tier === 'tent') {
      switch (style) {
        case 'yurt':
          PixelRenderer.drawYurt(ctx, x, y, palette);
          return;
        case 'tipi':
          PixelRenderer.drawTipi(ctx, x, y, palette);
          return;
        case 'safari':
          PixelRenderer.drawSafariTent(ctx, x, y, palette);
          return;
        case 'bedouin':
          PixelRenderer.drawBedouinTent(ctx, x, y, palette);
          return;
        case 'alpine':
          PixelRenderer.drawAlpineHut(ctx, x, y, palette);
          return;
        case 'ryokan':
          PixelRenderer.drawRyokanPod(ctx, x, y, palette);
          return;
        case 'palapa':
          PixelRenderer.drawPalapaHut(ctx, x, y, palette);
          return;
        case 'nordic':
          PixelRenderer.drawNordicAFrame(ctx, x, y, palette);
          return;
        default:
          PixelRenderer.drawPupTent(ctx, x, y);
          return;
      }
    }

    if (tier === 'caravan') {
      PixelRenderer.drawCaravan(ctx, x, y);
      return;
    }

    if (tier === 'glamping') {
      if (style === 'yurt') {
        PixelRenderer.drawYurt(ctx, x, y, palette);
      } else if (style === 'safari') {
        PixelRenderer.drawSafariTent(ctx, x, y, palette);
      } else if (style === 'ryokan') {
        PixelRenderer.drawRyokanPod(ctx, x, y, palette);
      } else {
        PixelRenderer.drawGlampingDome(ctx, x, y);
      }
      return;
    }

    if (tier === 'cabin') {
      PixelRenderer.drawLogCabin(ctx, x, y);
      return;
    }

    if (tier === 'chalet') {
      PixelRenderer.drawChalet(ctx, x, y);
      return;
    }

    if (tier === 'lodge') {
      PixelRenderer.drawLodge(ctx, x, y);
      return;
    }

    if (tier === 'villa') {
      PixelRenderer.drawVilla(ctx, x, y);
      return;
    }

    // Default fallback
    PixelRenderer.drawPupTent(ctx, x, y);
  }

}


