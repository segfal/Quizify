import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || "https://quizifi.netlify.app",
    "http://localhost:3000",
    "https://*.netlify.app"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(allowed => 
            allowed.includes('*') 
                ? origin?.startsWith(allowed.replace('*', '')) 
                : allowed === origin
        )) {
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
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    path: '/socket.io'
});

// Store room states
const rooms = new Map();

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Room Events
    socket.on('join_room', (data: { roomId: string; playerName: string }) => {
        const { roomId, playerName } = data;
        socket.join(roomId);
        console.log(`User ${socket.id} (${playerName}) joined room ${roomId}`);

        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                players: [],
                currentQuestion: 0,
                isActive: false,
                answers: new Map()
            });
        }

        // Add player to room
        const room = rooms.get(roomId);
        const player = {
            id: socket.id,
            name: playerName,
            score: 0,
            streak: 0
        };
        room.players.push(player);

        // Notify room of new player
        io.to(roomId).emit('player_joined', player);
    });

    socket.on('leave_room', (data: { roomId: string }) => {
        const { roomId } = data;
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);

        // Remove player from room
        const room = rooms.get(roomId);
        if (room) {
            room.players = room.players.filter(p => p.id !== socket.id);
            io.to(roomId).emit('player_left', socket.id);

            // Clean up empty rooms
            if (room.players.length === 0) {
                rooms.delete(roomId);
            }
        }
    });

    // Quiz Events
    socket.on('start_quiz', (data: { roomId: string }) => {
        const { roomId } = data;
        const room = rooms.get(roomId);
        if (!room) return;

        room.currentQuestion = 0;
        room.isActive = true;
        room.answers.clear();

        // Send first question
        const question = {
            id: '1',
            question: 'What is 2 + 2?',
            answers: ['3', '4', '5', '6'],
            correctAnswer: 1,
            timeLimit: 20
        };

        io.to(roomId).emit('game_started', { question });
    });

    socket.on('submit_answer', (data: {
        roomId: string;
        questionId: string;
        answer: number;
        timeLeft: number;
        points: number;
        multiplier: number;
    }) => {
        const { roomId, questionId, answer, timeLeft, points, multiplier } = data;
        const room = rooms.get(roomId);
        if (!room || !room.isActive) return;

        // Record answer
        room.answers.set(socket.id, {
            answer,
            timeLeft,
            points: points * multiplier
        });

        // Update player score
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.score += points * multiplier;
            if (answer === 1) { // Assuming 1 is correct answer for this example
                player.streak += 1;
            } else {
                player.streak = 0;
            }
        }

        // Notify all players of the answer
        io.to(roomId).emit('answer_received', {
            playerId: socket.id,
            isCorrect: answer === 1, // Assuming 1 is correct answer
            points: points * multiplier,
            players: room.players
        });

        // If all players have answered, end the question
        if (room.answers.size === room.players.length) {
            const correctAnswers = Array.from(room.answers.values())
                .filter(a => a.answer === 1) // Assuming 1 is correct answer
                .length;

            io.to(roomId).emit('question_ended', {
                correctAnswer: 1, // Assuming 1 is correct answer
                stats: {
                    total: room.players.length,
                    correct: correctAnswers,
                    percentage: (correctAnswers / room.players.length) * 100
                },
                players: room.players
            });

            // Clear answers for next question
            room.answers.clear();

            // Move to next question after delay
            setTimeout(() => {
                room.currentQuestion += 1;
                if (room.currentQuestion < 5) { // Assuming 5 questions total
                    const nextQuestion = {
                        id: (room.currentQuestion + 1).toString(),
                        question: `Question ${room.currentQuestion + 1}`,
                        answers: ['A', 'B', 'C', 'D'],
                        correctAnswer: 1,
                        timeLimit: 20
                    };
                    io.to(roomId).emit('next_question', {
                        question: nextQuestion,
                        currentQuestion: room.currentQuestion
                    });
                } else {
                    room.isActive = false;
                    io.to(roomId).emit('game_ended', room.players);
                }
            }, 3000);
        }
    });

    socket.on('time_up', (data: { roomId: string }) => {
        const { roomId } = data;
        const room = rooms.get(roomId);
        if (!room || !room.isActive) return;

        // Handle players who didn't answer
        room.players.forEach(player => {
            if (!room.answers.has(player.id)) {
                player.streak = 0;
                room.answers.set(player.id, {
                    answer: -1,
                    timeLeft: 0,
                    points: 0
                });
            }
        });

        // Trigger question end
        const correctAnswers = Array.from(room.answers.values())
            .filter(a => a.answer === 1) // Assuming 1 is correct answer
            .length;

        io.to(roomId).emit('question_ended', {
            correctAnswer: 1, // Assuming 1 is correct answer
            stats: {
                total: room.players.length,
                correct: correctAnswers,
                percentage: (correctAnswers / room.players.length) * 100
            },
            players: room.players
        });

        // Clear answers and move to next question
        room.answers.clear();
        room.currentQuestion += 1;

        if (room.currentQuestion < 5) { // Assuming 5 questions total
            setTimeout(() => {
                const nextQuestion = {
                    id: (room.currentQuestion + 1).toString(),
                    question: `Question ${room.currentQuestion + 1}`,
                    answers: ['A', 'B', 'C', 'D'],
                    correctAnswer: 1,
                    timeLimit: 20
                };
                io.to(roomId).emit('next_question', {
                    question: nextQuestion,
                    currentQuestion: room.currentQuestion
                });
            }, 3000);
        } else {
            room.isActive = false;
            io.to(roomId).emit('game_ended', room.players);
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        // Remove player from all rooms they were in
        rooms.forEach((room, roomId) => {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                io.to(roomId).emit('player_left', socket.id);
            }
        });
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

const PORT = process.env.PORT || 5003;

httpServer.listen(PORT, () => {
    console.log(`Socket.IO server is running on port ${PORT}`);
}); 