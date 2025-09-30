import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerType = 'focus' | 'checkpoint' | 'break'
export type TimerPreset = 25 | 50 | 90 | 'custom'

interface Timer {
  id: string // focusId or checkpointId
  type: TimerType
  isRunning: boolean
  isPaused: boolean
  currentTime: number // in seconds
  totalDuration: number // in seconds
  preset: TimerPreset | null
  startedAt: string | null
  pausedAt: string | null
  sessionId: string | null
}

interface TimerState {
  // Active timers (support multiple concurrent timers)
  timers: Record<string, Timer>

  // Legacy single timer state (for backward compatibility)
  isRunning: boolean
  isPaused: boolean
  currentTime: number // in seconds
  totalDuration: number // in seconds
  timerType: TimerType
  preset: TimerPreset | null
  startedAt: string | null
  pausedAt: string | null

  // Session tracking
  currentSessionId: string | null
  focusId: string | null
  checkpointId: string | null

  // Settings
  soundEnabled: boolean
  notificationsEnabled: boolean
  autoStartBreaks: boolean
  breakDuration: number // in minutes

  // Actions
  startTimer: (duration: number, type: TimerType, preset?: TimerPreset) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  tick: () => void
  setCurrentTime: (time: number) => void

  // Multi-timer actions
  startTimerFor: (id: string, duration: number, type: TimerType, preset?: TimerPreset) => void
  pauseTimerFor: (id: string) => void
  resumeTimerFor: (id: string) => void
  stopTimerFor: (id: string) => void
  tickTimer: (id: string) => void

  // Settings
  setSoundEnabled: (enabled: boolean) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setAutoStartBreaks: (enabled: boolean) => void
  setBreakDuration: (minutes: number) => void
  setFocusId: (id: string | null) => void
  setCheckpointId: (id: string | null) => void
  reset: () => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      timers: {},

      // Legacy single timer state
      isRunning: false,
      isPaused: false,
      currentTime: 0,
      totalDuration: 0,
      timerType: 'focus',
      preset: null,
      startedAt: null,
      pausedAt: null,

      currentSessionId: null,
      focusId: null,
      checkpointId: null,

      soundEnabled: true,
      notificationsEnabled: true,
      autoStartBreaks: false,
      breakDuration: 5,

      // Legacy Actions (for backward compatibility)
      startTimer: (duration, type, preset = 'custom') => {
        const id = get().checkpointId || get().focusId || 'default'
        if (id) {
          get().startTimerFor(id, duration, type, preset)
        }
        // Also update legacy state
        set({
          isRunning: true,
          isPaused: false,
          currentTime: duration,
          totalDuration: duration,
          timerType: type,
          preset,
          startedAt: new Date().toISOString(),
          pausedAt: null,
        })
      },

      pauseTimer: () => {
        set({
          isPaused: true,
          pausedAt: new Date().toISOString(),
        })
      },

      resumeTimer: () => {
        set({
          isPaused: false,
          pausedAt: null,
        })
      },

      stopTimer: () => {
        const state = get()

        // Play sound if enabled and timer was running
        if (state.soundEnabled && state.isRunning && state.currentTime === 0) {
          playNotificationSound()
        }

        // Show notification if enabled
        if (state.notificationsEnabled && state.isRunning && state.currentTime === 0) {
          showNotification(state.timerType)
        }

        set({
          isRunning: false,
          isPaused: false,
          currentTime: 0,
          totalDuration: 0,
          preset: null,
          startedAt: null,
          pausedAt: null,
          currentSessionId: null,
        })

        // Auto-start break if enabled and just finished a focus session
        if (state.autoStartBreaks && state.timerType === 'focus') {
          setTimeout(() => {
            get().startTimer(state.breakDuration * 60, 'break')
          }, 1000)
        }
      },

      tick: () => {
        const state = get()
        // Tick all active timers
        Object.keys(state.timers).forEach(id => {
          get().tickTimer(id)
        })

        // Legacy tick
        if (state.isRunning && !state.isPaused && state.currentTime > 0) {
          set({ currentTime: state.currentTime - 1 })

          // Timer completed
          if (state.currentTime - 1 === 0) {
            get().stopTimer()
          }
        }
      },

      // Multi-timer actions
      startTimerFor: (id, duration, type, preset = 'custom') => {
        const timer: Timer = {
          id,
          type,
          isRunning: true,
          isPaused: false,
          currentTime: duration,
          totalDuration: duration,
          preset,
          startedAt: new Date().toISOString(),
          pausedAt: null,
          sessionId: null,
        }

        set(state => ({
          timers: {
            ...state.timers,
            [id]: timer
          }
        }))

        // Update legacy state if this is the primary timer
        if (id === get().focusId || id === get().checkpointId) {
          set({
            isRunning: true,
            isPaused: false,
            currentTime: duration,
            totalDuration: duration,
            timerType: type,
            preset,
            startedAt: timer.startedAt,
            pausedAt: null,
          })
        }
      },

      pauseTimerFor: (id) => {
        set(state => {
          const timer = state.timers[id]
          if (!timer) return state

          return {
            timers: {
              ...state.timers,
              [id]: {
                ...timer,
                isPaused: true,
                pausedAt: new Date().toISOString(),
              }
            }
          }
        })
      },

      resumeTimerFor: (id) => {
        set(state => {
          const timer = state.timers[id]
          if (!timer) return state

          return {
            timers: {
              ...state.timers,
              [id]: {
                ...timer,
                isPaused: false,
                pausedAt: null,
              }
            }
          }
        })
      },

      stopTimerFor: (id) => {
        const state = get()
        const timer = state.timers[id]

        if (timer) {
          // Play sound if enabled and timer was running
          if (state.soundEnabled && timer.isRunning && timer.currentTime === 0) {
            playNotificationSound()
          }

          // Show notification if enabled
          if (state.notificationsEnabled && timer.isRunning && timer.currentTime === 0) {
            showNotification(timer.type)
          }

          // Remove timer from active timers
          set(state => {
            const newTimers = { ...state.timers }
            delete newTimers[id]
            return { timers: newTimers }
          })

          // Auto-start break if enabled and just finished a focus session
          if (state.autoStartBreaks && timer.type === 'focus' && timer.currentTime === 0) {
            setTimeout(() => {
              get().startTimerFor('break', state.breakDuration * 60, 'break')
            }, 1000)
          }
        }
      },

      tickTimer: (id) => {
        set(state => {
          const timer = state.timers[id]
          if (!timer || !timer.isRunning || timer.isPaused || timer.currentTime <= 0) {
            return state
          }

          const newTime = timer.currentTime - 1

          // Timer completed
          if (newTime === 0) {
            get().stopTimerFor(id)
            return state
          }

          return {
            timers: {
              ...state.timers,
              [id]: {
                ...timer,
                currentTime: newTime,
              }
            }
          }
        })
      },

      setCurrentTime: (time) => set({ currentTime: time }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setAutoStartBreaks: (enabled) => set({ autoStartBreaks: enabled }),
      setBreakDuration: (minutes) => set({ breakDuration: minutes }),
      setFocusId: (id) => set({ focusId: id }),
      setCheckpointId: (id) => set({ checkpointId: id }),

      reset: () => {
        set({
          isRunning: false,
          isPaused: false,
          currentTime: 0,
          totalDuration: 0,
          timerType: 'focus',
          preset: null,
          startedAt: null,
          pausedAt: null,
          currentSessionId: null,
          focusId: null,
          checkpointId: null,
        })
      },
    }),
    {
      name: 'focal-timer-storage',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled,
        autoStartBreaks: state.autoStartBreaks,
        breakDuration: state.breakDuration,
      }),
    }
  )
)

// Helper functions
function playNotificationSound() {
  const audio = new Audio('/sounds/timer-complete.mp3')
  audio.play().catch(console.error)
}

function showNotification(timerType: TimerType) {
  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') {
    const title = timerType === 'break' ? 'Break time is over!' : 'Timer completed!'
    const body = timerType === 'break'
      ? 'Time to get back to focus'
      : timerType === 'checkpoint'
        ? 'Checkpoint timer completed'
        : 'Great job! Time for a break?'

    new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
    })
  }
}