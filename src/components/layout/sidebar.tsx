'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  Menu,
  X,
  Zap,
  Timer,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

interface SidebarProps {
  onOpenLaterList?: () => void
  onNewFocus?: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    shortcut: '⌘D',
    action: null,
  },
  {
    name: 'New Focus',
    href: null,
    icon: Plus,
    shortcut: '⌘N',
    action: 'newFocus',
    accent: 'primary',
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
    shortcut: '⌘G',
    action: null,
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    shortcut: null,
    action: null,
    badge: 'Soon',
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
    shortcut: null,
    action: null,
  },
]

const tools = [
  {
    name: 'Timer',
    icon: Timer,
    shortcut: '⌘T',
    action: 'timer',
  },
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
    shortcut: '⌘,',
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    shortcut: '⌘?',
  },
]

export function Sidebar({ onOpenLaterList, onNewFocus }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const handleAction = (action: string | null) => {
    if (action === 'newFocus') {
      onNewFocus?.()
    } else if (action === 'laterList') {
      onOpenLaterList?.()
    } else if (action === 'timer') {
      toast.info('Timer shortcuts coming soon!')
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
      {/* Logo/Brand */}
      <div className="px-3 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!collapsed && <motion.div
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
            className="flex items-center gap-2"
          >
            <Zap className="h-5 w-5 text-primary" />
            {!collapsed && (
              <span className="font-semibold text-lg tracking-tight">Focal</span>
            )}
          </motion.div>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs font-medium text-gray-400 px-3 mb-2"
            >
              NAVIGATION
            </motion.p>
          )}
        </AnimatePresence>

        {navigation.map((item) => {
          const isActive = item.href && pathname === item.href
          const Icon = item.icon

          // For items with href, use Link for better performance
          if (item.href && !item.badge) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className={cn(
                  'h-4 w-4 flex-shrink-0',
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
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 border border-gray-200 rounded">
                          {item.shortcut}
                        </kbd>
                      )}
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(item.action)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative',
                item.accent === 'primary' && 'hover:bg-primary/5 hover:text-primary',
                item.badge && 'opacity-60 cursor-not-allowed',
                !item.badge && 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
              )}
              disabled={!!item.badge}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 border border-gray-200 rounded">
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

        {/* Tools Section */}
        <div className="pt-4">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-medium text-gray-400 px-3 mb-2"
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(item.action)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50 text-gray-600 hover:text-gray-900"
              >
                <Icon className="h-4 w-4 flex-shrink-0" />

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 border border-gray-200 rounded">
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

      {/* Bottom Navigation */}
      <div className="border-t border-gray-100 px-3 py-4 space-y-1">
        {bottomNav.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 border border-gray-200 rounded">
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
        className="hidden lg:flex lg:flex-col bg-white border-r border-gray-100 h-screen sticky top-0 z-40"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

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
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}