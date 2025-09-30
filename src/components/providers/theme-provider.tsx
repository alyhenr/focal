'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Custom context for accent color and font size
interface ThemeConfig {
  accentColor: 'sage' | 'teal' | 'rose'
  fontSize: 'small' | 'medium' | 'large'
  setAccentColor: (color: 'sage' | 'teal' | 'rose') => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}

const ThemeConfigContext = React.createContext<ThemeConfig | undefined>(undefined)

export function ThemeConfigProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = React.useState<'sage' | 'teal' | 'rose'>('sage')
  const [fontSize, setFontSizeState] = React.useState<'small' | 'medium' | 'large'>('medium')

  React.useEffect(() => {
    // Load saved preferences
    const savedAccent = localStorage.getItem('focal-accent-color') as 'sage' | 'teal' | 'rose' | null
    const savedFontSize = localStorage.getItem('focal-font-size') as 'small' | 'medium' | 'large' | null

    if (savedAccent) {
      setAccentColorState(savedAccent)
      document.documentElement.setAttribute('data-accent', savedAccent)
    } else {
      // Set default accent
      document.documentElement.setAttribute('data-accent', 'sage')
    }

    if (savedFontSize) {
      setFontSizeState(savedFontSize)
      document.documentElement.setAttribute('data-font-size', savedFontSize)
    } else {
      // Set default font size
      document.documentElement.setAttribute('data-font-size', 'medium')
    }
  }, [])

  const setAccentColor = React.useCallback((color: 'sage' | 'teal' | 'rose') => {
    setAccentColorState(color)
    localStorage.setItem('focal-accent-color', color)
    document.documentElement.setAttribute('data-accent', color)
  }, [])

  const setFontSize = React.useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size)
    localStorage.setItem('focal-font-size', size)
    document.documentElement.setAttribute('data-font-size', size)
  }, [])

  return (
    <ThemeConfigContext.Provider
      value={{
        accentColor,
        fontSize,
        setAccentColor,
        setFontSize,
      }}
    >
      {children}
    </ThemeConfigContext.Provider>
  )
}

export function useThemeConfig() {
  const context = React.useContext(ThemeConfigContext)
  if (context === undefined) {
    throw new Error('useThemeConfig must be used within a ThemeConfigProvider')
  }
  return context
}