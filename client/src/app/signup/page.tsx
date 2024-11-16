"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "../components/ThemeProvider";
import { authService } from "../services/authService";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authService.signup(email, password, name);
      if (user) {
        router.push("/login"); // Redirect to login after successful signup
      } else {
        setError("Email already exists");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      theme === "dark" ? "bg-black" : "bg-white"
    )}>
      <Card className={cn(
        "w-full max-w-md",
        theme === "dark" ? "border-white/20 bg-black/40" : "border-black/20 bg-white/40"
      )}>
        <CardHeader>
          <CardTitle className={cn(
            "text-2xl font-bold text-center",
            theme === "dark" ? "text-white" : "text-black"
          )}>
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={theme === "dark" ? "text-white" : "text-black"}>
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={theme === "dark" ? "border-white/20 bg-black/40 text-white" : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={theme === "dark" ? "text-white" : "text-black"}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={theme === "dark" ? "border-white/20 bg-black/40 text-white" : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={theme === "dark" ? "text-white" : "text-black"}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={theme === "dark" ? "border-white/20 bg-black/40 text-white" : ""}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className={theme === "dark" ? "text-white" : "text-black"}>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 