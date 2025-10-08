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
        className="h-14 text-[0.9375rem]"
      />
      <CommandList className="max-h-[450px]">
        {isCapturing && search ? (
          <CommandGroup heading="Quick Capture" className="p-2">
            <CommandItem onSelect={handleQuickCapture} className="py-3 px-3 text-[0.9375rem]">
              <Inbox className="mr-3 h-[1.125rem] w-[1.125rem]" />
              <span>Add &quot;{search}&quot; to Later List</span>
            </CommandItem>
          </CommandGroup>
        ) : (
          <>
            <CommandEmpty className="py-8 text-center text-[0.9375rem]">No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions" className="p-2">
              <CommandItem
                onSelect={() => {
                  runCommand(() => {
                    setIsCapturing(true)
                  })
                }}
                className="py-3 px-3 text-[0.9375rem]"
              >
                <Inbox className="mr-3 h-[1.125rem] w-[1.125rem]" />
                <span>Quick Capture</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground">
                  <span className="text-xs">⇧⌘K</span>
                </kbd>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => onNewFocus?.())
                }}
                className="py-3 px-3 text-[0.9375rem]"
              >
                <Plus className="mr-3 h-[1.125rem] w-[1.125rem]" />
                <span>New Focus Session</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘N</span>
                </kbd>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => onOpenLaterList?.())
                }}
                className="py-3 px-3 text-[0.9375rem]"
              >
                <ListTodo className="mr-3 h-[1.125rem] w-[1.125rem]" />
                <span>Open Later List</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘L</span>
                </kbd>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator className="my-2" />
            <CommandGroup heading="Navigation" className="p-2">
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/dashboard'))
                }}
                className="py-3 px-3 text-[0.9375rem]"
              >
                <Search className="mr-3 h-[1.125rem] w-[1.125rem]" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/goals'))
                }}
                className="py-3 px-3 text-[0.9375rem]"
              >
                <Target className="mr-3 h-[1.125rem] w-[1.125rem]" />
                <span>Goals</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/history'))
                }}
                className="py-3 px-3 text-[0.9375rem]"
              >
                <History className="mr-3 h-[1.125rem] w-[1.125rem]" />
                <span>History</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/calendar'))
                }}
                className="py-3 px-3 text-[0.9375rem]"
              >
                <Calendar className="mr-3 h-[1.125rem] w-[1.125rem]" />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push('/settings'))
                }}
                className="py-3 px-3 text-[0.9375rem]"
              >
                <Settings className="mr-3 h-[1.125rem] w-[1.125rem]" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator className="my-2" />
            <CommandGroup heading="Tools" className="p-2">
              <CommandItem
                onSelect={() => {
                  runCommand(() => {
                    // Start a pomodoro timer
                    toast.info('Pomodoro timer coming soon!')
                  })
                }}
                className="py-3 px-3 text-[0.9375rem]"
              >
                <Timer className="mr-3 h-[1.125rem] w-[1.125rem]" />
                <span>Start Pomodoro (25 min)</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}