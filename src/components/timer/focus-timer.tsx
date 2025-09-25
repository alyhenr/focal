'use client'

import { useEffect, useState } from 'react'
import { Play, Pause, Square, Timer, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTimerStore } from '@/stores/timer-store'
import { createTimerSession, completeTimerSession } from '@/app/actions/timer'
import { cn } from '@/lib/utils'

interface FocusTimerProps {
  focusId: string
  className?: string
  minimal?: boolean
}

export function FocusTimer({ focusId, className, minimal = false }: FocusTimerProps) {
  const {
    isRunning,
    isPaused,
    currentTime,
    totalDuration,
    preset,
    soundEnabled,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
    setSoundEnabled,
    setFocusId,
  } = useTimerStore()

  const [sessionId, setSessionId] = useState<string | null>(null)

  // Set focus ID when component mounts
  useEffect(() => {
    setFocusId(focusId)
    return () => setFocusId(null)
  }, [focusId, setFocusId])

  // Timer tick effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(tick, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning, isPaused, tick])

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
  const handleStartTimer = async (minutes: number) => {
    // Create timer session in database
    const session = await createTimerSession(focusId, minutes, 'work')
    if (session) {
      setSessionId(session.id)
      startTimer(minutes * 60, 'focus', minutes as 25 | 50 | 90)
    }
  }

  // Handle timer stop
  const handleStopTimer = async () => {
    if (sessionId) {
      await completeTimerSession(sessionId, currentTime === 0)
    }
    stopTimer()
    setSessionId(null)
  }

  // Handle custom duration
  const handleCustomDuration = () => {
    const minutes = prompt('Enter duration in minutes (5-180):')
    if (minutes) {
      const duration = parseInt(minutes, 10)
      if (duration >= 5 && duration <= 180) {
        handleStartTimer(duration)
      }
    }
  }

  if (minimal) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Timer className="h-4 w-4 text-gray-400" />
        {isRunning ? (
          <>
            <span className="font-mono text-lg font-medium">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 max-w-[100px]">
              <Progress value={progress} className="h-1" />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={isPaused ? resumeTimer : pauseTimer}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>
          </>
        ) : (
          <span className="text-sm text-gray-500">Timer coming soon</span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Timer Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Timer className="h-5 w-5 text-gray-400" />
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
            <VolumeX className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">
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
              onClick={isPaused ? resumeTimer : pauseTimer}
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