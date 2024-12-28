import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface UseSocketProps {
    serverUrl?: string;
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5003';

export const useSocket = ({ serverUrl = SOCKET_SERVER_URL }: UseSocketProps = {}) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (socketRef.current?.connected) {
            console.log('Socket already connected');
            return;
        }

        console.log('Connecting to socket server:', serverUrl);
        const socket = io(serverUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server with ID:', socket.id);
            toast.success('Connected to chat server');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            toast.error('Failed to connect to chat server');
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from socket server:', reason);
            if (reason === 'io server disconnect') {
                socket.connect();
            }
            toast.error('Disconnected from chat server');
        });

        socketRef.current = socket;

        return () => {
            if (socket.connected) {
                console.log('Cleaning up socket connection');
                socket.disconnect();
            }
            socketRef.current = null;
        };
    }, [serverUrl]);

    const joinRoom = useCallback((roomId: string) => {
        if (!socketRef.current?.connected) {
            console.error('Socket not connected');
            toast.error('Chat server not connected');
            return;
        }

        console.log('Joining room:', roomId);
        socketRef.current.emit('join_room', roomId);
    }, []);

    const leaveRoom = useCallback((roomId: string) => {
        if (!socketRef.current?.connected) {
            console.error('Socket not connected');
            return;
        }

        console.log('Leaving room:', roomId);
        socketRef.current.emit('leave_room', roomId);
    }, []);

    return {
        socket: socketRef.current,
        joinRoom,
        leaveRoom,
        isConnected: socketRef.current?.connected || false,
    };
}; 