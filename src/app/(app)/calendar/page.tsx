import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { CalendarWrapper } from '@/components/calendar/calendar-wrapper'
import { getNorthStars } from '@/app/actions/focus'
import { Toaster } from 'sonner'

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch north stars for AppShell
  const northStars = await getNorthStars()

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
          title="Calendar"
          subtitle="Plan your commitments and visualize your focus history"
        />

        {/* Main Content */}
        <main className="px-4 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <CalendarWrapper />
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster position="bottom-right" />
      </div>
    </AppShell>
  )
}



