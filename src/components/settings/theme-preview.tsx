'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react'

export function ThemePreview() {
  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Preview</h3>
        <p className="text-sm text-muted-foreground">
          See how your theme choices will look
        </p>
      </div>

      {/* Text Samples */}
      <div className="space-y-2">
        <h4 className="text-base font-medium">Typography</h4>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Extra small text</p>
          <p className="text-sm text-muted-foreground">Small text</p>
          <p className="text-base">Base text size</p>
          <p className="text-lg font-medium">Large heading</p>
          <p className="text-xl font-semibold">Extra large heading</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <h4 className="text-base font-medium">Buttons</h4>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Primary</Button>
          <Button variant="secondary" size="sm">Secondary</Button>
          <Button variant="outline" size="sm">Outline</Button>
          <Button variant="ghost" size="sm">Ghost</Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="space-y-2">
        <h4 className="text-base font-medium">Status Indicators</h4>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Badge>
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Target className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      {/* Sample Card */}
      <div className="space-y-2">
        <h4 className="text-base font-medium">Card Example</h4>
        <Card className="p-4 bg-card border">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium">Focus Session</h5>
              <p className="text-sm text-muted-foreground">Building new features</p>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">High Energy</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Focus Ring Demo */}
      <div className="space-y-2">
        <h4 className="text-base font-medium">Focus State</h4>
        <button className="px-3 py-1.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all">
          Click to see focus ring
        </button>
      </div>
    </Card>
  )
}