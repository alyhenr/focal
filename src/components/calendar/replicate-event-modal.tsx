'use client'

import { useState } from 'react'
import { replicateEvent } from '@/app/actions/calendar'
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
import { Copy, X } from 'lucide-react'

interface ReplicateEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent
  onSuccess: () => Promise<void>
}

export function ReplicateEventModal({ isOpen, onClose, event, onSuccess }: ReplicateEventModalProps) {
  const [dates, setDates] = useState<string[]>([''])
  const [replicating, setReplicating] = useState(false)

  const addDateField = () => {
    setDates([...dates, ''])
  }

  const removeDateField = (index: number) => {
    if (dates.length > 1) {
      setDates(dates.filter((_, i) => i !== index))
    }
  }

  const updateDate = (index: number, value: string) => {
    const newDates = [...dates]
    newDates[index] = value
    setDates(newDates)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out empty dates and validate
    const validDates = dates.filter(d => d.trim() !== '')
    
    if (validDates.length === 0) {
      toast.error('Please select at least one date')
      return
    }

    // Check for duplicate dates
    const uniqueDates = Array.from(new Set(validDates))
    if (uniqueDates.length !== validDates.length) {
      toast.error('Please remove duplicate dates')
      return
    }

    // Check if any date is the same as the original event
    if (uniqueDates.some(d => d === event.event_date)) {
      toast.error('Cannot replicate to the same date as the original event')
      return
    }

    setReplicating(true)

    try {
      await replicateEvent(event.id, uniqueDates)
      toast.success(`Event replicated to ${uniqueDates.length} date${uniqueDates.length > 1 ? 's' : ''}`)
      await onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to replicate event:', error)
      toast.error('Failed to replicate event')
    } finally {
      setReplicating(false)
    }
  }

  const handleClose = () => {
    if (!replicating) {
      setDates([''])
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Replicate Event
          </DialogTitle>
          <DialogDescription>
            Create copies of &quot;{event.title}&quot; on different dates
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-3">
          <div className="space-y-3">
            <Label className="text-[0.9375rem]">
              Select Dates <span className="text-destructive">*</span>
            </Label>
            
            {dates.map((date, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => updateDate(index, e.target.value)}
                  className="h-12 text-[0.9375rem] flex-1"
                  required
                />
                {dates.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDateField(index)}
                    className="h-12 w-12 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addDateField}
              className="w-full h-10 text-sm"
            >
              + Add Another Date
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={replicating}
              className="flex-1 h-12 text-[0.9375rem]"
            >
              {replicating ? 'Replicating...' : 'Replicate Event'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={replicating}
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


