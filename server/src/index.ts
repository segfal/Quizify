import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

interface Line {
    points: { x: number; y: number; }[];
    color: string;
    width: number;
    id: string;
}

interface Shape {
    type: 'square' | 'circle';
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    id: string;
}

interface Text {
    x: number;
    y: number;
    content: string;
    color: string;
    fontSize: number;
    id: string;
}

interface WhiteboardState {
    lines: Line[];
    shapes: Shape[];
    texts: Text[];
    isDarkMode: boolean;
}

interface ServerToClientEvents {
    message: (data: MessageData) => void;
    user_joined: (data: { userId: string }) => void;
    user_left: (data: { userId: string }) => void;
    whiteboard_state: (state: WhiteboardState) => void;
    draw_line: (data: { line: Line }) => void;
    add_shape: (data: { shape: Shape }) => void;
    add_text: (data: { text: Text }) => void;
    dark_mode_changed: (isDark: boolean) => void;
}

interface ClientToServerEvents {
    join_room: (roomId: string) => void;
    leave_room: (roomId: string) => void;
    message: (data: MessageData) => void;
    join_whiteboard: (roomId: string) => void;
    leave_whiteboard: (roomId: string) => void;
    request_whiteboard_state: (roomId: string) => void;
    draw_line: (data: { roomId: string; line: Line }) => void;
    add_shape: (data: { roomId: string; shape: Shape }) => void;
    add_text: (data: { roomId: string; text: Text }) => void;
    dark_mode_changed: (data: { roomId: string; isDarkMode: boolean }) => void;
}

interface MessageData {
    roomId: string;
    message: string;
    userId: string;
    username: string;
    timestamp: number;
}

// Store whiteboard states for each room
const whiteboardStates = new Map<string, WhiteboardState>();

const PORT = process.env.PORT || 5003;
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

// Initialize whiteboard state for a room
function getWhiteboardState(roomId: string): WhiteboardState {
    if (!whiteboardStates.has(roomId)) {
        whiteboardStates.set(roomId, {
            lines: [],
            shapes: [],
            texts: [],
            isDarkMode: false
        });
    }
    return whiteboardStates.get(roomId)!;
}

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

    // Whiteboard events
    socket.on('join_whiteboard', (roomId: string) => {
        console.log(`User ${socket.id} joined whiteboard in room ${roomId}`);
        
        // Send current state to the joining user
        const state = getWhiteboardState(roomId);
        socket.emit('whiteboard_state', state);
    });

    socket.on('leave_whiteboard', (roomId: string) => {
        const whiteboardRoom = `whiteboard:${roomId}`;
        socket.leave(whiteboardRoom);
        console.log(`User ${socket.id} left whiteboard in room ${roomId}`);
    });

    socket.on('request_whiteboard_state', (roomId: string) => {
        console.log(`User ${socket.id} requested whiteboard state for room ${roomId}`);
        const state = getWhiteboardState(roomId);
        socket.emit('whiteboard_state', state);
    });

    socket.on('draw_line', (data: { roomId: string; line: Line }) => {
        console.log(`User ${socket.id} drew line in room ${data.roomId}`);
        const state = getWhiteboardState(data.roomId);
        state.lines.push(data.line);
        
        // Broadcast to all clients in the room including sender
        io.to(data.roomId).emit('draw_line', { line: data.line });
    });

    socket.on('add_shape', (data: { roomId: string; shape: Shape }) => {
        console.log(`User ${socket.id} added shape in room ${data.roomId}`);
        const state = getWhiteboardState(data.roomId);
        state.shapes.push(data.shape);
        
        io.to(data.roomId).emit('add_shape', { shape: data.shape });
    });

    socket.on('add_text', (data: { roomId: string; text: Text }) => {
        console.log(`User ${socket.id} added text in room ${data.roomId}`);
        const state = getWhiteboardState(data.roomId);
        state.texts.push(data.text);
        
        io.to(data.roomId).emit('add_text', { text: data.text });
    });

    socket.on('dark_mode_changed', (data: { roomId: string; isDarkMode: boolean }) => {
        console.log(`User ${socket.id} changed dark mode in room ${data.roomId}`);
        const state = getWhiteboardState(data.roomId);
        state.isDarkMode = data.isDarkMode;
        
        io.to(data.roomId).emit('dark_mode_changed', data.isDarkMode);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', socket.id, 'Reason:', reason);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', socket.id, error);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 