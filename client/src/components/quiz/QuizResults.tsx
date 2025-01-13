import { motion } from 'framer-motion';
import { Player, Achievement, QuizResultsProps } from '@/interfaces/quiz/types';



export function QuizResults({ players, achievements }: QuizResultsProps) {
    return (
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
                    {achievements.map(achievement => (
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
    );
} 