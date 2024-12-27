"use client";
import { FeatureCard } from "@/components/ui/FeatureCard";
import AnimatedTitle from "@/components/ui/AnimatedTitle";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { motion } from "framer-motion";
import { LoginButton } from "@/components/ui/LoginButton";


/**
 * @brief Landing page for the application
 * @details This page is the landing page for the application
 * 
 * 
 * 
 */

// Define card data structure for easy maintenance
interface FeatureCard {
    title: string; // Title of the feature
    description: string; // Description of the feature
    icon: string; // Icon for the feature
    borderColor: string; // Border color for the feature
}

// Card data array with consistent styling
const featureCards: FeatureCard[] = [
    {
        title: "Whiteboard",
        description: "Collaborate in real-time with our interactive whiteboard",
        icon: "✏️",
        borderColor: "border-[#ff3366]",
    },
    {
        title: "Upload",
        description: "Easily upload and share your content",
        icon: "⬆️",
        borderColor: "border-[#8855ff]",
    },
    {
        title: "Quiz",
        description: "Create and take interactive quizzes",
        icon: "📝",
        borderColor: "border-[#3366ff]",
    },
];

const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const LandingPage = () => {
    return (
        <div className="relative min-h-screen">
            <AnimatedBackground />
            <LoginButton />
            
            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                <AnimatedTitle />
                <motion.div 
                    className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={containerAnimation}
                    initial="hidden"
                    animate="visible"
                >
                    {featureCards.map((card, index) => (
                        <FeatureCard
                            key={card.title}
                            {...card}
                            index={index}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;