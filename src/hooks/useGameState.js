import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../utils/firebase';

export const useGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

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

  return { gameState, error };
};