/**
 * Reality Quest AI - Home Screen (React Native)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/useGameStore';

export default function HomeScreen({ navigation }: any) {
  const { player, inventory, quests } = useGameStore();
  const activeQuest = quests.find(q => !q.completed);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header HUD */}
        <View style={styles.headerHUD}>
          <View style={styles.playerBadge}>
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 18 }}>⚡</Text>
            </View>
            <View>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerLevel}>Level {player.level} • {player.title}</Text>
            </View>
          </View>

          <View style={styles.resourceGroup}>
            <View style={styles.resourcePill}>
              <Text style={styles.resText}>⚡ {player.energy}/100</Text>
            </View>
            <View style={styles.resourcePill}>
              <Text style={styles.resText}>🪙 {player.coins}</Text>
            </View>
          </View>
        </View>

        {/* Hero AR Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.themeBadge}>🌐 REAL WORLD × AI × GAMING</Text>
          <Text style={styles.heroTitle}>TURN REALITY INTO A QUEST</Text>
          <Text style={styles.heroSub}>
            Scan real-world objects to convert them into magical resources, cyber weapons, and shields.
          </Text>

          <TouchableOpacity
            style={styles.heroCTA}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.heroCTAText}>📷 LAUNCH AR SCANNER</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🔍</Text>
            <Text style={styles.metricVal}>{player.totalScans}</Text>
            <Text style={styles.metricLabel}>Scans</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🎯</Text>
            <Text style={styles.metricVal}>{player.questsCompleted}</Text>
            <Text style={styles.metricLabel}>Cleared</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🎒</Text>
            <Text style={styles.metricVal}>{inventory.length}</Text>
            <Text style={styles.metricLabel}>Items</Text>
          </View>
        </View>

        {/* Active Quest Preview */}
        <Text style={styles.sectionHeading}>⚡ PRIORITY MISSION</Text>
        {activeQuest ? (
          <TouchableOpacity 
            style={styles.questCard}
            onPress={() => navigation.navigate('Quests')}
          >
            <Text style={styles.questIcon}>{activeQuest.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.questTag}>{activeQuest.difficulty.toUpperCase()} • {activeQuest.region}</Text>
              <Text style={styles.questTitle}>{activeQuest.title}</Text>
              <Text style={styles.questDesc}>{activeQuest.objective}</Text>
            </View>
            <Text style={styles.arrowIcon}>➔</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.questCard}>
            <Text style={styles.questTitle}>No Active Quests</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060911'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80
  },
  headerHUD: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  playerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderColor: '#00f0ff',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  playerName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800'
  },
  playerLevel: {
    color: '#00f0ff',
    fontSize: 11,
    fontWeight: '600'
  },
  resourceGroup: {
    flexDirection: 'row',
    gap: 8
  },
  resourcePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12
  },
  resText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  heroBanner: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: 'rgba(0, 240, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18
  },
  themeBadge: {
    color: '#00f0ff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6
  },
  heroSub: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16
  },
  heroCTA: {
    backgroundColor: '#00f0ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  heroCTAText: {
    color: '#040814',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0b1120',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },
  metricIcon: {
    fontSize: 18,
    marginBottom: 4
  },
  metricVal: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800'
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 10,
    textTransform: 'uppercase'
  },
  sectionHeading: {
    color: '#00f0ff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  questCard: {
    backgroundColor: '#0b1120',
    borderColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  questIcon: {
    fontSize: 24
  },
  questTag: {
    color: '#00f0ff',
    fontSize: 9,
    fontWeight: '800'
  },
  questTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 2
  },
  questDesc: {
    color: '#94a3b8',
    fontSize: 11
  },
  arrowIcon: {
    color: '#00f0ff',
    fontSize: 16
  }
});
