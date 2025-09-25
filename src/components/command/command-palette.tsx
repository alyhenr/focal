'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Target,
  ListTodo,
  Calendar,
  History,
  Settings,
  Plus,
  Inbox,
  Timer,
  Search,
} from 'lucide-react'
import { createLaterItem } from '@/app/actions/later'
import { toast } from 'sonner'

interface CommandPaletteProps {
  onOpenLaterList?: () => void
  onNewFocus?: () => void
}

export function CommandPalette({ onOpenLaterList, onNewFocus }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const router = useRouter()

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }

      // Quick capture with Cmd+Shift+K
      if (e.key === 'k' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
        setIsCapturing(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Handle quick capture
  const handleQuickCapture = useCallback(async () => {
    if (!search.trim()) return

    const item = await createLaterItem(search.trim())
    if (item) {
      toast.success('Added to Later List')
      setSearch('')
      setOpen(false)
      setIsCapturing(false)
    } else {
      toast.error('Failed to capture item')
    }
  }, [search])

  // Handle command selection
  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder={isCapturing ? 'Capture for later...' : 'Type a command or search...'}
        value={search}
        onValueChange={setSearch}
        onKeyDown={(e) => {
          if (isCapturing && e.key === 'Enter') {
            e.preventDefault()
            handleQuickCapture()
          }
        }}
      />
      <CommandList>
        {isCapturing && search ? (
          <CommandGroup heading="Quick Capture">
            <CommandItem onSelect={handleQuickCapture}>
              <Inbox className="mr-2 h-4 w-4" />
              <span>Add &quot;{search}&quot; to Later List</span>
            </CommandItem>
          </CommandGroup>
        ) : (
          <>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              <CommandItem
                onSelect={() => {
                  runCommand(() => {
                    setIsCapturing(true)
                  })
                }}
              >
                <Inbox className="mr-2 h-4 w-4" />
                <span>Quick Capture</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600">
                  <span className="text-xs">⇧⌘K</span>
                </kbd>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => onNewFocus?.())
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>New Focus Session</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600">
                  <span className="text-xs">⌘N</span>
                </kbd>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => onOpenLaterList?.())
                }}
              >
                <ListTodo className="mr-2 h-4 w-4" />
                <span>Open Later List</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600">
                  <span className="text-xs">⌘L</span>
                </kbd>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/dashboard'))
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/goals'))
                }}
              >
                <Target className="mr-2 h-4 w-4" />
                <span>Goals</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/history'))
                }}
              >
                <History className="mr-2 h-4 w-4" />
                <span>History</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/calendar'))
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/settings'))
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Tools">
              <CommandItem
                onSelect={() => {
                  runCommand(() => {
                    // Start a pomodoro timer
                    toast.info('Pomodoro timer coming soon!')
                  })
                }}
              >
                <Timer className="mr-2 h-4 w-4" />
                <span>Start Pomodoro (25 min)</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}