"use client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function SuccessPage() {
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
                >
                    <CheckCircle className="w-32 h-32 text-green-500" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-3xl font-bold text-white"
                >
                    Successfully Logged In!
                </motion.h1>
            </motion.div>
        </div>
    );
} 