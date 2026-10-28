import { horrorAudio } from './audio.js';

/**
 * Puzzle Manager & Narrative Flow
 * Tracks Clues 1, 2, 3, manages modal views, handles the 13-7-3 padlock puzzle, jumpscares, and ending cutscene.
 */

export class PuzzleManager {
  constructor(scene) {
    this.scene = scene;

    // Puzzle Clue States
    this.clues = {
      clue1: false, // 13 (Notice Board - Last Bell)
      clue2: false, // 7  (Stopped Clock - Hour)
      clue3: false  // 3  (Shadow Locker - G-M-N triad)
    };

    // Tumbler dials values: [13, 7, 3]
    this.tumblers = {
      dial1: 0,
      dial2: 0,
      dial3: 0
    };

    this.isUnlocked = false;
    this.onClue = null;
    this.onJumpscare = null;
    this.onUnlock = null;
    this.setupUI();
  }

  setupUI() {
    // Close modal buttons
    document.querySelectorAll('.close-modal-btn, .action-btn[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = btn.getAttribute('data-close') || btn.closest('.modal-backdrop')?.id;
        if (modalId) {
          this.closeModal(modalId);
        }
      });
    });

    // ESC key closes any open modal
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.closeAllModals();
      }
    });

    // Tumbler dial buttons
    document.querySelectorAll('.dial-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dialNum = parseInt(btn.getAttribute('data-tumbler'));
        const dir = parseInt(btn.getAttribute('data-dir'));
        this.adjustDial(dialNum, dir);
      });
    });

    // Unlock button on padlock
    const tryUnlockBtn = document.getElementById('try-unlock-btn');
    if (tryUnlockBtn) {
      tryUnlockBtn.addEventListener('click', () => {
        this.verifyCombination();
      });
    }

    // Replay / Explore buttons
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }

    const exploreBtn = document.getElementById('explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        const endingScreen = document.getElementById('ending-screen');
        if (endingScreen) {
          endingScreen.classList.add('hidden');
        }
        document.body.requestPointerLock();
      });
    }
  }

  openClue(type) {
    document.exitPointerLock();

    if (type === 'clue1') {
      this.clues.clue1 = true;
      this.updateTracker(1, '13 (7:13 PM Bell)');
      document.getElementById('notice-modal')?.classList.remove('hidden');
      horrorAudio.playClueFound();
      if (this.onClue) this.onClue(type);
    } else if (type === 'clue2') {
      this.clues.clue2 = true;
      this.updateTracker(2, '7 (Frozen Hour)');
      document.getElementById('clock-modal')?.classList.remove('hidden');
      horrorAudio.playClueFound();
      if (this.onClue) this.onClue(type);
    } else if (type === 'clue3') {
      this.clues.clue3 = true;
      this.updateTracker(3, '3 (G-M-N Triad)');
      document.getElementById('shadow-modal')?.classList.remove('hidden');
      horrorAudio.playClueFound();
      if (this.onClue) this.onClue(type);
    } else if (type === 'padlock') {
      this.updateLockClueHints();
      document.getElementById('padlock-modal')?.classList.remove('hidden');
    }
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.add('hidden');
    });
  }

  updateTracker(num, text) {
    const item = document.getElementById(`clue-tracker-${num}`);
    if (item) {
      item.classList.add('found');
      item.querySelector('.clue-status').textContent = '[ ✓ ]';
      item.querySelector('.clue-val').textContent = text;
    }
  }

  updateLockClueHints() {
    const n1 = document.getElementById('note-1');
    const n2 = document.getElementById('note-2');
    const n3 = document.getElementById('note-3');

    if (n1) n1.textContent = this.clues.clue1 ? 'Notice: 13' : 'Notice: [ ? ]';
    if (n2) n2.textContent = this.clues.clue2 ? 'Clock: 7' : 'Clock: [ ? ]';
    if (n3) n3.textContent = this.clues.clue3 ? 'Entity: 3' : 'Entity: [ ? ]';
  }

  adjustDial(dialNum, dir) {
    horrorAudio.playTumblerTurn();

    if (dialNum === 1) {
      this.tumblers.dial1 = (this.tumblers.dial1 + dir + 100) % 100;
      const d1 = document.getElementById('dial-1');
      if (d1) d1.textContent = String(this.tumblers.dial1).padStart(2, '0');
    } else if (dialNum === 2) {
      this.tumblers.dial2 = (this.tumblers.dial2 + dir + 10) % 10;
      const d2 = document.getElementById('dial-2');
      if (d2) d2.textContent = String(this.tumblers.dial2);
    } else if (dialNum === 3) {
      this.tumblers.dial3 = (this.tumblers.dial3 + dir + 10) % 10;
      const d3 = document.getElementById('dial-3');
      if (d3) d3.textContent = String(this.tumblers.dial3);
    }
  }

  verifyCombination() {
    const feedback = document.getElementById('lock-feedback');

    // Combination required: 13 - 7 - 3
    const isCorrect = (
      this.tumblers.dial1 === 13 &&
      this.tumblers.dial2 === 7 &&
      this.tumblers.dial3 === 3
    );

    if (isCorrect) {
      this.triggerGateUnlock();
    } else {
      this.triggerJumpscare();
      if (feedback) {
        feedback.className = 'lock-msg error';
        feedback.textContent = 'INCORRECT COMBINATION! THE APPARITION AWAKENS!';
      }
    }
  }

  triggerJumpscare() {
    const jumpscareOverlay = document.getElementById('jumpscare-overlay');
    horrorAudio.playJumpscare();
    if (this.onJumpscare) this.onJumpscare();

    if (jumpscareOverlay) {
      jumpscareOverlay.classList.remove('hidden');

      setTimeout(() => {
        jumpscareOverlay.classList.add('hidden');
      }, 1800);
    }
  }

  triggerGateUnlock() {
    this.isUnlocked = true;
    horrorAudio.playGateUnlock();
    if (this.onUnlock) this.onUnlock();

    const shackle = document.querySelector('.shackle');
    if (shackle) {
      shackle.classList.add('unlocked');
    }

    const feedback = document.getElementById('lock-feedback');
    if (feedback) {
      feedback.className = 'lock-msg success';
      feedback.textContent = 'CLICK! 🔓 COMBINATION ACCEPTED!';
    }

    // Start 3D gate opening
    setTimeout(() => {
      this.closeAllModals();
      this.scene.openGate();
      horrorAudio.playGateCreak();

      // Update Objective Panel
      const objTitle = document.querySelector('.objective-title');
      if (objTitle) {
        objTitle.textContent = 'Explore The Campus Corridors';
      }
      const gateHint = document.getElementById('clue-tracker-gate');
      if (gateHint) {
        gateHint.innerHTML = `
          <span class="clue-status">🔓</span>
          <span class="clue-name">Gate Breached: <strong class="clue-val" style="color:#2ed573;">ENTER THE CAMPUS</strong></span>
        `;
      }

      // Re-engage pointer lock so the player directly steps into the 3D covered corridor scene!
      setTimeout(() => {
        document.body.requestPointerLock();
      }, 500);
    }, 1200);
  }

  triggerCinematicEnding() {
    const endingScreen = document.getElementById('ending-screen');
    const q1 = document.getElementById('quote-line-1');
    const q2 = document.getElementById('quote-line-2');
    const q3 = document.getElementById('quote-line-3');
    const lore = document.getElementById('lore-summary');

    if (!endingScreen) return;

    endingScreen.classList.remove('hidden');

    // Sequential text reveals as requested by user
    setTimeout(() => {
      if (q1) q1.classList.add('visible');
    }, 800);

    setTimeout(() => {
      if (q2) q2.classList.add('visible');
    }, 2800);

    setTimeout(() => {
      if (q3) q3.classList.add('visible');
    }, 5000);

    setTimeout(() => {
      // Fade out quotes, reveal full lore and Chapter 2 preview
      if (q1) q1.classList.remove('visible');
      if (q2) q2.classList.remove('visible');
      if (q3) q3.classList.remove('visible');

      setTimeout(() => {
        if (q1) q1.classList.add('hidden');
        if (q2) q2.classList.add('hidden');
        if (q3) q3.classList.add('hidden');
        if (lore) lore.classList.remove('hidden');
      }, 1000);
    }, 7500);
  }
}
