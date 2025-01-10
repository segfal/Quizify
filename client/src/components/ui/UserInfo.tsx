import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { User } from 'lucide-react';

export function UserInfo() {
    const user = useSelector((state: RootState) => state.user);

    if (!user.isAuthenticated) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg">
                <User className="w-4 h-4" />
                <span>Not logged in</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-500 rounded-lg">
            <User className="w-4 h-4" />
            <span>Logged in as: <strong>{user.username}</strong></span>
            {user.role && <span className="text-xs bg-purple-500/20 px-2 py-1 rounded">{user.role}</span>}
        </div>
    );
} 