'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface QuizQuestion {
    id: number;
    question: string;
    answers: string[];
    correctAnswer: number;
    timeLimit: number;
}

interface Player {
    id: string;
    name: string;
    score: number;
    streak: number;
}

interface QuizRoomProps {
    socket: any;
    roomId: string;
    onClose: () => void;
    onMinimize: () => void;
}

const dummyQuestions: QuizQuestion[] = [
    {
        id: 1,
        question: "Which method is used to add an element to the end of a list in Python?",
        answers: [".append()", ".add()", ".insert()", ".push()"],
        correctAnswer: 0,
        timeLimit: 4
    },
    {
        id: 2,
        question: "How do you remove the last element from a list in Python?",
        answers: [".pop()", ".remove()", ".delete()", ".splice()"],
        correctAnswer: 0,
        timeLimit: 4
    },
    {
        id: 3,
        question: "What is the correct way to create an empty list in Python?",
        answers: ["list()", "[]", "new List()", "{}"],
        correctAnswer: 1,
        timeLimit: 4
    },
    {
        id: 4,
        question: "Which method is used to sort a list in ascending order?",
        answers: [".sort()", ".order()", ".arrange()", ".organize()"],
        correctAnswer: 0,
        timeLimit: 4
    },
    {
        id: 5,
        question: "How do you find the length of a list in Python?",
        answers: ["len(list)", "list.length", "list.size()", "count(list)"],
        correctAnswer: 0,
        timeLimit: 4
    },
    {
        id: 6,
        question: "Which method is used to remove a specific item from a list?",
        answers: [".remove()", ".delete()", ".pop()", ".splice()"],
        correctAnswer: 0,
        timeLimit: 4
    },
    {
        id: 7,
        question: "How do you reverse a list in Python?",
        answers: ["list.reverse()", "reverse(list)", "list[::-1]", "Both A and C"],
        correctAnswer: 3,
        timeLimit: 4
    },
    {
        id: 8,
        question: "Which method is used to find the index of an item in a list?",
        answers: [".index()", ".find()", ".search()", ".locate()"],
        correctAnswer: 0,
        timeLimit: 4
    }
];

export const QuizRoom = ({ socket, roomId, onClose, onMinimize }: QuizRoomProps) => {
    const [gameState, setGameState] = useState<'waiting' | 'playing' | 'results'>('waiting');
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showScoreboard, setShowScoreboard] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.on('player_joined', (player: Player) => {
                setPlayers(prev => [...prev, player]);
                toast.success(`${player.name} joined the game!`);
            });

            socket.on('quiz_message', (message: { user: string; message: string }) => {
                setMessages(prev => [...prev, message]);
            });

            socket.on('score_update', (updatedPlayers: Player[]) => {
                setPlayers(updatedPlayers);
            });

            return () => {
                socket.off('player_joined');
                socket.off('quiz_message');
                socket.off('score_update');
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

    const getCurrentQuestion = () => {
        if (currentQuestion >= 0 && currentQuestion < dummyQuestions.length) {
            return dummyQuestions[currentQuestion];
        }
        return null;
    };

    const startGame = () => {
        setGameState('playing');
        setCurrentQuestion(0);
        setTimeLeft(dummyQuestions[0].timeLimit);
        socket.emit('start_game', { roomId });
    };

    const handleNextQuestion = () => {
        if (currentQuestion < dummyQuestions.length - 1) {
            const nextQuestion = currentQuestion + 1;
            setCurrentQuestion(nextQuestion);
            setTimeLeft(dummyQuestions[nextQuestion].timeLimit);
            setSelectedAnswer(null);
        } else {
            setGameState('results');
        }
    };

    const handleAnswer = (answerIndex: number) => {
        const question = getCurrentQuestion();
        if (selectedAnswer === null && question) {
            setSelectedAnswer(answerIndex);
            // Emit answer to server
            socket.emit('quiz_answer', {
                roomId,
                questionId: question.id,
                answer: answerIndex,
                timeLeft
            });
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && socket) {
            socket.emit('quiz_message', {
                roomId,
                message: {
                    user: 'Player',
                    message: newMessage.trim()
                }
            });
            setNewMessage('');
        }
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

            {/* Main Quiz Area */}
            <div className="flex-1 p-6 bg-gradient-to-br from-purple-900 to-blue-900">
                {gameState === 'waiting' ? (
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-8 text-white">Python Lists Quiz</h2>
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
                            onClick={startGame}
                            className="px-8 py-4 bg-purple-500 hover:bg-purple-600 rounded-xl text-xl font-bold text-white shadow-lg"
                        >
                            Start Game
                        </motion.button>
                    </div>
                ) : gameState === 'playing' ? (
                    <div>
                        {/* Timer */}
                        <div className="mb-6">
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

                        {/* Question */}
                        {getCurrentQuestion() && (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-4">
                                        {getCurrentQuestion()?.question}
                                    </h2>
                                </div>

                                {/* Answers */}
                                <div className="grid grid-cols-2 gap-4">
                                    {getCurrentQuestion()?.answers.map((answer, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAnswer(index)}
                                            disabled={selectedAnswer !== null}
                                            className={`
                                                p-6 rounded-xl text-xl font-bold text-white shadow-lg
                                                ${selectedAnswer === index ? 'bg-yellow-500' : ''}
                                                ${index === 0 ? 'bg-red-500' : ''}
                                                ${index === 1 ? 'bg-blue-500' : ''}
                                                ${index === 2 ? 'bg-green-500' : ''}
                                                ${index === 3 ? 'bg-purple-500' : ''}
                                                ${selectedAnswer !== null && selectedAnswer !== index ? 'opacity-50' : ''}
                                            `}
                                        >
                                            {answer}
                                        </motion.button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-8 text-white">Game Over!</h2>
                        <div className="mb-8">
                            <h3 className="text-2xl mb-4 text-purple-200">Final Scores</h3>
                            {players
                                .sort((a, b) => b.score - a.score)
                                .map((player, index) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.2 }}
                                        className="mb-4"
                                    >
                                        <p className="text-xl">
                                            {index + 1}. {player.name} - {player.score} points
                                        </p>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quiz Chat */}
            <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white">Quiz Chat</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="break-words"
                            >
                                <span className="font-semibold text-purple-400">{msg.user}:</span>
                                <p className="text-white/90">{msg.message}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg"
                        >
                            Send
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 