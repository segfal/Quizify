'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = () => {
        // Simply redirect to home page since we're using dummy data
        router.push('/');
    };

    return (
        <motion.button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            Logout
        </motion.button>
    );
}; 