import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { db } from '../utils/firebase';

export const useFirebaseGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const connectionRef = useRef(null);

  // Set up real-time listener
  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    const connectedRef = ref(db, '.info/connected');
    connectionRef.current = connectedRef;

    // Listen for connection state
    const connectUnsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      setIsConnected(connected);
      if (!connected) {
        console.log('Disconnected from Firebase');
      } else {
        console.log('Connected to Firebase');
        // Set up presence
        const presenceRef = ref(db, `.info/connected`);
        onDisconnect(presenceRef).set(serverTimestamp());
      }
    });
    
    // Listen for real-time updates
    const gameUnsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      // console.log('Firebase state update:', data);
      if (data) {
        setGameState(data);
        setError(null); // Clear any previous errors
      }
      setIsInitialized(true);
    }, (error) => {
      console.error('Firebase error:', error);
      setError('Error connecting to game');
      setIsInitialized(true);
    });

    // Cleanup listeners
    return () => {
      gameUnsubscribe();
      connectUnsubscribe();
    };
  }, [gameId]);

  const updateGameState = useCallback(async (updates) => {
    if (!gameId || !isConnected) return false;

    try {
      const gameRef = ref(db, `games/${gameId}`);
      const newState = {
        ...gameState,
        ...updates,
        updatedAt: Date.now()
      };
      await set(gameRef, newState);
      return true;
    } catch (err) {
      console.error('Error updating game state:', err);
      setError('Failed to update game state');
      return false;
    }
  }, [gameId, gameState, isConnected]);

  return { 
    gameState, 
    error, 
    updateGameState, 
    isInitialized,
    isConnected 
  };
};