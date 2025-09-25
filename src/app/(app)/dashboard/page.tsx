import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { SignOutButton } from '@/components/common/sign-out-button'
import { GradientBackground } from '@/components/ui/gradient-background'
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
      {/* Subtle Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <GradientBackground />
        {/* Additional subtle overlay for dashboard */}
        <div className="absolute inset-0 bg-background/95" />
      </div>

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Focal
            </h1>
            <span className="text-sm text-muted-foreground hidden sm:inline">
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