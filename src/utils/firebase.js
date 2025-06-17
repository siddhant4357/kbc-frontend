// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration - use optional chaining for safer access to env vars
const firebaseConfig = {
  apiKey: import.meta?.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta?.env?.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta?.env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta?.env?.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase safely
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  
  // Set recommended timeouts and cache size
  if (db._repoInternal) {
    db._repoInternal.persistentConnection_.repo.persistentConnection_.dataUpdateCount = 10000000;
  }
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { db };

// Error handler
export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  switch (error.code) {
    case 'PERMISSION_DENIED':
      return 'Permission denied. Please check your access rights.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};