'use client';

import { motion } from 'framer-motion';
import { CreateRoom } from '@/components/room/CreateRoom';
import { JoinRoom } from '@/components/room/JoinRoom';
import { useUser } from '@/contexts/UserContext';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
    const { username } = useUser();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { 
            y: 50,
            opacity: 0,
            scale: 0.9
        },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                mass: 0.5
            }
        }
    };

    return (
        <motion.div 
            className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Welcome Section */}
            <motion.div 
                className="text-center mb-16"
                variants={itemVariants}
            >
                <motion.div
                    className="inline-flex items-center gap-2 mb-4"
                    whileHover={{ scale: 1.05 }}
                >
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                        Welcome back, {username}!
                    </h1>
                </motion.div>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Create or join a study room to start collaborating with others. 
                    Each room comes with real-time chat, interactive quizzes, and a shared whiteboard.
                </p>
            </motion.div>

            {/* Room Actions */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16"
                variants={itemVariants}
            >
                {/* Create Room Card */}
                <motion.div 
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50
                             shadow-lg shadow-purple-500/5"
                    whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 8px 30px rgba(168, 85, 247, 0.1)",
                        transition: { duration: 0.2 }
                    }}
                >
                    <h2 className="text-xl font-semibold mb-4 text-white">Create a Room</h2>
                    <CreateRoom />
                </motion.div>

                {/* Join Room Card */}
                <motion.div 
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50
                             shadow-lg shadow-purple-500/5"
                    whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 8px 30px rgba(168, 85, 247, 0.1)",
                        transition: { duration: 0.2 }
                    }}
                >
                    <h2 className="text-xl font-semibold mb-4 text-white">Join a Room</h2>
                    <JoinRoom />
                </motion.div>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div 
                className="max-w-4xl mx-auto"
                variants={itemVariants}
            >
                <h2 className="text-2xl font-bold mb-8 text-center text-white">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Real-time Chat',
                            description: 'Communicate with other participants instantly',
                            icon: '💬'
                        },
                        {
                            title: 'Interactive Quizzes',
                            description: 'Test knowledge with engaging quizzes',
                            icon: '📝'
                        },
                        {
                            title: 'Collaborative Whiteboard',
                            description: 'Share ideas visually with others',
                            icon: '🎨'
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="p-6 rounded-xl bg-gray-800/30 border border-gray-700/50
                                     shadow-lg shadow-purple-500/5"
                            whileHover={{ 
                                scale: 1.05,
                                backgroundColor: 'rgba(31, 41, 55, 0.7)',
                                boxShadow: "0 8px 30px rgba(168, 85, 247, 0.1)",
                                transition: { duration: 0.2 }
                            }}
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                            <p className="text-gray-400 text-sm">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
} 