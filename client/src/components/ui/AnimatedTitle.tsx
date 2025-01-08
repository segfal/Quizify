"use client";
import { motion } from "framer-motion";

const letterAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};

const AnimatedTitle = () => {
    const title = "Quizify";
    
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            className="mb-24 text-center scale-150"
        >
            <motion.h1 
                className="text-6xl font-bold bg-gradient-to-r from-[#ff3366] via-[#8855ff] to-[#3366ff] text-transparent bg-clip-text"
            >
                {title.split("").map((char, index) => (
                    <motion.span
                        key={index}
                        variants={letterAnimation} 
                        transition={{
                            duration: 0.25, // 0.25 seconds for each letter
                            delay: index * 0.05, // 0.05 seconds delay between letters
                            ease: [0.2, 0.65, 0.3, 0.9], // Easing function for smooth animation
                        }}
                        className="inline-block"
                    >
                        {char}
                    </motion.span>
                ))}
            </motion.h1>
        </motion.div>
    );
};

export default AnimatedTitle; 