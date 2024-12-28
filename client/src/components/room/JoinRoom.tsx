'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AnimatedErrorBackground } from '@/components/ui/AnimatedErrorBackground'
import { AnimatedLoginError } from '@/components/ui/AnimatedLoginError'

export default function JoinRoom() {
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()
  const { joinRoom } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    try {
      const room = await joinRoom(roomCode.toUpperCase())
      // Add success animation
      const form = e.target as HTMLFormElement
      form.classList.add('success')
      await new Promise(resolve => setTimeout(resolve, 800))
      // Redirect to the joined room
      router.push(`/dashboard/room/${room.room_id}`)
    } catch (error: any) {
      console.error('Error joining room:', error)
      setError(true)
      const form = e.target as HTMLFormElement
      form.classList.add('error-shake')
      
      // Add error cleanup timeout
      setTimeout(() => {
        setError(false)
        form.classList.remove('error-shake')
      }, 7000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <AnimatedErrorBackground isVisible={error} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <motion.form
          onSubmit={handleSubmit}
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
          <h2 className="text-3xl font-bold mb-6 text-white text-center">Join Room</h2>
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter Room Code (e.g., ABC123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                required
                maxLength={6}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 uppercase"
              />
            </div>

            <AnimatedLoginError isVisible={error} />

            <Button
              type="submit"
              disabled={loading || roomCode.length < 6}
              className="w-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>

            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80 text-sm text-center">
                Ask your teacher or room admin for the room code.
              </p>
              <p className="text-white/60 text-xs italic mt-2 text-center">
                Room codes are 6 characters long (e.g., ABC123)
              </p>
            </div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
} 