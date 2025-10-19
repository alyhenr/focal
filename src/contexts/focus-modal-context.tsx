'use client'

import { createContext, useContext, useState } from 'react'

interface FocusModalContextType {
  showNewFocusModal: boolean
  setShowNewFocusModal: (show: boolean) => void
  focusDate?: string
  setFocusDate: (date?: string) => void
}

const FocusModalContext = createContext<FocusModalContextType | undefined>(undefined)

export function FocusModalProvider({ children }: { children: React.ReactNode }) {
  const [showNewFocusModal, setShowNewFocusModal] = useState(false)
  const [focusDate, setFocusDate] = useState<string | undefined>(undefined)

  return (
    <FocusModalContext.Provider value={{ showNewFocusModal, setShowNewFocusModal, focusDate, setFocusDate }}>
      {children}
    </FocusModalContext.Provider>
  )
}

export function useFocusModal() {
  const context = useContext(FocusModalContext)
  if (!context) {
    throw new Error('useFocusModal must be used within FocusModalProvider')
  }
  return context
}
