"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/contexts/SupabaseContext";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";

// Dynamically import components that use browser APIs
const AnimatedBackground = dynamic(() => import("@/components/ui/AnimatedBackground"), {
    ssr: false,
    loading: () => <div className="fixed inset-0 -z-10 bg-black" />
});

const AnimatedLoginError = dynamic(() => import("@/components/ui/AnimatedLoginError").then(mod => ({ default: mod.AnimatedLoginError })), {
    ssr: false
});

const AnimatedErrorBackground = dynamic(() => import("@/components/ui/AnimatedErrorBackground").then(mod => ({ default: mod.AnimatedErrorBackground })), {
    ssr: false
});

export default function LoginPage() {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const router = useRouter();
    const { signIn } = useSupabase();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    // Check if user is already logged in
    useEffect(() => {
        if (user.isAuthenticated) {
            router.push("/dashboard");
        }
    }, [user.isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const { user: userData, error: loginError } = await signIn(emailOrUsername, password);

        if (loginError) {
            setError(true);
            const form = e.target as HTMLFormElement;
            form.classList.add('error-shake');
            
            setTimeout(() => {
                setError(false);
                form.classList.remove('error-shake');
            }, 7000);
            return;
        }

        if (userData) {
            // Dispatch user data to Redux
            dispatch(setUser({
                id: userData.user_id,
                username: userData.username,
                email: userData.email,
                role: userData.role || 'student'
            }));

            const form = e.target as HTMLFormElement;
            form.classList.add('success');
            await new Promise(resolve => setTimeout(resolve, 800));
            router.push("/dashboard");
        }
    };

    // If already logged in, show loading state
    if (user.isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white text-center"
                >
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p>Already logged in, redirecting...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
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
                        border border-white/10 w-[400px] mx-auto mt-20
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
                                required
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div>
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>

                        <AnimatedLoginError isVisible={error} />

                        <Button
                            type="submit"
                            className="w-full bg-white/10 hover:bg-white/20 text-white"
                        >
                            Login
                        </Button>
                    </div>
                </motion.form>
            </motion.div>
        </div>
    );
} 