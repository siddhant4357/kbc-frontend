import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/config';

export const useGameState = (gameId) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const gameToken = localStorage.getItem(`game_${gameId}_token`);

    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      query: { gameToken }
    });

    newSocket.on('connect', () => {
      // Re-join game room on connection/reconnection
      newSocket.emit('joinGame', {
        questionBankId: gameId,
        username: user.username,
        gameToken
      });
    });

    newSocket.on('gameStateUpdate', (newState) => {
      setGameState(prevState => ({
        ...prevState,
        ...newState
      }));
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Connection error. Please try refreshing.');
    });

    newSocket.on('disconnect', () => {
      // Attempt to reconnect
      newSocket.connect();
    });

    setSocket(newSocket);

    // Initial game state fetch
    fetchGameState();

    return () => {
      newSocket.close();
    };
  }, [gameId]);

  const fetchGameState = async () => {
    try {
      const response = await fetch(`${API_URL}/api/game/${gameId}/state`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setGameState(data);
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  };

  return { gameState, error, socket };
};