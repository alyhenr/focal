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
  const [isExpanded, setIsExpanded] = useState(false)

  // Get sparkline data for streak widget
  const sparklineData = getStreakSparklineData(
    completionData.map(d => ({ date: d.date, completed: d.completed })),
    7
  )

  return (
    <div className="space-y-5">
      {/* Section Header - Enhanced */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-card via-card to-primary/5 border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Analytics</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Your productivity insights</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
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
            className="space-y-7"
          >
            {/* Top Row - Streak + Weekly Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
