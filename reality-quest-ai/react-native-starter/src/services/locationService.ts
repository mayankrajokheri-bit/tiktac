/**
 * Reality Quest AI - Location & AR Spawning Service
 */

import * as Location from 'expo-location';
import { ARMapNode } from '../types/game';

export class LocationService {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      // Fallback default coordinates
      return { latitude: 37.7749, longitude: -122.4194 };
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    };
  }

  /**
   * Generates procedural AR nodes around the player within a 150m-400m radius
   */
  generateNearbyNodes(centerLat: number, centerLng: number): ARMapNode[] {
    const templates = [
      {
        id: 'node-tree',
        name: 'Sylvan Ley-Tree',
        type: 'resource' as const,
        icon: '🌲',
        targetHint: 'tree',
        lore: 'High-density photosynthetic resonance detected in nearby flora.',
        rewardDesc: '+250 XP & Magical Wood'
      },
      {
        id: 'node-cyber',
        name: 'Quantum Data Relay',
        type: 'terminal' as const,
        icon: '💻',
        targetHint: 'laptop',
        lore: 'An active cyber terminal leaking encrypted code fragments into the air.',
        rewardDesc: '+400 XP & Cyber Weapon'
      },
      {
        id: 'node-potion',
        name: 'Starlight Spring Node',
        type: 'vitality' as const,
        icon: '💧',
        targetHint: 'bottle',
        lore: 'Purification field active. Scan a water bottle to brew an instant potion.',
        rewardDesc: '+180 XP & Health Potion'
      },
      {
        id: 'node-shield',
        name: 'Bastion Anomaly',
        type: 'anomaly' as const,
        icon: '🛡️',
        targetHint: 'chair',
        lore: 'Kinetic anomaly detected. Scan structural seating to form a shield.',
        rewardDesc: '+320 XP & Bastion Shield'
      }
    ];

    return templates.map((t, idx) => {
      const angle = (idx * (Math.PI * 2 / templates.length)) + 0.2;
      const offset = 0.0015; // roughly 160 meters
      return {
        ...t,
        latitude: centerLat + (Math.sin(angle) * offset),
        longitude: centerLng + (Math.cos(angle) * offset * 1.2)
      };
    });
  }
}

export const locationService = new LocationService();
