import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerType = 'focus' | 'checkpoint' | 'break'
export type TimerPreset = 25 | 50 | 90 | 'custom'

interface TimerState {
  // Timer state
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

      // Actions
      startTimer: (duration, type, preset = 'custom') => {
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
        if (state.isRunning && !state.isPaused && state.currentTime > 0) {
          set({ currentTime: state.currentTime - 1 })

          // Timer completed
          if (state.currentTime - 1 === 0) {
            get().stopTimer()
          }
        }
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