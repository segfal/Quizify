"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Upload, BookOpen, Brain } from "lucide-react";
import Marquee from "./Marquee";
import Link from "next/link";

const LandingPage = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={cn(
            "min-h-screen",
            theme === "dark" ? "bg-black" : "bg-white"
        )}>
            <Marquee />
            
            <div className="flex justify-center mt-4">
                <Button 
                    variant={theme === "dark" ? "outline" : "default"}
                    size="lg"
                    className={cn(
                        "flex items-center gap-2 text-lg",
                        theme === "dark" 
                            ? "border-white/20 text-white hover:bg-white/10" 
                            : "bg-black text-white hover:bg-black/90"
                    )}
                    onClick={toggleTheme}
                >
                    {theme === "light" ? (
                        <>
                            <Moon className="h-6 w-6" /> Dark Mode
                        </>
                    ) : (
                        <>
                            <Sun className="h-6 w-6" /> Light Mode
                        </>
                    )}
                </Button>
            </div>

            <div className="max-w-6xl mx-auto p-8">
                <Card className={cn(
                    "mt-12 border backdrop-blur-sm",
                    theme === "dark" 
                        ? "border-white/20 bg-black/40" 
                        : "border-black/20 bg-white/40"
                )}>
                    <CardHeader className="text-center">
                        <CardTitle className={cn(
                            "text-5xl font-bold",
                            theme === "dark"
                                ? "bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-500 animate-pulse"
                                : "text-black"
                        )}>
                            QuizAI Assistant
                        </CardTitle>
                        <CardDescription className={cn(
                            "text-xl mt-2",
                            theme === "dark" ? "text-white/90" : "text-black/70"
                        )}>
                            Transform your study materials into interactive quizzes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Upload,
                                    title: "Upload Materials",
                                    description: "Upload your study materials, PDFs, or notes"
                                },
                                {
                                    icon: Brain,
                                    title: "AI Generation",
                                    description: "Our AI creates personalized quiz questions"
                                },
                                {
                                    icon: BookOpen,
                                    title: "Practice & Learn",
                                    description: "Test your knowledge and track progress"
                                }
                            ].map((item, index) => (
                                <Card key={index} className={cn(
                                    "border backdrop-blur-sm transition-all",
                                    theme === "dark"
                                        ? "border-white/20 bg-black/40 hover:bg-black/60"
                                        : "border-black/20 bg-white/40 hover:bg-white/60"
                                )}>
                                    <CardHeader>
                                        <item.icon className={cn(
                                            "w-12 h-12 mb-4",
                                            theme === "dark" ? "text-white" : "text-black"
                                        )} />
                                        <CardTitle className={theme === "dark" ? "text-white" : "text-black"}>
                                            {item.title}
                                        </CardTitle>
                                        <CardDescription className={theme === "dark" ? "text-white/70" : "text-black/70"}>
                                            {item.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <Link href="/login">
                                <Button 
                                    size="lg" 
                                    className={cn(
                                        "mr-4",
                                        theme === "dark"
                                            ? "bg-white text-black hover:bg-white/90"
                                            : "bg-black text-white hover:bg-black/90"
                                    )}
                                >
                                    Get Started
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    className={cn(
                                        theme === "dark"
                                            ? "border-white text-white hover:bg-white/10"
                                            : "border-black text-black hover:bg-black/10"
                                    )}
                                >
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LandingPage;