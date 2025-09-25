import { create } from 'zustand'
import { Focus, Checkpoint } from '@/types/focus'

interface FocusState {
  // State
  todayFocuses: Focus[]
  activeFocus: Focus | null
  selectedFocusId: string | null
  isFocusMode: boolean
  isPaused: boolean

  // Actions
  setTodayFocuses: (focuses: Focus[]) => void
  setActiveFocus: (focus: Focus | null) => void
  setSelectedFocusId: (id: string | null) => void
  setFocusMode: (enabled: boolean) => void
  setPaused: (paused: boolean) => void

  // Focus management
  addFocus: (focus: Focus) => void
  updateFocus: (id: string, updates: Partial<Focus>) => void
  removeFocus: (id: string) => void

  // Checkpoint management
  addCheckpoint: (focusId: string, checkpoint: Checkpoint) => void
  updateCheckpoint: (focusId: string, checkpointId: string, updates: Partial<Checkpoint>) => void
  removeCheckpoint: (focusId: string, checkpointId: string) => void
}

export const useFocusStore = create<FocusState>((set) => ({
  // Initial state
  todayFocuses: [],
  activeFocus: null,
  selectedFocusId: null,
  isFocusMode: false,
  isPaused: false,

  // State setters
  setTodayFocuses: (focuses) => set({ todayFocuses: focuses }),
  setActiveFocus: (focus) => set({ activeFocus: focus }),
  setSelectedFocusId: (id) => set({ selectedFocusId: id }),
  setFocusMode: (enabled) => set({ isFocusMode: enabled }),
  setPaused: (paused) => set({ isPaused: paused }),

  // Focus management
  addFocus: (focus) =>
    set((state) => ({
      todayFocuses: [...state.todayFocuses, focus],
    })),

  updateFocus: (id, updates) =>
    set((state) => ({
      todayFocuses: state.todayFocuses.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
      activeFocus: state.activeFocus?.id === id
        ? { ...state.activeFocus, ...updates }
        : state.activeFocus,
    })),

  removeFocus: (id) =>
    set((state) => ({
      todayFocuses: state.todayFocuses.filter((f) => f.id !== id),
      activeFocus: state.activeFocus?.id === id ? null : state.activeFocus,
      selectedFocusId: state.selectedFocusId === id ? null : state.selectedFocusId,
    })),

  // Checkpoint management
  addCheckpoint: (focusId, checkpoint) =>
    set((state) => {
      const updateCheckpoints = (focus: Focus) => {
        if (focus.id === focusId) {
          return {
            ...focus,
            checkpoints: [...(focus.checkpoints || []), checkpoint],
          }
        }
        return focus
      }

      return {
        todayFocuses: state.todayFocuses.map(updateCheckpoints),
        activeFocus: state.activeFocus?.id === focusId
          ? updateCheckpoints(state.activeFocus)
          : state.activeFocus,
      }
    }),

  updateCheckpoint: (focusId, checkpointId, updates) =>
    set((state) => {
      const updateFocusCheckpoints = (focus: Focus) => {
        if (focus.id === focusId && focus.checkpoints) {
          return {
            ...focus,
            checkpoints: focus.checkpoints.map((cp) =>
              cp.id === checkpointId ? { ...cp, ...updates } : cp
            ),
          }
        }
        return focus
      }

      return {
        todayFocuses: state.todayFocuses.map(updateFocusCheckpoints),
        activeFocus: state.activeFocus?.id === focusId
          ? updateFocusCheckpoints(state.activeFocus)
          : state.activeFocus,
      }
    }),

  removeCheckpoint: (focusId, checkpointId) =>
    set((state) => {
      const removeFocusCheckpoint = (focus: Focus) => {
        if (focus.id === focusId && focus.checkpoints) {
          return {
            ...focus,
            checkpoints: focus.checkpoints.filter((cp) => cp.id !== checkpointId),
          }
        }
        return focus
      }

      return {
        todayFocuses: state.todayFocuses.map(removeFocusCheckpoint),
        activeFocus: state.activeFocus?.id === focusId
          ? removeFocusCheckpoint(state.activeFocus)
          : state.activeFocus,
      }
    }),
}))