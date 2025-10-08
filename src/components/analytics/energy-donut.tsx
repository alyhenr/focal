'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { useChartTheme, CustomTooltipProps } from '@/lib/analytics-utils'

interface EnergyDonutProps {
  energyDistribution: {
    high: number
    medium: number
    low: number
  }
}

// Custom Tooltip
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">
        {payload[0]?.name}
      </p>
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: payload[0]?.payload?.fill }}
        />
        <p className="text-sm font-medium text-foreground">
          {payload[0]?.value} {payload[0]?.value === 1 ? 'session' : 'sessions'}
        </p>
      </div>
    </div>
  )
}

export function EnergyDonut({ energyDistribution }: EnergyDonutProps) {
  const chartTheme = useChartTheme()
  const total = energyDistribution.high + energyDistribution.medium + energyDistribution.low

  const data = [
    {
      name: 'High Energy',
      value: energyDistribution.high,
      fill: chartTheme.energyHigh
    },
    {
      name: 'Medium Energy',
      value: energyDistribution.medium,
      fill: chartTheme.energyMedium
    },
    {
      name: 'Low Energy',
      value: energyDistribution.low,
      fill: chartTheme.energyLow
    }
  ].filter(item => item.value > 0) // Only show segments with data

  const hasData = total > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-warning/10">
          <Zap className="h-4 w-4 text-warning" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Energy Levels
          </h3>
          <p className="text-xs text-muted-foreground">Session distribution</p>
        </div>
      </div>

      {hasData ? (
        <div className="flex items-center justify-between">
          {/* Donut Chart */}
          <div className="h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {energyDistribution.high > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: chartTheme.energyHigh }}
                  />
                  <span className="text-xs text-foreground">High</span>
                </div>
                <span className="text-xs font-medium text-foreground">
                  {energyDistribution.high}
                </span>
              </div>
            )}
            {energyDistribution.medium > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: chartTheme.energyMedium }}
                  />
                  <span className="text-xs text-foreground">Medium</span>
                </div>
                <span className="text-xs font-medium text-foreground">
                  {energyDistribution.medium}
                </span>
              </div>
            )}
            {energyDistribution.low > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: chartTheme.energyLow }}
                  />
                  <span className="text-xs text-foreground">Low</span>
                </div>
                <span className="text-xs font-medium text-foreground">
                  {energyDistribution.low}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center">
          <p className="text-sm text-muted-foreground italic">
            Track energy levels to see distribution
          </p>
        </div>
      )}
    </motion.div>
  )
}
