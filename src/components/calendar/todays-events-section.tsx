'use client'

import type { CalendarEvent } from '@/app/actions/calendar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface TodaysEventsSectionProps {
  events: CalendarEvent[]
  onCreateFocus: (event: CalendarEvent) => void
}

const EVENT_ICONS = {
  meeting: '🤝',
  deadline: '📌',
  reminder: '🔔',
  appointment: '📍'
} as const

export function TodaysEventsSection({ events, onCreateFocus }: TodaysEventsSectionProps) {
  // Don't render if no events
  if (events.length === 0) {
    return null
  }

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Today&apos;s Events</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
            </p>
          </div>
        </div>
        <Link href="/calendar">
          <Button variant="ghost" size="sm" className="text-[0.9375rem]">
            View Calendar
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {events.map((event) => (
          <Card
            key={event.id}
            className="p-5 rounded-xl shadow-sm hover:shadow-md transition-all space-y-4 bg-gradient-to-br from-card via-card to-primary/5"
          >
            {/* Event Header */}
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0">
                {EVENT_ICONS[event.event_type as keyof typeof EVENT_ICONS]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-[0.9375rem] truncate">
                  {event.title}
                </h4>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>

            {/* Event Time */}
            {event.event_time && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>
                  {event.event_time}
                  {event.duration && ` (${event.duration} min)`}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t">
              <Button
                onClick={() => onCreateFocus(event)}
                variant="default"
                size="sm"
                className="flex-1 h-10 text-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Focus Block
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3"
                disabled={event.is_completed}
              >
                {event.is_completed ? '✓' : 'Mark Done'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}



