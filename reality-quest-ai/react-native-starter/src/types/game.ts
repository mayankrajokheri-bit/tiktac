/**
 * Reality Quest AI - Domain Interfaces & Types
 */

export type ItemCategory = 
  | 'weapon' 
  | 'equipment' 
  | 'resource' 
  | 'consumable' 
  | 'companion' 
  | 'artifact';

export type ItemRarity = 
  | 'common' 
  | 'rare' 
  | 'epic' 
  | 'legendary' 
  | 'mythic';

export interface GameItem {
  id: string;
  name: string;
  originalObject: string;
  category: ItemCategory;
  rarity: ItemRarity;
  icon: string;
  amount: number;
  description: string;
  lore: string;
  stats: Record<string, string>;
  timestamp: number;
}

export interface Quest {
  id: string;
  title: string;
  targetObject: string;
  objective: string;
  type: 'scan' | 'gps' | 'craft';
  currentProgress: number;
  requiredProgress: number;
  completed: boolean;
  claimed: boolean;
  rewardXP: number;
  rewardCoins: number;
  rewardItem?: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Mythic';
  region: string;
  icon: string;
  weatherModifier?: string;
}

export interface PlayerStats {
  perception: number;
  intellect: number;
  vitality: number;
  resonance: number;
}

export interface PlayerProfile {
  uid: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  diamonds: number;
  energy: number;
  maxEnergy: number;
  title: string;
  streakDays: number;
  totalScans: number;
  questsCompleted: number;
  stats: PlayerStats;
}

export interface RegionSector {
  id: string;
  name: string;
  requiredLevel: number;
  unlocked: boolean;
  description: string;
  ambientBonus: string;
  themeColor: string;
}

export interface ARMapNode {
  id: string;
  name: string;
  type: 'resource' | 'terminal' | 'vitality' | 'anomaly' | 'companion';
  icon: string;
  targetHint: string;
  latitude: number;
  longitude: number;
  lore: string;
  rewardDesc: string;
}

export interface CraftingRecipe {
  id: string;
  resultName: string;
  rarity: ItemRarity;
  icon: string;
  description: string;
  requiredIngredients: {
    name: string;
    count: number;
    icon: string;
  }[];
  stats: Record<string, string>;
}
