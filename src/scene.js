import * as THREE from 'three';
import { TextureGenerator } from './textures.js';

/**
 * 3D Scene Builder - GMN College Ambala Cantt
 * Ultra High-Fidelity Atmosphere:
 * - Advanced Multi-Tier Atmospheric Lighting & PCF Soft Shadows
 * - Volumetric Flashlight Cone & Dynamic Spotlight
 * - Ground Mist / Eerie Fog Particle System
 * - Floating Dust Motes & Supernatural Aura Particles
 * - Broken Electrical Wire Spark System
 * - Wet Road Puddles with Specular Shine
 * - High-Detail Iron Gates with Spikes and Finials
 */

export class HorrorScene {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Interactive objects for raycasting
    this.interactables = [];

    // Gate animation
    this.leftGate = null;
    this.rightGate = null;
    this.demonEyesSprite = null;
    this.isGateOpen = false;
    this.gateAngle = 0;

    // Clue meshes
    this.noticeBoardMesh = null;
    this.clockMesh = null;
    this.shadowLockerMesh = null;
    this.padlockMesh = null;

    // Lighting & Flashlight
    this.flashlight = null;
    this.flashlightTarget = null;
    this.flashlightCone = null;
    this.signSpot = null;
    this.eyeLight = null;
    this.puddleGlow = null;
    this.sparkLight = null;

    // Particle Systems
    this.dustParticles = null;
    this.dustGeo = null;
    this.mistParticles = null;
    this.mistGeo = null;
    this.sparksGroup = null;
    this.sparkTimer = 0;

    // Clue aura rings
    this.clueRings = [];

    // Corridor Scene Elements (from Reference Image)
    this.ceilingFans = [];
    this.peekingGhosts = [];
    this.apparitionGhost = null;
    this.apparitionLight = null;
    this.windowLights = [];
    this.mistPlanes = [];
    this.courtyardFlags = [];
  }

  init() {
    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this._buildProceduraSky();
    this.scene.fog = new THREE.FogExp2(0x152232, 0.008); // Light atmospheric depth fog

    // 2. Camera — wide FOV
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.05,
      250
    );
    this.camera.position.set(0, 1.7, 8.8);

    // 3. High-Quality WebGL Renderer with ACES Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp',
      logarithmicDepthBuffer: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.6;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting & Volumetrics
    this.setupLighting();

    // 5. Build Environment
    TextureGenerator.init(() => {
      this.buildAllEnvironment();
      this.buildParticleSystems();
    });

    window.addEventListener('resize', () => this.onWindowResize());
  }

  _buildProceduraSky() {
    const skyGeo = new THREE.SphereGeometry(190, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor:    { value: new THREE.Color(0x0e1724) },
        midColor:    { value: new THREE.Color(0x213247) },
        botColor:    { value: new THREE.Color(0x2d3e33) },
        offset:      { value: 35 },
        exponent:    { value: 0.4 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 botColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          vec3 col;
          if (h > 0.0) {
            col = mix(midColor, topColor, pow(max(h, 0.0), exponent));
          } else {
            col = mix(midColor, botColor, pow(max(-h, 0.0), exponent * 0.5));
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  setupLighting() {
    // ─── Bright Ambient Light (ensures all 3D props are clearly visible) ─
    const ambient = new THREE.AmbientLight(0x7090aa, 1.35);
    this.scene.add(ambient);

    // ─── Overcast Hemisphere Ambient Base ────────────────────────────────
    const hemi = new THREE.HemisphereLight(0x88b0d0, 0x334438, 1.1);
    hemi.position.set(0, 24, 0);
    this.scene.add(hemi);

    // ─── Key Directional Moonlight ───────────────────────────────────────
    const moon = new THREE.DirectionalLight(0xe2eeff, 1.8);
    moon.position.set(14, 28, 18);
    moon.castShadow = true;
    moon.shadow.mapSize.width  = 4096;
    moon.shadow.mapSize.height = 4096;
    moon.shadow.camera.near = 0.5;
    moon.shadow.camera.far  = 90;
    moon.shadow.camera.left   = -24;
    moon.shadow.camera.right  = 24;
    moon.shadow.camera.top    = 24;
    moon.shadow.camera.bottom = -24;
    moon.shadow.bias = -0.0002;
    moon.shadow.normalBias = 0.02;
    this.scene.add(moon);

    // ─── Warm Amber Streetlight Bounce ───────────────────────────────────
    const streetFill = new THREE.DirectionalLight(0xffddaa, 0.75);
    streetFill.position.set(-10, 12, 16);
    this.scene.add(streetFill);

    // ─── Front Key Light (Clarity for gate & characters) ─────────────────
    const frontKey = new THREE.DirectionalLight(0xdbeafe, 0.85);
    frontKey.position.set(0, 6, 18);
    this.scene.add(frontKey);

    // ─── Covered Corridor Industrial Overhead Tube Lights ───────────────
    const corridorLights = [
      { x: 0.0, y: 4.2, z: -2.5,  color: 0xdbeafe, intensity: 2.4, dist: 15 },
      { x: 0.0, y: 4.2, z: -9.0,  color: 0xffedd5, intensity: 2.2, dist: 15 },
      { x: 0.0, y: 4.2, z: -16.5, color: 0xdbeafe, intensity: 2.2, dist: 15 },
      { x: 0.0, y: 4.2, z: -24.5, color: 0x93c5fd, intensity: 2.5, dist: 16 },
    ];
    corridorLights.forEach(cl => {
      const pLight = new THREE.PointLight(cl.color, cl.intensity, cl.dist, 2);
      pLight.position.set(cl.x, cl.y, cl.z);
      this.scene.add(pLight);
    });

    // ─── Signboard Red Dramatic Spotlight ───────────────────────────────
    this.signSpot = new THREE.SpotLight(0xff2222, 2.2, 16, 0.6, 0.65, 1.2);
    this.signSpot.position.set(0, 8.2, 3.0);
    this.signSpot.target.position.set(0, 5.6, 0);
    this.signSpot.castShadow = false;
    this.scene.add(this.signSpot);
    this.scene.add(this.signSpot.target);

    // ─── Eerie Ground Mist / Puddle Reflection Light ─────────────────────
    this.puddleGlow = new THREE.PointLight(0x00f0ff, 0.8, 10, 2);
    this.puddleGlow.position.set(0, 0.2, 2.6);
    this.scene.add(this.puddleGlow);

    // ─── Spark Burst Flash Light (damaged wire) ──────────────────────────
    this.sparkLight = new THREE.PointLight(0x88ccff, 0.0, 8, 2);
    this.sparkLight.position.set(-3.2, 6.2, 0.3);
    this.scene.add(this.sparkLight);

    // ─── Volumetric Flashlight Setup ─────────────────────────────────────
    this.setupFlashlight();
  }

  setupFlashlight() {
    // Dynamic SpotLight attached to player view
    this.flashlight = new THREE.SpotLight(0xfff7e6, 3.5, 26, Math.PI / 6.5, 0.45, 1.4);
    this.flashlight.position.set(0, 1.5, 8.8);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 1024;
    this.flashlight.shadow.mapSize.height = 1024;
    this.flashlight.shadow.camera.near = 0.2;
    this.flashlight.shadow.camera.far = 28;
    this.flashlight.shadow.bias = -0.0005;

    this.flashlightTarget = new THREE.Object3D();
    this.flashlightTarget.position.set(0, 1.5, 0);
    this.scene.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;
    this.scene.add(this.flashlight);

    // Volumetric Flashlight Light Cone Mesh
    const coneGeo = new THREE.ConeGeometry(2.4, 18, 24, 1, true);
    // Rotate cone so apex is at origin and points forward along -Z
    coneGeo.translate(0, -9, 0);
    coneGeo.rotateX(-Math.PI / 2);

    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfff0d0,
      transparent: true,
      opacity: 0.065,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.flashlightCone = new THREE.Mesh(coneGeo, coneMat);
    this.scene.add(this.flashlightCone);
  }

  buildAllEnvironment() {
    this.buildGround();
    this.buildOverheadSign();
    this.buildPillarsAndWalls();
    this.buildDoubleGate();
    this.buildCoveredCorridor();
    this.buildOpenCourtyard();
    this.buildCadetBoard();
    this.buildGardenAndDetails();
    this.buildClueObjects();
    this.buildBackdropSky();
  }

  buildGround() {
    // High-Detail Asphalt Ground with Wet Specular Reflections
    const groundGeo = new THREE.PlaneGeometry(48, 48, 32, 32);
    const groundTex = TextureGenerator.createPhotoGroundTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.55,
      metalness: 0.25,
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Wet Puddle Reflection Disc
    const puddleGeo = new THREE.CircleGeometry(4.2, 32);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x182430,
      roughness: 0.08,
      metalness: 0.85,
      transparent: true,
      opacity: 0.65
    });
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(0.4, 0.015, 3.2);
    puddle.scale.set(1.4, 0.7, 1);
    this.scene.add(puddle);

    // 3D Road Curbs with Realistic Bevels
    const curbGeo = new THREE.BoxGeometry(0.38, 0.24, 24);
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x243e33,
      roughness: 0.65,
      metalness: 0.1
    });

    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-4.6, 0.12, 5);
    leftCurb.receiveShadow = true;
    leftCurb.castShadow = true;
    this.scene.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, curbMat);
    rightCurb.position.set(4.6, 0.12, 5);
    rightCurb.receiveShadow = true;
    rightCurb.castShadow = true;
    this.scene.add(rightCurb);
  }

  buildOverheadSign() {
    // 1. Signboard Body
    const signGeo = new THREE.BoxGeometry(6.6, 1.8, 0.15);
    const signTex = TextureGenerator.createSignboardTexture();
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.45,
      metalness: 0.25
    });

    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 5.6, 0);
    signMesh.castShadow = true;
    this.scene.add(signMesh);

    // 2. Red Outer Frame
    const frameGeo = new THREE.BoxGeometry(6.85, 2.05, 0.12);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.45,
      metalness: 0.3
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 5.6, -0.02);
    frameMesh.castShadow = true;
    this.scene.add(frameMesh);

    // 3. Heavy Support Iron Truss
    const beamGeo = new THREE.BoxGeometry(7.5, 0.32, 0.45);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x1b2430,
      metalness: 0.75,
      roughness: 0.4
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 4.6, 0);
    beam.castShadow = true;
    this.scene.add(beam);

    // 4. Broken Electrical Wire dangling from sign corner
    const wireCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.2, 5.2, 0.1),
      new THREE.Vector3(-3.25, 4.7, 0.2),
      new THREE.Vector3(-3.18, 4.2, 0.15),
      new THREE.Vector3(-3.22, 3.8, 0.25),
    ]);
    const wireGeo = new THREE.TubeGeometry(wireCurve, 20, 0.022, 8, false);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    this.scene.add(wire);
  }

  buildPillarsAndWalls() {
    // 1. Left Pillar with GMN Plaque
    const leftPillarGeo = new THREE.BoxGeometry(1.4, 4.8, 1.2);
    const leftPillarTex = TextureGenerator.createLeftPillarTexture();
    const leftPillarMat = new THREE.MeshStandardMaterial({
      map: leftPillarTex,
      roughness: 0.75,
      metalness: 0.1
    });

    const leftPillar = new THREE.Mesh(leftPillarGeo, leftPillarMat);
    leftPillar.position.set(-3.2, 2.4, 0);
    leftPillar.castShadow = true;
    leftPillar.receiveShadow = true;
    this.scene.add(leftPillar);

    // Pillar Cap Pyramid
    const capGeo = new THREE.ConeGeometry(1.05, 0.4, 4);
    capGeo.rotateY(Math.PI / 4);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const leftCap = new THREE.Mesh(capGeo, capMat);
    leftCap.position.set(-3.2, 5.0, 0);
    this.scene.add(leftCap);

    // Left Boundary Wall
    const leftWallGeo = new THREE.BoxGeometry(6.8, 3.2, 0.4);
    const leftWallMat = new THREE.MeshStandardMaterial({
      map: leftPillarTex,
      roughness: 0.8
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-7.2, 1.6, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    this.scene.add(leftWall);

    // 2. Inner Pillar
    const innerPillarGeo = new THREE.BoxGeometry(0.9, 4.8, 1.0);
    const innerPillarTex = TextureGenerator.createInnerPillarTexture();
    const innerPillarMat = new THREE.MeshStandardMaterial({
      map: innerPillarTex,
      roughness: 0.75
    });
    const innerPillar = new THREE.Mesh(innerPillarGeo, innerPillarMat);
    innerPillar.position.set(2.9, 2.4, 0);
    innerPillar.castShadow = true;
    innerPillar.receiveShadow = true;
    this.scene.add(innerPillar);

    // 3. Right Pillar
    const rightPillarGeo = new THREE.BoxGeometry(1.6, 4.8, 1.2);
    const rightPillarTex = TextureGenerator.createRightPillarTexture();
    const rightPillarMat = new THREE.MeshStandardMaterial({
      map: rightPillarTex,
      roughness: 0.75
    });
    const rightPillar = new THREE.Mesh(rightPillarGeo, rightPillarMat);
    rightPillar.position.set(5.2, 2.4, 0);
    rightPillar.castShadow = true;
    rightPillar.receiveShadow = true;
    this.scene.add(rightPillar);

    const rightCap = new THREE.Mesh(capGeo, capMat);
    rightCap.position.set(5.2, 5.0, 0);
    this.scene.add(rightCap);
  }

  buildDoubleGate() {
    const leafW = 2.4;
    const leafH = 3.6;

    // ─── Left Gate Leaf ───────────────────────────────────────────────
    this.leftGate = new THREE.Group();
    this.leftGate.position.set(-2.5, 0, 0);

    const leftGateTex = TextureGenerator.createLeftGateTexture();
    const gateMatL = new THREE.MeshStandardMaterial({
      map: leftGateTex || TextureGenerator.createGroundTexture(),
      roughness: 0.55,
      metalness: 0.45
    });

    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.08), gateMatL);
    leftPanel.position.set(leafW / 2, leafH / 2, 0);
    leftPanel.castShadow = true;
    this.leftGate.add(leftPanel);

    this._addGateSpikes(this.leftGate, leafW, leafH, true);
    this.scene.add(this.leftGate);

    // ─── Right Gate Leaf ──────────────────────────────────────────────
    this.rightGate = new THREE.Group();
    this.rightGate.position.set(2.4, 0, 0);

    const rightGateTex = TextureGenerator.createRightGateTexture();
    const gateMatR = new THREE.MeshStandardMaterial({
      map: rightGateTex || gateMatL.map,
      roughness: 0.55,
      metalness: 0.45
    });

    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.08), gateMatR);
    rightPanel.position.set(-leafW / 2, leafH / 2, 0);
    rightPanel.castShadow = true;
    this.rightGate.add(rightPanel);

    this._addGateSpikes(this.rightGate, leafW, leafH, false);
    this.scene.add(this.rightGate);

    // ─── Padlock & Heavy Chain ────────────────────────────────────────
    const lockBodyGeo = new THREE.BoxGeometry(0.32, 0.38, 0.14);
    const lockMat = new THREE.MeshStandardMaterial({
      color: 0xc48c36,
      metalness: 0.9,
      roughness: 0.25
    });
    this.padlockMesh = new THREE.Mesh(lockBodyGeo, lockMat);
    this.padlockMesh.position.set(0, 1.6, 0.22);
    this.padlockMesh.castShadow = true;

    const shackleGeo = new THREE.TorusGeometry(0.11, 0.035, 12, 24, Math.PI);
    const shackleMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.2 });
    const shackle = new THREE.Mesh(shackleGeo, shackleMat);
    shackle.position.set(0, 0.19, 0);
    this.padlockMesh.add(shackle);

    // Padlock Glowing Clue Beacon Ring
    const lockAura = this._createClueBeacon(0, 1.6, 0.28, 0xffbb00, 'GATE LOCK [13-7-3]');
    this.scene.add(lockAura);
    this.clueRings.push(lockAura);

    this.padlockMesh.userData = {
      type: 'padlock',
      prompt: 'Unlock Gate Padlock (13 — 7 — 3)',
      action: 'openPadlock'
    };
    lockAura.userData = { ...this.padlockMesh.userData };
    this.interactables.push(this.padlockMesh);
    this.interactables.push(lockAura);
    this.scene.add(this.padlockMesh);
  }

  _createClueBeacon(x, y, z, color = 0x00f0ff, labelText = 'INSPECT [E]') {
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(x, y, z);

    // 1. Glowing Neon Concentric Ring
    const ringGeo = new THREE.RingGeometry(0.25, 0.32, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    beaconGroup.add(ring);

    // 2. Inner Rotating Octahedron Crystal Marker
    const gemGeo = new THREE.OctahedronGeometry(0.12, 0);
    const gemMat = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      transparent: true,
      opacity: 0.95
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.y = 0.28;
    beaconGroup.add(gem);

    // 3. Clue Point Light
    const light = new THREE.PointLight(color, 1.4, 4.2, 2);
    light.position.set(0, 0.3, 0.2);
    beaconGroup.add(light);

    // 4. Floating 2D Marker Badge
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(8, 14, 22, 0.88)';
      ctx.beginPath();
      ctx.roundRect(4, 4, 248, 56, 10);
      ctx.fill();
      ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 0.62, 0);
      sprite.scale.set(0.95, 0.24, 1);
      beaconGroup.add(sprite);
    }

    beaconGroup.userData = {
      baseY: y,
      ringMesh: ring,
      gemMesh: gem,
      lightSource: light
    };

    return beaconGroup;
  }

  _addGateSpikes(gateGroup, width, height, isLeft) {
    const spikeGeo = new THREE.ConeGeometry(0.04, 0.25, 4);
    const spikeMat = new THREE.MeshStandardMaterial({ color: 0x1a232f, metalness: 0.9, roughness: 0.3 });
    const numSpikes = 8;
    const startX = isLeft ? 0.15 : -width + 0.15;

    for (let i = 0; i < numSpikes; i++) {
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(startX + (i * (width - 0.3) / (numSpikes - 1)), height + 0.12, 0);
      spike.castShadow = true;
      gateGroup.add(spike);
    }
  }

  // ─── 3D Covered Corridor Scene Matching Reference Image ─────────────
  buildCoveredCorridor() {
    const corridorGroup = new THREE.Group();
    this.scene.add(corridorGroup);

    // ─── 1. Paved Corridor Floor (Z = 0.5 to -36) ───────────────────────
    const floorGeo = new THREE.PlaneGeometry(10.5, 36, 16, 32);
    const floorTex = TextureGenerator.createCorridorFloorTexture();
    floorTex.repeat.set(2, 6);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.45,
      metalness: 0.35,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0.005, -17.5);
    floorMesh.receiveShadow = true;
    corridorGroup.add(floorMesh);

    // Realistic Reflective Puddles
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x14202d,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75
    });
    const pPos = [
      { x: 0.2,  z: -4.5,  sx: 2.2, sz: 1.4 },
      { x: -0.5, z: -11.2, sx: 1.8, sz: 1.1 },
      { x: 0.4,  z: -18.5, sx: 2.6, sz: 1.6 },
      { x: -0.2, z: -25.0, sx: 2.0, sz: 1.3 },
    ];
    pPos.forEach(p => {
      const pud = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), puddleMat);
      pud.rotation.x = -Math.PI / 2;
      pud.position.set(p.x, 0.015, p.z);
      pud.scale.set(p.sx, p.sz, 1);
      corridorGroup.add(pud);
    });

    // ─── 2. Overhead Corrugated Tin Canopy Roof & Steel Trusses ─────────
    const roofTex = TextureGenerator.createCorridorRoofTexture();
    roofTex.repeat.set(1, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.7,
      metalness: 0.4,
      side: THREE.DoubleSide
    });

    const roofW = 4.8;
    const roofL = 36;
    const roofH = 4.6;
    const roofSlope = 0.12;

    const leftRoofGeo = new THREE.PlaneGeometry(roofW, roofL);
    const leftRoof = new THREE.Mesh(leftRoofGeo, roofMat);
    leftRoof.position.set(-2.2, roofH - 0.2, -17.5);
    leftRoof.rotation.x = Math.PI / 2;
    leftRoof.rotation.y = roofSlope;
    leftRoof.castShadow = true;
    leftRoof.receiveShadow = true;
    corridorGroup.add(leftRoof);

    const rightRoofGeo = new THREE.PlaneGeometry(roofW, roofL);
    const rightRoof = new THREE.Mesh(rightRoofGeo, roofMat);
    rightRoof.position.set(2.2, roofH - 0.2, -17.5);
    rightRoof.rotation.x = Math.PI / 2;
    rightRoof.rotation.y = -roofSlope;
    rightRoof.castShadow = true;
    rightRoof.receiveShadow = true;
    corridorGroup.add(rightRoof);

    // Blue Skylight Gap in Canopy Roof (Z = -8.0) letting in moonlit haze
    const skylightGeo = new THREE.PlaneGeometry(1.6, 2.8);
    const skylightMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const skylightMesh = new THREE.Mesh(skylightGeo, skylightMat);
    skylightMesh.position.set(0.0, roofH - 0.05, -8.0);
    skylightMesh.rotation.x = Math.PI / 2;
    corridorGroup.add(skylightMesh);

    // Skylight Downward Cool Blue Spotlight
    const skySpot = new THREE.SpotLight(0x38bdf8, 2.2, 14.0, 0.65, 0.4, 1.8);
    skySpot.position.set(0.0, roofH - 0.1, -8.0);
    skySpot.target.position.set(0.0, 0.0, -8.0);
    corridorGroup.add(skySpot);
    corridorGroup.add(skySpot.target);

    // Steel Structural Trusses & Crossbeams every 5.5 meters
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x182028, metalness: 0.85, roughness: 0.35 });
    for (let z = -1.5; z >= -34.5; z -= 5.5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.22, 0.25), trussMat);
      beam.position.set(0, roofH - 0.65, z);
      beam.castShadow = true;
      corridorGroup.add(beam);

      const strutL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.12), trussMat);
      strutL.position.set(-3.3, roofH - 1.0, z);
      strutL.rotation.z = -Math.PI / 4;
      corridorGroup.add(strutL);

      const strutR = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.12), trussMat);
      strutR.position.set(3.3, roofH - 1.0, z);
      strutR.rotation.z = Math.PI / 4;
      corridorGroup.add(strutR);
    }

    // Hanging cobwebs & tattered strips
    this._buildHangingCobwebs(corridorGroup);

    // ─── 3. Hanging Ceiling Fans (4x) ───────────────────────────────────
    const fanPositions = [
      { x: 1.85, y: roofH - 0.85, z: -1.4,  scale: 1.45, speed: 1.4, tiltX: 0.12, tiltZ: -0.15 },  // Top Right Foreground Fan (from image)
      { x: -1.35, y: roofH - 1.05, z: -7.5,  scale: 1.05, speed: 1.8, tiltX: 0, tiltZ: 0 },         // Mid Left Fan
      { x: 1.15,  y: roofH - 1.05, z: -14.5, scale: 0.95, speed: 1.6, tiltX: 0, tiltZ: 0 },         // Mid Right Fan
      { x: 0.0,   y: roofH - 1.05, z: -22.5, scale: 0.9,  speed: 2.0, tiltX: 0, tiltZ: 0 },         // Far Fan
    ];
    fanPositions.forEach((pos, idx) => {
      const fanGroup = this._createCeilingFan();
      fanGroup.position.set(pos.x, pos.y, pos.z);
      fanGroup.scale.setScalar(pos.scale || 1.0);
      if (pos.tiltX) fanGroup.rotation.x = pos.tiltX;
      if (pos.tiltZ) fanGroup.rotation.z = pos.tiltZ;
      fanGroup.userData = {
        speed: pos.speed || 1.6,
        wobbleSpeed: 2.0 + idx * 0.3,
        wobbleAmt: 0.025 + idx * 0.006,
        baseRotY: 0,
        bladesMesh: fanGroup.userData.bladesMesh
      };
      corridorGroup.add(fanGroup);
      this.ceilingFans.push(fanGroup);
    });

    // ─── 4. Left Side: Gnarled Trees, Fence, & Peeking Ghosts ───────────
    this._buildLeftTreeBorder(corridorGroup);

    // ─── 5. Right Side: Institute Building, "OUR TOPPERS", HELP Graffiti
    this._buildRightInstituteBlock(corridorGroup);

    // ─── 6. Center: Abandoned SUV ───────────────────────────────────────
    this._buildAbandonedCar(corridorGroup);

    // ─── 7. Atmospheric Blue Mist Layers ────────────────────────────────
    this._buildCorridorMist(corridorGroup);
  }

  _createCeilingFan() {
    const fanGroup = new THREE.Group();

    // Downrod
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x2b3440, metalness: 0.8, roughness: 0.3 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8), rodMat);
    rod.position.y = 0.42;
    fanGroup.add(rod);

    // Motor Hub
    const motorMat = new THREE.MeshStandardMaterial({ color: 0xd8dde3, metalness: 0.6, roughness: 0.4 });
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.16, 16), motorMat);
    motor.castShadow = true;
    fanGroup.add(motor);

    // 3 Fan Blades
    const bladesGroup = new THREE.Group();
    const bladeTex = TextureGenerator.createCeilingFanTexture();
    const bladeMat = new THREE.MeshStandardMaterial({
      map: bladeTex,
      roughness: 0.5,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const bladeGeo = new THREE.BoxGeometry(0.28, 0.02, 1.1);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(Math.sin(angle) * 0.62, -0.02, Math.cos(angle) * 0.62);
      blade.rotation.y = angle;
      blade.rotation.z = 0.08; // Pitch
      blade.castShadow = true;
      bladesGroup.add(blade);
    }

    fanGroup.add(bladesGroup);
    fanGroup.userData = { bladesMesh: bladesGroup };

    return fanGroup;
  }

  _buildHangingCobwebs(parent) {
    const webMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const webGeo = new THREE.PlaneGeometry(1.4, 0.9);
    for (let i = 0; i < 14; i++) {
      const web = new THREE.Mesh(webGeo, webMat);
      const wx = (Math.random() - 0.5) * 6.5;
      const wy = 4.2 - Math.random() * 0.4;
      const wz = -2 - Math.random() * 30;
      web.position.set(wx, wy, wz);
      web.rotation.x = Math.PI / 3 + (Math.random() - 0.5) * 0.4;
      web.rotation.y = (Math.random() - 0.5) * 0.8;
      parent.add(web);
    }
  }

  _buildLeftTreeBorder(parent) {
    const barkTex = TextureGenerator.createTreeBarkTexture();
    barkTex.repeat.set(1, 3);
    const barkMat = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.85,
      metalness: 0.1
    });

    // 5 Heavy Gnarled Tree Trunks along the walkway
    const treePositions = [
      { x: -2.9, z: -3.2,  r: 0.58 },  // Foreground Left Tree Trunk (where ghost peeks)
      { x: -3.6, z: -9.2,  r: 0.52 },
      { x: -3.8, z: -15.8, r: 0.50 },
      { x: -4.0, z: -22.2, r: 0.50 },
      { x: -3.8, z: -28.5, r: 0.48 },
    ];

    treePositions.forEach(t => {
      const trunkGeo = new THREE.CylinderGeometry(t.r * 0.85, t.r, 5.8, 12);
      const trunk = new THREE.Mesh(trunkGeo, barkMat);
      trunk.position.set(t.x, 2.9, t.z);
      trunk.rotation.z = (Math.random() - 0.5) * 0.08;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      parent.add(trunk);
    });

    // ─── Horror Peeking Ghost 1 (Peeking Around Foreground Tree Trunk) ───
    const ghostTex = TextureGenerator.createPeekingGhostTexture();
    const ghostMat = new THREE.SpriteMaterial({
      map: ghostTex,
      color: 0xffffff,
      transparent: true,
      depthWrite: false
    });
    const ghost1 = new THREE.Sprite(ghostMat);
    ghost1.position.set(-2.32, 1.68, -3.15);
    ghost1.scale.set(0.98, 1.08, 1.0);
    parent.add(ghost1);
    this.peekingGhosts.push(ghost1);

    // Eerie faint light on ghost's pale face
    const ghostLight = new THREE.PointLight(0xa5f3fc, 0.9, 4.0, 2);
    ghostLight.position.set(-2.22, 1.7, -2.95);
    parent.add(ghostLight);

    // ─── Ghost 2 (In Deep Tree Mist) ───────────────────────────────────
    const ghost2 = new THREE.Sprite(ghostMat);
    ghost2.position.set(-4.5, 1.8, -12.5);
    ghost2.scale.set(0.85, 0.95, 1.0);
    parent.add(ghost2);
    this.peekingGhosts.push(ghost2);

    // Metal Perimeter Railing / Fence
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x1a232f, metalness: 0.85, roughness: 0.4 });
    const fenceRailGeo = new THREE.BoxGeometry(0.08, 0.08, 35);
    const topRail = new THREE.Mesh(fenceRailGeo, fenceMat);
    topRail.position.set(-3.95, 1.4, -17.5);
    parent.add(topRail);

    const midRail = new THREE.Mesh(fenceRailGeo, fenceMat);
    midRail.position.set(-3.95, 0.5, -17.5);
    parent.add(midRail);

    for (let z = -1.0; z >= -34.0; z -= 0.6) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 6), fenceMat);
      post.position.set(-3.95, 0.7, z);
      parent.add(post);
    }

    // Overturned Wire Shopping Cart on Left ($Z = -2.5$)
    this._buildWireCart(parent, -2.6, 0.35, -2.5);

    // Potted Plants along Left Curb
    const plantZ = [-1.2, -4.8, -8.2, -13.0, -18.2, -23.5, -28.0];
    plantZ.forEach(pz => {
      this._createPottedPlant(parent, -2.95, 0, pz);
    });

    // Dark Misty Forest Foliage Backdrop on Left
    const foliageTex = TextureGenerator.createSkyTexture();
    if (foliageTex) {
      const foliageGeo = new THREE.PlaneGeometry(36, 8);
      const foliageMat = new THREE.MeshBasicMaterial({
        map: foliageTex,
        color: 0x223545,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const foliageMesh = new THREE.Mesh(foliageGeo, foliageMat);
      foliageMesh.position.set(-5.5, 3.8, -17.5);
      foliageMesh.rotation.y = Math.PI / 2;
      parent.add(foliageMesh);
    }
  }

  _buildWireCart(parent, x, y, z) {
    const cartGroup = new THREE.Group();
    cartGroup.position.set(x, y, z);
    cartGroup.rotation.y = 0.35;
    cartGroup.rotation.z = -0.15; // Tilted slightly

    const wireMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.9, roughness: 0.3 });
    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.9), new THREE.MeshStandardMaterial({
      color: 0x334155,
      wireframe: true
    }));
    basket.castShadow = true;
    cartGroup.add(basket);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.position.set(-0.25, -0.32, 0.35);
    cartGroup.add(w1);

    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.position.set(0.25, -0.32, 0.35);
    cartGroup.add(w2);

    parent.add(cartGroup);
  }

  _buildRightInstituteBlock(parent) {
    // 1. Long Building Facade Wall (X = +3.95, Z = 0 to -35)
    const wallGeo = new THREE.BoxGeometry(0.3, 5.0, 36);
    const wallTex = TextureGenerator.createBloodyHelpWallTexture();
    wallTex.repeat.set(1, 4);
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.75,
      metalness: 0.15
    });

    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(4.0, 2.5, -17.5);
    wall.castShadow = true;
    wall.receiveShadow = true;
    parent.add(wall);

    // 2. "OUR TOPPERS" Wooden Honor Roll Board (Z = -2.4, Y = 2.7)
    const toppersGeo = new THREE.BoxGeometry(0.08, 1.95, 1.85);
    const toppersTex = TextureGenerator.createToppersBoardTexture();
    const toppersFaceMat = new THREE.MeshStandardMaterial({ map: toppersTex, roughness: 0.45 });
    const toppersWoodMat = new THREE.MeshStandardMaterial({ color: 0x1b1109, roughness: 0.6 });

    const toppersBoard = new THREE.Mesh(toppersGeo, [
      toppersFaceMat, toppersWoodMat,
      toppersWoodMat, toppersWoodMat,
      toppersWoodMat, toppersWoodMat
    ]);
    toppersBoard.position.set(3.82, 2.75, -2.4);
    toppersBoard.castShadow = true;
    parent.add(toppersBoard);

    // Spotlight on TOPPERS board
    const boardSpot = new THREE.PointLight(0xffeedd, 1.2, 4.5, 2);
    boardSpot.position.set(3.2, 3.3, -2.4);
    parent.add(boardSpot);

    // 3. Bloody "HELP" & Smeared Handprints Plaque directly below TOPPERS board
    const helpWallGeo = new THREE.PlaneGeometry(1.85, 1.5);
    const helpWallTex = TextureGenerator.createBloodyHelpWallTexture();
    const helpWallMat = new THREE.MeshStandardMaterial({
      map: helpWallTex,
      roughness: 0.7,
      metalness: 0.1
    });
    const helpWallMesh = new THREE.Mesh(helpWallGeo, helpWallMat);
    helpWallMesh.position.set(3.84, 1.25, -2.4);
    helpWallMesh.rotation.y = -Math.PI / 2;
    parent.add(helpWallMesh);

    // 4. "INSTITUTE BLOCK" Header Board above classroom entrance (Z = -6.2)
    const signGeo = new THREE.BoxGeometry(0.06, 0.75, 2.8);
    const signTex = TextureGenerator.createInstituteSignTexture();
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 });
    const instSign = new THREE.Mesh(signGeo, signMat);
    instSign.position.set(3.82, 3.6, -6.2);
    instSign.castShadow = true;
    parent.add(instSign);

    // 5. Dark Classroom Open Door with warm amber interior glow (Z = -6.2)
    const doorVoid = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 2.8, 1.6),
      new THREE.MeshBasicMaterial({ color: 0x06080c })
    );
    doorVoid.position.set(4.0, 1.4, -6.2);
    parent.add(doorVoid);

    // Warm amber flickering classroom interior light
    const roomLight = new THREE.PointLight(0xff8833, 1.4, 6.5, 2);
    roomLight.position.set(3.5, 1.6, -6.2);
    parent.add(roomLight);
    this.windowLights.push(roomLight);

    // 6. Windows with frosted glass and amber indoor light (Z = -13.5 and -20.5)
    const winGeo = new THREE.BoxGeometry(0.08, 1.4, 1.8);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x243545,
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85
    });

    const win1 = new THREE.Mesh(winGeo, winMat);
    win1.position.set(3.83, 2.3, -13.5);
    parent.add(win1);

    const win2 = new THREE.Mesh(winGeo, winMat);
    win2.position.set(3.83, 2.3, -20.5);
    parent.add(win2);

    const winLight1 = new THREE.PointLight(0xffaa44, 0.8, 5.0, 2);
    winLight1.position.set(3.4, 2.3, -13.5);
    parent.add(winLight1);
    this.windowLights.push(winLight1);

    // 7. Stacked Red Bricks with Dripping Blood (Foreground Right Z = -1.3)
    const brickTex = TextureGenerator.createBrickStackTexture();
    const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.85 });
    const brickStack = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 1.4), brickMat);
    brickStack.position.set(3.1, 0.35, -1.3);
    brickStack.castShadow = true;
    brickStack.receiveShadow = true;
    parent.add(brickStack);

    // 8. Old Abandoned Chair (Z = -7.5)
    this._buildAbandonedChair(parent, 1.8, 0, -7.5);

    // 9. Clue 3: Old Locker in corridor (Z = -10.5)
    const lockerGeo = new THREE.BoxGeometry(0.85, 2.3, 0.55);
    const lockerMat = new THREE.MeshStandardMaterial({
      color: 0x1e2733,
      metalness: 0.85,
      roughness: 0.4
    });
    this.shadowLockerMesh = new THREE.Mesh(lockerGeo, lockerMat);
    this.shadowLockerMesh.position.set(3.45, 1.15, -10.5);
    this.shadowLockerMesh.castShadow = true;

    const lockerAura = this._createClueBeacon(3.45, 1.15, -10.5, 0xff0044, 'CLUE 3: LOCKER [E]');
    this.scene.add(lockerAura);
    this.clueRings.push(lockerAura);

    this.shadowLockerMesh.userData = {
      type: 'clue3',
      prompt: 'Inspect Inner Corridor Locker (Clue 3)',
      action: 'openClue3'
    };
    lockerAura.userData = { ...this.shadowLockerMesh.userData };
    this.interactables.push(this.shadowLockerMesh);
    this.interactables.push(lockerAura);
    parent.add(this.shadowLockerMesh);

    // Potted Plants along Right Building Base
    const rPlantZ = [-0.6, -4.0, -8.8, -16.0, -22.0, -27.5];
    rPlantZ.forEach(pz => {
      this._createPottedPlant(parent, 3.4, 0, pz);
    });
  }

  _buildAbandonedChair(parent, x, y, z) {
    const chairGroup = new THREE.Group();
    chairGroup.position.set(x, y, z);
    chairGroup.rotation.y = 0.55;

    const chairMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.85 });

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.55), chairMat);
    seat.position.y = 0.45;
    chairGroup.add(seat);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.05), chairMat);
    back.position.set(0, 0.72, -0.25);
    chairGroup.add(back);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6);
    const legPositions = [
      [-0.23, 0.22, -0.23],
      [0.23,  0.22, -0.23],
      [-0.23, 0.22,  0.23],
      [0.23,  0.22,  0.23],
    ];
    legPositions.forEach(lp => {
      const leg = new THREE.Mesh(legGeo, chairMat);
      leg.position.set(lp[0], lp[1], lp[2]);
      chairGroup.add(leg);
    });

    parent.add(chairGroup);
  }

  _createPottedPlant(parent, x, y, z) {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, y, z);

    // Terracotta Pot
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8d4829, roughness: 0.7 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.17, 0.38, 12), potMat);
    pot.position.y = 0.19;
    pot.castShadow = true;
    plantGroup.add(pot);

    // Dark Leaves
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f382b, roughness: 0.65 });
    for (let i = 0; i < 7; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), leafMat);
      leaf.scale.set(1, 0.4, 1.4);
      leaf.position.set((Math.random() - 0.5) * 0.15, 0.38 + i * 0.06, (Math.random() - 0.5) * 0.15);
      leaf.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.5);
      plantGroup.add(leaf);
    }

    parent.add(plantGroup);
  }

  _buildAbandonedCar(parent) {
    const carGroup = new THREE.Group();
    carGroup.position.set(-0.85, 0, -17.5);
    carGroup.rotation.y = 0.07; // Slightly angled in the path

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e2730,
      metalness: 0.8,
      roughness: 0.4
    });

    // Lower Chassis / Body
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.75, 4.4), bodyMat);
    chassis.position.y = 0.65;
    chassis.castShadow = true;
    carGroup.add(chassis);

    // Cabin / Roof
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.75, 2.6), bodyMat);
    cabin.position.set(0, 1.35, -0.2);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Dusty Glass Windows
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x334455,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.75
    });

    // Windshield
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.75), glassMat);
    windshield.position.set(0, 1.32, 1.15);
    windshield.rotation.x = Math.PI / 6;
    carGroup.add(windshield);

    // Rear window
    const rearWin = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.7), glassMat);
    rearWin.position.set(0, 1.35, -1.52);
    rearWin.rotation.y = Math.PI;
    carGroup.add(rearWin);

    // Headlights (broken/dark)
    const headMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.05), headMat);
    hl1.position.set(-0.68, 0.75, 2.22);
    carGroup.add(hl1);

    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.05), headMat);
    hl2.position.set(0.68, 0.75, 2.22);
    carGroup.add(hl2);

    // Wheels
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x11161b, roughness: 0.9 });
    const wheelPositions = [
      [-0.95, 0.38,  1.3],
      [ 0.95, 0.38,  1.3],
      [-0.95, 0.38, -1.3],
      [ 0.95, 0.38, -1.3],
    ];
    wheelPositions.forEach(wp => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.26, 16), tireMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wp[0], wp[1], wp[2]);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    parent.add(carGroup);
  }

  _buildApparitionGhost(parent) {
    // Middle ghost removed per user request
    this.apparitionGhost = null;
    this.apparitionLight = null;
  }

  _buildCorridorMist(parent) {
    const mistMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const mistGeo = new THREE.PlaneGeometry(8.5, 7.0);
    for (let z = -4.0; z >= -18.0; z -= 4.5) {
      const mistPlane = new THREE.Mesh(mistGeo, mistMat);
      mistPlane.rotation.x = -Math.PI / 2.3;
      mistPlane.position.set((Math.random() - 0.5) * 0.8, 0.22, z);
      mistPlane.userData = { baseZ: z, speed: 0.15 + Math.random() * 0.1 };
      parent.add(mistPlane);
      this.mistPlanes.push(mistPlane);
    }
  }

  // ─── 3D Open Moonlit Courtyard Scene Matching courtyard_ref.jpg ──────
  buildOpenCourtyard() {
    const courtyardGroup = new THREE.Group();
    this.scene.add(courtyardGroup);

    // 1. Foreground Concrete Exit Beam & Ceiling Overhang at Z = -20.0
    const exitBeamMat = new THREE.MeshStandardMaterial({
      color: 0x222a33,
      roughness: 0.85,
      metalness: 0.15
    });
    // Heavy Horizontal Crossbeam overhead
    const exitBeam = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.75, 1.2), exitBeamMat);
    exitBeam.position.set(0, 4.4, -20.2);
    exitBeam.castShadow = true;
    courtyardGroup.add(exitBeam);

    // Concrete Ceiling slab above the exit frame
    const exitCeiling = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.25, 2.5), exitBeamMat);
    exitCeiling.position.set(0, 4.8, -19.8);
    exitCeiling.castShadow = true;
    courtyardGroup.add(exitCeiling);

    // Foreground Vintage 3-Blade Ceiling Fan Hanging Top Right Overhead (matching image)
    const fgFan = this._createCeilingFan();
    fgFan.position.set(2.4, 4.05, -20.4);
    fgFan.scale.setScalar(1.25);
    fgFan.rotation.x = 0.08;
    fgFan.rotation.z = -0.12;
    fgFan.userData = {
      speed: 1.6,
      wobbleSpeed: 2.2,
      wobbleAmt: 0.03,
      bladesMesh: fgFan.userData.bladesMesh
    };
    courtyardGroup.add(fgFan);
    this.ceilingFans.push(fgFan);

    // Cobwebs in upper right overhead corner
    const webMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const webGeo = new THREE.PlaneGeometry(1.6, 1.2);
    const web1 = new THREE.Mesh(webGeo, webMat);
    web1.position.set(2.8, 4.4, -20.3);
    web1.rotation.set(0.3, -0.4, 0.2);
    courtyardGroup.add(web1);

    // 2. Open Courtyard Ground Pavement (Z = -20.0 to -52.0) with Autumn Leaves
    const pavementGeo = new THREE.PlaneGeometry(12.5, 32, 16, 32);
    const pavementTex = TextureGenerator.createCourtyardPavementTexture();
    pavementTex.repeat.set(2, 4);
    const pavementMat = new THREE.MeshStandardMaterial({
      map: pavementTex,
      roughness: 0.45,
      metalness: 0.35
    });
    const pavementMesh = new THREE.Mesh(pavementGeo, pavementMat);
    pavementMesh.rotation.x = -Math.PI / 2;
    pavementMesh.position.set(0, 0.005, -36.0);
    pavementMesh.receiveShadow = true;
    courtyardGroup.add(pavementMesh);

    // Reflective Moonlit Puddles on Courtyard Floor
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x121b24,
      roughness: 0.04,
      metalness: 0.95,
      transparent: true,
      opacity: 0.8
    });
    const courtyardPuddles = [
      { x: 0.6, z: -25.5, sx: 2.2, sz: 1.6 },
      { x: -0.8, z: -31.0, sx: 2.8, sz: 2.0 },
      { x: 0.4, z: -41.0, sx: 3.2, sz: 2.2 },
      { x: 1.2, z: -46.5, sx: 2.0, sz: 1.4 }
    ];
    courtyardPuddles.forEach(p => {
      const pud = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), puddleMat);
      pud.rotation.x = -Math.PI / 2;
      pud.position.set(p.x, 0.018, p.z);
      pud.scale.set(p.sx, p.sz, 1);
      courtyardGroup.add(pud);
    });

    // 3. Glowing 3D Moon & Stormy Night Sky (Z = -52.0)
    const moonSkyTex = TextureGenerator.createCourtyardMoonSkyTexture();
    if (moonSkyTex) {
      const skyGeo = new THREE.PlaneGeometry(28.0, 18.0);
      const skyMat = new THREE.MeshBasicMaterial({
        map: moonSkyTex,
        depthWrite: false
      });
      const skyMesh = new THREE.Mesh(skyGeo, skyMat);
      skyMesh.position.set(0, 9.5, -51.8);
      courtyardGroup.add(skyMesh);
    }

    // Glowing 3D Full Moon Sphere
    const moonGeo = new THREE.SphereGeometry(1.1, 24, 24);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xf1f5f9
    });
    const moonSphere = new THREE.Mesh(moonGeo, moonMat);
    moonSphere.position.set(0.0, 11.2, -50.8);
    courtyardGroup.add(moonSphere);

    // Moon Aura Glow Sprite
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 128;
    moonCanvas.height = 128;
    const mctx = moonCanvas.getContext('2d');
    const grad = mctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, 'rgba(240, 246, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(186, 230, 253, 0.4)');
    grad.addColorStop(1, 'rgba(14, 23, 42, 0)');
    mctx.fillStyle = grad;
    mctx.fillRect(0, 0, 128, 128);
    const moonHaloTex = new THREE.CanvasTexture(moonCanvas);
    const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: moonHaloTex,
      transparent: true,
      blending: THREE.AdditiveBlending
    }));
    moonHalo.position.set(0.0, 11.2, -50.6);
    moonHalo.scale.set(6.5, 6.5, 1.0);
    courtyardGroup.add(moonHalo);

    // Direct Moonlight Spotlight onto Courtyard Ground
    const moonSpot = new THREE.SpotLight(0xcfdfe8, 3.2, 55.0, 0.75, 0.5, 1.5);
    moonSpot.position.set(0.0, 16.0, -48.0);
    moonSpot.target.position.set(0.0, 0.0, -34.0);
    moonSpot.castShadow = true;
    moonSpot.shadow.mapSize.width = 2048;
    moonSpot.shadow.mapSize.height = 2048;
    courtyardGroup.add(moonSpot);
    courtyardGroup.add(moonSpot.target);

    // 4. Background 2-Story Academic Building (Z = -49.0)
    const bldgTex = TextureGenerator.createCourtyardBuildingTexture();
    const bldgGeo = new THREE.BoxGeometry(14.0, 6.8, 1.2);
    const bldgMat = new THREE.MeshStandardMaterial({
      map: bldgTex,
      roughness: 0.75,
      metalness: 0.2
    });
    const bldgMesh = new THREE.Mesh(bldgGeo, bldgMat);
    bldgMesh.position.set(0, 3.4, -49.0);
    bldgMesh.castShadow = true;
    bldgMesh.receiveShadow = true;
    courtyardGroup.add(bldgMesh);

    // Warm glowing doorway arch lanterns in background building
    const archLights = [
      { x: -1.4, y: 1.3, z: -48.2 },
      { x: 1.4, y: 1.3, z: -48.2 }
    ];
    archLights.forEach(al => {
      const pl = new THREE.PointLight(0xffaa44, 1.8, 8.0, 2);
      pl.position.set(al.x, al.y, al.z);
      courtyardGroup.add(pl);
      this.windowLights.push(pl);
    });

    // 5. Right Building Ivy Facade Wall & Windows (X = 4.8, Z = -20 to -48)
    const rightIvyTex = TextureGenerator.createCourtyardIvyWallTexture();
    rightIvyTex.repeat.set(2, 1);
    const rightIvyGeo = new THREE.BoxGeometry(0.5, 6.2, 28);
    const rightIvyMat = new THREE.MeshStandardMaterial({
      map: rightIvyTex,
      roughness: 0.8,
      metalness: 0.15
    });
    const rightIvyWall = new THREE.Mesh(rightIvyGeo, rightIvyMat);
    rightIvyWall.position.set(4.8, 3.1, -34.5);
    rightIvyWall.castShadow = true;
    rightIvyWall.receiveShadow = true;
    courtyardGroup.add(rightIvyWall);

    // External Air Conditioner Box (AC Outdoor Unit)
    const acGeo = new THREE.BoxGeometry(0.35, 0.55, 0.75);
    const acMat = new THREE.MeshStandardMaterial({ color: 0x8894a0, roughness: 0.5, metalness: 0.7 });
    const acUnit = new THREE.Mesh(acGeo, acMat);
    acUnit.position.set(4.5, 2.7, -25.8);
    acUnit.castShadow = true;
    courtyardGroup.add(acUnit);

    // Potted plants along Right Building Base
    for (let z = -21.0; z >= -47.0; z -= 1.8) {
      this._createPottedPlant(courtyardGroup, 4.4, 0, z);
    }

    // 6. Left Boundary: Fence, Yellow Flag, Billboard, and Overgrown Car
    const leftFenceTex = TextureGenerator.createCourtyardBannerFenceTexture();
    leftFenceTex.repeat.set(2, 1);
    const leftFenceGeo = new THREE.BoxGeometry(0.4, 4.8, 28);
    const leftFenceMat = new THREE.MeshStandardMaterial({
      map: leftFenceTex,
      roughness: 0.85,
      metalness: 0.1
    });
    const leftFenceWall = new THREE.Mesh(leftFenceGeo, leftFenceMat);
    leftFenceWall.position.set(-4.8, 2.4, -34.5);
    leftFenceWall.castShadow = true;
    leftFenceWall.receiveShadow = true;
    courtyardGroup.add(leftFenceWall);

    // Tall Flagpole with Yellow Torn Flag flapping
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x222a33, metalness: 0.9, roughness: 0.3 });
    const flagPole = new THREE.Mesh(poleGeo, poleMat);
    flagPole.position.set(-3.8, 2.4, -26.5);
    flagPole.castShadow = true;
    courtyardGroup.add(flagPole);

    // Yellow Torn Triangular Flag
    const flagShape = new THREE.Shape();
    flagShape.moveTo(0, 0);
    flagShape.lineTo(0.9, 0.45);
    flagShape.lineTo(0, 0.9);
    flagShape.closePath();
    const flagGeo = new THREE.ShapeGeometry(flagShape);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(-3.8, 3.8, -26.5);
    courtyardGroup.add(flagMesh);
    this.courtyardFlags.push(flagMesh);

    // Left Rusted Overgrown Abandoned Car (matching lower-left in image)
    const rustedCarTex = TextureGenerator.createCourtyardRustedCarTexture();
    const carMat = new THREE.MeshStandardMaterial({
      map: rustedCarTex,
      roughness: 0.75,
      metalness: 0.35
    });
    const carChassis = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.7, 4.2), carMat);
    carChassis.position.set(-3.2, 0.55, -23.8);
    carChassis.rotation.y = 0.12;
    carChassis.castShadow = true;
    carChassis.receiveShadow = true;
    courtyardGroup.add(carChassis);

    const carCabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.65, 2.4), carMat);
    carCabin.position.set(-3.2, 1.15, -24.1);
    carCabin.rotation.y = 0.12;
    carCabin.castShadow = true;
    courtyardGroup.add(carCabin);

    // Potted plants along Left Fence Curb
    for (let z = -21.0; z >= -47.0; z -= 1.8) {
      this._createPottedPlant(courtyardGroup, -4.2, 0, z);
    }

    // 7. Center Overgrown Bush / Planter Cluster (X = 0, Z = -34.0)
    const bushTex = TextureGenerator.createCourtyardBushTexture();
    const bushMat = new THREE.MeshStandardMaterial({
      map: bushTex,
      roughness: 0.85,
      metalness: 0.1
    });

    const centerBushGroup = new THREE.Group();
    centerBushGroup.position.set(0.0, 0, -34.0);

    for (let i = 0; i < 9; i++) {
      const bGeo = new THREE.SphereGeometry(0.48 + Math.random() * 0.25, 8, 8);
      const bMesh = new THREE.Mesh(bGeo, bushMat);
      bMesh.scale.set(1.1, 0.75, 1.1);
      bMesh.position.set(
        (Math.random() - 0.5) * 1.3,
        0.45 + (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 1.3
      );
      bMesh.castShadow = true;
      centerBushGroup.add(bMesh);
    }

    // Ring of flower pots around center bush
    const numPots = 8;
    for (let i = 0; i < numPots; i++) {
      const angle = (i * 2 * Math.PI) / numPots;
      const px = Math.cos(angle) * 0.95;
      const pz = Math.sin(angle) * 0.95;
      this._createPottedPlant(centerBushGroup, px, 0, pz);
    }
    courtyardGroup.add(centerBushGroup);
  }

  buildCadetBoard() {
    const cadetTex = TextureGenerator.createCadetBoardTexture();
    const cadetGeo = new THREE.BoxGeometry(0.9, 1.4, 0.05);
    const cadetMat = new THREE.MeshStandardMaterial({
      map: cadetTex,
      roughness: 0.55,
      metalness: 0.2
    });

    const cadetBoard = new THREE.Mesh(cadetGeo, cadetMat);
    cadetBoard.position.set(5.8, 1.4, 0.6);
    cadetBoard.rotation.y = -0.15;
    cadetBoard.castShadow = true;
    this.scene.add(cadetBoard);

    const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

    const leg1 = new THREE.Mesh(legGeo, legMat);
    leg1.position.set(5.45, 0.8, 0.6);
    this.scene.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, legMat);
    leg2.position.set(6.15, 0.8, 0.5);
    this.scene.add(leg2);
  }

  buildGardenAndDetails() {
    // Clean realistic grounds
  }

  buildClueObjects() {
    // ─── Clue 1: Notice Board on Left Wall ────────────────────────────
    const boardGeo = new THREE.BoxGeometry(1.8, 1.3, 0.08);
    const boardTex = TextureGenerator.createNoticeBoardTexture();
    const boardMat = new THREE.MeshStandardMaterial({
      map: boardTex,
      roughness: 0.65
    });

    this.noticeBoardMesh = new THREE.Mesh(boardGeo, boardMat);
    this.noticeBoardMesh.position.set(-5.6, 2.0, 0.25);
    this.noticeBoardMesh.castShadow = true;

    const boardAura = this._createClueBeacon(-5.6, 2.0, 0.45, 0x00d2ff, 'CLUE 1: NOTICE [E]');
    this.scene.add(boardAura);
    this.clueRings.push(boardAura);

    this.noticeBoardMesh.userData = {
      type: 'clue1',
      prompt: 'Read College Notice (Clue 1)',
      action: 'openClue1'
    };
    boardAura.userData = { ...this.noticeBoardMesh.userData };
    this.interactables.push(this.noticeBoardMesh);
    this.interactables.push(boardAura);
    this.scene.add(this.noticeBoardMesh);

    // ─── Clue 2: Stopped Blood Clock ──────────────────────────────────
    const clockGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32);
    const clockTex = TextureGenerator.createClockTexture();
    const clockFaceMat = new THREE.MeshStandardMaterial({ map: clockTex, roughness: 0.45 });
    const clockRimMat = new THREE.MeshStandardMaterial({ color: 0x22110c, roughness: 0.6 });

    this.clockMesh = new THREE.Mesh(clockGeo, [clockRimMat, clockFaceMat, clockRimMat]);
    this.clockMesh.rotation.x = Math.PI / 2;
    this.clockMesh.position.set(2.9, 1.9, 0.55);
    this.clockMesh.castShadow = true;

    const clockAura = this._createClueBeacon(2.9, 1.9, 0.75, 0xff9900, 'CLUE 2: CLOCK [E]');
    this.scene.add(clockAura);
    this.clueRings.push(clockAura);

    this.clockMesh.userData = {
      type: 'clue2',
      prompt: 'Examine Stopped Clock (Clue 2)',
      action: 'openClue2'
    };
    clockAura.userData = { ...this.clockMesh.userData };
    this.interactables.push(this.clockMesh);
    this.interactables.push(clockAura);
    this.scene.add(this.clockMesh);
  }

  buildBackdropSky() {
    const skyTex = TextureGenerator.createSkyTexture();
    if (skyTex) {
      const bgGeo = new THREE.PlaneGeometry(50, 24);
      const bgMat = new THREE.MeshBasicMaterial({
        map: skyTex,
        depthWrite: false
      });
      const bgMesh = new THREE.Mesh(bgGeo, bgMat);
      bgMesh.position.set(0, 9.5, -42.0);
      this.scene.add(bgMesh);
    }
  }

  buildParticleSystems() {
    // Electrical Wire Sparks (at top-left wire)
    this.sparksGroup = new THREE.Group();
    this.sparksGroup.position.set(-3.2, 3.8, 0.25);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending
    });
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), sparkMat);
      p.visible = false;
      p.userData = { vel: new THREE.Vector3() };
      this.sparksGroup.add(p);
    }
    this.scene.add(this.sparksGroup);
  }

  _triggerSparkBurst() {
    if (!this.sparksGroup || !this.sparkLight) return;
    this.sparkLight.intensity = 2.4;
    setTimeout(() => {
      if (this.sparkLight) this.sparkLight.intensity = 0.0;
    }, 120);

    this.sparksGroup.children.forEach((p) => {
      p.visible = true;
      p.position.set(0, 0, 0);
      p.userData.vel.set(
        (Math.random() - 0.5) * 3.5,
        Math.random() * 2.5 - 0.5,
        (Math.random() - 0.5) * 3.5
      );
    });
  }

  updateFlashlight(playerPos, cameraLookDir, isEnabled = true) {
    if (!this.flashlight) return;

    this.flashlight.visible = isEnabled;
    if (this.flashlightCone) this.flashlightCone.visible = isEnabled;

    if (isEnabled && playerPos && cameraLookDir) {
      const flashPos = playerPos.clone().add(new THREE.Vector3(0.2, 1.4, 0.1));
      this.flashlight.position.copy(flashPos);

      const targetPos = flashPos.clone().addScaledVector(cameraLookDir, 16);
      this.flashlightTarget.position.copy(targetPos);

      if (this.flashlightCone) {
        this.flashlightCone.position.copy(flashPos);
        this.flashlightCone.lookAt(targetPos);
      }
    }
  }

  openGate() {
    this.isGateOpen = true;
    if (this.padlockMesh) {
      this.padlockMesh.visible = false;
    }
  }

  update(delta, time) {
    // 1. Ceiling Fans Rotation & Wobble
    if (this.ceilingFans && this.ceilingFans.length > 0) {
      this.ceilingFans.forEach((fan) => {
        if (!fan.userData) return;
        if (fan.userData.bladesMesh) {
          fan.userData.bladesMesh.rotation.y += delta * fan.userData.speed;
        }
        // Subtle realistic downrod sway
        const wobble = Math.sin(time * fan.userData.wobbleSpeed) * fan.userData.wobbleAmt;
        fan.rotation.z = wobble;
      });
    }

    // 2. Peeking Horror Ghosts Breathing & Head Shifts
    if (this.peekingGhosts && this.peekingGhosts.length > 0) {
      this.peekingGhosts.forEach((ghost, i) => {
        const pulse = 1.0 + Math.sin(time * 2.5 + i * 1.8) * 0.05;
        ghost.scale.set(0.9 * pulse, 1.0 * pulse, 1.0);
      });
    }

    // 3. White Dress Apparition Hover & Spectral Glow
    if (this.apparitionGhost) {
      const hover = Math.sin(time * 2.2) * 0.08;
      this.apparitionGhost.position.y = 1.45 + hover;
    }
    if (this.apparitionLight) {
      this.apparitionLight.intensity = 1.2 + Math.sin(time * 3.5) * 0.4;
    }

    // 4. Classroom Windows / Door Interior Light Flicker
    if (this.windowLights && this.windowLights.length > 0) {
      this.windowLights.forEach((light, i) => {
        const n = Math.sin(time * (9 + i * 4)) * Math.cos(time * 5);
        light.intensity = n > 0.4 ? 1.4 : n < -0.4 ? 0.6 : 1.0;
      });
    }

    // 4b. Courtyard Yellow Flag Flap
    if (this.courtyardFlags && this.courtyardFlags.length > 0) {
      this.courtyardFlags.forEach((flag, i) => {
        flag.rotation.y = Math.sin(time * 3.5 + i) * 0.2;
        flag.rotation.z = Math.cos(time * 2.8 + i) * 0.1;
      });
    }

    // 5. Ground Mist Drift
    if (this.mistPlanes && this.mistPlanes.length > 0) {
      this.mistPlanes.forEach((mist) => {
        mist.position.z += delta * (mist.userData.speed || 0.1);
        if (mist.position.z > mist.userData.baseZ + 3.0) {
          mist.position.z = mist.userData.baseZ - 3.0;
        }
      });
    }

    // 6. Signboard Spotlight electrical flicker
    if (this.signSpot) {
      const n = Math.sin(time * 14.3) * Math.cos(time * 5.8);
      this.signSpot.intensity = n > 0.65 ? 0.5 : n < -0.8 ? 3.0 : 2.0;
    }

    // 7. Ground Mist / Puddle Ripple
    if (this.puddleGlow) {
      this.puddleGlow.intensity = 0.75 + Math.sin(time * 1.8) * 0.25;
    }

    // 8. Electrical Sparks periodically burst
    this.sparkTimer += delta;
    if (this.sparkTimer > 3.8) {
      this.sparkTimer = 0;
      this._triggerSparkBurst();
    }
    if (this.sparksGroup) {
      this.sparksGroup.children.forEach((p) => {
        if (p.visible) {
          p.position.addScaledVector(p.userData.vel, delta);
          p.userData.vel.y -= delta * 9.8;
          if (p.position.y < -3.5) p.visible = false;
        }
      });
    }

    // 9. Clue Aura Beacons Floating Animation
    if (this.clueRings && this.clueRings.length > 0) {
      this.clueRings.forEach((beacon, i) => {
        if (!beacon || !beacon.userData) return;
        const bob = Math.sin(time * 2.8 + i * 1.5) * 0.06;
        beacon.position.y = beacon.userData.baseY + bob;
        if (beacon.userData.gemMesh) {
          beacon.userData.gemMesh.rotation.y += delta * 1.6;
          beacon.userData.gemMesh.rotation.x += delta * 0.9;
        }
        if (beacon.userData.ringMesh) {
          beacon.userData.ringMesh.rotation.z += delta * 1.2;
        }
      });
    }

    // 10. Gate Swing Animation
    if (this.isGateOpen && this.gateAngle < Math.PI * 0.55) {
      this.gateAngle += delta * 0.75;
      if (this.leftGate)  this.leftGate.rotation.y  = -this.gateAngle;
      if (this.rightGate) this.rightGate.rotation.y =  this.gateAngle;
    }
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
