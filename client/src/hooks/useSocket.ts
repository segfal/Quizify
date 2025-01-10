import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { UseSocketProps, UseSocketReturn } from '@/interfaces/socket/types';

export const useSocket = ({ serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL }: UseSocketProps = {}): UseSocketReturn => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectAttempts = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;

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
        
        const connectSocket = () => {
            try {
                const socket = io(serverUrl, {
                    transports: ['websocket'],
                    secure: true,
                    rejectUnauthorized: false,
                    reconnection: true,
                    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
                    reconnectionDelay: 1000,
                    timeout: 20000,
                    withCredentials: true
                });

                socket.on('connect', () => {
                    console.log('Connected to Socket.IO server with ID:', socket.id);
                    setIsConnected(true);
                    reconnectAttempts.current = 0;
                    toast.success('Connected to chat server');
                });

                socket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error.message);
                    setIsConnected(false);
                    reconnectAttempts.current++;
                    
                    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
                        toast.error('Failed to connect to chat server after multiple attempts');
                        socket.disconnect();
                        return;
                    }
                    
                    toast.error(`Failed to connect to chat server: ${error.message}`);
                    
                    // Try to reconnect after a delay
                    setTimeout(() => {
                        if (!socket.connected) {
                            socket.connect();
                        }
                    }, 2000);
                });

                socket.on('disconnect', (reason) => {
                    console.log('Disconnected from socket server:', reason);
                    setIsConnected(false);
                    if (reason === 'io server disconnect' && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                        socket.connect();
                    }
                    toast.error('Disconnected from chat server');
                });

                socket.on('error', (error) => {
                    console.error('Socket error:', error);
                    toast.error('Chat server error occurred');
                });

                socketRef.current = socket;

                return socket;
            } catch (error) {
                console.error('Error initializing socket connection:', error);
                toast.error('Failed to initialize chat connection');
                setIsConnected(false);
                return null;
            }
        };

        const socket = connectSocket();

        return () => {
            if (socket?.connected) {
                console.log('Cleaning up socket connection');
                socket.disconnect();
            }
            socketRef.current = null;
            setIsConnected(false);
            reconnectAttempts.current = 0;
        };
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
        isConnected
    };
}; 