'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FocusListItem } from './focus-list-item'
import { Focus } from '@/types/focus'
import { ChevronRight, Calendar } from 'lucide-react'
import { format, parseISO, isToday, isYesterday, isSameWeek, differenceInDays } from 'date-fns'

interface DayGroupedListProps {
  focuses: Focus[]
  onFocusClick: (focus: Focus) => void
}

interface DayGroup {
  date: string
  displayDate: string
  focuses: Focus[]
  stats: {
    totalSessions: number
    completedSessions: number
    totalCheckpoints: number
    completedCheckpoints: number
  }
}

export function DayGroupedList({ focuses, onFocusClick }: DayGroupedListProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [expandedFocus, setExpandedFocus] = useState<string | null>(null)

  // Group focuses by date
  const dayGroups: DayGroup[] = []
  const groupMap = new Map<string, DayGroup>()

  focuses.forEach(focus => {
    const date = focus.date
    if (!groupMap.has(date)) {
      const parsedDate = parseISO(date)
      let displayDate = format(parsedDate, 'EEEE, MMMM d')

      // Add relative labels
      if (isToday(parsedDate)) {
        displayDate = 'Today'
      } else if (isYesterday(parsedDate)) {
        displayDate = 'Yesterday'
      } else if (isSameWeek(parsedDate, new Date())) {
        displayDate = format(parsedDate, 'EEEE')
      } else {
        const daysAgo = differenceInDays(new Date(), parsedDate)
        if (daysAgo <= 7) {
          displayDate = `${daysAgo} days ago`
        } else {
          displayDate = format(parsedDate, 'MMM d, yyyy')
        }
      }

      groupMap.set(date, {
        date,
        displayDate,
        focuses: [],
        stats: {
          totalSessions: 0,
          completedSessions: 0,
          totalCheckpoints: 0,
          completedCheckpoints: 0
        }
      })
    }

    const group = groupMap.get(date)!
    group.focuses.push(focus)
    group.stats.totalSessions++
    if (focus.completed_at) group.stats.completedSessions++
    group.stats.totalCheckpoints += focus.checkpoints?.length || 0
    group.stats.completedCheckpoints += focus.checkpoints?.filter(c => c.completed_at).length || 0
  })

  // Sort groups by date (most recent first)
  groupMap.forEach(group => dayGroups.push(group))
  dayGroups.sort((a, b) => b.date.localeCompare(a.date))

  // Expand today and yesterday by default
  useEffect(() => {
    if (dayGroups.length > 0 && expandedDays.size === 0) {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      const toExpand = new Set<string>()
      dayGroups.forEach(group => {
        if (group.date === today || group.date === yesterday) {
          toExpand.add(group.date)
        }
      })

      if (toExpand.size > 0) {
        setExpandedDays(toExpand)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focuses.length])

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(date)) {
        newExpanded.delete(date)
      } else {
        newExpanded.add(date)
      }
      return newExpanded
    })
  }

  const handleFocusExpand = (focusId: string) => {
    setExpandedFocus(expandedFocus === focusId ? null : focusId)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const dayVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {dayGroups.map((group) => {
        const isExpanded = expandedDays.has(group.date)
        const completionRate = group.stats.totalSessions > 0
          ? Math.round((group.stats.completedSessions / group.stats.totalSessions) * 100)
          : 0

        return (
          <motion.div
            key={group.date}
            variants={dayVariants}
            className="bg-card/80 backdrop-blur-sm rounded-lg border border-border overflow-hidden"
          >
            {/* Day Header */}
            <button
              onClick={() => toggleDay(group.date)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.div>

                <Calendar className="h-4 w-4 text-muted-foreground" />

                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-foreground">
                    {group.displayDate}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {group.stats.totalSessions} {group.stats.totalSessions === 1 ? 'session' : 'sessions'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Completion Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {completionRate}% complete
                  </span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="h-full bg-success"
                    />
                  </div>
                </div>

                {/* Checkpoints Summary */}
                <span className="text-xs text-muted-foreground">
                  {group.stats.completedCheckpoints}/{group.stats.totalCheckpoints} checkpoints
                </span>
              </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-3">
                    {group.focuses.map((focus, index) => (
                      <FocusListItem
                        key={focus.id}
                        focus={focus}
                        isExpanded={expandedFocus === focus.id}
                        onExpand={() => handleFocusExpand(focus.id)}
                        onDetailClick={() => onFocusClick(focus)}
                        delay={index * 0.05}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </motion.div>
  )
}