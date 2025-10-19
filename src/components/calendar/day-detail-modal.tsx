'use client'

import { useEffect, useState } from 'react'
import { getDayDetails, deleteEvent } from '@/app/actions/calendar'
import type { DayDetails, CalendarEvent } from '@/app/actions/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Calendar, Edit2, Trash2, MoveRight, Copy } from 'lucide-react'
import { format, parse } from 'date-fns'
import { toast } from 'sonner'
import { NewEventModal } from './new-event-modal'
import { MoveEventModal } from './move-event-modal'
import { ReplicateEventModal } from './replicate-event-modal'

interface DayDetailModalProps {
  date: string // YYYY-MM-DD
  isOpen: boolean
  onClose: () => void
  onNewEvent: (date?: string) => void
  onNewFocus?: (date?: string) => void
  onRefresh: () => Promise<void>
}

export function DayDetailModal({ date, isOpen, onClose, onNewEvent, onNewFocus, onRefresh }: DayDetailModalProps) {
  const [dayDetails, setDayDetails] = useState<DayDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [movingEvent, setMovingEvent] = useState<CalendarEvent | null>(null)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [replicatingEvent, setReplicatingEvent] = useState<CalendarEvent | null>(null)
  const [showReplicateModal, setShowReplicateModal] = useState(false)

  const refreshDayDetails = async () => {
    if (date) {
      setLoading(true)
      try {
        const details = await getDayDetails(date)
        setDayDetails(details)
      } catch (error) {
        console.error('Failed to fetch day details:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (isOpen && date) {
      refreshDayDetails()
    }
  }, [date, isOpen])

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEditModal(true)
  }

  const handleMoveEvent = (event: CalendarEvent) => {
    setMovingEvent(event)
    setShowMoveModal(true)
  }

  const handleReplicateEvent = (event: CalendarEvent) => {
    setReplicatingEvent(event)
    setShowReplicateModal(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteEvent(eventId)
      toast.success('Event deleted successfully')
      await refreshDayDetails()
      await onRefresh()
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleEditModalClose = async () => {
    setShowEditModal(false)
    setEditingEvent(null)
    await refreshDayDetails()
    await onRefresh()
  }

  const handleMoveModalClose = async () => {
    setShowMoveModal(false)
    setMovingEvent(null)
    await refreshDayDetails()
    await onRefresh()
  }

  const handleReplicateModalClose = async () => {
    setShowReplicateModal(false)
    setReplicatingEvent(null)
    await refreshDayDetails()
    await onRefresh()
  }

  const dateObj = parse(date, 'yyyy-MM-dd', new Date())
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            {formattedDate}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-5">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-7 py-5">
            {/* Focus Sessions Section */}
            {dayDetails && dayDetails.focusSessions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <span className="text-primary">🎯</span>
                  Focus Sessions
                </h3>
                <div className="space-y-3">
                  {dayDetails.focusSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-5 rounded-xl border bg-card/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{session.title}</h4>
                          {session.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {session.description}
                            </p>
                          )}
                        </div>
                        {session.energy_level && (
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              session.energy_level === 'high'
                                ? 'bg-green-700 text-white font-bold'
                                : session.energy_level === 'medium'
                                ? 'bg-yellow-700 text-white font-bold'
                                : 'bg-red-700 text-white font-bold'
                            }`}
                          >
                            {session.energy_level}
                          </span>
                        )}
                      </div>
                      {session.checkpoints && session.checkpoints.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {session.checkpoints.filter((c) => c.completed_at).length}/
                          {session.checkpoints.length} checkpoints completed
                        </div>
                      )}
                      {session.completed_at && (
                        <div className="text-xs text-muted-foreground">
                          Completed: {format(new Date(session.completed_at), 'h:mm a')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events Section */}
            {dayDetails && dayDetails.events.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <span className="text-primary">📅</span>
                  Events
                </h3>
                <div className="space-y-3">
                  {dayDetails.events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-xl border bg-card/50 space-y-3 group hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <span>
                              {event.event_type === 'meeting' && '🤝'}
                              {event.event_type === 'deadline' && '📌'}
                              {event.event_type === 'reminder' && '🔔'}
                              {event.event_type === 'appointment' && '📍'}
                            </span>
                            {event.title}
                          </h4>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {event.event_time && (
                        <div className="text-sm text-muted-foreground">
                          Time: {event.event_time}
                          {event.duration && ` (${event.duration} min)`}
                        </div>
                      )}
                      {/* Event Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                          className="h-9 text-sm"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveEvent(event)}
                          className="h-9 text-sm"
                        >
                          <MoveRight className="h-3.5 w-3.5 mr-1.5" />
                          Move
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReplicateEvent(event)}
                          className="h-9 text-sm"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1.5" />
                          Replicate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-9 text-sm text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {dayDetails &&
              dayDetails.focusSessions.length === 0 &&
              dayDetails.events.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No activity for this day
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add events or focus sessions to get started
                  </p>
                </div>
              )}

            {/* Quick Actions */}
            <div className="flex items-center gap-3 pt-3 border-t">
              <Button
                variant="default"
                className="flex-1 h-12"
                onClick={() => {
                  onNewEvent(date)
                  onClose()
                }}
              >
                <Plus className="h-[1.125rem] w-[1.125rem] mr-2" />
                Add Event
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => {
                  if (onNewFocus) {
                    onNewFocus(date)
                    onClose()
                  }
                }}
              >
                <Plus className="h-[1.125rem] w-[1.125rem] mr-2" />
                New Focus
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Edit Event Modal */}
      {editingEvent && (
        <NewEventModal
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          existingEvent={editingEvent}
          prefilledDate={date}
        />
      )}

      {/* Move Event Modal */}
      {movingEvent && (
        <MoveEventModal
          isOpen={showMoveModal}
          onClose={handleMoveModalClose}
          event={movingEvent}
          onSuccess={async () => {
            await refreshDayDetails()
            await onRefresh()
          }}
        />
      )}

      {/* Replicate Event Modal */}
      {replicatingEvent && (
        <ReplicateEventModal
          isOpen={showReplicateModal}
          onClose={handleReplicateModalClose}
          event={replicatingEvent}
          onSuccess={async () => {
            await refreshDayDetails()
            await onRefresh()
          }}
        />
      )}
    </Dialog>
  )
} 
