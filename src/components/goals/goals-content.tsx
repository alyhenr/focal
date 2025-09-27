'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoalCard } from '@/components/goals/goal-card'
import { NewGoalModal } from '@/components/goals/new-goal-modal'
import { Button } from '@/components/ui/button'
import { Plus, Target, TrendingUp, Calendar, Filter, LayoutGrid, LayoutList } from 'lucide-react'
import { createNorthStar } from '@/app/actions/focus'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface GoalsContentProps {
  northStars: any[]
  subscriptionStatus: 'free' | 'pro' | 'trial'
  userId: string
}

type ViewMode = 'grid' | 'list'
type SortBy = 'created' | 'progress' | 'target' | 'name'

export function GoalsContent({ northStars, subscriptionStatus }: GoalsContentProps) {
  const [goals, setGoals] = useState(northStars)
  const [showNewGoalModal, setShowNewGoalModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('created')

  const handleCreateGoal = async (data: {
    title: string
    description?: string
    target_date?: string
  }) => {
    try {
      const newGoal = await createNorthStar(data)
      if (newGoal) {
        setGoals([...goals, { ...newGoal, progress: { total: 0, completed: 0, percentage: 0 } }])
        setShowNewGoalModal(false)
        toast.success('Goal created successfully!')
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Free users')) {
        toast.error('Goal limit reached', {
          description: error.message,
        })
      } else {
        toast.error('Failed to create goal', {
          description: error instanceof Error ? error.message : 'Please try again',
        })
      }
    }
  }

  const handleGoalUpdate = (goalId: string, updates: any) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g))
  }

  const handleGoalArchive = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId))
  }

  const sortedGoals = [...goals].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return (b.progress?.percentage || 0) - (a.progress?.percentage || 0)
      case 'target':
        return (a.target_date || '').localeCompare(b.target_date || '')
      case 'name':
        return a.title.localeCompare(b.title)
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const canCreateMore = subscriptionStatus !== 'free' || goals.length < 3

  // Calculate stats
  const totalProgress = goals.reduce((acc, g) => acc + (g.progress?.percentage || 0), 0) / (goals.length || 1)
  const totalSessions = goals.reduce((acc, g) => acc + (g.progress?.completed || 0), 0)
  const activeGoals = goals.filter(g => !g.completed_at).length
  const completedGoals = goals.filter(g => g.completed_at).length

  return (
    <>
      {/* Empty State */}
      {goals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px] text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Target className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Set Your North Star</h2>
          <p className="text-gray-600 max-w-md mb-6">
            Define your long-term goals and let every focus session contribute to something meaningful.
          </p>
          <Button onClick={() => setShowNewGoalModal(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Goal
          </Button>
        </motion.div>
      )}

      {/* Goals View */}
      {goals.length > 0 && (
        <>
          {/* Header with Actions */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold">Your Goals</h2>
                <p className="text-sm text-gray-600">
                  Track your progress toward meaningful objectives
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="created">Recent</option>
                  <option value="progress">Progress</option>
                  <option value="target">Target Date</option>
                  <option value="name">Name</option>
                </select>

                {/* New Goal Button */}
                {canCreateMore && (
                  <Button onClick={() => setShowNewGoalModal(true)} className="ml-2">
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{activeGoals}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{Math.round(totalProgress)}%</p>
                  <p className="text-xs text-gray-600">Avg Progress</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{totalSessions}</p>
                  <p className="text-xs text-gray-600">Sessions</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Filter className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{completedGoals}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Goals Grid/List */}
          <div className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          )}>
            <AnimatePresence mode="popLayout">
              {sortedGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GoalCard
                    goal={goal}
                    onUpdate={handleGoalUpdate}
                    onArchive={handleGoalArchive}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Upgrade Prompt */}
          {subscriptionStatus === 'free' && goals.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Ready for more goals?</h3>
                  <p className="text-sm text-gray-600">
                    Upgrade to Pro for unlimited goals, advanced analytics, and priority support.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Upgrade to Pro
                </Button>
              </div>
            </motion.div>
          )}

          {/* Future Constellation Mode Placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed"
            >
              <span className="text-xs">🌟</span>
              Constellation View
              <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">Coming Soon</span>
            </button>
          </motion.div>
        </>
      )}

      {/* New Goal Modal */}
      <NewGoalModal
        open={showNewGoalModal}
        onOpenChange={setShowNewGoalModal}
        onSubmit={handleCreateGoal}
      />
    </>
  )
}