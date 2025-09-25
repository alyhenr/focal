# Focal - Development Tasks

> **Project**: Focal - Mindful Productivity App
> **Concept**: One focus per session (multiple sessions per day allowed)
> **Stack**: Next.js 15, Supabase, Stripe, Tailwind CSS, shadcn/ui
> **Timeline**: 3 weeks to MVP

---

## =� Task Overview

- [ ] **Setup & Configuration** - Project foundation
- [ ] **Database & Authentication** - Core infrastructure
- [ ] **Core Features** - Essential functionality
- [ ] **Premium Features** - Monetization
- [ ] **Polish & Launch** - Production ready

---

## =� Phase 1: Foundation Setup (Days 1-3)

### 1.1 Project Configuration
- [x] Install core dependencies
  ```bash
  bun add @supabase/supabase-js @supabase/ssr
  bun add stripe @stripe/stripe-js
  bun add framer-motion
  bun add date-fns
  bun add zustand
  bun add react-hook-form zod
  bun add lucide-react
  bun add clsx tailwind-merge
  bun add sonner next-themes
  ```

- [x] Install dev dependencies
  ```bash
  bun add -D prettier eslint @typescript-eslint/eslint-plugin
  bun add -D eslint-config-next
  bun add -D @types/node
  ```

- [x] Configure ESLint (.eslintrc.json)
- [x] Configure Prettier (.prettierrc)
- [x] Create environment variables template (.env.local.example)
  ```env
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
  ```

### 1.2 shadcn/ui Setup
- [x] Initialize shadcn/ui with custom configuration
  ```bash
  bunx shadcn@latest init
  ```
- [x] Configure custom theme colors in tailwind.config.ts
- [x] Add essential components (button, card, dialog, form, input, label)
  ```bash
  bunx shadcn@latest add button card dialog form
  bunx shadcn@latest add input label select separator
  bunx shadcn@latest add sheet skeleton tabs textarea
  bunx shadcn@latest add toast tooltip switch
  ```

### 1.3 Project Structure
- [x] Create folder structure
  ```
  /src
    /app
      /(auth)
        /login
        /signup
      /(app)
        /dashboard
        /goals
        /history
        /settings
    /components
      /ui         # shadcn components
      /focus      # Focus-related components
      /layout     # Layout components
      /providers  # Context providers
    /lib
      /supabase   # Database client
      /stripe     # Payment utilities
      /utils      # Helper functions
    /hooks        # Custom React hooks
    /types        # TypeScript definitions
    /styles       # Global styles
  ```

### 1.4 Supabase Setup
- [x] Create Supabase client configurations
- [x] Create database schema SQL file
- [x] Create Supabase project (needs manual setup)
- [x] Configure authentication providers (magic link)
- [ ] Generate TypeScript types
  ```bash
  bunx supabase gen types typescript --project-id [PROJECT_ID] > src/types/supabase.ts
  ```

---

## =� Phase 2: Database & Authentication (Days 4-5)

### 2.1 Database Schema
- [ ] Create users table extensions
- [ ] Create focuses table (multiple sessions per day)
  ```sql
  CREATE TABLE focuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    north_star_id UUID REFERENCES north_stars(id) ON DELETE SET NULL,
    session_number INTEGER NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    description TEXT,
    energy_level TEXT CHECK (energy_level IN ('high', 'medium', 'low')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] Create checkpoints table
- [ ] Create later_items table
- [ ] Create north_stars table
- [ ] Create timer_sessions table
- [ ] Create streaks table
- [ ] Set up RLS policies for all tables

### 2.2 Authentication Flow
- [ ] Create auth context provider
- [ ] Implement magic link sign in/up
- [ ] Create auth middleware for protected routes
- [ ] Build login/signup pages
- [ ] Add session management
- [ ] Implement logout functionality
- [ ] Create user profile management

---

## ✅ Phase 3: Core Features (Days 6-10) - **COMPLETE** ✅

### 3.1 Focus Session Management - **COMPLETE** ✅
- [x] Create new focus session form (Modal with energy level, description)
- [x] Display active focus session (Professional cards with sage green theme)
- [x] Allow multiple sessions per day (Session numbering)
- [x] Session completion flow (Review modal with stats)
- [x] Session history for today (Borderless focus blocks grid)
- [x] Edit active session (Inline editing everywhere)
- [x] Delete/Stop session (Separate actions with confirmation)
- [x] Auto-save functionality (Optimistic updates with Zustand)
- [x] Pause/Resume functionality (With visual feedback)
- [x] ESC key to exit focus mode
- [x] Complete sessions without starting them

### 3.2 Checkpoint System - **COMPLETE** ✅
- [x] Add checkpoint to focus (Optimistic creation, no reload)
- [x] Edit checkpoint text (Click to edit inline)
- [x] Delete checkpoint (Hover to reveal action)
- [x] Mark checkpoint complete (Optimistic toggle)
- [x] Progress visualization (Thin green progress bar)
- [x] Auto-complete message when all done
- [x] Checkpoint limit (3 for free, enforced in backend)
- [ ] Reorder checkpoints (drag & drop) - **Nice to have, not MVP**

### 3.3 Later List - **COMPLETE** ✅
- [x] Create slide-out panel component
- [x] Implement Cmd+K keyboard shortcut
- [x] Quick capture input with autofocus
- [x] Display today's captured items
- [x] Process items (convert to checkpoint/archive/delete)
- [x] Session-based grouping
- [x] Auto-clear at day end option
- [x] Local storage for offline capture
- [x] Sync when online
- [ ] Item limit (50 per day free tier) - **Backend enforcement needed**

### 3.4 Timer & Pomodoro - **COMPLETE** ✅
- [x] Horizontal progress bar component
- [ ] Two-tier timer (focus + checkpoint) - **Future enhancement**
- [x] Pomodoro presets (25/50/90 min)
- [x] Custom duration (5-90 min)
- [ ] Break timer - **Auto-start breaks ready, UI needed**
- [x] Pause/resume functionality
- [x] Audio notifications
- [x] Visual notifications
- [x] Background timer (Web Workers)
- [x] Timer persistence in localStorage

---

## =� Phase 4: Premium Features (Days 11-13)

### 4.1 North Star Goals
- [ ] Create goal form
- [ ] Edit goal details
- [ ] Link focus to goal
- [ ] Progress calculation
- [ ] Visual progress indicator
- [ ] Goal completion celebration
- [ ] Archive completed goals
- [ ] Goal limit (3 active)

### 4.2 Analytics & History
- [ ] Focus history calendar view
- [ ] List view with search
- [ ] Completion rate stats
- [ ] Time-of-day patterns
- [ ] Energy level tracking
- [ ] Streak tracking
- [ ] Weekly/monthly summaries
- [ ] Export to CSV/JSON

### 4.3 Stripe Integration
- [ ] Set up Stripe products/prices
- [ ] Create checkout session
- [ ] Handle webhooks
- [ ] Subscription status sync
- [ ] Billing portal integration
- [ ] Trial period (7 days)
- [ ] Upgrade/downgrade flow
- [ ] Payment failure handling

---

## ( Phase 5: Polish & UX (Days 14-16)

### 5.1 User Experience
- [ ] Onboarding flow (3 screens max)
- [ ] Empty states design
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Keyboard shortcuts
- [ ] Command palette
- [ ] Help documentation

### 5.2 Animations & Transitions
- [ ] Page transitions (Framer Motion)
- [ ] Micro-interactions
- [ ] Completion celebrations
- [ ] Smooth list reordering
- [ ] Progress animations
- [ ] Skeleton loading
- [ ] Parallax effects (subtle)
- [ ] Hover states

### 5.3 Mobile & Responsive
- [ ] Mobile-first responsive design
- [ ] Touch gestures
- [ ] PWA manifest
- [ ] Service worker
- [ ] Offline support
- [ ] App icons
- [ ] Splash screen
- [ ] Mobile navigation

---

## >� Phase 6: Testing & QA (Days 17-18)

### 6.1 Testing
- [ ] Unit tests for utilities
- [ ] Component testing
- [ ] Integration tests
- [ ] E2E critical paths
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Mobile device testing

### 6.2 Optimization
- [ ] Code splitting
- [ ] Image optimization
- [ ] Font optimization
- [ ] Bundle size analysis
- [ ] Lighthouse audit
- [ ] SEO optimization
- [ ] Meta tags
- [ ] Sitemap generation

---

## =� Phase 7: Launch Preparation (Days 19-21)

### 7.1 Production Setup
- [ ] Vercel deployment
- [ ] Environment variables
- [ ] Custom domain
- [ ] SSL certificate
- [ ] Error monitoring (Sentry)
- [ ] Analytics (PostHog)
- [ ] Uptime monitoring
- [ ] Backup strategy

### 7.2 Legal & Documentation
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] GDPR compliance
- [ ] User documentation
- [ ] API documentation
- [ ] README update
- [ ] Contributing guide

### 7.3 Marketing & Launch
- [ ] Landing page
- [ ] Product Hunt preparation
- [ ] Social media accounts
- [ ] Email templates
- [ ] Blog post draft
- [ ] Demo video
- [ ] Screenshots
- [ ] Press kit

---

## = Known Issues & Bugs

### High Priority
- [ ] TBD after initial development

### Medium Priority
- [ ] TBD after initial development

### Low Priority
- [ ] TBD after initial development

---

## =� Future Enhancements (Post-MVP)

### Version 2.0 Ideas
- [ ] AI-powered focus suggestions
- [ ] Team collaboration features
- [ ] Voice input for Later List
- [ ] Calendar integration
- [ ] Time tracking automation
- [ ] Public progress pages
- [ ] Mobile apps (React Native)
- [ ] Browser extension
- [ ] Slack/Discord integration
- [ ] Focus templates library
- [ ] Mood tracking
- [ ] Weekly coaching emails
- [ ] Focus music integration
- [ ] Accountability partners
- [ ] API for developers

---

## =� Progress Tracking

### Week 1 (Days 1-7)
- [ ] Foundation complete
- [ ] Authentication working
- [ ] Basic focus creation

### Week 2 (Days 8-14)
- [ ] Core features complete
- [ ] Premium features integrated
- [ ] Payments working

### Week 3 (Days 15-21)
- [ ] Fully polished
- [ ] Tests passing
- [ ] Ready for launch

---

## <� Success Metrics

### Technical
- [ ] <1s page load time
- [ ] 100% uptime
- [ ] 0 critical bugs
- [ ] 80% test coverage

### Business
- [ ] Landing page conversion >5%
- [ ] Free to paid conversion >10%
- [ ] User retention >60% (Day 7)
- [ ] NPS score >50

### User Experience
- [ ] Onboarding <2 minutes
- [ ] Time to first focus <1 minute
- [ ] Daily active usage >60%
- [ ] Completion rate >70%

---

## =� Notes

**Key Decisions:**
- Multiple focus sessions per day (not just one)
- Hard limit on checkpoints for free tier
- Supabase for all backend needs
- Stripe for payments (not Paddle/Lemon Squeezy)
- No social features in MVP
- Mobile web first (no native apps yet)

**Architecture Principles:**
- Server components by default
- Optimistic UI updates everywhere
- Offline-first approach
- Progressive enhancement
- Accessibility from day one

**Design Philosophy:**
- Calm, not energetic
- Constraint as feature
- Progress over perfection
- Beautiful simplicity
- Mindful defaults

---

*Last Updated: Later List & Timer System implementation complete*
*Status: Phase 3 fully complete - Focus, Checkpoints, Later List, Timer all working*
*Next: Phase 4 - Premium Features (Goals, Stripe, Analytics)*

---

## ✅ COMPLETION STATUS

### Phase 1: Foundation Setup - **COMPLETE** ✅
- All dependencies installed (using bun)
- Tailwind v4 configured with Forest Calm palette
- shadcn/ui components added
- Professional UI utilities (shadows, typography)
- Supabase client configurations ready

### Phase 2: Database & Authentication - **COMPLETE** ✅
- Database schema created and applied
- RLS policies configured
- Magic link authentication working
- Google OAuth integrated
- Login/signup pages
- Dashboard page with frosted glass header
- Protected routes configured

### Phase 3: Core Features - **COMPLETE** ✅

**UI/UX Achievements:**
- **Professional redesign** with sage green theme
- **Borderless cards** with layered shadows
- **Frosted glass header** with backdrop blur
- **Optimistic updates** everywhere
- **Session review modals** for completion
- **Pause/Resume** with proper state
- **ESC key** support
- **No page reloads** for any action

**What's Working:**
- Focus session CRUD
- Checkpoint management
- Focus mode transformation
- Multiple sessions per day
- Energy level tracking
- Progress visualization
- Inline editing everywhere
- Toast notifications

### 🎯 Next Session - Critical Path:

#### 1. **Later List Implementation (Phase 3.3)** - 2-3 hours
   - Slide-out panel component from right side
   - Cmd+K global keyboard shortcut hook
   - Quick capture input with autofocus
   - List items grouped by session
   - Process items (convert/archive/delete)
   - Local storage persistence
   - Sync with Supabase when online

#### 2. **Timer System (Phase 3.4)** - 2-3 hours
   - Horizontal progress bar components
   - Main session timer (top bar)
   - Checkpoint timer (nested bar)
   - Pomodoro presets (25/50/90 min)
   - Pause/resume controls
   - Audio notifications on complete
   - Web Workers for background timing
   - Timer state in localStorage

#### 3. **Mobile & Keyboard UX** - 1 hour
   - Responsive sidebar (collapse on mobile)
   - Bottom nav for mobile screens
   - Global keyboard shortcuts map
   - Escape to cancel, Enter to save everywhere

### 📝 Important Notes:
- Using bun instead of npm
- Supabase project is live and configured
- Google OAuth needs to be enabled in Supabase dashboard
- Multiple sessions per day supported in schema
- Design guidelines documented in CLAUDE.md