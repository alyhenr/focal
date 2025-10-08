'use client'

import { motion } from 'framer-motion'
import { Calendar, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeeklySummaryProps {
  weeklyStats: {
    totalSessions: number
    avgCheckpoints: number
    mostProductiveDay: string | null
  }
}

export function WeeklySummary({ weeklyStats }: WeeklySummaryProps) {
  const cards = [
    {
      title: 'This Week',
      value: weeklyStats.totalSessions,
      subValue: weeklyStats.totalSessions === 1 ? 'session' : 'sessions',
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Avg Tasks',
      value: weeklyStats.avgCheckpoints.toFixed(1),
      subValue: 'per session',
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Best Day',
      value: weeklyStats.mostProductiveDay || 'N/A',
      subValue: 'most productive',
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      valueSmaller: true
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
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {cards.map((card) => (
        <motion.div
          key={card.title}
          variants={itemVariants}
          className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
              <p className={cn(
                'font-semibold text-foreground',
                card.valueSmaller ? 'text-xl' : 'text-2xl'
              )}>
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{card.subValue}</p>
            </div>
            <div className={cn('p-2 rounded-lg', card.bgColor)}>
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
