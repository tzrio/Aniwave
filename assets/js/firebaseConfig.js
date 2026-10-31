/**
 * Aniwave Firebase Configuration & Client Adapter
 * Project: smileora-tzrio
 */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDC0OZ2yVq8oQPR0pMNiZZJqIDKiLXZTFY",
  authDomain: "smileora-tzrio.firebaseapp.com",
  projectId: "smileora-tzrio",
  storageBucket: "smileora-tzrio.firebasestorage.app",
  messagingSenderId: "227917051502",
  appId: "1:227917051502:web:4eed77fbfce24e96e0d87f",
  measurementId: "G-Q144FP3NKE"
};

export const isFirebaseConfigured = Boolean(
  FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId
);
