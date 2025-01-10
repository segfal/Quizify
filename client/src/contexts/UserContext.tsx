import { createContext, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface UserContextType {
    userId: string | null;
    username: string | null;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
    userId: null,
    username: null,
    isAuthenticated: false
});

export function UserProvider({ children }: { children: ReactNode }) {
    // Get user data from Redux store
    const user = useSelector((state: RootState) => state.user);

    const value = {
        userId: user.id?.toString() || null,
        username: user.username || null,
        isAuthenticated: user.isAuthenticated
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 