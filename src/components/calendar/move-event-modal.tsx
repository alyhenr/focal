'use client'

import { useState } from 'react'
import { moveEvent } from '@/app/actions/calendar'
import type { CalendarEvent } from '@/app/actions/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'

interface MoveEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent
  onSuccess: () => Promise<void>
}

export function MoveEventModal({ isOpen, onClose, event, onSuccess }: MoveEventModalProps) {
  const [newDate, setNewDate] = useState('')
  const [moving, setMoving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDate) {
      toast.error('Please select a date')
      return
    }

    if (newDate === event.event_date) {
      toast.error('Event is already on this date')
      return
    }

    setMoving(true)

    try {
      await moveEvent(event.id, newDate)
      toast.success(`Event moved to ${new Date(newDate + 'T00:00:00').toLocaleDateString()}`)
      await onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to move event:', error)
      toast.error('Failed to move event')
    } finally {
      setMoving(false)
    }
  }

  const handleClose = () => {
    if (!moving) {
      setNewDate('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Move Event
          </DialogTitle>
          <DialogDescription>
            Move &quot;{event.title}&quot; to a different date
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-3">
          <div className="space-y-2">
            <Label htmlFor="newDate" className="text-[0.9375rem]">
              New Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="newDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="h-12 text-[0.9375rem]"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={moving}
              className="flex-1 h-12 text-[0.9375rem]"
            >
              {moving ? 'Moving...' : 'Move Event'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={moving}
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


