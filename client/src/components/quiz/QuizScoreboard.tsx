import { motion } from 'framer-motion';
import { Player } from '@/interfaces/quiz/types';
import { QuizScoreboardProps } from '@/interfaces/quiz/types';


export function QuizScoreboard({ players }: QuizScoreboardProps) {
    return (
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
    );
} 