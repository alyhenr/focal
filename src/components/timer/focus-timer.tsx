'use client'

import { useEffect, useState } from 'react'
import { Play, Pause, Square, Timer, Volume2, VolumeX, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CircularProgress } from '@/components/timer/circular-progress'
import { useTimerStore } from '@/stores/timer-store'
import { createTimerSession, completeTimerSession } from '@/app/actions/timer'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface FocusTimerProps {
  focusId: string
  className?: string
  minimal?: boolean
  checkpointId?: string
  checkpointTitle?: string
  onCheckpointComplete?: () => void
}

export function FocusTimer({
  focusId,
  className,
  minimal = false,
  checkpointId,
  checkpointTitle: _checkpointTitle,
  onCheckpointComplete
}: FocusTimerProps) {
  // Determine the timer ID based on whether this is a checkpoint or session timer
  const timerId = checkpointId || focusId

  const {
    timers,
    soundEnabled,
    startTimerFor,
    pauseTimerFor,
    resumeTimerFor,
    stopTimerFor,
    setSoundEnabled,
    tickTimer,
  } = useTimerStore()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  // Get the current timer for this component
  const currentTimer = timers[timerId]
  const isRunning = currentTimer?.isRunning || false
  const isPaused = currentTimer?.isPaused || false
  const currentTime = currentTimer?.currentTime || 0
  const totalDuration = currentTimer?.totalDuration || 0
  const preset = currentTimer?.preset || null

  // Timer tick effect - only tick this specific timer
  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(() => {
        tickTimer(timerId)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning, isPaused, timerId, tickTimer])

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progress = totalDuration > 0
    ? ((totalDuration - currentTime) / totalDuration) * 100
    : 0

  // Handle timer start with presets
  const handleStartTimer = (minutes: number) => {
    // Start timer immediately (optimistic update)
    const timerType = checkpointId ? 'checkpoint' : 'focus'
    startTimerFor(timerId, minutes * 60, timerType, minutes as 25 | 50 | 90)

    // Create timer session in database asynchronously (don't block UI)
    createTimerSession(focusId, minutes, 'work').then(session => {
      if (session) {
        setSessionId(session.id)
      }
    }).catch(error => {
      console.error('Failed to create timer session:', error)
      // Timer still runs locally even if database save fails
    })
  }

  // Handle timer pause/resume
  const handlePauseTimer = () => {
    pauseTimerFor(timerId)
  }

  const handleResumeTimer = () => {
    resumeTimerFor(timerId)
  }

  // Handle timer stop
  const handleStopTimer = () => {
    const wasCompleted = currentTime === 0

    // Stop timer immediately (optimistic update)
    stopTimerFor(timerId)

    // Handle completion callback immediately
    if (wasCompleted && checkpointId && onCheckpointComplete) {
      onCheckpointComplete()
    }

    // Update database asynchronously (don't block UI)
    if (sessionId) {
      completeTimerSession(sessionId, wasCompleted).catch(error => {
        console.error('Failed to complete timer session:', error)
      })
    }

    setSessionId(null)
  }

  // Handle custom duration
  const handleCustomDuration = () => {
    const defaultValue = checkpointId ? '15' : '30'
    const minutes = prompt(`Enter duration in minutes (1-180):`, defaultValue)
    if (minutes) {
      const duration = parseInt(minutes, 10)
      if (duration >= 1 && duration <= 180) {
        handleStartTimer(duration)
      }
    }
  }

  if (minimal && !checkpointId) {
    return (
      <motion.div
        className={cn('rounded-lg border border-border bg-card/50 backdrop-blur-sm', className)}
        animate={{ borderColor: isRunning ? '#6B8E7F' : '#e5e7eb' }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {isRunning ? 'Session Timer' : 'Timer'}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="h-6 w-6 p-0"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          {isRunning ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <motion.span
                  className="font-mono text-2xl font-semibold text-foreground"
                  key={currentTime}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {formatTime(currentTime)}
                </motion.span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={isPaused ? handleResumeTimer : handlePauseTimer}
                    className="h-8 w-8 p-0"
                  >
                    {isPaused ?
                      <Play className="h-4 w-4 text-primary" /> :
                      <Pause className="h-4 w-4 text-muted-foreground" />
                    }
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleStopTimer}
                    className="h-8 w-8 p-0 hover:text-destructive"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{
                      boxShadow: progress > 0 ? '0 0 10px rgba(107, 142, 127, 0.3)' : 'none'
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="uppercase tracking-wider">
                    {isPaused ? 'Paused' : 'Running'}
                  </span>
                  <span>
                    {Math.floor((totalDuration - currentTime) / 60)}m {((totalDuration - currentTime) % 60)}s elapsed
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-3">Set a timer for this session</p>
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartTimer(25)}
                  className="text-xs"
                >
                  25m
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartTimer(50)}
                  className="text-xs"
                >
                  50m
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartTimer(90)}
                  className="text-xs"
                >
                  90m
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCustomDuration}
                  className="text-xs"
                >
                  Custom
                </Button>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border px-3 py-2 bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-xs"
                >
                  {soundEnabled ? (
                    <><Volume2 className="h-3 w-3 mr-1" /> Sound On</>
                  ) : (
                    <><VolumeX className="h-3 w-3 mr-1" /> Sound Off</>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {preset === 25 && 'Pomodoro Mode'}
                  {preset === 50 && 'Deep Work Mode'}
                  {preset === 90 && 'Flow State Mode'}
                  {preset === 'custom' && 'Custom Timer'}
                  {!preset && 'No timer set'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Checkpoint timer (mini version)
  if (checkpointId) {
    return (
      <motion.div
        className={cn('flex items-center gap-2', className)}
        animate={{
          opacity: isRunning ? 1 : 0.8
        }}
        transition={{ duration: 0.2 }}
      >
        {isRunning ? (
          <>
            {/* Mini Circular Timer */}
            <CircularProgress
              value={progress}
              size={40}
              strokeWidth={3}
              color="stroke-primary"
            >
              <motion.span
                className="font-mono text-[10px] font-medium text-foreground"
                animate={{
                  opacity: isPaused ? [0.5, 1, 0.5] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: isPaused ? Infinity : 0
                }}
              >
                {formatTime(currentTime).split(':')[0]}:{formatTime(currentTime).split(':')[1]}
              </motion.span>
            </CircularProgress>
            <div className="flex gap-0.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={isPaused ? handleResumeTimer : handlePauseTimer}
                className="h-6 w-6 p-0 hover:bg-primary/10"
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleStopTimer}
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Square className="h-3 w-3" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStartTimer(25)}
              className="h-5 px-1.5 text-xs hover:bg-primary/10"
              title="Pomodoro (25 minutes)"
            >
              25m
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStartTimer(50)}
              className="h-5 px-1.5 text-xs hover:bg-primary/10"
              title="Deep Work (50 minutes)"
            >
              50m
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStartTimer(90)}
              className="h-5 px-1.5 text-xs hover:bg-primary/10"
              title="Flow State (90 minutes)"
            >
              90m
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCustomDuration}
              className="h-5 px-1.5 text-xs hover:bg-primary/10"
              title="Custom duration"
            >
              Custom
            </Button>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Timer Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Timer className="h-5 w-5 text-muted-foreground" />
          <span className="font-mono text-2xl font-medium">
            {isRunning ? formatTime(currentTime) : '00:00'}
          </span>
        </div>

        {/* Sound toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {preset === 25 && 'Pomodoro'}
            {preset === 50 && 'Deep Work'}
            {preset === 90 && 'Flow State'}
            {preset === 'custom' && 'Custom Timer'}
            {!preset && 'Focus Timer'}
          </p>
        </div>
      )}

      {/* Timer Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <>
            {/* Pomodoro Presets */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartTimer(25)}
              className="flex-1"
            >
              25 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartTimer(50)}
              className="flex-1"
            >
              50 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartTimer(90)}
              className="flex-1"
            >
              90 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCustomDuration}
            >
              Custom
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={isPaused ? 'default' : 'outline'}
              size="sm"
              onClick={isPaused ? handleResumeTimer : handlePauseTimer}
              className="flex-1"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-1" /> Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-1" /> Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopTimer}
              className="text-destructive hover:text-destructive"
            >
              <Square className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}