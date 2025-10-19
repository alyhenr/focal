'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/sidebar-context'
import {
  Home,
  Target,
  ListTodo,
  Calendar,
  History,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Command,
  Zap,
  Timer,
  Plus,
} from 'lucide-react'

interface SidebarProps {
  onOpenLaterList?: () => void
  onNewFocus?: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    action: null,
    shortcut: null,
  },
  {
    name: 'New Focus',
    href: null,
    icon: Plus,
    action: 'newFocus',
    accent: 'primary',
    shortcut: null,
  },
  {
    name: 'Later List',
    href: null,
    icon: ListTodo,
    shortcut: '⌘L',
    action: 'laterList',
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target,
    action: null,
    shortcut: null,
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    shortcut: null,
    action: null,
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
    shortcut: null,
    action: null,
  },
  {
    name: 'Timer',
    href: '/timer',
    icon: Timer,
    shortcut: null,
    action: null,
  },
]

const tools = [
  {
    name: 'Command',
    icon: Command,
    shortcut: '⌘K',
    action: 'command',
  },
]

const bottomNav = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    shortcut: null,
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    shortcut: null,
  },
]

export function Sidebar({ onOpenLaterList, onNewFocus }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()

  const handleAction = (action: string | null) => {
    if (action === 'newFocus') {
      onNewFocus?.()
    } else if (action === 'laterList') {
      onOpenLaterList?.()
    } else if (action === 'command') {
      // Trigger command palette
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        ctrlKey: false,
      })
      document.dispatchEvent(event)
    }

    // Close mobile menu after action
    setMobileOpen(false)
  }

  const SidebarContent = () => (
    <>
      {/* Logo/Brand - Enhanced */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && <motion.div
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
            className="flex items-center gap-2.5"
          >
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            {!collapsed && (
              <span className="font-bold text-xl tracking-tight">Focal</span>
            )}
          </motion.div>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex hover:bg-muted"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Navigation - Enhanced */}
      <div className="flex-1 px-4 py-5 space-y-1.5">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs font-semibold text-muted-foreground px-3 mb-3 uppercase tracking-wider"
            >
              NAVIGATION
            </motion.p>
          )}
        </AnimatePresence>

        {navigation.map((item) => {
          const isActive = item.href && pathname === item.href
          const Icon = item.icon

          // For items with href, use Link for better performance
          if (item.href) {
          return (
            <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all group relative',
                  isActive
                    ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm'
                    : 'hover:bg-muted hover:text-foreground text-muted-foreground hover:shadow-sm'
                )}
              >
                <Icon className={cn(
                  'h-[1.125rem] w-[1.125rem] flex-shrink-0 transition-transform group-hover:scale-110',
                  isActive && 'text-primary'
                )} />

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="text-[0.9375rem] font-semibold">{item.name}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            )
          }

          // For action items or disabled items, use button
          return (
            <motion.button
              key={item.name}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleAction(item.action)}
              className={cn(
                'w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all group relative',
                item.accent === 'primary' && 'hover:bg-primary/5 hover:text-primary hover:shadow-sm',
              )}
            >
              <Icon className="h-[1.125rem] w-[1.125rem] flex-shrink-0 transition-transform group-hover:scale-110" />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 flex items-center justify-between"
                  >
                    <span className="text-[0.9375rem] font-semibold">{item.name}</span>
                    <div className="flex items-center gap-2" >
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold bg-muted/80 border border-border rounded-md shadow-sm">
                          {item.shortcut}
                        </kbd>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}

        {/* Tools Section - Enhanced */}
        <div className="pt-5">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-semibold text-muted-foreground px-3 mb-3 uppercase tracking-wider"
              >
                TOOLS
              </motion.p>
            )}
          </AnimatePresence>

          {tools.map((item) => {
            const Icon = item.icon

            return (
              <motion.button
                key={item.name}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleAction(item.action)}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all hover:bg-muted hover:text-foreground text-muted-foreground hover:shadow-sm group"
              >
                <Icon className="h-[1.125rem] w-[1.125rem] flex-shrink-0 transition-transform group-hover:scale-110" />

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="text-[0.9375rem] font-semibold">{item.name}</span>
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold bg-muted/80 border border-border rounded-md shadow-sm">
                          {item.shortcut}
                        </kbd>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Bottom Navigation - Enhanced */}
      <div className="border-t border-border px-4 py-5 space-y-1.5">
        {bottomNav.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm'
                  : 'hover:bg-muted hover:text-foreground text-muted-foreground hover:shadow-sm'
              )}
            >
              <Icon className={cn(
                'h-[1.125rem] w-[1.125rem] flex-shrink-0 transition-transform group-hover:scale-110',
                isActive && 'text-primary'
              )} />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 flex items-center justify-between"
                  >
                    <span className="text-[0.9375rem] font-semibold">{item.name}</span>
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold bg-muted/80 border border-border rounded-md shadow-sm">
                        {item.shortcut}
                      </kbd>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        className="hidden lg:flex lg:flex-col bg-card border-r border-border h-screen sticky top-0 z-40"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-background border-r border-border shadow-2xl z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}