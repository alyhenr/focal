'use client'

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CalendarHeaderProps {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  onMonthYearChange: (year: number, month: number) => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Generate years array (current year ± 5 years)
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

export function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onMonthYearChange
}: CalendarHeaderProps) {
  const month = currentDate.getMonth() + 1 // 1-indexed for display
  const year = currentDate.getFullYear()
  const monthName = MONTHS[currentDate.getMonth()]

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-7 rounded-xl bg-gradient-to-br from-card via-card to-primary/5 border shadow-md">
      {/* Left: Month/Year Display */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm">
          <CalendarIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            {monthName} {year}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Plan and review your focus sessions
          </p>
        </div>
      </div>

      {/* Right: Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          {/* Previous Month */}
          <Button
            variant="outline"
            size="icon"
            onClick={onPreviousMonth}
            className="sm:h-12 h-8 w-8 sm:w-12 rounded-xl shrink-0"
          >
            <ChevronLeft className="h-[1.125rem] w-[1.125rem]" />
          </Button>

          {/* Month/Year Selector */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <Select
              value={month.toString()}
              onValueChange={(value) => onMonthYearChange(year, parseInt(value))}
            >
              <SelectTrigger className="h-12 w-32 text-[0.9375rem] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((monthName, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={year.toString()}
              onValueChange={(value) => onMonthYearChange(parseInt(value), month)}
            >
              <SelectTrigger className="h-12 w-24 text-[0.9375rem] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((yearValue) => (
                  <SelectItem key={yearValue} value={yearValue.toString()}>
                    {yearValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Next Month */}
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            className="sm:h-12 h-8 w-8 sm:w-12 rounded-xl shrink-0"
          >
            <ChevronRight className="h-[1.125rem] w-[1.125rem]" />
          </Button>
        </div>

        {/* Today Button */}
        <Button
          variant="default"
          onClick={onToday}
          className="h-12 px-5 text-[0.9375rem] rounded-xl shrink-0 w-full sm:w-auto"
        >
          Today
        </Button>
      </div>
    </div>
  )
}



