"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function SuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard after 2 seconds
        const timeout = setTimeout(() => {
            router.push('/dashboard');
        }, 2000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <AnimatedBackground />
            
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                }}
                className="relative z-10 flex flex-col items-center"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-6xl mb-4"
                >
                    ✅
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold text-white mb-4"
                >
                    Successfully Logged In!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-white/70"
                >
                    Redirecting to dashboard...
                </motion.p>
            </motion.div>
        </div>
    );
} 