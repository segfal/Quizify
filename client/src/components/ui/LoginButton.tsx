"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export const LoginButton = () => {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 z-20"
        >
            <Button 
                onClick={() => router.push('/login')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
            >
                Login
            </Button>
        </motion.div>
    );
}; 