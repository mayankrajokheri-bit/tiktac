# Reality Quest AI — React Native Mobile Starter Kit

A production-ready mobile starter kit for **Reality Quest AI**, built for the 24-hour hackathon theme:
**"REAL WORLD × AI × GAMING – Turn the Real World into a Game"**

---

## 🛠️ Technology Stack
- **Framework**: React Native with Expo SDK 51 (TypeScript)
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **AI Core**: Google Gemini 1.5 Flash Vision Multimodal API
- **Computer Vision**: `expo-camera` with AR Reticle Overlays
- **Geolocation & Maps**: `react-native-maps` + `expo-location`
- **State Management**: Zustand
- **Backend**: Firebase (Cloud Firestore, Firebase Authentication, Cloud Storage)

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
cd reality-quest-ai/react-native-starter
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=reality-quest-ai
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=reality-quest-ai.firebaseapp.com
```

### 3. Launch with Expo
```bash
# Start Metro Bundler
npx expo start

# Open on Android Emulator or Device
npx expo start --android

# Open on iOS Simulator
npx expo start --ios
```

---

## 📂 Project Structure
```text
react-native-starter/
├── App.tsx                     # Root App Entry
├── app.json                    # Expo Manifest & Permissions
├── package.json
├── tsconfig.json
└── src/
    ├── types/
    │   └── game.ts             # Domain Interfaces (Item, Quest, Player, Rarity)
    ├── services/
    │   ├── geminiService.ts    # Gemini 1.5 Flash Vision API client
    │   ├── firebaseConfig.ts   # Firebase Firestore & Auth client
    │   └── locationService.ts  # GPS Tracking & AR Node Spawning
    ├── store/
    │   └── useGameStore.ts     # Zustand global store with XP & inventory
    ├── navigation/
    │   └── AppNavigator.tsx    # 6 Bottom Tab Screens
    ├── screens/
    │   ├── HomeScreen.tsx      # Player HUD & Priority Mission
    │   ├── MapScreen.tsx       # Cyberpunk Google Map with AR Pins
    │   ├── CameraScanScreen.tsx# AR Camera & Shutter Transmutation
    │   ├── QuestScreen.tsx     # Procedural AI Mission Board
    │   ├── InventoryScreen.tsx # Rarity-Filtered Item Grid
    │   └── ProfileScreen.tsx   # Perception Radar & Regional Sectors
    └── components/
        └── AROverlay.tsx       # Reusable Laser Reticle
```
