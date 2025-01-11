import { AnswerColors } from "@/interfaces/quiz/types";

const ANSWER_COLORS: AnswerColors = {
    0: { bg: 'bg-red-500', hover: 'hover:bg-red-600', pattern: '🔺' },
    1: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', pattern: '⬜' },
    2: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', pattern: '⭐' },
    3: { bg: 'bg-green-500', hover: 'hover:bg-green-600', pattern: '●' }
};


export { ANSWER_COLORS };