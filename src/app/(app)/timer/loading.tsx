import { Skeleton } from '@/components/ui/skeleton'

export default function TimerLoading() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Flowing Gradient Background */}
      <div className="gradient-bg">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
        <div className="gradient-mesh" />
      </div>

      {/* Header skeleton */}
      <div className="border-b border-gray-100/50 bg-background/70 backdrop-blur-md sticky top-0 z-20">
        <div className="px-6 lg:pl-4 py-4">
          <div className="flex items-center gap-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="px-4 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Timer display skeleton */}
          <div className="text-center">
            <div className="border-0 shadow-xl bg-background/70 backdrop-blur-sm rounded-lg">
              <div className="p-12 space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-24 w-64 mx-auto" />
                  <Skeleton className="h-3 w-full max-w-md mx-auto" />
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Skeleton className="h-11 w-32" />
                </div>
              </div>
            </div>
          </div>

          {/* Preset buttons skeleton */}
          <div>
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-36 w-full rounded-xl" />
              ))}
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}