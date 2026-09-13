/**
 * Reality Quest AI - Camera Scan Screen (React Native with expo-camera)
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { geminiService } from '../services/geminiService';
import { useGameStore } from '../store/useGameStore';

export default function CameraScanScreen({ navigation, route }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<any>(null);
  const { addItem, addXP, addCoins, useEnergy } = useGameStore();

  const targetHint = route?.params?.targetHint;

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permText}>Camera access required to scan physical objects.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCaptureAndTransmute = async () => {
    if (scanning) return;

    const hasEnergy = useEnergy(10);
    if (!hasEnergy) {
      Alert.alert("Low Energy", "You need at least 10 Energy to run the AR scanner.");
      return;
    }

    setScanning(true);

    try {
      let base64 = "";
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
        base64 = photo.base64;
      }

      // Invoke Gemini Vision
      const item = await geminiService.transformScannedObject(base64);
      
      addItem(item);
      addXP(250);
      addCoins(180);

      Alert.alert(
        "✨ Object Transmuted!",
        `${item.originalObject} ➔ ${item.name} (${item.rarity?.toUpperCase()})\n\n${item.description}`,
        [{ text: "Save to Inventory", onPress: () => navigation.navigate('Bag') }]
      );
    } catch (err) {
      Alert.alert("Scan Error", "Failed to analyze object. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        {/* AR Reticle Overlay */}
        <View style={styles.arOverlay}>
          <View style={styles.scanGrid} />
          
          <View style={styles.targetingBox}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <Text style={styles.targetLabel}>
              {targetHint ? `LOCK ON: ${targetHint.toUpperCase()}` : 'POINT AT PHYSICAL OBJECT'}
            </Text>
          </View>

          {/* Shutter Button */}
          <View style={styles.bottomDock}>
            <TouchableOpacity 
              style={styles.shutterBtn} 
              onPress={handleCaptureAndTransmute}
              disabled={scanning}
            >
              {scanning ? (
                <ActivityIndicator color="#000" />
              ) : (
                <View style={styles.shutterCore}>
                  <Text style={{ fontSize: 24 }}>⚡</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#060911',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  permText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16
  },
  permBtn: {
    backgroundColor: '#00f0ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10
  },
  permBtnText: {
    color: '#000',
    fontWeight: '800'
  },
  arOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
    alignItems: 'center'
  },
  scanGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15
  },
  targetingBox: {
    width: 240,
    height: 240,
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#00f0ff'
  },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  targetLabel: {
    color: '#00f0ff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  bottomDock: {
    marginBottom: 20
  },
  shutterBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#00f0ff',
    backgroundColor: 'rgba(0, 240, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shutterCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
