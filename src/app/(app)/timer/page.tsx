import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
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
        <header className="border-b border-gray-100/50 bg-white/70 backdrop-blur-md sticky top-0 z-20">
          <div className="px-6 lg:pl-4 py-4">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                Focus Timer
              </h1>
              <span className="text-sm text-gray-600">
                Deep work without distractions
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative">
          <TimerContent user={user} />
        </main>
      </div>
    </AppShell>
  )
}