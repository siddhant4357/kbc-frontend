import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../utils/firebase';

export const useFirebaseGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  const updateGameState = useCallback(async (newState) => {
    if (!gameId) return;
    
    try {
      const gameRef = ref(db, `games/${gameId}`);
      await set(gameRef, {
        ...gameState,
        ...newState,
        updatedAt: Date.now()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [gameId, gameState]);

  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
      }
    }, (error) => {
      setError(error.message);
    });

    return () => unsubscribe();
  }, [gameId]);

  return { gameState, error, updateGameState };
};