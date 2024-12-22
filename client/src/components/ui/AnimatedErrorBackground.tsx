"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const errorGifs = [
    "https://media1.tenor.com/m/F8LT-PIEWScAAAAC/nerd-nerd-emoji.gif",
    "https://media1.tenor.com/m/IVh7YxGaB_4AAAAd/nerd-emoji.gif",
    "https://media1.tenor.com/m/TutlJNzBU_QAAAAd/humor-haha.gif",
    "https://media1.tenor.com/m/BbjFm-pfueUAAAAd/laughing-emoji-laughing.gif",
    "https://media.giphy.com/media/xUPGcl3ijl0vAEyIDK/giphy.gif",
    "https://media.giphy.com/media/STfLOU6iRBRunMciZv/giphy.gif",
];

const floatingEmotes = [
    "❌", "🤦‍♂️", "🫣", "😱", "🤔", "😅", "🎭", "🌟", "💫", "❓",
    "😤", "🙄", "🤪", "😖", "😫", "🫠", "🤯", "😵‍💫", "🥴"
];

// New static laughing/pointing GIFs
const staticGifs = [
    "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif", // SpongeBob laughing
    "https://media.giphy.com/media/ff0dv4KMGxjna/giphy.gif",  // Patrick laughing
    "https://media.giphy.com/media/QgejSvXmwpvnW/giphy.gif",  // Squidward laughing
];

// Pointing/mocking GIFs
const pointingGifs = [
    "https://media.giphy.com/media/3oEjHI8WJv4x6UPDB6/giphy.gif", // Pointing and laughing
    "https://media.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.gif", // Mocking
    "https://media.giphy.com/media/lszAB3TzFtRaU/giphy.gif",      // Teasing
];

// Large static emotes
const largeEmotes = ["🤣", "😂", "👆", "👇", "🫵", "😹", "🤪"];

// Generate random path points for chaotic movement
const generateChaoticPath = () => {
    const points = [];
    for (let i = 0; i < 5; i++) {
        points.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
        });
    }
    // Add final falling point below screen
    points.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 100 // Below screen
    });
    return points;
};

// Corner GIFs with positions
const cornerGifs = [
    { position: "top-4 left-4", size: "w-48 h-48" },
    { position: "top-4 right-4", size: "w-48 h-48" },
    { position: "bottom-4 left-4", size: "w-48 h-48" },
    { position: "bottom-4 right-4", size: "w-48 h-48" },
];

interface AnimatedErrorBackgroundProps {
    isVisible: boolean;
}

export const AnimatedErrorBackground = ({ isVisible }: AnimatedErrorBackgroundProps) => {
    const [randomGifs, setRandomGifs] = useState<string[]>([]);
    const [paths, setPaths] = useState<any[]>([]);
    const [isEnding, setIsEnding] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsEnding(false);
            const selectedGifs = Array.from({ length: 8 }, () => 
                errorGifs[Math.floor(Math.random() * errorGifs.length)]
            );
            setRandomGifs(selectedGifs);
            const newPaths = Array.from({ length: 8 }, generateChaoticPath);
            setPaths(newPaths);

            // Set timer for ending animation
            const timer = setTimeout(() => {
                setIsEnding(true);
            }, 7000);

            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    const fallAnimation = {
        y: window.innerHeight + 200,
        rotate: 45,
        opacity: 0,
        transition: {
            duration: 1,
            ease: [0.6, 0.05, 0.9, 0.9],
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Corner GIFs */}
                    {cornerGifs.map((corner, index) => (
                        <motion.div
                            key={`corner-${index}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: 1, 
                                scale: [0.8, 1.1, 1],
                                rotate: [-5, 5, 0]
                            }}
                            exit={fallAnimation}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.2,
                                rotate: {
                                    repeat: !isEnding ? Infinity : 0,
                                    repeatType: "reverse",
                                    duration: 2
                                }
                            }}
                            className={`fixed ${corner.position} ${corner.size} rounded-xl overflow-hidden`}
                        >
                            <div className="relative w-full h-full">
                                <img
                                    src={errorGifs[index % errorGifs.length]}
                                    alt="Reaction"
                                    className="w-full h-full object-cover rounded-xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                        </motion.div>
                    ))}

                    {/* LMFAO Image */}
                    <motion.div
                        initial={{ opacity: 0, y: -90 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={fallAnimation}
                        className="fixed top-32 right-[20%] w-72 h-auto z-20"
                    >
                        <img
                            src="./LMFAO.jpeg"
                            alt="Error Reaction"
                            className="w-full h-full object-contain rounded-xl"
                        />
                    </motion.div>

                    {/* Static Large Centered Mocking Content */}
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-10"
                        exit={fallAnimation}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="relative flex flex-col items-center gap-8"
                        >
                            {/* Large pointing emoji at the top */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ 
                                    opacity: 1, 
                                    y: [0, -10, 0],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                                className="text-[150px]"
                            >
                                🫵
                            </motion.div>

                            {/* Static laughing GIFs in a row */}
                            <div className="flex gap-4 justify-center">
                                {staticGifs.map((gif, index) => (
                                    <motion.div
                                        key={`static-${index}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.2 }}
                                        className="w-64 h-64 rounded-xl overflow-hidden"
                                    >
                                        <img
                                            src={gif}
                                            alt="Laughing reaction"
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Large emotes row */}
                            <div className="flex gap-8 justify-center">
                                {largeEmotes.map((emote, index) => (
                                    <motion.div
                                        key={`large-emote-${index}`}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ 
                                            opacity: 1, 
                                            scale: 1,
                                            rotate: [0, -10, 10, 0]
                                        }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.5,
                                            rotate: {
                                                duration: 1,
                                                repeat: Infinity,
                                                repeatType: "reverse"
                                            }
                                        }}
                                        className="text-8xl"
                                    >
                                        {emote}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pointing GIFs at the bottom */}
                            <div className="flex gap-4 justify-center mt-4">
                                {pointingGifs.map((gif, index) => (
                                    <motion.div
                                        key={`pointing-${index}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.3 }}
                                        className="w-48 h-48 rounded-xl overflow-hidden"
                                    >
                                        <img
                                            src={gif}
                                            alt="Pointing reaction"
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Intense emote shower */}
                    {Array.from({ length: 50 }).map((_, index) => {
                        const randomEmote = floatingEmotes[Math.floor(Math.random() * floatingEmotes.length)];
                        const path = generateChaoticPath();
                        
                        return (
                            <motion.div
                                key={`emote-${index}`}
                                initial={{ 
                                    opacity: 0, 
                                    scale: 0,
                                    x: path[0].x,
                                    y: path[0].y
                                }}
                                animate={{
                                    opacity: [0, 1, 1, 1, 1, 0],
                                    scale: [0.5, 1.5, 1, 1.5, 1, 0.5],
                                    x: path.map(p => p.x),
                                    y: path.map(p => p.y),
                                    rotate: [0, 360, -360, 720, 1080, 1440]
                                }}
                                exit={fallAnimation}
                                transition={{
                                    duration: 7, // Extended to 7 seconds
                                    delay: index * 0.1,
                                    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                                    y: {
                                        duration: 7, // Extended to 7 seconds
                                        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                                        ease: [0.6, 0.05, 0.9, 0.9]
                                    }
                                }}
                                className="fixed text-4xl"
                            >
                                {randomEmote}
                            </motion.div>
                        );
                    })}

                    {/* Chaotic GIF animations */}
                    {randomGifs.map((gif, index) => (
                        <motion.div
                            key={`gif-${index}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 1, 1, 1, 0],
                                scale: [0.3, 1, 0.8, 1, 0.8, 0.3],
                                x: paths[index]?.map(p => p.x) || 0,
                                y: paths[index]?.map(p => p.y) || 0,
                                rotate: [0, -15, 15, -15, 15, 45]
                            }}
                            exit={fallAnimation}
                            transition={{
                                duration: 7, // Extended to 7 seconds
                                delay: index * 0.2,
                                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                                y: {
                                    duration: 7, // Extended to 7 seconds
                                    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                                    ease: [0.6, 0.05, 0.9, 0.9]
                                }
                            }}
                            className="fixed z-0"
                        >
                            <div className="relative w-40 h-40 rounded-lg overflow-hidden gif-container">
                                <img
                                    src={gif}
                                    alt="Error reaction"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            </div>
                        </motion.div>
                    ))}

                    {/* Error flashes */}
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={`flash-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ 
                                opacity: [0, 0.2, 0],
                            }}
                            transition={{
                                duration: 0.5,
                                delay: i * 1.75, // Adjusted for 7 seconds
                                ease: "easeOut",
                                repeat: 2
                            }}
                            className="fixed inset-0 bg-red-500 pointer-events-none"
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}; 