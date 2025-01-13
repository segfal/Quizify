'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/contexts/SupabaseContext'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function JoinRoom() {
    const [roomCode, setRoomCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { joinRoom } = useSupabase()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!roomCode.trim()) {
            toast.error('Please enter a room code')
            return
        }

        setIsLoading(true)
        try {
            const room = await joinRoom(roomCode)
            toast.success('Joined room successfully!')
            router.push(`/dashboard/room/${room.room_id}`)
        } catch (error) {
            console.error('Error joining room:', error)
            toast.error('Failed to join room. Please check the room code.')
        } finally {
            setIsLoading(false)
        }
    }

    const inputVariants = {
        focus: { scale: 1.02, transition: { type: "spring", stiffness: 300 } }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <motion.input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter Room Code"
                    whileFocus="focus"
                    variants={inputVariants}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg 
                             text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                             focus:ring-purple-500/50 focus:border-transparent transition-all 
                             uppercase tracking-wider"
                    maxLength={6}
                />
                <p className="text-sm text-gray-400 text-center">
                    Room codes are 6 characters long (e.g., ABC123)
                </p>
            </div>
            <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white font-medium rounded-lg disabled:opacity-50 
                         disabled:cursor-not-allowed transition-all duration-200 
                         hover:from-purple-600 hover:to-pink-600 focus:outline-none 
                         focus:ring-2 focus:ring-purple-500/50"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Joining...
                    </span>
                ) : (
                    'Join Room'
                )}
            </motion.button>
        </form>
    )
} 