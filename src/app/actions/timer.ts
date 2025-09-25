'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TimerSession, SessionType } from '@/types/focus'

export async function createTimerSession(
  focusId: string,
  durationMinutes: number,
  sessionType: SessionType = 'work'
): Promise<TimerSession | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('timer_sessions')
    .insert({
      focus_id: focusId,
      duration_minutes: durationMinutes,
      started_at: new Date().toISOString(),
      session_type: sessionType,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating timer session:', error)
    return null
  }

  revalidatePath('/dashboard')
  return data
}

export async function completeTimerSession(
  sessionId: string,
  wasCompleted: boolean = true
): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('timer_sessions')
    .update({
      ended_at: new Date().toISOString(),
      was_completed: wasCompleted,
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error completing timer session:', error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}

export async function getTimerHistory(
  focusId?: string,
  limit: number = 10
): Promise<TimerSession[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let query = supabase
    .from('timer_sessions')
    .select(`
      *,
      focuses!inner(user_id)
    `)
    .eq('focuses.user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (focusId) {
    query = query.eq('focus_id', focusId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching timer history:', error)
    return []
  }

  return data?.map(({ focuses: _focuses, ...session }) => session) || []
}

export async function getActiveTimer(
  focusId: string
): Promise<TimerSession | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('timer_sessions')
    .select(`
      *,
      focuses!inner(user_id)
    `)
    .eq('focus_id', focusId)
    .eq('focuses.user_id', user.id)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching active timer:', error)
    return null
  }

  if (data) {
    const { focuses: _focuses, ...session } = data
    return session
  }

  return null
}

export async function cancelTimerSession(sessionId: string): Promise<boolean> {
  return completeTimerSession(sessionId, false)
}