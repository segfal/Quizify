import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface UseSocketProps {
    serverUrl?: string;
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
console.log('Socket Server URL:', SOCKET_SERVER_URL);

if (!SOCKET_SERVER_URL) {
    console.error('NEXT_PUBLIC_SOCKET_URL is not defined in environment variables');
}

export const useSocket = ({ serverUrl = SOCKET_SERVER_URL }: UseSocketProps = {}) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!serverUrl) {
            console.error('No socket server URL provided');
            toast.error('Socket server configuration error');
            return;
        }

        if (socketRef.current?.connected) {
            console.log('Socket already connected');
            return;
        }

        console.log('Attempting to connect to socket server:', serverUrl);
        
        try {
            const socket = io(serverUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000,
                withCredentials: true,
                forceNew: true,
                path: '/socket.io'
            });

            socket.on('connect', () => {
                console.log('Connected to Socket.IO server with ID:', socket.id);
                toast.success('Connected to chat server');
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                toast.error(`Failed to connect to chat server: ${error.message}`);
            });

            socket.on('disconnect', (reason) => {
                console.log('Disconnected from socket server:', reason);
                if (reason === 'io server disconnect') {
                    // Server initiated disconnect, try to reconnect
                    socket.connect();
                }
                toast.error('Disconnected from chat server');
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
                toast.error('Chat server error occurred');
            });

            socketRef.current = socket;

            return () => {
                if (socket.connected) {
                    console.log('Cleaning up socket connection');
                    socket.disconnect();
                }
                socketRef.current = null;
            };
        } catch (error) {
            console.error('Error initializing socket connection:', error);
            toast.error('Failed to initialize chat connection');
        }
    }, [serverUrl]);

    const joinRoom = useCallback((roomId: string) => {
        if (!socketRef.current) {
            console.error('Socket not initialized');
            toast.error('Chat connection not initialized');
            return;
        }

        if (!socketRef.current.connected) {
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