"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@/app/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizQuestion from "@/app/components/QuizQuestion";
import { linkedListQuiz } from "@/app/data/linkedListQuiz";

export default function QuizRoom() {
  const { theme } = useTheme();
  const params = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [participants, setParticipants] = useState<string[]>(["Demo User"]); // Demo participant
  const [scores, setScores] = useState<Record<string, number>>({ "Demo User": 0 });
  const [status, setStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');

  const startQuiz = async () => {
    setStatus('active');
  };

  const handleAnswer = (answer: number) => {
    const isCorrect = answer === linkedListQuiz.questions[currentQuestion].correctAnswer;
    const points = isCorrect ? 100 : 0;
    
    setScores(prev => ({
      ...prev,
      "Demo User": prev["Demo User"] + points
    }));

    setTimeout(() => {
      if (currentQuestion < linkedListQuiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setStatus('completed');
      }
    }, 2000); // Give time to see the correct answer
  };

  return (
    <div className={cn(
      "min-h-screen p-8",
      theme === "dark" ? "bg-black" : "bg-white"
    )}>
      <div className="max-w-6xl mx-auto">
        {status === 'waiting' && (
          <Card className={cn(
            "border backdrop-blur-sm",
            theme === "dark" ? "border-white/20 bg-black/40" : "border-black/20 bg-white/40"
          )}>
            <CardHeader>
              <CardTitle className={theme === "dark" ? "text-white" : "text-black"}>
                Linked Lists Quiz - Demo Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={theme === "dark" ? "text-white" : "text-black"}>
                  Room Code: <span className="font-bold">{linkedListQuiz.id}</span>
                </div>
                <div className="space-y-2">
                  <h3 className={theme === "dark" ? "text-white" : "text-black"}>
                    Participants:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {participants.map(participant => (
                      <div
                        key={participant}
                        className={cn(
                          "p-2 rounded-md",
                          theme === "dark" ? "bg-white/10" : "bg-black/10"
                        )}
                      >
                        {participant}
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={startQuiz}
                  className="w-full"
                >
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'active' && linkedListQuiz.questions[currentQuestion] && (
          <>
            <div className={cn(
              "text-center mb-4 text-xl",
              theme === "dark" ? "text-white" : "text-black"
            )}>
              Question {currentQuestion + 1} of {linkedListQuiz.questions.length}
            </div>
            <QuizQuestion
              question={linkedListQuiz.questions[currentQuestion]}
              onAnswer={handleAnswer}
            />
          </>
        )}

        {status === 'completed' && (
          <Card className={cn(
            "border backdrop-blur-sm",
            theme === "dark" ? "border-white/20 bg-black/40" : "border-black/20 bg-white/40"
          )}>
            <CardHeader>
              <CardTitle className={theme === "dark" ? "text-white" : "text-black"}>
                Quiz Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className={theme === "dark" ? "text-white" : "text-black"}>
                  Final Scores:
                </h3>
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([participant, score]) => (
                    <div
                      key={participant}
                      className={cn(
                        "p-4 rounded-md flex justify-between",
                        theme === "dark" ? "bg-white/10" : "bg-black/10"
                      )}
                    >
                      <span>{participant}</span>
                      <span>{score} points</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 