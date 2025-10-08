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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
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
              'relative cursor-pointer rounded-xl p-6 transition-all duration-200 h-fit',
              'bg-card border',
              // Base shadow - enhanced
              'shadow-md hover:shadow-lg',
              // Selected state - more prominent
              isSelected && !isCompleted && 'ring-2 ring-primary/50 shadow-lg border-primary/30',
              // Active state - premium look
              isActive && !isCompleted && 'ring-2 ring-success/60 shadow-xl border-success/40',
              // Completed state
              isCompleted && 'opacity-75 bg-muted/50',
              isCompleted && isSelected && 'opacity-100',
              isCompleted && allCheckpointsComplete && 'bg-gradient-to-br from-card to-success/5 border-success/20'
            )}
            style={{
              transform: isActive && !isCompleted ? 'scale(1.01)' : undefined,
            }}
          >
            {/* Session Number - More subtle */}
            <div className="absolute top-4 right-4">
              <span className="text-xs font-semibold text-muted-foreground/70 px-2 py-0.5 rounded-md bg-muted/50">
                {focus.session_number}
              </span>
            </div>

            {/* Status Indicator - Minimal dot */}
            {(isActive || isCompleted) && (
              <div className="absolute top-4 left-4">
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  isActive && !isCompleted && 'bg-success animate-pulse shadow-sm',
                  isCompleted && !allCheckpointsComplete && 'bg-gray-400',
                  isCompleted && allCheckpointsComplete && 'bg-success shadow-sm'
                )} />
              </div>
            )}


            {/* Content */}
            <div className="flex flex-col justify-between h-fit">
              <h3 className="font-semibold text-[0.9375rem] leading-snug line-clamp-2 text-foreground mb-1">{focus.title}</h3>

              {focus.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 md:line-clamp-2 leading-relaxed">
                  {focus.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2.5">
                  {EnergyIcon && (
                    <EnergyIcon className={cn('h-3.5 w-3.5', energyColor)} />
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    isCompleted
                      ? allCheckpointsComplete
                        ? 'text-success'
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
                    className="text-sm text-primary hover:text-primary/80 font-semibold cursor-pointer hover:underline transition-all"
                  >
                    Start →
                  </button>
                )}
                {isCompleted && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </div>
            </div>

          </motion.div>
        )
      })}

      {/* New Focus Block - Enhanced */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewFocus}
        className="relative cursor-pointer rounded-xl p-6 transition-all duration-200 bg-gradient-to-br from-muted/50 to-primary/5 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:shadow-md h-28 flex items-center justify-center group"
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-muted/80 group-hover:bg-primary/15 flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">New Focus</p>
        </div>
      </motion.div>
    </motion.div>
  )
}