// Types
export interface Player {
    id: string;
    name: string;
    score: number;
    streak: number;
}

export interface Answer {
    answer: number;
    timeLeft: number;
    points: number;
}

export interface Question {
    id: string;
    question: string;
    answers: string[];
    correctAnswer: number;
    timeLimit: number;
}

export interface Room {
    players: Player[];
    currentQuestion: number;
    isActive: boolean;
    answers: Map<string, Answer>;
    mode: 'single' | 'multi';
    questions: Question[];
}

// Add chat message interface
export interface ChatMessage {
    roomId: string;
    message: string;
    userId: string;
    username: string;
    timestamp?: number;
}