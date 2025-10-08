import { AppShell } from '@/components/layout/app-shell'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="min-h-screen relative">
        {/* Flowing Gradient Background */}
        <div className="gradient-bg">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
          <div className="gradient-orb gradient-orb-3" />
          <div className="gradient-mesh" />
        </div>

        {/* Header */}
        <header className="border-b border-gray-100/50 bg-background/70 backdrop-blur-md sticky top-0 z-20">
          <div className="px-6 lg:pl-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <span className="text-xl font-semibold text-foreground tracking-tight lg:hidden ml-8 lg:ml-0">
                Focal
              </span>
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <div className="flex gap-4">
                  {/* Streak boxes */}
                  <div className="text-center">
                    <Skeleton className="h-10 w-10 mx-auto mb-2 rounded-full" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="h-10 w-10 mx-auto mb-2 rounded-full" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Focus Sessions */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />

              {/* Empty state or focus cards */}
              <div className="flex justify-center py-8">
                <div className="w-32 h-32 bg-primary/5 rounded-2xl flex items-center justify-center">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-background/50 rounded-xl border border-gray-100">
                  <Skeleton className="h-10 w-10 mb-3 rounded" />
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  )
}