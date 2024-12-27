export interface Database {
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
          subject?: string
          room_code: string
          created?: string
          last_active?: string
        }
        Update: {
          room_id?: number
          room_name?: string
          user_id?: number
          members?: number
          subject?: string
          room_code?: string
          created?: string
          last_active?: string
        }
      }
      Notes: {
        Row: {
          note_id: number
          room_id: number
          user_id: number
          topic: string | null
          filetype: string | null
          filename: string
          upload_date: string
        }
        Insert: {
          note_id?: number
          room_id: number
          user_id: number
          topic?: string
          filetype?: string
          filename: string
          upload_date?: string
        }
        Update: {
          note_id?: number
          room_id?: number
          user_id?: number
          topic?: string
          filetype?: string
          filename?: string
          upload_date?: string
        }
      }
      Room_Files: {
        Row: {
          file_id: number
          room_id: number
          user_id: number
          filename: string
        }
        Insert: {
          file_id?: number
          room_id: number
          user_id: number
          filename: string
        }
        Update: {
          file_id?: number
          room_id?: number
          user_id?: number
          filename?: string
        }
      }
      Room_Members: {
        Row: {
          id: number
          room_id: number
          user_id: number
          joined_at: string
        }
        Insert: {
          id?: number
          room_id: number
          user_id: number
          joined_at?: string
        }
        Update: {
          id?: number
          room_id?: number
          user_id?: number
          joined_at?: string
        }
      }
      Quiz: {
        Row: {
          quiz_id: number
          room_id: number
          created_by: number
          topic: string | null
          created_at: string
        }
        Insert: {
          quiz_id?: number
          room_id: number
          created_by: number
          topic?: string
          created_at?: string
        }
        Update: {
          quiz_id?: number
          room_id?: number
          created_by?: number
          topic?: string
          created_at?: string
        }
      }
      Quiz_Questions: {
        Row: {
          question_id: number
          quiz_id: number
          question_text: string
          correct_answer: string
          created_at: string
        }
        Insert: {
          question_id?: number
          quiz_id: number
          question_text: string
          correct_answer: string
          created_at?: string
        }
        Update: {
          question_id?: number
          quiz_id?: number
          question_text?: string
          correct_answer?: string
          created_at?: string
        }
      }
      Whiteboard: {
        Row: {
          board_id: number
          room_id: number
          created_by: number
          created_at: string
          last_updated: string
        }
        Insert: {
          board_id?: number
          room_id: number
          created_by: number
          created_at?: string
          last_updated?: string
        }
        Update: {
          board_id?: number
          room_id?: number
          created_by?: number
          created_at?: string
          last_updated?: string
        }
      }
    }
  }
} 