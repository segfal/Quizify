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


const loginusers = [
    {
        username: "user1",
        password: "test_password",
    },
    {
        username: "user2",
        password: "test_password",
    },
    {
        username: "user3",
        password: "test_password",
    },
    {
        username: "user4",
        password: "test_password",
    },
    {
        username: "user5",
        password: "test_password",
    },
    {
        username: "user6",
        password: "test_password",
    },
    {
        username: "user7",
        password: "test_password",
    },
    {
        username: "user8",
        password: "test_password",
    },
    {
        username: "user9",
        password: "test_password",
    },
    {
        username: "user10",
        password: "test_password",
    },
    
]

const errorMessages = [
    "YO ARE YOU DEADASS RN?! THE LOGINS ARE RIGHT HERE B! 🤬",
    "NAH THIS AIN'T IT CHIEF! USE THE CORRECT LOGIN BEFORE I START WILDIN'! 😤",
    "YOU GOT ME TIGHT RN! THE CREDENTIALS ARE MAD OBVIOUS! 💢",
    "AYOO YOU BUGGIN'! THE LOGIN INFO IS DEAD RIGHT THERE! 👇",
    "ON GOD IF YOU GET THIS WRONG ONE MORE TIME... WORD TO EVERYTHING IMA CRASH OUT! ⚡",
    
   
    "NAH FR FR YOU'RE BUGGING OUT! THE LOGINS ARE DEAD RIGHT THERE! 💀",
    "YO THIS AIN'T IT CHIEF! USE THE RIGHT LOGIN OR CATCH THE FADE! 💯",
    
];

const ExampleCredentialsBox = ({ isError, errorMessage }: { isError: boolean; errorMessage: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
                opacity: 1, 
                x: 0,
                scale: isError ? [1, 1.05, 1] : 1,
            }}
            transition={{
                scale: {
                    duration: 0.3,
                    ease: "easeInOut"
                }
            }}
            className="bg-black/50 backdrop-blur-lg p-8 rounded-2xl border border-white/10 w-[300px]"
        >
            {isError ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: [0, -2, 2, -2, 0]
                    }}
                    transition={{
                        y: {
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut"
                        }
                    }}
                    className="text-[#ffff00] font-black text-2xl mb-6 text-center leading-tight
                              drop-shadow-[0_0_10px_rgba(255,255,0,0.7)]
                              animate-pulse
                              [text-shadow:_0_0_15px_rgb(255_255_0_/_80%)]
                              p-3 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/30"
                >
                    {errorMessage}
                </motion.div>
            ) : (
                <h3 className="text-2xl font-bold mb-4 text-white">Example Logins</h3>
            )}
            <div className="space-y-4">
                <div className="text-red-400 text-sm mb-4 font-semibold">
                    ⚠️ Warning: Choose wisely! Wrong credentials may lead to unexpected consequences...
                </div>
                <div className="space-y-2">
                    {loginusers.slice(0, 3).map((user, index) => (
                        <div
                            key={index}
                            className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                        >
                            <div className="text-white/80">Username: <span className="text-purple-400">{user.username}</span></div>
                            <div className="text-white/80">Password: <span className="text-purple-400">{user.password}</span></div>
                        </div>
                    ))}
                </div>
                <div className="text-white/60 text-sm mt-4">
                    * These are test accounts for demonstration purposes
                </div>
            </div>
        </motion.div>
    );
};

export default function LoginPage() {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [showCredentials, setShowCredentials] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
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
            setShowCredentials(false);
            const form = e.target as HTMLFormElement;
            form.classList.add('error-shake');
            
            // After shake animation, show angry message and credentials
            setTimeout(() => {
                setErrorMessage(errorMessages[Math.floor(Math.random() * errorMessages.length)]);
                setShowCredentials(true);
                form.classList.remove('error-shake');
            }, 1000);

            // Reset error state after delay
            setTimeout(() => {
                setError(false);
                setErrorMessage("");
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
            
            <div className="relative z-10 flex justify-center items-start gap-8 pt-20">
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
                        scale: [1, 0.98, 1],
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
                {showCredentials && (
                    <ExampleCredentialsBox isError={!!errorMessage} errorMessage={errorMessage} />
                )}
            </div>
        </div>
    );
} 