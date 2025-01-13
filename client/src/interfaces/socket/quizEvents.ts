import { QuizQuestion, Player } from '../quiz/types';

// Server -> Client Events
export interface ServerToClientEvents {
    // Player Events
    player_joined: (player: Player) => void;
    player_left: (playerId: string) => void;
    
    // Game State Events
    game_started: (data: { question: QuizQuestion }) => void;
    question_ended: (data: {
        correctAnswer: number;
        stats: {
            total: number;
            correct: number;
            percentage: number;
        };
        players: Player[];
    }) => void;
    next_question: (data: {
        question: QuizQuestion;
        currentQuestion: number;
    }) => void;
    game_ended: (finalPlayers: Player[]) => void;
    
    // Answer Events
    answer_received: (data: {
        playerId: string;
        isCorrect: boolean;
        points: number;
        players: Player[];
    }) => void;
    
    // Power-up Events
    power_up_activated: (data: {
        playerId: string;
        powerUpId: string;
        effect: string;
    }) => void;
}

// Client -> Server Events
export interface ClientToServerEvents {
    // Room Events
    join_room: (data: { roomId: string; playerName: string }) => void;
    leave_room: (data: { roomId: string }) => void;
    
    // Game Control Events
    start_quiz: (data: { roomId: string }) => void;
    time_up: (data: { roomId: string }) => void;
    
    // Player Actions
    submit_answer: (data: {
        roomId: string;
        questionId: string;
        answer: number;
        timeLeft: number;
        points: number;
        multiplier: number;
    }) => void;
    
    use_power_up: (data: {
        roomId: string;
        powerUpId: string;
        questionId: string;
    }) => void;
}

// Inter-Server Events (for handling room state)
export interface InterServerEvents {
    ping: () => void;
}

// Socket Data (for additional socket.data properties)
export interface SocketData {
    playerId: string;
    playerName: string;
    roomId?: string;
} 