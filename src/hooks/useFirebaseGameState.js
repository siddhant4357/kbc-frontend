import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { db } from '../utils/firebase';

export const useFirebaseGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  // Set up real-time listener
  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    
    // Listen for real-time updates
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log('Firebase update received:', data);
        setGameState(data);
      }
    }, (error) => {
      console.error('Firebase error:', error);
      setError('Error connecting to game');
    });

    // Cleanup listener
    return () => {
      off(gameRef);
    };
  }, [gameId]);

  // Update game state function
  const updateGameState = useCallback(async (updates) => {
    if (!gameId) return;

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

  return { gameState, error, updateGameState };
};