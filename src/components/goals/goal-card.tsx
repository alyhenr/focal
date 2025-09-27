'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@/components/ui/circular-progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Target,
  Calendar,
  MoreHorizontal,
  Edit2,
  Archive,
  CheckCircle2,
  Trophy,
  Zap,
  Focus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { updateNorthStar, archiveNorthStar, completeNorthStar } from '@/app/actions/focus'
import { toast } from 'sonner'
import { EditGoalModal } from './edit-goal-modal'

interface GoalCardProps {
  goal: any
  onUpdate: (goalId: string, updates: any) => void
  onArchive: (goalId: string) => void
  viewMode?: 'grid' | 'list'
}

export function GoalCard({ goal, onUpdate, onArchive, viewMode = 'grid' }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const isCompleted = !!goal.completed_at
  const progress = goal.progress || { total: 0, completed: 0, percentage: 0 }

  const handleArchive = async () => {
    try {
      await archiveNorthStar(goal.id)
      onArchive(goal.id)
      toast.success('Goal archived')
    } catch {
      toast.error('Failed to archive goal')
    }
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await completeNorthStar(goal.id)
      onUpdate(goal.id, { completed_at: new Date().toISOString() })
      toast.success('🎉 Goal completed! Congratulations!')
    } catch {
      toast.error('Failed to complete goal')
    } finally {
      setIsCompleting(false)
    }
  }

  const handleEdit = async (data: any) => {
    try {
      await updateNorthStar(goal.id, data)
      onUpdate(goal.id, data)
      setIsEditing(false)
      toast.success('Goal updated')
    } catch {
      toast.error('Failed to update goal')
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className={cn(
          'group relative bg-white rounded-xl border transition-all duration-200',
          isCompleted
            ? 'border-primary/30 bg-primary/5'
            : 'border-gray-100 hover:border-primary/20 hover:shadow-lg',
          viewMode === 'list' && 'flex items-center gap-4'
        )}
      >
        {/* Completion Badge */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-3 -right-3 z-10"
          >
            <div className="bg-primary text-white p-2 rounded-full shadow-lg">
              <Trophy className="h-4 w-4" />
            </div>
          </motion.div>
        )}

        <div className="p-6 space-y-4 w-full">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className={cn(
                  'h-4 w-4',
                  isCompleted ? 'text-primary' : 'text-gray-400'
                )} />
                <h3 className={cn(
                  'font-semibold text-lg',
                  isCompleted && 'line-through decoration-primary/50'
                )}>
                  {goal.title}
                </h3>
              </div>
              {goal.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {goal.description}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {!isCompleted && progress.percentage === 100 && (
                  <DropdownMenuItem onClick={handleComplete}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Progress Section with Circular Ring */}
          {progress.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="text-sm text-gray-600">Journey Progress</div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Focus className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {progress.completed} of {progress.total} sessions
                  </span>
                </div>
                {progress.percentage === 100 && !isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 mt-2"
                  >
                    <Zap className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400/90 font-medium">
                      Ready to complete!
                    </span>
                  </motion.div>
                )}
              </div>

              <CircularProgress
                value={progress.percentage}
                size={70}
                strokeWidth={5}
                showValue={true}
              />
            </div>
          )}

          {/* Target Date */}
          {goal.target_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
            </div>
          )}

          {/* Stats */}
          <div className="pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
            <span>Created {format(new Date(goal.created_at), 'MMM d')}</span>
            {isCompleted && (
              <span className="text-primary font-medium">
                Completed {format(new Date(goal.completed_at), 'MMM d')}
              </span>
            )}
          </div>
        </div>

        {/* Completion Animation Overlay */}
        {isCompleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <Trophy className="h-12 w-12 text-primary" />
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <EditGoalModal
        open={isEditing}
        onOpenChange={setIsEditing}
        goal={goal}
        onSubmit={handleEdit}
      />
    </>
  )
}