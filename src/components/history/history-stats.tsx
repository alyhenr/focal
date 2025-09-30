'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  CheckCircle2,
  Flame,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistoryStatsProps {
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
}

export function HistoryStats({ stats, streakData }: HistoryStatsProps) {
  const formatTime = (hour: number | null) => {
    if (hour === null) return 'N/A'
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:00 ${period}`
  }

  const statCards = [
    {
      title: 'Completion Rate',
      value: `${Math.round(stats.completionRate)}%`,
      subValue: `${stats.completedSessions} of ${stats.totalSessions} sessions`,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Current Streak',
      value: `${streakData.currentStreak} ${streakData.currentStreak === 1 ? 'day' : 'days'}`,
      subValue: `Best: ${streakData.longestStreak} days`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Productivity',
      value: `${stats.avgCheckpointsPerSession.toFixed(1)}`,
      subValue: 'Checkpoints per session',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Peak Time',
      value: formatTime(stats.mostProductiveTime),
      subValue: 'Most active hour',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statCards.map((stat) => (
        <motion.div
          key={stat.title}
          variants={itemVariants}
          className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
            </div>
            <div className={cn('p-2 rounded-lg', stat.bgColor)}>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}