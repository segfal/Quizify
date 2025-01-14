'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { QuizQuestion, Player, Achievement, PowerUp, QuizState, QuizRoomProps } from '@/interfaces/quiz/types';
import { ChatMessage } from '@/interfaces/chat/types';
import { dummyQuestions } from '@/components/dummydata/QuizQuestions';
import { ACHIEVEMENTS } from '@/components/dummydata/QuizAchievements';
import { POWER_UPS } from '@/components/dummydata/QuizPowerups';
import { calculatePoints } from '@/utils/quiz/calculations';
import { QuizGameplay } from './QuizGameplay';
import { QuizScoreboard } from '@/components/quiz/QuizScoreboard';
import { QuizResults } from '@/components/quiz/QuizResults';

export const QuizRoom = ({ socket, roomId, onClose }: QuizRoomProps) => {
    const authUser = useSelector((state: RootState) => state.user);
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
        question: null,
        mode: 'multi' as 'single' | 'multi'
    });

    const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
    const [powerUps, setPowerUps] = useState<PowerUp[]>(POWER_UPS);
    const [waitingTimeout, setWaitingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const processedMessageIds = useRef<Set<string>>(new Set());

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
        socket.on('game_started', (data: { question: QuizQuestion, mode: 'single' | 'multi' }) => {
            setState(prev => ({
                ...prev,
                gameState: 'playing',
                question: data.question,
                timeLeft: data.question.timeLimit,
                selectedAnswer: null,
                showAnswer: false,
                correctAnswerStats: null,
                mode: data.mode,
                isActive: true
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
            if (waitingTimeout) {
                clearTimeout(waitingTimeout);
            }
            socket.off('player_joined');
            socket.off('player_left');
            socket.off('game_started');
            socket.off('question_ended');
            socket.off('next_question');
            socket.off('game_ended');
            socket.off('answer_received');
        };
    }, [socket, waitingTimeout]);

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

    // Add countdown effect
    useEffect(() => {
        let countdownTimer: NodeJS.Timeout;
        
        if (state.countdown !== null && state.countdown > 0) {
            countdownTimer = setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    countdown: prev.countdown !== null ? prev.countdown - 1 : null
                }));
            }, 1000);
        } else if (state.countdown === 0) {
            // When countdown reaches 0, clear it and set game as active
            setState(prev => ({
                ...prev,
                countdown: null,
                isStarting: false,
                isActive: true
            }));
        }

        return () => {
            if (countdownTimer) {
                clearTimeout(countdownTimer);
            }
        };
    }, [state.countdown]);

    // Add chat socket events
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (messageData: ChatMessage) => {
            const messageId = `${messageData.timestamp}-${messageData.userId}`;
            
            if (processedMessageIds.current.has(messageId)) {
                return;
            }

            processedMessageIds.current.add(messageId);
            setMessages(prev => [...prev, messageData]);
        };

        socket.on('message', handleMessage);

        return () => {
            socket.off('message', handleMessage);
        };
    }, [socket]);

    // Auto scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startQuiz = (mode: 'single' | 'multi' = 'multi') => {
        if (!socket) return;
        
        setState(prev => ({ 
            ...prev, 
            isStarting: true, 
            countdown: 3,
            mode 
        }));

        // Join room with selected mode
        socket.emit('join_room', { 
            roomId, 
            playerName: authUser.username || 'Anonymous Player',
            mode 
        });

        if (mode === 'multi') {
            // Set a timeout to switch to single player if no one joins
            const timeout = setTimeout(() => {
                if (state.players.length <= 1) {
                    toast.info('No other players joined. Switching to single player mode...');
                    startQuiz('single');
                }
            }, 30000); // Wait 30 seconds for other players
            setWaitingTimeout(timeout);
        } else {
            socket.emit('start_quiz', { roomId });
        }
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

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socket || !messageInput.trim()) return;

        const messageData = {
            roomId,
            message: messageInput.trim(),
            userId: socket.id,
            username: authUser.username
        };

        socket.emit('message', messageData);
        setMessageInput('');
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
            <div className="flex-1 p-8 overflow-hidden flex">
                {/* Quiz Area - Takes up most of the space */}
                <div className="flex-1 mr-4">
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
                                    Choose Game Mode
                                </h2>
                                <div className="flex justify-center gap-8 mb-8">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => startQuiz('single')}
                                        className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-xl text-2xl font-bold text-white"
                                    >
                                        Play Solo
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => startQuiz('multi')}
                                        className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-2xl font-bold text-white"
                                    >
                                        Play with Others
                                    </motion.button>
                                </div>
                                {state.mode === 'multi' && state.players.length > 0 && (
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
                                        <p className="mt-4 text-gray-400">
                                            Waiting for players... 
                                            {state.players.length === 1 && "(Quiz will start in single player mode if no one joins in 30 seconds)"}
                                        </p>
                                    </div>
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
                </div>

                {/* Chat Area - Fixed width */}
                <div className="w-80 bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Chat</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={`${msg.timestamp}-${index}`}
                                    className={`flex flex-col ${
                                        msg.userId === socket?.id ? 'items-end' : 'items-start'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">
                                            {msg.username}:
                                        </span>
                                    </div>
                                    <div
                                        className={`rounded-lg px-3 py-2 max-w-[80%] break-words ${
                                            msg.userId === socket?.id
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-gray-700 text-white'
                                        }`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Overlays */}
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
    );
}; 