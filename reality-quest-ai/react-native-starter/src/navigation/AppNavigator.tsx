/**
 * Reality Quest AI - React Navigation Bottom Tabs & Screens
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import CameraScanScreen from '../screens/CameraScanScreen';
import QuestScreen from '../screens/QuestScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#00f0ff',
          tabBarInactiveTintColor: '#64748b',
          tabBarLabelStyle: styles.tabLabel
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>
          }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🗺️</Text>
          }}
        />
        <Tab.Screen
          name="Scan"
          component={CameraScanScreen}
          options={{
            tabBarLabel: 'Scan AR',
            tabBarIcon: ({ color }) => (
              <View style={styles.scanTabIconWrap}>
                <Text style={{ fontSize: 22 }}>⚡</Text>
              </View>
            )
          }}
        />
        <Tab.Screen
          name="Quests"
          component={QuestScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🎯</Text>
          }}
        />
        <Tab.Screen
          name="Bag"
          component={InventoryScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🎒</Text>
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#090e18',
    borderTopColor: 'rgba(0, 240, 255, 0.18)',
    borderTopWidth: 1,
    height: 68,
    paddingBottom: 8,
    paddingTop: 6
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  scanTabIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: '#00f0ff',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  }
});
