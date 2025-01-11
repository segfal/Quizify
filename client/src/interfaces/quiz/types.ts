interface QuizQuestion {
    id: number;
    question: string;
    answers: string[];
    correctAnswer: number;
    timeLimit: number;
    points: number; // Base points for the question
}

interface Player {
    id: string;
    name: string;
    score: number;
    streak: number;
    lastAnswer?: number; // Optional property for the player's last answer
}

interface QuizRoomProps {
    socket: any;
    roomId: string;
    onClose: () => void;
    onMinimize: () => void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  unlocked: boolean;
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  available: boolean;
}

interface AnswerColor {
    bg: string;
    hover: string;
    pattern: string;
}

interface AnswerColors {
    [key: number]: AnswerColor;
}

export type { QuizQuestion, Player, QuizRoomProps, Achievement, PowerUp, AnswerColor, AnswerColors };