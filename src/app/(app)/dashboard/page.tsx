import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { SignOutButton } from '@/components/common/sign-out-button'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import {
  getTodayFocuses,
  getActiveFocus,
  getNorthStars,
  getStreakData,
  getDailyCompletionData,
  getHourlyActivityData,
  getWeeklyStats,
  getFocusStats
} from '@/app/actions/focus'
import { Toaster } from 'sonner'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all the data we need (including analytics)
  const [
    todayFocuses,
    activeFocus,
    northStars,
    streakData,
    completionData,
    hourlyData,
    weeklyStats,
    statsData
  ] = await Promise.all([
    getTodayFocuses(),
    getActiveFocus(),
    getNorthStars(),
    getStreakData(),
    getDailyCompletionData(30),
    getHourlyActivityData(),
    getWeeklyStats(),
    getFocusStats(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    )
  ])

  return (
    <AppShell northStars={northStars}>
      <div className="min-h-screen relative">
        {/* Flowing Gradient Background */}
        <div className="gradient-bg">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
          <div className="gradient-orb gradient-orb-3" />
          <div className="gradient-mesh" />
        </div>

        {/* Header */}
        <PageHeader
          title="Focal"
          subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          actions={<SignOutButton />}
        />

        {/* Main Content */}
        <main className="px-5 lg:px-10 py-10">
          <div className="max-w-7xl mx-auto">
            <DashboardContent
              user={user}
              todayFocuses={todayFocuses}
              activeFocus={activeFocus}
              northStars={northStars}
              analyticsData={{
                streakData,
                completionData,
                hourlyData,
                weeklyStats,
                energyDistribution: statsData.energyDistribution
              }}
            />
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster position="bottom-right" />
      </div>
    </AppShell>
  )
}