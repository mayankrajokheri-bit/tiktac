/**
 * Reality Quest AI - Inventory Screen (React Native)
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { GameItem } from '../types/game';

export default function InventoryScreen() {
  const { inventory } = useGameStore();

  const handleInspect = (item: GameItem) => {
    Alert.alert(
      `${item.name} (${item.rarity.toUpperCase()})`,
      `Original Matter: ${item.originalObject}\n\n${item.description}\n\n"${item.lore}"`,
      [{ text: "OK" }]
    );
  };

  const renderItem = ({ item }: { item: GameItem }) => {
    return (
      <TouchableOpacity 
        style={[styles.itemCard, { borderColor: getRarityColor(item.rarity) }]}
        onPress={() => handleInspect(item)}
      >
        <Text style={styles.itemIcon}>{item.icon}</Text>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemRarity}>{item.rarity.toUpperCase()}</Text>
        {item.amount > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>x{item.amount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎒 Quantum Bag</Text>
        <Text style={styles.headerSub}>Transmuted physical assets in your possession.</Text>
      </View>

      <FlatList
        data={inventory}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.gridContent}
      />
    </SafeAreaView>
  );
}

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'rare': return '#00f0ff';
    case 'epic': return '#b026ff';
    case 'legendary': return '#ffb703';
    case 'mythic': return '#ff0055';
    default: return '#94a3b8';
  }
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
  gridContent: {
    padding: 12,
    gap: 10,
    paddingBottom: 80
  },
  itemCard: {
    flex: 1 / 3,
    backgroundColor: '#0b1120',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    margin: 4,
    alignItems: 'center',
    position: 'relative'
  },
  itemIcon: {
    fontSize: 28,
    marginBottom: 6
  },
  itemName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    height: 28
  },
  itemRarity: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 4
  },
  countBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#000',
    borderColor: '#00f0ff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1
  },
  countText: {
    color: '#00f0ff',
    fontSize: 8,
    fontWeight: '800'
  }
});
