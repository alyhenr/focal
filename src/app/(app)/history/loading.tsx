import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryLoading() {
  return (
    <div className="min-h-screen relative">
      {/* Flowing Gradient Background */}
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
              History
            </h1>
            <span className="text-sm text-gray-600">
              Your journey of growth and progress
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>

          {/* Controls Bar Skeleton */}
          <Skeleton className="h-40 rounded-lg" />

          {/* List Items Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}