'use client';

import { motion } from 'framer-motion';
import { Player } from '@/interfaces/quiz/types';

interface QuizScoreboardProps {
    players: Player[];
}

export function QuizScoreboard({ players }: QuizScoreboardProps) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center"
        >
            <div className="bg-gray-800/90 p-8 rounded-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Scoreboard</h2>
                <div className="space-y-3">
                    {sortedPlayers.map((player, index) => (
                        <motion.div
                            key={player.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-purple-400">#{index + 1}</span>
                                <span className="text-white">{player.name}</span>
                            </div>
                            <span className="text-xl font-bold text-purple-300">{player.score}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
} 