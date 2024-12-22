"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Ghost, Frown } from "lucide-react";

// Array of playful messages
const errorMessages = [
    "LOOK AT THIS DUDE, BRO GOT THEIR PASSWORD WRONG! 🤦‍♂️",
    "LMFAO! 🤣",
    "AINT NO WAY YOU GOT YOUR PASSWORD WRONG! 🤦‍♂️",
    "YOU GOT THE PASSWORD WRONG BUDDY! 🤣",
   
];

// Array of emojis for random selection
const emojis = ["😅", "🤔", "😬", "🫣", "🎯"];

interface AnimatedLoginErrorProps {
    isVisible: boolean;
}

export const AnimatedLoginError = ({ isVisible }: AnimatedLoginErrorProps) => {
    // Get random message and emoji
    const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const icons = [AlertCircle, Ghost, Frown, X];
    const RandomIcon = icons[Math.floor(Math.random() * icons.length)];

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="relative">
                    {/* Main error message */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-sm flex items-center gap-2 mb-4"
                    >
                        <RandomIcon className="w-4 h-4" />
                        <span>{randomMessage}</span>
                    </motion.div>

                    {/* Floating emojis */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.2, 0.5],
                            y: -60,
                        }}
                        transition={{ 
                            duration: 1,
                            ease: "easeOut"
                        }}
                        className="absolute -top-2 left-1/2 text-2xl pointer-events-none"
                    >
                        {randomEmoji}
                    </motion.div>

                    {/* Particle effects */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1, 0.5],
                                    x: Math.random() * 100 - 50,
                                    y: Math.random() * -50 - 20,
                                }}
                                transition={{
                                    duration: 0.6,
                                    delay: i * 0.1,
                                    ease: "easeOut"
                                }}
                                className="absolute w-1 h-1 bg-red-400 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}; 