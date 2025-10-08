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
          className="flex flex-col items-center justify-center min-h-[500px] text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-8 shadow-md">
            <Target className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Set Your North Star</h2>
          <p className="text-[0.9375rem] text-muted-foreground max-w-md mb-8 leading-relaxed">
            Define your long-term goals and let every focus session contribute to something meaningful.
          </p>
          <Button onClick={() => setShowNewGoalModal(true)} size="lg" className="shadow-md hover:shadow-lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Goal
          </Button>
        </motion.div>
      )}

      {/* Goals View */}
      {goals.length > 0 && (
        <>
          {/* Header with Actions - Enhanced */}
          <div className="bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm rounded-2xl border shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
              <div>
                <h2 className="text-2xl font-bold mb-1">Your Goals</h2>
                <p className="text-[0.9375rem] text-muted-foreground">
                  Track your progress toward meaningful objectives
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-muted rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded-md transition-all",
                      viewMode === 'grid' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    )}
                  >
                    <LayoutGrid className="h-[1.125rem] w-[1.125rem]" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 rounded-md transition-all",
                      viewMode === 'list' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    )}
                  >
                    <LayoutList className="h-[1.125rem] w-[1.125rem]" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-4 py-2.5 bg-card border border-border rounded-lg text-[0.9375rem] font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="created">Recent</option>
                  <option value="progress">Progress</option>
                  <option value="target">Target Date</option>
                  <option value="name">Name</option>
                </select>

                {/* New Goal Button */}
                {canCreateMore && (
                  <Button onClick={() => setShowNewGoalModal(true)} className="ml-2 shadow-md hover:shadow-lg">
                    <Plus className="h-[1.125rem] w-[1.125rem] mr-2" />
                    New Goal
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats - Enhanced */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-card to-primary/5 rounded-xl p-5 border shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-primary/10 rounded-xl shadow-sm">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeGoals}</p>
                  <p className="text-sm text-muted-foreground font-medium">Active</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-card to-success/5 rounded-xl p-5 border shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-success/10 rounded-xl shadow-sm">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totalProgress)}%</p>
                  <p className="text-sm text-muted-foreground font-medium">Avg Progress</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-card to-secondary/5 rounded-xl p-5 border shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-secondary/10 rounded-xl shadow-sm">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSessions}</p>
                  <p className="text-sm text-muted-foreground font-medium">Sessions</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-card to-accent/5 rounded-xl p-5 border shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-accent/10 rounded-xl shadow-sm">
                  <Filter className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedGoals}</p>
                  <p className="text-sm text-muted-foreground font-medium">Completed</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Goals Grid/List - Enhanced */}
          <div className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-5"
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

          {/* Upgrade Prompt - Enhanced */}
          {subscriptionStatus === 'free' && goals.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 p-7 bg-gradient-to-r from-primary/10 via-card to-secondary/10 rounded-2xl border shadow-lg"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div>
                  <h3 className="text-xl font-bold mb-2">Ready for more goals?</h3>
                  <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">
                    Upgrade to Pro for unlimited goals, advanced analytics, and priority support.
                  </p>
                </div>
                <Button variant="outline" size="lg" className="shadow-md hover:shadow-lg shrink-0">
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
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground bg-muted rounded-lg cursor-not-allowed"
            >
              <span className="text-xs">🌟</span>
              Constellation View
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Coming Soon</span>
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