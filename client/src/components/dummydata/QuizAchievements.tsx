import { Trophy, Star, Zap, Timer, Award, Shield, Flame, Bolt, Gift, Crown } from 'lucide-react';
import { Achievement } from '@/interfaces/quiz/types';

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_win',
        name: 'First Victory',
        description: 'Win your first quiz game',
        icon: <Trophy className="w-6 h-6 text-yellow-400" />,
        unlocked: false
    },
    {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Get all answers correct in a game',
        icon: <Star className="w-6 h-6 text-yellow-400" />,
        unlocked: false
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Answer 5 questions in under 3 seconds each',
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        unlocked: false
    },
    {
        id: 'time_master',
        name: 'Time Master',
        description: 'Complete a game with more than 50% time remaining',
        icon: <Timer className="w-6 h-6 text-yellow-400" />,
        unlocked: false
    },
    {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Achieve a 10x streak multiplier',
        icon: <Flame className="w-6 h-6 text-yellow-400" />,
        unlocked: false
    }
];