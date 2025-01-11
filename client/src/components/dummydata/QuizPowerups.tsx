import { PowerUp } from "@/interfaces/quiz/types";

import { 
    Timer, Shield, Star
  } from 'lucide-react';
  

const POWER_UPS: PowerUp[] = [
    {
      id: 'time_freeze',
      name: 'Time Freeze',
      description: 'Freeze the timer for 5 seconds',
      icon: <Timer className="w-6 h-6 text-blue-400" />,
      available: true
    },
    {
      id: '50_50',
      name: '50/50',
      description: 'Remove two wrong answers',
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      available: true
    },
    {
      id: 'double_points',
      name: 'Double Points',
      description: 'Double points for the next question',
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      available: true
    }
];
  
export { POWER_UPS };