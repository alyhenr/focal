'use client'

import { motion } from 'framer-motion'
import { Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import type { NorthStar } from '@/types/focus'

interface GoalsProgressProps {
  goals: NorthStar[]
  goalsProgress?: Record<string, { completed: number; total: number }>
}

export function GoalsProgress({ goals, goalsProgress = {} }: GoalsProgressProps) {
  const activeGoals = goals.filter(g => !g.archived_at && !g.completed_at)

  if (activeGoals.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Target className="h-4 w-4 text-secondary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Goals Progress
            </h3>
            <p className="text-xs text-muted-foreground">
              {activeGoals.length} active {activeGoals.length === 1 ? 'goal' : 'goals'}
            </p>
          </div>
        </div>
        <Link
          href="/goals"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {activeGoals.slice(0, 3).map((goal) => {
          const progress = goalsProgress[goal.id] || { completed: 0, total: 0 }
          const percentage = progress.total > 0
            ? Math.round((progress.completed / progress.total) * 100)
            : 0

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {goal.title}
                </p>
                <span className="text-xs text-muted-foreground">
                  {progress.completed}/{progress.total}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )
        })}
      </div>

      {activeGoals.length > 3 && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          +{activeGoals.length - 3} more {activeGoals.length - 3 === 1 ? 'goal' : 'goals'}
        </p>
      )}
    </motion.div>
  )
}
