import { Clock, Scissors, Star } from 'lucide-react';
import { PowerUp } from '@/interfaces/quiz/types';

export const POWER_UPS: PowerUp[] = [
    {
        id: 'time_freeze',
        name: 'Time Freeze',
        description: 'Pause the timer for 5 seconds',
        icon: <Clock className="w-6 h-6 text-blue-400" />,
        available: true
    },
    {
        id: '50_50',
        name: '50/50',
        description: 'Remove two wrong answers',
        icon: <Scissors className="w-6 h-6 text-purple-400" />,
        available: true
    },
    {
        id: 'double_points',
        name: 'Double Points',
        description: 'Double points for the next correct answer',
        icon: <Star className="w-6 h-6 text-yellow-400" />,
        available: true
    }
];