import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/stores/timer-store'

export function useTimerWorker() {
  const workerRef = useRef<Worker | null>(null)
  const {
    isRunning,
    isPaused,
    currentTime,
    totalDuration,
    setCurrentTime,
    stopTimer,
  } = useTimerStore()

  useEffect(() => {
    // Initialize worker
    if (typeof window !== 'undefined' && !workerRef.current) {
      workerRef.current = new Worker('/timer-worker.js')

      workerRef.current.onmessage = (e) => {
        const { type, time } = e.data

        switch (type) {
          case 'TICK':
            setCurrentTime(time)
            break
          case 'COMPLETE':
            stopTimer()
            break
          case 'TIME_UPDATE':
            setCurrentTime(time)
            break
        }
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle timer state changes
  useEffect(() => {
    if (!workerRef.current) return

    if (isRunning && !isPaused) {
      // Start or resume timer
      workerRef.current.postMessage({
        type: 'START',
        payload: { duration: currentTime },
      })
    } else if (isPaused) {
      // Pause timer
      workerRef.current.postMessage({ type: 'PAUSE' })
    } else if (!isRunning) {
      // Stop timer
      workerRef.current.postMessage({ type: 'STOP' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPaused, totalDuration])

  // Sync time on resume
  useEffect(() => {
    if (workerRef.current && isRunning && !isPaused) {
      workerRef.current.postMessage({ type: 'GET_TIME' })
    }
  }, [isRunning, isPaused])

  return workerRef.current
}