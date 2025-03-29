import { useState, useEffect } from 'react';
import { API_URL } from '../utils/config';

export const useGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  const pollGameState = async () => {
    try {
      const response = await fetch(`${API_URL}/api/game/${gameId}/status`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGameState(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching game state:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    // Initial poll
    pollGameState();

    // Set up polling interval (every 3 seconds)
    const interval = setInterval(pollGameState, 3000);

    // Cleanup
    return () => clearInterval(interval);
  }, [gameId]);

  return { gameState, error };
};