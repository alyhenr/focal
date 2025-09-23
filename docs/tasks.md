# Focal - Development Tasks

> **Project**: Focal - Mindful Productivity App
> **Concept**: One focus per session (multiple sessions per day allowed)
> **Stack**: Next.js 15, Supabase, Stripe, Tailwind CSS, shadcn/ui
> **Timeline**: 3 weeks to MVP

---

## =Ë Task Overview

- [ ] **Setup & Configuration** - Project foundation
- [ ] **Database & Authentication** - Core infrastructure
- [ ] **Core Features** - Essential functionality
- [ ] **Premium Features** - Monetization
- [ ] **Polish & Launch** - Production ready

---

## =€ Phase 1: Foundation Setup (Days 1-3)

### 1.1 Project Configuration
- [ ] Install core dependencies
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install stripe @stripe/stripe-js
  npm install framer-motion
  npm install date-fns
  npm install zustand
  npm install react-hook-form zod
  npm install lucide-react
  npm install clsx tailwind-merge
  npm install sonner next-themes
  ```

- [ ] Install dev dependencies
  ```bash
  npm install -D prettier eslint @typescript-eslint/eslint-plugin
  npm install -D eslint-config-next
  npm install -D @types/node
  ```

- [ ] Configure ESLint (.eslintrc.json)
- [ ] Configure Prettier (.prettierrc)
- [ ] Create environment variables template (.env.local.example)
  ```env
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
  ```

### 1.2 shadcn/ui Setup
- [ ] Initialize shadcn/ui with custom configuration
  ```bash
  npx shadcn@latest init
  ```
- [ ] Configure custom theme colors in tailwind.config.ts
- [ ] Add essential components
  ```bash
  npx shadcn@latest add button card dialog form
  npx shadcn@latest add input label select separator
  npx shadcn@latest add sheet skeleton tabs textarea
  npx shadcn@latest add toast tooltip switch
  ```

### 1.3 Project Structure
- [ ] Create folder structure
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
- [ ] Create Supabase project
- [ ] Configure authentication providers (magic link)
- [ ] Generate TypeScript types
  ```bash
  npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/supabase.ts
  ```

---

## =Ä Phase 2: Database & Authentication (Days 4-5)

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

## <¯ Phase 3: Core Features (Days 6-10)

### 3.1 Focus Session Management
- [ ] Create new focus session form
- [ ] Display active focus session
- [ ] Allow multiple sessions per day
- [ ] Session completion flow
- [ ] Session history for today
- [ ] Edit active session
- [ ] Delete/cancel session
- [ ] Auto-save functionality

### 3.2 Checkpoint System
- [ ] Add checkpoint to focus
- [ ] Edit checkpoint text
- [ ] Delete checkpoint
- [ ] Reorder checkpoints (drag & drop)
- [ ] Mark checkpoint complete
- [ ] Progress visualization
- [ ] Auto-complete focus when all checkpoints done
- [ ] Checkpoint limit (3 for free, unlimited for pro)

### 3.3 Later List
- [ ] Create capture modal (Cmd+K shortcut)
- [ ] Floating action button
- [ ] Display today's captured items
- [ ] Process items (convert/archive/delete)
- [ ] Auto-clear at day end option
- [ ] Local storage for offline capture
- [ ] Sync when online
- [ ] Item limit (50 per day)

### 3.4 Timer & Pomodoro
- [ ] Basic timer component
- [ ] Pomodoro mode (25 min default)
- [ ] Customizable duration (5-90 min)
- [ ] Break timer
- [ ] Pause/resume functionality
- [ ] Audio notifications
- [ ] Visual notifications
- [ ] Background timer (Web Workers)

---

## =Ž Phase 4: Premium Features (Days 11-13)

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

## >ê Phase 6: Testing & QA (Days 17-18)

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

## =¢ Phase 7: Launch Preparation (Days 19-21)

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

## =¡ Future Enhancements (Post-MVP)

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

## =Ê Progress Tracking

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

## <¯ Success Metrics

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

## =Ý Notes

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

*Last Updated: [Current Date]*
*Status: Planning Complete - Ready for Development*