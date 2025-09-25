'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, ListTodo, Calendar, History, Flame, TrendingUp, X } from 'lucide-react'
import { NewFocusModal } from '@/components/focus/new-focus-modal'
import { FocusBlocksGrid } from '@/components/focus/focus-blocks-grid'
import { FocusCard } from '@/components/focus/focus-card'
import { SessionReviewModal } from '@/components/focus/session-review-modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFocusStore } from '@/stores/focus-store'
import {
  createFocusSession,
  completeFocusSession,
  cancelFocusSession,
  addCheckpoint as addCheckpointAction,
  toggleCheckpoint as toggleCheckpointAction,
  updateCheckpoint as updateCheckpointAction,
  deleteCheckpoint as deleteCheckpointAction,
} from '@/app/actions/focus'
import { Focus, NorthStar } from '@/types/focus'

interface DashboardContentProps {
  user: {
    id: string
    email?: string
  }
  todayFocuses: Focus[]
  activeFocus: Focus | null
  northStars: NorthStar[]
}

export function DashboardContent({
  user,
  todayFocuses: initialFocuses,
  activeFocus: initialActiveFocus,
  northStars,
}: DashboardContentProps) {
  const [showNewFocusModal, setShowNewFocusModal] = useState(false)
  const [reviewModal, setReviewModal] = useState<{ open: boolean; mode: 'complete' | 'stop'; focus?: Focus }>({
    open: false,
    mode: 'complete',
  })

  // Zustand store
  const {
    todayFocuses,
    activeFocus,
    selectedFocusId,
    isFocusMode,
    isPaused,
    setTodayFocuses,
    setActiveFocus,
    setSelectedFocusId,
    setFocusMode,
    setPaused,
    addFocus,
    updateFocus,
    removeFocus,
    addCheckpoint,
    updateCheckpoint,
    removeCheckpoint,
  } = useFocusStore()

  const selectedFocus = todayFocuses.find(f => f.id === selectedFocusId)
  const sessionNumber = todayFocuses.length + 1

  // Track if this is the initial mount
  const [isInitialMount, setIsInitialMount] = useState(true)

  // Initialize store with server data
  useEffect(() => {
    if (isInitialMount) {
      // On initial mount, set everything from server
      setTodayFocuses(initialFocuses)
      setActiveFocus(initialActiveFocus)
      if (initialActiveFocus) {
        setSelectedFocusId(initialActiveFocus.id)
      }
      setIsInitialMount(false)
    } else {
      // On subsequent updates, merge server data while preserving selection
      // Update focuses but keep the current selection
      setTodayFocuses(initialFocuses)

      // Only update active focus if it changed on the server
      if (initialActiveFocus?.id !== activeFocus?.id) {
        setActiveFocus(initialActiveFocus)
      }

      // Preserve selectedFocusId unless the selected focus was deleted
      if (selectedFocusId && !initialFocuses.some(f => f.id === selectedFocusId)) {
        setSelectedFocusId(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFocuses, initialActiveFocus])

  // ESC key listener for focus mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFocusMode) {
        setPaused(true)
        setFocusMode(false)
        // We don't want to import toast in the effect, so we'll skip the notification
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocusMode, setPaused, setFocusMode])

  // Focus Session Actions
  const handleCreateFocus = async (data: {
    title: string
    description?: string
    energy_level?: 'high' | 'medium' | 'low'
    north_star_id?: string
  }) => {
    try {
      const newFocus = await createFocusSession(data)
      if (newFocus) {
        addFocus({ ...newFocus, checkpoints: [] })
        setSelectedFocusId(newFocus.id)
        toast.success('Focus session created!', {
          description: `Session ${sessionNumber} is ready to go`,
        })
      }
    } catch (error) {
      toast.error('Failed to create focus session', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
      throw error
    }
  }

  const handleStartSession = async (focusId: string) => {
    const focus = todayFocuses.find(f => f.id === focusId)
    if (!focus) return

    setActiveFocus(focus)
    setSelectedFocusId(focusId)
    setFocusMode(true)
    setPaused(false)
    toast.success('Focus session started!', {
      description: 'Time to get in the zone',
    })
  }

  const handlePauseSession = async () => {
    setPaused(true)
    setFocusMode(false)
    toast.info('Session paused', {
      description: 'Take a break, your progress is saved'
    })
  }

  const handleResumeSession = async () => {
    setPaused(false)
    setFocusMode(true)
    toast.success('Session resumed', {
      description: 'Welcome back! Let\'s continue'
    })
  }

  const handleCompleteSession = async () => {
    // Can complete either the active focus or the selected focus
    const focusToComplete = activeFocus || selectedFocus
    if (!focusToComplete) return
    setReviewModal({ open: true, mode: 'complete', focus: focusToComplete })
  }

  const handleStopSession = async () => {
    if (!activeFocus) return
    setReviewModal({ open: true, mode: 'stop', focus: activeFocus })
  }

  const handleConfirmSessionEnd = async () => {
    if (!reviewModal.focus) return

    const isComplete = reviewModal.mode === 'complete'

    try {
      await completeFocusSession(reviewModal.focus.id)
      updateFocus(reviewModal.focus.id, { completed_at: new Date().toISOString() })
      setActiveFocus(null)
      setFocusMode(false)
      setPaused(false)

      if (isComplete) {
        toast.success('🎉 Focus session completed!', {
          description: 'Great work on staying focused!',
        })
      } else {
        toast.info('Focus session stopped', {
          description: 'Your progress has been saved'
        })
      }

      setReviewModal({ open: false, mode: 'complete' })
    } catch (error) {
      toast.error(`Failed to ${isComplete ? 'complete' : 'stop'} session`, {
        description: error instanceof Error ? error.message : 'Please try again',
      })
      throw error
    }
  }

  const handleDeleteFocus = async (focusId: string) => {
    try {
      await cancelFocusSession(focusId)
      removeFocus(focusId)
      if (activeFocus?.id === focusId) {
        setActiveFocus(null)
        setFocusMode(false)
        setPaused(false)
      }
      if (selectedFocusId === focusId) {
        setSelectedFocusId(null)
      }
      toast.success('Focus session deleted')
    } catch (error) {
      toast.error('Failed to delete session', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
      throw error
    }
  }

  // Checkpoint Actions
  const handleAddCheckpoint = async (title: string) => {
    if (!selectedFocus) return

    // Generate a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const existingCheckpoints = selectedFocus.checkpoints || []
    const displayOrder = existingCheckpoints.length > 0
      ? Math.max(...existingCheckpoints.map(cp => cp.display_order)) + 1
      : 0

    const tempCheckpoint = {
      id: tempId,
      focus_id: selectedFocus.id,
      title,
      display_order: displayOrder,
      completed_at: undefined,
      created_at: new Date().toISOString()
    }

    // Optimistically add the checkpoint
    addCheckpoint(selectedFocus.id, tempCheckpoint)

    try {
      const newCheckpoint = await addCheckpointAction(selectedFocus.id, title)

      // Replace the temp checkpoint with the real one
      if (newCheckpoint) {
        removeCheckpoint(selectedFocus.id, tempId)
        addCheckpoint(selectedFocus.id, newCheckpoint)
      }

      toast.success('Checkpoint added')
    } catch (error) {
      // Remove the temp checkpoint on error
      removeCheckpoint(selectedFocus.id, tempId)
      toast.error('Failed to add checkpoint', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  const handleToggleCheckpoint = async (checkpointId: string) => {
    if (!selectedFocus) return

    // Update local state optimistically first
    const checkpoint = selectedFocus.checkpoints?.find(cp => cp.id === checkpointId)
    if (checkpoint) {
      const newCompletedAt = checkpoint.completed_at ? undefined : new Date().toISOString()
      updateCheckpoint(selectedFocus.id, checkpointId, {
        completed_at: newCompletedAt
      })
    }

    try {
      await toggleCheckpointAction(checkpointId)
    } catch {
      // Revert optimistic update on error
      if (checkpoint) {
        updateCheckpoint(selectedFocus.id, checkpointId, {
          completed_at: checkpoint.completed_at
        })
      }
      toast.error('Failed to toggle checkpoint')
    }
  }

  const handleEditCheckpoint = async (checkpointId: string, title: string) => {
    if (!selectedFocus) return

    const checkpoint = selectedFocus.checkpoints?.find(cp => cp.id === checkpointId)
    if (!checkpoint) return

    // Optimistically update
    const previousTitle = checkpoint.title
    updateCheckpoint(selectedFocus.id, checkpointId, { title })

    try {
      await updateCheckpointAction(checkpointId, title)
      toast.success('Checkpoint updated')
    } catch (error) {
      // Revert on error
      updateCheckpoint(selectedFocus.id, checkpointId, { title: previousTitle })
      toast.error('Failed to update checkpoint', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  const handleDeleteCheckpoint = async (checkpointId: string) => {
    if (!selectedFocus) return

    const checkpoint = selectedFocus.checkpoints?.find(cp => cp.id === checkpointId)
    if (!checkpoint) return

    // Optimistically remove
    removeCheckpoint(selectedFocus.id, checkpointId)

    try {
      await deleteCheckpointAction(checkpointId)
      toast.success('Checkpoint deleted')
    } catch (error) {
      // Re-add on error
      addCheckpoint(selectedFocus.id, checkpoint)
      toast.error('Failed to delete checkpoint', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  return (
    <div className={cn(
      'space-y-8 transition-all duration-500',
      isFocusMode && 'focus-mode'
    )}>
      {/* Welcome Section with Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'transition-all duration-500',
          isFocusMode && 'opacity-50 blur-sm pointer-events-none'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user.email?.split('@')[0]}!
            </h2>
            <p className="text-muted-foreground">
              {todayFocuses.length === 0
                ? 'Ready to start your first focus session?'
                : `${todayFocuses.filter(f => f.completed_at).length} of ${todayFocuses.length} sessions completed today`
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{todayFocuses.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Focus Blocks Grid */}
      <motion.div
        className={cn(
          'transition-all duration-500',
          isFocusMode && 'opacity-30 blur-sm pointer-events-none'
        )}
      >
        <h3 className="text-lg font-semibold mb-4">Today&apos;s Focus Sessions</h3>
        <FocusBlocksGrid
          focuses={todayFocuses}
          activeFocusId={activeFocus?.id || null}
          selectedFocusId={selectedFocusId}
          onSelectFocus={setSelectedFocusId}
          onNewFocus={() => setShowNewFocusModal(true)}
          onStartSession={handleStartSession}
        />
      </motion.div>

      {/* Selected/Active Focus Card */}
      <AnimatePresence>
        {selectedFocus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isFocusMode ? 1.02 : 1
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'relative transition-all duration-500',
              isFocusMode && 'z-10'
            )}
          >
            <FocusCard
              focus={selectedFocus}
              isActive={selectedFocus.id === activeFocus?.id}
              isFocusMode={isFocusMode}
              isPaused={isPaused}
              onStart={() => handleStartSession(selectedFocus.id)}
              onPause={handlePauseSession}
              onResume={handleResumeSession}
              onComplete={handleCompleteSession}
              onStop={handleStopSession}
              onDelete={() => handleDeleteFocus(selectedFocus.id)}
              onAddCheckpoint={handleAddCheckpoint}
              onToggleCheckpoint={handleToggleCheckpoint}
              onEditCheckpoint={handleEditCheckpoint}
              onDeleteCheckpoint={handleDeleteCheckpoint}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <motion.div
        className={cn(
          'grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500',
          isFocusMode && 'opacity-30 blur-sm pointer-events-none'
        )}
      >
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-3">
            <Target className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <CardTitle className="text-base">Goals</CardTitle>
            <CardDescription className="text-xs">
              Set long-term targets
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-secondary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-3">
            <ListTodo className="h-8 w-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
            <CardTitle className="text-base">Later List</CardTitle>
            <CardDescription className="text-xs">
              Review captured items
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-success/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-3">
            <Calendar className="h-8 w-8 text-success mb-2 group-hover:scale-110 transition-transform" />
            <CardTitle className="text-base">Calendar</CardTitle>
            <CardDescription className="text-xs">
              View weekly progress
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-warning/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-3">
            <History className="h-8 w-8 text-warning mb-2 group-hover:scale-110 transition-transform" />
            <CardTitle className="text-base">History</CardTitle>
            <CardDescription className="text-xs">
              Past sessions
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* New Focus Modal */}
      <NewFocusModal
        open={showNewFocusModal}
        onOpenChange={setShowNewFocusModal}
        onSubmit={handleCreateFocus}
        sessionNumber={sessionNumber}
        northStars={northStars}
      />

      {/* Session Review Modal */}
      {reviewModal.focus && (
        <SessionReviewModal
          open={reviewModal.open}
          onOpenChange={(open) => setReviewModal({ ...reviewModal, open })}
          focus={reviewModal.focus}
          mode={reviewModal.mode}
          onConfirm={handleConfirmSessionEnd}
        />
      )}

      {/* Focus Mode Visual Effect */}
      <AnimatePresence>
        {isFocusMode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
              <div className="absolute inset-0 backdrop-blur-[1px]" />
            </motion.div>

            {/* Exit Focus Mode Button */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 z-50"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseSession}
                className="bg-background/95 backdrop-blur-sm shadow-lg"
              >
                <X className="h-4 w-4 mr-2" />
                Exit Focus Mode (ESC)
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}