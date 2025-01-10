import { Socket } from 'socket.io-client';
import { Server as NetServer } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

export interface UseSocketProps {
    serverUrl?: string;
}

export interface UseSocketReturn {
    socket: Socket | null;
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    isConnected: boolean;
}

export type NextApiResponseServerIO = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
}; 