import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    useEffect(() => {
        if (!socketUrl) {
            console.error('Socket URL not configured');
            return;
        }

        // Configure socket with secure options
        socketRef.current = io(socketUrl, {
            transports: ['websocket'],
            secure: true,
            rejectUnauthorized: false,
            withCredentials: true,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            if (socket) {
                socket.disconnect();
                socketRef.current = null;
            }
        };
    }, [socketUrl]);

    return socketRef.current;
}; 