// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// We'll implement persistence in a different way
try {
  // Set cache size (10MB)
  db._repoInternal.persistentConnection_.repo.persistentConnection_.dataUpdateCount = 10000000;
  console.log('Firebase cache size optimized');
} catch (err) {
  console.warn('Could not optimize Firebase cache size');
}

// Add this to your firebase.js file
export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  // Add specific error handling based on error codes
  switch (error.code) {
    case 'PERMISSION_DENIED':
      return 'Permission denied. Please check your access rights.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};