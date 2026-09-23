// World Biomes & Campsite Scale Configurations
export const WORLD_BIOMES = [
  {
    id: 'forest',
    name: 'Pine Haven Forest',
    theme: 'Meadow & Pines',
    treeType: 'pine',
    palette: {
      grassLight: '#62b535',
      grassMid: '#4b9824',
      grassDark: '#367219',
      dirtMid: '#cf9e54',
      dirtDark: '#996f30',
      waterLight: '#5dade2',
      waterMid: '#2980b9',
      waterDark: '#1b4f72',
      treeLeaf: '#4b9824',
      treeShadow: '#367219'
    }
  },
  {
    id: 'coastal',
    name: 'Azure Cove Coast',
    theme: 'Sandy Beach & Palm Bay',
    treeType: 'palm',
    palette: {
      grassLight: '#f9e79f',
      grassMid: '#f5cba7',
      grassDark: '#d4ac0d',
      dirtMid: '#e59866',
      dirtDark: '#ba4a00',
      waterLight: '#48c9b0',
      waterMid: '#1abc9c',
      waterDark: '#117864',
      treeLeaf: '#27ae60',
      treeShadow: '#196f3d'
    }
  },
  {
    id: 'alpine',
    name: 'Alpine Peak Ridge',
    theme: 'Snowy Conifers & Crisp Air',
    treeType: 'pine',
    palette: {
      grassLight: '#d5dbdb',
      grassMid: '#aeb6bf',
      grassDark: '#566573',
      dirtMid: '#85929e',
      dirtDark: '#34495e',
      waterLight: '#aed6f1',
      waterMid: '#5dade2',
      waterDark: '#2874a6',
      treeLeaf: '#2e4053',
      treeShadow: '#1b2631'
    }
  },
  {
    id: 'desert',
    name: 'Sunfire Canyon Oasis',
    theme: 'Cactus Groves & Red Rocks',
    treeType: 'cactus',
    palette: {
      grassLight: '#f8c471',
      grassMid: '#eb984e',
      grassDark: '#ca6f1e',
      dirtMid: '#d35400',
      dirtDark: '#873600',
      waterLight: '#76d7c4',
      waterMid: '#17a589',
      waterDark: '#117a65',
      treeLeaf: '#1e8449',
      treeShadow: '#145a32'
    }
  },
  {
    id: 'mystic',
    name: 'Emerald Whispers Valley',
    theme: 'Luminescent Flora & Ancient Trees',
    treeType: 'pine',
    palette: {
      grassLight: '#a3e4d7',
      grassMid: '#48c9b0',
      grassDark: '#16a085',
      dirtMid: '#bb8fce',
      dirtDark: '#6c3483',
      waterLight: '#bb8fce',
      waterMid: '#8e44ad',
      waterDark: '#512e5f',
      treeLeaf: '#117864',
      treeShadow: '#0e6251'
    }
  }
];

export function getCampKey(world = 1, region = 1, camp = 1) {
  return `w${world}_r${region}_c${camp}`;
}

export const CAMP_MAP_CONFIGS = [
  { camp: 1, w: 380, h: 540, pitches: 4, name: 'Forest Outpost', tier: 'Starter Glade' },
  { camp: 2, w: 420, h: 600, pitches: 5, name: 'Trailside Camp', tier: 'Expanding Clearing' },
  { camp: 3, w: 465, h: 670, pitches: 6, name: 'Riverbend Park', tier: 'Lakeside Camp' },
  { camp: 4, w: 515, h: 740, pitches: 7, name: 'Meadow Valley', tier: 'Holiday Meadow' },
  { camp: 5, w: 570, h: 820, pitches: 8, name: 'Pine Ridge Resort', tier: 'Active Resort' },
  { camp: 6, w: 630, h: 900, pitches: 9, name: 'Sunny Oasis Park', tier: 'Holiday Park' },
  { camp: 7, w: 690, h: 980, pitches: 10, name: 'Mountain Haven', tier: 'Luxury Alpine Resort' },
  { camp: 8, w: 750, h: 1060, pitches: 11, name: 'Emerald Wilderness', tier: 'Expansive Eco Paradise' },
  { camp: 9, w: 810, h: 1140, pitches: 12, name: 'Grand Vista Resort', tier: 'Mega Vacation Complex' },
  { camp: 10, w: 880, h: 1240, pitches: 13, name: 'Imperial Empire Sanctuary', tier: 'Imperial Grand Resort' }
];

export function getCampSizeInfo(camp = 1) {
  const c = CAMP_MAP_CONFIGS[Math.min(9, Math.max(0, camp - 1))];
  return {
    ...c,
    size: `${c.w}x${c.h}`
  };
}

export { EARTH_REGIONS_100, getEarthRegionDef } from './earth100.js';

