'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion, Player, Achievement, PowerUp, QuizRoomProps } from '@/interfaces/quiz/types';
import { ACHIEVEMENTS } from '../dummydata/QuizAchievements';
import { POWER_UPS } from '../dummydata/QuizPowerups';

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
    const [isStarting, setIsStarting] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [question, setQuestion] = useState<QuizQuestion | null>(null);

    const toggleScoreboard = () => {
        setShowScoreboard(!showScoreboard);
    };

    return (
        <div className="absolute inset-0 right-[400px] flex flex-col bg-gradient-to-br from-purple-900 to-blue-900">
            {/* Header Controls */}
            <div className="flex justify-between items-center p-4 bg-black/20">
                <h1 className="text-3xl font-bold text-white">Python Lists Quiz</h1>
                <div className="flex gap-2">
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
            </div>

            {/* Main Quiz Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                {gameState === 'waiting' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-8">
                        <h2 className="text-4xl font-bold text-white">Get ready to play! 🎮</h2>
                        <div className="text-xl text-white/80">Players in Lobby</div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {/* Start game logic */}}
                            className="px-8 py-4 bg-purple-500 hover:bg-purple-600 rounded-xl text-xl font-bold text-white"
                        >
                            Start Game
                        </motion.button>
                    </div>
                )}
                {/* Other game states content... */}
            </div>
        </div>
    );
}; 