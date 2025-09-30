'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Inbox,
  Plus,
  Archive,
  Trash2,
  ArrowRight,
  Loader2,
  RefreshCcw,
} from 'lucide-react'
import {
  createLaterItem,
  getLaterItems,
  processLaterItem,
  convertToCheckpoint,
  deleteLaterItem,
  clearLaterItems,
} from '@/app/actions/later'
import { Focus, LaterItem } from '@/types/focus'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LaterListProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeFocus?: Focus | null
}

export function LaterList({ open, onOpenChange, activeFocus }: LaterListProps) {
  const [items, setItems] = useState<LaterItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set())

  // Keyboard shortcut for opening
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'l' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange])

  // Load items when opened
  useEffect(() => {
    if (open) {
      loadItems()
    }
  }, [open])

  const loadItems = async () => {
    setLoading(true)
    const data = await getLaterItems()
    setItems(data)
    setLoading(false)
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim() || loading) return

    setLoading(true)
    const tempId = 'temp_' + Date.now()
    const content = newItem.trim()

    // Optimistically add to the list
    const tempItem: LaterItem = {
      id: tempId,
      user_id: '',
      content: content,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      processed_at: undefined,
      action_taken: undefined,
    }

    setItems(prev => [tempItem, ...prev])
    setNewItem('') // Clear input immediately for better UX

    // Create in the database
    const item = await createLaterItem(content)

    if (item) {
      // Replace temp item with real item
      setItems(prev => prev.map(i =>
        i.id === tempId ? item : i
      ))
      // Mark the real item as already animated
      setAnimatedIds(prev => new Set(prev).add(item.id))
      toast.success('Added to Later List')

      // Save to localStorage for offline support
      const localItems = JSON.parse(localStorage.getItem('laterItems') || '[]')
      localItems.push(item)
      localStorage.setItem('laterItems', JSON.stringify(localItems))
    } else {
      // Remove temp item on error
      setItems(prev => prev.filter(i => i.id !== tempId))
      setNewItem(content) // Restore input on error
      toast.error('Failed to add item')
    }

    setLoading(false)
  }


  const handleConvertToCheckpoint = async (item: LaterItem) => {
    if (!activeFocus) {
      toast.error('No active focus session')
      return
    }

    // Store original item for rollback
    const originalItemIndex = items.findIndex(i => i.id === item.id)

    // Optimistically remove from Later List
    setItems(prev => prev.filter(i => i.id !== item.id))

    toast.success('Converting to checkpoint...')

    // Process in background
    const result = await convertToCheckpoint(item.id, activeFocus.id)

    if (!result.success) {
      // Revert on failure - restore to original position
      setItems(prev => {
        const newItems = [...prev]
        newItems.splice(originalItemIndex, 0, item)
        return newItems
      })
      toast.error('Failed to convert')
    }
  }

  const handleArchive = async (item: LaterItem) => {
    setProcessingId(item.id)
    const success = await processLaterItem(item.id, 'archived')

    if (success) {
      setItems(items.filter(i => i.id !== item.id))
      toast.success('Archived')
    } else {
      toast.error('Failed to archive')
    }

    setProcessingId(null)
  }

  const handleDelete = async (item: LaterItem) => {
    setProcessingId(item.id)
    const success = await deleteLaterItem(item.id)

    if (success) {
      setItems(items.filter(i => i.id !== item.id))
      toast.success('Deleted')
    } else {
      toast.error('Failed to delete')
    }

    setProcessingId(null)
  }

  const handleClearAll = async () => {
    const success = await clearLaterItems()

    if (success) {
      setItems([])
      localStorage.removeItem('laterItems')
      toast.success('Cleared all items')
    } else {
      toast.error('Failed to clear items')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Later List
          </SheetTitle>
          <SheetDescription>
            Capture thoughts and tasks to process later
          </SheetDescription>
        </SheetHeader>

        {/* Quick add form */}
        <form onSubmit={handleAddItem} className="mt-6">
          <div className="flex gap-2">
            <Input
              placeholder="What's on your mind?"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              disabled={loading}
              autoFocus
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !newItem.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Items list */}
        <div className="mt-6 space-y-2 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">Things I want to think about later...</p>
            <Button variant="ghost" size="sm" onClick={loadItems}>
              <RefreshCcw className="h-3 w-3 text-primary" />
            </Button>
          </div>
          <AnimatePresence>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="h-12 w-12 mx-auto mb-3 opacity-30 animate-spin" />
                <p className="text-sm">Loading your notes...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Your Later List is empty</p>
                <p className="text-xs mt-1">
                  Press{' '}
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
                    ⌘K
                  </kbd>{' '}
                  to quick capture
                </p>
              </div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  initial={!animatedIds.has(item.id) ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onAnimationComplete={() => {
                    if (!animatedIds.has(item.id)) {
                      setAnimatedIds(prev => new Set(prev).add(item.id))
                    }
                  }}
                  className={cn(
                    'group p-3 bg-card rounded-lg border border-border',
                    'hover:border-border transition-all duration-150',
                    processingId === item.id && 'opacity-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeFocus && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleConvertToCheckpoint(item)}
                          disabled={processingId === item.id}
                          title="Convert to checkpoint"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArchive(item)}
                        disabled={processingId === item.id}
                        title="Archive"
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item)}
                        disabled={processingId === item.id}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Keyboard Shortcuts
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Quick Capture</span>
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-card border border-border rounded">
                ⌘K
              </kbd>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Open Later List</span>
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-card border border-border rounded">
                ⌘L
              </kbd>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}