import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../utils/config';

export const useGameState = (gameId) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const gameToken = localStorage.getItem(`game_${gameId}_token`);

    const newSocket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      auth: {
        gameToken,
        username: user?.username
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      newSocket.emit('joinGame', {
        questionBankId: gameId,
        username: user?.username,
        isAdmin: user?.isAdmin || false
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Connection error. Retrying...');
    });

    newSocket.on('gameStateUpdate', (updatedState) => {
      console.log('Game state updated:', updatedState);
      setGameState(updatedState);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('gameStateUpdate');
      newSocket.close();
    };
  }, [gameId]);

  return { gameState, error, socket, isConnected };
};