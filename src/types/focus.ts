export type EnergyLevel = 'high' | 'medium' | 'low'
export type ActionTaken = 'converted' | 'archived' | 'deleted'
export type SessionType = 'work' | 'break'

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_status: 'free' | 'pro' | 'trial'
  subscription_end_date?: string
  trial_end_date?: string
  stripe_customer_id?: string
  timezone: string
  onboarding_completed: boolean
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface NorthStar {
  id: string
  user_id: string
  title: string
  description?: string
  target_date?: string
  created_at: string
  completed_at?: string
  archived_at?: string
  display_order: number
}

export interface Focus {
  id: string
  user_id: string
  north_star_id?: string
  session_number: number
  date: string
  title: string
  description?: string
  energy_level?: EnergyLevel
  started_at: string
  completed_at?: string
  created_at: string
  north_star?: NorthStar
  checkpoints?: Checkpoint[]
}

export interface Checkpoint {
  id: string
  focus_id: string
  title: string
  display_order: number
  completed_at?: string
  created_at: string
}

export interface LaterItem {
  id: string
  user_id: string
  content: string
  date: string
  created_at: string
  processed_at?: string
  action_taken?: ActionTaken
}

export interface TimerSession {
  id: string
  focus_id: string
  duration_minutes: number
  started_at: string
  ended_at?: string
  was_completed: boolean
  session_type?: SessionType
}

export interface Streak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_focus_date?: string
  total_focuses_completed: number
  updated_at: string
}