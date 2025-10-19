'use client'

import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/app/actions/calendar'

interface CalendarDay {
  date: Date
  dateString: string
  isCurrentMonth: boolean
  isToday: boolean
  isPast: boolean
  focusSessions: Array<{
    id: string
    energy_level: 'high' | 'medium' | 'low' | null
  }>
  events: CalendarEvent[]
}

interface CalendarCellProps {
  day: CalendarDay
  onClick: () => void
}

const EVENT_ICONS = {
  meeting: '🤝',
  deadline: '📌',
  reminder: '🔔',
  appointment: '📍'
} as const

export function CalendarCell({ day, onClick }: CalendarCellProps) {
  const dateNumber = day.date.getDate()
  const hasFocusSessions = day.focusSessions.length > 0
  const hasEvents = day.events.length > 0

  // Get unique event types for this day
  const uniqueEventTypes = Array.from(
    new Set(day.events.map((e) => e.event_type))
  )

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative aspect-square w-full rounded-xl border transition-all',
        'hover:border-primary hover:shadow-md hover:scale-[1.02]',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        day.isToday && 'border-primary border-2 bg-primary/5 shadow-sm',
        !day.isToday && day.isCurrentMonth && 'border-border bg-card',
        !day.isToday && !day.isCurrentMonth && 'border-border/50 bg-muted/30 opacity-40',
        hasEvents || hasFocusSessions ? 'cursor-pointer' : 'cursor-default'
      )}
    >
      {/* Date Number */}
      <div className={`absolute sm:top-2 top-1 ${day.isToday ? 'text-primary' : 'text-foreground'} ${dateNumber < 10 ? 'left-3' : 'left-2'}`}>
        <span
          className={cn(
            'text-sm font-semibold',
            day.isToday && 'text-primary',
            !day.isToday && day.isCurrentMonth && 'text-foreground',
            !day.isToday && !day.isCurrentMonth && 'text-muted-foreground'
          )}
        >
          {dateNumber}
        </span>
      </div>

      {/* Event Badges (top-right) */}
      {hasEvents && (
        <div className="absolute sm:top-2 sm:right-2 top-0 right-0 flex items-center gap-0.5">
          {uniqueEventTypes.length > 2 ? (
            // Show count badge if more than 2 event types
            <div className="text-xs bg-primary/20 text-primary font-semibold px-1.5 py-0.5 rounded">
              {day.events.length}
            </div>
          ) : (
            // Show individual icons
            uniqueEventTypes.slice(0, 2).map((type) => (
              <span key={type} className="text-sm">
                {EVENT_ICONS[type as keyof typeof EVENT_ICONS]}
              </span>
            ))
          )}
        </div>
      )}

      {/* Focus Session Dots (bottom-center) */}
      {hasFocusSessions && (
        <div className="absolute sm:bottom-2 bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {day.focusSessions.slice(0, 3).map((session) => (
            <div
              key={session.id}
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                session.energy_level === 'high' && 'bg-green-500',
                session.energy_level === 'medium' && 'bg-yellow-500',
                session.energy_level === 'low' && 'bg-red-500',
                !session.energy_level && 'bg-gray-400'
              )}
            />
          ))}
          {day.focusSessions.length > 3 && (
            <span className="text-[10px] text-muted-foreground font-semibold">
              +{day.focusSessions.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Hover Effect - Show tooltip */}
      {(hasEvents || hasFocusSessions) && (
        <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </button>
  )
}



