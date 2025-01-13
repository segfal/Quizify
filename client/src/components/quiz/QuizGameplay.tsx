import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Flame, Zap } from 'lucide-react';
import { QuizQuestion, Player, Achievement, PowerUp } from '@/interfaces/quiz/types';
import { ANSWER_COLORS } from '@/components/dummydata/QuizColors';
import { calculatePoints } from '@/utils/quiz/calculations';
import { QuizGameplayProps } from '@/interfaces/quiz/types';


export function QuizGameplay({
    socket,
    roomId,
    currentQuestion,
    timeLeft,
    players,
    selectedAnswer,
    showAnswer,
    correctAnswerStats,
    streak,
    multiplier,
    showCorrectAnimation,
    showWrongAnimation,
    activePowerUp,
    powerUps,
    handleAnswer,
    usePowerUp,
    question
}: QuizGameplayProps) {
    return (
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
            {question && (
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center"
                >
                    <h2 className="text-4xl font-bold text-white mb-12 px-8">
                        {question.question}
                    </h2>

                    {/* Answers */}
                    <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {question.answers.map((answer, index) => (
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
                                    ${showAnswer && index === question.correctAnswer ? 'ring-8 ring-green-400' : ''}
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
                    <span className="text-white">{currentQuestion + 1}/10</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
                        className="h-full bg-green-500"
                    />
                </div>
            </div>
        </div>
    );
}
