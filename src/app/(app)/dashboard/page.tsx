import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { SignOutButton } from '@/components/common/sign-out-button'
import { AppShell } from '@/components/layout/app-shell'
import { getTodayFocuses, getActiveFocus, getNorthStars } from '@/app/actions/focus'
import { Toaster } from 'sonner'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all the data we need
  const [todayFocuses, activeFocus, northStars] = await Promise.all([
    getTodayFocuses(),
    getActiveFocus(),
    getNorthStars(),
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
        <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <div className="px-6 lg:pl-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-foreground tracking-tight lg:hidden ml-8 lg:ml-0">
                Focal
              </h1>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <SignOutButton />
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <DashboardContent
              user={user}
              todayFocuses={todayFocuses}
              activeFocus={activeFocus}
              northStars={northStars}
            />
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster position="bottom-right" />
      </div>
    </AppShell>
  )
}