'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/store/slices/userSlice';
import { useSupabase } from '@/contexts/SupabaseContext';

export const LogoutButton = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { signOut } = useSupabase();

    const handleLogout = async () => {
        try {
            await signOut();
            dispatch(clearUser());
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
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