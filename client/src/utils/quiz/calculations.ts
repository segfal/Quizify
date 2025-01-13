/**
 * Calculates points for a correct answer based on response time and streak multiplier
 * Similar to Kahoot's scoring system:
 * - Base points: 1000
 * - Time bonus: Up to 2000 points based on how quickly you answer
 * - Streak bonus: Multiplier increases with consecutive correct answers
 */
export const calculatePoints = (timeLeft: number, multiplier: number, totalTime: number = 20) => {
    const basePoints = 1000;
    const maxTimeBonus = 2000;
    
    // Calculate time bonus (more points for faster answers)
    // timeLeft/totalTime gives us a percentage of time remaining
    const timePercentage = timeLeft / totalTime;
    const timeBonus = Math.floor(maxTimeBonus * timePercentage);
    
    // Apply multiplier to total points
    const totalPoints = Math.floor((basePoints + timeBonus) * multiplier);
    
    return totalPoints;
};

/**
 * Calculates the answer streak multiplier
 * - Streak of 2: 2x multiplier
 * - Streak of 3: 3x multiplier
 * - Streak of 4+: 4x multiplier (max)
 */
export const calculateMultiplier = (streak: number): number => {
    return Math.min(4, 1 + Math.floor(streak / 2));
};

/**
 * Formats points for display
 * Examples: 1000 -> "1,000", 1000000 -> "1M"
 */
export const formatPoints = (points: number): string => {
    if (points >= 1000000) {
        return `${(points / 1000000).toFixed(1)}M`;
    }
    if (points >= 1000) {
        return points.toLocaleString();
    }
    return points.toString();
}; 