import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

// Create reusable socket connection
export const createSocketConnection = (options = {}) => {
  const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    ...options
  });

  // Add reconnection handlers
  socket.on('reconnect_attempt', (attempt) => {
    console.log('Attempting to reconnect:', attempt);
  });

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  return socket;
};

// Socket event handler with error handling
export const handleSocketEvent = (socket, event, callback) => {
  try {
    socket.on(event, (data) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  } catch (error) {
    console.error(`Error setting up ${event} handler:`, error);
  }
};

// Clean up socket connection
export const disconnectSocket = (socket) => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
