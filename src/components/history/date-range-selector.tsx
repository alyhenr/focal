'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'

interface DateRangeSelectorProps {
  currentRange: string
  onRangeChange: (range: string, customStart?: string, customEnd?: string) => void
}

const presetRanges = [
  { label: 'Today', value: 'today' },
  { label: 'Last 3 Days', value: '3days' },
  { label: 'Last Week', value: '7days' },
  { label: 'Last 2 Weeks', value: '2weeks' },
  { label: 'Last Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'All Time', value: 'all' },
]

export function DateRangeSelector({ currentRange, onRangeChange }: DateRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState<Date | undefined>()
  const [customEnd, setCustomEnd] = useState<Date | undefined>()

  const currentLabel = currentRange === 'custom'
    ? 'Custom Range'
    : presetRanges.find(r => r.value === currentRange)?.label || 'Last Week'

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onRangeChange(
        'custom',
        format(customStart, 'yyyy-MM-dd'),
        format(customEnd, 'yyyy-MM-dd')
      )
      setShowCustom(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {currentLabel}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {presetRanges.map(range => (
            <DropdownMenuItem
              key={range.value}
              onClick={() => onRangeChange(range.value)}
              className={cn(
                currentRange === range.value && 'bg-muted'
              )}
            >
              {range.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowCustom(true)}
            className={cn(
              currentRange === 'custom' && 'bg-muted'
            )}
          >
            Custom Range...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Date Range Popover */}
      <Popover open={showCustom} onOpenChange={setShowCustom}>
        <PopoverTrigger asChild>
          <span />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Start Date</p>
              <Calendar
                mode="single"
                selected={customStart}
                onSelect={setCustomStart}
                disabled={(date) =>
                  date > new Date() || date < new Date('2024-01-01')
                }
                initialFocus
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">End Date</p>
              <Calendar
                mode="single"
                selected={customEnd}
                onSelect={setCustomEnd}
                disabled={(date) =>
                  date > new Date() || (customStart ? date < customStart : false)
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCustom(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCustomApply}
                disabled={!customStart || !customEnd}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}