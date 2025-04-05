import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../utils/firebase';

export const useFirebaseGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set up real-time listener
  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    
    // Listen for real-time updates
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Firebase state update:', data);
      setGameState(data);
      setIsInitialized(true);
    }, (error) => {
      console.error('Firebase error:', error);
      setError('Error connecting to game');
      setIsInitialized(true);
    });

    // Cleanup listener
    return () => {
      unsubscribe();
    };
  }, [gameId]);

  const updateGameState = useCallback(async (updates) => {
    if (!gameId) return false;

    try {
      const gameRef = ref(db, `games/${gameId}`);
      await set(gameRef, {
        ...gameState,
        ...updates,
        updatedAt: Date.now()
      });
      return true;
    } catch (err) {
      console.error('Error updating game state:', err);
      setError('Failed to update game state');
      return false;
    }
  }, [gameId, gameState]);

  return { gameState, error, updateGameState, isInitialized };
};