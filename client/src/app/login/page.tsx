"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { AnimatedLoginError } from "@/components/ui/AnimatedLoginError";
import { useRouter } from "next/navigation";
import { AnimatedErrorBackground } from "@/components/ui/AnimatedErrorBackground";

// Dummy users array with easy credentials
const USERS = [
    { email: "user@example.com", username: "user", password: "123" },
    { email: "test@test.com", username: "test", password: "test" },
    { email: "admin@admin.com", username: "admin", password: "admin" },
    { email: "a", username: "a", password: "a" },
    { email: "b", username: "b", password: "b" },
    { username: "password", password: "password" }, // Most obvious credential
    { username: "cool", password: "cool" },
];

export default function LoginPage() {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = USERS.find(
            (u) => (
                // Check either email or username
                (u.email === emailOrUsername || u.username === emailOrUsername) 
                && u.password === password
            )
        );

        if (user) {
            const form = e.target as HTMLFormElement;
            form.classList.add('success');
            await new Promise(resolve => setTimeout(resolve, 800));
            router.push("/success");
        } else {
            setError(true);
            const form = e.target as HTMLFormElement;
            form.classList.add('error-shake');
            
            setTimeout(() => {
                setError(false);
                form.classList.remove('error-shake');
            }, 7000);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <AnimatedBackground />
            <AnimatedErrorBackground isVisible={error} />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10"
            >
                <motion.form
                    onSubmit={handleLogin}
                    className={`
                        bg-black/50 backdrop-blur-lg p-8 rounded-2xl 
                        border border-white/10 w-[400px]
                        transition-all duration-300
                        success:border-green-500/50 success:bg-green-500/10
                    `}
                    animate={error ? { 
                        x: [0, -10, 10, -10, 10, 0],
                        transition: { duration: 0.4 }
                    } : {}}
                >
                    <h2 className="text-3xl font-bold mb-6 text-white text-center">Login</h2>
                    <div className="space-y-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Email or Username"
                                value={emailOrUsername}
                                onChange={(e) => setEmailOrUsername(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div>
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>

                        <AnimatedLoginError isVisible={error} />

                        <Button
                            type="submit"
                            className="w-full bg-white/10 hover:bg-white/20 text-white"
                        >
                            Sign In
                        </Button>

                        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-white/80 text-sm text-center font-medium">
                                Login Credentials:
                            </p>
                            <div className="mt-2 space-y-1 text-center">
                                <p className="text-emerald-400/90 text-sm">
                                    username: <span className="font-mono bg-white/5 px-2 py-0.5 rounded">a</span>{" "}
                                    password: <span className="font-mono bg-white/5 px-2 py-0.5 rounded">a</span>
                                </p>
                                <p className="text-emerald-400/90 text-sm">
                                    username: <span className="font-mono bg-white/5 px-2 py-0.5 rounded">password</span>{" "}
                                    password: <span className="font-mono bg-white/5 px-2 py-0.5 rounded">password</span>
                                </p>
                                <p className="text-white/60 text-xs italic mt-2">
                                    (Hint: The password is above)
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.form>
            </motion.div>
        </div>
    );
} 