import * as THREE from 'three';
import { charSheet, CHAR_ACCENTS, CHAR_BRANCHES, CHAR_NAMES } from './character-sheet.js';
import { CharacterSprite } from './character.js';

/**
 * AI Squad Companion Manager
 * Spawns 3 computer-controlled companions that follow the player, assist with clues,
 * and dynamically address the player by their customized name.
 */
export class SquadManager {
  constructor(scene, playerCharIndex) {
    this.scene = scene;
    this.playerCharIndex = playerCharIndex;
    this.playerName = charSheet.getHeroName(playerCharIndex);
    this.companions = [];
    this.dialogueTimer = null;
    this.hasWarnedDanger = false;

    // Formation offsets relative to player
    this.formationOffsets = [
      new THREE.Vector3(-2.2, 0,  2.0),
      new THREE.Vector3( 2.2, 0,  2.0),
      new THREE.Vector3( 0.0, 0,  3.6),
    ];

    this._spawnCompanions();
  }

  _spawnCompanions() {
    // Pick 3 companion indices that aren't the player's character
    const available = [];
    for (let i = 0; i < 10; i++) {
      if (i !== this.playerCharIndex) available.push(i);
    }

    const picks = [available[0], available[3] || available[1], available[7] || available[2]];

    picks.forEach((charIdx, slot) => {
      const sprite = new CharacterSprite(charIdx, false);
      sprite.root.position.set(
        (slot - 1) * 2.4,
        0,
        10.5 + slot * 0.8
      );
      this.scene.scene.add(sprite.root);

      this.companions.push({
        sprite,
        charIdx,
        name: CHAR_NAMES[charIdx] || `OPERATIVE ${slot + 1}`,
        branch: CHAR_BRANCHES[charIdx] || 'SQUAD',
        offset: this.formationOffsets[slot]
      });
    });

    // Initial greeting after deploying
    setTimeout(() => {
      this.speak(0, `Stay sharp, ${this.playerName}! The GMN College main gate is locked down tight. Let's find those 3 clues.`);
    }, 2000);
  }

  update(delta, playerPos, playerRotY, isPlayerMoving) {
    this.companions.forEach((comp) => {
      const rotatedOffset = comp.offset.clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotY);
      const target = playerPos.clone().add(rotatedOffset);
      target.y = 0;

      const diff = target.clone().sub(comp.sprite.root.position);
      diff.y = 0;
      const dist = diff.length();

      let moving = false;
      let speed = 3.4;

      if (dist > 1.2) {
        moving = true;
        if (dist > 3.8) speed = 5.8;
        const dir = diff.clone().normalize();
        comp.sprite.lookAtDirection(dir.x, dir.z, delta);
        comp.sprite.root.position.addScaledVector(dir, speed * delta);
      } else {
        const fx = -Math.sin(playerRotY);
        const fz = -Math.cos(playerRotY);
        comp.sprite.lookAtDirection(fx, fz, delta);
      }

      comp.sprite.update(delta, moving, speed > 4.5);
    });

    this._proximityHints(delta);
  }

  _proximityHints(delta) {
    if (!this.hasWarnedDanger &&
        this.scene.camera.position.x > 2.2 &&
        this.scene.camera.position.z < 2.5) {
      this.hasWarnedDanger = true;
      this.reactToDanger();
    }
  }

  speak(slotIndex, message) {
    const comp = this.companions[slotIndex];
    if (!comp) return;
    const feed = document.getElementById('companion-dialog-feed');
    if (!feed) return;

    feed.classList.remove('hidden');
    const accent = CHAR_ACCENTS[comp.charIdx];
    const portrait = charSheet.getPortraitDataURL(comp.charIdx);

    feed.innerHTML = `
      <div class="speech-avatar" style="border-color: ${accent};">
        ${portrait
          ? `<img src="${portrait}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
          : `<span class="avatar-badge" style="background:${accent};">${comp.name[0]}</span>`
        }
      </div>
      <div class="speech-body">
        <div class="speech-name" style="color: ${accent};">
          ${comp.name} <span class="speech-branch">[${comp.branch}]</span>
        </div>
        <div class="speech-text">"${message}"</div>
      </div>
    `;

    if (this.dialogueTimer) clearTimeout(this.dialogueTimer);
    this.dialogueTimer = setTimeout(() => {
      feed.classList.add('hidden');
    }, 4800);
  }

  reactToClue(type) {
    if (!this.companions.length) return;
    if (type === 'clue1') {
      this.speak(1, `Great find ${this.playerName}! The evacuation notice says the last bell rang at 7:13 PM. That gives us 13 for the minutes!`);
    } else if (type === 'clue2') {
      this.speak(0, `${this.playerName}, check the blood-stained clock! The hour hand froze right at 7. Keep that 7 in mind!`);
    } else if (type === 'clue3') {
      this.speak(2, `Awesome ${this.playerName}! "G-M-N" is a 3-letter acronym. 3 completes the combination! Code: 13 — 7 — 3!`);
    }
  }

  reactToDanger() {
    this.speak(0, `FREEZE ${this.playerName}! Look at that dark arched corridor on the right... Two glowing RED EYES are staring straight at us!`);
  }

  reactToJumpscare() {
    this.speak(0, `BEHIND YOU ${this.playerName}!! THE ENTITY IS BREACHING!! RUN!!`);
  }

  reactToUnlock() {
    // Equip assault rifles to all AI squad companions
    this.companions.forEach((comp) => {
      if (comp.sprite && typeof comp.sprite.equipGun === 'function') {
        comp.sprite.equipGun();
      }
    });

    this.speak(1, `🚨 WEAPONS DELIVERED! ${this.playerName}, the main gate is breached and tactical assault rifles are equipped to our squad! Weapons hot!`);
  }
}
