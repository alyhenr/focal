'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LoadingButton } from '@/components/common/loading-button'
import { InlineEditor } from '@/components/common/inline-editor'
import {
  CheckCircle2,
  Circle,
  Target,
  Zap,
  Battery,
  BatteryLow,
  Plus,
  X,
  Play,
  Pause,
  Square,
  Clock,
  Edit2,
} from 'lucide-react'
import { Focus } from '@/types/focus'
import { cn } from '@/lib/utils'

interface FocusCardProps {
  focus: Focus
  isActive: boolean
  isFocusMode: boolean
  isPaused?: boolean
  onStart: () => Promise<void>
  onPause: () => Promise<void>
  onResume: () => Promise<void>
  onComplete: () => Promise<void>
  onStop: () => Promise<void>
  onDelete: () => Promise<void>
  onAddCheckpoint: (title: string) => Promise<void>
  onToggleCheckpoint: (checkpointId: string) => Promise<void>
  onEditCheckpoint: (checkpointId: string, title: string) => Promise<void>
  onDeleteCheckpoint: (checkpointId: string) => Promise<void>
}

const energyIcons = {
  high: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  medium: { icon: Battery, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  low: { icon: BatteryLow, color: 'text-gray-500', bg: 'bg-gray-500/10' },
}

export function FocusCard({
  focus,
  isActive,
  isFocusMode,
  isPaused = false,
  onStart,
  onPause,
  onResume,
  onComplete,
  onStop,
  onDelete,
  onAddCheckpoint,
  onToggleCheckpoint,
  onEditCheckpoint,
  onDeleteCheckpoint,
}: FocusCardProps) {
  const [isAddingCheckpoint, setIsAddingCheckpoint] = useState(false)
  const [editingCheckpointId, setEditingCheckpointId] = useState<string | null>(null)
  const [deletingCheckpointId, setDeletingCheckpointId] = useState<string | null>(null)
  const [loadingStates, setLoadingStates] = useState({
    start: false,
    pause: false,
    resume: false,
    complete: false,
    stop: false,
    delete: false,
  })

  const checkpoints = focus.checkpoints || []
  const completedCount = checkpoints.filter(cp => cp.completed_at).length
  const progress = checkpoints.length > 0 ? (completedCount / checkpoints.length) * 100 : 0
  const allCompleted = checkpoints.length > 0 && completedCount === checkpoints.length

  const EnergyIcon = focus.energy_level ? energyIcons[focus.energy_level].icon : null
  const energyConfig = focus.energy_level ? energyIcons[focus.energy_level] : null

  const handleAction = async (action: 'start' | 'pause' | 'resume' | 'complete' | 'stop' | 'delete', fn: () => Promise<void>) => {
    setLoadingStates(prev => ({ ...prev, [action]: true }))
    try {
      await fn()
    } finally {
      setLoadingStates(prev => ({ ...prev, [action]: false }))
    }
  }

  const handleAddCheckpoint = async (title: string) => {
    await onAddCheckpoint(title)
    setIsAddingCheckpoint(false)
  }

  const handleDeleteCheckpoint = (checkpointId: string) => {
    if (deletingCheckpointId === checkpointId) {
      // Second click confirms deletion
      onDeleteCheckpoint(checkpointId)
      setDeletingCheckpointId(null)
    } else {
      // First click sets to confirm state
      setDeletingCheckpointId(checkpointId)
      // Reset after 3 seconds
      setTimeout(() => setDeletingCheckpointId(null), 3000)
    }
  }

  return (
    <Card className={cn(
      'transition-all duration-150 border-0',
      'bg-white shadow-sm',
      isFocusMode && 'shadow-lg ring-2 ring-primary/30'
    )}>
      <CardHeader className="pb-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  Session {focus.session_number}
                </span>
                {energyConfig && EnergyIcon && (
                  <div className="flex items-center gap-1">
                    <EnergyIcon className={cn('h-3 w-3', energyConfig.color)} />
                    <span className="text-xs text-gray-500 capitalize">{focus.energy_level}</span>
                  </div>
                )}
                {focus.north_star && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Target className="h-3 w-3" />
                    {focus.north_star.title}
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground">{focus.title}</h2>
              {focus.description && (
                <p className="text-sm text-muted-foreground">{focus.description}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {completedCount} of {checkpoints.length} checkpoints
              </span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Timer Bar - Cleaner */}
          {isActive && (
            <div className="bg-gray-50 rounded-md p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-foreground">00:00:00</span>
                {isPaused && (
                  <span className="text-xs text-warning px-2 py-0.5 bg-warning/10 rounded">
                    Paused
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {isPaused ? 'Session paused' : 'Timer coming soon'}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Checkpoints */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Checkpoints</h4>
            {checkpoints.length < 3 && !isAddingCheckpoint && (
              <button
                onClick={() => setIsAddingCheckpoint(true)}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                <Plus className="h-3 w-3 inline mr-1" />
                Add
              </button>
            )}
          </div>

          <AnimatePresence>
            {checkpoints.length === 0 && !isAddingCheckpoint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6 bg-gray-50 rounded-lg"
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Break down your focus into smaller steps
                </p>
                <button
                  onClick={() => setIsAddingCheckpoint(true)}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add First Checkpoint
                </button>
              </motion.div>
            )}

            {/* Checkpoint List */}
            {checkpoints
              .sort((a, b) => a.display_order - b.display_order)
              .map((checkpoint) => (
                <motion.div
                  key={checkpoint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group"
                >
                  {editingCheckpointId === checkpoint.id ? (
                    <InlineEditor
                      value={checkpoint.title}
                      onSave={async (value) => {
                        await onEditCheckpoint(checkpoint.id, value)
                        setEditingCheckpointId(null)
                      }}
                      onCancel={() => setEditingCheckpointId(null)}
                      placeholder="Checkpoint title..."
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                      <button
                        onClick={() => onToggleCheckpoint(checkpoint.id)}
                        className="flex-shrink-0 cursor-pointer transition-all hover:scale-110"
                      >
                        {checkpoint.completed_at ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400 hover:text-primary" />
                        )}
                      </button>
                      <span
                        className={cn(
                          'flex-1 text-sm cursor-pointer',
                          checkpoint.completed_at && 'line-through text-muted-foreground'
                        )}
                        onClick={() => setEditingCheckpointId(checkpoint.id)}
                      >
                        {checkpoint.title}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={() => setEditingCheckpointId(checkpoint.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCheckpoint(checkpoint.id)}
                          className={cn(
                            'p-1 rounded transition-colors',
                            deletingCheckpointId === checkpoint.id
                              ? 'bg-destructive/20 text-destructive'
                              : 'hover:bg-gray-100 text-gray-400 hover:text-destructive'
                          )}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

            {/* Add Checkpoint Input */}
            {isAddingCheckpoint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <InlineEditor
                  value=""
                  onSave={handleAddCheckpoint}
                  onCancel={() => setIsAddingCheckpoint(false)}
                  placeholder="What needs to be done?"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {!isActive ? (
            <>
              <LoadingButton
                className="flex-1"
                onClick={() => handleAction('start', onStart)}
                loading={loadingStates.start}
                loadingText="Starting..."
              >
                <Play className="mr-2 h-4 w-4" />
                Start Focus Mode
              </LoadingButton>
              <LoadingButton
                variant="outline"
                className="flex-1"
                onClick={() => handleAction('complete', onComplete)}
                loading={loadingStates.complete}
                loadingText="Completing..."
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </LoadingButton>
              {!focus.completed_at && (
                <LoadingButton
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAction('delete', onDelete)}
                  loading={loadingStates.delete}
                  className="text-destructive hover:text-destructive/80"
                  title="Delete this focus session"
                >
                  <X className="h-4 w-4" />
                </LoadingButton>
              )}
            </>
          ) : (
            <>
              {isPaused ? (
                <LoadingButton
                  variant="default"
                  className="flex-1"
                  onClick={() => handleAction('resume', onResume)}
                  loading={loadingStates.resume}
                  loadingText="Resuming..."
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </LoadingButton>
              ) : (
                <LoadingButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAction('pause', onPause)}
                  loading={loadingStates.pause}
                  loadingText="Pausing..."
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </LoadingButton>
              )}
              <LoadingButton
                variant="default"
                className="flex-1"
                onClick={() => handleAction('complete', onComplete)}
                loading={loadingStates.complete}
                loadingText="Completing..."
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </LoadingButton>
              <LoadingButton
                variant="ghost"
                size="icon"
                onClick={() => handleAction('stop', onStop)}
                loading={loadingStates.stop}
                className="text-muted-foreground hover:text-destructive"
                title="Stop this session"
              >
                <Square className="h-4 w-4" />
              </LoadingButton>
            </>
          )}
        </div>

        {/* Auto-complete message - Cleaner */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-3 bg-success/5 rounded-md"
          >
            <p className="text-sm font-medium text-success flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              All checkpoints complete
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}