export const calculatePoints = (timeLeft: number, multiplier: number) => {
    const basePoints = 1000;
    const timeBonus = Math.floor(timeLeft * 100); // More points for faster answers
    return (basePoints + timeBonus) * multiplier;
}; 