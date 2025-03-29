import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

// Create reusable socket connection
export const createSocketConnection = (options = {}) => {
  try {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      ...options
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    return socket;
  } catch (error) {
    console.error('Error creating socket connection:', error);
    return null;
  }
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
