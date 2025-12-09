export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          description: string | null
          muscle_group: string
          equipment: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null
          image_url: string | null
          video_url: string | null
          instructions: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          muscle_group: string
          equipment?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          image_url?: string | null
          video_url?: string | null
          instructions?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          muscle_group?: string
          equipment?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          image_url?: string | null
          video_url?: string | null
          instructions?: string[] | null
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          visibility: 'public' | 'private' | 'friends'
          duration_minutes: number | null
          calories_burned: number | null
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          started_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          visibility?: 'public' | 'private' | 'friends'
          duration_minutes?: number | null
          calories_burned?: number | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          started_at: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          visibility?: 'public' | 'private' | 'friends'
          duration_minutes?: number | null
          calories_burned?: number | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          sets: number
          reps: number | null
          weight: number | null
          duration_seconds: number | null
          notes: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          sets?: number
          reps?: number | null
          weight?: number | null
          duration_seconds?: number | null
          notes?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          sets?: number
          reps?: number | null
          weight?: number | null
          duration_seconds?: number | null
          notes?: string | null
          order_index?: number
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          user_id: string
          workout_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          workout_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          workout_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          workout_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      workout_shares: {
        Row: {
          workout_id: string
          shared_with_user_id: string
          created_at: string
        }
        Insert: {
          workout_id: string
          shared_with_user_id: string
          created_at?: string
        }
        Update: {
          workout_id?: string
          shared_with_user_id?: string
          created_at?: string
        }
      }
    }
  }
}
