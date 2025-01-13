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
import { QuizScoreboard } from '@/components/quiz/QuizScoreboard';
import { QuizResults } from '@/components/quiz/QuizResults';

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
        if (!socket) return;

        // Player events
        socket.on('player_joined', (player: Player) => {
            setState(prev => ({ ...prev, players: [...prev.players, player] }));
            toast.success(`${player.name} joined the game!`);
        });

        socket.on('player_left', (playerId: string) => {
            setState(prev => ({
                ...prev,
                players: prev.players.filter(p => p.id !== playerId)
            }));
        });

        // Game state events
        socket.on('game_started', (data: { question: QuizQuestion }) => {
            setState(prev => ({
                ...prev,
                gameState: 'playing',
                question: data.question,
                timeLeft: data.question.timeLimit,
                selectedAnswer: null,
                showAnswer: false,
                correctAnswerStats: null
            }));
        });

        socket.on('question_ended', (data: { 
            correctAnswer: number,
            stats: { total: number; correct: number; percentage: number },
            players: Player[]
        }) => {
            setState(prev => ({
                ...prev,
                showAnswer: true,
                correctAnswerStats: data.stats,
                players: data.players
            }));
        });

        socket.on('next_question', (data: { 
            question: QuizQuestion,
            currentQuestion: number 
        }) => {
            setState(prev => ({
                ...prev,
                currentQuestion: data.currentQuestion,
                question: data.question,
                timeLeft: data.question.timeLimit,
                selectedAnswer: null,
                showAnswer: false,
                correctAnswerStats: null
            }));
        });

        socket.on('game_ended', (finalPlayers: Player[]) => {
            setState(prev => ({
                ...prev,
                gameState: 'results',
                players: finalPlayers,
                isActive: false
            }));
        });

        socket.on('answer_received', (data: {
            playerId: string,
            isCorrect: boolean,
            points: number,
            players: Player[]
        }) => {
            setState(prev => ({
                ...prev,
                players: data.players
            }));
        });

        return () => {
            socket.off('player_joined');
            socket.off('player_left');
            socket.off('game_started');
            socket.off('question_ended');
            socket.off('next_question');
            socket.off('game_ended');
            socket.off('answer_received');
        };
    }, [socket]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (state.gameState === 'playing' && state.timeLeft > 0) {
            timer = setInterval(() => {
                setState(prev => {
                    if (prev.timeLeft <= 1) {
                        if (socket) {
                            socket.emit('time_up', { roomId });
                        }
                        return { ...prev, timeLeft: 0 };
                    }
                    return { ...prev, timeLeft: prev.timeLeft - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [state.gameState, state.timeLeft, socket, roomId]);

    const startQuiz = () => {
        if (!socket) return;
        
        setState(prev => ({ ...prev, isStarting: true, countdown: 3 }));
        socket.emit('start_quiz', { roomId });
    };

    const handleAnswer = (answerIndex: number) => {
        if (!socket || !state.question || state.selectedAnswer !== null || !state.isActive) return;
        
        setState(prev => ({ ...prev, selectedAnswer: answerIndex }));
        
        const isCorrect = answerIndex === state.question.correctAnswer;
        const points = calculatePoints(state.timeLeft, state.multiplier);
        
        if (isCorrect) {
            setState(prev => ({
                ...prev,
                showCorrectAnimation: true,
                streak: prev.streak + 1,
                multiplier: Math.min(4, 1 + Math.floor((prev.streak + 1) / 3))
            }));
            
            setTimeout(() => setState(prev => ({ ...prev, showCorrectAnimation: false })), 1000);
        } else {
            setState(prev => ({
                ...prev,
                showWrongAnimation: true,
                streak: 0,
                multiplier: 1
            }));
            
            setTimeout(() => setState(prev => ({ ...prev, showWrongAnimation: false })), 1000);
        }

        socket.emit('submit_answer', {
            roomId,
            questionId: state.question.id,
            answer: answerIndex,
            timeLeft: state.timeLeft,
            points: isCorrect ? points : 0,
            multiplier: state.activePowerUp === 'double_points' ? state.multiplier * 2 : state.multiplier
        });
    };

    const usePowerUp = (powerUpId: string) => {
        if (!socket || !state.isActive) return;

        setPowerUps(prev => {
            const newPowerUps = [...prev];
            const powerUp = newPowerUps.find(p => p.id === powerUpId);
            if (powerUp && powerUp.available) {
                powerUp.available = false;
                setState(prev => ({ ...prev, activePowerUp: powerUpId }));
                
                socket.emit('use_power_up', {
                    roomId,
                    powerUpId,
                    questionId: state.question?.id
                });

                new Audio('/sounds/powerup.mp3').play().catch(() => {});
            }
            return newPowerUps;
        });
    };

    const toggleScoreboard = () => {
        setState(prev => ({ ...prev, showScoreboard: !prev.showScoreboard }));
    };

    return (
        <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-purple-900 to-blue-900">
            {/* Header Controls */}
            <div className="flex justify-between items-center p-4 bg-black/20">
                <h1 className="text-3xl font-bold text-white">Quiz Room: {roomId}</h1>
                <div className="flex gap-2">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleScoreboard}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white"
                    >
                        Scoreboard
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                    >
                        Leave
                    </motion.button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-hidden">
                <AnimatePresence mode="wait">
                    {state.gameState === 'waiting' && (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <h2 className="text-4xl font-bold text-white mb-8">
                                Waiting for players...
                            </h2>
                            {state.players.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        Players ({state.players.length})
                                    </h3>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {state.players.map(player => (
                                            <div
                                                key={player.id}
                                                className="px-4 py-2 bg-white/10 rounded-lg text-white"
                                            >
                                                {player.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {state.players.length >= 2 && !state.isStarting && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startQuiz}
                                    className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-xl text-2xl font-bold text-white"
                                >
                                    Start Quiz
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {state.gameState === 'playing' && state.question && (
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
                    )}

                    {state.gameState === 'results' && (
                        <QuizResults
                            players={state.players}
                            achievements={achievements}
                        />
                    )}
                </AnimatePresence>

                {/* Scoreboard Overlay */}
                <AnimatePresence>
                    {state.showScoreboard && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/50"
                            onClick={toggleScoreboard}
                        >
                            <div
                                className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-auto"
                                onClick={e => e.stopPropagation()}
                            >
                                <QuizScoreboard players={state.players} />
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
                            className="absolute inset-0 flex items-center justify-center bg-black/50"
                        >
                            <div className="text-9xl font-bold text-white">
                                {state.countdown}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}; 