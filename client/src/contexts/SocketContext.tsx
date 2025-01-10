'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { SocketContextType } from '@/interfaces/socket/types';

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    useEffect(() => {
        if (!socketUrl) {
            console.error('Socket URL not configured');
            return;
        }

        // Create socket connection
        const socket = io(socketUrl, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000
        });

        socket.on('connect', () => {
            console.log('Socket connected successfully:', socket.id);
            setIsConnected(true);
            toast.success('Connected to chat server');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
            toast.error('Failed to connect to chat server');
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
                socket.connect();
            }
            toast.error('Disconnected from chat server');
        });

        socketRef.current = socket;

        // Connect the socket
        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [socketUrl]);

    const value = {
        socket: socketRef.current,
        isConnected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
} 