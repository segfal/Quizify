'use client';

import { motion } from 'framer-motion';

interface DashboardButtonProps {
    title: string;
    icon: string;
    onClick: () => void;
    bgColor: string;
    hoverColor: string;
}

const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.2,
        },
    },
    tap: {
        scale: 0.95,
    },
};

const DashboardButton = ({ title, icon, onClick, bgColor, hoverColor }: DashboardButtonProps) => {
    return (
        <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={onClick}
            className={`
                ${bgColor} ${hoverColor}
                w-full p-6 rounded-lg shadow-lg
                transition-colors duration-200
                flex flex-col items-center justify-center
                space-y-4
            `}
        >
            <span className="text-4xl">{icon}</span>
            <span className="text-lg font-semibold">{title}</span>
        </motion.button>
    );
};

export default DashboardButton; 