export interface ChatMessage {
    message: string;
    roomId: string;
    userId: string;
    username: string;
    timestamp?: string;
}

export interface ChatProps {
    roomId: string;
    socket: any; // TODO: Replace with proper Socket type
}