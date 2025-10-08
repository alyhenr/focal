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
    const lastFocusDate = streak.last_focus_date

    let newStreak = streak.current_streak

    if (!lastFocusDate) {
      // First focus after account creation
      newStreak = 1
    } else if (lastFocusDate === today) {
      // Same day - don't change streak count
      newStreak = streak.current_streak
    } else {
      // Different day - calculate day difference using date strings
      const lastDate = new Date(lastFocusDate + 'T00:00:00Z')
      const todayDate = new Date(today + 'T00:00:00Z')
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = streak.current_streak + 1
      } else if (diffDays > 1) {
        // Streak broken - reset to 1
        newStreak = 1
      }
    }

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

// North Star Goals Management

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

// Create a new north star goal
export async function createNorthStar(data: {
  title: string
  description?: string
  target_date?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if user can add more goals (limit 3 for free tier)
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  const { count } = await supabase
    .from('north_stars')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('archived_at', null)

  if (profile?.subscription_status === 'free' && count && count >= 3) {
    throw new Error('Free users can only have 3 active goals. Please upgrade to create more.')
  }

  // Get the highest display order
  const { data: existingGoals } = await supabase
    .from('north_stars')
    .select('display_order')
    .eq('user_id', user.id)
    .order('display_order', { ascending: false })
    .limit(1)

  const displayOrder = existingGoals && existingGoals[0]
    ? existingGoals[0].display_order + 1
    : 0

  const { data: newGoal, error } = await supabase
    .from('north_stars')
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description,
      target_date: data.target_date,
      display_order: displayOrder,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create goal: ' + error.message)
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return newGoal
}

// Update a north star goal
export async function updateNorthStar(
  goalId: string,
  data: {
    title?: string
    description?: string
    target_date?: string
  }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('north_stars')
    .update(data)
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to update goal: ' + error.message)
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

// Archive a north star goal
export async function archiveNorthStar(goalId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('north_stars')
    .update({
      archived_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to archive goal: ' + error.message)
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

// Complete a north star goal
export async function completeNorthStar(goalId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('north_stars')
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to complete goal: ' + error.message)
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

// Reorder north star goals
export async function reorderNorthStars(goalIds: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Update display order for each goal
  const updates = goalIds.map((id, index) =>
    supabase
      .from('north_stars')
      .update({ display_order: index })
      .eq('id', id)
      .eq('user_id', user.id)
  )

  await Promise.all(updates)

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

// Get progress for a specific north star
export async function getNorthStarProgress(goalId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { total: 0, completed: 0, percentage: 0 }
  }

  // Get all focuses linked to this goal
  const { data: linkedFocuses } = await supabase
    .from('focuses')
    .select('id, completed_at')
    .eq('user_id', user.id)
    .eq('north_star_id', goalId)

  if (!linkedFocuses || linkedFocuses.length === 0) {
    return { total: 0, completed: 0, percentage: 0 }
  }

  const total = linkedFocuses.length
  const completed = linkedFocuses.filter(f => f.completed_at).length
  const percentage = Math.round((completed / total) * 100)

  return { total, completed, percentage }
}

// Get all north stars with their progress
export async function getNorthStarsWithProgress() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data: northStars } = await supabase
    .from('north_stars')
    .select(`
      *,
      focuses!focuses_north_star_id_fkey(
        id,
        completed_at
      )
    `)
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('display_order')

  if (!northStars) {
    return []
  }

  // Calculate progress for each goal
  return northStars.map(star => {
    const linkedFocuses = star.focuses || []
    const total = linkedFocuses.length
    const completed = linkedFocuses.filter((f: any) => f.completed_at).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      ...star,
      progress: {
        total,
        completed,
        percentage
      }
    }
  })
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

// Get focuses by date range with optional pagination
export async function getFocusesByDateRange(
  startDate: string,
  endDate: string,
  limit = 50,
  offset = 0
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { focuses: [], hasMore: false, total: 0 }
  }

  // Get total count for pagination
  const { count } = await supabase
    .from('focuses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  // Get paginated data
  const { data } = await supabase
    .from('focuses')
    .select(`
      *,
      north_star:north_stars(*),
      checkpoints(*)
    `)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('session_number', { ascending: false })
    .range(offset, offset + limit - 1)

  return {
    focuses: data || [],
    hasMore: (count || 0) > offset + limit,
    total: count || 0
  }
}

// Get focus statistics for a date range
export async function getFocusStats(startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      totalCheckpoints: 0,
      completedCheckpoints: 0,
      avgCheckpointsPerSession: 0,
      mostProductiveTime: null,
      energyDistribution: { high: 0, medium: 0, low: 0 }
    }
  }

  // Get all focuses in date range
  const { data: focuses } = await supabase
    .from('focuses')
    .select(`
      *,
      checkpoints(*)
    `)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  if (!focuses || focuses.length === 0) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      totalCheckpoints: 0,
      completedCheckpoints: 0,
      avgCheckpointsPerSession: 0,
      mostProductiveTime: null,
      energyDistribution: { high: 0, medium: 0, low: 0 }
    }
  }

  // Calculate statistics
  const totalSessions = focuses.length
  const completedSessions = focuses.filter(f => f.completed_at).length
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

  let totalCheckpoints = 0
  let completedCheckpoints = 0
  const hourCounts: Record<number, number> = {}
  const energyDistribution = { high: 0, medium: 0, low: 0 }

  focuses.forEach(focus => {
    // Count checkpoints
    if (focus.checkpoints) {
      totalCheckpoints += focus.checkpoints.length
      completedCheckpoints += focus.checkpoints.filter((c: any) => c.completed_at).length
    }

    // Track hour of day
    if (focus.started_at) {
      const hour = new Date(focus.started_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    }

    // Track energy levels
    if (focus.energy_level) {
      energyDistribution[focus.energy_level as keyof typeof energyDistribution]++
    }
  })

  // Find most productive hour
  let mostProductiveTime = null
  let maxCount = 0
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostProductiveTime = parseInt(hour)
    }
  })

  return {
    totalSessions,
    completedSessions,
    completionRate,
    totalCheckpoints,
    completedCheckpoints,
    avgCheckpointsPerSession: totalSessions > 0 ? totalCheckpoints / totalSessions : 0,
    mostProductiveTime,
    energyDistribution
  }
}

// Get goal progress over time
export async function getGoalProgressOverTime(
  goalId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data } = await supabase
    .from('focuses')
    .select(`
      date,
      completed_at,
      checkpoints(completed_at)
    `)
    .eq('user_id', user.id)
    .eq('north_star_id', goalId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (!data) return []

  // Group by date and calculate daily progress
  const progressByDate: Record<string, { sessions: number, completed: number, checkpoints: number, completedCheckpoints: number }> = {}

  data.forEach(focus => {
    const date = focus.date
    if (!progressByDate[date]) {
      progressByDate[date] = { sessions: 0, completed: 0, checkpoints: 0, completedCheckpoints: 0 }
    }

    progressByDate[date].sessions++
    if (focus.completed_at) progressByDate[date].completed++

    if (focus.checkpoints) {
      progressByDate[date].checkpoints += focus.checkpoints.length
      progressByDate[date].completedCheckpoints += focus.checkpoints.filter((c: any) => c.completed_at).length
    }
  })

  return Object.entries(progressByDate).map(([date, stats]) => ({
    date,
    ...stats
  }))
}

// Get current streak data
export async function getStreakData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { currentStreak: 0, longestStreak: 0, lastFocusDate: null }
  }

  const { data } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!data) {
    return { currentStreak: 0, longestStreak: 0, lastFocusDate: null }
  }

  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastFocusDate: data.last_focus_date
  }
}

// Get daily completion data for chart (last N days)
export async function getDailyCompletionData(days: number = 30) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days + 1)

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // Get all focuses in range
  const { data: focuses } = await supabase
    .from('focuses')
    .select('date, completed_at')
    .eq('user_id', user.id)
    .gte('date', startDateStr)
    .lte('date', endDateStr)
    .order('date')

  if (!focuses || focuses.length === 0) {
    return []
  }

  // Group by date and calculate completion rate
  const dataByDate: Record<string, { total: number; completed: number }> = {}

  focuses.forEach(focus => {
    const date = focus.date
    if (!dataByDate[date]) {
      dataByDate[date] = { total: 0, completed: 0 }
    }
    dataByDate[date].total++
    if (focus.completed_at) {
      dataByDate[date].completed++
    }
  })

  // Fill in missing dates with 0 values
  const result = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const data = dataByDate[dateStr] || { total: 0, completed: 0 }
    const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0

    result.push({
      date: dateStr,
      total: data.total,
      completed: data.completed,
      rate: Math.round(rate)
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}

// Get hourly activity data for heatmap
export async function getHourlyActivityData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  // Get all completed focuses with their start times
  const { data: focuses } = await supabase
    .from('focuses')
    .select('started_at')
    .eq('user_id', user.id)
    .not('started_at', 'is', null)

  if (!focuses || focuses.length === 0) {
    return []
  }

  // Group by hour (0-23)
  const hourCounts: Record<number, number> = {}

  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0
  }

  focuses.forEach(focus => {
    if (focus.started_at) {
      const hour = new Date(focus.started_at).getHours()
      hourCounts[hour]++
    }
  })

  // Convert to array format for chart
  return Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
    label: formatHour(parseInt(hour))
  }))
}

// Get weekly summary statistics
export async function getWeeklyStats() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      totalSessions: 0,
      avgCheckpoints: 0,
      mostProductiveDay: null
    }
  }

  // Get this week's data (Monday to Sunday)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  const startDateStr = monday.toISOString().split('T')[0]
  const endDateStr = today.toISOString().split('T')[0]

  // Get this week's focuses
  const { data: focuses } = await supabase
    .from('focuses')
    .select(`
      *,
      checkpoints(*)
    `)
    .eq('user_id', user.id)
    .gte('date', startDateStr)
    .lte('date', endDateStr)

  if (!focuses || focuses.length === 0) {
    return {
      totalSessions: 0,
      avgCheckpoints: 0,
      mostProductiveDay: null
    }
  }

  // Calculate stats
  const totalSessions = focuses.length
  let totalCheckpoints = 0
  const dayOfWeekCounts: Record<number, number> = {}

  focuses.forEach(focus => {
    if (focus.checkpoints) {
      totalCheckpoints += focus.checkpoints.length
    }

    const focusDay = new Date(focus.date).getDay()
    dayOfWeekCounts[focusDay] = (dayOfWeekCounts[focusDay] || 0) + 1
  })

  // Find most productive day
  let mostProductiveDay = null
  let maxCount = 0
  Object.entries(dayOfWeekCounts).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostProductiveDay = getDayName(parseInt(day))
    }
  })

  return {
    totalSessions,
    avgCheckpoints: totalSessions > 0 ? totalCheckpoints / totalSessions : 0,
    mostProductiveDay
  }
}

// Helper function to format hour (0-23) to readable time
function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}${period}`
}

// Helper function to get day name from day number (0 = Sunday)
function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[day]
}