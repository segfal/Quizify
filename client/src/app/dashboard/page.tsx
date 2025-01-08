'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DashboardButton from '@/components/dashboard/DashboardButton';
import { LogoutButton } from '@/components/auth/LogoutButton';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const Dashboard = () => {
    const router = useRouter();

    const dashboardButtons = [
  
        {
            title: 'Join Room',
            icon: '🚪',
            onClick: () => router.push('/dashboard/room'),
            bgColor: 'bg-purple-500',
            hoverColor: 'hover:bg-purple-600'
        },
        {
            title: 'Create Room',
            icon: '🚪',
            onClick: () => router.push('/dashboard/room'),
            bgColor: 'bg-purple-500',
            hoverColor: 'hover:bg-green-600'
        },
      
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-8"
            >
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-bold text-center mb-12"
                >
                    Welcome to Your Dashboard
                </motion.h1>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8"
                >
                    {dashboardButtons.map((button) => (
                        <DashboardButton
                            key={button.title}
                            {...button}
                        />
                    ))}
                </motion.div>

                <div className="text-center">
                    <LogoutButton />
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard; 