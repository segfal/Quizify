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
            className="mb-16 text-center"
        >
            <motion.h1 
                className="text-6xl font-bold bg-gradient-to-r from-[#ff3366] via-[#8855ff] to-[#3366ff] text-transparent bg-clip-text"
            >
                {title.split("").map((char, index) => (
                    <motion.span
                        key={index}
                        variants={letterAnimation}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: [0.2, 0.65, 0.3, 0.9],
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