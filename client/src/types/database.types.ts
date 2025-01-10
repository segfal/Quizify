export type Database = {
  public: {
    Tables: {
      Users: {
        Row: {
          user_id: number
          username: string
          password: string
          email: string | null
          google_sign_in: boolean
          role: 'student' | 'admin'
        }
        Insert: {
          user_id?: number
          username: string
          password: string
          email?: string | null
          google_sign_in?: boolean
          role?: 'student' | 'admin'
        }
        Update: {
          user_id?: number
          username?: string
          password?: string
          email?: string | null
          google_sign_in?: boolean
          role?: 'student' | 'admin'
        }
      }
      Room: {
        Row: {
          room_id: number
          room_name: string
          user_id: number
          members: number
          subject: string | null
          room_code: string
          created: string
          last_active: string
        }
        Insert: {
          room_id?: number
          room_name: string
          user_id: number
          members?: number
          subject?: string | null
          room_code: string
          created?: string
          last_active?: string
        }
        Update: {
          room_id?: number
          room_name?: string
          user_id?: number
          members?: number
          subject?: string | null
          room_code?: string
          created?: string
          last_active?: string
        }
      }
      Chat: {
        Row: {
          message_id: number
          room_id: number
          user_id: number
          message_text: string
          created_at: string
          users?: {
            username: string
          }
        }
        Insert: {
          message_id?: number
          room_id: number
          user_id: number
          message_text: string
          created_at?: string
        }
        Update: {
          message_id?: number
          room_id?: number
          user_id?: number
          message_text?: string
          created_at?: string
        }
      }
    }
  }
} 