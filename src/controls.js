import * as THREE from 'three';
import { horrorAudio } from './audio.js';

/**
 * AAA-Grade 3rd-Person / 1st-Person Player Controller
 * Features:
 * - Fluid Inertia & Momentum Physics (Acceleration & Friction Damping)
 * - Spring-Arm Smooth Orbit Camera with Collision Clearance
 * - Dynamic Sprint FOV & Camera Sway
 * - Natural Angular Turn Smoothing
 * - Jump / Ground Physics
 * - Volumetric Flashlight Aim Tracking
 */

export class HorrorControls {
  constructor(camera, scene, domElement, playerModel) {
    this.camera = camera;
    this.scene = scene; // HorrorScene instance
    this.domElement = domElement;
    this.playerModel = playerModel; // CharacterModel instance

    this.isLocked = false;
    this.viewMode = '3rd'; // '3rd' or '1st'

    // Speeds & Acceleration Constants
    this.walkSpeed = 3.6;
    this.sprintSpeed = 6.4;
    this.acceleration = 24.0;
    this.friction = 14.0;

    // Movement velocity & input state
    this.velocity = new THREE.Vector3();
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.gravity = 22.0;
    this.jumpForce = 6.2;

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false
    };

    // Camera angles & spring-arm parameters
    this.yaw = 0;
    this.pitch = 0.18;
    this.targetYaw = 0;
    this.targetPitch = 0.18;
    this.cameraDistance = 3.2;
    this.cameraHeight = 1.85;

    // Smooth Camera Follow Position
    this.currentCamPos = new THREE.Vector3(0, 2.0, 12.0);

    // Head bob & FOV animation
    this.walkBobTimer = 0;
    this.targetFOV = 70;

    // Player character world position
    this.position = this.playerModel.root.position;
    this.position.set(0, 0, 9.2); // Start position outside gate

    // Raycasting for interactables
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 4.0;
    this.currentInteractable = null;

    // Flashlight
    this.flashlightOn = true;

    // Audio step timer
    this.stepAudioTimer = 0;
    this.onInteract = null;

    this.setupEventListeners();
    this.updateCamera(0.016);
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.isLocked) return;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = true;
          break;
        case 'Space':
          if (this.isGrounded) {
            this.verticalVelocity = this.jumpForce;
            this.isGrounded = false;
          }
          break;
        case 'KeyF':
          this.toggleFlashlight();
          break;
        case 'KeyE':
          this.triggerInteraction();
          break;
        case 'KeyV':
          this.toggleViewMode();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = false;
          break;
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.isLocked) return;
      if (e.button === 2) {
        // Right Click Aim
        e.preventDefault();
        this.isAiming = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isAiming = false;
      }
    });

    window.addEventListener('contextmenu', (e) => {
      if (this.isLocked) e.preventDefault();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      const sensitivity = this.isAiming ? 0.0014 : 0.0022;
      this.targetYaw -= movementX * sensitivity;
      this.targetPitch -= movementY * sensitivity;

      // Vertical pitch clamp (-30 deg to +50 deg)
      this.targetPitch = Math.max(-0.45, Math.min(0.75, this.targetPitch));
    });

    this.domElement.addEventListener('click', (e) => {
      if (e.button === 0) {
        if (!this.isLocked) {
          this.domElement.requestPointerLock();
        } else {
          if (this.currentInteractable) {
            this.triggerInteraction();
          } else if (this.playerModel?.hasGun) {
            this.playerModel.shoot();
            horrorAudio.playGunShot();
          }
        }
      }
    });
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === '3rd' ? '1st' : '3rd';
    const tag = document.getElementById('camera-mode-chip');
    if (tag) {
      tag.textContent = `🎥 [V] Camera: ${this.viewMode.toUpperCase()} PERSON`;
    }
  }

  toggleFlashlight() {
    this.flashlightOn = !this.flashlightOn;
    horrorAudio.playFlashlightClick();

    const stateSpan = document.getElementById('flashlight-state');
    if (stateSpan) {
      stateSpan.textContent = this.flashlightOn ? 'ON' : 'OFF';
      stateSpan.style.color = this.flashlightOn ? '#2ed573' : '#e74c3c';
    }
  }

  triggerInteraction() {
    if (this.currentInteractable && this.onInteract) {
      this.onInteract(this.currentInteractable.userData);
    }
  }

  update(delta) {
    if (!this.isLocked) return;

    // Smooth Camera Angles Interpolation
    this.yaw += (this.targetYaw - this.yaw) * Math.min(1.0, delta * 18);
    this.pitch += (this.targetPitch - this.pitch) * Math.min(1.0, delta * 18);

    // Calculate Movement Intention relative to Camera Yaw
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    const inputDir = new THREE.Vector3();
    if (this.keys.forward) inputDir.add(forward);
    if (this.keys.backward) inputDir.sub(forward);
    if (this.keys.right) inputDir.add(right);
    if (this.keys.left) inputDir.sub(right);

    const isInputActive = inputDir.lengthSq() > 0.001;
    const maxSpeed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;

    // Momentum & Inertia Acceleration / Friction
    if (isInputActive) {
      inputDir.normalize();
      const targetVel = inputDir.clone().multiplyScalar(maxSpeed);
      this.velocity.lerp(targetVel, Math.min(1.0, delta * this.acceleration));

      // Smooth character facing direction
      this.playerModel.lookAtDirection(this.velocity.x, this.velocity.z, delta);

      // Footstep cadence
      this.stepAudioTimer += delta * (this.keys.sprint ? 1.8 : 1.2);
      if (this.stepAudioTimer > 0.45) {
        horrorAudio.playFootstep();
        this.stepAudioTimer = 0;
      }

      this.walkBobTimer += delta * (this.keys.sprint ? 14 : 9);
    } else {
      // Apply smooth ground friction
      this.velocity.lerp(new THREE.Vector3(0, 0, 0), Math.min(1.0, delta * this.friction));
      this.walkBobTimer = 0;
    }

    // Apply Vertical Gravity & Jump
    if (!this.isGrounded) {
      this.verticalVelocity -= this.gravity * delta;
      this.position.y += this.verticalVelocity * delta;

      if (this.position.y <= 0) {
        this.position.y = 0;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    }

    // Translate Character Position
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;

    // World Boundary Collisions
    this.position.x = Math.max(-8.2, Math.min(8.2, this.position.x));
    this.position.z = Math.min(13.0, this.position.z);

    // Gate collision: if closed, cannot pass through z < 0.65
    if (!this.scene.isGateOpen) {
      if (this.position.x > -2.8 && this.position.x < 2.8) {
        this.position.z = Math.max(0.65, this.position.z);
      }
    } else {
      // Allow deep exploration through covered corridor and open moonlit courtyard down to z = -48.0
      this.position.z = Math.max(-48.0, this.position.z);
    }

    // Corridor and Courtyard lateral bounds
    if (this.position.z < 0.2 && this.position.z >= -20.0) {
      this.position.x = Math.max(-3.5, Math.min(3.5, this.position.x));
    } else if (this.position.z < -20.0) {
      // Wider bounds in open moonlit courtyard
      this.position.x = Math.max(-4.2, Math.min(4.2, this.position.x));
    }

    // Update Character 3D Locomotion Animation
    const speedMagnitude = this.velocity.length();
    const isMoving = speedMagnitude > 0.15;
    const isSprinting = isMoving && this.keys.sprint;
    this.playerModel.update(delta, isMoving, isSprinting, this.isAiming);

    // Dynamic Sprint / Aim FOV
    const desiredFOV = this.isAiming ? 50 : (isSprinting ? 77 : 70);
    this.targetFOV += (desiredFOV - this.targetFOV) * delta * 8;
    if (Math.abs(this.camera.fov - this.targetFOV) > 0.1) {
      this.camera.fov = this.targetFOV;
      this.camera.updateProjectionMatrix();
    }

    // Update Smooth Camera
    this.updateCamera(delta);

    // Update Flashlight & Volumetric Beam
    const cameraAimDir = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();
    this.scene.updateFlashlight(this.position, cameraAimDir, this.flashlightOn);

    // Raycast for interactables
    this.updateRaycasting();

    // Proximity horror checks
    this.updateProximityEffects();
  }

  updateCamera(delta) {
    const bobOffset = this.walkBobTimer > 0 ? Math.sin(this.walkBobTimer) * 0.035 : 0;

    if (this.viewMode === '3rd') {
      const curDist = this.isAiming ? 1.75 : this.cameraDistance;
      const curHeight = this.isAiming ? 1.62 : this.cameraHeight;

      // 3rd Person Spring-Arm Orbit Camera
      const offsetX = Math.sin(this.yaw) * Math.cos(this.pitch) * curDist;
      const offsetZ = Math.cos(this.yaw) * Math.cos(this.pitch) * curDist;
      const offsetY = Math.sin(this.pitch) * curDist + curHeight + bobOffset;

      // Shoulder offset when aiming
      const rightVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      const shoulderX = this.isAiming ? rightVec.x * 0.38 : 0;
      const shoulderZ = this.isAiming ? rightVec.z * 0.38 : 0;

      const targetCamPos = new THREE.Vector3(
        this.position.x + offsetX + shoulderX,
        this.position.y + offsetY,
        this.position.z + offsetZ + shoulderZ
      );

      // Spring-arm smooth interpolation
      this.currentCamPos.lerp(targetCamPos, Math.min(1.0, (delta || 0.016) * (this.isAiming ? 18 : 14)));
      this.camera.position.copy(this.currentCamPos);

      // Focus target
      const lookTarget = new THREE.Vector3(
        this.position.x + shoulderX * 0.6,
        this.position.y + 1.45,
        this.position.z + shoulderZ * 0.6
      );
      this.camera.lookAt(lookTarget);

      this.playerModel.root.visible = true;
    } else {
      // 1st Person Camera at eye level
      this.camera.position.set(
        this.position.x,
        this.position.y + 1.68 + bobOffset,
        this.position.z
      );

      const lookTarget = this.camera.position.clone().add(
        new THREE.Vector3(
          -Math.sin(this.yaw) * Math.cos(this.pitch),
          Math.sin(this.pitch),
          -Math.cos(this.yaw) * Math.cos(this.pitch)
        )
      );
      this.camera.lookAt(lookTarget);

      // Hide player body in 1st person
      this.playerModel.root.visible = false;
    }
  }

  updateRaycasting() {
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    this.raycaster.far = 7.5;
    const intersects = this.raycaster.intersectObjects(this.scene.interactables, true);

    const crosshair = document.getElementById('crosshair');
    const promptBox = document.getElementById('prompt-box');
    const promptText = document.getElementById('prompt-text');

    let hitInteractable = null;

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData?.type && obj.parent && obj !== this.scene.scene) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.type) {
        hitInteractable = obj;
      }
    }

    // Proximity fallback: if player is within 3.2m of an interactable object
    if (!hitInteractable && this.scene.interactables) {
      let closestDist = 3.2;
      for (const item of this.scene.interactables) {
        if (!item.userData?.type) continue;
        const itemWorldPos = new THREE.Vector3();
        item.getWorldPosition(itemWorldPos);
        const d = this.position.distanceTo(itemWorldPos);
        if (d < closestDist) {
          closestDist = d;
          hitInteractable = item;
        }
      }
    }

    if (hitInteractable) {
      this.currentInteractable = hitInteractable;
      if (crosshair) crosshair.classList.add('crosshair-active');
      if (promptBox && promptText) {
        promptBox.classList.remove('hidden');
        promptText.textContent = hitInteractable.userData.prompt || 'Interact';
      }
    } else {
      this.currentInteractable = null;
      if (crosshair) crosshair.classList.remove('crosshair-active');
      if (promptBox) promptBox.classList.add('hidden');
    }
  }

  updateProximityEffects() {
    // 1. Peeking Tree Ghost Proximity (Z = -7.0)
    const ghostPos = new THREE.Vector3(-3.7, 1.75, -7.0);
    const distToGhost = this.position.distanceTo(ghostPos);

    // 2. White Dress Apparition Proximity (Z = -25.5)
    const appPos = new THREE.Vector3(0, 1.5, -25.5);
    const distToApparition = this.position.distanceTo(appPos);

    const minDist = Math.min(distToGhost, distToApparition);

    const dangerChip = document.getElementById('danger-chip');
    const dangerText = document.getElementById('danger-text');

    if (minDist < 6.5) {
      const dangerNorm = 1.0 - (minDist / 6.5);
      horrorAudio.setDangerLevel(dangerNorm);
      if (dangerChip) dangerChip.classList.remove('hidden');
      if (dangerText) {
        if (distToGhost < 4.0) {
          dangerText.textContent = 'DANGER: SOMETHING IS WATCHING FROM THE TREES';
        } else if (distToApparition < 6.0) {
          dangerText.textContent = 'DANGER: THE WHITE SHROUD APPARITION DRAWS NEAR';
        } else {
          dangerText.textContent = 'DANGER: IT SEES YOU';
        }
      }
    } else {
      horrorAudio.setDangerLevel(0);
      if (dangerChip) dangerChip.classList.add('hidden');
    }

    // Stopped clock ticking proximity
    const clockPos = new THREE.Vector3(2.9, 1.9, 0.55);
    const distToClock = this.position.distanceTo(clockPos);
    if (distToClock < 4.5) {
      const clockVol = Math.max(0, 1.0 - distToClock / 4.5);
      if (Math.random() < 0.05) {
        horrorAudio.playClockTick(clockVol);
      }
    }
  }
}
