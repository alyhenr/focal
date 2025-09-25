# Focal - Product Requirements Document (PRD)

## 1. Product Overview

### 1.1 Product Vision
Create a mindful productivity platform that transforms overwhelming workdays into focused, meaningful progress through the power of singular attention and goal alignment.

### 1.2 Product Goals
- Reduce decision fatigue by limiting users to one focus per session
- Capture distractions without breaking flow state
- Connect daily work to larger life objectives
- Provide a calm, anxiety-reducing work environment
- Build sustainable productivity habits through gentle constraints

### 1.3 Success Criteria
- 60% of users complete their session block of focus
- 40% of users maintain a streak >7 days
- 10% free-to-paid conversion rate
- <2% monthly churn rate for paid users
- 4.5+ app store rating

---

## 2. User Stories & Requirements

### 2.1 Authentication & Onboarding

#### User Stories
- As a new user, I want to sign up quickly so I can start using the app immediately
- As a returning user, I want to log in securely without remembering another password
- As a new user, I want to understand the app's philosophy quickly

#### Functional Requirements
- **FR-AUTH-001**: Magic link authentication via email
- **FR-AUTH-002**: Session persistence for 30 days
- **FR-AUTH-003**: Onboarding flow (3 screens maximum)
- **FR-AUTH-004**: Skip option for onboarding
- **FR-AUTH-005**: Account deletion capability (GDPR compliance)

#### Technical Requirements
- Supabase Auth implementation
- JWT token management
- Secure session storage
- Email verification flow

### 2.2 Focus Management

#### User Stories
- As a user, I want to create one meaningful block session to focus
- As a user, I want to break my focus into manageable checkpoints
- As a user, I want to see my progress visually as I work
- As a user, I want to mark my focus complete and feel accomplished

#### Functional Requirements
- **FR-FOCUS-001**: Create exactly one main block for session
- **FR-FOCUS-002**: Focus includes title (required) and description (optional)
- **FR-FOCUS-003**: Add up to 3 checkpoints per focus for free plan, and unlimited for premium
- **FR-FOCUS-004**: Reorder checkpoints via drag-and-drop
- **FR-FOCUS-005**: Mark checkpoints as complete
- **FR-FOCUS-006**: Edit focus/checkpoints until marked complete
- **FR-FOCUS-007**: Mark entire focus as complete. The app automaticaly does this when all checklists of the block are completed, and vice-versa, if block is marked as completed all checkpoints are too.
- **FR-FOCUS-008**: View completion animation/celebration

#### Technical Requirements
- Optimistic UI updates
- Automatic save on change
- Timezone-aware date handling
- Soft delete for data recovery

### 2.3 Later List (Shiny Objects Capture)

#### User Stories
- As a user, I want to capture distracting thoughts without losing focus
- As a user, I want to process captured items after my focus session
- As a user, I want quick keyboard access to capture

#### Functional Requirements
- **FR-LATER-001**: Floating action button always visible during focus
- **FR-LATER-002**: Keyboard shortcut (Cmd/Ctrl + K) to open capture
- **FR-LATER-003**: Single text field for quick capture
- **FR-LATER-004**: List shows all items captured today
- **FR-LATER-005**: Process items: convert to tomorrow's focus, archive, or delete
- **FR-LATER-006**: Auto-clear option at day's end
- **FR-LATER-007**: Nice UI that motivates and gives a sensation of brain activity and "building myself up", in a notebook style.

#### Technical Requirements
- Local storage for offline capture
- Sync when connection restored
- Keyboard event handling
- Toast notifications for confirmations

### 2.4 North Star Goals

#### User Stories
- As a user, I want to define my larger life/work goals
- As a user, I want to connect my daily focus to meaningful objectives
- As a user, I want to see how today's work contributes to my goals

#### Functional Requirements
- **FR-GOAL-001**: Create up to 3 North Star goals for free plan, and unlimited for premium.
- **FR-GOAL-002**: Goal includes title, description, and target date
- **FR-GOAL-003**: Link daily focus to a goal (optional)
- **FR-GOAL-004**: Visual progress indicator per goal
- **FR-GOAL-005**: Goal completion celebration
- **FR-GOAL-006**: Archive completed goals
- **FR-GOAL-007**: Edit active goals anytime

#### Technical Requirements
- Goal-focus relationship in database
- Progress calculation algorithm
- Data visualization components

### 2.5 Timer & Work Sessions

#### User Stories
- As a user, I want to time my focus sessions
- As a user, I want to use the Pomodoro technique
- As a user, I want to track my energy levels

#### Functional Requirements
- **FR-TIMER-001**: Optional timer for focus sessions
- **FR-TIMER-002**: Default 25-minute Pomodoro timer
- **FR-TIMER-003**: Customizable timer duration (5-90 minutes)
- **FR-TIMER-004**: Break timer (5 minutes default)
- **FR-TIMER-005**: Audio/visual notification on timer end
- **FR-TIMER-006**: Pause/resume capability
- **FR-TIMER-007**: Energy level selector (High/Medium/Low)
- **FR-TIMER-008**: Session history tracking

#### Technical Requirements
- Web Workers for background timing
- Browser notification API
- Audio API for sounds
- LocalStorage for timer state

### 2.6 Progress & Analytics (Pro Feature)

#### User Stories
- As a user, I want to see my focus history
- As a user, I want to understand my productivity patterns
- As a user, I want to maintain motivation through streaks

#### Functional Requirements
- **FR-ANALYTICS-001**: Focus history view (calendar and list)
- **FR-ANALYTICS-002**: Search and filter past focuses
- **FR-ANALYTICS-003**: Completion rate statistics
- **FR-ANALYTICS-004**: Time-of-day patterns
- **FR-ANALYTICS-005**: Goal progress over time
- **FR-ANALYTICS-006**: Streak tracking (current and longest)
- **FR-ANALYTICS-007**: Weekly/monthly summaries
- **FR-ANALYTICS-008**: Export data as CSV/JSON

#### Technical Requirements
- Efficient database queries
- Data aggregation functions
- Chart visualization library
- Export utilities

### 2.7 Subscription & Payments

#### User Stories
- As a user, I want to try Pro features before paying
- As a user, I want to manage my subscription easily
- As a user, I want to upgrade/downgrade anytime

#### Functional Requirements
- **FR-PAY-001**: 7-day free trial for new users
- **FR-PAY-002**: Monthly ($5) and annual ($49) plans
- **FR-PAY-003**: Stripe checkout integration
- **FR-PAY-004**: Subscription management portal
- **FR-PAY-005**: Immediate access on payment
- **FR-PAY-006**: Grace period for failed payments
- **FR-PAY-007**: Downgrade preserves data (hidden)

#### Technical Requirements
- Stripe webhook handling
- Subscription status sync
- Payment failure recovery
- Proration handling

---

## 3. Database Schema

```sql
-- Users table (managed by Supabase Auth)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'free',
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}'
)

-- North Star Goals
north_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0
)

-- Daily Focuses
focuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  north_star_id UUID REFERENCES north_stars(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  energy_level TEXT CHECK (energy_level IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, date)
)

-- Checkpoints (subtasks)
checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_id UUID REFERENCES focuses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Later List Items
later_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT CHECK (action_taken IN ('converted', 'archived', 'deleted'))
)

-- Timer Sessions
timer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_id UUID REFERENCES focuses(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  was_completed BOOLEAN DEFAULT FALSE,
  session_type TEXT CHECK (session_type IN ('work', 'break'))
)

-- Streaks
streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_focus_date DATE,
  total_focuses_completed INTEGER DEFAULT 0
)

-- Analytics Events (for custom tracking)
analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Indexes for performance
CREATE INDEX idx_focuses_user_date ON focuses(user_id, date DESC);
CREATE INDEX idx_focuses_completed ON focuses(user_id, completed_at);
CREATE INDEX idx_checkpoints_focus ON checkpoints(focus_id, display_order);
CREATE INDEX idx_later_items_user_date ON later_items(user_id, date);
CREATE INDEX idx_timer_sessions_focus ON timer_sessions(focus_id);
```

---

## 4. API Endpoints

### Authentication
```
POST   /api/auth/magic-link     - Send magic link email
GET    /api/auth/verify         - Verify magic link token
POST   /api/auth/logout         - End session
GET    /api/auth/session        - Get current session
```

### Focus Management
```
GET    /api/focus/today         - Get today's focus
POST   /api/focus               - Create focus
PATCH  /api/focus/:id           - Update focus
DELETE /api/focus/:id           - Delete focus
POST   /api/focus/:id/complete  - Mark focus complete
```

### Checkpoints
```
POST   /api/checkpoints              - Create checkpoint
PATCH  /api/checkpoints/:id          - Update checkpoint
DELETE /api/checkpoints/:id          - Delete checkpoint
POST   /api/checkpoints/:id/toggle   - Toggle completion
PATCH  /api/checkpoints/reorder      - Reorder checkpoints
```

### Later List
```
GET    /api/later-items         - Get today's items
POST   /api/later-items         - Create item
DELETE /api/later-items/:id     - Delete item
POST   /api/later-items/process - Process items batch
```

### Goals
```
GET    /api/goals               - Get all goals
POST   /api/goals               - Create goal
PATCH  /api/goals/:id           - Update goal
DELETE /api/goals/:id           - Delete goal
POST   /api/goals/:id/archive   - Archive goal
```

### Timer
```
POST   /api/timer/start         - Start session
POST   /api/timer/pause         - Pause session
POST   /api/timer/stop          - Stop session
GET    /api/timer/current       - Get current session
```

### Analytics (Pro)
```
GET    /api/analytics/history   - Get focus history
GET    /api/analytics/stats     - Get statistics
GET    /api/analytics/streaks   - Get streak data
GET    /api/analytics/export    - Export data
```

### Subscription
```
POST   /api/subscription/checkout    - Create checkout session
POST   /api/subscription/portal      - Create portal session
POST   /api/subscription/webhook     - Stripe webhook handler
GET    /api/subscription/status      - Get subscription status
```

---

## 5. UI/UX Specifications

### 5.1 Design System

#### Colors
```css
--primary: #6366F1;        /* Indigo - Main actions */
--secondary: #8B5CF6;      /* Purple - Accent */
--success: #10B981;        /* Green - Completion */
--warning: #F59E0B;        /* Amber - Warnings */
--danger: #EF4444;         /* Red - Destructive */
--neutral-50: #FAFAFA;     /* Lightest gray */
--neutral-100: #F4F4F5;
--neutral-200: #E4E4E7;
--neutral-300: #D4D4D8;
--neutral-400: #A1A1AA;
--neutral-500: #71717A;
--neutral-600: #52525B;
--neutral-700: #3F3F46;
--neutral-800: #27272A;
--neutral-900: #18181B;    /* Darkest gray */
```

#### Typography
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

#### Spacing
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

### 5.2 Key Screens

#### Dashboard (Home)
- **Header**: Minimal with date and settings icon
- **Main Area**: Today's focus card (centered, prominent)
- **Focus Card**: Title, description, progress ring, checkpoints
- **Later List**: Slide-out panel from right
- **Timer**: Floating widget (bottom right)
- **Quick Stats**: Streak counter (subtle, top right)

#### Focus Creation
- **Modal/Full Screen**: Clean, distraction-free
- **Fields**: Title (large), description (optional), goal selector
- **Checkpoints**: Add button, inline editing
- **CTA**: Single "Start Focusing" button

#### History View (Pro)
- **Calendar View**: Month grid with completion indicators
- **List View**: Searchable, filterable list
- **Detail View**: Click to expand any past focus
- **Export**: Button in top right

#### Goals Management
- **Cards Layout**: Up to 3 goal cards
- **Progress Visualization**: Circular progress or bar
- **Linked Focuses**: Count and recent list
- **Actions**: Edit, archive, delete

### 5.3 Responsive Breakpoints
```css
/* Mobile First Approach */
--mobile: 0px;        /* Default */
--tablet: 768px;      /* md: */
--desktop: 1024px;    /* lg: */
--wide: 1280px;       /* xl: */
```

### 5.4 Animation Guidelines
- **Duration**: 200-300ms for micro-interactions
- **Easing**: ease-in-out for most transitions
- **Celebrations**: 500-800ms for completion animations
- **Loading**: Skeleton screens, no spinners
- **Principles**: Subtle, purposeful, not distracting

---

## 6. Security & Privacy

### 6.1 Security Requirements
- **Row Level Security**: All database queries scoped to user
- **HTTPS Only**: Enforce SSL in production
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API endpoint rate limits
- **CSRF Protection**: Token validation
- **XSS Prevention**: Sanitize all user input
- **SQL Injection**: Parameterized queries only

### 6.2 Privacy Requirements
- **Data Minimization**: Only collect necessary data
- **GDPR Compliance**: Right to delete, export
- **Encryption**: Sensitive data encrypted at rest
- **No Third-Party Sharing**: User data never sold
- **Anonymous Analytics**: No PII in analytics
- **Clear Privacy Policy**: Plain language

---

## 7. Performance Requirements

### 7.1 Load Times
- **Initial Load**: <1 second (First Contentful Paint)
- **Time to Interactive**: <2 seconds
- **API Response**: <200ms for reads, <500ms for writes
- **Search Results**: <100ms for local, <300ms for server

### 7.2 Scalability
- **Concurrent Users**: Support 10,000 MAU initially
- **Database**: <50ms query time at scale
- **Storage**: 10MB per user average
- **Bandwidth**: Optimize for mobile data usage

### 7.3 Reliability
- **Uptime**: 99.9% availability
- **Error Rate**: <1% of API calls
- **Data Loss**: Zero tolerance
- **Backup**: Daily automated backups

---

## 8. Testing Requirements

### 8.1 Unit Testing
- **Coverage**: Minimum 80% code coverage
- **Critical Paths**: 100% coverage for auth, payments
- **Framework**: Jest/Vitest for JavaScript

### 8.2 Integration Testing
- **API Testing**: All endpoints tested
- **Database**: Migration and rollback tests
- **Payment Flow**: Stripe test mode validation

### 8.3 E2E Testing
- **User Flows**: Critical path testing
- **Framework**: Playwright or Cypress
- **Device Testing**: Chrome, Safari, Firefox, Mobile

### 8.4 Manual Testing
- **Onboarding**: New user experience
- **Edge Cases**: Timezone changes, data limits
- **Accessibility**: Keyboard navigation, screen readers

---

## 9. Launch Checklist

### Pre-Launch
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] Stripe production keys configured
- [ ] Error monitoring (Sentry) setup
- [ ] Analytics (Posthog) configured
- [ ] Backup system tested
- [ ] Legal pages (Privacy, Terms) published
- [ ] Support email configured
- [ ] Documentation written

### Launch Day
- [ ] Production deployment verified
- [ ] DNS configured correctly
- [ ] SSL certificate active
- [ ] Monitoring dashboards ready
- [ ] Team communication channels open
- [ ] Social media accounts ready
- [ ] ProductHunt submission prepared

### Post-Launch
- [ ] Monitor error rates
- [ ] Track conversion funnel
- [ ] Gather user feedback
- [ ] Fix critical bugs immediately
- [ ] Plan first feature update
- [ ] Send launch recap email

---

## 10. Future Considerations

### Potential Features (V2)
- AI-powered focus suggestions
- Team accountability groups
- Voice input for Later List
- Calendar integration
- Time tracking automation
- Public progress pages
- Desktop/mobile apps
- Slack/Discord integration
- Focus templates library
- Mood tracking

### Technical Debt to Address
- Implement comprehensive caching strategy
- Add real-time collaboration infrastructure
- Optimize database queries with better indexes
- Implement queue system for background jobs
- Add comprehensive API documentation
- Create admin dashboard for support

### Scaling Considerations
- CDN for static assets
- Database read replicas
- Redis for session management
- Horizontal scaling strategy
- Microservices architecture (if needed)
- International expansion (i18n)