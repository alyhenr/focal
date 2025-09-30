'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useSidebar } from '@/contexts/sidebar-context'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const { mobileOpen, toggleMobile } = useSidebar()

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
      <div className="px-6 lg:pl-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobile}
            className="lg:hidden -ml-2"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}