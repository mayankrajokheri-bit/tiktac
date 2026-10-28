import * as THREE from 'three';
import { charSheet, CHAR_ACCENTS, CHAR_BRANCHES, CHAR_NAMES } from './character-sheet.js';

/**
 * 3D Realistic Character Model — Tactical Operative & GMN Survivors
 * Features:
 * - High-Detail Humanoid Skeletal Structure (Head, Curly Hair, Face, Neck, Torso, Shoulders, Elbows, Hands, Pelvis, Knees, Boots)
 * - Hero Tactical Suit: Slate-Grey & Cobalt-Blue Padded Jacket, Metallic Shoulder Pauldrons, Forearm Bracers, Chest Harness
 * - Unarmed by default (No bow / quiver)
 * - Post-Gate Unlock: Equips 3D Tactical Assault Rifle (M4A1 with Holographic Optic, Laser Module & Muzzle Flash)
 * - Dual-Phase Locomotion IK Engine (Smooth Walking, Sprint Lean, Idle Breathing, Tactical Rifle Aiming)
 */

export class CharacterModel {
  constructor(charIndex = 0, isPlayer = false) {
    this.charIndex = typeof charIndex === 'number' ? charIndex % 10 : 0;
    this.isPlayer = isPlayer;

    this.root = new THREE.Group();
    this.name = charSheet.getHeroName(this.charIndex);
    this.accent = charSheet.getHeroAccent(this.charIndex);
    this.branch = charSheet.getHeroBranch(this.charIndex);

    // Animation & Combat States
    this.animTime = Math.random() * 20;
    this.currentSpeed = 0;
    this.stridePhase = 0;
    this.isAiming = false;
    this.hasGun = false;
    this.recoilKick = 0;

    // Joint references
    this.joints = {
      torso: null,
      chest: null,
      head: null,
      leftShoulder: null,
      leftArm: null,
      leftForearm: null,
      leftHand: null,
      rightShoulder: null,
      rightArm: null,
      rightForearm: null,
      rightHand: null,
      pelvis: null,
      leftThigh: null,
      leftCalf: null,
      leftFoot: null,
      rightThigh: null,
      rightCalf: null,
      rightFoot: null
    };

    this.gunMesh = null;
    this._build3DCharacter();
  }

  _build3DCharacter() {
    // ─── PBR Material Palette matching the Hero Photo ─────────────────
    const jacketSlateMat = new THREE.MeshStandardMaterial({
      color: 0x2e3a47,
      roughness: 0.6,
      metalness: 0.2
    });

    const jacketBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.55,
      metalness: 0.25
    });

    const armorMetalMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.28,
      metalness: 0.85
    });

    const harnessMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.7,
      metalness: 0.3
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.1
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b18,
      roughness: 0.45,
      metalness: 0.4
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd9a07a,
      roughness: 0.75,
      metalness: 0.05
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x24160d,
      roughness: 0.9,
      metalness: 0.05
    });

    // ─── 1. Pelvis / Hips ─────────────────────────────────────────────
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.98;
    this.root.add(pelvis);
    this.joints.pelvis = pelvis;

    const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.22), pantsMat);
    pelvisMesh.castShadow = true;
    pelvisMesh.receiveShadow = true;
    pelvis.add(pelvisMesh);

    // Tactical Belt & Buckle
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.24), harnessMat);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), armorMetalMat);
    buckle.position.set(0, 0, 0.13);
    pelvis.add(belt);
    pelvis.add(buckle);

    // ─── 2. Torso & Chest ─────────────────────────────────────────────
    const torso = new THREE.Group();
    torso.position.y = 0.09;
    pelvis.add(torso);
    this.joints.torso = torso;

    // Waist / Lower Jacket
    const waist = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.24), jacketSlateMat);
    waist.position.y = 0.11;
    waist.castShadow = true;
    waist.receiveShadow = true;
    torso.add(waist);

    // Blue Side Accent Panels
    const leftSideAccent = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.20, 0.22), jacketBlueMat);
    leftSideAccent.position.set(-0.17, 0.11, 0);
    const rightSideAccent = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.20, 0.22), jacketBlueMat);
    rightSideAccent.position.set(0.17, 0.11, 0);
    torso.add(leftSideAccent);
    torso.add(rightSideAccent);

    // Chest Group
    const chest = new THREE.Group();
    chest.position.y = 0.22;
    torso.add(chest);
    this.joints.chest = chest;

    // Padded Chest Armor Block
    const upperChest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.28), jacketSlateMat);
    upperChest.position.y = 0.14;
    upperChest.castShadow = true;
    upperChest.receiveShadow = true;
    chest.add(upperChest);

    // Center Blue Chest Inset
    const blueChestCenter = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.04), jacketBlueMat);
    blueChestCenter.position.set(0, 0.14, 0.13);
    chest.add(blueChestCenter);

    // Tactical Chest Harness & Straps
    const harnessPlate = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.04), harnessMat);
    harnessPlate.position.set(0, 0.16, 0.14);
    harnessPlate.castShadow = true;
    chest.add(harnessPlate);

    // Central Radio / Sensor Unit
    const sensorUnit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.06), armorMetalMat);
    sensorUnit.position.set(0, 0.18, 0.17);
    chest.add(sensorUnit);

    // ─── 3. Neck, Head, Curly Hair & Face ──────────────────────────────
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.09, 12), skinMat);
    neck.position.y = 0.31;
    chest.add(neck);

    // High Padded Tactical Collar
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.08, 12, 1, true), jacketSlateMat);
    collar.position.y = 0.31;
    chest.add(collar);

    const head = new THREE.Group();
    head.position.y = 0.44;
    chest.add(head);
    this.joints.head = head;

    // Sculpted Hero Head
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.22), skinMat);
    headMesh.castShadow = true;
    head.add(headMesh);

    // Volumetric Curly Dark Hair
    const hairDome = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.26), hairMat);
    hairDome.position.set(0, 0.12, -0.01);
    head.add(hairDome);

    // Curly Hair Curls/Tufts
    const curlGeo = new THREE.DodecahedronGeometry(0.065, 0);
    const curl1 = new THREE.Mesh(curlGeo, hairMat);
    curl1.position.set(-0.08, 0.16, 0.08);
    const curl2 = new THREE.Mesh(curlGeo, hairMat);
    curl2.position.set(0.06, 0.17, 0.07);
    const curl3 = new THREE.Mesh(curlGeo, hairMat);
    curl3.position.set(0.0, 0.18, 0.02);
    head.add(curl1);
    head.add(curl2);
    head.add(curl3);

    // Facial Stubble / Jaw Shadow & Eyes
    const jawShadow = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.07, 0.12), new THREE.MeshStandardMaterial({ color: 0xb5805e, roughness: 0.9 }));
    jawShadow.position.set(0, -0.07, 0.06);
    head.add(jawShadow);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a202c });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.018, 0.01), eyeMat);
    leftEye.position.set(-0.055, 0.03, 0.115);
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.018, 0.01), eyeMat);
    rightEye.position.set(0.055, 0.03, 0.115);
    head.add(leftEye);
    head.add(rightEye);

    // ─── 4. Left Arm ───────────────────────────────────────────────────
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.26, 0.24, 0);
    chest.add(leftShoulder);
    this.joints.leftShoulder = leftShoulder;

    // Metallic Curved Shoulder Pauldron
    const leftPauldron = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.18), armorMetalMat);
    leftPauldron.position.set(-0.02, 0.02, 0);
    leftPauldron.castShadow = true;
    leftShoulder.add(leftPauldron);

    const leftUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.13), jacketBlueMat);
    leftUpperArm.position.y = -0.13;
    leftUpperArm.castShadow = true;
    leftShoulder.add(leftUpperArm);

    const leftElbow = new THREE.Group();
    leftElbow.position.y = -0.26;
    leftShoulder.add(leftElbow);
    this.joints.leftForearm = leftElbow;

    // Forearm Armor Guard
    const leftForearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, 0.11), jacketSlateMat);
    leftForearmMesh.position.y = -0.12;
    leftForearmMesh.castShadow = true;
    leftElbow.add(leftForearmMesh);

    const leftBracer = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.04), armorMetalMat);
    leftBracer.position.set(0, -0.12, 0.06);
    leftElbow.add(leftBracer);

    // Fingerless Tactical Glove & Hand
    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.08), harnessMat);
    leftHand.position.y = -0.26;
    leftElbow.add(leftHand);
    this.joints.leftHand = leftHand;

    // ─── 5. Right Arm ──────────────────────────────────────────────────
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.26, 0.24, 0);
    chest.add(rightShoulder);
    this.joints.rightShoulder = rightShoulder;

    const rightPauldron = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.18), armorMetalMat);
    rightPauldron.position.set(0.02, 0.02, 0);
    rightPauldron.castShadow = true;
    rightShoulder.add(rightPauldron);

    const rightUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.13), jacketBlueMat);
    rightUpperArm.position.y = -0.13;
    rightUpperArm.castShadow = true;
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.y = -0.26;
    rightShoulder.add(rightElbow);
    this.joints.rightForearm = rightElbow;

    const rightForearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, 0.11), jacketSlateMat);
    rightForearmMesh.position.y = -0.12;
    rightForearmMesh.castShadow = true;
    rightElbow.add(rightForearmMesh);

    const rightBracer = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.04), armorMetalMat);
    rightBracer.position.set(0, -0.12, 0.06);
    rightElbow.add(rightBracer);

    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.08), harnessMat);
    rightHand.position.y = -0.26;
    rightElbow.add(rightHand);
    this.joints.rightHand = rightHand;

    // ─── 6. Left Leg with Cargo Pockets & Knee Armor ───────────────────
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.11, -0.09, 0);
    pelvis.add(leftHip);
    this.joints.leftThigh = leftHip;

    const leftThighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.16), pantsMat);
    leftThighMesh.position.y = -0.22;
    leftThighMesh.castShadow = true;
    leftHip.add(leftThighMesh);

    const leftPocket = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.12), harnessMat);
    leftPocket.position.set(-0.08, -0.22, 0);
    leftHip.add(leftPocket);

    const leftKnee = new THREE.Group();
    leftKnee.position.y = -0.44;
    leftHip.add(leftKnee);
    this.joints.leftCalf = leftKnee;

    const leftCalfMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.42, 0.14), pantsMat);
    leftCalfMesh.position.y = -0.21;
    leftCalfMesh.castShadow = true;
    leftKnee.add(leftCalfMesh);

    const leftKneePad = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 0.05), harnessMat);
    leftKneePad.position.set(0, -0.05, 0.08);
    leftKnee.add(leftKneePad);

    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.26), bootMat);
    leftBoot.position.set(0, -0.42, 0.04);
    leftBoot.castShadow = true;
    leftKnee.add(leftBoot);

    // ─── 7. Right Leg with Cargo Pockets & Knee Armor ──────────────────
    const rightHip = new THREE.Group();
    rightHip.position.set(0.11, -0.09, 0);
    pelvis.add(rightHip);
    this.joints.rightThigh = rightHip;

    const rightThighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.16), pantsMat);
    rightThighMesh.position.y = -0.22;
    rightThighMesh.castShadow = true;
    rightHip.add(rightThighMesh);

    const rightPocket = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.12), harnessMat);
    rightPocket.position.set(0.08, -0.22, 0);
    rightHip.add(rightPocket);

    const rightKnee = new THREE.Group();
    rightKnee.position.y = -0.44;
    rightHip.add(rightKnee);
    this.joints.rightCalf = rightKnee;

    const rightCalfMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.42, 0.14), pantsMat);
    rightCalfMesh.position.y = -0.21;
    rightCalfMesh.castShadow = true;
    rightKnee.add(rightCalfMesh);

    const rightKneePad = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 0.05), harnessMat);
    rightKneePad.position.set(0, -0.05, 0.08);
    rightKnee.add(rightKneePad);

    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.26), bootMat);
    rightBoot.position.set(0, -0.42, 0.04);
    rightBoot.castShadow = true;
    rightKnee.add(rightBoot);
  }

  _buildAssaultRifle() {
    const gun = new THREE.Group();

    // High-Detail PBR Firearm Materials
    const gunMetalMat = new THREE.MeshStandardMaterial({
      color: 0x181e24,
      roughness: 0.32,
      metalness: 0.88
    });

    const polymerMat = new THREE.MeshStandardMaterial({
      color: 0x0f141a,
      roughness: 0.65,
      metalness: 0.15
    });

    const darkAccentMat = new THREE.MeshStandardMaterial({
      color: 0x24303c,
      roughness: 0.4,
      metalness: 0.65
    });

    const lensMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85
    });

    const laserDotMat = new THREE.MeshBasicMaterial({
      color: 0xff0044
    });

    // 1. Lower & Upper Receiver Body
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.11, 0.34), gunMetalMat);
    receiver.position.set(0, 0, 0);
    receiver.castShadow = true;
    gun.add(receiver);

    // 2. Picatinny Top Rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.02, 0.44), darkAccentMat);
    rail.position.set(0, 0.065, 0.02);
    gun.add(rail);

    // 3. Holographic Reflex Sight
    const opticHousing = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.055, 0.085), polymerMat);
    opticHousing.position.set(0, 0.10, -0.02);
    const opticLens = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.04, 0.01), lensMat);
    opticLens.position.set(0, 0.10, 0.018);
    const opticDot = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6), laserDotMat);
    opticDot.position.set(0, 0.10, 0.02);
    gun.add(opticHousing);
    gun.add(opticLens);
    gun.add(opticDot);

    // 4. Barrel & Tactical Handguard Shroud
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.08, 0.26), darkAccentMat);
    handguard.position.set(0, 0.005, 0.28);
    gun.add(handguard);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.22, 10), gunMetalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.005, 0.48);
    gun.add(barrel);

    // Flash Hider Muzzle Brake
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.015, 0.055, 8), gunMetalMat);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0.005, 0.60);
    gun.add(muzzle);

    // 5. Curved 30-Round Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.17, 0.085), polymerMat);
    mag.position.set(0, -0.11, 0.08);
    mag.rotation.x = -0.18;
    gun.add(mag);

    // 6. Ergonomic Pistol Grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.13, 0.065), polymerMat);
    grip.position.set(0, -0.09, -0.08);
    grip.rotation.x = 0.28;
    gun.add(grip);

    // 7. Tactical Stock (Buffer Tube & Buttstock)
    const stockTube = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 8), gunMetalMat);
    stockTube.rotation.x = Math.PI / 2;
    stockTube.position.set(0, 0.015, -0.24);
    gun.add(stockTube);

    const buttStock = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.14, 0.15), polymerMat);
    buttStock.position.set(0, -0.01, -0.34);
    gun.add(buttStock);

    // 8. Angled Foregrip for Left Hand
    const foregrip = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.08, 0.055), polymerMat);
    foregrip.position.set(0, -0.065, 0.30);
    foregrip.rotation.x = -0.22;
    gun.add(foregrip);

    // 9. Side Laser / Flashlight Module
    const laserModule = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.032, 0.08), polymerMat);
    laserModule.position.set(0.038, 0.015, 0.26);
    const laserLens = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), laserDotMat);
    laserLens.position.set(0.038, 0.015, 0.305);
    gun.add(laserModule);
    gun.add(laserLens);

    // 10. Muzzle Flash Particle Mesh
    const flashGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffdd44,
      transparent: true,
      opacity: 0.0
    });
    const muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    muzzleFlash.position.set(0, 0.005, 0.65);
    gun.add(muzzleFlash);
    gun.userData.muzzleFlash = muzzleFlash;

    // Laser Sight Beam
    const laserBeamGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 14, 4);
    laserBeamGeo.rotateX(Math.PI / 2);
    laserBeamGeo.translate(0, 0, 7);
    const laserBeamMat = new THREE.MeshBasicMaterial({
      color: 0xff0033,
      transparent: true,
      opacity: 0.45
    });
    const laserBeam = new THREE.Mesh(laserBeamGeo, laserBeamMat);
    laserBeam.position.set(0.038, 0.015, 0.31);
    laserBeam.visible = false;
    gun.add(laserBeam);
    gun.userData.laserBeam = laserBeam;

    return gun;
  }

  equipGun() {
    if (this.hasGun) return;
    this.hasGun = true;

    this.gunMesh = this._buildAssaultRifle();
    if (this.joints.rightHand) {
      this.joints.rightHand.add(this.gunMesh);
      // Align rifle with hand forward
      this.gunMesh.position.set(0, 0.02, 0.15);
      this.gunMesh.rotation.set(-Math.PI / 2, 0, 0);
    }
  }

  shoot() {
    if (!this.hasGun || !this.gunMesh) return;
    const flash = this.gunMesh.userData.muzzleFlash;
    if (flash) {
      flash.material.opacity = 1.0;
      flash.scale.set(1.8, 1.8, 2.4);
      setTimeout(() => {
        if (flash) {
          flash.material.opacity = 0.0;
          flash.scale.set(1, 1, 1);
        }
      }, 50);
    }
    this.recoilKick = 0.28;
  }

  update(delta, isMoving = false, isSprinting = false, isAiming = false) {
    this.animTime += delta;
    this.isAiming = isAiming && this.hasGun;
    const targetSpeed = isMoving ? (isSprinting ? 2.3 : 1.25) : 0;
    this.currentSpeed += (targetSpeed - this.currentSpeed) * Math.min(1.0, delta * 8);

    // Recoil recovery
    if (this.recoilKick > 0) {
      this.recoilKick = Math.max(0, this.recoilKick - delta * 2.2);
    }

    const j = this.joints;

    // Laser beam visibility during aim
    if (this.gunMesh && this.gunMesh.userData.laserBeam) {
      this.gunMesh.userData.laserBeam.visible = this.isAiming;
    }

    if (this.currentSpeed > 0.05) {
      // ─── Fluid Locomotion ───────────────────────────────────────────
      const gaitFrequency = isSprinting ? 12 : 7.5;
      this.stridePhase += delta * gaitFrequency;

      const strideAngle = Math.sin(this.stridePhase) * 0.68 * this.currentSpeed;
      const armStrideAngle = Math.sin(this.stridePhase) * 0.45 * this.currentSpeed;

      // Leg stride & knee articulation
      if (j.leftThigh && j.rightThigh) {
        j.leftThigh.rotation.x = strideAngle;
        j.rightThigh.rotation.x = -strideAngle;

        if (j.leftCalf && j.rightCalf) {
          j.leftCalf.rotation.x = Math.max(0, -strideAngle * 0.85);
          j.rightCalf.rotation.x = Math.max(0, strideAngle * 0.85);
        }
      }

      // Torso bounce & sprint lean
      if (j.pelvis) {
        j.pelvis.position.y = 0.98 + Math.abs(Math.sin(this.stridePhase)) * 0.06;
      }
      if (j.torso) {
        j.torso.rotation.x = isSprinting ? 0.22 : 0.08;
        j.torso.rotation.y = Math.sin(this.stridePhase * 0.5) * 0.06;
      }

      // Arms handling
      if (this.hasGun) {
        if (this.isAiming) {
          // Tactical Aiming Down Sights (ADS)
          if (j.rightShoulder) j.rightShoulder.rotation.set(1.15 - this.recoilKick, -0.22, 0);
          if (j.rightForearm)  j.rightForearm.rotation.set(-0.85, 0, 0);
          if (j.leftShoulder)  j.leftShoulder.rotation.set(1.05, 0.42, -0.15);
          if (j.leftForearm)   j.leftForearm.rotation.set(-1.15, 0.35, 0);
          if (j.head)          j.head.rotation.set(0.06, -0.10, 0);
        } else {
          // Patrol Low-Ready Weapon Carry
          if (j.rightShoulder) j.rightShoulder.rotation.set(0.55 + Math.sin(this.stridePhase * 0.5) * 0.06, -0.18, 0);
          if (j.rightForearm)  j.rightForearm.rotation.set(-0.90, 0, 0);
          if (j.leftShoulder)  j.leftShoulder.rotation.set(0.65, 0.38, -0.12);
          if (j.leftForearm)   j.leftForearm.rotation.set(-1.20, 0.28, 0);
        }
      } else {
        // Natural Unarmed Walk/Sprint Swing
        if (j.leftShoulder)  j.leftShoulder.rotation.set(-armStrideAngle, 0, 0);
        if (j.leftForearm)   j.leftForearm.rotation.set(-0.25 - Math.abs(armStrideAngle * 0.3), 0, 0);
        if (j.rightShoulder) j.rightShoulder.rotation.set(armStrideAngle, 0, 0);
        if (j.rightForearm)  j.rightForearm.rotation.set(-0.25 - Math.abs(armStrideAngle * 0.3), 0, 0);
      }
    } else {
      // ─── Idle Stance with Organic Breathing ─────────────────────────
      const breath = Math.sin(this.animTime * 2.2);

      if (j.pelvis) {
        j.pelvis.position.y += (0.98 - j.pelvis.position.y) * delta * 8;
      }
      if (j.torso) {
        j.torso.rotation.x += (0.04 - j.torso.rotation.x) * delta * 8;
        j.torso.rotation.y += (0 - j.torso.rotation.y) * delta * 8;
      }
      if (j.chest) {
        j.chest.scale.set(1 + breath * 0.015, 1 + breath * 0.02, 1 + breath * 0.02);
      }
      if (j.head) {
        if (this.isAiming) {
          j.head.rotation.set(0.06, -0.10, 0);
        } else {
          j.head.rotation.set(0, Math.sin(this.animTime * 0.8) * 0.06, 0);
        }
      }

      // Rest legs
      if (j.leftThigh && j.rightThigh) {
        j.leftThigh.rotation.x += (0 - j.leftThigh.rotation.x) * delta * 8;
        j.rightThigh.rotation.x += (0 - j.rightThigh.rotation.x) * delta * 8;
      }
      if (j.leftCalf && j.rightCalf) {
        j.leftCalf.rotation.x += (0 - j.leftCalf.rotation.x) * delta * 8;
        j.rightCalf.rotation.x += (0 - j.rightCalf.rotation.x) * delta * 8;
      }

      if (this.hasGun) {
        if (this.isAiming) {
          // Stationary ADS Stance
          if (j.rightShoulder) j.rightShoulder.rotation.set(1.15 - this.recoilKick, -0.22, 0);
          if (j.rightForearm)  j.rightForearm.rotation.set(-0.85, 0, 0);
          if (j.leftShoulder)  j.leftShoulder.rotation.set(1.05, 0.42, -0.15);
          if (j.leftForearm)   j.leftForearm.rotation.set(-1.15, 0.35, 0);
        } else {
          // Stationary Low-Ready Stance
          if (j.rightShoulder) j.rightShoulder.rotation.set(0.48, -0.18, 0);
          if (j.rightForearm)  j.rightForearm.rotation.set(-0.92, 0, 0);
          if (j.leftShoulder)  j.leftShoulder.rotation.set(0.58, 0.38, -0.12);
          if (j.leftForearm)   j.leftForearm.rotation.set(-1.22, 0.28, 0);
        }
      } else {
        // Natural Relaxed Idle
        if (j.leftShoulder)  j.leftShoulder.rotation.set(0.08, 0, 0.06);
        if (j.leftForearm)   j.leftForearm.rotation.set(-0.15, 0, 0);
        if (j.rightShoulder) j.rightShoulder.rotation.set(0.08, 0, -0.06);
        if (j.rightForearm)  j.rightForearm.rotation.set(-0.15, 0, 0);
      }
    }
  }

  lookAtDirection(dirX, dirZ, delta) {
    if (Math.abs(dirX) < 0.01 && Math.abs(dirZ) < 0.01) return;
    const targetAngle = Math.atan2(dirX, dirZ);
    let diff = targetAngle - this.root.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.root.rotation.y += diff * Math.min(1.0, delta * 14);
  }
}

export const CharacterSprite = CharacterModel;
export const GMN_CHARACTERS = CHAR_ACCENTS.map((color, i) => ({
  id: String(i),
  name: CHAR_NAMES[i],
  color,
  branch: CHAR_BRANCHES[i]
}));
