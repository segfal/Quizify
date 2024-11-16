"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";
import { Upload, Users, Plus } from "lucide-react";
import UploadQuizModal from "../components/UploadQuizModal";
import JoinQuizModal from "../components/JoinQuizModal";

export default function Dashboard() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <div className={cn(
      "min-h-screen p-8",
      theme === "dark" ? "bg-black" : "bg-white"
    )}>
      <div className="max-w-6xl mx-auto">
        <h1 className={cn(
          "text-4xl font-bold mb-8",
          theme === "dark" ? "text-white" : "text-black"
        )}>
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={cn(
            "border backdrop-blur-sm cursor-pointer transition-all",
            theme === "dark"
              ? "border-white/20 bg-black/40 hover:bg-black/60"
              : "border-black/20 bg-white/40 hover:bg-white/60"
          )}
          onClick={() => setIsUploadModalOpen(true)}
          >
            <CardHeader className="text-center">
              <Upload className={cn(
                "w-12 h-12 mx-auto mb-4",
                theme === "dark" ? "text-white" : "text-black"
              )} />
              <CardTitle className={theme === "dark" ? "text-white" : "text-black"}>
                Upload New Quiz
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className={cn(
            "border backdrop-blur-sm cursor-pointer transition-all",
            theme === "dark"
              ? "border-white/20 bg-black/40 hover:bg-black/60"
              : "border-black/20 bg-white/40 hover:bg-white/60"
          )}
          onClick={() => setIsJoinModalOpen(true)}
          >
            <CardHeader className="text-center">
              <Users className={cn(
                "w-12 h-12 mx-auto mb-4",
                theme === "dark" ? "text-white" : "text-black"
              )} />
              <CardTitle className={theme === "dark" ? "text-white" : "text-black"}>
                Join Quiz Room
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Quizzes Section */}
        <h2 className={cn(
          "text-2xl font-bold mt-12 mb-6",
          theme === "dark" ? "text-white" : "text-black"
        )}>
          Your Recent Quizzes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* This will be populated from Supabase */}
        </div>
      </div>

      <UploadQuizModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      <JoinQuizModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
    </div>
  );
} 