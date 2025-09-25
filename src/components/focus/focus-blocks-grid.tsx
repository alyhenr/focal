'use client'

import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Play, Zap, Battery, BatteryLow, Trophy } from 'lucide-react'
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
  low: { icon: BatteryLow, color: 'text-gray-500' },
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
              'relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200',
              'shadow-md hover:shadow-lg',
              // Base states
              !isCompleted && !isSelected && !isActive && 'border-border bg-gradient-to-br from-background to-background/80 hover:border-primary/50',
              // Selected state
              isSelected && !isCompleted && 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg',
              // Active state
              isActive && !isCompleted && 'border-success bg-gradient-to-br from-success/10 to-success/5 animate-pulse',
              // Completed state
              isCompleted && 'border-success/30 bg-gradient-to-br from-success/5 to-success/10',
              isCompleted && isSelected && 'border-success/50 shadow-lg',
              isCompleted && allCheckpointsComplete && 'border-success/40 bg-gradient-to-br from-success/10 to-warning/10'
            )}
            style={{
              backgroundImage: isActive && !isCompleted
                ? 'linear-gradient(135deg, transparent 0%, transparent 40%, rgba(134, 239, 172, 0.05) 100%)'
                : undefined,
            }}
          >
            {/* Session Number Badge */}
            <div className="absolute top-2 right-2">
              <span className="text-xs font-medium text-muted-foreground">
                #{focus.session_number}
              </span>
            </div>

            {/* Status Icon */}
            {isActive && !isCompleted && (
              <motion.div
                className="absolute top-2 left-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Play className="h-4 w-4 text-success" />
              </motion.div>
            )}
            {isCompleted && (
              <div className="absolute top-2 left-2">
                {allCheckpointsComplete ? (
                  <Trophy className="h-4 w-4 text-warning" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </div>
            )}

            {/* Completed Overlay */}
            {isCompleted && (
              <div className="absolute inset-0 rounded-lg pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-success/5 to-transparent rounded-lg" />
              </div>
            )}

            {/* Content */}
            <div className="space-y-2 mt-4">
              <h3 className="font-semibold text-sm line-clamp-2">{focus.title}</h3>

              {focus.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
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
                        ? 'text-warning font-semibold'
                        : 'text-success font-medium'
                      : 'text-muted-foreground'
                  )}>
                    {isCompleted && allCheckpointsComplete ? '✓ ' : ''}{checkpointStats} done
                  </span>
                </div>
                {!isCompleted && !isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onStartSession(focus.id)
                    }}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Start →
                  </button>
                )}
                {isCompleted && (
                  <span className="text-xs text-success font-medium">
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* Paper texture effect */}
            <div className="absolute inset-0 rounded-lg opacity-5 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, #e5e5e5, #e5e5e5 1px, transparent 1px, transparent 20px)',
              }}
            />
          </motion.div>
        )
      })}

      {/* New Focus Block */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewFocus}
        className="relative cursor-pointer rounded-lg border-2 border-dashed border-border p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 min-h-[140px] flex items-center justify-center"
      >
        <div className="text-center space-y-2">
          <Plus className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">New Focus Block</p>
        </div>
      </motion.div>
    </motion.div>
  )
}