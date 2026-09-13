/**
 * Reality Quest AI - Google Gemini Vision Service
 * Multimodal AI integration for Object Classification and RPG Asset Transmutation
 */

import { GameItem, Quest } from '../types/game';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '') {
    this.apiKey = apiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * Analyzes an image captured by expo-camera (base64) and transforms it into a GameItem
   */
  async transformScannedObject(base64Image: string): Promise<Partial<GameItem>> {
    if (!this.apiKey) {
      console.warn("No Gemini API key supplied. Using fallback offline simulation.");
      return this.fallbackSimulation();
    }

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const systemPrompt = `
You are the AI core for the mobile game "Reality Quest AI".
Analyze this photo taken by the player in the physical world. Identify the main physical object and transmute it into a fictional AR game asset.

Follow the canonical examples:
- Tree/Plant -> Magical Wood Resource
- Bottle/Cup -> Health Potion
- Chair/Desk -> Kinetic Shield/Armor
- Laptop/Phone/Screen -> Cyber Weapon
- Dog/Animal -> Loyal Companion
- Watch -> Chrono Relic
- Backpack -> Spatial Storage Bag

Return ONLY a raw JSON object with this exact schema (no markdown, no backticks):
{
  "detectedObject": "Original real-world name",
  "name": "Creative RPG Item Name",
  "category": "resource" | "consumable" | "weapon" | "equipment" | "companion" | "artifact",
  "rarity": "common" | "rare" | "epic" | "legendary" | "mythic",
  "icon": "A single representative emoji",
  "description": "Snappy gaming description (15-25 words)",
  "lore": "Imaginative lore on how the physical object transmuted (25-40 words)",
  "stats": {
    "primary": "+35 Attack or +40 Defense or +50 Heal",
    "secondary": "+15% Resonance or +10% Speed"
  },
  "xp": 250,
  "coins": 180
}
`;

    try {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
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
            maxOutputTokens: 800
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        name: parsed.name,
        originalObject: parsed.detectedObject,
        category: parsed.category || 'resource',
        rarity: parsed.rarity || 'rare',
        icon: parsed.icon || '✨',
        description: parsed.description,
        lore: parsed.lore,
        stats: parsed.stats || {},
        amount: 1
      };
    } catch (error) {
      console.error("Gemini Vision failed:", error);
      return this.fallbackSimulation();
    }
  }

  /**
   * Procedurally generates a quest based on current location and weather
   */
  async generateLocationQuest(locationName: string, weather: string = "Clear"): Promise<Partial<Quest>> {
    const defaultQuests: Partial<Quest>[] = [
      {
        title: "Sylvan Ley-Harvest",
        targetObject: "Tree or Plant",
        objective: `Scan 1 tree near ${locationName} to harvest ancient sylvan timber.`,
        rewardXP: 300,
        rewardCoins: 200,
        rewardItem: "Sylvan Seedling",
        difficulty: "Normal",
        icon: "🌲"
      },
      {
        title: "Silicon Cyber Breach",
        targetObject: "Laptop or Screen",
        objective: "Scan 1 active computer screen to siphon encrypted data packets.",
        rewardXP: 450,
        rewardCoins: 320,
        rewardItem: "Cyber Core",
        difficulty: "Hard",
        icon: "💻"
      },
      {
        title: "Hydration of the Ancients",
        targetObject: "Water Bottle",
        objective: "Scan 1 water container to distill a high-potency restorative elixir.",
        rewardXP: 200,
        rewardCoins: 120,
        rewardItem: "Starlight Potion",
        difficulty: "Easy",
        icon: "💧"
      }
    ];

    return defaultQuests[Math.floor(Math.random() * defaultQuests.length)];
  }

  private fallbackSimulation(): Partial<GameItem> {
    return {
      name: "Quantum Cyber Blade",
      originalObject: "Laptop (Electronic Device)",
      category: "weapon",
      rarity: "epic",
      icon: "⚔️",
      amount: 1,
      description: "Dual-phase digital energy blade that slices through corrupted AR firewalls.",
      lore: "Synthesized from silicon logic gates and active processor cycles.",
      stats: { attack: "+64", critChance: "+18%" }
    };
  }
}

export const geminiService = new GeminiService();
