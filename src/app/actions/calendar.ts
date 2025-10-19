'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EventType = 'meeting' | 'deadline' | 'reminder' | 'appointment'

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  event_type: EventType
  event_date: string // YYYY-MM-DD format
  event_time: string | null // HH:MM format
  duration: number | null // minutes
  is_completed: boolean
  linked_focus_id: string | null
  created_at: string
  updated_at: string
}

export interface NewEventData {
  title: string
  description?: string
  event_type: EventType
  event_date: string
  event_time?: string
  duration?: number
}

export interface CalendarData {
  events: CalendarEvent[]
  focusSessions: Array<{
    id: string
    date: string
    energy_level: 'high' | 'medium' | 'low' | null
    completed_at: string | null
  }>
}

export interface DayDetails {
  date: string
  events: CalendarEvent[]
  focusSessions: Array<{
    id: string
    title: string
    description: string | null
    energy_level: 'high' | 'medium' | 'low' | null
    started_at: string | null
    completed_at: string | null
    north_star_id: string | null
    checkpoints: Array<{
      id: string
      title: string
      completed_at: string | null
    }>
  }>
}

/**
 * Get calendar data for a specific month
 * Fetches both events and focus sessions for visualization
 */
export async function getCalendarData(year: number, month: number): Promise<CalendarData> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of month
  
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // Fetch events for the month
  const { data: events, error: eventsError } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('event_date', startDateStr)
    .lte('event_date', endDateStr)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

  if (eventsError) throw eventsError

  // Fetch focus sessions for the month (for dots visualization)
  const { data: focusSessions, error: focusError } = await supabase
    .from('focuses')
    .select('id, date, energy_level, completed_at')
    .gte('date', startDateStr)
    .lte('date', endDateStr)
    .not('completed_at', 'is', null) // Only completed sessions

  if (focusError) throw focusError

  return {
    events: events || [],
    focusSessions: focusSessions || []
  }
}

/**
 * Get detailed information for a specific day
 * Returns both events and focus sessions with full details
 */
export async function getDayDetails(date: string): Promise<DayDetails> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch events for the day
  const { data: events, error: eventsError } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('event_date', date)
    .order('event_time', { ascending: true })

  if (eventsError) throw eventsError

  // Fetch focus sessions for the day with checkpoints
  const { data: focusSessions, error: focusError } = await supabase
    .from('focuses')
    .select(`
      id,
      title,
      description,
      energy_level,
      started_at,
      completed_at,
      north_star_id,
      checkpoints (
        id,
        title,
        completed_at
      )
    `)
    .eq('date', date)
    .order('started_at', { ascending: true })

  if (focusError) throw focusError

  return {
    date,
    events: events || [],
    focusSessions: (focusSessions || []).map(session => ({
      ...session,
      checkpoints: session.checkpoints || []
    }))
  }
}

/**
 * Get today's events for Dashboard integration
 */
export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const today = new Date().toISOString().split('T')[0]

  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('event_date', today)
    .order('event_time', { ascending: true })

  if (error) throw error

  return events || []
}

/**
 * Create a new calendar event
 */
export async function createEvent(data: NewEventData): Promise<CalendarEvent> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      event_type: data.event_type,
      event_date: data.event_date,
      event_time: data.event_time || null,
      duration: data.duration || null
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/calendar')
  revalidatePath('/dashboard')

  return event
}

/**
 * Update an existing calendar event
 */
export async function updateEvent(
  id: string,
  data: Partial<NewEventData> & { is_completed?: boolean; linked_focus_id?: string | null }
): Promise<CalendarEvent> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString()
  }

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.event_type !== undefined) updateData.event_type = data.event_type
  if (data.event_date !== undefined) updateData.event_date = data.event_date
  if (data.event_time !== undefined) updateData.event_time = data.event_time || null
  if (data.duration !== undefined) updateData.duration = data.duration || null
  if (data.is_completed !== undefined) updateData.is_completed = data.is_completed
  if (data.linked_focus_id !== undefined) updateData.linked_focus_id = data.linked_focus_id

  const { data: event, error } = await supabase
    .from('calendar_events')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the event
    .select()
    .single()

  if (error) throw error

  revalidatePath('/calendar')
  revalidatePath('/dashboard')

  return event
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the event

  if (error) throw error

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
}

/**
 * Link a calendar event to a focus session
 */
export async function linkEventToFocus(eventId: string, focusId: string): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('calendar_events')
    .update({
      linked_focus_id: focusId,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
}

/**
 * Get events for a date range (useful for History integration)
 */
export async function getEventsForDateRange(
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

  if (error) throw error

  return events || []
}

/**
 * Move an event to a different date
 */
export async function moveEvent(eventId: string, newDate: string): Promise<CalendarEvent> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('calendar_events')
    .update({
      event_date: newDate,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)
    .eq('user_id', user.id) // Ensure user owns the event
    .select()
    .single()

  if (error) throw error

  revalidatePath('/calendar')
  revalidatePath('/dashboard')

  return event
}

/**
 * Replicate an event to multiple dates
 */
export async function replicateEvent(eventId: string, dates: string[]): Promise<CalendarEvent[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // First, get the original event
  const { data: originalEvent, error: fetchError } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single()

  if (fetchError) throw fetchError

  // Create new events for each date
  const eventsToCreate = dates.map(date => ({
    user_id: user.id,
    title: originalEvent.title,
    description: originalEvent.description,
    event_type: originalEvent.event_type,
    event_date: date,
    event_time: originalEvent.event_time,
    duration: originalEvent.duration
  }))

  const { data: newEvents, error: insertError } = await supabase
    .from('calendar_events')
    .insert(eventsToCreate)
    .select()

  if (insertError) throw insertError

  revalidatePath('/calendar')
  revalidatePath('/dashboard')

  return newEvents || []
}


