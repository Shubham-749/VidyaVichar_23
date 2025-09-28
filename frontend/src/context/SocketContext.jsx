import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ lectureId, children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && lectureId) {
      // Get token from localStorage or user object
      const token = user.token || localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found for socket connection');
        return;
      }

      const s = io('http://localhost:3000', {
        query: { token, lectureId },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection event handlers
      s.on('connect', () => {
        console.log('Socket connected successfully');
        setIsConnected(true);
        // Join lecture room
        s.emit('joinLecture', { lectureId });
      });

      s.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      s.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(s);

      // Cleanup function
      return () => {
        if (s) {
          s.emit('leaveLecture', { lectureId });
          s.disconnect();
          setIsConnected(false);
        }
      };
    }
  }, [user, lectureId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    console.warn('useSocket must be used within a SocketProvider');
    return { socket: null, isConnected: false };
  }
  return context;
}; 