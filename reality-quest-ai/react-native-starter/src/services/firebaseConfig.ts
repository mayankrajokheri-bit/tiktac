/**
 * Reality Quest AI - Firebase Configuration & Initialization
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyMockKeyForHackathon",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "reality-quest-ai.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "reality-quest-ai",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "reality-quest-ai.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

export const COLLECTIONS = {
  USERS: 'users',
  INVENTORY: 'inventory_items',
  QUESTS: 'quests',
  REGIONS: 'regions',
  SCANS: 'scan_history'
};
