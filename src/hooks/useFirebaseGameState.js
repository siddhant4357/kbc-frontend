import { useEffect, useState } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { db } from '../utils/firebase';

export const useFirebaseGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    onValue(connectedRef, (snap) => {
      if (!snap.val()) {
        setError('Lost connection to Firebase');
      }
    });
  }, []);

  const updateGameState = async (updates) => {
    try {
      const gameRef = ref(db, `games/${gameId}`);
      await update(gameRef, updates);
    } catch (error) {
      console.error('Firebase update error:', error);
      throw new Error('Failed to update game state');
    }
  };

  return { gameState, error, updateGameState };
};