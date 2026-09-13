/**
 * Reality Quest AI - AROverlay Component (React Native)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AROverlayProps {
  targetHint?: string;
  isScanning?: boolean;
}

export const AROverlay: React.FC<AROverlayProps> = ({ targetHint, isScanning }) => {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.reticleBox}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        <View style={styles.crosshair} />
        
        {targetHint && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>TARGET LOCKED: {targetHint.toUpperCase()}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },
  reticleBox: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00f0ff'
  },
  tl: { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5 },
  tr: { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5 },
  br: { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5 },
  crosshair: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00f0ff'
  },
  lockBadge: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: 'rgba(0, 240, 255, 0.25)',
    borderColor: '#00f0ff',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  lockText: {
    color: '#00f0ff',
    fontSize: 9,
    fontWeight: '800'
  }
});
