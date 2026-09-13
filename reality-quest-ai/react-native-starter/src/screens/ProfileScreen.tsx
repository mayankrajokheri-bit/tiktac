/**
 * Reality Quest AI - Profile Screen (React Native)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/useGameStore';

export default function ProfileScreen() {
  const { player, regions } = useGameStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 32 }}>⚡</Text>
          </View>
          <View>
            <Text style={styles.name}>{player.name}</Text>
            <Text style={styles.title}>{player.title}</Text>
            <Text style={styles.levelTag}>LEVEL {player.level}</Text>
          </View>
        </View>

        {/* Stats Matrix */}
        <Text style={styles.sectionTitle}>PERCEPTION MATRIX</Text>
        <View style={styles.statsCard}>
          <StatRow label="Perception (Scan Range & Luck)" value={player.stats.perception} color="#00f0ff" />
          <StatRow label="Intellect (Cyber Damage)" value={player.stats.intellect} color="#b026ff" />
          <StatRow label="Vitality (Defense & Max Energy)" value={player.stats.vitality} color="#00ff9d" />
          <StatRow label="Resonance (Nature Harmony)" value={player.stats.resonance} color="#ffb703" />
        </View>

        {/* Unlocked Regions */}
        <Text style={styles.sectionTitle}>REGIONAL SECTORS</Text>
        <View style={styles.regionsList}>
          {regions.map(reg => (
            <View key={reg.id} style={[styles.regionCard, reg.unlocked && styles.unlockedCard]}>
              <Text style={styles.regionIcon}>{reg.unlocked ? '🔓' : '🔒'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.regionStatus}>
                  {reg.unlocked ? 'UNLOCKED' : `REQUIRES LEVEL ${reg.requiredLevel}`}
                </Text>
                <Text style={styles.regionName}>{reg.name}</Text>
                <Text style={styles.regionDesc}>{reg.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statLabelWrap}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statVal, { color }]}>{value}</Text>
      </View>
      <View style={styles.statTrack}>
        <View style={[styles.statFill, { width: `${Math.min(100, value)}%`, backgroundColor: color }]} />
      </View>
    </View>
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
  profileCard: {
    backgroundColor: '#0b1120',
    borderColor: 'rgba(0, 240, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0f172a',
    borderColor: '#00f0ff',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900'
  },
  title: {
    color: '#94a3b8',
    fontSize: 12,
    marginVertical: 2
  },
  levelTag: {
    color: '#00f0ff',
    fontSize: 10,
    fontWeight: '800'
  },
  sectionTitle: {
    color: '#00f0ff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  statsCard: {
    backgroundColor: '#0b1120',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 20
  },
  statRow: {
    gap: 4
  },
  statLabelWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11
  },
  statVal: {
    fontSize: 11,
    fontWeight: '800'
  },
  statTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  statFill: {
    height: '100%'
  },
  regionsList: {
    gap: 10
  },
  regionCard: {
    backgroundColor: '#0b1120',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    opacity: 0.5
  },
  unlockedCard: {
    opacity: 1,
    borderColor: 'rgba(0, 255, 157, 0.3)',
    borderLeftColor: '#00ff9d',
    borderLeftWidth: 3
  },
  regionIcon: {
    fontSize: 20
  },
  regionStatus: {
    color: '#00f0ff',
    fontSize: 9,
    fontWeight: '800'
  },
  regionName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 2
  },
  regionDesc: {
    color: '#94a3b8',
    fontSize: 11
  }
});
