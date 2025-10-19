'use client'

import { useState, useEffect } from 'react'
import { createEvent, updateEvent } from '@/app/actions/calendar'
import type { CalendarEvent, EventType } from '@/app/actions/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface NewEventModalProps {
  isOpen: boolean
  onClose: () => void
  prefilledDate?: string // YYYY-MM-DD
  existingEvent?: CalendarEvent
}

const EVENT_TYPES: Array<{ value: EventType; label: string; icon: string; color: string }> = [
  { value: 'meeting', label: 'Meeting', icon: '🤝', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' },
  { value: 'deadline', label: 'Deadline', icon: '📌', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' },
  { value: 'reminder', label: 'Reminder', icon: '🔔', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' },
  { value: 'appointment', label: 'Appointment', icon: '📍', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20' },
]

export function NewEventModal({ isOpen, onClose, prefilledDate, existingEvent }: NewEventModalProps) {
  const isEditing = !!existingEvent

  const [title, setTitle] = useState(existingEvent?.title || '')
  const [description, setDescription] = useState(existingEvent?.description || '')
  const [eventType, setEventType] = useState<EventType>(existingEvent?.event_type || 'meeting')
  // The date is always set from prefilledDate or existingEvent.event_date
  // It's stored internally but never shown in the form
  const [eventDate, setEventDate] = useState(existingEvent?.event_date || prefilledDate || '')
  const [eventTime, setEventTime] = useState(existingEvent?.event_time || '')
  const [duration, setDuration] = useState(existingEvent?.duration?.toString() || '')
  const [saving, setSaving] = useState(false)

  // Ensure eventDate is set when prefilledDate is provided
  useEffect(() => {
    if (prefilledDate) {
      setEventDate(prefilledDate)
    }
  }, [prefilledDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate title is required
    if (!title.trim()) {
      toast.error('Please fill in the event title')
      return
    }

    // Ensure date is set (should always be set from prefilledDate or existingEvent)
    if (!eventDate) {
      toast.error('No date selected. Please close and try again.')
      return
    }

    setSaving(true)

    try {
      if (isEditing && existingEvent) {
        await updateEvent(existingEvent.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          event_type: eventType,
          event_date: eventDate, // Keep the same date from the calendar selection
          event_time: eventTime || undefined,
          duration: duration ? parseInt(duration) : undefined
        })
        toast.success('Event updated successfully')
      } else {
        await createEvent({
          title: title.trim(),
          description: description.trim() || undefined,
          event_type: eventType,
          event_date: eventDate, // Use the date from calendar selection
          event_time: eventTime || undefined,
          duration: duration ? parseInt(duration) : undefined
        })
        toast.success('Event created successfully')
      }

      // Reset form
      setTitle('')
      setDescription('')
      setEventType('meeting')
      setEventDate(prefilledDate || '')
      setEventTime('')
      setDuration('')

      onClose()
    } catch (error) {
      console.error('Failed to save event:', error)
      toast.error('Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {isEditing ? 'Edit Event' : 'New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-7 py-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[0.9375rem]">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Team standup, Project deadline"
              className="h-12 text-[0.9375rem]"
              required
            />
          </div>

          {/* Event Type */}
          <div className="space-y-3">
            <Label className="text-[0.9375rem]">
              Event Type <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setEventType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    eventType === type.value
                      ? type.color + ' shadow-sm'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-semibold">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time (optional) - Full width since there's no date field */}
          <div className="space-y-2">
            <Label htmlFor="eventTime" className="text-[0.9375rem]">
              Time (optional)
            </Label>
            <Input
              id="eventTime"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="h-12 text-[0.9375rem]"
            />
          </div>

          {/* Duration (optional) */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-[0.9375rem]">
              Duration (minutes, optional)
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="1440"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 30, 60, 90"
              className="h-12 text-[0.9375rem]"
            />
          </div>

          {/* Description (optional) */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[0.9375rem]">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="resize-none text-[0.9375rem]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 text-[0.9375rem]"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1 h-12 text-[0.9375rem]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

