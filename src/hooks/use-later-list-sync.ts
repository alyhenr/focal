import { useEffect, useCallback } from 'react'
import { createLaterItem } from '@/app/actions/later'

const STORAGE_KEY = 'focal_later_items_pending'
const SYNC_INTERVAL = 30000 // 30 seconds

export function useLaterListSync() {
  // Sync pending items from localStorage to database
  const syncPendingItems = useCallback(async () => {
    try {
      const pendingItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

      if (pendingItems.length === 0) return

      const synced: string[] = []
      const failed: { tempId: string; content: string; created_at: string }[] = []

      for (const item of pendingItems) {
        const result = await createLaterItem(item.content)
        if (result) {
          synced.push(item.tempId)
        } else {
          failed.push(item)
        }
      }

      // Update localStorage with only failed items
      localStorage.setItem(STORAGE_KEY, JSON.stringify(failed))

      if (synced.length > 0) {
        console.log(`Synced ${synced.length} later items`)
      }
    } catch (error) {
      console.error('Failed to sync later items:', error)
    }
  }, [])

  // Add item to local storage for offline support
  const addOfflineItem = useCallback((content: string) => {
    const pendingItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const newItem = {
      tempId: `temp_${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
    }

    pendingItems.push(newItem)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingItems))

    return newItem
  }, [])

  // Check if we're online and sync
  useEffect(() => {
    const handleOnline = () => {
      syncPendingItems()
    }

    // Sync on mount if online
    if (navigator.onLine) {
      syncPendingItems()
    }

    // Set up periodic sync
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncPendingItems()
      }
    }, SYNC_INTERVAL)

    // Listen for online event
    window.addEventListener('online', handleOnline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
    }
  }, [syncPendingItems])

  return {
    addOfflineItem,
    syncPendingItems,
  }
}