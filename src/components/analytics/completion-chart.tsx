'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { useChartTheme, formatChartDate, formatTooltipDate, CustomTooltipProps } from '@/lib/analytics-utils'

interface CompletionChartProps {
  data: Array<{
    date: string
    total: number
    completed: number
    rate: number
  }>
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">
        {formatTooltipDate(label || '')}
      </p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <p className="text-sm font-medium text-foreground">
          {payload[0]?.value}% completion
        </p>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {payload[0]?.payload?.completed} of {payload[0]?.payload?.total} completed
      </p>
    </div>
  )
}

export function CompletionChart({ data }: CompletionChartProps) {
  const chartTheme = useChartTheme()
  const hasData = data.some(d => d.total > 0)
  const avgRate = hasData
    ? Math.round(data.reduce((sum, d) => sum + d.rate, 0) / data.length)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-1">
            Completion Rate
          </h3>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <p className="text-2xl font-bold text-foreground">{avgRate}%</p>
          </div>
          <p className="text-xs text-muted-foreground">average</p>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartTheme.primary} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartTheme.primary} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartTheme.grid}
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                stroke={chartTheme.textMuted}
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                tick={{ fill: chartTheme.textMuted }}
              />
              <YAxis
                stroke={chartTheme.textMuted}
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: chartTheme.textMuted }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={chartTheme.primary}
                strokeWidth={3}
                fill="url(#completionGradient)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-muted-foreground italic">
            No data available yet. Complete some focus sessions to see your progress.
          </p>
        </div>
      )}
    </motion.div>
  )
}
