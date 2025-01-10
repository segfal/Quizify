'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { UserInfo } from '@/components/ui/UserInfo';
import { RootState } from '@/store/store';

// Dynamically import components that might use browser APIs
const DashboardButton = dynamic(() => import('@/components/dashboard/DashboardButton'), {
    ssr: false
});

const CreateRoom = dynamic(() => import('@/components/room/CreateRoom'), {
    ssr: false
});

const JoinRoom = dynamic(() => import('@/components/room/JoinRoom'), {
    ssr: false
});

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

export default function DashboardPage() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (!user.isAuthenticated) {
            router.push('/login');
        }
    }, [user.isAuthenticated, router]);

    // Don't render anything while checking authentication
    if (!user.isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <UserInfo />
                        <LogoutButton />
                    </div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <CreateRoom />
                    <JoinRoom />
                </motion.div>
            </div>
        </div>
    );
} 