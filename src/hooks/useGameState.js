import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../utils/config';

export const useGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);

  const processGameState = useCallback((state) => {
    setGameState(prevState => ({
      ...prevState,
      ...state
    }));
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      newSocket.emit('joinGame', {
        questionBankId: gameId,
        username: user.username,
        isAdmin: user.isAdmin
      });
    });

    newSocket.on('gameStateUpdate', processGameState);

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Connection error. Please refresh the page.');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, processGameState]);

  return { gameState, error, socket };
};