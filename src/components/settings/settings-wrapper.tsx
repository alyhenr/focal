'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { useThemeConfig } from '@/components/providers/theme-provider'
import { ThemePreview } from '@/components/settings/theme-preview'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  User,
  Bell,
  Palette,
  Clock,
  Shield,
  CreditCard,
  Download,
  Trash2,
  LogOut,
  Save,
  Volume2,
  Moon,
  Sun,
  Monitor,
  Mail,
  Key,
  Timer,
  Brain,
  Zap
} from 'lucide-react'

interface SettingsWrapperProps {
  user: any
}

export function SettingsWrapper({ user: initialUser }: SettingsWrapperProps) {
  const [saving, setSaving] = useState(false)
  const { theme, setTheme } = useTheme()
  const { accentColor, fontSize, setAccentColor, setFontSize } = useThemeConfig()
  const [mounted, setMounted] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    // Profile
    displayName: initialUser?.user_metadata?.full_name || initialUser?.email?.split('@')[0] || '',
    email: initialUser?.email || '',

    // Appearance - will be synced with actual theme state

    // Timer Defaults
    defaultSessionDuration: '25',
    defaultBreakDuration: '5',
    autoStartBreaks: false,
    autoStartNextSession: false,

    // Notifications
    soundEnabled: true,
    desktopNotifications: true,
    focusReminders: true,
    dailyReview: false,

    // Behavior
    confirmDelete: true,
    autoSave: true,
    keepLaterItems: false,
    weekStartsOn: 'monday',

    // Privacy
    analyticsEnabled: true,
    crashReports: true,
  })

  useEffect(() => {
    setMounted(true)
    // Load saved preferences from localStorage
    const savedSettings = localStorage.getItem('focal_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)

    try {
      // Save to localStorage for now
      // In production, this would save to a user_preferences table
      const settingsToSave = {
        ...settings,
        // Don't save theme settings as they're handled by next-themes and ThemeConfig
      }
      localStorage.setItem('focal_settings', JSON.stringify(settingsToSave))

      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleExportData = async () => {
    toast.success('Preparing your data export...')
    // This would trigger an actual data export in production
    setTimeout(() => {
      toast.success('Your data has been exported')
    }, 2000)
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not available in demo mode')
    }
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="account" className="space-y-7">
        <TabsList className="grid grid-cols-6 w-full h-12 p-1 gap-1">
          <TabsTrigger value="account" className="flex items-center gap-2 text-[0.9375rem]">
            <User className="h-[1.125rem] w-[1.125rem]" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 text-[0.9375rem]">
            <Palette className="h-[1.125rem] w-[1.125rem]" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="timer" className="flex items-center gap-2 text-[0.9375rem]">
            <Clock className="h-[1.125rem] w-[1.125rem]" />
            <span className="hidden sm:inline">Timer</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 text-[0.9375rem]">
            <Bell className="h-[1.125rem] w-[1.125rem]" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2 text-[0.9375rem]">
            <Shield className="h-[1.125rem] w-[1.125rem]" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2 text-[0.9375rem]">
            <CreditCard className="h-[1.125rem] w-[1.125rem]" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-7">
          <Card className="p-7 space-y-7 shadow-md hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">
                Update your account details and preferences
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-[0.9375rem]">Display Name</Label>
                <Input
                  id="displayName"
                  value={settings.displayName}
                  onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Your name"
                  className="h-12 text-[0.9375rem]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[0.9375rem]">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  disabled
                  className="bg-muted/50 h-12 text-[0.9375rem]"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed directly. Contact support if needed.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-7 space-y-7 shadow-md hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                Security
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">
                Manage your account security settings
              </p>
            </div>

            <div className="space-y-5">
              <Button variant="outline" className="w-full sm:w-auto h-12 text-[0.9375rem]">
                <Mail className="h-[1.125rem] w-[1.125rem] mr-2" />
                Change Password
              </Button>

              <Separator />

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-[0.9375rem]">Sign Out</Label>
                    <p className="text-[0.9375rem] text-muted-foreground">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="text-destructive hover:text-destructive h-12 text-[0.9375rem] shrink-0"
                  >
                    <LogOut className="h-[1.125rem] w-[1.125rem] mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-7">
          <Card className="p-7 space-y-7 shadow-md hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary" />
                Theme & Colors
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">
                Customize the look and feel of Focal
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-7">
              {/* Settings Column */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-[0.9375rem]">Theme</Label>
                  <Select
                    value={theme || 'system'}
                    onValueChange={setTheme}
                    disabled={!mounted}
                  >
                    <SelectTrigger id="theme" className="h-12 text-[0.9375rem]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <span className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </span>
                      </SelectItem>
                      <SelectItem value="dark">
                        <span className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </span>
                      </SelectItem>
                      <SelectItem value="system">
                        <span className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor" className="text-[0.9375rem]">Accent Color</Label>
                  <Select
                    value={accentColor}
                    onValueChange={(value) => setAccentColor(value as 'sage' | 'teal' | 'rose')}
                    disabled={!mounted}
                  >
                    <SelectTrigger id="accentColor" className="h-12 text-[0.9375rem]">
                      <SelectValue placeholder="Select accent color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sage">
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'oklch(0.62 0.12 145)' }} />
                          Sage Green
                        </span>
                      </SelectItem>
                      <SelectItem value="teal">
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'oklch(0.72 0.12 200)' }} />
                          Soft Teal
                        </span>
                      </SelectItem>
                      <SelectItem value="rose">
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'oklch(0.68 0.15 20)' }} />
                          Dusty Rose
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Changes the primary color throughout the app
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize" className="text-[0.9375rem]">Font Size</Label>
                  <Select
                    value={fontSize}
                    onValueChange={(value) => setFontSize(value as 'small' | 'medium' | 'large')}
                    disabled={!mounted}
                  >
                    <SelectTrigger id="fontSize" className="h-12 text-[0.9375rem]">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (85%)</SelectItem>
                      <SelectItem value="medium">Medium (100%)</SelectItem>
                      <SelectItem value="large">Large (115%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Adjust text size for better readability
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTheme('system')
                      setAccentColor('sage')
                      setFontSize('medium')
                      toast.success('Reset to default theme')
                    }}
                    disabled={!mounted}
                    className="h-12 text-[0.9375rem]"
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </div>

              {/* Preview Column */}
              <div>
                <ThemePreview />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Timer Tab */}
        <TabsContent value="timer" className="space-y-7">
          <Card className="p-7 space-y-7 shadow-md hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <Timer className="h-5 w-5 text-primary" />
                Timer Defaults
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">
                Set your preferred timer durations and behaviors
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="sessionDuration" className="text-[0.9375rem]">Default Session Duration</Label>
                <Select
                  value={settings.defaultSessionDuration}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, defaultSessionDuration: value }))}
                >
                  <SelectTrigger id="sessionDuration" className="h-12 text-[0.9375rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="50">50 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breakDuration" className="text-[0.9375rem]">Default Break Duration</Label>
                <Select
                  value={settings.defaultBreakDuration}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, defaultBreakDuration: value }))}
                >
                  <SelectTrigger id="breakDuration" className="h-12 text-[0.9375rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="autoStartBreaks" className="text-[0.9375rem]">Auto-start Breaks</Label>
                    <p className="text-[0.9375rem] text-muted-foreground">
                      Automatically start break timer after session ends
                    </p>
                  </div>
                  <Switch
                    id="autoStartBreaks"
                    checked={settings.autoStartBreaks}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoStartBreaks: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="autoStartNext" className="text-[0.9375rem]">Auto-start Next Session</Label>
                    <p className="text-[0.9375rem] text-muted-foreground">
                      Automatically start next session after break
                    </p>
                  </div>
                  <Switch
                    id="autoStartNext"
                    checked={settings.autoStartNextSession}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoStartNextSession: checked }))}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-7 space-y-7 shadow-md hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                Focus Preferences
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">
                Customize your focus session behavior
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="confirmDelete" className="text-[0.9375rem]">Confirm Deletions</Label>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Ask for confirmation before deleting items
                  </p>
                </div>
                <Switch
                  id="confirmDelete"
                  checked={settings.confirmDelete}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, confirmDelete: checked }))}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="autoSave" className="text-[0.9375rem]">Auto-save Changes</Label>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Automatically save edits without clicking save
                  </p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="keepLater" className="text-[0.9375rem]">Keep Later Items</Label>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Don&apos;t clear later list at end of day
                  </p>
                </div>
                <Switch
                  id="keepLater"
                  checked={settings.keepLaterItems}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, keepLaterItems: checked }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-7">
          <Card className="p-7 space-y-7 shadow-md hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">
                Control when and how Focal notifies you
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="soundEnabled" className="flex items-center gap-2 text-[0.9375rem]">
                    <Volume2 className="h-[1.125rem] w-[1.125rem]" />
                    Sound Effects
                  </Label>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Play sounds for timers and notifications
                  </p>
                </div>
                <Switch
                  id="soundEnabled"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="desktopNotifications" className="text-[0.9375rem]">Desktop Notifications</Label>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Show system notifications for important events
                  </p>
                </div>
                <Switch
                  id="desktopNotifications"
                  checked={settings.desktopNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, desktopNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="focusReminders" className="text-[0.9375rem]">Focus Reminders</Label>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Remind me to take breaks during long sessions
                  </p>
                </div>
                <Switch
                  id="focusReminders"
                  checked={settings.focusReminders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, focusReminders: checked }))}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dailyReview" className="text-[0.9375rem]">Daily Review</Label>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Send daily summary of your focus sessions
                  </p>
                </div>
                <Switch
                  id="dailyReview"
                  checked={settings.dailyReview}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dailyReview: checked }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-7">
          <Card className="p-7 space-y-7 shadow-md hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                Privacy & Data
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">
                Control your data and privacy settings
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="analytics" className="text-[0.9375rem]">Usage Analytics</Label>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Help improve Focal by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={settings.analyticsEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, analyticsEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="crashReports" className="text-[0.9375rem]">Crash Reports</Label>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Automatically send crash reports to help fix issues
                  </p>
                </div>
                <Switch
                  id="crashReports"
                  checked={settings.crashReports}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, crashReports: checked }))}
                />
              </div>

              <Separator />

              <div className="space-y-5">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full sm:w-auto h-12 text-[0.9375rem]"
                >
                  <Download className="h-[1.125rem] w-[1.125rem] mr-2" />
                  Export My Data
                </Button>

                <div className="p-5 rounded-xl bg-destructive/10 border border-destructive/20 space-y-4">
                  <h3 className="font-semibold text-destructive text-[0.9375rem]">Danger Zone</h3>
                  <p className="text-[0.9375rem] text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="h-12 text-[0.9375rem]"
                  >
                    <Trash2 className="h-[1.125rem] w-[1.125rem] mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-7">
          <Card className="p-7 space-y-7 shadow-md hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                Current Plan
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">
                You&apos;re currently on the free plan
              </p>
            </div>

            <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[0.9375rem]">Free Plan</h3>
                <span className="text-[0.9375rem] text-muted-foreground font-semibold">$0/month</span>
              </div>
              <ul className="space-y-2 text-[0.9375rem] text-muted-foreground">
                <li>• 3 focus sessions per day</li>
                <li>• 3 checkpoints per session</li>
                <li>• Basic timer and tracking</li>
                <li>• 7-day history</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border-2 border-primary space-y-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary text-[0.9375rem]">Pro Plan</h3>
                <span className="text-[0.9375rem] font-semibold text-primary">$9/month</span>
              </div>
              <ul className="space-y-2 text-[0.9375rem] text-muted-foreground">
                <li>• Unlimited focus sessions</li>
                <li>• Unlimited checkpoints</li>
                <li>• Advanced analytics</li>
                <li>• Unlimited history</li>
                <li>• Priority support</li>
                <li>• Export to CSV/JSON</li>
              </ul>
              <Button className="w-full h-12 text-[0.9375rem]" disabled>
                <CreditCard className="h-[1.125rem] w-[1.125rem] mr-2" />
                Upgrade to Pro (Coming Soon)
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          size="lg"
          className="shadow-xl h-14 px-7 text-[0.9375rem]"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="h-[1.125rem] w-[1.125rem] animate-spin rounded-full border-2 border-background border-t-transparent" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-[1.125rem] w-[1.125rem]" />
              Save Settings
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}