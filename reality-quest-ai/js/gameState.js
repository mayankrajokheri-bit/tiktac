/**
 * Reality Quest AI - Game State Management & Persistence
 * Updated for Ambala Cantt Map & Aarav Character Profile
 */

const STORAGE_KEY = "REALITY_QUEST_AI_AMBALA_V2";

const DEFAULT_STATE = {
  player: {
    id: "Player_001",
    name: "Aarav",
    avatar: "assets/aarav-avatar.jpg",
    characterArt: "assets/aarav-character.jpg",
    title: "Explorer • Warrior • Dreamer",
    quote: "The world is not just to be seen but to be explored.",
    level: 3,
    xp: 120,
    xpToNext: 300,
    coins: 450,
    diamonds: 15,
    energy: 85,
    maxEnergy: 100,
    streakDays: 4,
    totalScans: 12,
    questsCompleted: 7,
    // Combat Attributes from Aarav Character Sheet
    combatStats: {
      hp: 150,
      maxHp: 150,
      atk: 45,
      def: 30,
      spd: 80
    },
    // Matrix Perception Stats
    stats: {
      perception: 74,
      intellect: 68,
      vitality: 82,
      resonance: 65
    },
    skills: [
      {
        id: "scan_vision",
        name: "Scan Vision",
        icon: "👁️",
        desc: "Detects and identifies real-world objects using your camera."
      },
      {
        id: "location_sense",
        name: "Location Sense",
        icon: "📍",
        desc: "Finds nearby quests, resources, and hidden areas."
      },
      {
        id: "ai_companion",
        name: "AI Companion",
        icon: "🤖",
        desc: "Your AI assistant gives hints, tips, and real-time support."
      },
      {
        id: "dynamic_combat",
        name: "Dynamic Combat",
        icon: "⚔️",
        desc: "Adapts to your play style and enemy strength."
      }
    ],
    equippedGear: [
      {
        id: "gear_sword",
        name: "Energy Sword",
        icon: "🗡️",
        type: "Weapon",
        rarity: "epic",
        bonus: "+45 ATK"
      },
      {
        id: "gear_backpack",
        name: "Explorer Backpack",
        icon: "🎒",
        type: "Storage Gear",
        rarity: "rare",
        bonus: "+15 Inventory Capacity"
      },
      {
        id: "gear_wristband",
        name: "AI Wristband",
        icon: "⌚",
        type: "Neural Device",
        rarity: "legendary",
        bonus: "+80 SPD & Auto-Scan"
      }
    ],
    story: "Aarav is a young explorer who loves adventure, technology and discovering new places. When the real world becomes a game, he uses his skills, AI companion and courage to complete quests, find hidden treasures and uncover the truth behind the Reality Quest."
  },
  currentCity: "Ambala Cantt",
  weather: {
    condition: "Clear Sky",
    temp: "32°C",
    icon: "☀️",
    bonus: "+15% Scan Discovery Yield"
  },
  regions: [
    {
      id: "ambala_cantt",
      name: "Sector: Ambala Cantt",
      requiredLevel: 1,
      unlocked: true,
      description: "Historic cantonment and bustling commercial hub. Cantt Market, Sadar Bazar, and Military Heritage.",
      ambientBonus: "+15% Sylvan & Tech Resource drop rate",
      themeColor: "#00f0ff"
    },
    {
      id: "defence_colony",
      name: "Sector: Defence Colony",
      requiredLevel: 3,
      unlocked: true,
      description: "Residential perimeter with active military radar towers and hidden resource caches.",
      ambientBonus: "+20% Defensive Shield efficiency",
      themeColor: "#00ff9d"
    },
    {
      id: "old_fort_hidden",
      name: "Hidden Zone: Old Fort",
      requiredLevel: 5,
      unlocked: false,
      description: "Ancient brick fortress claimed by shadow anomalies. Guarded by level 5 high-tier entities.",
      ambientBonus: "Unlocks Legendary Dual-Class Relics",
      themeColor: "#ff0055"
    },
    {
      id: "brahma_sarovar",
      name: "Sanctuary: Brahma Sarovar",
      requiredLevel: 8,
      unlocked: false,
      description: "Mythic holy waters where high-level celestial water familiars gather.",
      ambientBonus: "+40% Mythic Elixir potency",
      themeColor: "#b026ff"
    }
  ],
  inventory: [
    {
      id: "inv-001",
      name: "Magical Sylvan Wood",
      originalObject: "Tree (Rani Ka Bagh)",
      category: "resource",
      rarity: "rare",
      icon: "🌲",
      amount: 4,
      description: "Gleaming hardwood infused with AR photosynthesis ley-lines.",
      lore: "Harvested from an ancient tree in Rani Ka Bagh, Ambala Cantt.",
      stats: { defense: "+12", resonance: "+15" },
      timestamp: Date.now() - 3600000
    },
    {
      id: "inv-002",
      name: "Starlight Vitality Potion",
      originalObject: "Water Bottle (Beverage)",
      category: "consumable",
      rarity: "common",
      icon: "🧪",
      amount: 6,
      description: "Restores 60 Energy instantly and cures System Fatigue.",
      lore: "Transmuted pure H2O filtered through quantum refraction filters.",
      stats: { heal: "+60 Energy", buff: "+5% Speed" },
      timestamp: Date.now() - 7200000
    },
    {
      id: "inv-003",
      name: "Aegis Bastion Shield",
      originalObject: "Chair (Army Museum)",
      category: "equipment",
      rarity: "rare",
      icon: "🛡️",
      amount: 1,
      description: "Reinforced kinetic shield that deflects hostile reality anomalies.",
      lore: "Synthesized near the Army Museum in Ambala Cantt.",
      stats: { defense: "+35", durability: "100/100" },
      timestamp: Date.now() - 14400000
    },
    {
      id: "inv-004",
      name: "Energy Sword",
      originalObject: "Laptop / Cyber Terminal",
      category: "weapon",
      rarity: "epic",
      icon: "🗡️",
      amount: 1,
      description: "Aarav's signature energy blade tuned to disrupt rogue AR entities.",
      lore: "Infused with blue plasma photons and cybernetic edge alignment.",
      stats: { attack: "+45", critRate: "+18%" },
      timestamp: Date.now() - 28800000
    },
    {
      id: "inv-005",
      name: "Explorer Backpack",
      originalObject: "Tactical Backpack",
      category: "equipment",
      rarity: "rare",
      icon: "🎒",
      amount: 1,
      description: "Heavy-duty explorer bag equipped with spatial dimension compartments.",
      lore: "Carried by Aarav on every expedition across Ambala Cantt.",
      stats: { capacity: "+15 Slots", endurance: "+20" },
      timestamp: Date.now() - 43200000
    },
    {
      id: "inv-006",
      name: "AI Wristband",
      originalObject: "Smartwatch (Wearable Tech)",
      category: "artifact",
      rarity: "legendary",
      icon: "⌚",
      amount: 1,
      description: "Neural interface wristband linked to Aarav's AI Companion.",
      lore: "Emits real-time proximity pings for hidden quests and anomalies.",
      stats: { speed: "+80", autoScan: "Active" },
      timestamp: Date.now() - 86400000
    }
  ],
  quests: [
    {
      id: "qst-ambala-01",
      title: "Find the Red Signboard",
      targetObject: "Red Signboard or Street Sign",
      objective: "Find the Red Signboard near Cantt Market and scan it with your camera.",
      type: "scan",
      currentProgress: 0,
      requiredProgress: 1,
      completed: false,
      claimed: false,
      rewardXP: 100,
      rewardCoins: 120,
      rewardDiamonds: 5,
      difficulty: "Normal",
      region: "Ambala Cantt (Cantt Market)",
      icon: "🎯"
    },
    {
      id: "qst-ambala-02",
      title: "Defence Colony Patrol",
      targetObject: "Tree or Foliage",
      objective: "Scan 1 tree or natural plant around Defence Colony to harvest Sylvan Wood.",
      type: "scan",
      currentProgress: 1,
      requiredProgress: 1,
      completed: true,
      claimed: false,
      rewardXP: 150,
      rewardCoins: 100,
      rewardDiamonds: 3,
      difficulty: "Easy",
      region: "Ambala Cantt (Defence Colony)",
      icon: "🌲"
    },
    {
      id: "qst-ambala-03",
      title: "Railway Terminal Network",
      targetObject: "Laptop, Screen or Tech Device",
      objective: "Scan 1 computing screen near Railway Station to establish secure comms.",
      type: "scan",
      currentProgress: 0,
      requiredProgress: 1,
      completed: false,
      claimed: false,
      rewardXP: 250,
      rewardCoins: 200,
      rewardDiamonds: 8,
      difficulty: "Hard",
      region: "Ambala Cantt (Railway Station)",
      icon: "💻"
    },
    {
      id: "qst-ambala-04",
      title: "Old Fort Reconnaissance",
      targetObject: "Explore Location",
      objective: "Reach Level 5 to bypass the seal and scout the Old Fort Hidden Zone.",
      type: "gps",
      currentProgress: 3,
      requiredProgress: 5,
      completed: false,
      claimed: false,
      rewardXP: 500,
      rewardCoins: 400,
      rewardDiamonds: 20,
      difficulty: "Mythic",
      region: "Old Fort (Hidden Zone)",
      icon: "🏰"
    }
  ],
  craftingRecipes: [
    {
      id: "crf-01",
      resultName: "Chrono-Sylvan Hyperbow",
      rarity: "legendary",
      icon: "🏹",
      description: "Fires ionized arrows that freeze anomalies in real spacetime.",
      requiredIngredients: [
        { name: "Magical Sylvan Wood", count: 2, icon: "🌲" },
        { name: "Energy Sword", count: 1, icon: "🗡️" }
      ],
      stats: { attack: "+95", resonance: "+40" }
    },
    {
      id: "crf-02",
      resultName: "Omni-Aegis Fortress",
      rarity: "epic",
      icon: "🛡️",
      description: "Projects an impenetrable 360-degree kinetic forcefield.",
      requiredIngredients: [
        { name: "Aegis Bastion Shield", count: 1, icon: "🛡️" },
        { name: "Starlight Vitality Potion", count: 3, icon: "🧪" }
      ],
      stats: { defense: "+80", vitality: "+30" }
    }
  ],
  settings: {
    apiKey: "",
    soundEnabled: true,
    gpsSimulationMode: false,
    selectedLocationPreset: "ambala"
  }
};

class GameStateManager {
  constructor() {
    this.state = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          player: { ...DEFAULT_STATE.player, ...(parsed.player || {}) },
          settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) }
        };
      }
    } catch (e) {
      console.warn("Could not load save state, using defaults:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error("Failed to save game state:", e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.state);
      } catch (err) {
        console.error("State listener error:", err);
      }
    });
  }

  addXP(amount) {
    this.state.player.xp += amount;
    let leveledUp = false;

    while (this.state.player.xp >= this.state.player.xpToNext) {
      this.state.player.xp -= this.state.player.xpToNext;
      this.state.player.level += 1;
      this.state.player.xpToNext = Math.floor(this.state.player.xpToNext * 1.4);
      this.state.player.energy = this.state.player.maxEnergy;
      this.state.player.combatStats.hp += 20;
      this.state.player.combatStats.maxHp += 20;
      this.state.player.combatStats.atk += 6;
      this.state.player.combatStats.def += 5;
      this.state.player.combatStats.spd += 4;
      this.state.player.stats.perception += 3;
      this.state.player.stats.intellect += 3;
      this.state.player.stats.vitality += 4;
      this.state.player.stats.resonance += 3;
      leveledUp = true;
      this.checkRegionUnlocks();
    }

    this.save();
    return leveledUp;
  }

  checkRegionUnlocks() {
    let newUnlocks = [];
    this.state.regions.forEach(r => {
      if (!r.unlocked && this.state.player.level >= r.requiredLevel) {
        r.unlocked = true;
        newUnlocks.push(r.name);
      }
    });
    return newUnlocks;
  }

  addCoins(amount) {
    this.state.player.coins += amount;
    this.save();
  }

  addDiamonds(amount) {
    this.state.player.diamonds = (this.state.player.diamonds || 0) + amount;
    this.save();
  }

  useEnergy(amount = 10) {
    if (this.state.player.energy < amount) return false;
    this.state.player.energy -= amount;
    this.save();
    return true;
  }

  restoreEnergy(amount = 25) {
    this.state.player.energy = Math.min(this.state.player.maxEnergy, this.state.player.energy + amount);
    this.save();
  }

  addItem(itemData) {
    const existing = this.state.inventory.find(i => i.name === itemData.name && i.rarity === itemData.rarity);
    if (existing && itemData.category !== 'weapon' && itemData.category !== 'equipment') {
      existing.amount = (existing.amount || 1) + (itemData.amount || 1);
    } else {
      this.state.inventory.unshift({
        id: "inv-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        amount: 1,
        timestamp: Date.now(),
        ...itemData
      });
    }

    this.state.player.totalScans += 1;
    this.checkQuestsOnItemAdded(itemData);
    this.save();
  }

  checkQuestsOnItemAdded(itemData) {
    const objectLabel = (itemData.originalObject || "").toLowerCase();
    const itemName = (itemData.name || "").toLowerCase();

    this.state.quests.forEach(q => {
      if (!q.completed && q.type === 'scan') {
        const target = q.targetObject.toLowerCase();
        if (
          objectLabel.includes(target) ||
          itemName.includes(target) ||
          target.split(" or ").some(t => objectLabel.includes(t.trim()) || itemName.includes(t.trim()))
        ) {
          q.currentProgress += 1;
          if (q.currentProgress >= q.requiredProgress) {
            q.completed = true;
          }
        }
      }
    });
  }

  claimQuestReward(questId) {
    const quest = this.state.quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return null;

    quest.claimed = true;
    this.state.player.questsCompleted += 1;
    const leveledUp = this.addXP(quest.rewardXP);
    this.addCoins(quest.rewardCoins);
    if (quest.rewardDiamonds) {
      this.addDiamonds(quest.rewardDiamonds);
    }

    if (quest.rewardItem) {
      this.addItem({
        name: quest.rewardItem,
        originalObject: "Quest Bounty Reward",
        category: "reward",
        rarity: "rare",
        icon: "🎁",
        description: `Awarded for completing the mission: ${quest.title}`,
        stats: { questBonus: "+15%" }
      });
    }

    this.save();
    return { quest, leveledUp };
  }

  addQuest(questData) {
    this.state.quests.unshift({
      id: "qst-" + Date.now(),
      currentProgress: 0,
      requiredProgress: 1,
      completed: false,
      claimed: false,
      ...questData
    });
    this.save();
  }

  craftItem(recipeId) {
    const recipe = this.state.craftingRecipes.find(r => r.id === recipeId);
    if (!recipe) return { success: false, message: "Recipe not found" };

    for (const ing of recipe.requiredIngredients) {
      const invItem = this.state.inventory.find(i => i.name === ing.name);
      if (!invItem || (invItem.amount || 1) < ing.count) {
        return { success: false, message: `Missing ingredient: ${ing.name} (Need ${ing.count})` };
      }
    }

    for (const ing of recipe.requiredIngredients) {
      const invItem = this.state.inventory.find(i => i.name === ing.name);
      invItem.amount -= ing.count;
      if (invItem.amount <= 0) {
        this.state.inventory = this.state.inventory.filter(i => i.id !== invItem.id);
      }
    }

    const crafted = {
      name: recipe.resultName,
      originalObject: "Crafted Alchemical Relic",
      category: "equipment",
      rarity: recipe.rarity,
      icon: recipe.icon,
      amount: 1,
      description: recipe.description,
      lore: `Masterwork artifact forged by Aarav using physical matter from Ambala Cantt.`,
      stats: recipe.stats
    };

    this.addItem(crafted);
    const leveledUp = this.addXP(250);
    this.save();

    return { success: true, item: crafted, leveledUp };
  }

  setApiKey(key) {
    this.state.settings.apiKey = key ? key.trim() : "";
    this.save();
  }

  getApiKey() {
    return this.state.settings.apiKey;
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }
}

window.gameState = new GameStateManager();
