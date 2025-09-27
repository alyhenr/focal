'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Focus } from '@/types/focus'
import {
  CheckCircle2,
  Circle,
  Zap,
  Battery,
  BatteryLow,
  Target,
  Calendar,
  Clock,
  Hash
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface FocusDetailModalProps {
  focus: Focus | null
  isOpen: boolean
  onClose: () => void
}

const energyIcons = {
  high: { icon: Zap, label: 'High Energy', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  medium: { icon: Battery, label: 'Medium Energy', color: 'text-blue-500', bg: 'bg-blue-50' },
  low: { icon: BatteryLow, label: 'Low Energy', color: 'text-gray-500', bg: 'bg-gray-50' }
}

export function FocusDetailModal({ focus, isOpen, onClose }: FocusDetailModalProps) {
  if (!focus) return null

  const isCompleted = !!focus.completed_at
  const completedCheckpoints = focus.checkpoints?.filter(c => c.completed_at) || []
  const totalCheckpoints = focus.checkpoints?.length || 0
  const progress = totalCheckpoints > 0 ? (completedCheckpoints.length / totalCheckpoints) * 100 : 0
  const energyInfo = focus.energy_level ? energyIcons[focus.energy_level] : null

  // Calculate duration if completed
  let duration = null
  if (focus.completed_at) {
    const start = parseISO(focus.started_at)
    const end = parseISO(focus.completed_at)
    const durationMs = end.getTime() - start.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="space-y-4 pb-4 border-b border-gray-100 pr-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{focus.title}</h2>
              {focus.description && (
                <p className="text-sm text-gray-600 mt-1">{focus.description}</p>
              )}
            </div>
            {isCompleted ? (
              <div className="flex items-center gap-1 px-2 py- bg-success/10 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-xs font-medium text-success">Completed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                <Circle className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">In Progress</span>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {format(parseISO(focus.date), 'MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Session #{focus.session_number}</span>
            </div>
            {duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 py-4">
          {/* Energy Level */}
          {energyInfo && (
            <div className={cn('rounded-lg p-3', energyInfo.bg)}>
              <div className="flex items-center gap-2">
                <energyInfo.icon className={cn('h-5 w-5', energyInfo.color)} />
                <div>
                  <p className="text-xs text-gray-600">Energy</p>
                  <p className="text-sm font-medium capitalize">{focus.energy_level}</p>
                </div>
              </div>
            </div>
          )}

          {/* Goal */}
          <div className={cn(
            'rounded-lg p-3',
            focus.north_star ? 'bg-primary/10' : 'bg-gray-50'
          )}>
            <div className="flex items-center gap-2">
              <Target className={cn(
                'h-5 w-5',
                focus.north_star ? 'text-primary' : 'text-gray-400'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">Goal</p>
                <p className="text-sm font-medium truncate">
                  {focus.north_star?.title || 'No goal'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-lg p-3 bg-gray-50">
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Progress</p>
              <p className="text-sm font-medium">
                {completedCheckpoints.length}/{totalCheckpoints} checkpoints
              </p>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-success"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Checkpoints */}
        {focus.checkpoints && focus.checkpoints.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Checkpoints</h3>
            <div className="space-y-2">
              {focus.checkpoints.map((checkpoint, index) => (
                <motion.div
                  key={checkpoint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    checkpoint.completed_at ? 'bg-success/5' : 'bg-gray-50'
                  )}
                >
                  {checkpoint.completed_at ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm",
                    checkpoint.completed_at && "line-through text-gray-500"
                  )}>
                    {checkpoint.title}
                  </span>
                  {checkpoint.completed_at && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {format(parseISO(checkpoint.completed_at), 'h:mm a')}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Timeline</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Started</span>
              <span className="font-medium">
                {format(parseISO(focus.started_at), 'h:mm a')}
              </span>
            </div>
            {focus.completed_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium">
                  {format(parseISO(focus.completed_at), 'h:mm a')}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}