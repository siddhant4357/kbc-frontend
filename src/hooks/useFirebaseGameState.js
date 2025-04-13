import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { db } from '../utils/firebase';

const handleFirebaseError = (error) => {
  switch (error.code) {
    case 'PERMISSION_DENIED':
      return 'You do not have permission to access this game.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection.';
    case 'DATABASE_UNAVAILABLE':
      return 'Game server is currently unavailable.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export const useFirebaseGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    const connectedRef = ref(db, '.info/connected');
    connectionRef.current = connectedRef;

    // Listen for connection state
    const connectUnsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      setIsConnected(connected);
      
      if (connected) {
        // Create presence ref under the game path instead of .info
        const presenceRef = ref(db, `games/${gameId}/presence/${Date.now()}`);
        
        // Set offline status on disconnect
        onDisconnect(presenceRef).remove();
        
        // Set online status
        set(presenceRef, {
          status: 'online',
          timestamp: serverTimestamp()
        });
      }
    });

    // Listen for real-time updates
    const gameUnsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
        setError(null);
      }
      setIsInitialized(true);
    }, (error) => {
      console.error('Firebase error:', error);
      setError(handleFirebaseError(error));
      setIsInitialized(true);
    });

    return () => {
      connectUnsubscribe();
      gameUnsubscribe();
      // Clear any disconnect handlers
      if (gameRef) {
        const presenceRef = ref(db, `games/${gameId}/presence/${Date.now()}`);
        onDisconnect(presenceRef).cancel();
      }
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;

    const cleanup = () => {
      if (connectionRef.current) {
        // Clear all listeners
        connectionRef.current.off();
        // Clear presence
        const presenceRef = ref(db, `games/${gameId}/presence/${Date.now()}`);
        onDisconnect(presenceRef).cancel();
        set(presenceRef, null);
      }
    };

    process.on('beforeExit', cleanup);
    
    return () => {
      cleanup();
      process.off('beforeExit', cleanup);
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