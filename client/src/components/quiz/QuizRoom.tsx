'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Trophy, Star, Zap, Timer, Award, 
  Shield, Flame, Bolt, Gift, Crown
} from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useUser } from '@/contexts/UserContext';
import { QuizQuestion, Player, QuizRoomProps, Achievement, PowerUp, AnswerColors } from '@/interfaces/quiz/types';
import { dummyQuestions } from '@/components/dummydata/QuizQuestions';
import { ANSWER_COLORS } from '@/components/dummydata/QuizColors';
import { ACHIEVEMENTS } from '@/components/dummydata/QuizAchievements';
import { POWER_UPS } from '@/components/dummydata/QuizPowerups';


const calculatePoints = (timeLeft: number, multiplier: number) => {
    const basePoints = 1000;
    const timeBonus = Math.floor(timeLeft * 100); // More points for faster answers
    return (basePoints + timeBonus) * multiplier;
};





export const QuizRoom = ({ socket, roomId, onClose, onMinimize }: QuizRoomProps) => {
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

    useEffect(() => {
        if (socket) {
            socket.on('player_joined', (player: Player) => {
                setPlayers(prev => [...prev, player]);
                toast.success(`${player.name} joined the game!`);
            });

            socket.on('score_update', (updatedPlayers: Player[]) => {
                setPlayers(updatedPlayers);
            });

            socket.on('achievement_unlocked', (achievement: Achievement) => {
                setAchievements(prev => [...prev, achievement]);
                setRecentAchievement(achievement);
                setTimeout(() => setRecentAchievement(null), 5000);
            });

            socket.on('powerup_received', (powerUp: PowerUp) => {
                setPowerUps(prev => [...prev, powerUp]);
                setActivePowerUp(powerUp.id);
                setTimeout(() => setActivePowerUp(null), 5000);
            });

            return () => {
                socket.off('player_joined');
                socket.off('score_update');
                socket.off('achievement_unlocked');
                socket.off('powerup_received');
            };
        }
    }, [socket]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Time's up, move to next question
                        handleNextQuestion();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // Play background music when game starts
    useEffect(() => {
        if (gameState === 'playing') {
            const music = new Audio('/sounds/game-music.mp3');
            music.loop = true;
            music.volume = 0.3;
            music.play().catch(() => {});

            return () => {
                music.pause();
                music.currentTime = 0;
            };
        }
    }, [gameState]);

    const getCurrentQuestion = () => {
        if (currentQuestion >= 0 && currentQuestion < dummyQuestions.length) {
            return dummyQuestions[currentQuestion];
        }
        return null;
    };

    const startQuiz = () => {
        if (!socket) return;
        
        setIsStarting(true);
        setCountdown(3);
        
        let count = 3;
        const countdownInterval = setInterval(() => {
            count -= 1;
            if (count <= 0) {
                clearInterval(countdownInterval);
                setCountdown(null);
                setIsStarting(false);
                setIsActive(true);
                setGameState('playing');
                setTimeLeft(dummyQuestions[0].timeLimit);
                socket.emit('start_quiz', { roomId });
            } else {
                setCountdown(count);
            }
        }, 1000);
    };

    useEffect(() => {
        if (isActive && socket) {
            const question = dummyQuestions[currentQuestion];
            if (!question) return;

            const interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleNextQuestion();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isActive, currentQuestion, socket]);

    const handleNextQuestion = () => {
        if (currentQuestion < dummyQuestions.length - 1) {
            const nextQuestion = currentQuestion + 1;
            setCurrentQuestion(nextQuestion);
            setTimeLeft(dummyQuestions[nextQuestion].timeLimit);
            setSelectedAnswer(null);
            setShowAnswer(false);
            setCorrectAnswerStats(null);
        } else {
            setGameState('results');
            setIsActive(false);
        }
    };

    const handleAnswer = (answerIndex: number) => {
        const question = getCurrentQuestion();
        if (!socket || !question || selectedAnswer !== null) return;
        
        setSelectedAnswer(answerIndex);
        
        // Check if answer is correct
        const isCorrect = answerIndex === question.correctAnswer;
        
        if (isCorrect) {
            // Calculate points based on time left
            const points = calculatePoints(timeLeft, multiplier);
            
            // Show correct animation
            setShowCorrectAnimation(true);
            setTimeout(() => setShowCorrectAnimation(false), 1000);
            
            // Update streak and multiplier
            const newStreak = streak + 1;
            setStreak(newStreak);
            setMultiplier(Math.min(4, 1 + Math.floor(newStreak / 3)));
            
            // Emit answer with points
            socket.emit('quiz_answer', {
                roomId,
                questionId: question.id,
                answer: answerIndex,
                timeLeft,
                points,
                multiplier: activePowerUp === 'double_points' ? multiplier * 2 : multiplier
            });
        } else {
            // Show wrong animation
            setShowWrongAnimation(true);
            setTimeout(() => setShowWrongAnimation(false), 1000);
            
            // Reset streak and multiplier
            setStreak(0);
            setMultiplier(1);

            // Emit answer with 0 points
            socket.emit('quiz_answer', {
                roomId,
                questionId: question.id,
                answer: answerIndex,
                timeLeft,
                points: 0,
                multiplier: 1
            });
        }

        // Show correct answer after a delay
        setTimeout(() => {
            setShowAnswer(true);
            // Get stats for this question
            const totalAnswers = players.length;
            const correctAnswers = players.filter(p => 
                p.lastAnswer !== undefined && p.lastAnswer === question.correctAnswer
            ).length;
            setCorrectAnswerStats({
                total: totalAnswers,
                correct: correctAnswers,
                percentage: (correctAnswers / totalAnswers) * 100
            });
        }, 1000);

        // Move to next question after showing answer
        setTimeout(() => {
            setShowAnswer(false);
            setCorrectAnswerStats(null);
            handleNextQuestion();
        }, 3000);
    };

    const unlockAchievement = (achievementId: string) => {
        setAchievements(prev => {
            const newAchievements = [...prev];
            const achievement = newAchievements.find(a => a.id === achievementId);
            if (achievement && !achievement.unlocked) {
                achievement.unlocked = true;
                setRecentAchievement(achievement);
                // Play achievement sound
                new Audio('/sounds/achievement.mp3').play().catch(() => {});
                setTimeout(() => setRecentAchievement(null), 3000);
            }
            return newAchievements;
        });
    };

    const usePowerUp = (powerUpId: string) => {
        setPowerUps(prev => {
            const newPowerUps = [...prev];
            const powerUp = newPowerUps.find(p => p.id === powerUpId);
            if (powerUp && powerUp.available) {
                powerUp.available = false;
                setActivePowerUp(powerUpId);
                
                // Play power-up sound
                new Audio('/sounds/powerup.mp3').play().catch(() => {});

                // Handle power-up effects
                switch (powerUpId) {
                    case 'time_freeze':
                        // Pause timer for 5 seconds
                        break;
                    case '50_50':
                        // Remove two wrong answers
                        break;
                    case 'double_points':
                        // Double points handled in handleAnswer
                        break;
                }
            }
            return newPowerUps;
        });
    };

    const toggleScoreboard = () => {
        setShowScoreboard(prev => !prev);
    };

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
                    onClick={onMinimize}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                >
                    Minimize
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                >
                    Close
                </motion.button>
            </div>

            {/* Scoreboard Overlay */}
            <AnimatePresence>
                {showScoreboard && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center"
                    >
                        <div className="bg-gray-900 p-8 rounded-xl w-96">
                            <h3 className="text-2xl font-bold text-white mb-6">Leaderboard</h3>
                            <div className="space-y-4">
                                {players
                                    .sort((a, b) => b.score - a.score)
                                    .map((player, index) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                                                </span>
                                                <div>
                                                    <p className="font-bold text-white">{player.name}</p>
                                                    <p className="text-sm text-purple-400">
                                                        {player.streak} streak 🔥
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-yellow-400">
                                                {player.score}
                                            </p>
                                        </motion.div>
                                    ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Achievement Notification */}
            <AnimatePresence>
                {recentAchievement && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className="bg-yellow-500 text-black px-6 py-3 rounded-full flex items-center gap-3">
                            {recentAchievement.icon}
                            <div>
                                <p className="font-bold">{recentAchievement.name}</p>
                                <p className="text-sm">{recentAchievement.description}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Countdown Overlay */}
            <AnimatePresence>
                {countdown !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            key={countdown}
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="text-9xl font-bold text-white"
                        >
                            {countdown}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Quiz Area */}
            <div className="flex-1 p-6 bg-gradient-to-br from-purple-900 to-blue-900">
                {gameState === 'waiting' ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <h2 className="text-6xl font-bold mb-8 text-white">
                            Python Lists Quiz
                            <span className="block text-2xl mt-2 text-purple-300">
                                Get ready to play! 🎮
                            </span>
                        </h2>
                        <div className="mb-8">
                            <h3 className="text-2xl mb-4 text-purple-200">Players in Lobby</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {players.map((player) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="px-4 py-2 bg-purple-500/20 rounded-lg"
                                    >
                                        {player.name}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startQuiz}
                            className="px-8 py-4 bg-purple-500 hover:bg-purple-600 rounded-xl text-xl font-bold text-white shadow-lg"
                        >
                            Start Game
                        </motion.button>
                    </motion.div>
                ) : gameState === 'playing' ? (
                    <div>
                        {/* Game Info Bar */}
                        <div className="flex justify-between items-center mb-6">
                            {/* Timer */}
                            <div className="flex-1">
                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: '100%' }}
                                        animate={{ width: '0%' }}
                                        transition={{ duration: timeLeft, ease: 'linear' }}
                                        className="h-full bg-purple-500"
                                    />
                                </div>
                                <div className="text-center text-2xl font-bold text-white mt-2">
                                    {timeLeft}s
                                </div>
                            </div>

                            {/* Streak and Multiplier */}
                            <div className="flex items-center gap-4 mx-8">
                                <div className="flex items-center gap-2">
                                    <Flame className={`w-6 h-6 ${streak > 0 ? 'text-orange-400' : 'text-gray-400'}`} />
                                    <span className="text-2xl font-bold text-white">{streak}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className={`w-6 h-6 ${multiplier > 1 ? 'text-yellow-400' : 'text-gray-400'}`} />
                                    <span className="text-2xl font-bold text-white">x{multiplier}</span>
                                </div>
                            </div>

                            {/* Power-ups */}
                            <div className="flex gap-2">
                                {powerUps.map(powerUp => (
                                    <motion.button
                                        key={powerUp.id}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => usePowerUp(powerUp.id)}
                                        disabled={!powerUp.available}
                                        className={`p-2 rounded-lg ${
                                            powerUp.available 
                                                ? 'bg-purple-500 hover:bg-purple-600' 
                                                : 'bg-gray-700 cursor-not-allowed'
                                        }`}
                                        title={powerUp.description}
                                    >
                                        {powerUp.icon}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Question */}
                        {getCurrentQuestion() && (
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center"
                            >
                                <h2 className="text-4xl font-bold text-white mb-12 px-8">
                                    {getCurrentQuestion()?.question}
                                </h2>

                                {/* Answers */}
                                <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                                    {getCurrentQuestion()?.answers.map((answer, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleAnswer(index)}
                                            disabled={selectedAnswer !== null}
                                            className={`
                                                relative p-8 rounded-2xl text-2xl font-bold text-white shadow-lg
                                                ${ANSWER_COLORS[index].bg} ${ANSWER_COLORS[index].hover}
                                                ${selectedAnswer === index ? 'ring-8 ring-white' : ''}
                                                ${selectedAnswer !== null && selectedAnswer !== index ? 'opacity-50' : ''}
                                                ${showAnswer && index === getCurrentQuestion()?.correctAnswer ? 'ring-8 ring-green-400' : ''}
                                                transition-all duration-300
                                            `}
                                        >
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl">
                                                {ANSWER_COLORS[index].pattern}
                                            </span>
                                            {answer}
                                            
                                            {/* Answer Animations */}
                                            {selectedAnswer === index && (
                                                <>
                                                    {showCorrectAnimation && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            className="absolute inset-0 flex items-center justify-center"
                                                        >
                                                            <div className="text-8xl">✨</div>
                                                        </motion.div>
                                                    )}
                                                    {showWrongAnimation && (
                                                        <motion.div
                                                            initial={{ rotate: 0 }}
                                                            animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                                                            className="absolute inset-0 flex items-center justify-center"
                                                        >
                                                            <div className="text-8xl">❌</div>
                                                        </motion.div>
                                                    )}
                                                </>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Answer Stats */}
                                {correctAnswerStats && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 text-center"
                                    >
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {correctAnswerStats.correct} out of {correctAnswerStats.total} got it right!
                                        </h3>
                                        <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden max-w-md mx-auto">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${correctAnswerStats.percentage}%` }}
                                                className="h-full bg-green-500"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* Progress Bar */}
                        <div className="mt-8">
                            <div className="flex justify-between mb-2">
                                <span className="text-white">Progress</span>
                                <span className="text-white">{currentQuestion + 1}/{dummyQuestions.length}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentQuestion + 1) / dummyQuestions.length) * 100}%` }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
                            <div className="flex gap-4">
                                {achievements.map(achievement => (
                                    <motion.div
                                        key={achievement.id}
                                        whileHover={{ scale: 1.05 }}
                                        className={`
                                            p-3 rounded-lg ${
                                                achievement.unlocked 
                                                    ? 'bg-yellow-500/20 border-yellow-500' 
                                                    : 'bg-gray-800/50 border-gray-700'
                                            } border
                                        `}
                                        title={achievement.description}
                                    >
                                        {achievement.icon}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <h2 className="text-6xl font-bold mb-12 text-white">
                            🎉 Game Over! 🎉
                        </h2>

                        {/* Podium */}
                        <div className="flex justify-center items-end mb-16 gap-4">
                            {players
                                .sort((a, b) => b.score - a.score)
                                .slice(0, 3)
                                .map((player, index) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        transition={{ delay: index * 0.2 }}
                                        className={`
                                            ${index === 0 ? 'bg-yellow-500 h-64' : ''}
                                            ${index === 1 ? 'bg-gray-400 h-48' : ''}
                                            ${index === 2 ? 'bg-orange-500 h-32' : ''}
                                            w-48 rounded-t-lg p-4 flex flex-col items-center justify-end
                                        `}
                                    >
                                        <div className="text-4xl mb-2">
                                            {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                                        </div>
                                        <p className="font-bold text-white text-xl">{player.name}</p>
                                        <p className="text-white/90">{player.score} pts</p>
                                        <p className="text-sm text-white/80">
                                            {player.streak} max streak 🔥
                                        </p>
                                    </motion.div>
                                ))}
                        </div>

                        {/* Achievements Summary */}
                        <div className="mt-8">
                            <h3 className="text-2xl mb-4 text-purple-200">Achievements Unlocked</h3>
                            <div className="flex justify-center gap-4">
                                {achievements
                                    .filter(a => a.unlocked)
                                    .map(achievement => (
                                        <motion.div
                                            key={achievement.id}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-yellow-500/20 p-4 rounded-lg"
                                        >
                                            {achievement.icon}
                                            <p className="text-sm mt-2">{achievement.name}</p>
                                        </motion.div>
                                    ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}; 