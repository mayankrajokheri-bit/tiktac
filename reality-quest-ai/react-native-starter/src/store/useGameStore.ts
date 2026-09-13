/**
 * Reality Quest AI - Zustand State Store
 */

import { create } from 'zustand';
import { PlayerProfile, GameItem, Quest, RegionSector } from '../types/game';

interface GameState {
  player: PlayerProfile;
  inventory: GameItem[];
  quests: Quest[];
  regions: RegionSector[];
  activeTargetHint: string | null;

  // Actions
  addXP: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  useEnergy: (amount: number) => boolean;
  addItem: (item: Partial<GameItem>) => void;
  claimQuest: (questId: string) => void;
  setActiveTargetHint: (hint: string | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: {
    uid: 'agent_echo_01',
    name: 'Agent Echo',
    avatar: '⚡',
    level: 3,
    xp: 450,
    xpToNext: 1000,
    coins: 820,
    diamonds: 45,
    energy: 85,
    maxEnergy: 100,
    title: 'Cyber Wayfinder',
    streakDays: 4,
    totalScans: 12,
    questsCompleted: 7,
    stats: {
      perception: 74,
      intellect: 68,
      vitality: 82,
      resonance: 65
    }
  },

  inventory: [
    {
      id: 'inv-1',
      name: 'Magical Sylvan Wood',
      originalObject: 'Tree',
      category: 'resource',
      rarity: 'rare',
      icon: '🌲',
      amount: 4,
      description: 'Luminescent hardwood infused with AR photosynthesis.',
      lore: 'Synthesized from an urban living oak in the physical realm.',
      stats: { defense: '+12', resonance: '+15' },
      timestamp: Date.now()
    },
    {
      id: 'inv-2',
      name: 'Starlight Vitality Potion',
      originalObject: 'Water Bottle',
      category: 'consumable',
      rarity: 'common',
      icon: '🧪',
      amount: 6,
      description: 'Restores 60 Energy instantly.',
      lore: 'Transmuted pure H2O filtered through quantum refraction.',
      stats: { heal: '+60 Energy' },
      timestamp: Date.now()
    },
    {
      id: 'inv-3',
      name: 'Quantum Cyber Blade',
      originalObject: 'Laptop',
      category: 'weapon',
      rarity: 'epic',
      icon: '⚔️',
      amount: 1,
      description: 'High-frequency cyber blade tuned to disrupt rogue AR entities.',
      lore: 'Extracted from silicon logic gates and active processor cycles.',
      stats: { attack: '+58', critRate: '+14%' },
      timestamp: Date.now()
    }
  ],

  quests: [
    {
      id: 'qst-1',
      title: 'Bio-Synthesis Protocol',
      targetObject: 'Tree or Plant',
      objective: 'Scan 1 living tree or houseplant to extract Magical Wood.',
      type: 'scan',
      currentProgress: 1,
      requiredProgress: 1,
      completed: true,
      claimed: false,
      rewardXP: 250,
      rewardCoins: 150,
      difficulty: 'Normal',
      region: 'Sector 01: Genesis Block',
      icon: '🌿'
    },
    {
      id: 'qst-2',
      title: 'Grid Circuit Overclock',
      targetObject: 'Laptop or Screen',
      objective: 'Scan 1 computing device to siphon Cyber Power Cores.',
      type: 'scan',
      currentProgress: 0,
      requiredProgress: 1,
      completed: false,
      claimed: false,
      rewardXP: 400,
      rewardCoins: 280,
      difficulty: 'Hard',
      region: 'Sector 02: Neon District',
      icon: '💻'
    }
  ],

  regions: [
    {
      id: 'genesis_block',
      name: 'Sector 01: Genesis Block',
      requiredLevel: 1,
      unlocked: true,
      description: 'Urban residential grid where physical matter first syncs with the AR matrix.',
      ambientBonus: '+10% Sylvan Resource drop rate',
      themeColor: '#00f0ff'
    },
    {
      id: 'neon_district',
      name: 'Sector 02: Neon District',
      requiredLevel: 3,
      unlocked: true,
      description: 'High-density tech corridors teeming with cyber weapon anomalies and drone relics.',
      ambientBonus: '+15% Tech Weapon synthesis damage',
      themeColor: '#ff0055'
    }
  ],

  activeTargetHint: null,

  addXP: (amount: number) => {
    const { player } = get();
    let newXP = player.xp + amount;
    let newLevel = player.level;
    let newXPToNext = player.xpToNext;
    let leveledUp = false;

    if (newXP >= newXPToNext) {
      newXP -= newXPToNext;
      newLevel += 1;
      newXPToNext = Math.floor(newXPToNext * 1.45);
      leveledUp = true;
    }

    set({
      player: {
        ...player,
        xp: newXP,
        level: newLevel,
        xpToNext: newXPToNext
      }
    });

    return leveledUp;
  },

  addCoins: (amount: number) => {
    set(state => ({
      player: {
        ...state.player,
        coins: state.player.coins + amount
      }
    }));
  },

  useEnergy: (amount: number) => {
    const { player } = get();
    if (player.energy < amount) return false;
    set({
      player: {
        ...player,
        energy: player.energy - amount
      }
    });
    return true;
  },

  addItem: (itemData: Partial<GameItem>) => {
    set(state => {
      const newItem: GameItem = {
        id: `inv-${Date.now()}`,
        name: itemData.name || 'Unknown Relic',
        originalObject: itemData.originalObject || 'Real Object',
        category: itemData.category || 'resource',
        rarity: itemData.rarity || 'common',
        icon: itemData.icon || '📦',
        amount: itemData.amount || 1,
        description: itemData.description || 'Synthesized physical matter.',
        lore: itemData.lore || 'Transmuted through reality matrix.',
        stats: itemData.stats || {},
        timestamp: Date.now()
      };

      return {
        inventory: [newItem, ...state.inventory],
        player: {
          ...state.player,
          totalScans: state.player.totalScans + 1
        }
      };
    });
  },

  claimQuest: (questId: string) => {
    set(state => {
      const quest = state.quests.find(q => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return state;

      quest.claimed = true;
      get().addXP(quest.rewardXP);
      get().addCoins(quest.rewardCoins);

      return {
        quests: [...state.quests],
        player: {
          ...state.player,
          questsCompleted: state.player.questsCompleted + 1
        }
      };
    });
  },

  setActiveTargetHint: (hint: string | null) => {
    set({ activeTargetHint: hint });
  }
}));
