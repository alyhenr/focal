'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, ListTodo, Calendar, History, X } from 'lucide-react'
import { NewFocusModal } from '@/components/focus/new-focus-modal'
import { FocusBlocksGrid } from '@/components/focus/focus-blocks-grid'
import { FocusCard } from '@/components/focus/focus-card'
import { SessionReviewModal } from '@/components/focus/session-review-modal'
import { AnalyticsSection } from '@/components/analytics/analytics-section'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFocusStore } from '@/stores/focus-store'
import { useLaterListSync } from '@/hooks/use-later-list-sync'
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
  analyticsData?: {
    streakData: {
      currentStreak: number
      longestStreak: number
      lastFocusDate: string | null
    }
    completionData: Array<{
      date: string
      total: number
      completed: number
      rate: number
    }>
    hourlyData: Array<{
      hour: number
      count: number
      label: string
    }>
    weeklyStats: {
      totalSessions: number
      avgCheckpoints: number
      mostProductiveDay: string | null
    }
    energyDistribution: {
      high: number
      medium: number
      low: number
    }
  }
}

export function DashboardContent({
  user,
  todayFocuses: initialFocuses,
  activeFocus: initialActiveFocus,
  northStars,
  analyticsData,
}: DashboardContentProps) {
  const [showNewFocusModal, setShowNewFocusModal] = useState(false)
  const [reviewModal, setReviewModal] = useState<{ open: boolean; mode: 'complete' | 'stop'; focus?: Focus }>({
    open: false,
    mode: 'complete',
  })

  // Initialize Later List sync
  useLaterListSync()

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
            <h2 className="text-2xl font-semibold text-foreground mb-1">
              Welcome back, {user.email?.split('@')[0]}
            </h2>
            <p className="text-sm text-muted-foreground">
              {todayFocuses.length === 0
                ? 'Ready to start your first focus session?'
                : `${todayFocuses.filter(f => f.completed_at).length} of ${todayFocuses.length} sessions completed today`
              }
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-xl font-semibold text-foreground">
                  {analyticsData?.streakData?.currentStreak || 0}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-xl font-semibold text-foreground">{todayFocuses.length}</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Today</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Section */}
      {analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'transition-all duration-500',
            isFocusMode && 'opacity-30 blur-sm pointer-events-none'
          )}
        >
          <AnalyticsSection
            streakData={analyticsData.streakData}
            weeklyStats={analyticsData.weeklyStats}
            completionData={analyticsData.completionData}
            hourlyData={analyticsData.hourlyData}
            energyDistribution={analyticsData.energyDistribution}
            goals={northStars}
          />
        </motion.div>
      )}

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
        <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-card">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-foreground">Goals</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Set long-term targets
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-card"
          onClick={() => {
            // Trigger Later List from sidebar
            const event = new KeyboardEvent('keydown', {
              key: 'l',
              metaKey: true,
            })
            document.dispatchEvent(event)
          }}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
              <ListTodo className="h-5 w-5 text-secondary" />
            </div>
            <CardTitle className="text-sm font-medium text-foreground">Later List</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Review captured items
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-card">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-3 group-hover:bg-success/20 transition-colors">
              <Calendar className="h-5 w-5 text-success" />
            </div>
            <CardTitle className="text-sm font-medium text-foreground">Calendar</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              View weekly progress
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-card">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center mb-3 group-hover:bg-warning/20 transition-colors">
              <History className="h-5 w-5 text-warning" />
            </div>
            <CardTitle className="text-sm font-medium text-foreground">History</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
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

            {/* Exit Focus Mode Button - Cleaner */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50"
            >
              <button
                onClick={handlePauseSession}
                className="flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-card transition-all hover:shadow-xl text-sm font-medium text-foreground"
              >
                <X className="h-4 w-4" />
                <span>Exit Focus</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded text-muted-foreground">ESC</kbd>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}