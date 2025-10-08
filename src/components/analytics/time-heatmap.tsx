'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { useChartTheme, CustomTooltipProps } from '@/lib/analytics-utils'

interface TimeHeatmapProps {
  data: Array<{
    hour: number
    count: number
    label: string
  }>
}

// Custom Tooltip
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">
        {payload[0]?.payload?.label}
      </p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <p className="text-sm font-medium text-foreground">
          {payload[0]?.value} {payload[0]?.value === 1 ? 'session' : 'sessions'}
        </p>
      </div>
    </div>
  )
}

export function TimeHeatmap({ data }: TimeHeatmapProps) {
  const chartTheme = useChartTheme()
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const hasData = data.some(d => d.count > 0)

  // Filter to show only hours with data, or show key hours
  const displayData = hasData
    ? data.filter(d => d.count > 0 || [6, 9, 12, 15, 18, 21].includes(d.hour))
    : data.filter(d => [9, 12, 15, 18].includes(d.hour))

  // Get bar color based on intensity - using vibrant sage green gradient
  const getBarColor = (count: number) => {
    if (count === 0) return chartTheme.primaryLight
    const intensity = count / maxCount
    if (intensity > 0.7) return chartTheme.primary
    if (intensity > 0.4) return chartTheme.primaryMedium
    return chartTheme.primaryLight
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Activity by Time
          </h3>
          <p className="text-xs text-muted-foreground">When you focus most</p>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartTheme.grid}
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke={chartTheme.textMuted}
                fontSize={10}
                tickLine={false}
                tick={{ fill: chartTheme.textMuted }}
              />
              <YAxis
                stroke={chartTheme.textMuted}
                fontSize={11}
                tickLine={false}
                tick={{ fill: chartTheme.textMuted }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-muted-foreground italic">
            Start focusing to see your activity patterns
          </p>
        </div>
      )}
    </motion.div>
  )
}
