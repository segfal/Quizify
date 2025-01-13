'use client';

import { motion } from 'framer-motion';
import { Player, Achievement } from '@/interfaces/quiz/types';

interface QuizResultsProps {
    players: Player[];
    achievements: Achievement[];
}

export function QuizResults({ players, achievements }: QuizResultsProps) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
        >
            <h2 className="text-4xl font-bold text-white mb-8">Quiz Complete! 🎉</h2>
            
            {winner && (
                <div className="mb-12">
                    <div className="text-6xl mb-4">👑</div>
                    <h3 className="text-2xl font-bold text-purple-300">Winner: {winner.name}</h3>
                    <p className="text-xl text-purple-400">Score: {winner.score}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-gray-800/50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Final Standings</h3>
                    <div className="space-y-3">
                        {sortedPlayers.map((player, index) => (
                            <motion.div
                                key={player.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg"
                            >
                                <span className="text-white">{player.name}</span>
                                <span className="text-purple-300 font-bold">{player.score}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                    <div className="space-y-3">
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={achievement.id}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg"
                            >
                                <span className="text-2xl">{achievement.icon}</span>
                                <div className="text-left">
                                    <div className="text-white font-bold">{achievement.name}</div>
                                    <div className="text-sm text-gray-400">{achievement.description}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
} 