import { supabase } from './client'
import { Database } from '@/types/database.types'

// Type definitions
type User = Database['public']['Tables']['Users']['Row']
type Room = Database['public']['Tables']['Room']['Row']
type Note = Database['public']['Tables']['Notes']['Row']
type RoomFile = Database['public']['Tables']['Room_Files']['Row']
type RoomMember = Database['public']['Tables']['Room_Members']['Row']
type Quiz = Database['public']['Tables']['Quiz']['Row']
type QuizQuestion = Database['public']['Tables']['Quiz_Questions']['Row']
type Whiteboard = Database['public']['Tables']['Whiteboard']['Row']

export const db = {
  // User operations
  users: {
    async getById(userId: number) {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data as User
    },

    async login(username: string, password: string) {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (error) throw error
      return data as User
    },

    async create(username: string, password: string, email?: string) {
      const { data, error } = await supabase
        .from('Users')
        .insert({ username, password, email })
        .select()
        .single()

      if (error) throw error
      return data as User
    }
  },

  // Room operations
  rooms: {
    async getAll() {
      const { data, error } = await supabase
        .from('Room')
        .select('*')
        .order('created', { ascending: false })

      if (error) throw error
      return data as Room[]
    },

    async getByUser(userId: number) {
      const { data, error } = await supabase
        .from('Room')
        .select('*')
        .eq('user_id', userId)
        .order('created', { ascending: false })

      if (error) throw error
      return data as Room[]
    },

    async create(roomData: Database['public']['Tables']['Room']['Insert']) {
      const { data, error } = await supabase
        .from('Room')
        .insert(roomData)
        .select()
        .single()

      if (error) throw error
      return data as Room
    },

    async joinRoom(roomCode: string, userId: number) {
      // First get the room
      const { data: room, error: roomError } = await supabase
        .from('Room')
        .select('*')
        .eq('room_code', roomCode)
        .single()

      if (roomError) throw roomError

      // Then add member
      const { error: memberError } = await supabase
        .from('Room_Members')
        .insert({ room_id: room.room_id, user_id: userId })

      if (memberError) throw memberError

      // Update member count
      const { error: updateError } = await supabase
        .from('Room')
        .update({ members: room.members + 1 })
        .eq('room_id', room.room_id)

      if (updateError) throw updateError

      return room as Room
    }
  },

  // Notes operations
  notes: {
    async getByRoom(roomId: number) {
      const { data, error } = await supabase
        .from('Notes')
        .select('*')
        .eq('room_id', roomId)
        .order('upload_date', { ascending: false })

      if (error) throw error
      return data as Note[]
    },

    async create(noteData: Database['public']['Tables']['Notes']['Insert']) {
      const { data, error } = await supabase
        .from('Notes')
        .insert(noteData)
        .select()
        .single()

      if (error) throw error
      return data as Note
    }
  },

  // Quiz operations
  quiz: {
    async create(quizData: Database['public']['Tables']['Quiz']['Insert']) {
      const { data, error } = await supabase
        .from('Quiz')
        .insert(quizData)
        .select()
        .single()

      if (error) throw error
      return data as Quiz
    },

    async getByRoom(roomId: number) {
      const { data, error } = await supabase
        .from('Quiz')
        .select(`
          *,
          Quiz_Questions(*)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async addQuestion(questionData: Database['public']['Tables']['Quiz_Questions']['Insert']) {
      const { data, error } = await supabase
        .from('Quiz_Questions')
        .insert(questionData)
        .select()
        .single()

      if (error) throw error
      return data as QuizQuestion
    }
  },

  // Whiteboard operations
  whiteboard: {
    async getOrCreate(roomId: number, userId: number) {
      // Try to get existing whiteboard
      const { data: existing, error: fetchError } = await supabase
        .from('Whiteboard')
        .select('*')
        .eq('room_id', roomId)
        .single()

      if (existing) return existing as Whiteboard

      // Create new if doesn't exist
      const { data: created, error: createError } = await supabase
        .from('Whiteboard')
        .insert({ room_id: roomId, created_by: userId })
        .select()
        .single()

      if (createError) throw createError
      return created as Whiteboard
    },

    async update(boardId: number) {
      const { data, error } = await supabase
        .from('Whiteboard')
        .update({ last_updated: new Date().toISOString() })
        .eq('board_id', boardId)
        .select()
        .single()

      if (error) throw error
      return data as Whiteboard
    }
  }
} 