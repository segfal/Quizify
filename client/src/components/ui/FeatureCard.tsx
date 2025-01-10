"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FeatureCardProps } from "@/interfaces/ui/types";

const cardAnimationVariants = {
    hidden: { 
        y: 50,
        opacity: 0 
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.7,
            ease: [0.2, 0.65, 0.3, 0.9],
        }
    },
    hover: {
        y: -5,
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

export const FeatureCard = ({
    title,
    description,
    icon,
    borderColor,
    index
}: FeatureCardProps) => {
    return (
        <motion.div
            key={title}
            custom={index}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardAnimationVariants}
            className="h-full"
        >
            <Card className={cn(
                "relative h-full border rounded-[20px]",
                "bg-[#111111]/80 backdrop-blur-sm hover:bg-[#1a1a1a]/80",
                "transition-all duration-300",
                borderColor,
                "before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] before:bg-[length:14px_14px] before:opacity-50",
                "overflow-hidden",
                "shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            )}>
                <CardHeader className="relative z-10">
                    <motion.div 
                        className="text-3xl mb-4"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {icon}
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                    {/* Additional content can be added here */}
                </CardContent>
            </Card>
        </motion.div>
    );
}; 