import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary">
              Focal
            </h1>
            <p className="text-base md:text-lg text-foreground/70 font-normal leading-relaxed">
              One focus per session. Meaningful progress every day.
            </p>
          </div>

          {/* Test Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 border-2 hover:border-primary transition-all duration-200">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-primary rounded-full" />
                </div>
                <h3 className="text-lg font-semibold">Focus Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple focused work blocks throughout your day
                </p>
              </div>
            </Card>

            <Card className="p-6 border-2 hover:border-secondary transition-all duration-200">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-secondary rounded-full" />
                </div>
                <h3 className="text-lg font-semibold">Later List</h3>
                <p className="text-sm text-muted-foreground">
                  Capture distractions without losing your flow
                </p>
              </div>
            </Card>

            <Card className="p-6 border-2 hover:border-success transition-all duration-200">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-success rounded-full" />
                </div>
                <h3 className="text-lg font-semibold">North Stars</h3>
                <p className="text-sm text-muted-foreground">
                  Connect daily work to meaningful goals
                </p>
              </div>
            </Card>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button size="lg" className="font-semibold" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="font-semibold" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Color Palette Test */}
          <div className="mt-16 space-y-4">
            <h2 className="text-2xl font-semibold">Theme Colors</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary rounded-lg mb-2" />
                <span className="text-xs">Primary</span>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-secondary rounded-lg mb-2" />
                <span className="text-xs">Secondary</span>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-success rounded-lg mb-2" />
                <span className="text-xs">Success</span>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-warning rounded-lg mb-2" />
                <span className="text-xs">Warning</span>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-danger rounded-lg mb-2" />
                <span className="text-xs">Danger</span>
              </div>
            </div>
          </div>

          {/* Tailwind Test */}
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tailwind is working! This uses standard Tailwind classes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}