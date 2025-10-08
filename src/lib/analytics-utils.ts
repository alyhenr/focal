// Analytics utility functions for charts and data transformations
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

// Custom hook to get theme-aware chart colors
export function useChartTheme() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine if dark mode is active
  const isDark = mounted
    ? theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
    : false

  return getChartTheme(isDark)
}

// Get theme-aware chart colors
// Returns colors that are visible in both light and dark themes
export function getChartTheme(isDark: boolean) {
  return {
    // Primary sage green - brighter for dark mode
    primary: isDark ? '#8FB9A8' : '#6B8E7F',
    primaryLight: isDark ? 'rgba(143, 185, 168, 0.3)' : 'rgba(107, 142, 127, 0.2)',
    primaryMedium: isDark ? 'rgba(143, 185, 168, 0.6)' : 'rgba(107, 142, 127, 0.5)',

    // Secondary soft teal
    secondary: '#5EEAD4',
    secondaryLight: 'rgba(94, 234, 212, 0.2)',

    // Success soft mint
    success: '#86EFAC',
    successLight: 'rgba(134, 239, 172, 0.2)',

    // Warning warm amber
    warning: '#FCD34D',
    warningLight: 'rgba(252, 211, 77, 0.2)',

    // Destructive soft coral
    destructive: '#F87171',
    destructiveLight: 'rgba(248, 113, 113, 0.2)',

    // Text and grid colors - explicit colors for Recharts compatibility
    text: isDark ? '#E5E7EB' : '#1F2937',
    textMuted: isDark ? '#9CA3AF' : '#6B7280',
    grid: isDark ? '#374151' : '#E5E7EB',

    // Background
    background: isDark ? '#1F2937' : '#FFFFFF',

    // Energy level colors - vibrant and clear
    energyHigh: '#86EFAC',    // Soft mint green
    energyMedium: '#FCD34D',  // Warm amber
    energyLow: '#F87171',     // Soft coral

    // Gradient colors for charts
    gradientStart: isDark ? 'rgba(143, 185, 168, 0.5)' : 'rgba(107, 142, 127, 0.4)',
    gradientEnd: isDark ? 'rgba(143, 185, 168, 0.1)' : 'rgba(107, 142, 127, 0.05)',
  }
}

// Legacy export for backwards compatibility
// Note: This uses light theme colors. Use getChartTheme() for theme-aware colors
export const chartTheme = getChartTheme(false)

// Format date for chart labels (short format)
export function formatChartDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Format date for tooltip (long format)
export function formatTooltipDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

// Format hour (0-23) to readable time
export function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}${period}`
}

// Custom tooltip component props type
export interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    name: string
    color: string
    payload?: any // The actual data point with all fields
  }>
  label?: string
}

// Get chart height based on screen size
export function getChartHeight(type: 'line' | 'bar' | 'donut'): number {
  if (typeof window === 'undefined') return 300

  const width = window.innerWidth

  if (type === 'donut') {
    return width < 640 ? 200 : 240
  }

  if (type === 'bar') {
    return width < 640 ? 280 : 320
  }

  // line chart
  return width < 640 ? 200 : 240
}

// Calculate streak sparkline data (last 7 days)
export function getStreakSparklineData(
  dailyData: Array<{ date: string; completed: number }>,
  days: number = 7
): Array<{ day: string; value: number }> {
  const today = new Date()
  const result: Array<{ day: string; value: number }> = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const dayData = dailyData.find(d => d.date === dateStr)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

    result.push({
      day: dayName,
      value: dayData?.completed || 0
    })
  }

  return result
}

// Get color intensity based on value (for heatmap)
export function getHeatmapColor(value: number, max: number): string {
  if (max === 0) return chartTheme.primaryLight

  const intensity = value / max

  if (intensity > 0.7) return chartTheme.primary
  if (intensity > 0.4) return chartTheme.primaryMedium
  return chartTheme.primaryLight
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

// Get responsive font sizes
export function getResponsiveFontSize(type: 'label' | 'value' | 'axis'): number {
  if (typeof window === 'undefined') return 12

  const width = window.innerWidth

  if (type === 'value') {
    return width < 640 ? 20 : 24
  }

  if (type === 'label') {
    return width < 640 ? 10 : 12
  }

  // axis
  return width < 640 ? 10 : 11
}
