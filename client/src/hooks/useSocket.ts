import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface UseSocketProps {
    serverUrl?: string;
}

export const useSocket = ({ serverUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' }: UseSocketProps = {}) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(serverUrl, {
            path: '/api/socket',
            addTrailingSlash: false,
        });

        // Connection event handlers
        socketRef.current.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            toast.error('Failed to connect to room server');
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [serverUrl]);

    // Room creation
    const createRoom = useCallback((roomName: string) => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketRef.current.emit('create_room', { name: roomName });
            socketRef.current.once('room_created', (data) => {
                resolve(data);
            });
        });
    }, []);

    // Join room
    const joinRoom = useCallback((roomId: string) => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketRef.current.emit('join_room', roomId);
            socketRef.current.once('user_joined', (data) => {
                resolve(data);
            });
        });
    }, []);

    // Leave room
    const leaveRoom = useCallback((roomId: string) => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketRef.current.emit('leave_room', roomId);
            socketRef.current.once('user_left', (data) => {
                resolve(data);
            });
        });
    }, []);

    // Get active rooms
    const getRooms = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketRef.current.emit('get_rooms');
            socketRef.current.once('rooms_list', (rooms) => {
                resolve(rooms);
            });
        });
    }, []);

    // Subscribe to room events
    const subscribeToRoom = useCallback((roomId: string, events: {
        onUserJoined?: (data: any) => void;
        onUserLeft?: (data: any) => void;
    }) => {
        if (!socketRef.current) return;

        if (events.onUserJoined) {
            socketRef.current.on('user_joined', events.onUserJoined);
        }
        if (events.onUserLeft) {
            socketRef.current.on('user_left', events.onUserLeft);
        }

        return () => {
            if (!socketRef.current) return;
            if (events.onUserJoined) {
                socketRef.current.off('user_joined', events.onUserJoined);
            }
            if (events.onUserLeft) {
                socketRef.current.off('user_left', events.onUserLeft);
            }
        };
    }, []);

    return {
        socket: socketRef.current,
        createRoom,
        joinRoom,
        leaveRoom,
        getRooms,
        subscribeToRoom,
    };
}; 