'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LoadingButton } from '@/components/common/loading-button'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Battery,
  BatteryLow,
  TrendingUp,
  Award,
  XCircle,
} from 'lucide-react'
import { Focus } from '@/types/focus'
import { cn } from '@/lib/utils'

interface SessionReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  focus: Focus
  onConfirm: () => Promise<void>
  mode: 'complete' | 'stop'
}

const energyIcons = {
  high: { icon: Zap, color: 'text-yellow-500', label: 'High Energy' },
  medium: { icon: Battery, color: 'text-blue-500', label: 'Medium Energy' },
  low: { icon: BatteryLow, color: 'text-gray-500', label: 'Low Energy' },
}

export function SessionReviewModal({
  open,
  onOpenChange,
  focus,
  onConfirm,
  mode,
}: SessionReviewModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const checkpoints = focus.checkpoints || []
  const completedCount = checkpoints.filter(cp => cp.completed_at).length
  const incompletedCount = checkpoints.length - completedCount
  const progress = checkpoints.length > 0 ? (completedCount / checkpoints.length) * 100 : 0
  const allCompleted = checkpoints.length > 0 && completedCount === checkpoints.length

  const EnergyIcon = focus.energy_level ? energyIcons[focus.energy_level].icon : null
  const energyConfig = focus.energy_level ? energyIcons[focus.energy_level] : null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const timeSpent = focus.started_at
    ? Math.floor((new Date().getTime() - new Date(focus.started_at).getTime()) / 1000 / 60)
    : 0
  const hours = Math.floor(timeSpent / 60)
  const minutes = timeSpent % 60

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'complete' ? (
              <>
                <Award className="h-5 w-5 text-success" />
                Complete Session
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-warning" />
                Stop Session
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'complete'
              ? 'Great work! Here\'s your session summary:'
              : 'Are you sure you want to stop this session?'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Session Title & Energy */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{focus.title}</h3>
            {focus.description && (
              <p className="text-sm text-muted-foreground">{focus.description}</p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                Session {focus.session_number}
              </Badge>
              {energyConfig && EnergyIcon && (
                <Badge variant="outline" className="bg-muted">
                  <EnergyIcon className={cn('h-3 w-3 mr-1', energyConfig.color)} />
                  <span className="text-xs">{energyConfig.label}</span>
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Time Spent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Spent</span>
            </div>
            <span className="text-sm font-semibold">
              {hours > 0 && `${hours}h `}{minutes}m
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className={cn(
                'font-semibold',
                allCompleted ? 'text-success' : progress >= 50 ? 'text-primary' : 'text-muted-foreground'
              )}>
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Checkpoints Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Checkpoints</h4>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  {completedCount}
                </span>
                {incompletedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Circle className="h-3 w-3 text-muted-foreground" />
                    {incompletedCount}
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-1">
              {checkpoints
                .sort((a, b) => a.display_order - b.display_order)
                .map((checkpoint) => (
                  <motion.div
                    key={checkpoint.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 py-1"
                  >
                    {checkpoint.completed_at ? (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={cn(
                      'text-sm',
                      checkpoint.completed_at && 'line-through text-muted-foreground'
                    )}>
                      {checkpoint.title}
                    </span>
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Achievement Badge for Completion */}
          {mode === 'complete' && allCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-center p-3 bg-success/10 rounded-lg border border-success/20"
            >
              <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm font-semibold text-success">Perfect Session!</p>
              <p className="text-xs text-muted-foreground">All checkpoints completed</p>
            </motion.div>
          )}

          {/* Warning for Stop */}
          {mode === 'stop' && incompletedCount > 0 && (
            <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
              <p className="text-sm text-warning font-medium">
                {incompletedCount} checkpoint{incompletedCount > 1 ? 's' : ''} will remain incomplete
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <LoadingButton
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            variant={mode === 'complete' ? 'default' : 'destructive'}
            className="flex-1"
            onClick={handleConfirm}
            loading={isLoading}
            loadingText={mode === 'complete' ? 'Completing...' : 'Stopping...'}
          >
            {mode === 'complete' ? '🎉 Complete Session' : 'Stop Session'}
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}