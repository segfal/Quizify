'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { QuizQuestion, Player, Achievement, PowerUp, QuizState, QuizRoomProps } from '@/interfaces/quiz/types';
import { dummyQuestions } from '@/components/dummydata/QuizQuestions';
import { ACHIEVEMENTS } from '@/components/dummydata/QuizAchievements';
import { POWER_UPS } from '@/components/dummydata/QuizPowerups';
import { calculatePoints } from '@/utils/quiz/calculations';
import { QuizGameplay } from './QuizGameplay';
import { QuizScoreboard } from './QuizScoreboard';
import { QuizResults } from './QuizResults';



export const QuizRoom = ({ socket, roomId, onClose }: QuizRoomProps) => {
    const [state, setState] = useState<QuizState>({
        gameState: 'waiting',
        currentQuestion: 0,
        timeLeft: 0,
        players: [],
        selectedAnswer: null,
        showScoreboard: false,
        streak: 0,
        multiplier: 1,
        showCorrectAnimation: false,
        showWrongAnimation: false,
        activePowerUp: null,
        recentAchievement: null,
        countdown: null,
        showAnswer: false,
        correctAnswerStats: null,
        isStarting: false,
        isActive: false,
        question: null
    });

    const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
    const [powerUps, setPowerUps] = useState<PowerUp[]>(POWER_UPS);

    useEffect(() => {
        if (socket) {
            socket.on('player_joined', (player: Player) => {
                setState(prev => ({ ...prev, players: [...prev.players, player] }));
                toast.success(`${player.name} joined the game!`);
            });

            socket.on('score_update', (updatedPlayers: Player[]) => {
                setState(prev => ({ ...prev, players: updatedPlayers }));
            });

            socket.on('achievement_unlocked', (achievement: Achievement) => {
                setAchievements(prev => {
                    const newAchievements = [...prev];
                    const achievementIndex = newAchievements.findIndex(a => a.id === achievement.id);
                    if (achievementIndex !== -1) {
                        newAchievements[achievementIndex] = { ...achievement };
                    }
                    return newAchievements;
                });
                setState(prev => ({ ...prev, recentAchievement: achievement }));
                setTimeout(() => setState(prev => ({ ...prev, recentAchievement: null })), 5000);
            });

            return () => {
                socket.off('player_joined');
                socket.off('score_update');
                socket.off('achievement_unlocked');
            };
        }
    }, [socket]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (state.gameState === 'playing' && state.timeLeft > 0) {
            timer = setInterval(() => {
                setState(prev => {
                    if (prev.timeLeft <= 1) {
                        handleNextQuestion();
                        return { ...prev, timeLeft: 0 };
                    }
                    return { ...prev, timeLeft: prev.timeLeft - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [state.gameState, state.timeLeft]);

    const startQuiz = () => {
        if (!socket) return;
        
        setState(prev => ({ ...prev, isStarting: true, countdown: 3 }));
        
        let count = 3;
        const countdownInterval = setInterval(() => {
            count -= 1;
            if (count <= 0) {
                clearInterval(countdownInterval);
                setState(prev => ({
                    ...prev,
                    countdown: null,
                    isStarting: false,
                    isActive: true,
                    gameState: 'playing',
                    timeLeft: dummyQuestions[0].timeLimit,
                    question: dummyQuestions[0]
                }));
                socket.emit('start_quiz', { roomId });
            } else {
                setState(prev => ({ ...prev, countdown: count }));
            }
        }, 1000);
    };

    const handleNextQuestion = () => {
        if (state.currentQuestion < dummyQuestions.length - 1) {
            const nextQuestion = state.currentQuestion + 1;
            setState(prev => ({
                ...prev,
                currentQuestion: nextQuestion,
                timeLeft: dummyQuestions[nextQuestion].timeLimit,
                selectedAnswer: null,
                showAnswer: false,
                correctAnswerStats: null,
                question: dummyQuestions[nextQuestion]
            }));
        } else {
            setState(prev => ({
                ...prev,
                gameState: 'results',
                isActive: false
            }));
        }
    };

    const handleAnswer = (answerIndex: number) => {
        if (!socket || !state.question || state.selectedAnswer !== null) return;
        
        setState(prev => ({ ...prev, selectedAnswer: answerIndex }));
        
        const isCorrect = answerIndex === state.question.correctAnswer;
        
        if (isCorrect) {
            const points = calculatePoints(state.timeLeft, state.multiplier);
            
            setState(prev => ({
                ...prev,
                showCorrectAnimation: true,
                streak: prev.streak + 1,
                multiplier: Math.min(4, 1 + Math.floor((prev.streak + 1) / 3))
            }));
            
            setTimeout(() => setState(prev => ({ ...prev, showCorrectAnimation: false })), 1000);
            
            socket.emit('quiz_answer', {
                roomId,
                questionId: state.question.id,
                answer: answerIndex,
                timeLeft: state.timeLeft,
                points,
                multiplier: state.activePowerUp === 'double_points' ? state.multiplier * 2 : state.multiplier
            });
        } else {
            setState(prev => ({
                ...prev,
                showWrongAnimation: true,
                streak: 0,
                multiplier: 1
            }));
            
            setTimeout(() => setState(prev => ({ ...prev, showWrongAnimation: false })), 1000);
            
            socket.emit('quiz_answer', {
                roomId,
                questionId: state.question.id,
                answer: answerIndex,
                timeLeft: state.timeLeft,
                points: 0,
                multiplier: 1
            });
        }

        setTimeout(() => {
            const totalAnswers = state.players.length;
            const correctAnswers = state.players.filter(p => 
                p.lastAnswer !== undefined && p.lastAnswer === state.question?.correctAnswer
            ).length;
            
            setState(prev => ({
                ...prev,
                showAnswer: true,
                correctAnswerStats: {
                    total: totalAnswers,
                    correct: correctAnswers,
                    percentage: (correctAnswers / totalAnswers) * 100
                }
            }));
        }, 1000);

        setTimeout(() => {
            setState(prev => ({
                ...prev,
                showAnswer: false,
                correctAnswerStats: null
            }));
            handleNextQuestion();
        }, 3000);
    };

    const usePowerUp = (powerUpId: string) => {
        setPowerUps(prev => {
            const newPowerUps = [...prev];
            const powerUp = newPowerUps.find(p => p.id === powerUpId);
            if (powerUp && powerUp.available) {
                powerUp.available = false;
                setState(prev => ({ ...prev, activePowerUp: powerUpId }));
                
                new Audio('/sounds/powerup.mp3').play().catch(() => {});

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
        setState(prev => ({ ...prev, showScoreboard: !prev.showScoreboard }));
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
                    {state.showScoreboard ? 'Hide Scores' : 'Show Scores'}
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
                {state.showScoreboard && (
                    <QuizScoreboard players={state.players} />
                )}
            </AnimatePresence>

            {/* Achievement Notification */}
            <AnimatePresence>
                {state.recentAchievement && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className="bg-yellow-500 text-black px-6 py-3 rounded-full flex items-center gap-3">
                            {state.recentAchievement.icon}
                            <div>
                                <p className="font-bold">{state.recentAchievement.name}</p>
                                <p className="text-sm">{state.recentAchievement.description}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Countdown Overlay */}
            <AnimatePresence>
                {state.countdown !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            key={state.countdown}
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="text-9xl font-bold text-white"
                        >
                            {state.countdown}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Quiz Area */}
            <div className="flex-1 p-6 bg-gradient-to-br from-purple-900 to-blue-900">
                {state.gameState === 'waiting' ? (
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
                                {state.players.map((player) => (
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
                ) : state.gameState === 'playing' ? (
                    <QuizGameplay
                        socket={socket}
                        roomId={roomId}
                        currentQuestion={state.currentQuestion}
                        timeLeft={state.timeLeft}
                        players={state.players}
                        selectedAnswer={state.selectedAnswer}
                        showAnswer={state.showAnswer}
                        correctAnswerStats={state.correctAnswerStats}
                        streak={state.streak}
                        multiplier={state.multiplier}
                        showCorrectAnimation={state.showCorrectAnimation}
                        showWrongAnimation={state.showWrongAnimation}
                        activePowerUp={state.activePowerUp}
                        powerUps={powerUps}
                        handleAnswer={handleAnswer}
                        usePowerUp={usePowerUp}
                        question={state.question}
                    />
                ) : (
                    <QuizResults
                        players={state.players}
                        achievements={achievements.filter(a => a.unlocked)}
                    />
                )}
            </div>
        </div>
    );
}; 