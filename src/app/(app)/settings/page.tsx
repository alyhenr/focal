import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { SettingsWrapper } from '@/components/settings/settings-wrapper'
import { getNorthStars } from '@/app/actions/focus'
import { Toaster } from 'sonner'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch north stars for AppShell
  const northStars = await getNorthStars()

  return (
    <AppShell northStars={northStars}>
      <SettingsWrapper user={user} />
      <Toaster position="bottom-right" />
    </AppShell>
  )
}