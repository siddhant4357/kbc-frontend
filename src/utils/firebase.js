// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration with validation
const firebaseConfig = {
  apiKey: import.meta?.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  // Add validation for database URL
  databaseURL: import.meta?.env?.VITE_FIREBASE_DATABASE_URL || null,
  projectId: import.meta?.env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta?.env?.VITE_FIREBASE_APP_ID || ""
};


let app;
let db;

try {
  // Validate database URL format before initializing
  if (!firebaseConfig.databaseURL) {
    throw new Error('Firebase Database URL is missing in environment variables');
  }
  
  // Validate URL format (should be https://<projectid>.firebaseio.com)
  if (!firebaseConfig.databaseURL.match(/^https:\/\/[a-z0-9-]+\.firebaseio\.com$/i)) {
    throw new Error(`Invalid Firebase Database URL format: ${firebaseConfig.databaseURL}`);
  }
  
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Display more helpful error message in production
  alert('Database connection failed. Please contact support.');
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