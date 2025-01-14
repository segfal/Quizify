import { Socket } from 'socket.io-client';


export interface ChatMessage {
    roomId: string;
    message: string;
    userId: string;
    username: string;
    timestamp?: number;
}

export interface ChatProps {
    roomId: string;
    socket: Socket;
}