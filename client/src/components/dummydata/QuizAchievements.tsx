import { Achievement } from "@/interfaces/quiz/types";

import { 
    Trophy, Star, Zap, Timer, Award, 
    Shield, Flame, Bolt, Gift, Crown
  } from 'lucide-react';

  const ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_correct',
      name: 'First Blood',
      description: 'Get your first correct answer',
      icon: <Trophy className="w-6 h-6 text-yellow-400" />,
      unlocked: false
    },
    {
      id: 'streak_3',
      name: 'On Fire',
      description: 'Get a streak of 3 correct answers',
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      unlocked: false
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Answer correctly in under 2 seconds',
      icon: <Bolt className="w-6 h-6 text-blue-400" />,
      unlocked: false
    }
  ];

export { ACHIEVEMENTS };