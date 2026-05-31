import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    // Only connect if we have a user (or you can connect globally)
    const getSocketUrl = () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:3001`;
      }
      return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
    };
    const socketUrl = getSocketUrl();
    
    const socketInstance = io(socketUrl, {
      query: user ? { userId: user.id } : {},
      withCredentials: true,
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return socket;
};
