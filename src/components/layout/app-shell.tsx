'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { CommandPalette } from '@/components/command/command-palette'
import { LaterList } from '@/components/later/later-list'
import { NewFocusModal } from '@/components/focus/new-focus-modal'
import { createFocusSession } from '@/app/actions/focus'
import { toast } from 'sonner'
import { useFocusStore } from '@/stores/focus-store'
import { NorthStar } from '@/types/focus'

interface AppShellProps {
  children: React.ReactNode
  northStars?: NorthStar[]
}

export function AppShell({ children, northStars = [] }: AppShellProps) {
  const [showLaterList, setShowLaterList] = useState(false)
  const [showNewFocusModal, setShowNewFocusModal] = useState(false)
  const { activeFocus, todayFocuses, addFocus } = useFocusStore()

  const handleCreateFocus = async (data: {
    title: string
    description?: string
    energy_level?: 'high' | 'medium' | 'low'
    north_star_id?: string
  }) => {
    const newFocus = await createFocusSession(data)

    if (newFocus) {
      addFocus(newFocus)
      setShowNewFocusModal(false)
      toast.success('Focus session created')
    } else {
      toast.error('Failed to create focus session')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onOpenLaterList={() => setShowLaterList(true)}
        onNewFocus={() => setShowNewFocusModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Command Palette */}
      <CommandPalette
        onOpenLaterList={() => setShowLaterList(true)}
        onNewFocus={() => setShowNewFocusModal(true)}
      />

      {/* Later List */}
      <LaterList
        open={showLaterList}
        onOpenChange={setShowLaterList}
        activeFocus={activeFocus}
      />

      {/* New Focus Modal */}
      <NewFocusModal
        open={showNewFocusModal}
        onOpenChange={setShowNewFocusModal}
        onSubmit={handleCreateFocus}
        sessionNumber={todayFocuses.length + 1}
        northStars={northStars}
      />
    </div>
  )
}