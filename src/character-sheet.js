import * as THREE from 'three';

/**
 * Character Roster & Portrait Manager
 * Features the Tactical Archer Hero (from user's reference photo) as primary hero
 */

const CHAR_CROPS = {
  0: [10,   10,  140, 290],  // Lucas (Archer)
  1: [210,  10,  140, 290],  // Ben    (row 0, col 1)
  2: [415,  10,  140, 290],  // Chloe  (row 0, col 2)
  3: [618,  10,  140, 290],  // David  (row 0, col 3)
  4: [820,  10,  140, 290],  // Emma   (row 0, col 4)
  5: [10,   310, 140, 290],  // Ethan  (row 1, col 0)
  6: [210,  310, 140, 290],  // Grace  (row 1, col 1)
  7: [415,  310, 140, 290],  // Henry  (row 1, col 2)
  8: [618,  310, 140, 290],  // Isha   (row 1, col 3)
  9: [820,  310, 140, 290],  // Jay    (row 1, col 4)
};

export const CHAR_NAMES = [
  'LUCAS', 'BEN', 'CHLOE', 'DAVID', 'EMMA',
  'ETHAN', 'GRACE', 'HENRY', 'ISHA', 'JAY'
];

export const CHAR_ACCENTS = [
  '#00d4ff', // Lucas - Star Player Cyan
  '#3182ce', // Ben   - Blue
  '#d69e2e', // Chloe - Gold
  '#38a169', // David - Green
  '#805ad5', // Emma  - Purple
  '#00b4d8', // Ethan - Cyan
  '#d53f8c', // Grace - Pink
  '#319795', // Henry - Teal
  '#553c9e', // Isha  - Indigo
  '#dd6b20', // Jay   - Orange
];

export const CHAR_BRANCHES = [
  'STAR OPERATIVE • SQUAD LEAD', 'ELEC ENG', 'CIVIL ENG', 'COMP SCI', 'BIOTECH',
  'IT ENG', 'SOFTWARE ENG', 'CYBER TECH', 'CHEM ENG', 'GAME DEV'
];

export const CHAR_GEAR = [
  'Padded Combat Suit & Tactical Assault Rifle Holster',
  'Multimeter & High-Voltage Field Rig',
  'Surveyor Hardhat & Blueprint Tube',
  'Cyber Specs & Data Pad Scanner',
  'Bio-Sensor & Field Medical Satchel',
  'Long-Range Comms Rig & Street Jacket',
  'Developer Cap & Tech Sling Pack',
  'Cyber Diagnostic Holster & Cables',
  'Safety Goggles & Protective Satchel',
  'Studio Headset & Urban Parka'
];

export const CHAR_QUOTES = [
  '“Stay in formation. When the gates breach, weapons hot.”',
  '“High voltage connects all sector grids.”',
  '“Solid architecture always stands the test of time.”',
  '“Every lock has an algorithm waiting to be solved.”',
  '“Molecular changes reveal hidden campus secrets.”',
  '“Keep the emergency network online at all costs.”',
  '“Writing solutions under extreme danger.”',
  '“No firewall or mechanical gate stays sealed.”',
  '“Chemistry illuminates what darkness conceals.”',
  '“Explore every corridor. Debug every clue.”'
];

export class CharacterSheetManager {
  constructor() {
    this.img = null;
    this.isLoaded = false;
    this.pendingCallbacks = [];
    this.portraitDataURLs = new Array(10).fill(null);
    this.customCallsign = 'LUCAS';
  }

  load(onReady) {
    if (this.isLoaded) {
      if (onReady) onReady();
      return;
    }

    if (onReady) this.pendingCallbacks.push(onReady);
    if (this.img) return;

    // Load custom hero portrait for slot 0
    this.portraitDataURLs[0] = '/assets/archer_portrait.jpg';

    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.img.src = '/assets/gmn_characters.jpg';

    this.img.onload = () => {
      this.isLoaded = true;
      this._generateAllCrops();
      this.pendingCallbacks.forEach(cb => cb());
      this.pendingCallbacks = [];
    };

    this.img.onerror = () => {
      console.warn('Character sheet image failed to load, using generated portraits');
      this._generateProceduralPortraits();
      this.isLoaded = true;
      this.pendingCallbacks.forEach(cb => cb());
      this.pendingCallbacks = [];
    };
  }

  _generateAllCrops() {
    // Slot 0 is always our tactical archer hero
    this.portraitDataURLs[0] = '/assets/archer_portrait.jpg';

    for (let i = 1; i < 10; i++) {
      const [sx, sy, sw, sh] = CHAR_CROPS[i];
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(this.img, sx, sy, sw, sh, 0, 0, sw, sh);
      this.portraitDataURLs[i] = canvas.toDataURL('image/png');
    }
  }

  _generateProceduralPortraits() {
    this.portraitDataURLs[0] = '/assets/archer_portrait.jpg';

    for (let i = 1; i < 10; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const col = CHAR_ACCENTS[i];

      ctx.fillStyle = '#0e1726';
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = col;
      ctx.font = 'bold 36px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(CHAR_NAMES[i], 128, 110);

      ctx.font = '18px Outfit, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(CHAR_BRANCHES[i], 128, 160);

      this.portraitDataURLs[i] = canvas.toDataURL('image/png');
    }
  }

  setCallsign(name) {
    this.customCallsign = (name && name.trim()) ? name.trim().toUpperCase() : 'LUCAS';
  }

  getPortraitDataURL(charIndex) {
    return this.portraitDataURLs[charIndex] || '/assets/archer_portrait.jpg';
  }

  getHeroName(charIndex) {
    if (this.customCallsign && this.customCallsign !== CHAR_NAMES[charIndex]) {
      return this.customCallsign;
    }
    return CHAR_NAMES[charIndex] || 'LUCAS';
  }

  getHeroAccent(charIndex) {
    return CHAR_ACCENTS[charIndex] || '#00d4ff';
  }

  getHeroBranch(charIndex) {
    return CHAR_BRANCHES[charIndex] || 'STAR PLAYER';
  }
}

export const charSheet = new CharacterSheetManager();
