import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { TimerContent } from '@/components/timer/timer-content'
import { getNorthStars } from '@/app/actions/focus'

export default async function TimerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const northStars = await getNorthStars()

  return (
    <AppShell northStars={northStars}>
      <div className="min-h-screen relative">
        {/* Flowing Gradient Background - same as dashboard */}
        <div className="gradient-bg">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
          <div className="gradient-orb gradient-orb-3" />
          <div className="gradient-mesh" />
        </div>

        {/* Header */}
        <PageHeader
          title="Focus Timer"
          subtitle="Deep work without distractions"
        />

        {/* Main Content */}
        <main className="relative">
          <TimerContent user={user} />
        </main>
      </div>
    </AppShell>
  )
}