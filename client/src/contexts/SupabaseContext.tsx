'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'

type DBUser = Database['public']['Tables']['Users']['Row']
type DBRoom = Database['public']['Tables']['Room']['Row']
type DBChat = Database['public']['Tables']['Chat']['Row']
type DBNote = Database['public']['Tables']['Notes']['Row']

type SupabaseContextType = {
  user: DBUser | null
  loading: boolean
  signIn: (emailOrUsername: string, password: string) => Promise<{ user: DBUser | null; error: any }>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  createRoom: (roomName: string, subject: string) => Promise<DBRoom>
  joinRoom: (roomCode: string) => Promise<DBRoom>
  getRooms: () => Promise<DBRoom[]>
  sendMessage: (roomId: number, message: string) => Promise<DBChat>
  getMessages: (roomId: number, limit?: number, beforeTimestamp?: string) => Promise<DBChat[]>
  addNote: (roomId: number, filename: string, filetype: string, url: string) => Promise<DBNote>
  getNotes: (roomId: number) => Promise<DBNote[]>
  deleteNote: (noteId: number) => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Create a key for localStorage
const USER_STORAGE_KEY = 'quizify_user'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DBUser | null>(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      return storedUser ? JSON.parse(storedUser) : null
    }
    return null
  })
  const [rooms, setRooms] = useState<DBRoom[]>([])
  const [loading, setLoading] = useState(false)

  const value = {
    user,
    rooms,
    loading,
    signIn: async (emailOrUsername: string, password: string) => {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq."${emailOrUsername}",username.eq."${emailOrUsername}"`)
        .eq('password', password)
        .single()

      if (userError) {
        return { user: null, error: userError }
      }

      // Store user in state and localStorage (only in browser)
      setUser(userData)
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
      }
      return { user: userData, error: null }
    },
    signOut: async () => {
      // Clear user from state and localStorage (only in browser)
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    },
    signUp: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
    },
    resetPassword: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    },
    createRoom: async (roomName: string, subject: string) => {
      if (!user) throw new Error('Must be logged in to create a room')
      
      // Generate a random room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const { data, error } = await supabase
        .from('room')
        .insert({
          room_name: roomName,
          user_id: user.user_id,
          subject: subject,
          room_code: roomCode,
          members: 1
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: data.room_id,
          user_id: user.user_id
        })

      if (memberError) throw memberError

      return data as DBRoom
    },
    joinRoom: async (roomCode: string) => {
      if (!user) throw new Error('Must be logged in to join a room')

      // First get the room
      const { data: room, error: roomError } = await supabase
        .from('room')
        .select('*')
        .eq('room_code', roomCode)
        .single()

      if (roomError) throw roomError

      // Then add member
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.room_id,
          user_id: user.user_id
        })

      if (memberError) throw memberError

      // Update member count
      const { data: updatedRoom, error: updateError } = await supabase
        .from('room')
        .update({ members: room.members + 1 })
        .eq('room_id', room.room_id)
        .select()
        .single()

      if (updateError) throw updateError

      return updatedRoom as DBRoom
    },
    leaveRoom: async (roomId: string) => {
      const { error } = await supabase.from('rooms').delete().eq('room_id', roomId)
      if (error) throw error
    },
    getRooms: async () => {
      const { data, error } = await supabase
        .from('room')
        .select('*')
        .order('created', { ascending: false })

      if (error) throw error
      return data as DBRoom[]
    },
    sendMessage: async (roomId: number, message: string) => {
      if (!user) throw new Error('Must be logged in to send messages');

      const { data, error } = await supabase
        .from('chat')
        .insert({
          room_id: roomId,
          user_id: user.user_id,
          message_text: message
        })
        .select(`
          message_id,
          room_id,
          user_id,
          message_text,
          created_at,
          users:user_id (
            username
          )
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      return data;
    },
    getMessages: async (roomId: number, limit = 50, beforeTimestamp?: string) => {
      const query = supabase
        .from('chat')
        .select(`
          message_id,
          room_id,
          user_id,
          message_text,
          created_at,
          users:user_id (
            username
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit);

      // Add timestamp filter if provided
      if (beforeTimestamp) {
        query.lt('created_at', beforeTimestamp);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting messages:', error);
        throw error;
      }
      return data;
    },
    addNote: async (roomId: number, filename: string, filetype: string, url: string) => {
      if (!user) throw new Error('Must be logged in to add notes');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          room_id: roomId,
          user_id: user.user_id,
          filename: filename,
          filetype: filetype,
          url: url,
          upload_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    getNotes: async (roomId: number) => {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          note_id,
          room_id,
          user_id,
          filename,
          filetype,
          url,
          upload_date,
          users:user_id (
            username
          )
        `)
        .eq('room_id', roomId)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    deleteNote: async (noteId: number) => {
      if (!user) throw new Error('Must be logged in to delete notes');

      // First get the note to check ownership and get the filename
      const { data: note, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('note_id', noteId)
        .single();

      if (fetchError) throw fetchError;

      // Check if user owns the note
      if (note.user_id !== user.user_id) {
        throw new Error('You can only delete your own notes');
      }

      // Delete from storage if it's a file
      if (note.url) {
        const filename = note.url.split('/').pop();
        if (filename) {
          const { error: storageError } = await supabase.storage
            .from('pdfstore')
            .remove([filename]);
          
          if (storageError) throw storageError;
        }
      }

      // Delete the note record
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('note_id', noteId);

      if (deleteError) throw deleteError;
    }
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 