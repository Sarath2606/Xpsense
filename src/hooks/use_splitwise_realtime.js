import { useEffect, useRef } from 'react';
import { io as ioClient } from 'socket.io-client';
import { auth } from '../config/firebase';

export const useSplitwiseRealtime = (groupId, { onExpenseCreated, onBalancesUpdated } = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (cancelled) return;

        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');
        const socket = ioClient(baseUrl, {
          transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
          auth: { token },
          withCredentials: true,
          timeout: 5000,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          if (groupId) socket.emit('join:group', { groupId });
        });

        socket.on('expense:created', (payload) => {
          if (payload?.expense?.groupId === groupId) {
            onExpenseCreated?.(payload.expense);
          }
        });

        socket.on('balances:updated', (payload) => {
          if (payload?.groupId === groupId) {
            onBalancesUpdated?.();
          }
        });

        socket.on('connect_error', (error) => {
          console.warn('WebSocket connection failed, falling back to polling:', error.message);
        });

        socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
        });
      } catch (error) {
        console.warn('Failed to establish WebSocket connection:', error);
        // silently ignore - app will work without real-time updates
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        if (groupId) socketRef.current.emit('leave:group', { groupId });
        socketRef.current.disconnect();
      }
    };
  }, [groupId, onExpenseCreated, onBalancesUpdated]);
};


