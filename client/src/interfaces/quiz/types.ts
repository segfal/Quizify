import { ReactNode } from 'react';

export interface QuizQuestion {
    id: string;
    question: string;
    answers: string[];
    correctAnswer: number;
    timeLimit: number;
}

export interface Player {
    id: string;
    name: string;
    score: number;
    streak: number;
    lastAnswer?: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: ReactNode;
    unlocked: boolean;
}

export interface PowerUp {
    id: string;
    name: string;
    description: string;
    icon: ReactNode;
    available: boolean;
}

export interface QuizRoomProps {
    socket: any;
    roomId: string;
    onClose: () => void;
}

export interface QuizState {
    gameState: 'waiting' | 'playing' | 'results';
    currentQuestion: number;
    timeLeft: number;
    players: Player[];
    selectedAnswer: number | null;
    showScoreboard: boolean;
    streak: number;
    multiplier: number;
    showCorrectAnimation: boolean;
    showWrongAnimation: boolean;
    activePowerUp: string | null;
    recentAchievement: Achievement | null;
    countdown: number | null;
    showAnswer: boolean;
    correctAnswerStats: {
        total: number;
        correct: number;
        percentage: number;
    } | null;
    isStarting: boolean;
    isActive: boolean;
    question: QuizQuestion | null;
}

export interface QuizGameplayProps {
    socket: any;
    roomId: string;
    currentQuestion: number;
    timeLeft: number;
    players: Player[];
    selectedAnswer: number | null;
    showAnswer: boolean;
    correctAnswerStats: {
        total: number;
        correct: number;
        percentage: number;
    } | null;
    streak: number;
    multiplier: number;
    showCorrectAnimation: boolean;
    showWrongAnimation: boolean;
    activePowerUp: string | null;
    powerUps: PowerUp[];
    handleAnswer: (answerIndex: number) => void;
    usePowerUp: (powerUpId: string) => void;
    question: QuizQuestion | null;
}

export interface AnswerColors {
    [key: number]: {
        bg: string;
        hover: string;
        pattern: string;
    };
}


export interface QuizResultsProps {
    players: Player[];
    achievements: Achievement[];
}

export interface QuizScoreboardProps {
    players: Player[];
}

export interface QuizGameplayProps {
    socket: any;
    roomId: string;
    currentQuestion: number;
    timeLeft: number;
    players: Player[];
    selectedAnswer: number | null;
    showAnswer: boolean;
}