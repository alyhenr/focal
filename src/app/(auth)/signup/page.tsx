'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { signInWithEmail, signInWithGoogle } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { GradientBackground } from '@/components/ui/gradient-background'
import { Mail, Loader2, ChevronRight, Sparkles, Zap, Coffee, TrendingUp, ListPlus } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const
    }
  }
}

const cardVariants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  }
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signInWithEmail(email)

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({
          type: 'success',
          text: 'Welcome aboard! Check your email to complete signup.'
        })
        setEmail('')
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setMessage(null)

    try {
      await signInWithGoogle()
    } catch {
      setMessage({
        type: 'error',
        text: 'Could not sign up with Google. Please try again.'
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Gradient Background */}
      <GradientBackground />

      {/* Floating Elements for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        {/* Logo & Branding - Enhanced */}
        <motion.div
          className="text-center mb-10"
          variants={itemVariants}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1] as const,
              delay: 0.1
            }}
            className="flex items-center justify-center mb-4"
          >
            <div className="relative">
              {/* Animated glow behind logo */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <h1 className="relative text-5xl font-bold tracking-tighter">
                <span className="bg-gradient-to-br from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                  Focal
                </span>
              </h1>
            </div>
          </motion.div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Join thousands finding clarity in their work
          </p>
        </motion.div>

        {/* Signup Card - Enhanced with glassmorphism */}
        <motion.div
          className="w-full max-w-sm"
          variants={itemVariants}
        >
          <motion.div
            className="relative group"
            whileHover="hover"
            initial="rest"
            animate="rest"
            variants={cardVariants}
          >
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />

            {/* Card content */}
            <div className="relative bg-card/95 backdrop-blur-xl border border-border/10 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-center mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Start your journey
              </h2>

              {/* Free Trial Badge - Elegant */}
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-success/10 to-primary/10 border border-success/10 text-xs font-medium">
                  <Zap className="h-3 w-3 text-success" />
                  <span className="bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                    7-day free trial • No credit card
                  </span>
                </span>
              </motion.div>

              <div className="space-y-4">
                {/* Google Sign Up - Enhanced */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-10 rounded-md bg-white/60 dark:bg-white/5 border border-border/20 hover:border-border/30 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 shadow-sm"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        <span className="text-sm font-medium text-foreground">Get started with Google</span>
                      </>
                    )}
                  </Button>
                </motion.div>

                <div className="relative">
                  <Separator className="bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    or
                  </span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                      Email address
                    </Label>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading || isGoogleLoading}
                        className="h-10 text-sm rounded-md bg-background/50 border border-border/10 focus:border-primary/30 focus:bg-background/70 transition-all duration-200"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-10 rounded-md bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium text-sm transition-all duration-200 shadow-lg shadow-primary/20"
                      disabled={isLoading || isGoogleLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating your account...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Start free trial
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Message Display */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`px-3 py-2 rounded-md text-xs font-medium backdrop-blur-sm ${
                      message.type === 'success'
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}
                  >
                    {message.type === 'success' && <Sparkles className="inline h-3 w-3 mr-1" />}
                    {message.text}
                  </motion.div>
                )}

                {/* Sign In Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="text-primary hover:text-primary/80 font-medium transition-colors duration-base inline-flex items-center group"
                    >
                      Sign in
                      <ChevronRight className="h-3 w-3 ml-0.5 transition-transform duration-base group-hover:translate-x-0.5" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Value Props - Beautiful grid */}
        <motion.div
          className="mt-10 grid grid-cols-3 gap-3 max-w-sm"
          variants={itemVariants}
        >
          {[
            { icon: Coffee, label: 'Focus deeply', description: 'One thing at a time' },
            { icon: ListPlus, label: 'Capture all', description: 'Never lose an idea' },
            { icon: TrendingUp, label: 'See progress', description: 'Track your growth' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5 + i * 0.1,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1] as const
              }}
              whileHover={{
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="text-center space-y-2 p-3 rounded-lg bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-border/20 dark:border-border/30 hover:border-border/30 dark:hover:border-border/40 transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 dark:bg-primary/20">
                <item.icon className="h-4 w-4 text-primary dark:text-primary/90" />
              </div>
              <p className="text-xs font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/90">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}