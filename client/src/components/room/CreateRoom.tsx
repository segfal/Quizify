'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function CreateRoom() {
  const [roomName, setRoomName] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { createRoom } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const room = await createRoom(roomName, subject)
      // Redirect to the new room
      router.push(`/dashboard/room/${room.room_id}`)
    } catch (error) {
      console.error('Error creating room:', error)
      // Handle error (show message to user)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>
      <div>
        <Input
          type="text"
          placeholder="Subject (e.g., Mathematics, Physics)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-white/10 hover:bg-white/20 text-white"
      >
        {loading ? 'Creating...' : 'Create Room'}
      </Button>
    </form>
  )
} 