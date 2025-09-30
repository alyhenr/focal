'use client'

import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Zap, Battery, BatteryLow } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Focus } from '@/types/focus'

interface FocusBlocksGridProps {
  focuses: Focus[]
  activeFocusId: string | null
  selectedFocusId: string | null
  onSelectFocus: (focusId: string | null) => void
  onNewFocus: () => void
  onStartSession: (focusId: string) => void
}

const energyIcons = {
  high: { icon: Zap, color: 'text-yellow-500' },
  medium: { icon: Battery, color: 'text-blue-500' },
  low: { icon: BatteryLow, color: 'text-muted-foreground' },
}

export function FocusBlocksGrid({
  focuses,
  activeFocusId,
  selectedFocusId,
  onSelectFocus,
  onNewFocus,
  onStartSession,
}: FocusBlocksGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {focuses.map((focus) => {
        const isActive = focus.id === activeFocusId
        const isSelected = focus.id === selectedFocusId
        const isCompleted = !!focus.completed_at
        const EnergyIcon = focus.energy_level ? energyIcons[focus.energy_level].icon : null
        const energyColor = focus.energy_level ? energyIcons[focus.energy_level].color : ''

        const completedCheckpoints = focus.checkpoints?.filter(c => c.completed_at).length || 0
        const totalCheckpoints = focus.checkpoints?.length || 0
        const checkpointStats = `${completedCheckpoints}/${totalCheckpoints}`
        const allCheckpointsComplete = totalCheckpoints > 0 && completedCheckpoints === totalCheckpoints

        return (
          <motion.div
            key={focus.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectFocus(isSelected ? null : focus.id)}
            className={cn(
              'relative cursor-pointer rounded-lg p-5 transition-all duration-150 h-24',
              'bg-card',
              // Base shadow
              'shadow-sm hover:shadow-md',
              // Selected state
              isSelected && !isCompleted && 'ring-2 ring-primary/40 shadow-md',
              // Active state (pulsing replaced with breathing scale)
              isActive && !isCompleted && 'ring-2 ring-success/50 shadow-lg',
              // Completed state
              isCompleted && 'opacity-75 bg-muted',
              isCompleted && isSelected && 'opacity-100',
              isCompleted && allCheckpointsComplete && 'bg-gradient-to-br from-white to-success/5'
            )}
            style={{
              transform: isActive && !isCompleted ? 'scale(1.01)' : undefined,
            }}
          >
            {/* Session Number - More subtle */}
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-medium text-muted-foreground">
                {focus.session_number}
              </span>
            </div>

            {/* Status Indicator - Minimal dot */}
            {(isActive || isCompleted) && (
              <div className="absolute top-3 left-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isActive && !isCompleted && 'bg-success animate-pulse',
                  isCompleted && !allCheckpointsComplete && 'bg-gray-400',
                  isCompleted && allCheckpointsComplete && 'bg-success'
                )} />
              </div>
            )}


            {/* Content */}
            <div className="flex flex-col justify-between h-fit">
              <h3 className="font-semibold text-sm line-clamp-2 text-foreground">{focus.title}</h3>

              {focus.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 md:line-clamp-2">
                  {focus.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {EnergyIcon && (
                    <EnergyIcon className={cn('h-3 w-3', energyColor)} />
                  )}
                  <span className={cn(
                    'text-xs',
                    isCompleted
                      ? allCheckpointsComplete
                        ? 'text-success font-medium'
                        : 'text-muted-foreground'
                      : 'text-muted-foreground'
                  )}>
                    {checkpointStats}
                  </span>
                </div>
                {!isCompleted && !isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onStartSession(focus.id)
                    }}
                    className="text-xs text-primary hover:text-primary/80 font-medium cursor-pointer hover:underline"
                  >
                    Start →
                  </button>
                )}
                {isCompleted && (
                  <CheckCircle2 className="h-3 w-3 text-success" />
                )}
              </div>
            </div>

          </motion.div>
        )
      })}

      {/* New Focus Block */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewFocus}
        className="relative cursor-pointer rounded-lg p-5 transition-all duration-150 bg-muted hover:bg-muted h-24 flex items-center justify-center group"
      >
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
            <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
          </div>
          <p className="text-xs font-medium text-muted-foreground group-hover:text-primary">New Focus</p>
        </div>
      </motion.div>
    </motion.div>
  )
}