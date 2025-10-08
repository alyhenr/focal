import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { HistoryWrapper } from '@/components/history/history-wrapper'
import { getNorthStars, getFocusesByDateRange, getFocusStats, getStreakData } from '@/app/actions/focus'
import { Toaster } from 'sonner'

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { range?: string; start?: string; end?: string }
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  // Get date range from search params or default to last 7 days
  const range = params.range || '7days'
  let startDate: string
  let endDate: string

  const today = new Date()
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)
  endDate = endOfToday.toISOString().split('T')[0]

  // Calculate start date based on range
  switch (range) {
    case 'today':
      // For today, use the same date for both start and end
      startDate = today.toISOString().split('T')[0]
      break
    case '3days':
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(today.getDate() - 2) // -2 because today is included
      startDate = threeDaysAgo.toISOString().split('T')[0]
      break
    case '7days':
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 6)
      startDate = weekAgo.toISOString().split('T')[0]
      break
    case '2weeks':
      const twoWeeksAgo = new Date(today)
      twoWeeksAgo.setDate(today.getDate() - 13)
      startDate = twoWeeksAgo.toISOString().split('T')[0]
      break
    case 'month':
      const monthAgo = new Date(today)
      monthAgo.setMonth(today.getMonth() - 1)
      startDate = monthAgo.toISOString().split('T')[0]
      break
    case '3months':
      const threeMonthsAgo = new Date(today)
      threeMonthsAgo.setMonth(today.getMonth() - 3)
      startDate = threeMonthsAgo.toISOString().split('T')[0]
      break
    case 'custom':
      startDate = params.start || endDate
      endDate = params.end || endDate
      break
    case 'all':
      // Get all time data - set a very early start date
      startDate = '2024-01-01'
      break
    default:
      // Default to last week
      const defaultWeekAgo = new Date(today)
      defaultWeekAgo.setDate(today.getDate() - 6)
      startDate = defaultWeekAgo.toISOString().split('T')[0]
  }

  // Fetch data in parallel
  const [northStars, focusData, stats, streakData] = await Promise.all([
    getNorthStars(),
    getFocusesByDateRange(startDate, endDate, 100, 0),
    getFocusStats(startDate, endDate),
    getStreakData(),
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
          title="History"
          subtitle="Your journey of growth and progress"
        />

        {/* Main Content */}
        <main className="px-5 lg:px-10 py-10">
          <div className="max-w-7xl mx-auto">
            <HistoryWrapper
              initialFocuses={focusData.focuses}
              stats={stats}
              streakData={streakData}
              northStars={northStars}
              dateRange={{ start: startDate, end: endDate, preset: range }}
              totalCount={focusData.total}
            />
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster position="bottom-right" />
      </div>
    </AppShell>
  )
}