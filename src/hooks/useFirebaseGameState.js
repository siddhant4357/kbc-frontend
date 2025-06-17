import { useState, useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../utils/firebase';

export const useFirebaseGameState = (gameId) => {
  const [firebaseGameState, setFirebaseGameState] = useState(null);
  const [players, setPlayers] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  // Store refs in ref objects properly
  const gameRefObj = useRef(null);
  const playersRefObj = useRef(null);

  useEffect(() => {
    if (!gameId) return;

    try {
      // Create Firebase references
      const gameReference = ref(db, `games/${gameId}`);
      const playersReference = ref(db, `games/${gameId}/players`);
      
      // Store references for cleanup
      gameRefObj.current = gameReference;
      playersRefObj.current = playersReference;

      // Set up game state listener
      const unsubscribeGame = onValue(gameReference, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setFirebaseGameState(data);
          setIsReady(true);
        }
      }, (err) => {
        console.error("Firebase game state error:", err);
        setError(`Failed to load game: ${err.message}`);
      });

      // Set up players listener
      const unsubscribePlayers = onValue(playersReference, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPlayers(data);
        }
      }, (err) => {
        console.error("Firebase players error:", err);
      });

      // Return cleanup function
      return () => {
        if (gameRefObj.current) {
          off(gameRefObj.current);
        }
        if (playersRefObj.current) {
          off(playersRefObj.current);
        }
      };
    } catch (err) {
      console.error("Firebase initialization error:", err);
      setError(`Firebase initialization failed: ${err.message}`);
    }
  }, [gameId, db]);

  return { firebaseGameState, players, isReady, error };
};