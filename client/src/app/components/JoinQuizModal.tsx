"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface JoinQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinQuizModal({ isOpen, onClose }: JoinQuizModalProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [quizId, setQuizId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!quizId) return;
    setLoading(true);

    try {
      // Here you would validate the quiz ID against Supabase
      // For now, we'll just redirect to a quiz room
      router.push(`/quiz-room/${quizId}`);
      onClose();
    } catch (error) {
      console.error('Error joining quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[425px]",
        theme === "dark" ? "bg-black/90 text-white" : "bg-white text-black"
      )}>
        <DialogHeader>
          <DialogTitle>Join Quiz Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="quizId">Quiz ID</Label>
            <Input
              id="quizId"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              placeholder="Enter quiz ID"
              className={theme === "dark" ? "border-white/20 bg-black/40 text-white" : ""}
            />
          </div>
          <Button
            onClick={handleJoin}
            disabled={!quizId || loading}
            className="w-full"
          >
            {loading ? "Joining..." : "Join Quiz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 