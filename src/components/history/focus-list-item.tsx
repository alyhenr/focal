'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Focus } from '@/types/focus'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  Circle,
  Zap,
  Battery,
  BatteryLow,
  Target,
  Clock,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { format, parseISO, differenceInMinutes } from 'date-fns'

interface FocusListItemProps {
  focus: Focus
  isExpanded: boolean
  onExpand: () => void
  onDetailClick: () => void
  delay?: number
}

const energyIcons = {
  high: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  medium: { icon: Battery, color: 'text-blue-500', bg: 'bg-blue-50' },
  low: { icon: BatteryLow, color: 'text-gray-500', bg: 'bg-gray-50' }
}

export function FocusListItem({
  focus,
  isExpanded,
  onExpand,
  onDetailClick,
  delay = 0
}: FocusListItemProps) {
  const isCompleted = !!focus.completed_at
  const completedCheckpoints = focus.checkpoints?.filter(c => c.completed_at) || []
  const totalCheckpoints = focus.checkpoints?.length || 0
  const progress = totalCheckpoints > 0 ? (completedCheckpoints.length / totalCheckpoints) * 100 : 0
  const EnergyIcon = focus.energy_level ? energyIcons[focus.energy_level].icon : null
  const energyConfig = focus.energy_level ? energyIcons[focus.energy_level] : null

  // Calculate duration
  let duration = null
  if (focus.completed_at) {
    const minutes = differenceInMinutes(parseISO(focus.completed_at), parseISO(focus.started_at))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        "rounded-lg border transition-all",
        isCompleted ? "bg-gray-50/50 border-gray-200" : "bg-white border-gray-200",
        "hover:shadow-sm"
      )}
    >
      {/* Main Row */}
      <div
        className="px-4 py-3 flex items-center gap-4 cursor-pointer"
        onClick={onExpand}
      >
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" />
          )}
        </div>

        {/* Session Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "font-medium text-sm",
                  isCompleted ? "text-gray-700" : "text-foreground"
                )}>
                  {focus.title}
                </h4>
                <span className="text-xs text-gray-500">#{focus.session_number}</span>
              </div>

              {focus.description && (
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  {focus.description}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex items-center gap-3 mt-2">
                {/* Energy Level */}
                {EnergyIcon && energyConfig && (
                  <div className="flex items-center gap-1">
                    <EnergyIcon className={cn('h-3 w-3', energyConfig.color)} />
                    <span className="text-xs capitalize text-gray-600">{focus.energy_level}</span>
                  </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {format(parseISO(focus.started_at), 'h:mm a')}
                    {duration && ` • ${duration}`}
                  </span>
                </div>

                {/* Goal */}
                {focus.north_star && (
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-primary" />
                    <span className="text-xs text-primary">{focus.north_star.title}</span>
                  </div>
                )}

                {/* Checkpoints */}
                {totalCheckpoints > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      {completedCheckpoints.length}/{totalCheckpoints}
                    </span>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-success"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDetailClick()
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="View details"
              >
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </button>

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && ((focus.checkpoints && focus.checkpoints.length > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Checkpoints:</p>
              {focus.checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  className="flex items-center gap-2 pl-2"
                >
                  {checkpoint.completed_at ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-xs",
                    checkpoint.completed_at && "line-through text-gray-500"
                  )}>
                    {checkpoint.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) || (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-bold text-gray-600 mb-2">No checkpoints created in this session</p>
            </div>
          </motion.div>
        ))
        }
      </AnimatePresence>
    </motion.div>
  )
}