import { Platform } from "react-native";
import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const isFirebaseConfigured = requiredConfigKeys.length === 0;

const app = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

let auth = null;
let db = null;

if (app) {
  if (Platform.OS === "web") {
    auth = getAuth(app);
  } else {
    // Try to initialize Auth with React Native persistence (AsyncStorage).
    // For @react-native-async-storage/async-storage v2 the module exports
    // the default storage object which can be passed directly.
    try {
      const persistence = getReactNativePersistence(AsyncStorage);
      auth = initializeAuth(app, { persistence });
    } catch (error) {
      // Fallback to JS SDK auth if initializeAuth or persistence fails.
      auth = getAuth(app);
    }
  }

  db = getFirestore(app);
}

export { auth, db, firebaseConfig, isFirebaseConfigured, requiredConfigKeys };