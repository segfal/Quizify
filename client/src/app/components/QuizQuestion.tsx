"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
  onAnswer: (answer: number) => void;
}

export default function QuizQuestion({ question, onAnswer }: QuizQuestionProps) {
  const { theme } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(20); // 20 seconds per question
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(-1); // Time's up, submit no answer
    }
  }, [timeLeft, isAnswered]);

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    onAnswer(index);
  };

  return (
    <div className="space-y-8">
      {/* Timer */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
          style={{ width: `${(timeLeft / 20) * 100}%` }}
        />
      </div>

      <Card className={cn(
        "border backdrop-blur-sm",
        theme === "dark" ? "border-white/20 bg-black/40" : "border-black/20 bg-white/40"
      )}>
        <CardHeader>
          <CardTitle className={theme === "dark" ? "text-white" : "text-black"}>
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={cn(
                  "h-24 text-lg",
                  isAnswered && index === question.correctAnswer && "bg-green-500",
                  isAnswered && selectedAnswer === index && index !== question.correctAnswer && "bg-red-500",
                  theme === "dark" ? "text-white" : "text-black"
                )}
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 