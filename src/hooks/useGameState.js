import { useState, useEffect } from 'react';
import { API_URL } from '../utils/config';

export const useGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const [lastStateId, setLastStateId] = useState(null);

  const pollGameState = async () => {
    try {
      const response = await fetch(`${API_URL}/api/game/${gameId}/status`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (!lastStateId || data.stateId !== lastStateId) {
          setLastStateId(data.stateId);
          setGameState(data);
          return data;
        }
      }
    } catch (err) {
      setError('Connection error');
      console.error('Polling error:', err);
    }
    return null;
  };

  useEffect(() => {
    const interval = setInterval(pollGameState, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  return { gameState, error, pollGameState };
};