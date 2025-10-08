'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTimerStore } from '@/stores/timer-store'
import { cn } from '@/lib/utils'
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Coffee,
  Brain,
  Target,
  Plus,
  Sparkles,
  Zap,
  Sun,
  ChevronLeft,
} from 'lucide-react'

interface TimerContentProps {
  user: {
    id: string
    email?: string
  }
}

interface TimerPreset {
  name: string
  duration: number // in minutes
  icon: React.ElementType
  description: string
  gradient: string
  bgGradient: string
}

const presets: TimerPreset[] = [
  {
    name: 'Quick Focus',
    duration: 5,
    icon: Zap,
    description: 'Short burst of focused work',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-500/10 via-transparent to-blue-600/10',
  },
  {
    name: 'Pomodoro',
    duration: 25,
    icon: Target,
    description: 'Classic 25-minute focus session',
    gradient: 'from-primary to-primary/80',
    bgGradient: 'from-primary/10 via-transparent to-primary/5',
  },
  {
    name: 'Deep Work',
    duration: 50,
    icon: Brain,
    description: 'Extended deep thinking time',
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-500/10 via-transparent to-purple-600/10',
  },
  {
    name: 'Flow State',
    duration: 90,
    icon: Brain,
    description: 'Maximum concentration period',
    gradient: 'from-teal-500 to-teal-600',
    bgGradient: 'from-teal-500/10 via-transparent to-teal-600/10',
  },
  {
    name: 'Short Break',
    duration: 5,
    icon: Coffee,
    description: 'Quick rest between sessions',
    gradient: 'from-amber-500 to-amber-600',
    bgGradient: 'from-amber-500/10 via-transparent to-amber-600/10',
  },
  {
    name: 'Long Break',
    duration: 15,
    icon: Coffee,
    description: 'Extended rest and recovery',
    gradient: 'from-orange-500 to-orange-600',
    bgGradient: 'from-orange-500/10 via-transparent to-orange-600/10',
  },
]

export function TimerContent({ }: TimerContentProps) {
  const {
    isRunning,
    isPaused,
    currentTime,
    totalDuration,
    timerType,
    soundEnabled,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setSoundEnabled,
    tick,
  } = useTimerStore()

  const [selectedPreset, setSelectedPreset] = useState<TimerPreset | null>(null)
  const [customMinutes, setCustomMinutes] = useState('')
  const [sessionCount, setSessionCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  // Timer tick effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(tick, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning, isPaused, tick])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isRunning) {
        if (e.code === 'Space') {
          e.preventDefault()
          if (isPaused) {
            resumeTimer()
          } else {
            pauseTimer()
          }
        } else if (e.code === 'Escape') {
          e.preventDefault()
          handleStop()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPaused, pauseTimer, resumeTimer])

  // Completion effect - only increment session count when timer naturally completes
  useEffect(() => {
    if (currentTime === 0 && isRunning) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      // Only count focus sessions that complete naturally
      if (timerType === 'focus') {
        setSessionCount(prev => prev + 1)
      }
    }
  }, [currentTime, isRunning, timerType])

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return {
        display: `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
        hours,
        mins,
        secs
      }
    }
    return {
      display: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      hours: 0,
      mins,
      secs
    }
  }

  // Calculate progress
  const progress = totalDuration > 0 ? ((totalDuration - currentTime) / totalDuration) * 100 : 0

  const handleStartPreset = (preset: TimerPreset) => {
    setSelectedPreset(preset)
    startTimer(preset.duration * 60, preset.name.includes('Break') ? 'break' : 'focus')
  }

  const handleStartCustom = () => {
    const minutes = parseInt(customMinutes, 10)
    if (minutes > 0 && minutes <= 180) {
      setSelectedPreset(null)
      startTimer(minutes * 60, 'focus', 'custom')
      setCustomMinutes('')
    }
  }

  const handleStop = () => {
    stopTimer()
    setSelectedPreset(null)
  }

  const handleComplete = () => {
    stopTimer()
    if (timerType === 'focus') {
      setSessionCount(prev => prev + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    setSelectedPreset(null)
  }

  const handleBack = () => {
    handleStop()
  }

  const timeData = formatTime(currentTime)

  return (
    <>
      {/* Immersive Background when timer is running */}
      <AnimatePresence>
        {isRunning && selectedPreset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {/* Animated gradient background */}
            <motion.div
              className={cn("absolute inset-0 bg-gradient-to-br", selectedPreset.bgGradient)}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Floating orbs */}
            <motion.div
              className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
              animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  scale: [0, 1.5, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.02,
                  ease: "easeOut"
                }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {!isRunning ? (
              /* Timer Selection */
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-4xl font-bold text-foreground">Start Your Focus Session</h2>
                  <p className="text-xl text-muted-foreground">Choose a timer that fits your workflow</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {presets.map((preset) => {
                    const Icon = preset.icon
                    return (
                      <motion.button
                        key={preset.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStartPreset(preset)}
                        className="group relative text-left"
                      >
                        <Card className="relative overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 p-7 bg-gradient-to-br from-card to-primary/5 backdrop-blur-sm">
                          {/* Gradient overlay on hover */}
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl",
                            preset.gradient
                          )} />

                          <div className="relative space-y-5">
                            <div className="flex items-start justify-between">
                              <div className={cn(
                                "p-3.5 rounded-xl bg-gradient-to-br text-white shadow-md",
                                preset.gradient
                              )}>
                                <Icon className="h-6 w-6" />
                              </div>
                              <div className="text-right">
                                <span className="text-4xl font-bold text-foreground">
                                  {preset.duration}
                                </span>
                                <span className="text-[0.9375rem] text-muted-foreground ml-1.5">min</span>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-bold text-xl text-foreground mb-2">
                                {preset.name}
                              </h3>
                              <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">
                                {preset.description}
                              </p>
                            </div>

                            {/* Play button on hover */}
                            <div className="absolute bottom-7 right-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="p-2.5 rounded-full bg-primary/15 shadow-sm">
                                <Play className="h-5 w-5 text-primary" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.button>
                    )
                  })}

                  {/* Custom Timer - Enhanced */}
                  <Card className="shadow-md bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm p-7">
                    <div className="space-y-5">
                      <div className="flex items-start justify-between">
                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-muted-foreground to-muted-foreground/80 text-white shadow-md">
                          <Plus className="h-6 w-6" />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-xl text-foreground mb-2">
                          Custom Timer
                        </h3>
                        <p className="text-[0.9375rem] text-muted-foreground mb-5 leading-relaxed">
                          Set your own duration
                        </p>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            min="1"
                            max="180"
                            placeholder="Minutes"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value)}
                            className="flex-1 px-4 py-3 text-[0.9375rem] font-medium border border-border rounded-lg bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleStartCustom()
                            }}
                          />
                          <Button
                            onClick={handleStartCustom}
                            disabled={!customMinutes || parseInt(customMinutes) <= 0}
                            className="px-7 shadow-md hover:shadow-lg"
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Session counter - Enhanced */}
                {sessionCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-card via-card to-warning/10 backdrop-blur-sm rounded-2xl shadow-lg border">
                      <Sun className="h-6 w-6 text-warning" />
                      <span className="text-[0.9375rem] font-medium text-muted-foreground">Today&apos;s Sessions</span>
                      <span className="text-3xl font-bold text-foreground">{sessionCount}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* Timer Running - Immersive View */
              <motion.div
                key="timer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center space-y-8"
              >
                {/* Back button */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleBack}
                  className="absolute top-4 left-4 p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors group"
                >
                  <ChevronLeft className="h-6 w-6 text-black group-hover:text-black/80" />
                </motion.button>

                {/* Timer Type */}
                {selectedPreset && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center space-y-2"
                  >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/10 backdrop-blur-md rounded-full">
                      <selectedPreset.icon className="h-6 w-6 text-white" />
                      <span className="text-xl font-medium text-white">{selectedPreset.name}</span>
                    </div>
                    <p className="text-black/60 text-sm">
                      {isPaused ? 'Paused' : timerType === 'break' ? 'Time to rest' : 'Stay focused'}
                    </p>
                  </motion.div>
                )}

                {/* Main Timer Display */}
                <motion.div
                  animate={{
                    scale: isPaused ? 0.95 : [1, 1.02, 1],
                  }}
                  transition={{
                    duration: isPaused ? 0.3 : 4,
                    repeat: isPaused ? 0 : Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  {/* Large time display */}
                  <div className="text-center">
                    <motion.div
                      className="text-8xl md:text-9xl font-bold font-mono text-muted-foreground tabular-nums"
                      animate={{
                        opacity: isPaused ? [0.5, 1, 0.5] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: isPaused ? Infinity : 0,
                      }}
                    >
                      {timeData.display}
                    </motion.div>

                    {/* Progress bar */}
                    <div className="mt-8 w-96 mx-auto">
                      <div className="relative h-2 bg-muted0/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-card rounded-full"
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={{
                            boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground/60">
                        <span>{Math.floor((totalDuration - currentTime) / 60)}m elapsed</span>
                        <span>{Math.floor(currentTime / 60)}m remaining</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Control Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={isPaused ? resumeTimer : pauseTimer}
                    className="gap-2 px-8 bg-muted0/20 hover:bg-muted0/30 text-white border-0 backdrop-blur-sm"
                  >
                    {isPaused ? (
                      <><Play className="h-5 w-5" /> Resume</>
                    ) : (
                      <><Pause className="h-5 w-5" /> Pause</>
                    )}
                  </Button>

                  {timerType === 'focus' && (
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={handleComplete}
                      className="gap-2 bg-primary/20 hover:bg-primary/30 text-white border-0 backdrop-blur-sm"
                    >
                      <Target className="h-5 w-5" />
                      Complete Session
                    </Button>
                  )}

                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={handleStop}
                    className="gap-2 bg-muted0/10 hover:bg-muted0/20 text-white/80 hover:text-white border-0 backdrop-blur-sm"
                  >
                    <Square className="h-5 w-5" />
                    End Session
                  </Button>

                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="px-4 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted0/10"
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-5 w-5" />
                    ) : (
                      <VolumeX className="h-5 w-5" />
                    )}
                  </Button>
                </motion.div>

                {/* Keyboard shortcuts hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground/40 text-xs space-x-6"
                >
                  <span><kbd className="px-2 py-1 bg-muted0/10 rounded font-extrabold">Space</kbd> Pause/Resume</span>
                  <span><kbd className="px-2 py-1 bg-muted0/10 rounded font-extrabold">Esc</kbd> End Session</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}