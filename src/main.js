import * as THREE from 'three';
import { HorrorScene } from './scene.js';
import { HorrorControls } from './controls.js';
import { PuzzleManager } from './puzzle.js';
import { horrorAudio } from './audio.js';
import { CharacterModel, GMN_CHARACTERS } from './character.js';
import { SquadManager } from './companions.js';
import { charSheet, CHAR_ACCENTS, CHAR_BRANCHES, CHAR_NAMES, CHAR_GEAR, CHAR_QUOTES } from './character-sheet.js';

/**
 * Main Game Controller
 * Fully Articulated Realistic 3D Characters & Polish
 */

class GameApp {
  constructor() {
    this.scene = null;
    this.controls = null;
    this.puzzle = null;
    this.squad = null;
    this.playerModel = null;
    this.clock = new THREE.Clock();
    this.isRunning = false;

    // Selected Hero Index (0..9)
    this.selectedCharIndex = 0;
    this.playerCallsign = 'LUCAS';
  }

  init() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // 1. Initialize 3D Scene
    this.scene = new HorrorScene(container);
    this.scene.init();

    // 2. Initialize Puzzle Manager
    this.puzzle = new PuzzleManager(this.scene);

    // 3. Load character roster & setup UI
    charSheet.load(() => {
      this.populateCharacterSelectUI();
      this.setupCallsignInput();
    });

    // 4. Setup Start / Deploy Button
    document.getElementById('start-btn')?.addEventListener('click', () => {
      this.startGameSession();
    });

    // 5. Start VHS Time Ticker
    this.startVHSTicker();
  }

  setupCallsignInput() {
    const input = document.getElementById('player-callsign-input');
    input?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      this.playerCallsign = val || CHAR_NAMES[this.selectedCharIndex] || 'SURVIVOR';
      charSheet.setCallsign(this.playerCallsign);
      this.updateDeployButton();
    });
  }

  populateCharacterSelectUI() {
    const grid = document.getElementById('character-grid');
    if (!grid) return;

    grid.innerHTML = '';

    for (let i = 0; i < 10; i++) {
      const accent = CHAR_ACCENTS[i];
      const branch = CHAR_BRANCHES[i];
      const name = CHAR_NAMES[i];
      const gear = CHAR_GEAR[i] || 'Tactical Gear';
      const quote = CHAR_QUOTES[i] || '';
      const portrait = charSheet.getPortraitDataURL(i);

      const card = document.createElement('div');
      card.className = 'char-card' + (this.selectedCharIndex === i ? ' active' : '');
      card.setAttribute('data-index', String(i));
      card.style.setProperty('--accent', accent);

      card.innerHTML = `
        <div class="char-portrait-wrapper">
          ${portrait
            ? `<img class="char-portrait-img" src="${portrait}" alt="${name}" />`
            : `<div class="char-portrait-placeholder" style="background:${accent}20;"></div>`
          }
          <div class="char-badge" style="background:${accent};">${branch}</div>
        </div>
        <div class="char-card-body">
          <div class="char-name" style="color:#ffffff;">${name}</div>
          <div class="char-quote">${quote}</div>
          <div class="char-role">${gear}</div>
        </div>
        <div class="char-select-marker"></div>
      `;

      card.addEventListener('click', () => {
        grid.querySelectorAll('.char-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedCharIndex = i;

        // Update default callsign if not custom edited
        const input = document.getElementById('player-callsign-input');
        if (input && (!input.value || CHAR_NAMES.includes(input.value.toUpperCase()))) {
          input.value = name;
          this.playerCallsign = name;
          charSheet.setCallsign(name);
        }

        this.updateDeployButton();
      });

      grid.appendChild(card);
    }
  }

  updateDeployButton() {
    const chosenNameSpan = document.getElementById('chosen-char-name');
    if (!chosenNameSpan) return;

    const currentName = this.playerCallsign || CHAR_NAMES[this.selectedCharIndex] || 'OPERATIVE';
    chosenNameSpan.textContent = currentName.toUpperCase();
  }

  startGameSession() {
    const startScreen = document.getElementById('start-screen');

    // 1. Init Audio
    horrorAudio.init();
    horrorAudio.resume();

    // Set callsign
    charSheet.setCallsign(this.playerCallsign);

    // 2. Spawn fully articulated 3D Realistic Character Model
    this.playerModel = new CharacterModel(this.selectedCharIndex, true);
    this.scene.scene.add(this.playerModel.root);
    this.playerModel.root.position.set(0, 0, 9.2);

    // 3. Update In-Game HUD Profile Badge
    const hudName = document.getElementById('hud-player-name');
    const hudRole = document.getElementById('hud-player-role');
    const hudImg = document.getElementById('hud-avatar-img');
    const hudPlaceholder = document.getElementById('hud-avatar-placeholder');
    const hudFrame = document.getElementById('hud-avatar-frame');

    const heroName = charSheet.getHeroName(this.selectedCharIndex);
    const heroRole = charSheet.getHeroBranch(this.selectedCharIndex);
    const heroAccent = charSheet.getHeroAccent(this.selectedCharIndex);
    const heroPortrait = charSheet.getPortraitDataURL(this.selectedCharIndex);

    if (hudName) hudName.textContent = heroName;
    if (hudRole) hudRole.textContent = `${heroRole} • SQUAD LEAD`;
    if (hudFrame) {
      hudFrame.style.borderColor = heroAccent;
      hudFrame.style.boxShadow = `0 0 14px ${heroAccent}99`;
    }
    if (heroPortrait && hudImg) {
      hudImg.src = heroPortrait;
      hudImg.classList.remove('hidden');
      if (hudPlaceholder) hudPlaceholder.classList.add('hidden');
    }

    // 4. AAA 3rd-Person Controls with Inertia Physics & Spring Camera
    this.controls = new HorrorControls(
      this.scene.camera,
      this.scene,
      this.scene.renderer.domElement,
      this.playerModel
    );

    // Interaction hook
    this.controls.onInteract = (userData) => {
      if (userData?.type) this.puzzle.openClue(userData.type);
    };

    // 5. AI Companions (with 3D Realistic Models)
    this.squad = new SquadManager(this.scene, this.selectedCharIndex);

    // Squad & Player hooks
    this.puzzle.onClue      = (type) => this.squad.reactToClue(type);
    this.puzzle.onJumpscare = ()     => this.squad.reactToJumpscare();
    this.puzzle.onUnlock    = ()     => {
      // 1. Equip gun to Player Model
      if (this.playerModel) {
        this.playerModel.equipGun();
      }

      // 2. Play gun cocking sound
      horrorAudio.playGunCock();

      // 3. Equip guns to AI Companions
      if (this.squad) {
        this.squad.reactToUnlock();
      }

      // 4. Reveal Weapon Unlocked HUD notification
      const banner = document.getElementById('weapon-unlocked-banner');
      if (banner) {
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 6000);
      }

      // 5. Position player at corridor entrance facing down the covered walkway
      if (this.controls) {
        setTimeout(() => {
          this.controls.position.set(0, 0, -0.6);
          this.controls.yaw = 0;
          this.controls.targetYaw = 0;
          this.controls.pitch = 0.04;
          this.controls.targetPitch = 0.04;
          this.controls.updateCamera(0.016);
        }, 1400);
      }
    };

    // 6. Hide Selection Screen with smooth fade
    if (startScreen) {
      startScreen.style.opacity = '0';
      setTimeout(() => startScreen.classList.add('hidden'), 600);
    }

    // 7. Lock Pointer
    this.scene.renderer.domElement.requestPointerLock();

    // 8. Start Animation Loop
    this.isRunning = true;
    this.animate();
  }

  startVHSTicker() {
    const clockEl = document.getElementById('vhs-clock');
    if (!clockEl) return;
    let seconds = 13;
    setInterval(() => {
      seconds = (seconds + 1) % 60;
      clockEl.textContent = `07:13:${String(seconds).padStart(2, '0')} PM`;
    }, 1000);
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    const delta       = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Player movement, physics & skeletal locomotion
    if (this.controls) this.controls.update(delta);

    // AI Squad Realistic Locomotion
    if (this.squad && this.controls) {
      const moving = this.controls.velocity.lengthSq() > 0.05;
      this.squad.update(delta, this.controls.position, this.controls.yaw, moving);
    }

    // Scene lights, gate, eyes, dust & mist particles, electrical sparks
    this.scene.update(delta, elapsedTime);

    // Render
    this.scene.renderer.render(this.scene.scene, this.scene.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  app.init();
});
