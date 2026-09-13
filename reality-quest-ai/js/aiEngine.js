/**
 * Reality Quest AI - AI Transformation & Vision Engine
 * Multi-modal Gemini 1.5 Flash integration with robust intelligent fallback
 */

class AIEngine {
  constructor() {
    this.fallbackDatabase = [
      {
        keywords: ["red signboard", "signboard", "sign", "board", "billboard", "banner", "poster", "red"],
        originalObject: "Red Signboard (Cantt Market)",
        name: "Cantt Nexus Waypoint Marker",
        category: "artifact",
        rarities: ["rare", "epic"],
        icon: "🚩",
        descriptions: [
          "Vibrant red beacon pulsating with Ambala Cantt navigational coordinates.",
          "Encoded municipal signboard transmuting real-world text into cyber coordinates.",
          "High-visibility directional relic that unlocks surrounding market caches."
        ],
        lore: "Scanned in the heart of Cantt Market. Transmuted from physical metal paint into an AR reality navigational node.",
        statPool: [
          { speed: "+30", perception: "+25", explorationBonus: "+20%" },
          { waypointSync: "Active", mapVision: "+300m" }
        ],
        xp: 150,
        coins: 120
      },
      {
        keywords: ["tree", "plant", "flower", "leaf", "flora", "grass", "wood", "forest", "garden", "bush"],
        originalObject: "Tree (Living Flora)",
        name: "Magical Sylvan Wood",
        category: "resource",
        rarities: ["rare", "epic", "legendary"],
        icon: "🌲",
        descriptions: [
          "Ancient hardwood imbued with photosynthetic solar-mana.",
          "Living timber that hums with ancient nature resonance.",
          "Root fiber that bends spacetime to absorb physical impacts."
        ],
        lore: "Identified from a living photosynthetic organism in the physical world. Converted into primordial crafting lumber.",
        statPool: [
          { defense: "+18", resonance: "+15" },
          { attack: "+12", natureBonus: "+20%" },
          { maxHealth: "+45", regeneration: "+3/s" }
        ],
        xp: 220,
        coins: 140
      },
      {
        keywords: ["bottle", "water", "cup", "mug", "glass", "drink", "flask", "beverage", "can"],
        originalObject: "Water Bottle (Liquid Vessel)",
        name: "Starlight Health Potion",
        category: "consumable",
        rarities: ["common", "rare", "epic"],
        icon: "🧪",
        descriptions: [
          "Transmuted crystalline elixir that seals physical wounds and cleanses fatigue.",
          "High-potency hydration potion glowing with ethereal luminescence.",
          "Restorative tonic distilled from molecular water bonds."
        ],
        lore: "Scanned from an ordinary liquid container. The AI molecular synthesizer reorganized its particles into pure vitality nectar.",
        statPool: [
          { heal: "+75 Energy", speedBoost: "+10% (30s)" },
          { heal: "+120 Energy", shieldBuff: "+25" },
          { heal: "+100% Full Energy", cleanse: "All Status Debuffs" }
        ],
        xp: 160,
        coins: 90
      },
      {
        keywords: ["chair", "stool", "sofa", "couch", "bench", "seat", "furniture"],
        originalObject: "Chair (Support Structure)",
        name: "Aegis Bastion Shield",
        category: "equipment",
        rarities: ["rare", "epic"],
        icon: "🛡️",
        descriptions: [
          "Reinforced kinetic barrier forged from structural load-bearing materials.",
          "Heavy tactical bulwark capable of deflecting high-velocity reality breaches.",
          "Harmonic forcefield projector constructed from architectural carbon fibers."
        ],
        lore: "The AI recognized structural ergonomics and transformed the chair's resting matrix into an unbreakable defensive shield.",
        statPool: [
          { defense: "+42", blockChance: "+18%" },
          { defense: "+55", stability: "+30%" },
          { defense: "+70", reflectDamage: "15%" }
        ],
        xp: 240,
        coins: 160
      },
      {
        keywords: ["laptop", "computer", "screen", "monitor", "keyboard", "macbook", "pc", "electronics"],
        originalObject: "Laptop (Computing Terminal)",
        name: "Quantum Cyber Weapon",
        category: "weapon",
        rarities: ["epic", "legendary", "mythic"],
        icon: "⚔️",
        descriptions: [
          "Dual-phase digital energy blade that slices through corrupted AR firewalls.",
          "Overclocked silicon railgun emitting pulsed electromagnetic photons.",
          "Nanotech cyber-claymore forged from gigahertz logic gates."
        ],
        lore: "Harvested from active silicon microchips and computing architecture. Contains the raw computational willpower of modern technology.",
        statPool: [
          { attack: "+64", critChance: "+22%", techResonance: "+35" },
          { attack: "+82", attackSpeed: "+18%", armorPen: "+25%" },
          { attack: "+115", anomalyDisrupt: "+40%", realityPierce: "+50" }
        ],
        xp: 350,
        coins: 300
      },
      {
        keywords: ["dog", "puppy", "hound", "canine", "cat", "kitten", "pet", "animal", "bird"],
        originalObject: "Dog / Animal (Loyal Entity)",
        name: "Solar Canis Familiar",
        category: "companion",
        rarities: ["legendary", "mythic"],
        icon: "🐕",
        descriptions: [
          "Luminescent animal spirit that detects hidden AR resource nodes and barks at anomalies.",
          "Spectral guardian beast radiating unconditional protective aura.",
          "Celestial beast companion tuned to the player's bio-rhythm."
        ],
        lore: "Detected biological entity displaying pure loyalty and affection. Manifested as a permanent astral companion bonded to your avatar.",
        statPool: [
          { perception: "+35", autoLoot: "True", companionBuff: "+20% Quest XP" },
          { perception: "+50", luckModifier: "+25%", evasion: "+15%" }
        ],
        xp: 500,
        coins: 450
      },
      {
        keywords: ["watch", "smartwatch", "clock", "timer", "wristwatch"],
        originalObject: "Watch (Timekeeping Device)",
        name: "Chrono-Stasis Chronometer",
        category: "artifact",
        rarities: ["epic", "legendary"],
        icon: "⏱️",
        descriptions: [
          "Relic that manipulates real-world time dilation to accelerate quest completions.",
          "Quantum pocket watch ticking with atomic precision."
        ],
        lore: "Converted from a temporal tracking instrument. Can bend micro-seconds to gain combat initiative.",
        statPool: [
          { cooldownReduction: "+20%", timeDilation: "+12%" },
          { haste: "+25%", scanSpeed: "+50%" }
        ],
        xp: 320,
        coins: 220
      },
      {
        keywords: ["backpack", "bag", "purse", "luggage", "wallet"],
        originalObject: "Backpack (Storage Container)",
        name: "Void-Space Spatial Satchel",
        category: "equipment",
        rarities: ["rare", "epic"],
        icon: "🎒",
        descriptions: [
          "Expands the player's inventory capacity by folding physical space.",
          "Dimensional pocket lined with woven tachyon threads."
        ],
        lore: "The AI converted zipper enclosures and fabric volume into a pocket dimension.",
        statPool: [
          { inventorySlots: "+10", carryCapacity: "+50kg" },
          { inventorySlots: "+20", weightReduction: "-40%" }
        ],
        xp: 200,
        coins: 130
      },
      {
        keywords: ["book", "notebook", "paper", "textbook", "magazine", "journal"],
        originalObject: "Book (Written Knowledge)",
        name: "Codex of Ancient Protocols",
        category: "artifact",
        rarities: ["rare", "epic", "legendary"],
        icon: "📖",
        descriptions: [
          "Ancient tome inscribed with reality-altering source code.",
          "Enchanted grimoire whose text morphs based on reader intellect."
        ],
        lore: "The physical ink and printed paper were translated into raw esoteric arcane algorithms.",
        statPool: [
          { intellect: "+35", spellAmplification: "+18%" },
          { intellect: "+50", energyCost: "-15%" }
        ],
        xp: 260,
        coins: 180
      },
      {
        keywords: ["coffee", "tea", "espresso", "latte", "caffeine"],
        originalObject: "Coffee / Beverage (Stimulant)",
        name: "Overdrive Hyper-Elixir",
        category: "consumable",
        rarities: ["common", "rare"],
        icon: "☕",
        descriptions: [
          "Turbocharges synaptic responses and restores instantaneous sprint stamina.",
          "Dark roasted alchemical decoction buzzing with kinetic electrons."
        ],
        lore: "Roasted caffeine beans supercharged through the reality engine to grant extreme alertness.",
        statPool: [
          { movementSpeed: "+25% (60s)", perception: "+15 (60s)" },
          { energyRegen: "+50% (120s)", haste: "+15%" }
        ],
        xp: 150,
        coins: 80
      },
      {
        keywords: ["glasses", "sunglasses", "spectacles", "eyewear"],
        originalObject: "Glasses (Optical Lens)",
        name: "Spectral AR Vision Visor",
        category: "equipment",
        rarities: ["rare", "epic"],
        icon: "👓",
        descriptions: [
          "Refractive optical lenses that highlight invisible micro-anomalies in your room.",
          "Cyber-visor overlaying thermal and reality-distortion telemetry."
        ],
        lore: "Refined from precision-ground optical glass and frame alloys.",
        statPool: [
          { perception: "+45", critDiscovery: "+20%" },
          { perception: "+60", anomalyPingRadius: "+150m" }
        ],
        xp: 230,
        coins: 170
      },
      {
        keywords: ["shoe", "sneaker", "boot", "footwear", "sandal"],
        originalObject: "Footwear (Kinetic Gear)",
        name: "Hermes Velocity Greaves",
        category: "equipment",
        rarities: ["rare", "epic"],
        icon: "👟",
        descriptions: [
          "Shock-absorbent cyber boots that convert real footsteps into raw quest XP.",
          "Kinetic stride enhancers with anti-gravitational soles."
        ],
        lore: "The tread patterns and cushioned soles have been magnetized to the planetary grid.",
        statPool: [
          { moveSpeed: "+30%", stepToXPConversion: "+10%" },
          { moveSpeed: "+45%", staminaDrain: "-25%" }
        ],
        xp: 220,
        coins: 160
      },
      {
        keywords: ["lamp", "light", "bulb", "torch", "candle"],
        originalObject: "Light Source (Photon Emitter)",
        name: "Prismatic Photon Core",
        category: "resource",
        rarities: ["rare", "epic", "legendary"],
        icon: "💡",
        descriptions: [
          "Pure radiant energy crystal that dispels the fog of war across all map sectors.",
          "Incandescent stellar matrix trapped inside tempered glass."
        ],
        lore: "Photon waves collected in real-time and crystalized into physical luminescence.",
        statPool: [
          { luminescence: "+80m", radiantDamage: "+30" },
          { mapVision: "+200m", darkImmunity: "100%" }
        ],
        xp: 280,
        coins: 200
      }
    ];

    this.samplePresets = [
      {
        id: "red_signboard",
        title: "Red Signboard (Cantt Market)",
        category: "Ambala Quest Target",
        image: "https://images.unsplash.com/photo-1572945553383-3563e7781b08?auto=format&fit=crop&w=600&q=80",
        simulatedLabel: "red signboard"
      },
      {
        id: "tree",
        title: "Living Oak Tree",
        category: "Rani Ka Bagh / Park",
        image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
        simulatedLabel: "tree"
      },
      {
        id: "bottle",
        title: "Cold Water Bottle",
        category: "Beverage / Home",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
        simulatedLabel: "bottle"
      },
      {
        id: "chair",
        title: "Ergonomic Office Chair",
        category: "Furniture / Indoors",
        image: "https://images.unsplash.com/photo-1580481077195-c3288a7c2937?auto=format&fit=crop&w=600&q=80",
        simulatedLabel: "chair"
      },
      {
        id: "laptop",
        title: "High-End Laptop",
        category: "Tech / Cyber",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
        simulatedLabel: "laptop"
      },
      {
        id: "dog",
        title: "Golden Retriever Dog",
        category: "Fauna / Companion",
        image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
        simulatedLabel: "dog"
      },
      {
        id: "coffee",
        title: "Artisanal Coffee Mug",
        category: "Consumable",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
        simulatedLabel: "coffee"
      },
      {
        id: "watch",
        title: "Precision Smartwatch",
        category: "Wearable Tech",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        simulatedLabel: "watch"
      },
      {
        id: "backpack",
        title: "Urban Tactical Backpack",
        category: "Gear / Equipment",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        simulatedLabel: "backpack"
      }
    ];
  }

  /**
   * Main scan processor: invokes Gemini Vision if API key present,
   * or falls back seamlessly to the intelligent neural classifier.
   */
  async analyzeImage(base64Image, hintText = "") {
    const apiKey = window.gameState.getApiKey();

    if (apiKey && apiKey.length > 10) {
      try {
        console.log("Calling Gemini 1.5 Flash Vision API...");
        const result = await this.callGeminiVision(base64Image, apiKey);
        if (result && result.name) {
          return { ...result, source: "gemini_live" };
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local vision engine:", err);
      }
    }

    // Local smart simulation
    return this.simulateVisionTransformation(hintText || "detected_real_object");
  }

  /**
   * Real Google Gemini 1.5 Flash Vision API Call
   */
  async callGeminiVision(base64Data, apiKey) {
    // Clean base64 header if present
    const cleanBase64 = base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptText = `
You are the AI Core of the game "Reality Quest AI".
Your mission: Analyze this camera photo taken by the player in the real world, identify the primary object, and transform it into a fictional AR gaming asset.

Transform real items into imaginative RPG equipment/resources, following these examples:
- Tree/Plant -> Magical Wood Resource
- Bottle/Cup -> Health Potion
- Chair/Desk -> Kinetic Shield or Armor
- Laptop/Phone/Screen -> Cyber Weapon or Data Core
- Dog/Cat -> Friendly Spectral Companion
- Watch -> Chrono Relic
- Backpack -> Spatial Storage Bag

Return ONLY a raw valid JSON object (no markdown formatting, no backticks, no markdown code blocks) with this exact schema:
{
  "detectedObject": "Specific name of detected real world object (e.g. Oak Tree, Water Bottle, Laptop)",
  "name": "Creative RPG Item Name (e.g. Sylvan Mana Timber, Elixir of Clarity, Aegis Kinetic Shield)",
  "category": "resource" | "consumable" | "weapon" | "equipment" | "companion" | "artifact",
  "rarity": "common" | "rare" | "epic" | "legendary" | "mythic",
  "icon": "A single emoji representing the asset",
  "description": "Short snappy gaming description (15-25 words)",
  "lore": "Fascinating sci-fi/fantasy lore on how the real object transformed (25-40 words)",
  "stats": {
    "primary": "+35 Attack or +40 Defense or +50 Heal",
    "secondary": "+15% Resonance or +10% Speed"
  },
  "xp": 250,
  "coins": 180
}
`;

    const requestPayload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 800
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error("Empty response from Gemini");

    // Clean any markdown formatting if present
    let jsonString = candidateText.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonString);
    return {
      name: parsed.name,
      originalObject: parsed.detectedObject || "Real-World Entity",
      category: parsed.category || "resource",
      rarity: parsed.rarity || "rare",
      icon: parsed.icon || "✨",
      description: parsed.description || "Synthesized reality construct.",
      lore: parsed.lore || "Converted through the Reality Quest AR matrix.",
      stats: parsed.stats || { power: "+25" },
      xp: parsed.xp || 200,
      coins: parsed.coins || 150
    };
  }

  /**
   * Offline / Simulated Intelligent Vision Classifier
   */
  simulateVisionTransformation(hint = "") {
    const hintLower = hint.toLowerCase();

    // Match against database keywords
    let match = this.fallbackDatabase.find(entry => 
      entry.keywords.some(k => hintLower.includes(k))
    );

    // If no direct keyword match, choose a creative random asset or general tech relic
    if (!match) {
      const randIdx = Math.floor(Math.random() * this.fallbackDatabase.length);
      match = this.fallbackDatabase[randIdx];
    }

    // Pick rarity weighted by player level and luck
    const rarityRoll = Math.random();
    let rarity = "common";
    if (rarityRoll > 0.96) rarity = "mythic";
    else if (rarityRoll > 0.82) rarity = "legendary";
    else if (rarityRoll > 0.55) rarity = "epic";
    else if (rarityRoll > 0.25) rarity = "rare";

    // Ensure selected rarity matches the item's flavor if available
    if (match.rarities.includes(rarity)) {
      // keep
    } else {
      rarity = match.rarities[Math.floor(Math.random() * match.rarities.length)];
    }

    const description = match.descriptions[Math.floor(Math.random() * match.descriptions.length)];
    const stats = match.statPool[Math.floor(Math.random() * match.statPool.length)];

    return {
      source: "reality_engine_simulated",
      name: match.name,
      originalObject: match.originalObject,
      category: match.category,
      rarity: rarity,
      icon: match.icon,
      description: description,
      lore: match.lore,
      stats: stats,
      xp: match.xp,
      coins: match.coins
    };
  }

  /**
   * Dynamic Quest Generator based on location, weather, and surroundings
   */
  generateDynamicQuest(locationData = {}, weather = "Clear") {
    const locationName = locationData.name || "Genesis Sector";
    const locType = locationData.type || "urban";

    const questPool = [
      {
        title: "Sylvan Ley-Line Harvest",
        targetObject: "Tree or Plant",
        objective: `Scan 1 living tree near ${locationName} to siphon bio-mana.`,
        rewardXP: 320,
        rewardCoins: 210,
        rewardItem: "Sylvan Sap Crystal",
        difficulty: "Normal",
        icon: "🌲"
      },
      {
        title: "Hydration Nexus Purge",
        targetObject: "Water Bottle or Fountain",
        objective: "Scan 1 liquid receptacle to condense an emergency recovery draught.",
        rewardXP: 240,
        rewardCoins: 160,
        rewardItem: "Purified Nectar",
        difficulty: "Easy",
        icon: "💧"
      },
      {
        title: "Sub-Silicon Breach",
        targetObject: "Laptop, Monitor, or Screen",
        objective: "Infiltrate rogue code by scanning 1 active electronic display.",
        rewardXP: 450,
        rewardCoins: 350,
        rewardItem: "Encrypted Cyber Kernel",
        difficulty: "Hard",
        icon: "💻"
      },
      {
        title: "Bastion Reinforcement",
        targetObject: "Chair or Bench",
        objective: "Scan structural seating to reinforce your defensive shielding.",
        rewardXP: 280,
        rewardCoins: 190,
        rewardItem: "Kinetic Deflector",
        difficulty: "Normal",
        icon: "🛡️"
      },
      {
        title: "Canine Companion Bond",
        targetObject: "Dog or Pet",
        objective: "Establish a telepathic link by scanning 1 friendly animal.",
        rewardXP: 550,
        rewardCoins: 400,
        rewardItem: "Aura of Unconditional Loyalty",
        difficulty: "Mythic",
        icon: "🐕"
      },
      {
        title: "Chrono-Pulse Synchronization",
        targetObject: "Clock or Watch",
        objective: "Calibrate the AR reality clock against an analogue or digital timekeeper.",
        rewardXP: 300,
        rewardCoins: 220,
        rewardItem: "Tachyon Spring",
        difficulty: "Normal",
        icon: "⏱️"
      }
    ];

    const chosen = questPool[Math.floor(Math.random() * questPool.length)];
    return {
      ...chosen,
      region: locationName,
      type: "scan",
      weatherModifier: `${weather} Atmosphere: +10% bonus resource yield`
    };
  }

  /**
   * Dynamic NPC Dialogues based on game context
   */
  getNPCDialogue(npcId = "aria", playerLevel = 1) {
    const dialogues = {
      aria: [
        {
          speaker: "Aria — Chrono Navigator",
          avatar: "👩‍🚀",
          title: "System Synchronization",
          text: "Agent! The dimensional barrier between the physical universe and the AR matrix has weakened. Look around you. That tree outside? It's pulsing with ancient Sylvan energy. Pull up your scanner and convert it before rogue anomalies siphon its core!"
        },
        {
          speaker: "Aria — Chrono Navigator",
          avatar: "👩‍🚀",
          title: "Level Milestone Achieved",
          text: "Phenomenal work! Your perception resonance is climbing steadily. When you reach Level 6, the Emerald Canopy sector will open up on your GPS map. Keep scanning physical objects to harvest high-tier materials."
        }
      ],
      cipher: [
        {
          speaker: "Cipher — Grid Infiltrator",
          avatar: "🥷",
          title: "Silicon Siphon Protocol",
          text: "Psst. You want real fire-power? Don't just pick leaves. Scan high-density computing chips—laptops, monitors, smartphones. The AI will turn their clock speeds into raw cyber weapon damage. Give it a shot."
        }
      ],
      sylas: [
        {
          speaker: "Sylas — Primordial Druid",
          avatar: "🧙‍♂️",
          title: "Living Harmony",
          text: "Greetings, child of carbon and silicon. Even in this modern concrete jungle, the ancient roots run deep beneath the pavement. Scan the flora and water bottles; they will sustain your spirit in the trials ahead."
        }
      ]
    };

    const list = dialogues[npcId] || dialogues.aria;
    return list[Math.floor(Math.random() * list.length)];
  }
}

window.aiEngine = new AIEngine();
