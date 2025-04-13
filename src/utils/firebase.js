// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, connectAuthEmulator, signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';

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
const auth = getAuth(app);
const db = getDatabase(app);

// Helper function for anonymous sign in
export const signInAnonymously = () => firebaseSignInAnonymously(auth);

if (import.meta.env.DEV) {
  connectDatabaseEmulator(db, 'localhost', 9000);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export { db, auth };