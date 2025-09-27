'use client'

import { motion } from 'framer-motion'
import { History, ArrowRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface EmptyHistoryStateProps {
  dateRange: {
    start: string
    end: string
    preset: string
  }
}

export function EmptyHistoryState({ dateRange }: EmptyHistoryStateProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center py-12"
    >
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <History className="h-12 w-12 text-primary" />
      </div>

      <h2 className="text-2xl font-semibold text-foreground mb-3">
        No Focus Sessions Yet
      </h2>

      <p className="text-gray-600 max-w-md mb-8">
        {dateRange.preset === 'today'
          ? "You haven't created any focus sessions today. Start your first session to begin tracking your progress."
          : dateRange.preset === 'all'
          ? "You haven't created any focus sessions yet. Start your journey by creating your first focus session."
          : `No focus sessions found in the selected time period. Try adjusting the date range or create a new focus session.`}
      </p>

      <div className="flex gap-3">
        <Button
          onClick={() => router.push('/dashboard')}
          className="gap-2"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>

        {dateRange.preset !== 'all' && (
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams()
              params.set('range', 'all')
              router.push(`/history?${params.toString()}`)
            }}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            View All Time
          </Button>
        )}
      </div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-6 bg-gray-50 rounded-lg max-w-md"
      >
        <p className="text-sm text-gray-600 italic">
          &ldquo;A journey of a thousand miles begins with a single step.&rdquo;
        </p>
        <p className="text-xs text-gray-500 mt-2">— Lao Tzu</p>
      </motion.div>
    </motion.div>
  )
}