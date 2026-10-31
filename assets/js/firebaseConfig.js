/**
 * Aniwave Firebase Configuration & Client Adapter
 * Dual-Mode: Uses Firebase Firestore if configured, otherwise falls back gracefully to local repository.
 */

// Ganti konfigurasi di bawah ini dengan config dari Firebase Console proyek kamu:
// Firebase Console -> Project Settings -> General -> Your apps -> Web app -> Config
export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

export const isFirebaseConfigured = Boolean(
  FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId
);
