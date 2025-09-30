'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CircularProgressProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
  children?: React.ReactNode
  color?: string
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = false,
  children,
  color = 'stroke-primary'
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn("transition-all", color)}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            strokeDasharray: circumference,
            filter: value > 0 ? 'drop-shadow(0 0 6px currentColor)' : 'none'
          }}
        />
      </svg>

      {/* Content in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showValue && !children && (
          <span className="text-2xl font-bold">{Math.round(value)}%</span>
        )}
        {children}
      </div>
    </div>
  )
}