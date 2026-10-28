import * as THREE from 'three';

/**
 * High-Fidelity Texture Manager
 * Loads the user's reference photo (gmn_gate_ref.png) and extracts authentic textures
 * for the signboard, pillars, gates, shed, and props, with bright, crisp rendering.
 */

export class TextureGenerator {
  static refImage = null;
  static corridorImage = null;
  static realCorridorImage = null;
  static courtyardImage = null;
  static isLoaded = false;
  static isCorridorLoaded = false;
  static isRealCorridorLoaded = false;
  static isCourtyardLoaded = false;
  static callbacks = [];

  static init(onReady) {
    if (this.isLoaded && this.isCorridorLoaded && this.isRealCorridorLoaded && this.isCourtyardLoaded) {
      if (onReady) onReady();
      return;
    }

    if (onReady) this.callbacks.push(onReady);

    let loadedCount = 0;
    const totalToLoad = 4;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        this.callbacks.forEach(cb => cb());
        this.callbacks = [];
      }
    };

    // 1. Gate Reference Image
    const imgGate = new Image();
    imgGate.crossOrigin = 'anonymous';
    imgGate.src = '/assets/gmn_gate_ref.png';
    imgGate.onload = () => {
      this.refImage = imgGate;
      this.isLoaded = true;
      checkDone();
    };
    imgGate.onerror = () => {
      this.isLoaded = false;
      checkDone();
    };

    // 2. Post-Gate Horror Corridor Reference Image
    const imgCorridor = new Image();
    imgCorridor.crossOrigin = 'anonymous';
    imgCorridor.src = '/assets/corridor_ref.jpg';
    imgCorridor.onload = () => {
      this.corridorImage = imgCorridor;
      this.isCorridorLoaded = true;
      checkDone();
    };
    imgCorridor.onerror = () => {
      this.isCorridorLoaded = false;
      checkDone();
    };

    // 3. Real-World GMN Corridor Photo
    const imgReal = new Image();
    imgReal.crossOrigin = 'anonymous';
    imgReal.src = '/assets/gmn_corridor_real.jpg';
    imgReal.onload = () => {
      this.realCorridorImage = imgReal;
      this.isRealCorridorLoaded = true;
      checkDone();
    };
    imgReal.onerror = () => {
      this.isRealCorridorLoaded = false;
      checkDone();
    };

    // 4. Open Moonlit Courtyard Reference Image (from user)
    const imgCourtyard = new Image();
    imgCourtyard.crossOrigin = 'anonymous';
    imgCourtyard.src = '/assets/courtyard_ref.jpg';
    imgCourtyard.onload = () => {
      this.courtyardImage = imgCourtyard;
      this.isCourtyardLoaded = true;
      checkDone();
    };
    imgCourtyard.onerror = () => {
      this.isCourtyardLoaded = false;
      checkDone();
    };
  }

  // Extract a sub-rectangle from the gate photo onto a CanvasTexture
  static extractTexture(sx, sy, sw, sh, targetW = 512, targetH = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    if (this.refImage && this.isLoaded) {
      ctx.drawImage(this.refImage, sx, sy, sw, sh, 0, 0, targetW, targetH);
    } else {
      ctx.fillStyle = '#26343d';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  // Extract sub-rectangle from user's horror corridor reference photo
  static extractCorridorTexture(normX, normY, normW, normH, targetW = 512, targetH = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    const sourceImg = (this.corridorImage && this.isCorridorLoaded) ? this.corridorImage : null;

    if (sourceImg) {
      const iw = sourceImg.naturalWidth || sourceImg.width || 1024;
      const ih = sourceImg.naturalHeight || sourceImg.height || 768;
      const sx = normX * iw;
      const sy = normY * ih;
      const sw = normW * iw;
      const sh = normH * ih;
      ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, targetW, targetH);
    } else {
      ctx.fillStyle = '#161e27';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  static extractRealCorridorTexture(normX, normY, normW, normH, targetW = 512, targetH = 512) {
    return this.extractCorridorTexture(normX, normY, normW, normH, targetW, targetH);
  }

  // Get Full Corridor Reference Image as high-res Texture
  static createCorridorFullRefTexture() {
    const src = (this.corridorImage && this.isCorridorLoaded) ? this.corridorImage : null;
    if (src) {
      const canvas = document.createElement('canvas');
      canvas.width = src.naturalWidth || 1024;
      canvas.height = src.naturalHeight || 768;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(src, 0, 0);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }
    return null;
  }

  // 1. Main Overhead Sign: "G M N COLLEGE AMBALA CANTT"
  static createSignboardTexture() {
    if (this.isLoaded) {
      return this.extractTexture(235, 25, 420, 115, 1024, 280);
    }
    return this.createProceduralSignboard();
  }

  // 2. Left Pillar with "G M N College" Plaque
  static createLeftPillarTexture() {
    if (this.isLoaded) {
      return this.extractTexture(125, 175, 160, 260, 512, 1024);
    }
    return this.createPillarTexture(false);
  }

  // 3. Left Gate Leaf (with Rusted Panels & Overgrown Vines)
  static createLeftGateTexture() {
    if (this.isLoaded) {
      return this.extractTexture(285, 160, 155, 275, 512, 1024);
    }
    return null;
  }

  // 4. Right Gate Leaf (with Rusted Panels & Overgrown Vines)
  static createRightGateTexture() {
    if (this.isLoaded) {
      return this.extractTexture(440, 160, 155, 275, 512, 1024);
    }
    return null;
  }

  // 5. Inner Pillar (between Gate and Right Entrance)
  static createInnerPillarTexture() {
    if (this.isLoaded) {
      return this.extractTexture(595, 175, 70, 260, 256, 1024);
    }
    return this.createPillarTexture(true);
  }

  // 6. Right Pillar / Wall with "Ambala Cantt" Plaque & Blood Handprints
  static createRightPillarTexture() {
    if (this.isLoaded) {
      return this.extractTexture(745, 175, 175, 260, 512, 1024);
    }
    return this.createPillarTexture(true);
  }

  // 7. Right Shed Sloping Corrugated Roof
  static createShedRoofTexture() {
    if (this.isLoaded) {
      return this.extractTexture(580, 70, 360, 140, 512, 256);
    }
    return null;
  }

  // 8. Material Cadet Corps (NCC) Board on Right
  static createCadetBoardTexture() {
    if (this.isLoaded) {
      return this.extractTexture(915, 260, 95, 170, 256, 512);
    }
    return null;
  }

  // 9. Ground Pavement with Cracks & Greenish Puddle
  static createPhotoGroundTexture() {
    if (this.isLoaded) {
      return this.extractTexture(200, 380, 624, 132, 1024, 512);
    }
    return this.createGroundTexture();
  }

  // 10. Background Sky & Silhouette Trees
  static createSkyTexture() {
    if (this.isLoaded) {
      return this.extractTexture(0, 0, 1024, 200, 1024, 256);
    }
    return null;
  }

  // 11. Demon Eyes Texture
  static createDemonEyesTexture() {
    if (this.isLoaded) {
      return this.extractTexture(675, 260, 55, 30, 256, 128);
    }
    return this.createProceduralDemonEyes();
  }

  // Procedural Fallbacks & Specialized Clue Textures
  static createProceduralSignboard() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2b333a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Red border
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#a81c1c';
    ctx.strokeRect(9, 9, canvas.width - 18, canvas.height - 18);

    // Text
    ctx.font = '900 68px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f1f3f5';
    ctx.fillText('G M N  C O L L E G E', 540, 115);

    ctx.font = '700 36px "Cinzel", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('AMBALA CANTT', 540, 215);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  static createPillarTexture(hasHandprints = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const splitY = canvas.height * 0.45;
    ctx.fillStyle = '#e8eaed';
    ctx.fillRect(0, 0, canvas.width, splitY);
    ctx.fillStyle = '#2f5a4a';
    ctx.fillRect(0, splitY, canvas.width, canvas.height - splitY);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  static createProceduralDemonEyes() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const drawEye = (cx, cy) => {
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 38);
      grad.addColorStop(0, 'rgba(255, 30, 30, 1)');
      grad.addColorStop(0.3, 'rgba(255, 0, 0, 0.9)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    drawEye(85, 64);
    drawEye(171, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  static createGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#222830';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Clue 1: Notice Board Texture
  static createNoticeBoardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#4e3b2b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    // Torn paper 1
    ctx.fillStyle = '#f4ecd8';
    ctx.fillRect(50, 60, 180, 200);

    // Emergency Memo (Clue 1)
    ctx.save();
    ctx.translate(210, 150);
    ctx.rotate(0.03);
    ctx.fillStyle = '#fffdf0';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillRect(0, 0, 260, 310);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#c5221f';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('EMERGENCY ORDER', 20, 35);

    ctx.fillStyle = '#1f2937';
    ctx.font = '12px serif';
    ctx.fillText('GMN COLLEGE SECURITY WING', 20, 58);

    ctx.font = '11px sans-serif';
    ctx.fillText('All gates sealed after curfew.', 20, 100);
    ctx.fillText('The last bell rang at:', 20, 125);

    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#c5221f';
    ctx.fillText('07:13 PM', 35, 160);

    ctx.strokeStyle = '#c5221f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(130, 153, 30, 18, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'italic 11px serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText('“Remember the minutes: 13”', 20, 210);

    ctx.restore();

    // Pushpins
    const drawPin = (px, py) => {
      ctx.fillStyle = '#e53e3e';
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
    };
    drawPin(60, 75);
    drawPin(225, 165);
    drawPin(450, 175);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Clue 2: Clock Texture
  static createClockTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Face
    ctx.fillStyle = '#ede5d5';
    ctx.beginPath();
    ctx.arc(256, 256, 235, 0, Math.PI * 2);
    ctx.fill();

    // Rim
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 24;
    ctx.stroke();

    // Numerals
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 36px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('XII', 256, 65);
    ctx.fillText('III', 445, 256);
    ctx.fillText('VI', 256, 445);
    ctx.fillText('IX', 65, 256);

    // Highlight VII
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 44px "Cinzel", serif';
    ctx.fillText('VII', 150, 415);

    // Blood splatters
    ctx.fillStyle = 'rgba(139, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.arc(360, 140, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(150, 415, 30, 0, Math.PI * 2);
    ctx.fill();

    // Hands stopped at 7:13
    ctx.save();
    ctx.translate(256, 256);

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // Hour hand (7)
    ctx.save();
    ctx.rotate((216.5 * Math.PI) / 180);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-6, -105, 12, 115);
    ctx.restore();

    // Minute hand (13)
    ctx.save();
    ctx.rotate((78 * Math.PI) / 180);
    ctx.fillStyle = '#111827';
    ctx.fillRect(-4, -170, 8, 180);
    ctx.restore();

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // ─── Post-Gate Covered Corridor Scene Textures (Reference Image) ─────

  // 12. "OUR TOPPERS" Wooden Honor Roll Board
  static createToppersBoardTexture() {
    return this.extractCorridorTexture(0.865, 0.24, 0.135, 0.35, 1024, 1024);
  }

  // 13. Weathered Building Wall with Bloody "HELP" & Handprints
  static createBloodyHelpWallTexture() {
    return this.extractCorridorTexture(0.84, 0.57, 0.16, 0.23, 1024, 1024);
  }

  // 14. "INSTITUTE BLOCK" Header Board
  static createInstituteSignTexture() {
    return this.extractCorridorTexture(0.645, 0.53, 0.105, 0.075, 1024, 256);
  }

  // 15. Corrugated Industrial Canopy Roof Texture
  static createCorridorRoofTexture() {
    return this.extractCorridorTexture(0.0, 0.0, 1.0, 0.55, 1024, 512);
  }

  // 16. Wet Stone Tile Corridor Floor Texture
  static createCorridorFloorTexture() {
    return this.extractCorridorTexture(0.0, 0.62, 1.0, 0.38, 1024, 1024);
  }

  // 17. Horror Peeking Ghoul Face Texture
  static createPeekingGhostTexture() {
    return this.extractCorridorTexture(0.19, 0.52, 0.075, 0.155, 512, 512);
  }

  // 18. White Dress Ghost Woman (Chudail / Apparition)
  static createApparitionTexture() {
    return this.extractCorridorTexture(0.53, 0.605, 0.038, 0.105, 512, 1024);
  }

  // 19. Vintage 3-Blade Ceiling Fan Texture
  static createCeilingFanTexture() {
    return this.extractCorridorTexture(0.70, 0.0, 0.29, 0.20, 512, 512);
  }

  // 20. Tree Bark Texture
  static createTreeBarkTexture() {
    return this.extractCorridorTexture(0.18, 0.45, 0.09, 0.35, 512, 1024);
  }

  // 21. Stacked Red Bricks with Dripping Blood
  static createBrickStackTexture() {
    return this.extractCorridorTexture(0.825, 0.77, 0.175, 0.23, 512, 512);
  }

  // ─── Open Moonlit Courtyard Scene Textures (from courtyard_ref.jpg) ──

  static extractCourtyardTexture(normX, normY, normW, normH, targetW = 512, targetH = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    const sourceImg = (this.courtyardImage && this.isCourtyardLoaded) ? this.courtyardImage : null;

    if (sourceImg) {
      const iw = sourceImg.naturalWidth || sourceImg.width || 1024;
      const ih = sourceImg.naturalHeight || sourceImg.height || 768;
      const sx = normX * iw;
      const sy = normY * ih;
      const sw = normW * iw;
      const sh = normH * ih;
      ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, targetW, targetH);
    } else {
      ctx.fillStyle = '#101722';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  // 22. Night Sky with Full Glowing Moon
  static createCourtyardMoonSkyTexture() {
    return this.extractCourtyardTexture(0.25, 0.36, 0.50, 0.35, 1024, 768);
  }

  // 23. Background 2-Story Academic College Building
  static createCourtyardBuildingTexture() {
    return this.extractCourtyardTexture(0.35, 0.56, 0.32, 0.25, 1024, 512);
  }

  // 24. Right Building Ivy Facade Wall & Windows
  static createCourtyardIvyWallTexture() {
    return this.extractCourtyardTexture(0.63, 0.38, 0.37, 0.55, 1024, 1024);
  }

  // 25. Left Fence, Torn Yellow Banner, & Posters
  static createCourtyardBannerFenceTexture() {
    return this.extractCourtyardTexture(0.0, 0.40, 0.35, 0.45, 1024, 1024);
  }

  // 26. Center Overgrown Planter / Bush
  static createCourtyardBushTexture() {
    return this.extractCourtyardTexture(0.40, 0.74, 0.20, 0.18, 512, 512);
  }

  // 27. Rusted Overgrown Abandoned Car (Lower Left)
  static createCourtyardRustedCarTexture() {
    return this.extractCourtyardTexture(0.0, 0.75, 0.26, 0.24, 512, 512);
  }

  // 28. Wet Courtyard Tile Pavement with Autumn Leaves
  static createCourtyardPavementTexture() {
    return this.extractCourtyardTexture(0.0, 0.78, 1.0, 0.22, 1024, 1024);
  }
}
