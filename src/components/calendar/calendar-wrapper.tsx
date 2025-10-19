'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCalendarData } from '@/app/actions/calendar'
import type { CalendarData } from '@/app/actions/calendar'
import { CalendarHeader } from './calendar-header'
import { CalendarGrid } from './calendar-grid'
import { NewEventModal } from './new-event-modal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { useFocusModal } from '@/contexts/focus-modal-context'

export function CalendarWrapper() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewEventModal, setShowNewEventModal] = useState(false)
  const [newEventDate, setNewEventDate] = useState<string | undefined>(undefined)
  const { setShowNewFocusModal, setFocusDate } = useFocusModal()

  // Fetch calendar data when month/year changes
  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1 // JavaScript months are 0-indexed
      const data = await getCalendarData(year, month)
      setCalendarData(data)
    } catch (error) {
      console.error('Failed to fetch calendar data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleMonthYearChange = (year: number, month: number) => {
    setCurrentDate(new Date(year, month - 1)) // month is 1-indexed from the select
  }

  const handleNewEvent = (date?: string) => {
    setNewEventDate(date)
    setShowNewEventModal(true)
  }

  const handleNewFocus = (date?: string) => {
    setFocusDate(date)
    setShowNewFocusModal(true)
  }

  const handleEventModalClose = () => {
    setShowNewEventModal(false)
    setNewEventDate(undefined)
    refreshData() // Refresh calendar data after event creation/update
  }

  if (loading) {
    return (
      <div className="space-y-7">
        {/* Header skeleton */}
        <div className="flex items-center justify-between p-5 rounded-xl bg-card border shadow-sm">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="rounded-xl bg-card border shadow-md p-7">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-7">
        {/* Quick Add Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => handleNewEvent()}
            className="h-12 px-5 text-[0.9375rem] rounded-xl shadow-md"
          >
            <Plus className="h-[1.125rem] w-[1.125rem] mr-2" />
            New Event
          </Button>
        </div>

        <CalendarHeader
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onMonthYearChange={handleMonthYearChange}
        />

        <CalendarGrid
          currentDate={currentDate}
          events={calendarData?.events || []}
          focusSessions={calendarData?.focusSessions || []}
          onNewEvent={handleNewEvent}
          onNewFocus={handleNewFocus}
          onRefresh={refreshData}
        />
      </div>

      {/* New Event Modal */}
      <NewEventModal
        isOpen={showNewEventModal}
        onClose={handleEventModalClose}
        prefilledDate={newEventDate}
      />
    </>
  )
}
