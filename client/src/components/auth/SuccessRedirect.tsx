'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const SuccessRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard after animation (3 seconds)
        const timeout = setTimeout(() => {
            router.push('/dashboard');
        }, 3000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                    scale: [0.5, 1.2, 1],
                    opacity: [0, 1, 1]
                }}
                transition={{
                    duration: 1,
                    times: [0, 0.5, 1],
                    ease: "easeOut"
                }}
                className="text-center text-white"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-6xl mb-4"
                >
                    ✅
                </motion.div>
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-3xl font-bold mb-4"
                >
                    Success!
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="text-lg"
                >
                    Redirecting to dashboard...
                </motion.p>
            </motion.div>
        </div>
    );
}; 