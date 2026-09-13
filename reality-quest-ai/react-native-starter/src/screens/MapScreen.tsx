/**
 * Reality Quest AI - Map Screen (React Native with react-native-maps)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { locationService } from '../services/locationService';
import { ARMapNode } from '../types/game';

export default function MapScreen({ navigation }: any) {
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.009,
    longitudeDelta: 0.009
  });
  const [nodes, setNodes] = useState<ARMapNode[]>([]);

  useEffect(() => {
    (async () => {
      const coords = await locationService.getCurrentCoordinates();
      setRegion({
        ...coords,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008
      });
      const generated = locationService.generateNearbyNodes(coords.latitude, coords.longitude);
      setNodes(generated);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        customMapStyle={CYBERPUNK_MAP_STYLE}
        showsUserLocation={true}
      >
        {/* Perception Radar Radius */}
        <Circle
          center={{ latitude: region.latitude, longitude: region.longitude }}
          radius={200}
          strokeColor="#00f0ff"
          strokeWidth={1.5}
          fillColor="rgba(0, 240, 255, 0.08)"
        />

        {/* Dynamic AR Nodes */}
        {nodes.map(node => (
          <Marker
            key={node.id}
            coordinate={{ latitude: node.latitude, longitude: node.longitude }}
            onPress={() => {
              navigation.navigate('Scan', { targetHint: node.targetHint });
            }}
          >
            <View style={styles.nodeMarker}>
              <Text style={{ fontSize: 18 }}>{node.icon}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top HUD Card */}
      <View style={styles.topCard}>
        <Text style={styles.topTag}>SECTOR 01 • ACTIVE AR RADAR</Text>
        <Text style={styles.topHeading}>GPS Anomaly Grid</Text>
        <Text style={styles.topSub}>Tap any node on the map to jump directly into the camera scanner.</Text>
      </View>
    </View>
  );
}

const CYBERPUNK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#060911" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#00f0ff" }, { weight: 0.2 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#05162b" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060911'
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  topCard: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(9, 14, 24, 0.92)',
    borderColor: 'rgba(0, 240, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14
  },
  topTag: {
    color: '#00f0ff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  topHeading: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 2
  },
  topSub: {
    color: '#94a3b8',
    fontSize: 11
  },
  nodeMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0b1120',
    borderColor: '#00f0ff',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00f0ff',
    shadowOpacity: 0.6,
    shadowRadius: 6
  }
});
