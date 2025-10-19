'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DateRangeSelector } from './date-range-selector'
import { HistoryStats } from './history-stats'
import { DayGroupedList } from './day-grouped-list'
import { EmptyHistoryState } from './empty-history-state'
import { FocusDetailModal } from './focus-detail-modal'
import { Button } from '@/components/ui/button'
import { Download, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Focus, NorthStar } from '@/types/focus'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface HistoryWrapperProps {
  initialFocuses: Focus[]
  stats: {
    totalSessions: number
    completedSessions: number
    completionRate: number
    totalCheckpoints: number
    completedCheckpoints: number
    avgCheckpointsPerSession: number
    mostProductiveTime: number | null
    energyDistribution: { high: number; medium: number; low: number }
  }
  streakData: {
    currentStreak: number
    longestStreak: number
    lastFocusDate: string | null
  }
  northStars: NorthStar[]
  dateRange: {
    start: string
    end: string
    preset: string
  }
  totalCount: number
}

export function HistoryWrapper(props: HistoryWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [currentRange, setCurrentRange] = useState(props.dateRange.preset)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [selectedFocus, setSelectedFocus] = useState<Focus | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Update current range when URL changes (after data loads)
  useEffect(() => {
    const range = searchParams.get('range') || '7days'
    setCurrentRange(range)
  }, [searchParams])

  const handleDateRangeChange = (range: string, customStart?: string, customEnd?: string) => {
    // Update UI immediately
    setCurrentRange(range)

    // Navigate with transition
    startTransition(() => {
      const params = new URLSearchParams()
      params.set('range', range)
      if (customStart) params.set('start', customStart)
      if (customEnd) params.set('end', customEnd)
      router.push(`/history?${params.toString()}`)
    })
  }

  const handleFocusClick = (focus: Focus) => {
    setSelectedFocus(focus)
    setShowDetailModal(true)
  }

  const handleExport = async (format: 'csv' | 'json') => {
    // Filter focuses by selected goal and search
    const filteredFocuses = props.initialFocuses.filter(focus => {
      const matchesGoal = !selectedGoalId || focus.north_star_id === selectedGoalId
      const matchesSearch = !searchQuery ||
        focus.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        focus.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesGoal && matchesSearch
    })

    try {
      const dataToExport = filteredFocuses.map(focus => ({
        date: focus.date,
        session: focus.session_number,
        title: focus.title,
        description: focus.description || '',
        energy_level: focus.energy_level || '',
        goal: focus.north_star?.title || '',
        completed: focus.completed_at ? 'Yes' : 'No',
        checkpoints_total: focus.checkpoints?.length || 0,
        checkpoints_completed: focus.checkpoints?.filter(c => c.completed_at).length || 0,
        started_at: focus.started_at,
        completed_at: focus.completed_at || ''
      }))

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `focal-history-${props.dateRange.start}-to-${props.dateRange.end}.json`
        a.click()
      } else {
        // CSV export
        const headers = Object.keys(dataToExport[0] || {}).join(',')
        const rows = dataToExport.map(row => Object.values(row).join(','))
        const csv = [headers, ...rows].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `focal-history-${props.dateRange.start}-to-${props.dateRange.end}.csv`
        a.click()
      }

      toast.success(`Exported ${filteredFocuses.length} sessions as ${format.toUpperCase()}`)
    } catch {
      toast.error('Failed to export data')
    }
  }

  // Filter focuses by selected goal and search
  const filteredFocuses = props.initialFocuses.filter(focus => {
    const matchesGoal = !selectedGoalId || focus.north_star_id === selectedGoalId
    const matchesSearch = !searchQuery ||
      focus.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      focus.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGoal && matchesSearch
  })

  // Empty state
  if (!isPending && props.initialFocuses.length === 0) {
    return <EmptyHistoryState dateRange={props.dateRange} />
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards - Enhanced */}
      {isPending ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-card/80" />
          ))}
        </div>
      ) : (
        <HistoryStats stats={props.stats} streakData={props.streakData} />
      )}

      {/* Controls Bar - Enhanced */}
      <div className="bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm rounded-2xl border shadow-md p-6">
        <div className="flex flex-col gap-5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search focus sessions..."
              className="pl-12 h-12 text-[0.9375rem] shadow-sm"
              disabled={isPending}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Date Range - This now updates instantly */}
              <DateRangeSelector
                currentRange={currentRange}
                onRangeChange={handleDateRangeChange}
              />

              {/* Goal Filter */}
              <div className="flex items-center gap-2.5">
                <Filter className="h-[1.125rem] w-[1.125rem] text-muted-foreground" />
                <select
                  value={selectedGoalId || ''}
                  onChange={(e) => setSelectedGoalId(e.target.value || null)}
                  className="text-[0.9375rem] font-medium border border-border rounded-lg px-4 py-2.5 bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  disabled={isPending}
                >
                  <option value="">All Goals</option>
                  {props.northStars.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Export Button */}
            <div className="relative group">
              <Button variant="outline" size="default" className="gap-2.5 shadow-md hover:shadow-lg" disabled={isPending}>
                <Download className="h-[1.125rem] w-[1.125rem]" />
                Export
              </Button>
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 bg-card rounded-xl shadow-xl border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[50] min-w-[180px]">
                <button
                  onClick={() => handleExport('csv')}
                  className="px-5 py-2.5 text-[0.9375rem] font-medium bg-muted w-full text-left whitespace-nowrap transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="px-5 py-2.5 text-[0.9375rem] font-medium bg-muted w-full text-left whitespace-nowrap transition-colors"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-[0.9375rem] text-muted-foreground font-medium">
            {isPending ? (
              <span className="animate-pulse">Loading sessions...</span>
            ) : (
              <>
                Showing {filteredFocuses.length} of {props.totalCount} sessions
                {selectedGoalId && ` for "${props.northStars.find(g => g.id === selectedGoalId)?.title}"`}
                {searchQuery && ` matching "${searchQuery}"`}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Day Grouped List with Loading State - Enhanced */}
      {isPending ? (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card/80 backdrop-blur-sm rounded-xl border shadow-md">
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-36 mb-2" />
                  <Skeleton className="h-5 w-52" />
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
              <div className="border-t border-border p-6 space-y-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DayGroupedList
          focuses={filteredFocuses}
          onFocusClick={handleFocusClick}
        />
      )}

      {/* Detail Modal */}
      <FocusDetailModal
        focus={selectedFocus}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedFocus(null)
        }}
      />
    </div>
  )
}