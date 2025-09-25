import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { SignOutButton } from '@/components/common/sign-out-button'
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
    <div className="min-h-screen relative">
      {/* Flowing Gradient Background */}
      <div className="gradient-bg">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
        <div className="gradient-mesh" />
      </div>

      {/* Header - Frosted Glass */}
      <header className="border-b border-gray-100/50 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Focal
            </h1>
            <span className="text-xs text-gray-500 hidden sm:inline">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
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
  )
}