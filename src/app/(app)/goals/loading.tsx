import { AppShell } from '@/components/layout/app-shell'
import { Skeleton } from '@/components/ui/skeleton'

export default function GoalsLoading() {
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
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                North Star Goals
              </h1>
              <span className="text-sm text-gray-600">
                Your long-term objectives
              </span>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Empty State or Goals Grid Loading */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>

            {/* Goal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background rounded-xl border border-gray-100 p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                    <div className="text-right">
                      <Skeleton className="h-4 w-8 ml-auto" />
                    </div>
                  </div>

                  {/* Target Date */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>

                  {/* Stats */}
                  <div className="pt-3 border-t border-gray-100 flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  )
}