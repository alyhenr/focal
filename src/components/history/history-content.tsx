'use client'

import { useState } from 'react'
import { DayGroupedList } from './day-grouped-list'
import { DateRangeSelector } from './date-range-selector'
import { HistoryStats } from './history-stats'
import { EmptyHistoryState } from './empty-history-state'
import { FocusDetailModal } from './focus-detail-modal'
import { Button } from '@/components/ui/button'
import { Download, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Focus, NorthStar } from '@/types/focus'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface HistoryContentProps {
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

export function HistoryContent({
  initialFocuses,
  stats,
  streakData,
  northStars,
  dateRange,
  totalCount
}: HistoryContentProps) {
  const router = useRouter()
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [selectedFocus, setSelectedFocus] = useState<Focus | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter focuses by selected goal and search
  const filteredFocuses = initialFocuses.filter(focus => {
    const matchesGoal = !selectedGoalId || focus.north_star_id === selectedGoalId
    const matchesSearch = !searchQuery ||
      focus.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      focus.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGoal && matchesSearch
  })

  const handleDateRangeChange = (range: string, customStart?: string, customEnd?: string) => {
    const params = new URLSearchParams()
    params.set('range', range)
    if (customStart) params.set('start', customStart)
    if (customEnd) params.set('end', customEnd)
    router.push(`/history?${params.toString()}`)
  }

  const handleFocusClick = (focus: Focus) => {
    setSelectedFocus(focus)
    setShowDetailModal(true)
  }

  const handleExport = async (format: 'csv' | 'json') => {
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
        a.download = `focal-history-${dateRange.start}-to-${dateRange.end}.json`
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
        a.download = `focal-history-${dateRange.start}-to-${dateRange.end}.csv`
        a.click()
      }

      toast.success(`Exported ${filteredFocuses.length} sessions as ${format.toUpperCase()}`)
    } catch {
      toast.error('Failed to export data')
    }
  }

  // Empty state
  if (initialFocuses.length === 0) {
    return <EmptyHistoryState dateRange={dateRange} />
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <HistoryStats stats={stats} streakData={streakData} />

      {/* Controls Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 p-4">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search focus sessions..."
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Date Range */}
              <DateRangeSelector
                currentRange={dateRange.preset}
                onRangeChange={handleDateRangeChange}
              />

              {/* Goal Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedGoalId || ''}
                  onChange={(e) => setSelectedGoalId(e.target.value || null)}
                  className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Goals</option>
                  {northStars.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Export Button */}
            <div className="relative group">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 text-sm hover:bg-gray-50 w-full text-left whitespace-nowrap"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 text-sm hover:bg-gray-50 w-full text-left whitespace-nowrap"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredFocuses.length} of {totalCount} sessions
            {selectedGoalId && ` for "${northStars.find(g => g.id === selectedGoalId)?.title}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      </div>

      {/* Day Grouped List */}
      <DayGroupedList
        focuses={filteredFocuses}
        onFocusClick={handleFocusClick}
      />

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