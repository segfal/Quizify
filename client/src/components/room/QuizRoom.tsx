'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion, Player, Achievement, PowerUp } from '@/interfaces/quiz/types';

interface QuizRoomProps {
    socket: any;
    roomId: string;
    onClose: () => void;
}

export const QuizRoom = ({ socket, roomId, onClose }: QuizRoomProps) => {
    const [gameState, setGameState] = useState<'waiting' | 'playing' | 'results'>('waiting');
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
    const [powerUps, setPowerUps] = useState<PowerUp[]>(POWER_UPS);
    const [streak, setStreak] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
    const [showWrongAnimation, setShowWrongAnimation] = useState(false);
    const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
    const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [correctAnswerStats, setCorrectAnswerStats] = useState<{
        total: number;
        correct: number;
        percentage: number;
    } | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [question, setQuestion] = useState<QuizQuestion | null>(null);

    // ... rest of the state and functions ...

    return (
        <div className="flex h-full relative">
            {/* Header Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleScoreboard}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white"
                >
                    {showScoreboard ? 'Hide Scores' : 'Show Scores'}
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                >
                    Close
                </motion.button>
            </div>

            {/* Rest of the quiz UI components... */}
            
            {/* Main Quiz Area */}
            <div className="flex-1 p-6 bg-gradient-to-br from-purple-900 to-blue-900">
                {/* Existing quiz content... */}
            </div>
        </div>
    );
}; 