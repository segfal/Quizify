import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

interface ServerToClientEvents {
    message: (data: MessageData) => void;
    user_joined: (data: { userId: string }) => void;
    user_left: (data: { userId: string }) => void;
}

interface ClientToServerEvents {
    join_room: (roomId: string) => void;
    leave_room: (roomId: string) => void;
    message: (data: MessageData) => void;
}

interface MessageData {
    roomId: string;
    message: string;
    userId: string;
    username: string;
    timestamp: number;
}

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const app = express();

// Middleware
app.use(cors({
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket']
});

// Socket.IO connection handling
io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log('Socket connected:', socket.id);

    socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
        socket.to(roomId).emit('user_joined', { userId: socket.id });
    });

    socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
        socket.to(roomId).emit('user_left', { userId: socket.id });
    });

    socket.on('message', (data: MessageData) => {
        console.log('Message received:', data);
        if (!data || !data.roomId || !data.message) {
            console.error('Invalid message format:', data);
            return;
        }
        // Broadcast to all clients in the room including sender
        io.in(data.roomId).emit('message', data);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', socket.id, 'Reason:', reason);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', socket.id, error);
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server accepting connections from ${CLIENT_URL}`);
}); 