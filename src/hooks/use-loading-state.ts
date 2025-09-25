import { useState, useCallback } from 'react'

interface UseLoadingStateOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async <T>(asyncFunction: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await asyncFunction()
        options.onSuccess?.()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred')
        setError(error)
        options.onError?.(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    execute,
    reset,
  }
}