import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoalsContent } from '@/components/goals/goals-content'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { getNorthStarsWithProgress, getNorthStars } from '@/app/actions/focus'
import { Toaster } from 'sonner'

export default async function GoalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  // Get all the data we need
  const [northStarsWithProgress, northStars] = await Promise.all([
    getNorthStarsWithProgress(),
    getNorthStars(),
  ])

  return (
    <AppShell northStars={northStars}>
      <div className="min-h-screen relative">
        {/* Standard Gradient Background - matching dashboard */}
        <div className="gradient-bg">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
          <div className="gradient-orb gradient-orb-3" />
          <div className="gradient-mesh" />
        </div>

        {/* Header */}
        <PageHeader
          title="North Star Goals"
          subtitle="Your long-term objectives"
          actions={
            profile?.subscription_status === 'free' && northStarsWithProgress.length > 0 ? (
              <span className="text-sm text-muted-foreground">
                {northStarsWithProgress.length}/3 goals
              </span>
            ) : undefined
          }
        />

        {/* Main Content */}
        <main className="px-4 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <GoalsContent
              northStars={northStarsWithProgress}
              subscriptionStatus={profile?.subscription_status || 'free'}
              userId={user.id}
            />
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster position="bottom-right" />
      </div>
    </AppShell>
  )
}