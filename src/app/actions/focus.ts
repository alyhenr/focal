'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EnergyLevel } from '@/types/focus'

export async function createFocusSession(data: {
  title: string
  description?: string
  energy_level?: EnergyLevel
  north_star_id?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get today's date and check existing sessions
  const today = new Date().toISOString().split('T')[0]

  // Get the highest session number for today
  const { data: existingSessions } = await supabase
    .from('focuses')
    .select('session_number')
    .eq('user_id', user.id)
    .eq('date', today)
    .order('session_number', { ascending: false })
    .limit(1)

  const sessionNumber = existingSessions && existingSessions[0]
    ? existingSessions[0].session_number + 1
    : 1

  // Create the new focus session
  const { data: newFocus, error } = await supabase
    .from('focuses')
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description,
      energy_level: data.energy_level,
      north_star_id: data.north_star_id,
      session_number: sessionNumber,
      date: today,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create focus session: ' + error.message)
  }

  revalidatePath('/dashboard')
  return newFocus
}

export async function updateFocusSession(
  focusId: string,
  data: {
    title?: string
    description?: string
    energy_level?: EnergyLevel
    north_star_id?: string
  }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('focuses')
    .update(data)
    .eq('id', focusId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to update focus session: ' + error.message)
  }

  revalidatePath('/dashboard')
}

export async function completeFocusSession(focusId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('focuses')
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq('id', focusId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to complete focus session: ' + error.message)
  }

  // Update streak data
  await updateUserStreak(user.id)

  revalidatePath('/dashboard')
}

export async function cancelFocusSession(focusId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Delete associated checkpoints first
  await supabase
    .from('checkpoints')
    .delete()
    .eq('focus_id', focusId)

  // Delete the focus session
  const { error } = await supabase
    .from('focuses')
    .delete()
    .eq('id', focusId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to cancel focus session: ' + error.message)
  }

  revalidatePath('/dashboard')
}

// Checkpoint actions
export async function addCheckpoint(focusId: string, title: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if user can add more checkpoints (limit 3 for free tier)
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  const { count } = await supabase
    .from('checkpoints')
    .select('*', { count: 'exact', head: true })
    .eq('focus_id', focusId)

  if (profile?.subscription_status === 'free' && count && count >= 3) {
    throw new Error('Free users can only have 3 checkpoints per focus session')
  }

  // Get the highest display order
  const { data: existingCheckpoints } = await supabase
    .from('checkpoints')
    .select('display_order')
    .eq('focus_id', focusId)
    .order('display_order', { ascending: false })
    .limit(1)

  const displayOrder = existingCheckpoints && existingCheckpoints[0]
    ? existingCheckpoints[0].display_order + 1
    : 0

  const { data: newCheckpoint, error } = await supabase
    .from('checkpoints')
    .insert({
      focus_id: focusId,
      title,
      display_order: displayOrder,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to add checkpoint: ' + error.message)
  }

  revalidatePath('/dashboard')
  return newCheckpoint
}

export async function toggleCheckpoint(checkpointId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get current checkpoint status
  const { data: checkpoint } = await supabase
    .from('checkpoints')
    .select('completed_at, focus_id')
    .eq('id', checkpointId)
    .single()

  if (!checkpoint) {
    throw new Error('Checkpoint not found')
  }

  // Toggle completion
  const { error } = await supabase
    .from('checkpoints')
    .update({
      completed_at: checkpoint.completed_at ? null : new Date().toISOString(),
    })
    .eq('id', checkpointId)

  if (error) {
    throw new Error('Failed to toggle checkpoint: ' + error.message)
  }

  // Check if all checkpoints are completed
  const { data: allCheckpoints } = await supabase
    .from('checkpoints')
    .select('completed_at')
    .eq('focus_id', checkpoint.focus_id)

  if (allCheckpoints && allCheckpoints.length > 0) {
    const allCompleted = allCheckpoints.every(cp => cp.completed_at)

    if (allCompleted) {
      // Auto-complete the focus session
      await completeFocusSession(checkpoint.focus_id)
    }
  }

  revalidatePath('/dashboard')
}

export async function updateCheckpoint(checkpointId: string, title: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('checkpoints')
    .update({ title })
    .eq('id', checkpointId)

  if (error) {
    throw new Error('Failed to update checkpoint: ' + error.message)
  }

  revalidatePath('/dashboard')
}

export async function deleteCheckpoint(checkpointId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('checkpoints')
    .delete()
    .eq('id', checkpointId)

  if (error) {
    throw new Error('Failed to delete checkpoint: ' + error.message)
  }

  revalidatePath('/dashboard')
}

export async function reorderCheckpoints(
  focusId: string,
  checkpointIds: string[]
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Update display order for each checkpoint
  const updates = checkpointIds.map((id, index) =>
    supabase
      .from('checkpoints')
      .update({ display_order: index })
      .eq('id', id)
      .eq('focus_id', focusId)
  )

  await Promise.all(updates)

  revalidatePath('/dashboard')
}

// Helper function to update user streak
async function updateUserStreak(userId: string) {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  // Check if streak record exists
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) {
    // Create new streak record
    await supabase
      .from('streaks')
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_focus_date: today,
        total_focuses_completed: 1,
      })
  } else {
    // Update existing streak
    const lastDate = new Date(streak.last_focus_date || '')
    const todayDate = new Date(today)
    const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let newStreak = streak.current_streak
    if (diffDays === 1) {
      // Consecutive day
      newStreak = streak.current_streak + 1
    } else if (diffDays > 1) {
      // Streak broken
      newStreak = 1
    }
    // Same day - don't change streak

    await supabase
      .from('streaks')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        last_focus_date: today,
        total_focuses_completed: streak.total_focuses_completed + 1,
      })
      .eq('user_id', userId)
  }
}

// Get user's north stars
export async function getNorthStars() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data } = await supabase
    .from('north_stars')
    .select('*')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('display_order')

  return data || []
}

// Get today's focuses
export async function getTodayFocuses() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('focuses')
    .select(`
      *,
      north_star:north_stars(*),
      checkpoints(*)
    `)
    .eq('user_id', user.id)
    .eq('date', today)
    .order('session_number')

  return data || []
}

// Get active focus (current incomplete session)
export async function getActiveFocus() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('focuses')
    .select(`
      *,
      north_star:north_stars(*),
      checkpoints(*)
    `)
    .eq('user_id', user.id)
    .eq('date', today)
    .is('completed_at', null)
    .order('session_number', { ascending: false })
    .limit(1)
    .single()

  return data
}