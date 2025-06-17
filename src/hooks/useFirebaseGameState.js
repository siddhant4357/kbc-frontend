import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../utils/firebase';

export const useFirebaseGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    const connectedRef = ref(db, '.info/connected');

    try {
      const connectedUnsubscribe = onValue(connectedRef, (snap) => {
        setIsConnected(!!snap.val());
      });

      const gameUnsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        setGameState(data);
        setIsInitialized(true);
      }, (error) => {
        console.error('Firebase error:', error);
        setError(error.message);
      });

      return () => {
        gameUnsubscribe();
        connectedUnsubscribe();
      };
    } catch (error) {
      console.error('Error setting up Firebase listeners:', error);
      setError(error.message);
    }
  }, [gameId]);

  return {
    gameState,
    error,
    isConnected,
    isInitialized
  };
};