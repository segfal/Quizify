'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function WhiteboardPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <AnimatedBackground />
            
            <div className="relative z-10 flex flex-col items-center gap-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="text-8xl"
                >
                    🎨
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-white text-center"
                >
                    Whiteboard Under Construction
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/70 text-center max-w-md"
                >
                    We're working hard to bring you an amazing collaborative whiteboard experience. Stay tuned!
                </motion.p>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Back to Dashboard
                </motion.button>
            </div>
        </div>
    );
} 