'use client'

import { useState } from 'react'
import type { CalendarEvent } from '@/app/actions/calendar'
import { CalendarCell } from './calendar-cell'
import { DayDetailModal } from './day-detail-modal'

interface CalendarGridProps {
  currentDate: Date
  events: CalendarEvent[]
  focusSessions: Array<{
    id: string
    date: string
    energy_level: 'high' | 'medium' | 'low' | null
    completed_at: string | null
  }>
  onNewEvent: (date?: string) => void
  onNewFocus?: (date?: string) => void
  onRefresh: () => Promise<void>
}

interface CalendarDay {
  date: Date
  dateString: string // YYYY-MM-DD
  isCurrentMonth: boolean
  isToday: boolean
  isPast: boolean
  focusSessions: Array<{
    id: string
    energy_level: 'high' | 'medium' | 'low' | null
  }>
  events: CalendarEvent[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarGrid({ currentDate, events, focusSessions, onNewEvent, onNewFocus, onRefresh }: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Generate calendar days (including prev/next month days to fill grid)
  const calendarDays = generateCalendarDays(currentDate, events, focusSessions)

  return (
    <>
      <div className="rounded-xl bg-card border shadow-md p-7 space-y-5">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider pb-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <CalendarCell
              key={index}
              day={day}
              onClick={() => setSelectedDate(day.dateString)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="pt-5 border-t">
          <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
              <span>Focus sessions (by energy level)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="text-base">🤝</span>
                <span className="text-base">📌</span>
                <span className="text-base">🔔</span>
                <span className="text-base">📍</span>
              </div>
              <span>Events (meeting, deadline, reminder, appointment)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          onNewEvent={onNewEvent}
          onNewFocus={onNewFocus}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}

// Helper function to generate calendar grid
function generateCalendarDays(
  currentDate: Date,
  events: CalendarEvent[],
  focusSessions: Array<{
    id: string
    date: string
    energy_level: 'high' | 'medium' | 'low' | null
    completed_at: string | null
  }>
): CalendarDay[] {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // First day of the month
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay() // 0 = Sunday

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const lastDate = lastDay.getDate()

  // Today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayString = formatDate(today)

  const days: CalendarDay[] = []

  // Add previous month's days to fill the first week
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push(createCalendarDay(date, false, todayString, events, focusSessions))
  }

  // Add current month's days
  for (let date = 1; date <= lastDate; date++) {
    const dateObj = new Date(year, month, date)
    days.push(createCalendarDay(dateObj, true, todayString, events, focusSessions))
  }

  // Add next month's days to fill the grid (ensuring we have full weeks)
  const remainingDays = 42 - days.length // Always show 6 weeks (42 days)
  for (let date = 1; date <= remainingDays; date++) {
    const dateObj = new Date(year, month + 1, date)
    days.push(createCalendarDay(dateObj, false, todayString, events, focusSessions))
  }

  return days
}

function createCalendarDay(
  date: Date,
  isCurrentMonth: boolean,
  todayString: string,
  events: CalendarEvent[],
  focusSessions: Array<{
    id: string
    date: string
    energy_level: 'high' | 'medium' | 'low' | null
    completed_at: string | null
  }>
): CalendarDay {
  const dateString = formatDate(date)
  const isToday = dateString === todayString
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

  // Get focus sessions for this day
  const daySessions = focusSessions
    .filter((session) => session.date === dateString)
    .map((session) => ({
      id: session.id,
      energy_level: session.energy_level
    }))

  // Get events for this day
  const dayEvents = events.filter((event) => event.event_date === dateString)

  return {
    date,
    dateString,
    isCurrentMonth,
    isToday,
    isPast,
    focusSessions: daySessions,
    events: dayEvents
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
