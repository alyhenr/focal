'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { LoadingButton } from './loading-button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  className?: string
}

export function SignOutButton({
  variant = 'ghost',
  size = 'sm',
  showIcon = true,
  className
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast.success('Signed out successfully')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Failed to sign out', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
      setIsLoading(false)
    }
  }

  return (
    <LoadingButton
      variant={variant}
      size={size}
      onClick={handleSignOut}
      loading={isLoading}
      loadingText="Signing out..."
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Sign out
    </LoadingButton>
  )
}