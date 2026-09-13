/**
 * Reality Quest AI - Main Controller & Application Orchestrator
 */

class AppController {
  constructor() {
    this.currentScreen = "home";
    this.cameraStream = null;
    this.isScanning = false;
    this.selectedTargetHint = null;
    this.activeInspectionItem = null;
  }

  init() {
    console.log("Initializing Reality Quest AI App Controller...");
    
    // Subscribe to state changes to update HUD globally
    window.gameState.subscribe(state => this.updateHUD(state));
    
    // Setup Navigation Tabs
    this.setupNavigation();

    // Setup Camera and Scanner UI
    this.setupScannerControls();

    // Setup Quest Screen
    this.setupQuestScreen();

    // Setup Inventory and Crafting Screen
    this.setupInventoryScreen();

    // Setup Profile Screen
    this.setupProfileScreen();

    // Setup Modals & Global controls
    this.setupModals();

    // Initial HUD update
    this.updateHUD(window.gameState.state);

    // Render initial views
    this.renderQuests();
    this.renderInventory();
    this.renderProfile();

    // Setup sound toggle
    const soundToggle = document.getElementById("sound-toggle-btn");
    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        const isMuted = window.soundEngine.toggleMute();
        soundToggle.textContent = isMuted ? "🔇" : "🔊";
        this.showToast(isMuted ? "Audio Muted" : "Cyber Audio Engaged", "info");
      });
    }

    // Phone Frame Toggle
    const frameToggle = document.getElementById("toggle-frame-mode-btn");
    if (frameToggle) {
      frameToggle.addEventListener("click", () => {
        document.body.classList.toggle("fullscreen-viewport-mode");
        const isFull = document.body.classList.contains("fullscreen-viewport-mode");
        frameToggle.textContent = isFull ? "📱 Phone Frame" : "🖥️ Fullscreen";
      });
    }

    // Quick start scan CTA on Home
    const heroScanBtn = document.getElementById("hero-quick-scan-btn");
    if (heroScanBtn) {
      heroScanBtn.addEventListener("click", () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.switchScreen("scan");
      });
    }

    // NPC Dialogue trigger on Home
    const npcBanner = document.getElementById("home-npc-banner");
    if (npcBanner) {
      npcBanner.addEventListener("click", () => {
        this.openNPCDialogue("aria");
      });
    }

    console.log("Reality Quest AI ready!");
  }

  /* ----------------------------------------------------
   * Screen Navigation
   * ---------------------------------------------------- */
  setupNavigation() {
    const navButtons = document.querySelectorAll(".nav-tab-btn");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.screen;
        if (target) {
          if (window.soundEngine) window.soundEngine.playClick();
          this.switchScreen(target);
        }
      });
    });
  }

  switchScreen(screenName) {
    if (this.currentScreen === screenName) return;

    // Handle Camera stream stop when leaving scan
    if (this.currentScreen === "scan" && screenName !== "scan") {
      this.stopCamera();
    }

    // Hide all screens
    document.querySelectorAll(".game-screen").forEach(scr => {
      scr.classList.remove("active");
    });

    // Show target screen
    const targetEl = document.getElementById(`screen-${screenName}`);
    if (targetEl) {
      targetEl.classList.add("active");
      this.currentScreen = screenName;
    }

    // Update nav active tab state
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.screen === screenName);
    });

    // Screen specific lifecycle hooks
    if (screenName === "map") {
      setTimeout(() => {
        window.mapEngine.init("game-map");
        window.mapEngine.recenter();
      }, 150);
    } else if (screenName === "scan") {
      this.startCamera();
      this.renderScannerPresets();
    } else if (screenName === "quests") {
      this.renderQuests();
    } else if (screenName === "inventory") {
      this.renderInventory();
    } else if (screenName === "profile") {
      this.renderProfile();
    }
  }

  /* ----------------------------------------------------
   * Global HUD Updates
   * ---------------------------------------------------- */
  updateHUD(state) {
    const { player } = state;

    // Level & XP
    const levelBadge = document.getElementById("hud-player-level");
    if (levelBadge) levelBadge.textContent = `Lv.${player.level}`;

    const xpBar = document.getElementById("hud-xp-fill");
    const xpLabel = document.getElementById("hud-xp-label");
    if (xpBar && xpLabel) {
      const pct = Math.min(100, Math.round((player.xp / player.xpToNext) * 100));
      xpBar.style.width = `${pct}%`;
      xpLabel.textContent = `${player.xp} / ${player.xpToNext} XP`;
    }

    // Currency
    const coinsEl = document.getElementById("hud-coins-val");
    if (coinsEl) coinsEl.textContent = player.coins.toLocaleString();

    const diamondsEl = document.getElementById("hud-diamonds-val");
    if (diamondsEl) diamondsEl.textContent = player.diamonds.toLocaleString();

    // Energy
    const energyFill = document.getElementById("hud-energy-fill");
    const energyLabel = document.getElementById("hud-energy-val");
    if (energyFill && energyLabel) {
      const pct = Math.round((player.energy / player.maxEnergy) * 100);
      energyFill.style.width = `${pct}%`;
      energyLabel.textContent = `${player.energy}/${player.maxEnergy}`;
    }

    // Home screen widgets
    const homePlayerTitle = document.getElementById("home-player-title");
    if (homePlayerTitle) homePlayerTitle.textContent = `${player.name} • ${player.title}`;

    const homeActiveQuestsCount = document.getElementById("home-active-quests-count");
    if (homeActiveQuestsCount) {
      const activeCount = state.quests.filter(q => !q.completed).length;
      homeActiveQuestsCount.textContent = `${activeCount} Active`;
    }

    const homeInventoryCount = document.getElementById("home-inventory-count");
    if (homeInventoryCount) {
      const totalItems = state.inventory.reduce((acc, cur) => acc + (cur.amount || 1), 0);
      homeInventoryCount.textContent = `${totalItems} Items`;
    }

    // Render active quest preview banner on Home
    this.renderHomeQuestBanner(state);
  }

  renderHomeQuestBanner(state) {
    const banner = document.getElementById("home-featured-quest");
    if (!banner) return;

    const uncompleted = state.quests.find(q => !q.completed);
    if (uncompleted) {
      banner.innerHTML = `
        <div class="featured-quest-card" data-quest-id="${uncompleted.id}">
          <div class="card-icon">${uncompleted.icon || "🎯"}</div>
          <div class="card-info">
            <div class="card-tag">ACTIVE OBJECTIVE</div>
            <h4 class="card-title">${uncompleted.title}</h4>
            <p class="card-desc">${uncompleted.objective}</p>
            <div class="card-meta">
              <span class="reward-tag">+${uncompleted.rewardXP} XP</span>
              <span class="reward-tag">+${uncompleted.rewardCoins} 🪙</span>
            </div>
          </div>
          <button class="action-arrow" id="home-quest-jump-btn">➔</button>
        </div>
      `;
      const jumpBtn = banner.querySelector("#home-quest-jump-btn");
      if (jumpBtn) {
        jumpBtn.onclick = () => this.switchScreen("quests");
      }
    } else {
      banner.innerHTML = `
        <div class="featured-quest-card empty-quest">
          <div class="card-icon">🏆</div>
          <div class="card-info">
            <div class="card-tag">ALL OBJECTIVES CLEARED</div>
            <h4 class="card-title">Matrix Calm</h4>
            <p class="card-desc">Generate a new AI Mission or scan surroundings to trigger anomalies!</p>
          </div>
          <button class="action-arrow" onclick="window.app.switchScreen('quests')">+</button>
        </div>
      `;
    }
  }

  /* ----------------------------------------------------
   * Camera & AR Scanner Controls
   * ---------------------------------------------------- */
  setupScannerControls() {
    const scanTriggerBtn = document.getElementById("camera-scan-trigger-btn");
    const cameraUploadInput = document.getElementById("camera-file-input");
    const uploadBtn = document.getElementById("camera-upload-trigger-btn");

    if (scanTriggerBtn) {
      scanTriggerBtn.addEventListener("click", () => {
        this.triggerRealScan();
      });
    }

    if (uploadBtn && cameraUploadInput) {
      uploadBtn.addEventListener("click", () => {
        cameraUploadInput.click();
      });

      cameraUploadInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target.result;
            this.processScannedImage(base64, file.name.split('.')[0]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  async startCamera() {
    const video = document.getElementById("camera-video-feed");
    const fallbackBox = document.getElementById("camera-permission-fallback");
    if (!video) return;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Use rear camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        this.cameraStream = stream;
        video.srcObject = stream;
        video.play();
        if (fallbackBox) fallbackBox.classList.add("hidden");
      } else {
        throw new Error("MediaDevices not supported");
      }
    } catch (err) {
      console.warn("Camera stream access unavailable or denied:", err);
      if (fallbackBox) fallbackBox.classList.remove("hidden");
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    const video = document.getElementById("camera-video-feed");
    if (video) video.srcObject = null;
  }

  selectTargetHint(hint, label = "") {
    this.selectedTargetHint = hint;
    const banner = document.getElementById("scanner-target-lock-badge");
    if (banner) {
      banner.textContent = `TARGET LOCKED: ${label.toUpperCase() || hint.toUpperCase()}`;
      banner.classList.remove("hidden");
    }
  }

  renderScannerPresets() {
    const listContainer = document.getElementById("scanner-presets-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    window.aiEngine.samplePresets.forEach(preset => {
      const card = document.createElement("button");
      card.className = "sample-preset-chip";
      card.innerHTML = `
        <img src="${preset.image}" alt="${preset.title}" class="preset-thumb" />
        <div class="preset-text">
          <span class="preset-title">${preset.title}</span>
          <span class="preset-sub">${preset.category}</span>
        </div>
      `;

      card.onclick = () => {
        if (window.soundEngine) window.soundEngine.playLockOn();
        this.selectTargetHint(preset.simulatedLabel, preset.title);
        // Instant simulated scan of this preset
        this.processScannedImage(preset.image, preset.simulatedLabel);
      };

      listContainer.appendChild(card);
    });
  }

  async triggerRealScan() {
    if (this.isScanning) return;

    // Check player energy
    if (window.gameState.state.player.energy < 10) {
      this.showToast("⚡ Insufficient Energy! Wait or drink an Elixir.", "error");
      if (window.soundEngine) window.soundEngine.playClick();
      return;
    }

    const video = document.getElementById("camera-video-feed");
    let imageBase64 = null;

    // If live video active, grab snapshot frame to canvas
    if (this.cameraStream && video && video.readyState >= 2) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      imageBase64 = canvas.toDataURL("image/jpeg", 0.85);
    } else {
      // Fallback: pick the selected target hint or a default sample
      const hint = this.selectedTargetHint || "tree";
      const preset = window.aiEngine.samplePresets.find(p => p.simulatedLabel === hint) || window.aiEngine.samplePresets[0];
      imageBase64 = preset.image;
    }

    this.processScannedImage(imageBase64, this.selectedTargetHint || "");
  }

  async processScannedImage(imageData, hint = "") {
    this.isScanning = true;
    window.gameState.useEnergy(10);

    // Audio SFX
    if (window.soundEngine) {
      window.soundEngine.playScanLaser();
      setTimeout(() => window.soundEngine.playSonar(), 400);
    }

    // Show Scanning HUD Overlay
    const overlay = document.getElementById("scanner-loading-overlay");
    const scanStatusText = document.getElementById("scanner-status-text");
    if (overlay) overlay.classList.remove("hidden");

    const steps = [
      "Aiming AR Quantum Reticle...",
      "Extracting Molecular Signatures...",
      "Consulting Gemini Vision AI...",
      "Transmuting Matter into Game Relic..."
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (scanStatusText && steps[stepIdx]) {
        scanStatusText.textContent = steps[stepIdx];
      }
    }, 450);

    try {
      const asset = await window.aiEngine.analyzeImage(imageData, hint);
      clearInterval(interval);

      // Add to inventory & grant XP
      window.gameState.addItem(asset);
      const leveledUp = window.gameState.addXP(asset.xp || 200);
      window.gameState.addCoins(asset.coins || 150);

      // Sound
      if (window.soundEngine) {
        window.soundEngine.playReveal(asset.rarity);
        if (leveledUp) setTimeout(() => window.soundEngine.playLevelUp(), 900);
      }

      // Hide loading overlay
      if (overlay) overlay.classList.add("hidden");

      // Show Item Reveal Modal
      this.showItemRevealModal(asset, leveledUp);

      // Reset target hint badge
      this.selectedTargetHint = null;
      const banner = document.getElementById("scanner-target-lock-badge");
      if (banner) banner.classList.add("hidden");

    } catch (err) {
      clearInterval(interval);
      console.error("Scan processing error:", err);
      if (overlay) overlay.classList.add("hidden");
      this.showToast("Analysis interrupted. Please retry scan.", "error");
    } finally {
      this.isScanning = false;
    }
  }

  showItemRevealModal(item, leveledUp = false) {
    const modal = document.getElementById("item-reveal-modal");
    if (!modal) return;

    // Populate data
    document.getElementById("reveal-rarity-tag").textContent = item.rarity.toUpperCase();
    document.getElementById("reveal-rarity-tag").className = `rarity-badge rarity-${item.rarity}`;
    document.getElementById("reveal-card").className = `hologram-card rarity-${item.rarity}`;

    document.getElementById("reveal-icon").textContent = item.icon || "✨";
    document.getElementById("reveal-name").textContent = item.name;
    document.getElementById("reveal-original").textContent = `Real-World: ${item.originalObject}`;
    document.getElementById("reveal-desc").textContent = item.description;
    document.getElementById("reveal-lore").textContent = item.lore;

    // Stats
    const statsContainer = document.getElementById("reveal-stats");
    statsContainer.innerHTML = "";
    if (item.stats) {
      Object.entries(item.stats).forEach(([key, val]) => {
        const statChip = document.createElement("div");
        statChip.className = "stat-chip";
        statChip.innerHTML = `<span class="stat-k">${key}</span> <span class="stat-v">${val}</span>`;
        statsContainer.appendChild(statChip);
      });
    }

    document.getElementById("reveal-xp-gain").textContent = `+${item.xp || 200} XP`;
    document.getElementById("reveal-coin-gain").textContent = `+${item.coins || 150} 🪙`;

    const levelAlert = document.getElementById("reveal-levelup-alert");
    if (levelAlert) {
      levelAlert.classList.toggle("hidden", !leveledUp);
    }

    modal.classList.remove("hidden");

    const claimBtn = document.getElementById("reveal-claim-btn");
    claimBtn.onclick = () => {
      if (window.soundEngine) window.soundEngine.playClick();
      modal.classList.add("hidden");
      this.showToast(`Saved ${item.name} to Inventory!`, "success");
    };
  }

  /* ----------------------------------------------------
   * Quests Screen
   * ---------------------------------------------------- */
  setupQuestScreen() {
    const generateBtn = document.getElementById("generate-ai-quest-btn");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => {
        if (window.soundEngine) window.soundEngine.playSonar();
        this.generateNewAIQuest();
      });
    }
  }

  async generateNewAIQuest() {
    const generateBtn = document.getElementById("generate-ai-quest-btn");
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = `<span>⏳ Synthesizing AI Mission...</span>`;
    }

    setTimeout(() => {
      const newQuest = window.aiEngine.generateDynamicQuest(
        { name: window.mapEngine.currentLocationName },
        window.mapEngine.currentWeather
      );

      window.gameState.addQuest(newQuest);
      this.renderQuests();
      this.showToast(`New Mission Generated: ${newQuest.title}`, "success");

      if (window.soundEngine) window.soundEngine.playLockOn();

      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `<span>✨ Generate AI Mission</span>`;
      }
    }, 800);
  }

  renderQuests() {
    const container = document.getElementById("quests-list-container");
    if (!container) return;

    const quests = window.gameState.state.quests;
    container.innerHTML = "";

    if (quests.length === 0) {
      container.innerHTML = `<div class="empty-state">No missions found. Click 'Generate AI Mission'!</div>`;
      return;
    }

    quests.forEach(quest => {
      const card = document.createElement("div");
      card.className = `quest-card ${quest.completed ? 'completed' : ''} ${quest.claimed ? 'claimed' : ''}`;

      const progressPct = Math.min(100, Math.round((quest.currentProgress / quest.requiredProgress) * 100));

      card.innerHTML = `
        <div class="quest-header">
          <div class="quest-icon">${quest.icon || "🎯"}</div>
          <div class="quest-title-wrap">
            <div class="quest-meta-tags">
              <span class="quest-difficulty diff-${quest.difficulty?.toLowerCase()}">${quest.difficulty || "Normal"}</span>
              <span class="quest-region">${quest.region || "Sector 01"}</span>
            </div>
            <h3 class="quest-title">${quest.title}</h3>
          </div>
        </div>

        <p class="quest-objective">${quest.objective}</p>

        <div class="quest-progress-bar-wrap">
          <div class="quest-progress-fill" style="width: ${progressPct}%"></div>
          <span class="quest-progress-text">${quest.currentProgress} / ${quest.requiredProgress}</span>
        </div>

        <div class="quest-footer">
          <div class="quest-rewards">
            <span class="reward-pill">+${quest.rewardXP} XP</span>
            <span class="reward-pill">+${quest.rewardCoins} 🪙</span>
            ${quest.rewardItem ? `<span class="reward-pill item-pill">🎁 ${quest.rewardItem}</span>` : ''}
          </div>

          <div class="quest-action">
            ${
              quest.claimed
                ? `<button class="quest-btn claimed-btn" disabled>Claimed ✓</button>`
                : quest.completed
                ? `<button class="quest-btn claim-reward-btn" data-id="${quest.id}">Claim Reward</button>`
                : `<button class="quest-btn scan-for-quest-btn" data-target="${quest.targetObject}">Scan Target</button>`
            }
          </div>
        </div>
      `;

      // Wire claim button
      const claimBtn = card.querySelector(".claim-reward-btn");
      if (claimBtn) {
        claimBtn.addEventListener("click", () => {
          const res = window.gameState.claimQuestReward(quest.id);
          if (res) {
            if (window.soundEngine) {
              window.soundEngine.playQuestComplete();
              if (res.leveledUp) setTimeout(() => window.soundEngine.playLevelUp(), 600);
            }
            this.showToast(`Claimed ${quest.rewardXP} XP & ${quest.rewardCoins} Coins!`, "success");
            this.renderQuests();
          }
        });
      }

      // Wire scan jump button
      const scanBtn = card.querySelector(".scan-for-quest-btn");
      if (scanBtn) {
        scanBtn.addEventListener("click", () => {
          this.switchScreen("scan");
          this.selectTargetHint(quest.targetObject, quest.targetObject);
        });
      }

      container.appendChild(card);
    });
  }

  /* ----------------------------------------------------
   * Inventory & Crafting Screen
   * ---------------------------------------------------- */
  setupInventoryScreen() {
    // Filter tabs (All, Weapon, Equipment, Resource, Consumable, Companion)
    const filterBtns = document.querySelectorAll(".inv-filter-btn");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.renderInventory(btn.dataset.category);
      });
    });

    // Crafting Bench tab toggle
    const toggleCraftBtn = document.getElementById("toggle-crafting-bench-btn");
    const invGridSection = document.getElementById("inventory-grid-section");
    const craftBenchSection = document.getElementById("crafting-bench-section");

    if (toggleCraftBtn && invGridSection && craftBenchSection) {
      toggleCraftBtn.addEventListener("click", () => {
        const isCrafting = craftBenchSection.classList.contains("hidden");
        if (isCrafting) {
          craftBenchSection.classList.remove("hidden");
          invGridSection.classList.add("hidden");
          toggleCraftBtn.textContent = "🎒 View Backpack";
          this.renderCraftingBench();
        } else {
          craftBenchSection.classList.add("hidden");
          invGridSection.classList.remove("hidden");
          toggleCraftBtn.textContent = "⚗️ Crafting Matrix";
          this.renderInventory();
        }
      });
    }
  }

  renderInventory(categoryFilter = "all") {
    const grid = document.getElementById("inventory-items-grid");
    if (!grid) return;

    const inventory = window.gameState.state.inventory;
    grid.innerHTML = "";

    const filtered = categoryFilter === "all" 
      ? inventory 
      : inventory.filter(i => i.category === categoryFilter);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-inv">No items in this category. Scan real world objects to harvest!</div>`;
      return;
    }

    filtered.forEach(item => {
      const tile = document.createElement("div");
      tile.className = `inv-item-card rarity-border-${item.rarity || 'common'}`;
      tile.innerHTML = `
        <div class="item-icon-wrap">
          <span class="item-emoji">${item.icon || "📦"}</span>
          ${item.amount > 1 ? `<span class="item-count-badge">x${item.amount}</span>` : ''}
        </div>
        <div class="item-meta">
          <span class="item-name">${item.name}</span>
          <span class="item-sub-rarity">${item.rarity.toUpperCase()}</span>
        </div>
      `;

      tile.onclick = () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.openItemInspectModal(item);
      };

      grid.appendChild(tile);
    });
  }

  renderCraftingBench() {
    const container = document.getElementById("crafting-recipes-container");
    if (!container) return;

    const recipes = window.gameState.state.craftingRecipes;
    const inventory = window.gameState.state.inventory;
    container.innerHTML = "";

    recipes.forEach(rec => {
      const card = document.createElement("div");
      card.className = `craft-recipe-card rarity-${rec.rarity}`;

      let canCraft = true;
      const ingredientsHtml = rec.requiredIngredients.map(ing => {
        const invItem = inventory.find(i => i.name === ing.name);
        const currentCount = invItem ? (invItem.amount || 1) : 0;
        const hasEnough = currentCount >= ing.count;
        if (!hasEnough) canCraft = false;

        return `
          <div class="ing-badge ${hasEnough ? 'has-enough' : 'missing'}">
            <span>${ing.icon} ${ing.name}</span>
            <span class="ing-ratio">${currentCount}/${ing.count}</span>
          </div>
        `;
      }).join("");

      card.innerHTML = `
        <div class="recipe-top">
          <div class="recipe-icon">${rec.icon}</div>
          <div class="recipe-info">
            <span class="rarity-badge rarity-${rec.rarity}">${rec.rarity.toUpperCase()}</span>
            <h3 class="recipe-title">${rec.resultName}</h3>
            <p class="recipe-desc">${rec.description}</p>
          </div>
        </div>

        <div class="recipe-ingredients">
          <div class="ing-label">REQUIRED PHYSICAL ESSENCES:</div>
          <div class="ing-list">${ingredientsHtml}</div>
        </div>

        <div class="recipe-action">
          <button class="craft-btn ${canCraft ? 'ready' : 'locked'}" ${canCraft ? '' : 'disabled'}>
            ${canCraft ? '⚡ Synthesize Masterwork Relic' : '🔒 Missing Ingredients'}
          </button>
        </div>
      `;

      const craftBtn = card.querySelector(".craft-btn");
      if (craftBtn && canCraft) {
        craftBtn.onclick = () => {
          const res = window.gameState.craftItem(rec.id);
          if (res.success) {
            if (window.soundEngine) {
              window.soundEngine.playReveal(rec.rarity);
              if (res.leveledUp) setTimeout(() => window.soundEngine.playLevelUp(), 700);
            }
            this.showToast(`Synthesized: ${res.item.name}!`, "success");
            this.renderCraftingBench();
          } else {
            this.showToast(res.message, "error");
          }
        };
      }

      container.appendChild(card);
    });
  }

  openItemInspectModal(item) {
    const modal = document.getElementById("item-inspect-modal");
    if (!modal) return;

    document.getElementById("inspect-icon").textContent = item.icon || "📦";
    document.getElementById("inspect-name").textContent = item.name;
    document.getElementById("inspect-rarity").textContent = item.rarity.toUpperCase();
    document.getElementById("inspect-rarity").className = `rarity-badge rarity-${item.rarity}`;
    document.getElementById("inspect-original").textContent = `Real-World Matter: ${item.originalObject}`;
    document.getElementById("inspect-desc").textContent = item.description;
    document.getElementById("inspect-lore").textContent = item.lore || "Synthesized reality matrix asset.";

    const statsBox = document.getElementById("inspect-stats");
    statsBox.innerHTML = "";
    if (item.stats) {
      Object.entries(item.stats).forEach(([k, v]) => {
        const row = document.createElement("div");
        row.className = "inspect-stat-row";
        row.innerHTML = `<span class="k">${k}</span><span class="v">${v}</span>`;
        statsBox.appendChild(row);
      });
    }

    // Equip / Use button
    const useBtn = document.getElementById("inspect-use-btn");
    if (item.category === "consumable") {
      useBtn.textContent = "🧪 Consume Potion (+60 Energy)";
      useBtn.onclick = () => {
        window.gameState.restoreEnergy(60);
        if (item.amount > 1) {
          item.amount--;
        } else {
          window.gameState.state.inventory = window.gameState.state.inventory.filter(i => i.id !== item.id);
        }
        window.gameState.save();
        if (window.soundEngine) window.soundEngine.playSonar();
        modal.classList.add("hidden");
        this.showToast("Energy Restored (+60)!", "success");
        this.renderInventory();
      };
    } else {
      useBtn.textContent = "⚔️ Equip to Loadout";
      useBtn.onclick = () => {
        if (window.soundEngine) window.soundEngine.playLockOn();
        modal.classList.add("hidden");
        this.showToast(`Equipped ${item.name} to active loadout!`, "success");
      };
    }

    modal.classList.remove("hidden");
  }

  /* ----------------------------------------------------
   * Player Profile & Region Progression Screen
   * ---------------------------------------------------- */
  setupProfileScreen() {
    const apiKeyBtn = document.getElementById("open-api-key-modal-btn");
    if (apiKeyBtn) {
      apiKeyBtn.addEventListener("click", () => {
        this.openApiKeyModal();
      });
    }

    const resetDataBtn = document.getElementById("reset-game-data-btn");
    if (resetDataBtn) {
      resetDataBtn.addEventListener("click", () => {
        if (confirm("Reset all game data and level back to genesis?")) {
          window.gameState.resetAll();
          location.reload();
        }
      });
    }
  }

  renderProfile() {
    const { player, regions } = window.gameState.state;

    // Profile header
    document.getElementById("profile-name").textContent = player.name;
    document.getElementById("profile-title").textContent = player.title;
    document.getElementById("profile-level-badge").textContent = `Level ${player.level}`;

    // Stats
    document.getElementById("stat-val-perception").textContent = player.stats.perception;
    document.getElementById("stat-bar-perception").style.width = `${Math.min(100, player.stats.perception)}%`;

    document.getElementById("stat-val-intellect").textContent = player.stats.intellect;
    document.getElementById("stat-bar-intellect").style.width = `${Math.min(100, player.stats.intellect)}%`;

    document.getElementById("stat-val-vitality").textContent = player.stats.vitality;
    document.getElementById("stat-bar-vitality").style.width = `${Math.min(100, player.stats.vitality)}%`;

    document.getElementById("stat-val-resonance").textContent = player.stats.resonance;
    document.getElementById("stat-bar-resonance").style.width = `${Math.min(100, player.stats.resonance)}%`;

    // Overview counters
    document.getElementById("profile-total-scans").textContent = player.totalScans;
    document.getElementById("profile-total-quests").textContent = player.questsCompleted;
    document.getElementById("profile-streak").textContent = `${player.streakDays} Days`;

    // Region Sectors
    const regionsContainer = document.getElementById("profile-regions-list");
    if (regionsContainer) {
      regionsContainer.innerHTML = "";
      regions.forEach(reg => {
        const item = document.createElement("div");
        item.className = `region-card ${reg.unlocked ? 'unlocked' : 'locked'}`;
        item.innerHTML = `
          <div class="region-top">
            <div class="region-status-icon">${reg.unlocked ? '🔓' : '🔒'}</div>
            <div class="region-details">
              <div class="region-req">${reg.unlocked ? 'UNLOCKED' : `REQUIRES LEVEL ${reg.requiredLevel}`}</div>
              <h4 class="region-name">${reg.name}</h4>
            </div>
          </div>
          <p class="region-desc">${reg.description}</p>
          <div class="region-bonus">${reg.ambientBonus}</div>
        `;
        regionsContainer.appendChild(item);
      });
    }
  }

  /* ----------------------------------------------------
   * Modals & NPC Dialogues
   * ---------------------------------------------------- */
  setupModals() {
    // Generic modal close button listeners
    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (window.soundEngine) window.soundEngine.playClick();
        const modal = btn.closest(".modal-backdrop");
        if (modal) modal.classList.add("hidden");
      });
    });

    // API Key modal save
    const saveKeyBtn = document.getElementById("save-api-key-btn");
    const keyInput = document.getElementById("gemini-api-key-input");
    if (saveKeyBtn && keyInput) {
      saveKeyBtn.addEventListener("click", () => {
        const key = keyInput.value.trim();
        window.gameState.setApiKey(key);
        this.showToast(key ? "Gemini 1.5 Vision API Key Configured!" : "Reverted to Simulated Vision Engine", "info");
        document.getElementById("api-key-modal").classList.add("hidden");
      });
    }

    // City Preset Selector on Map Screen
    const cityPresetSelect = document.getElementById("map-city-preset-select");
    if (cityPresetSelect) {
      cityPresetSelect.addEventListener("change", (e) => {
        window.mapEngine.teleportToPreset(e.target.value);
      });
    }

    const mapRecenterBtn = document.getElementById("map-recenter-btn");
    if (mapRecenterBtn) {
      mapRecenterBtn.addEventListener("click", () => {
        window.mapEngine.recenter();
      });
    }
  }

  openApiKeyModal() {
    const modal = document.getElementById("api-key-modal");
    const keyInput = document.getElementById("gemini-api-key-input");
    if (modal && keyInput) {
      keyInput.value = window.gameState.getApiKey();
      modal.classList.remove("hidden");
    }
  }

  openNPCDialogue(npcId = "aria") {
    const dialog = window.aiEngine.getNPCDialogue(npcId, window.gameState.state.player.level);
    const modal = document.getElementById("npc-dialogue-modal");
    if (!modal) return;

    document.getElementById("npc-avatar-emoji").textContent = dialog.avatar;
    document.getElementById("npc-speaker-name").textContent = dialog.speaker;
    document.getElementById("npc-dialogue-title").textContent = dialog.title;
    document.getElementById("npc-dialogue-body").textContent = dialog.text;

    if (window.soundEngine) window.soundEngine.playLockOn();
    modal.classList.remove("hidden");
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-notifications-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `cyber-toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-indicator"></span>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }
}

// Instantiate and initialize on DOMContentLoaded
window.app = new AppController();
document.addEventListener("DOMContentLoaded", () => {
  window.app.init();
});
