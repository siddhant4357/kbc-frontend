import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/config';

export const useGameState = (gameId) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const newSocket = io(API_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      newSocket.emit('identify', {
        username: user.username,
        isAdmin: user.isAdmin,
        questionBankId: gameId
      });
    });

    newSocket.on('gameState', (state) => {
      setGameState(state);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Connection error. Please try refreshing the page.');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [gameId]);

  return { gameState, error, socket };
};