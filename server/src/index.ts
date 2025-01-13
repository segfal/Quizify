import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Types
interface Player {
    id: string;
    name: string;
    score: number;
    streak: number;
}

interface Answer {
    answer: number;
    timeLeft: number;
    points: number;
}

interface Question {
    id: string;
    question: string;
    answers: string[];
    correctAnswer: number;
    timeLimit: number;
}

interface Room {
    players: Player[];
    currentQuestion: number;
    isActive: boolean;
    answers: Map<string, Answer>;
    mode: 'single' | 'multi';
    questions: Question[];
}

// Sample questions (in production, these should come from a database)
const sampleQuestions: Question[] = [
    {
        id: '1',
        question: 'What is 2 + 2?',
        answers: ['3', '4', '5', '6'],
        correctAnswer: 1,
        timeLimit: 20
    },
    {
        id: '2',
        question: 'What is the capital of France?',
        answers: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 1,
        timeLimit: 20
    },
    {
        id: '3',
        question: 'Which planet is closest to the Sun?',
        answers: ['Venus', 'Mercury', 'Mars', 'Earth'],
        correctAnswer: 1,
        timeLimit: 20
    },
    {
        id: '4',
        question: 'What is the largest mammal?',
        answers: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
        correctAnswer: 1,
        timeLimit: 20
    },
    {
        id: '5',
        question: 'Who painted the Mona Lisa?',
        answers: ['Van Gogh', 'Leonardo da Vinci', 'Picasso', 'Michelangelo'],
        correctAnswer: 1,
        timeLimit: 20
    }
];

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
const rooms = new Map<string, Room>();

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Room Events
    socket.on('join_room', (data: { roomId: string; playerName: string; mode?: 'single' | 'multi' }) => {
        const { roomId, playerName, mode = 'multi' } = data;
        socket.join(roomId);
        console.log(`User ${socket.id} (${playerName}) joined room ${roomId} in ${mode} mode`);

        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                players: [],
                currentQuestion: 0,
                isActive: false,
                answers: new Map(),
                mode: mode,
                questions: [...sampleQuestions] // Clone questions to avoid modifying the original
            });
        }

        // Add player to room
        const room = rooms.get(roomId);
        if (!room) return;

        const player: Player = {
            id: socket.id,
            name: playerName,
            score: 0,
            streak: 0
        };
        room.players.push(player);

        // Notify room of new player
        io.to(roomId).emit('player_joined', player);

        // If single player mode, start the game immediately
        if (mode === 'single' && !room.isActive) {
            startGame(roomId);
        }
    });

    socket.on('leave_room', (data: { roomId: string }) => {
        const { roomId } = data;
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);

        // Remove player from room
        const room = rooms.get(roomId);
        if (room) {
            room.players = room.players.filter((p: Player) => p.id !== socket.id);
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
        startGame(roomId);
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

        const currentQuestion = room.questions[room.currentQuestion];
        const isCorrect = answer === currentQuestion.correctAnswer;

        // Record answer
        room.answers.set(socket.id, {
            answer,
            timeLeft,
            points: isCorrect ? points * multiplier : 0
        });

        // Update player score
        const player = room.players.find((p: Player) => p.id === socket.id);
        if (player) {
            if (isCorrect) {
                player.score += points * multiplier;
                player.streak += 1;
            } else {
                player.streak = 0;
            }
        }

        // Notify all players of the answer
        io.to(roomId).emit('answer_received', {
            playerId: socket.id,
            isCorrect,
            points: isCorrect ? points * multiplier : 0,
            players: room.players
        });

        // Check if we should move to next question
        const shouldMoveNext = room.mode === 'single' || 
            (room.mode === 'multi' && room.answers.size === room.players.length);

        if (shouldMoveNext) {
            handleQuestionEnd(roomId);
        }
    });

    socket.on('time_up', (data: { roomId: string }) => {
        const { roomId } = data;
        handleQuestionEnd(roomId);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        // Remove player from all rooms they were in
        rooms.forEach((room: Room, roomId: string) => {
            const playerIndex = room.players.findIndex((p: Player) => p.id === socket.id);
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

// Helper functions
function startGame(roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.currentQuestion = 0;
    room.isActive = true;
    room.answers.clear();

    // Reset player scores and streaks
    room.players.forEach(player => {
        player.score = 0;
        player.streak = 0;
    });

    // Send first question
    io.to(roomId).emit('game_started', { 
        question: room.questions[0],
        mode: room.mode
    });
}

function handleQuestionEnd(roomId: string) {
    const room = rooms.get(roomId);
    if (!room || !room.isActive) return;

    // Handle players who didn't answer
    room.players.forEach((player: Player) => {
        if (!room.answers.has(player.id)) {
            player.streak = 0;
            room.answers.set(player.id, {
                answer: -1,
                timeLeft: 0,
                points: 0
            });
        }
    });

    const currentQuestion = room.questions[room.currentQuestion];
    const correctAnswers = Array.from(room.answers.values())
        .filter((a: Answer) => a.answer === currentQuestion.correctAnswer)
        .length;

    io.to(roomId).emit('question_ended', {
        correctAnswer: currentQuestion.correctAnswer,
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

    // After a delay, either send next question or end game
    setTimeout(() => {
        if (room.currentQuestion < room.questions.length) {
            io.to(roomId).emit('next_question', {
                question: room.questions[room.currentQuestion],
                currentQuestion: room.currentQuestion
            });
        } else {
            room.isActive = false;
            io.to(roomId).emit('game_ended', room.players);
        }
    }, 3000);
}

const PORT = process.env.PORT || 5003;

httpServer.listen(PORT, () => {
    console.log(`Socket.IO server is running on port ${PORT}`);
}); 