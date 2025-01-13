'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/store/slices/userSlice';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';

export const LogoutButton = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { signOut } = useSupabase();

    const handleLogout = async () => {
        try {
            // Clear Supabase session
            await signOut();
            
            // Clear Redux store
            dispatch(clearUser());
            
            // Clear any additional storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('quizify_user');
                sessionStorage.clear();
            }

            toast.success('Logged out successfully');
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Failed to log out');
        }
    };

    return (
        <motion.button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg 
                     transition-all duration-200"
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