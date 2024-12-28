import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface UseSocketProps {
    serverUrl?: string;
}

export const useSocket = ({ serverUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000' }: UseSocketProps = {}) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (socketRef.current?.connected) return;

        const connectSocket = async () => {
            try {
                console.log('Connecting to socket server:', serverUrl);
                // Initialize socket connection
                const socket = io(serverUrl, {
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    transports: ['websocket'],
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
                        // the disconnection was initiated by the server, reconnect manually
                        socket.connect();
                    }
                    toast.error('Disconnected from chat server');
                });

                // Assign the socket to the ref
                socketRef.current = socket;
                console.log('Socket assigned to ref:', socketRef.current.id);

            } catch (error) {
                console.error('Failed to initialize socket:', error);
                toast.error('Failed to initialize chat server');
            }
        };

        connectSocket();

        // Cleanup on unmount
        return () => {
            if (socketRef.current?.connected) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [serverUrl]);

    // Room joining with retry logic
    const joinRoom = useCallback((roomId: string) => {
        console.log('Joining room:', roomId);
        if (!socketRef.current?.connected) {
            console.error('Socket not connected');
            toast.error('Chat server not connected');
            return;
        }

        console.log('Joining room:', roomId);
        socketRef.current.emit('join_room', roomId);
    }, []);

    // Leave room
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