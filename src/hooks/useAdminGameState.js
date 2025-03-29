import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/config';

export const useAdminGameState = (gameId) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.isAdmin) return;

    const newSocket = io(API_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      newSocket.emit('identify', {
        username: user.username,
        isAdmin: true,
        questionBankId: gameId
      });
    });

    newSocket.on('gameState', (state) => {
      setGameState(state);
    });

    newSocket.on('playerJoined', (data) => {
      setPlayers(prev => [...prev, data.username]);
    });

    newSocket.on('playerLeft', (data) => {
      setPlayers(prev => prev.filter(p => p !== data.username));
    });

    newSocket.on('playerAnswer', (data) => {
      // Handle player answers
      console.log('Player answer:', data);
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

  const updateGameState = async (action, data) => {
    try {
      const response = await fetch(`${API_URL}/api/game/${gameId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error updating game (${action}):`, error);
      throw error;
    }
  };

  return {
    gameState,
    error,
    socket,
    players,
    updateGameState,
    showOptions: (timerDuration) => updateGameState('showOptions', { timerDuration }),
    showAnswer: () => updateGameState('showAnswer'),
    stopGame: () => updateGameState('stop')
  };
};