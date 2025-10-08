'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface StreakWidgetProps {
  streakData: {
    currentStreak: number
    longestStreak: number
    lastFocusDate: string | null
  }
  sparklineData?: Array<{ day: string; value: number }>
}

export function StreakWidget({ streakData, sparklineData = [] }: StreakWidgetProps) {
  const hasStreak = streakData.currentStreak > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              'p-2 rounded-lg transition-colors',
              hasStreak ? 'bg-orange-500/10' : 'bg-muted'
            )}>
              <Flame className={cn(
                'h-5 w-5',
                hasStreak ? 'text-orange-500' : 'text-muted-foreground'
              )} />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-foreground">
              {streakData.currentStreak}
            </p>
            <p className="text-sm text-muted-foreground">
              {streakData.currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Best: {streakData.longestStreak} {streakData.longestStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>

      {/* Sparkline - Last 7 days activity */}
      {sparklineData.length > 0 && (
        <div className="mt-4">
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={hasStreak ? '#86EFAC' : '#9CA3AF'}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 px-1">
            {sparklineData.slice(0, 7).map((item, index) => (
              <span key={index} className="text-[10px] font-medium text-muted-foreground/80">
                {item.day}
              </span>
            ))}
          </div>
        </div>
      )}

      {!hasStreak && (
        <p className="text-xs text-muted-foreground mt-4 italic">
          Complete a focus session to start your streak
        </p>
      )}
    </motion.div>
  )
}
