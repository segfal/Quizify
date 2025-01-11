import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || "https://quizifi.netlify.app",
    "http://localhost:3000"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST"],
    credentials: true
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
        // Notify room of new user
        io.to(roomId).emit('user_joined', { userId: socket.id });
    });

    socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
        // Notify room of user leaving
        io.to(roomId).emit('user_left', { userId: socket.id });
    });

    socket.on('message', (data: any) => {
        console.log('Message received on server:', data);
        
        try {
            const { roomId, message, userId, username } = data;
            
            if (!roomId || !message || !userId || !username) {
                console.error('Invalid message data:', data);
                return;
            }

            const messageData = {
                message,
                userId,
                username,
                timestamp: new Date().toISOString()
            };

            // Broadcast to ALL clients in the room INCLUDING sender
            io.in(roomId).emit('message', messageData);
            console.log('Message broadcast to room:', roomId, messageData);
            
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

const PORT = process.env.PORT || 5003;

httpServer.listen(PORT, () => {
    console.log(`Socket.IO server is running on port ${PORT}`);
}); 