// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

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

// Initialize Firebase with error handling
try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  // Connect to emulators if in development
  if (import.meta.env.DEV) {
    connectDatabaseEmulator(db, 'localhost', 9000);
    connectAuthEmulator(auth, 'http://localhost:9099');
  }

} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { db, auth };

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