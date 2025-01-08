"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export const LoginButton = () => {
    const router = useRouter();
    // center of the screen
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 1 }}
            animate={{ 
                opacity: 1, 
                y: 0,
                scale: 2,
                transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                }
            }}
            whileHover={{ scale: 2.5 }}
            whileTap={{ scale: 0.95 }}
            className="flex justify-center mt-8 z-20"
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