/**
 * Reality Quest AI - Quest Screen (React Native)
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { Quest } from '../types/game';

export default function QuestScreen({ navigation }: any) {
  const { quests, claimQuest, setActiveTargetHint } = useGameStore();

  const renderQuestItem = ({ item }: { item: Quest }) => {
    return (
      <View style={[styles.card, item.completed && styles.completedCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{item.icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.metaRow}>
              <Text style={styles.difficulty}>{item.difficulty}</Text>
              <Text style={styles.region}>{item.region}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        </View>

        <Text style={styles.objective}>{item.objective}</Text>

        <View style={styles.rewardRow}>
          <Text style={styles.rewardPill}>+{item.rewardXP} XP</Text>
          <Text style={styles.rewardPill}>+{item.rewardCoins} 🪙</Text>
        </View>

        <View style={styles.actionRow}>
          {item.claimed ? (
            <Text style={styles.claimedText}>Claimed ✓</Text>
          ) : item.completed ? (
            <TouchableOpacity 
              style={styles.claimBtn}
              onPress={() => claimQuest(item.id)}
            >
              <Text style={styles.claimBtnText}>Claim Reward</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.scanBtn}
              onPress={() => {
                setActiveTargetHint(item.targetObject);
                navigation.navigate('Scan', { targetHint: item.targetObject });
              }}
            >
              <Text style={styles.scanBtnText}>Scan Target</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Neural Quests</Text>
        <Text style={styles.headerSub}>Missions procedural generated from your surroundings.</Text>
      </View>

      <FlatList
        data={quests}
        keyExtractor={item => item.id}
        renderItem={renderQuestItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060911'
  },
  header: {
    padding: 16,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomWidth: 1
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900'
  },
  headerSub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 80
  },
  card: {
    backgroundColor: '#0b1120',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14
  },
  completedCard: {
    borderColor: '#00ff9d',
    backgroundColor: 'rgba(0, 255, 157, 0.05)'
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  icon: {
    fontSize: 24
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2
  },
  difficulty: {
    color: '#00f0ff',
    fontSize: 9,
    fontWeight: '800'
  },
  region: {
    color: '#64748b',
    fontSize: 9
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800'
  },
  objective: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12
  },
  rewardPill: {
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    color: '#ffb703',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  actionRow: {
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    paddingTop: 8,
    alignItems: 'flex-end'
  },
  scanBtn: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: '#00f0ff',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8
  },
  scanBtnText: {
    color: '#00f0ff',
    fontSize: 12,
    fontWeight: '800'
  },
  claimBtn: {
    backgroundColor: '#00ff9d',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8
  },
  claimBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800'
  },
  claimedText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700'
  }
});
