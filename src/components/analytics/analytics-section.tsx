'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { StreakWidget } from './streak-widget'
import { WeeklySummary } from './weekly-summary'
import { CompletionChart } from './completion-chart'
import { TimeHeatmap } from './time-heatmap'
import { EnergyDonut } from './energy-donut'
import { GoalsProgress } from './goals-progress'
import { getStreakSparklineData } from '@/lib/analytics-utils'
import type { NorthStar } from '@/types/focus'

interface AnalyticsSectionProps {
  streakData: {
    currentStreak: number
    longestStreak: number
    lastFocusDate: string | null
  }
  weeklyStats: {
    totalSessions: number
    avgCheckpoints: number
    mostProductiveDay: string | null
  }
  completionData: Array<{
    date: string
    total: number
    completed: number
    rate: number
  }>
  hourlyData: Array<{
    hour: number
    count: number
    label: string
  }>
  energyDistribution: {
    high: number
    medium: number
    low: number
  }
  goals: NorthStar[]
  goalsProgress?: Record<string, { completed: number; total: number }>
}

export function AnalyticsSection({
  streakData,
  weeklyStats,
  completionData,
  hourlyData,
  energyDistribution,
  goals,
  goalsProgress
}: AnalyticsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Get sparkline data for streak widget
  const sparklineData = getStreakSparklineData(
    completionData.map(d => ({ date: d.date, completed: d.completed })),
    7
  )

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
            <p className="text-xs text-muted-foreground">Your productivity insights</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Collapse</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Expand</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Analytics Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Top Row - Streak + Weekly Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <StreakWidget
                  streakData={streakData}
                  sparklineData={sparklineData}
                />
              </div>
              <div className="lg:col-span-2">
                <WeeklySummary weeklyStats={weeklyStats} />
              </div>
            </div>

            {/* Completion Rate Chart - Full Width */}
            <CompletionChart data={completionData} />

            {/* Bottom Row - Time Heatmap + Energy Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TimeHeatmap data={hourlyData} />
              <EnergyDonut energyDistribution={energyDistribution} />
            </div>

            {/* Goals Progress - Full Width (if goals exist) */}
            {goals.length > 0 && (
              <GoalsProgress goals={goals} goalsProgress={goalsProgress} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
