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
          transports: ['websocket'],
          auth: { token },
          withCredentials: true
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
      } catch {
        // silently ignore
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


