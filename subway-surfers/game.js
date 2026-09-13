/**
 * SUBWAY SURFERS: CYBER RUN — Full 3D Endless Runner Game Engine
 * Built with Three.js (r128) & Web Audio API
 */

(function () {
  'use strict';

  // ==========================================================================
  // CONFIGURATION & CONSTANTS
  // ==========================================================================
  const LANE_WIDTH = 2.6;
  const LANES = [-LANE_WIDTH, 0, LANE_WIDTH]; // Left (-2.6), Center (0), Right (2.6)
  const BASE_SPEED = 24.0;
  const MAX_SPEED = 48.0;
  const SPEED_ACCELERATION = 0.35; // Speed increase per 100 meters
  const GRAVITY = -42.0;
  const JUMP_VELOCITY_NORMAL = 14.5;
  const JUMP_VELOCITY_SNEAKERS = 20.0;
  const SLIDE_DURATION = 0.75;
  const HOVERBOARD_DURATION = 15.0;

  // ==========================================================================
  // GAME STATE
  // ==========================================================================
  const state = {
    running: false,
    paused: false,
    gameOver: false,
    score: 0,
    highScore: 0,
    coinsCollectedRun: 0,
    totalCoins: 0,
    distanceRun: 0,
    speed: BASE_SPEED,
    scoreMultiplier: 1,

    // Player State
    currentLane: 1, // 0: Left, 1: Center, 2: Right
    targetX: 0,
    yVelocity: 0,
    isGrounded: true,
    isSliding: false,
    slideTimer: 0,
    currentGroundY: 0,

    // Power-up States
    powerups: {
      magnet: { active: false, timer: 0, maxTime: 10, level: 1 },
      sneakers: { active: false, timer: 0, maxTime: 10, level: 1 },
      multiplier: { active: false, timer: 0, maxTime: 12, level: 1 },
      hoverboard: { active: false, timer: 0, maxTime: HOVERBOARD_DURATION, stock: 3 },
    },

    soundEnabled: true,
  };

  // Upgrades Pricing & Stats
  const UPGRADES = {
    magnet: { baseCost: 150, costMult: 1.8, durationPerLevel: 2.5 },
    sneakers: { baseCost: 150, costMult: 1.8, durationPerLevel: 2.5 },
    multiplier: { baseCost: 200, costMult: 2.0, durationPerLevel: 3.0 },
    hoverboardStock: { cost: 250, count: 3 },
  };

  // ==========================================================================
  // DOM REFERENCES
  // ==========================================================================
  const container = document.getElementById('game-canvas-container');
  const hudScore = document.getElementById('hud-score');
  const hudHighScore = document.getElementById('hud-highscore');
  const hudMultiplier = document.getElementById('hud-multiplier');
  const hudCoins = document.getElementById('hud-coins');
  const hudPauseBtn = document.getElementById('hud-pause-btn');
  const powerupTray = document.getElementById('powerup-tray');
  const quickBoardBtn = document.getElementById('quick-board-btn');
  const boardStockCount = document.getElementById('board-stock-count');

  // Menus
  const startScreen = document.getElementById('start-screen');
  const startRunBtn = document.getElementById('start-run-btn');
  const openShopBtn = document.getElementById('open-shop-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundToggleIcon = document.getElementById('sound-toggle-icon');
  const soundStatusText = document.getElementById('sound-status-text');

  const gameOverScreen = document.getElementById('game-over-screen');
  const restartRunBtn = document.getElementById('restart-run-btn');
  const gameoverShopBtn = document.getElementById('gameover-shop-btn');
  const finalScoreEl = document.getElementById('final-score');
  const finalCoinsEl = document.getElementById('final-coins');
  const finalBestEl = document.getElementById('final-best');
  const newRecordBadge = document.getElementById('new-record-badge');

  const shopScreen = document.getElementById('shop-screen');
  const closeShopBtn = document.getElementById('close-shop-btn');
  const shopTotalCoins = document.getElementById('shop-total-coins');
  const buyMagnetBtn = document.getElementById('buy-magnet-btn');
  const buySneakersBtn = document.getElementById('buy-sneakers-btn');
  const buyMultiplierBtn = document.getElementById('buy-multiplier-btn');
  const buyHoverboardBtn = document.getElementById('buy-hoverboard-btn');
  const shopBoardStock = document.getElementById('shop-board-stock');

  const pauseScreen = document.getElementById('pause-screen');
  const resumeBtn = document.getElementById('resume-btn');
  const pauseRestartBtn = document.getElementById('pause-restart-btn');
  const pauseQuitBtn = document.getElementById('pause-quit-btn');

  // ==========================================================================
  // WEB AUDIO API SYNTHESIZER
  // ==========================================================================
  let audioCtx = null;
  let bgBeatTimer = null;
  let beatStep = 0;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSynth(freq, type, duration, startTime = 0, gainLevel = 0.15) {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime + startTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  const Sound = {
    lane() {
      initAudio();
      playSynth(340, 'triangle', 0.08, 0, 0.12);
      playSynth(520, 'sine', 0.1, 0.02, 0.1);
    },
    jump() {
      initAudio();
      playSynth(440, 'sine', 0.16, 0, 0.18);
      playSynth(680, 'triangle', 0.22, 0.04, 0.2);
    },
    slide() {
      initAudio();
      playSynth(220, 'sawtooth', 0.12, 0, 0.08);
      playSynth(180, 'triangle', 0.18, 0.05, 0.1);
    },
    coin() {
      initAudio();
      const pitch = 987.77 + Math.random() * 200; // B5 chime
      playSynth(pitch, 'sine', 0.09, 0, 0.14);
      playSynth(pitch * 1.5, 'sine', 0.12, 0.03, 0.1);
    },
    powerup() {
      initAudio();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((f, idx) => playSynth(f, 'triangle', 0.22, idx * 0.06, 0.18));
    },
    boardOn() {
      initAudio();
      playSynth(260, 'sawtooth', 0.25, 0, 0.15);
      playSynth(520, 'sine', 0.35, 0.08, 0.2);
      playSynth(1040, 'triangle', 0.45, 0.15, 0.15);
    },
    crash() {
      initAudio();
      playSynth(130, 'sawtooth', 0.4, 0, 0.3);
      playSynth(90, 'triangle', 0.5, 0.05, 0.35);
    },
  };

  // Rhythmic Arcade Pulse Beat
  function startBgBeat() {
    if (bgBeatTimer) clearInterval(bgBeatTimer);
    beatStep = 0;
    bgBeatTimer = setInterval(() => {
      if (!state.running || state.paused || state.gameOver || !state.soundEnabled) return;
      initAudio();
      const step = beatStep % 8;
      // Kick drum simulation
      if (step === 0 || step === 4) {
        playSynth(65, 'triangle', 0.14, 0, 0.18);
      }
      // Hi-hat simulation
      if (step % 2 === 1) {
        playSynth(1400, 'sine', 0.03, 0, 0.03);
      }
      // Synth bass note
      if (step === 2 || step === 6) {
        playSynth(110, 'sine', 0.12, 0, 0.08);
      }
      beatStep++;
    }, 170);
  }

  function stopBgBeat() {
    if (bgBeatTimer) {
      clearInterval(bgBeatTimer);
      bgBeatTimer = null;
    }
  }

  // ==========================================================================
  // THREE.JS 3D WORLD & GRAPHICS ENGINE
  // ==========================================================================
  let scene, camera, renderer;
  let playerGroup, playerMesh, hoverboardMesh, shadowMesh;
  let trackSegments = [];
  const TRACK_SEGMENT_LENGTH = 50;
  const TRACK_SEGMENT_COUNT = 7;
  const VISIBLE_DISTANCE = TRACK_SEGMENT_LENGTH * TRACK_SEGMENT_COUNT;

  // Active game world objects
  let activeObstacles = [];
  let activeCoins = [];
  let activePowerups = [];
  let activeParticles = [];

  // Materials Cache for efficiency
  const materials = {
    ground: new THREE.MeshLambertMaterial({ color: 0x12141f }),
    rail: new THREE.MeshStandardMaterial({ color: 0x7b879d, metalness: 0.85, roughness: 0.2 }),
    tie: new THREE.MeshLambertMaterial({ color: 0x221f28 }),
    neonCyan: new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
    neonMagenta: new THREE.MeshBasicMaterial({ color: 0xff007f }),
    goldCoin: new THREE.MeshStandardMaterial({ color: 0xffbe0b, metalness: 0.9, roughness: 0.15 }),
    trainBody: new THREE.MeshStandardMaterial({ color: 0x262f48, roughness: 0.4 }),
    trainStripe: new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
    trainGlass: new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.1 }),
    barrierRed: new THREE.MeshStandardMaterial({ color: 0xdd2244, roughness: 0.4 }),
    barrierYellow: new THREE.MeshStandardMaterial({ color: 0xffbe0b, roughness: 0.4 }),
    playerSkin: new THREE.MeshLambertMaterial({ color: 0xffdbac }),
    playerHoodie: new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.3 }),
    playerPants: new THREE.MeshStandardMaterial({ color: 0x141824, roughness: 0.6 }),
    playerShoes: new THREE.MeshStandardMaterial({ color: 0xff007f }),
    hoverboard: new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00aa55, emissiveIntensity: 0.5 }),
  };

  function initThree() {
    // 1. Scene & Fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c16);
    scene.fog = new THREE.FogExp2(0x0a0c16, 0.012);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 4.2, 5.8);
    camera.lookAt(0, 1.5, -12);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff4e6, 0.85);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    // Cyber Track Lights
    const cyanPoint = new THREE.PointLight(0x00f0ff, 1.2, 35);
    cyanPoint.position.set(-6, 4, -10);
    scene.add(cyanPoint);

    const pinkPoint = new THREE.PointLight(0xff007f, 1.2, 35);
    pinkPoint.position.set(6, 4, -10);
    scene.add(pinkPoint);

    // 5. Build Environment Track Segments
    buildTrackSegments();

    // 6. Build Player Avatar
    buildPlayer();

    // 7. Handle Window Resize
    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ==========================================================================
  // TRACK ENVIRONMENT GENERATION
  // ==========================================================================
  function createTrackSegment(zPos) {
    const group = new THREE.Group();
    group.position.z = zPos;

    // Ground Roadbed
    const groundGeo = new THREE.PlaneGeometry(12, TRACK_SEGMENT_LENGTH);
    const groundMesh = new THREE.Mesh(groundGeo, materials.ground);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    group.add(groundMesh);

    // Railroad Ties & Metal Rails across the 3 Lanes
    LANES.forEach(laneX => {
      // 2 Rails per lane
      const railGeo = new THREE.BoxGeometry(0.12, 0.16, TRACK_SEGMENT_LENGTH);
      const leftRail = new THREE.Mesh(railGeo, materials.rail);
      leftRail.position.set(laneX - 0.75, 0.08, 0);
      group.add(leftRail);

      const rightRail = new THREE.Mesh(railGeo, materials.rail);
      rightRail.position.set(laneX + 0.75, 0.08, 0);
      group.add(rightRail);

      // Wooden Ties
      const tieCount = 20;
      const tieSpacing = TRACK_SEGMENT_LENGTH / tieCount;
      const tieGeo = new THREE.BoxGeometry(1.8, 0.1, 0.4);

      for (let i = 0; i < tieCount; i++) {
        const tieMesh = new THREE.Mesh(tieGeo, materials.tie);
        tieMesh.position.set(laneX, 0.05, -TRACK_SEGMENT_LENGTH / 2 + i * tieSpacing);
        group.add(tieMesh);
      }
    });

    // Overhead Tunnel Arch / Portal at the start of segment
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 0);

    const pillarGeo = new THREE.BoxGeometry(0.4, 6, 0.4);
    const leftPillar = new THREE.Mesh(pillarGeo, materials.trainBody);
    leftPillar.position.set(-6, 3, 0);
    archGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, materials.trainBody);
    rightPillar.position.set(6, 3, 0);
    archGroup.add(rightPillar);

    const beamGeo = new THREE.BoxGeometry(12.4, 0.4, 0.4);
    const topBeam = new THREE.Mesh(beamGeo, materials.trainBody);
    topBeam.position.set(0, 6, 0);
    archGroup.add(topBeam);

    // Neon Accent Light on Beam
    const neonGeo = new THREE.BoxGeometry(8, 0.1, 0.45);
    const neonMesh = new THREE.Mesh(neonGeo, Math.random() > 0.5 ? materials.neonCyan : materials.neonMagenta);
    neonMesh.position.set(0, 5.9, 0);
    archGroup.add(neonMesh);

    group.add(archGroup);

    scene.add(group);
    return group;
  }

  function buildTrackSegments() {
    for (let i = 0; i < TRACK_SEGMENT_COUNT; i++) {
      const seg = createTrackSegment(-i * TRACK_SEGMENT_LENGTH);
      trackSegments.push(seg);
    }
  }

  // ==========================================================================
  // PLAYER 3D AVATAR & RIG
  // ==========================================================================
  function buildPlayer() {
    playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 0);

    // Body container for squash & roll animations
    playerMesh = new THREE.Group();

    // 1. Torso (Hoodie)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    const torso = new THREE.Mesh(torsoGeo, materials.playerHoodie);
    torso.position.y = 1.05;
    torso.castShadow = true;
    playerMesh.add(torso);

    // Neon stripe across torso
    const stripeGeo = new THREE.BoxGeometry(0.72, 0.12, 0.47);
    const stripe = new THREE.Mesh(stripeGeo, materials.neonMagenta);
    stripe.position.y = 1.05;
    playerMesh.add(stripe);

    // 2. Head
    const headGeo = new THREE.BoxGeometry(0.48, 0.48, 0.48);
    const head = new THREE.Mesh(headGeo, materials.playerSkin);
    head.position.y = 1.72;
    head.castShadow = true;
    playerMesh.add(head);

    // Cyber Cap / Visor (backward cap)
    const capGeo = new THREE.BoxGeometry(0.52, 0.18, 0.52);
    const cap = new THREE.Mesh(capGeo, materials.playerShoes);
    cap.position.set(0, 1.9, 0);
    playerMesh.add(cap);

    const visorGeo = new THREE.BoxGeometry(0.46, 0.06, 0.25);
    const visor = new THREE.Mesh(visorGeo, materials.playerShoes);
    visor.position.set(0, 1.86, 0.35);
    playerMesh.add(visor);

    // 3. Limbs (Arms & Legs)
    const limbGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);

    // Left Leg
    const leftLeg = new THREE.Mesh(limbGeo, materials.playerPants);
    leftLeg.position.set(-0.2, 0.35, 0);
    leftLeg.name = 'leftLeg';
    leftLeg.castShadow = true;
    playerMesh.add(leftLeg);

    // Right Leg
    const rightLeg = new THREE.Mesh(limbGeo, materials.playerPants);
    rightLeg.position.set(0.2, 0.35, 0);
    rightLeg.name = 'rightLeg';
    rightLeg.castShadow = true;
    playerMesh.add(rightLeg);

    // Left Arm
    const leftArm = new THREE.Mesh(limbGeo, materials.playerSkin);
    leftArm.position.set(-0.48, 1.05, 0);
    leftArm.name = 'leftArm';
    playerMesh.add(leftArm);

    // Right Arm
    const rightArm = new THREE.Mesh(limbGeo, materials.playerSkin);
    rightArm.position.set(0.48, 1.05, 0);
    rightArm.name = 'rightArm';
    playerMesh.add(rightArm);

    // 4. Hoverboard Mesh (hidden by default)
    const boardGeo = new THREE.BoxGeometry(0.9, 0.1, 1.8);
    hoverboardMesh = new THREE.Mesh(boardGeo, materials.hoverboard);
    hoverboardMesh.position.set(0, 0.1, 0);
    hoverboardMesh.visible = false;
    playerGroup.add(hoverboardMesh);

    // 5. Fake Dynamic Ground Shadow
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
    });
    shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    playerGroup.add(shadowMesh);

    playerGroup.add(playerMesh);
    scene.add(playerGroup);
  }

  // ==========================================================================
  // PROCEDURAL OBSTACLES, COINS & POWERUPS
  // ==========================================================================
  function createTrain(zPos, lane) {
    const group = new THREE.Group();
    const length = 22;
    const width = 2.2;
    const height = 3.2;

    group.position.set(LANES[lane], 0, zPos);

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(width, height, length);
    const bodyMesh = new THREE.Mesh(bodyGeo, materials.trainBody);
    bodyMesh.position.y = height / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    // Neon Accent Side Stripes
    const stripeGeo = new THREE.BoxGeometry(width + 0.05, 0.3, length);
    const stripeMesh = new THREE.Mesh(stripeGeo, materials.neonCyan);
    stripeMesh.position.y = 1.8;
    group.add(stripeMesh);

    // Glowing Front Headlights
    const lightGeo = new THREE.BoxGeometry(0.4, 0.4, 0.1);
    const leftLight = new THREE.Mesh(lightGeo, materials.goldCoin);
    leftLight.position.set(-0.7, 1.2, length / 2 + 0.05);
    group.add(leftLight);

    const rightLight = new THREE.Mesh(lightGeo, materials.goldCoin);
    rightLight.position.set(0.7, 1.2, length / 2 + 0.05);
    group.add(rightLight);

    // Train Ramp at the back to run up
    const rampGeo = new THREE.BoxGeometry(width, 0.3, 4);
    const rampMesh = new THREE.Mesh(rampGeo, materials.rail);
    rampMesh.position.set(0, 1.6, length / 2 + 2);
    rampMesh.rotation.x = -Math.PI / 8;
    group.add(rampMesh);

    // Spawn Coins on Train Roof!
    const coinCount = 5;
    for (let i = 0; i < coinCount; i++) {
      const coin = createCoin(zPos - length / 2 + i * (length / coinCount), lane, height + 0.7);
      activeCoins.push(coin);
    }

    group.userData = {
      type: 'train',
      lane: lane,
      box: new THREE.Box3(),
      roofY: height,
    };

    scene.add(group);
    return group;
  }

  function createLowHurdle(zPos, lane) {
    const group = new THREE.Group();
    group.position.set(LANES[lane], 0, zPos);

    // Low Barrier (Must Jump)
    const barGeo = new THREE.BoxGeometry(2.2, 0.9, 0.3);
    const barMesh = new THREE.Mesh(barGeo, materials.barrierYellow);
    barMesh.position.y = 0.45;
    barMesh.castShadow = true;
    group.add(barMesh);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.15, 0.9, 0.6);
    const leftLeg = new THREE.Mesh(legGeo, materials.trainBody);
    leftLeg.position.set(-0.95, 0.45, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, materials.trainBody);
    rightLeg.position.set(0.95, 0.45, 0);
    group.add(rightLeg);

    group.userData = {
      type: 'hurdle',
      lane: lane,
      box: new THREE.Box3(),
      height: 0.9,
    };

    scene.add(group);
    return group;
  }

  function createHighBarrier(zPos, lane) {
    const group = new THREE.Group();
    group.position.set(LANES[lane], 0, zPos);

    // High Clearance Barrier (Must Roll / Slide Under)
    const beamGeo = new THREE.BoxGeometry(2.2, 1.4, 0.3);
    const beamMesh = new THREE.Mesh(beamGeo, materials.barrierRed);
    beamMesh.position.y = 2.4; // Hanging high: ground opening is 1.7 units
    beamMesh.castShadow = true;
    group.add(beamMesh);

    // Tall Posts
    const postGeo = new THREE.BoxGeometry(0.15, 3.2, 0.3);
    const leftPost = new THREE.Mesh(postGeo, materials.trainBody);
    leftPost.position.set(-1.0, 1.6, 0);
    group.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, materials.trainBody);
    rightPost.position.set(1.0, 1.6, 0);
    group.add(rightPost);

    group.userData = {
      type: 'high_barrier',
      lane: lane,
      box: new THREE.Box3(),
      clearanceBottom: 1.65,
    };

    scene.add(group);
    return group;
  }

  function createCoin(zPos, lane, yPos = 0.8) {
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
    const coinMesh = new THREE.Mesh(coinGeo, materials.goldCoin);
    coinMesh.rotation.x = Math.PI / 2;
    coinMesh.position.set(LANES[lane], yPos, zPos);

    coinMesh.userData = {
      type: 'coin',
      lane: lane,
      collected: false,
    };

    scene.add(coinMesh);
    return coinMesh;
  }

  function createPowerup(zPos, lane, type) {
    const group = new THREE.Group();
    group.position.set(LANES[lane], 1.2, zPos);

    // Glowing outer bubble
    const bubbleGeo = new THREE.SphereGeometry(0.5, 16, 16);
    let bubbleMat;
    if (type === 'magnet') bubbleMat = materials.neonMagenta;
    else if (type === 'sneakers') bubbleMat = materials.neonCyan;
    else if (type === 'multiplier') bubbleMat = materials.goldCoin;
    else bubbleMat = materials.hoverboard;

    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    group.add(bubble);

    group.userData = {
      type: type,
      lane: lane,
      collected: false,
    };

    scene.add(group);
    return group;
  }

  // Obstacle Spawner Pattern Manager
  let nextSpawnZ = -35;

  function spawnWave() {
    const spawnZ = nextSpawnZ;
    const patternType = Math.floor(Math.random() * 5);

    // Choose random lane configurations (0: Left, 1: Center, 2: Right)
    if (patternType === 0) {
      // Single Train on one lane, Coins on another
      const trainLane = Math.floor(Math.random() * 3);
      const coinLane = (trainLane + 1) % 3;
      activeObstacles.push(createTrain(spawnZ, trainLane));

      for (let i = 0; i < 4; i++) {
        activeCoins.push(createCoin(spawnZ - 8 + i * 4, coinLane));
      }
      nextSpawnZ -= 38;
    } else if (patternType === 1) {
      // Two Hurdles (one lane clear to jump or switch)
      const freeLane = Math.floor(Math.random() * 3);
      for (let l = 0; l < 3; l++) {
        if (l !== freeLane) {
          activeObstacles.push(createLowHurdle(spawnZ, l));
        } else {
          for (let i = 0; i < 3; i++) activeCoins.push(createCoin(spawnZ - 4 + i * 3, l));
        }
      }
      nextSpawnZ -= 26;
    } else if (patternType === 2) {
      // High Barrier (requires Slide)
      const barrierLane = Math.floor(Math.random() * 3);
      activeObstacles.push(createHighBarrier(spawnZ, barrierLane));

      // Potential Power-up behind the barrier!
      if (Math.random() < 0.45) {
        const types = ['magnet', 'sneakers', 'multiplier'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        activePowerups.push(createPowerup(spawnZ - 10, barrierLane, randomType));
      }
      nextSpawnZ -= 28;
    } else if (patternType === 3) {
      // Two Trains side-by-side with middle escape
      const openLane = Math.floor(Math.random() * 3);
      for (let l = 0; l < 3; l++) {
        if (l !== openLane) {
          activeObstacles.push(createTrain(spawnZ, l));
        } else {
          // Coin Trail in the middle!
          for (let i = 0; i < 6; i++) {
            activeCoins.push(createCoin(spawnZ - 10 + i * 3.5, l));
          }
        }
      }
      nextSpawnZ -= 42;
    } else {
      // Arc of coins over a hurdle
      const hurdleLane = Math.floor(Math.random() * 3);
      activeObstacles.push(createLowHurdle(spawnZ, hurdleLane));

      // 3D Coin Arc
      activeCoins.push(createCoin(spawnZ + 3, hurdleLane, 0.8));
      activeCoins.push(createCoin(spawnZ, hurdleLane, 2.3));
      activeCoins.push(createCoin(spawnZ - 3, hurdleLane, 0.8));

      nextSpawnZ -= 26;
    }
  }

  // ==========================================================================
  // INPUT CONTROLLER (KEYBOARD & TOUCH SWIPE)
  // ==========================================================================
  function setupInput() {
    window.addEventListener('keydown', e => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (!state.running && !state.gameOver && !state.paused) {
        if (e.code === 'Space' || e.code === 'Enter') {
          startGame();
          return;
        }
      }

      if (!state.running || state.paused || state.gameOver) return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          moveLane(-1);
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveLane(1);
          break;
        case 'ArrowUp':
        case 'KeyW':
          jump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          slide();
          break;
        case 'Space':
        case 'KeyB':
          activateHoverboard();
          break;
        case 'KeyP':
        case 'Escape':
          togglePause();
          break;
      }
    });

    // Touch Swipes
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTapTime = 0;

    window.addEventListener('touchstart', e => {
      const touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();

      // Double-tap detection for Hoverboard
      const now = Date.now();
      if (now - lastTapTime < 300) {
        if (state.running && !state.paused && !state.gameOver) {
          activateHoverboard();
        }
      }
      lastTapTime = now;
    }, { passive: true });

    window.addEventListener('touchend', e => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      if (!state.running && !state.gameOver && !state.paused) {
        startGame();
        return;
      }

      if (!state.running || state.paused || state.gameOver) return;

      const minSwipeDist = 30;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDist) {
          if (deltaX > 0) moveLane(1);
          else moveLane(-1);
        }
      } else {
        if (Math.abs(deltaY) > minSwipeDist) {
          if (deltaY < 0) jump();
          else slide();
        }
      }
    }, { passive: true });
  }

  function moveLane(dir) {
    const newLane = state.currentLane + dir;
    if (newLane >= 0 && newLane <= 2) {
      state.currentLane = newLane;
      state.targetX = LANES[state.currentLane];
      Sound.lane();
    }
  }

  function jump() {
    if (state.isGrounded) {
      const jumpPower = state.powerups.sneakers.active ? JUMP_VELOCITY_SNEAKERS : JUMP_VELOCITY_NORMAL;
      state.yVelocity = jumpPower;
      state.isGrounded = false;
      state.isSliding = false;
      Sound.jump();
    }
  }

  function slide() {
    if (!state.isGrounded) {
      // Fast drop dive down if in mid-air
      state.yVelocity = -28.0;
    }
    state.isSliding = true;
    state.slideTimer = SLIDE_DURATION;
    Sound.slide();
  }

  function activateHoverboard() {
    if (state.powerups.hoverboard.active) return;
    if (state.powerups.hoverboard.stock <= 0) return;

    state.powerups.hoverboard.stock--;
    state.powerups.hoverboard.active = true;
    state.powerups.hoverboard.timer = HOVERBOARD_DURATION;
    hoverboardMesh.visible = true;
    updateHUDStock();
    savePersistentData();
    Sound.boardOn();
  }

  // ==========================================================================
  // GAME LOOP & PHYSICS
  // ==========================================================================
  let lastTime = 0;

  function animate(time) {
    requestAnimationFrame(animate);

    if (lastTime === 0) lastTime = time;
    const delta = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    if (state.running && !state.paused && !state.gameOver) {
      updateGame(delta, time / 1000);
    }

    renderer.render(scene, camera);
  }

  function updateGame(delta, elapsedTime) {
    // 1. Advance Speed & Distance
    state.speed = Math.min(MAX_SPEED, BASE_SPEED + (state.distanceRun / 100) * SPEED_ACCELERATION);
    const forwardStep = state.speed * delta;
    playerGroup.position.z -= forwardStep;
    state.distanceRun += forwardStep;

    // 2. Score accumulation (Distance * Multiplier)
    const effectiveMultiplier = state.scoreMultiplier * (state.powerups.multiplier.active ? 2 : 1);
    state.score += forwardStep * 1.5 * effectiveMultiplier;
    hudScore.textContent = Math.floor(state.score);
    hudMultiplier.textContent = `x${effectiveMultiplier}`;

    // 3. Lane Transition Smooth Lerp
    playerGroup.position.x += (state.targetX - playerGroup.position.x) * delta * 18;

    // 4. Vertical Jump & Gravity Physics
    playerGroup.position.y += state.yVelocity * delta;

    // Determine Ground Level (Base 0 or Top of Train)
    let currentFloor = 0;
    activeObstacles.forEach(obs => {
      if (obs.userData.type === 'train') {
        const pz = playerGroup.position.z;
        const oz = obs.position.z;
        const trainHalfLen = 11;
        if (Math.abs(playerGroup.position.x - obs.position.x) < 1.1 && pz <= oz + trainHalfLen && pz >= oz - trainHalfLen) {
          if (playerGroup.position.y >= obs.userData.roofY - 0.5) {
            currentFloor = obs.userData.roofY;
          }
        }
      }
    });

    if (playerGroup.position.y <= currentFloor) {
      playerGroup.position.y = currentFloor;
      state.yVelocity = 0;
      state.isGrounded = true;
    } else {
      state.yVelocity += GRAVITY * delta;
      state.isGrounded = false;
    }

    // 5. Sliding State Duration
    if (state.isSliding) {
      state.slideTimer -= delta;
      if (state.slideTimer <= 0) {
        state.isSliding = false;
      }
    }

    // 6. Player Animation (Run / Jump / Slide)
    updatePlayerAvatarAnimation(elapsedTime);

    // 7. Dynamic Camera Follow
    camera.position.z = playerGroup.position.z + 6.2;
    camera.position.x += (playerGroup.position.x * 0.5 - camera.position.x) * delta * 6;
    camera.position.y = Math.max(3.8, playerGroup.position.y + 3.2);

    // 8. Track Recycling
    recycleTrack();

    // 9. Wave Spawning
    if (playerGroup.position.z - nextSpawnZ < VISIBLE_DISTANCE) {
      spawnWave();
    }

    // 10. Update Power-up Timers
    updatePowerupTimers(delta);

    // 11. Update Coins & Magnet Attraction
    updateCoins(delta);

    // 12. Check Collision with Obstacles
    checkCollisions();
  }

  function updatePlayerAvatarAnimation(time) {
    const leftLeg = playerMesh.getObjectByName('leftLeg');
    const rightLeg = playerMesh.getObjectByName('rightLeg');
    const leftArm = playerMesh.getObjectByName('leftArm');
    const rightArm = playerMesh.getObjectByName('rightArm');

    if (state.isSliding) {
      // Squash & Slide tuck
      playerMesh.scale.set(1, 0.45, 1);
      playerMesh.position.y = -0.2;
      playerMesh.rotation.x = 0.3;
    } else if (!state.isGrounded) {
      // Jump Pose: Legs drawn up, arms back
      playerMesh.scale.set(1, 1, 1);
      playerMesh.position.y = 0;
      playerMesh.rotation.x = 0;
      if (leftLeg) leftLeg.rotation.x = -0.6;
      if (rightLeg) rightLeg.rotation.x = -0.6;
      if (leftArm) leftArm.rotation.x = 0.8;
      if (rightArm) rightArm.rotation.x = 0.8;
    } else if (state.powerups.hoverboard.active) {
      // Hoverboard Stance
      playerMesh.scale.set(1, 1, 1);
      playerMesh.position.y = 0.15;
      playerMesh.rotation.y = 0.4;
      hoverboardMesh.rotation.z = (playerGroup.position.x - state.targetX) * -0.2;
    } else {
      // Normal Running Animation
      playerMesh.scale.set(1, 1, 1);
      playerMesh.position.y = 0;
      playerMesh.rotation.x = 0;
      playerMesh.rotation.y = 0;

      const runFreq = state.speed * 0.55;
      const swing = Math.sin(time * runFreq);

      if (leftLeg) leftLeg.rotation.x = swing * 0.7;
      if (rightLeg) rightLeg.rotation.x = -swing * 0.7;
      if (leftArm) leftArm.rotation.x = -swing * 0.7;
      if (rightArm) rightArm.rotation.x = swing * 0.7;
    }
  }

  function recycleTrack() {
    trackSegments.forEach(seg => {
      if (seg.position.z > playerGroup.position.z + TRACK_SEGMENT_LENGTH) {
        seg.position.z -= TRACK_SEGMENT_LENGTH * TRACK_SEGMENT_COUNT;
      }
    });
  }

  // ==========================================================================
  // POWER-UPS & COIN COLLECTION LOGIC
  // ==========================================================================
  function updatePowerupTimers(delta) {
    let trayHtml = '';

    Object.keys(state.powerups).forEach(key => {
      const p = state.powerups[key];
      if (p.active) {
        p.timer -= delta;
        if (p.timer <= 0) {
          p.active = false;
          if (key === 'hoverboard') hoverboardMesh.visible = false;
        } else {
          const pct = Math.max(0, (p.timer / p.maxTime) * 100);
          let icon = '⚡';
          let barClass = 'sneakers-bar';
          if (key === 'magnet') { icon = '🧲'; barClass = 'magnet-bar'; }
          else if (key === 'multiplier') { icon = '✖️2'; barClass = 'multiplier-bar'; }
          else if (key === 'hoverboard') { icon = '🛹'; barClass = 'hoverboard-bar'; }

          trayHtml += `
            <div class="powerup-pill">
              <span class="powerup-pill-icon">${icon}</span>
              <div class="powerup-bar-track">
                <div class="powerup-bar-fill ${barClass}" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        }
      }
    });

    powerupTray.innerHTML = trayHtml;
  }

  function updateCoins(delta) {
    const pPos = playerGroup.position;
    const isMagnet = state.powerups.magnet.active;

    // Coins loop
    for (let i = activeCoins.length - 1; i >= 0; i--) {
      const coin = activeCoins[i];
      coin.rotation.z += delta * 4;

      // Magnet attraction
      if (isMagnet && !coin.userData.collected) {
        const dist = coin.position.distanceTo(pPos);
        if (dist < 16) {
          coin.position.lerp(pPos, 0.22);
        }
      }

      // Check collection distance
      if (!coin.userData.collected && coin.position.distanceTo(pPos) < 1.4) {
        coin.userData.collected = true;
        state.coinsCollectedRun++;
        state.totalCoins++;
        hudCoins.textContent = state.coinsCollectedRun;
        Sound.coin();
        scene.remove(coin);
        activeCoins.splice(i, 1);
        continue;
      }

      // Clean up past coins
      if (coin.position.z > pPos.z + 10) {
        scene.remove(coin);
        activeCoins.splice(i, 1);
      }
    }

    // Power-ups loop
    for (let i = activePowerups.length - 1; i >= 0; i--) {
      const pu = activePowerups[i];
      pu.rotation.y += delta * 3;

      if (!pu.userData.collected && pu.position.distanceTo(pPos) < 1.5) {
        pu.userData.collected = true;
        const type = pu.userData.type;
        activatePowerup(type);
        Sound.powerup();
        scene.remove(pu);
        activePowerups.splice(i, 1);
        continue;
      }

      if (pu.position.z > pPos.z + 10) {
        scene.remove(pu);
        activePowerups.splice(i, 1);
      }
    }
  }

  function activatePowerup(type) {
    const p = state.powerups[type];
    if (p) {
      p.active = true;
      p.timer = p.maxTime;
    }
  }

  // ==========================================================================
  // COLLISION DETECTION (AABB BOUNDING BOXES)
  // ==========================================================================
  function checkCollisions() {
    const px = playerGroup.position.x;
    const py = playerGroup.position.y;
    const pz = playerGroup.position.z;

    for (let i = activeObstacles.length - 1; i >= 0; i--) {
      const obs = activeObstacles[i];
      const ox = obs.position.x;
      const oz = obs.position.z;

      if (obs.userData.type === 'train') {
        const trainHalfLen = 11;
        // Check X overlap
        if (Math.abs(px - ox) < 1.1) {
          // Check Z overlap
          if (pz <= oz + trainHalfLen && pz >= oz - trainHalfLen) {
            // Check if player is safely ON TOP of train
            if (py >= obs.userData.roofY - 0.2) {
              // Safely running atop train!
            } else {
              // Frontal or side impact with train!
              handleCrash();
              return;
            }
          }
        }
      } else if (obs.userData.type === 'hurdle') {
        // Low hurdle: Must jump over
        if (Math.abs(px - ox) < 1.1 && Math.abs(pz - oz) < 0.8) {
          if (py < obs.userData.height) {
            // Hit hurdle!
            handleCrash();
            return;
          }
        }
      } else if (obs.userData.type === 'high_barrier') {
        // High barrier: Must slide underneath
        if (Math.abs(px - ox) < 1.1 && Math.abs(pz - oz) < 0.8) {
          if (!state.isSliding || py > 0.5) {
            // Hit high barrier!
            handleCrash();
            return;
          }
        }
      }

      // Recycle obstacles behind player
      if (oz > pz + 20) {
        scene.remove(obs);
        activeObstacles.splice(i, 1);
      }
    }
  }

  function handleCrash() {
    // Hoverboard Crash Immunity
    if (state.powerups.hoverboard.active) {
      state.powerups.hoverboard.active = false;
      hoverboardMesh.visible = false;
      Sound.crash();
      // Brief invincibility hop forward
      playerGroup.position.z -= 4.0;
      return;
    }

    // Fatal Crash
    state.gameOver = true;
    state.running = false;
    stopBgBeat();
    Sound.crash();

    savePersistentData();
    showGameOverScreen();
  }

  // ==========================================================================
  // LOCALSTORAGE & PERSISTENCE
  // ==========================================================================
  function loadPersistentData() {
    try {
      const savedHigh = localStorage.getItem('subway_highscore');
      if (savedHigh) state.highScore = parseInt(savedHigh, 10) || 0;

      const savedCoins = localStorage.getItem('subway_total_coins');
      if (savedCoins) state.totalCoins = parseInt(savedCoins, 10) || 0;

      const savedStock = localStorage.getItem('subway_board_stock');
      if (savedStock !== null) state.powerups.hoverboard.stock = parseInt(savedStock, 10) || 0;

      const savedSound = localStorage.getItem('subway_sound');
      if (savedSound !== null) state.soundEnabled = savedSound === 'true';

      const savedMagnetLvl = localStorage.getItem('subway_lvl_magnet');
      if (savedMagnetLvl) state.powerups.magnet.level = parseInt(savedMagnetLvl, 10) || 1;

      const savedSneakersLvl = localStorage.getItem('subway_lvl_sneakers');
      if (savedSneakersLvl) state.powerups.sneakers.level = parseInt(savedSneakersLvl, 10) || 1;

      const savedMultLvl = localStorage.getItem('subway_lvl_multiplier');
      if (savedMultLvl) state.powerups.multiplier.level = parseInt(savedMultLvl, 10) || 1;
    } catch (e) {}

    // Apply upgrade durations
    state.powerups.magnet.maxTime = 10 + (state.powerups.magnet.level - 1) * UPGRADES.magnet.durationPerLevel;
    state.powerups.sneakers.maxTime = 10 + (state.powerups.sneakers.level - 1) * UPGRADES.sneakers.durationPerLevel;
    state.powerups.multiplier.maxTime = 12 + (state.powerups.multiplier.level - 1) * UPGRADES.multiplier.durationPerLevel;

    updateHUDHigh();
    updateHUDStock();
    updateSoundUI();
  }

  function savePersistentData() {
    try {
      if (state.score > state.highScore) {
        state.highScore = Math.floor(state.score);
      }
      localStorage.setItem('subway_highscore', state.highScore.toString());
      localStorage.setItem('subway_total_coins', state.totalCoins.toString());
      localStorage.setItem('subway_board_stock', state.powerups.hoverboard.stock.toString());
      localStorage.setItem('subway_sound', state.soundEnabled.toString());
      localStorage.setItem('subway_lvl_magnet', state.powerups.magnet.level.toString());
      localStorage.setItem('subway_lvl_sneakers', state.powerups.sneakers.level.toString());
      localStorage.setItem('subway_lvl_multiplier', state.powerups.multiplier.level.toString());
    } catch (e) {}

    updateHUDHigh();
    updateHUDStock();
  }

  function updateHUDHigh() {
    hudHighScore.textContent = state.highScore;
  }

  function updateHUDStock() {
    boardStockCount.textContent = state.powerups.hoverboard.stock;
    if (shopBoardStock) shopBoardStock.textContent = state.powerups.hoverboard.stock;
  }

  function updateSoundUI() {
    soundToggleIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
    soundStatusText.textContent = state.soundEnabled ? 'ON' : 'MUTED';
  }

  // ==========================================================================
  // GAMEPLAY FLOW & MENUS
  // ==========================================================================
  function resetWorld() {
    // Clear obstacles & coins
    activeObstacles.forEach(o => scene.remove(o));
    activeObstacles = [];
    activeCoins.forEach(c => scene.remove(c));
    activeCoins = [];
    activePowerups.forEach(p => scene.remove(p));
    activePowerups = [];

    // Reset player position & state
    playerGroup.position.set(0, 0, 0);
    state.currentLane = 1;
    state.targetX = 0;
    state.yVelocity = 0;
    state.isGrounded = true;
    state.isSliding = false;
    state.score = 0;
    state.coinsCollectedRun = 0;
    state.distanceRun = 0;
    state.speed = BASE_SPEED;
    state.gameOver = false;
    nextSpawnZ = -35;

    // Reset active power-ups
    Object.keys(state.powerups).forEach(key => {
      state.powerups[key].active = false;
    });
    hoverboardMesh.visible = false;
    powerupTray.innerHTML = '';

    // Update HUD
    hudScore.textContent = '0';
    hudCoins.textContent = '0';
    hudMultiplier.textContent = 'x1';
  }

  function startGame() {
    initAudio();
    resetWorld();
    state.running = true;
    state.paused = false;
    state.gameOver = false;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    shopScreen.classList.add('hidden');

    startBgBeat();
  }

  function showGameOverScreen() {
    finalScoreEl.textContent = Math.floor(state.score);
    finalCoinsEl.textContent = `🪙 ${state.coinsCollectedRun}`;
    finalBestEl.textContent = state.highScore;

    if (state.score >= state.highScore && state.score > 0) {
      newRecordBadge.classList.remove('hidden');
    } else {
      newRecordBadge.classList.add('hidden');
    }

    gameOverScreen.classList.remove('hidden');
  }

  function togglePause() {
    if (!state.running || state.gameOver) return;
    state.paused = !state.paused;
    pauseScreen.classList.toggle('hidden', !state.paused);
  }

  // ==========================================================================
  // SHOP & UPGRADES LOGIC
  // ==========================================================================
  function renderShop() {
    shopTotalCoins.textContent = state.totalCoins;
    updateHUDStock();

    // Magnet Dots & Cost
    renderUpgradeRow('magnet', buyMagnetBtn, 'dots-magnet');
    renderUpgradeRow('sneakers', buySneakersBtn, 'dots-sneakers');
    renderUpgradeRow('multiplier', buyMultiplierBtn, 'dots-multiplier');

    // Hoverboard Stock Buy Button
    const boardCost = UPGRADES.hoverboardStock.cost;
    buyHoverboardBtn.disabled = state.totalCoins < boardCost;
    buyHoverboardBtn.innerHTML = `<span class="buy-cost">🪙 ${boardCost}</span>`;
  }

  function renderUpgradeRow(itemKey, btnEl, dotsId) {
    const p = state.powerups[itemKey];
    const upg = UPGRADES[itemKey];
    const maxLevel = 5;

    // Dots
    const dotsContainer = document.getElementById(dotsId);
    let dotsHtml = '';
    for (let i = 1; i <= maxLevel; i++) {
      dotsHtml += `<span class="dot ${i <= p.level ? 'filled' : ''}"></span>`;
    }
    dotsContainer.innerHTML = dotsHtml;

    if (p.level >= maxLevel) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<span class="buy-cost">MAXED</span>';
    } else {
      const cost = Math.floor(upg.baseCost * Math.pow(upg.costMult, p.level - 1));
      btnEl.disabled = state.totalCoins < cost;
      btnEl.innerHTML = `<span class="buy-cost">🪙 ${cost}</span>`;
      btnEl.dataset.cost = cost;
    }
  }

  function buyUpgrade(itemKey) {
    const p = state.powerups[itemKey];
    const upg = UPGRADES[itemKey];
    const maxLevel = 5;
    if (p.level >= maxLevel) return;

    const cost = Math.floor(upg.baseCost * Math.pow(upg.costMult, p.level - 1));
    if (state.totalCoins >= cost) {
      state.totalCoins -= cost;
      p.level++;
      p.maxTime += upg.durationPerLevel;
      savePersistentData();
      renderShop();
      Sound.powerup();
    }
  }

  function buyHoverboardPack() {
    const cost = UPGRADES.hoverboardStock.cost;
    if (state.totalCoins >= cost) {
      state.totalCoins -= cost;
      state.powerups.hoverboard.stock += UPGRADES.hoverboardStock.count;
      savePersistentData();
      renderShop();
      Sound.powerup();
    }
  }

  // ==========================================================================
  // EVENT LISTENERS SETUP
  // ==========================================================================
  function setupEventListeners() {
    startRunBtn.addEventListener('click', startGame);
    restartRunBtn.addEventListener('click', startGame);
    quickBoardBtn.addEventListener('click', activateHoverboard);

    hudPauseBtn.addEventListener('click', togglePause);
    resumeBtn.addEventListener('click', togglePause);
    pauseRestartBtn.addEventListener('click', startGame);
    pauseQuitBtn.addEventListener('click', () => {
      pauseScreen.classList.add('hidden');
      startScreen.classList.remove('hidden');
      resetWorld();
      state.running = false;
      stopBgBeat();
    });

    // Sound Toggle
    soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      updateSoundUI();
      savePersistentData();
      if (state.soundEnabled) Sound.coin();
    });

    // Shop Dialog Open/Close
    openShopBtn.addEventListener('click', () => {
      renderShop();
      shopScreen.classList.remove('hidden');
    });
    gameoverShopBtn.addEventListener('click', () => {
      renderShop();
      shopScreen.classList.remove('hidden');
    });
    closeShopBtn.addEventListener('click', () => {
      shopScreen.classList.add('hidden');
    });

    // Shop Purchases
    buyMagnetBtn.addEventListener('click', () => buyUpgrade('magnet'));
    buySneakersBtn.addEventListener('click', () => buyUpgrade('sneakers'));
    buyMultiplierBtn.addEventListener('click', () => buyUpgrade('multiplier'));
    buyHoverboardBtn.addEventListener('click', buyHoverboardPack);
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  function init() {
    loadPersistentData();
    initThree();
    setupInput();
    setupEventListeners();
    requestAnimationFrame(animate);
  }

  // Launch when page is ready
  window.addEventListener('DOMContentLoaded', init);
})();
