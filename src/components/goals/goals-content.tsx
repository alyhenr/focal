'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoalCard } from '@/components/goals/goal-card'
import { NewGoalModal } from '@/components/goals/new-goal-modal'
import { Button } from '@/components/ui/button'
import { Plus, Target, Sparkles } from 'lucide-react'
import { createNorthStar } from '@/app/actions/focus'
import { toast } from 'sonner'

interface GoalsContentProps {
  northStars: any[]
  subscriptionStatus: 'free' | 'pro' | 'trial'
  userId: string
}

export function GoalsContent({ northStars, subscriptionStatus }: GoalsContentProps) {
  const [goals, setGoals] = useState(northStars)
  const [showNewGoalModal, setShowNewGoalModal] = useState(false)

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

  const canCreateMore = subscriptionStatus !== 'free' || goals.length < 3

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
          <h2 className="text-2xl font-semibold mb-3">Set Your North Star</h2>
          <p className="text-gray-600 max-w-md mb-6">
            Define your long-term goals and let every focus session contribute to something meaningful.
          </p>
          <Button onClick={() => setShowNewGoalModal(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Goal
          </Button>
        </motion.div>
      )}

      {/* Goals Grid */}
      {goals.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">Your Goals</h2>
              <p className="text-sm text-gray-600">
                Track your progress toward meaningful objectives
              </p>
            </div>
            {canCreateMore && (
              <Button onClick={() => setShowNewGoalModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GoalCard
                    goal={goal}
                    onUpdate={handleGoalUpdate}
                    onArchive={handleGoalArchive}
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
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Want More Goals?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Upgrade to Pro to create unlimited goals and unlock advanced features.
              </p>
              <Button variant="outline" size="sm">
                Upgrade to Pro
              </Button>
            </motion.div>
          )}
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