# Focal - Project Brief

## Executive Summary
Focal is a mindful productivity web application that helps knowledge workers overcome daily overwhelm by limiting them to a single, meaningful focus per session. By combining psychological principles with beautiful, calming design, Focal transforms chaotic workdays into purposeful, accomplished ones.

---

## Problem Statement
Knowledge workers face constant context-switching, endless to-do lists, and the anxiety of choosing what to work on next. This leads to:
- Decision fatigue and procrastination
- Shallow work across many tasks instead of deep work on important ones
- End-of-day dissatisfaction despite being "busy"
- Lost ideas and thoughts due to poor capture systems
- Lack of connection between daily tasks and larger goals

---

## Solution
Focal provides:
1. **One Focus Per Session**: A hard constraint that forces prioritization
2. **Later List**: A persistent capture system for "shiny objects" that preserves focus
3. **North Star Goals**: Visual connection between daily work and meaningful objectives
4. **Calm Design**: Anxiety-reducing interface with mindful interactions
5. **Progress Tracking**: Non-shameful streaks and completion patterns

---

## Target Audience

### Primary Users
- **Solo Professionals**: Freelancers, consultants, indie hackers
- **Knowledge Workers**: Developers, designers, writers, researchers
- **Students**: Graduate students, online learners, bootcamp participants
- **Side Project Builders**: People working on passion projects outside their 9-5

### User Characteristics
- Struggle with prioritization and focus
- Value intentionality over raw productivity
- Appreciate beautiful, minimal design
- Willing to pay for mental clarity and peace of mind
- Self-directed with flexible schedules

---

## Core Value Propositions

### For Users
1. **Clarity**: Know exactly what to work on today
2. **Focus**: Protected deep work time without context switching
3. **Progress**: Visible connection between daily work and life goals
4. **Peace**: Reduced anxiety through constraint and beautiful design
5. **Accomplishment**: End each day knowing you moved the needle on what matters

### Competitive Advantages
- **Opinionated Design**: One focus per session isn't configurable—it's the product
- **Psychology-First**: Built on research about focus, motivation, and habit formation
- **Capture Without Context Switch**: Later List keeps you in flow
- **Beautiful Simplicity**: Premium feel without complexity
- **Goal Alignment**: See how today contributes to tomorrow

---

## Business Model

### Freemium Structure
- **Free Tier**: 
  - Full access to daily focus creation
  - Later List functionality
  - Basic timer
  - Current day's data only
  
- **Pro Tier ($5/month or $49/year)**:
  - Complete focus history
  - North Star goals and progress tracking
  - Analytics and insights
  - Weekly/monthly email summaries
  - Data export
  - Custom themes

### Monetization Strategy
- **Conversion Driver**: Users want to see their progress over time
- **Trial Period**: 7-day free trial of Pro features
- **Annual Discount**: ~18% discount for annual commitment
- **Future Pricing**: May increase to $7-9/month as features expand

---

## Technical Architecture

### Core Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (magic links)
- **Payments**: Stripe (subscriptions)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS + Shadcn/ui
- **Animations**: Framer Motion
- **Analytics**: Posthog
- **Emails**: Resend

### Key Technical Decisions
- **Server Components**: For fast initial loads
- **Optimistic Updates**: For responsive interactions
- **RLS Policies**: For secure, user-scoped data
- **Edge Functions**: For scheduled tasks and reminders
- **PWA-Ready**: For mobile app-like experience

---

## Development Phases

### Phase 1: Core Loop (Week 1)
- User authentication
- Daily focus creation
- Checkpoint management
- Later List (shiny objects capture)
- Basic timer functionality
- Beautiful, responsive UI

### Phase 2: Meaningful Progress (Week 2)
- North Star goals
- Focus-to-goal linking
- Progress visualizations
- Streak tracking
- Yesterday's review
- Energy level tracking

### Phase 3: Premium & Polish (Week 3)
- Stripe subscription integration
- History and search
- Analytics dashboard
- Email summaries
- Data export
- Custom themes

### Phase 4: Enhancement (Post-Launch)
- AI suggestions for focus creation
- Team/accountability features
- Mobile apps (React Native)
- Calendar integration
- Time tracking analytics
- Public progress pages

---

## Success Metrics

### User Engagement
- **Daily Active Users**: Target 60% DAU/MAU ratio
- **Completion Rate**: >70% of created focuses get completed
- **Streak Length**: Average streak >5 days
- **Later List Usage**: >50% of users use capture feature daily

### Business Metrics
- **Conversion Rate**: 10% free-to-paid after trial
- **Churn Rate**: <5% monthly
- **LTV**: >$100 per user
- **MRR Growth**: 20% month-over-month

### Product Health
- **Time to First Focus**: <2 minutes
- **Page Load Speed**: <1 second
- **Support Tickets**: <5% of MAU
- **App Store Rating**: >4.5 stars

---

## Design Principles

### Product Philosophy
1. **Constraint as Feature**: Limitations create freedom
2. **Calm Technology**: Every interaction reduces anxiety
3. **Progress over Perfection**: Partial completion is celebrated
4. **Beautiful Simplicity**: Premium feel through restraint
5. **Mindful Defaults**: Smart without being pushy

### UI/UX Guidelines
- **Typography First**: Beautiful, readable text is the primary UI
- **Generous Whitespace**: Let the interface breathe
- **Subtle Animation**: Micro-interactions that delight
- **Accessible**: WCAG AA compliant
- **Mobile-First**: Touch-friendly, responsive design

---

## Risks & Mitigations

### Technical Risks
- **Scaling Issues**: Mitigated by Vercel/Supabase infrastructure
- **Data Loss**: Regular backups, soft deletes
- **Security Breach**: RLS policies, security audits

### Business Risks
- **Low Conversion**: Extended trial, better onboarding
- **High Churn**: Email engagement, feature education
- **Competition**: Focus on unique constraint-based approach

### User Risks
- **Adoption Friction**: Smooth onboarding, clear value prop
- **Habit Formation**: Daily reminders, streak mechanics
- **Feature Creep**: Maintain opinionated stance

---

## Launch Strategy

### Pre-Launch (Week -1)
- Beta test with 20-30 users
- Refine onboarding based on feedback
- Prepare launch materials
- Set up analytics and monitoring

### Launch Week
- **Day 1**: Soft launch to email list
- **Day 2**: ProductHunt submission
- **Day 3**: Hacker News Show HN
- **Day 4-5**: Twitter/X influencer outreach
- **Day 6-7**: Reddit (relevant subreddits)

### Post-Launch
- Weekly feature releases
- Community building (Discord/Slack)
- Content marketing (blog about focus/productivity)
- Referral program implementation

---

## Team & Resources

### Current Team
- **Founder/Developer**: Full-stack development, product design
- **Future Hires** (Post-Revenue):
  - Part-time customer success
  - Contract content writer
  - UI/UX designer for v2

### Budget Estimates
- **Development**: 120-150 hours for MVP
- **Monthly Costs** (at launch): ~$50
- **Monthly Costs** (100 users): ~$200
- **Monthly Costs** (1000 users): ~$500

---

## Appendix

### Competitive Landscape
- **Todoist/Things**: Too complex, no focus constraint
- **Sunsama**: Too expensive ($20/month), calendar-heavy
- **Akiflow**: Command-bar focused, not mindful
- **Forest**: Gamification over meaningful progress
- **Focal's Niche**: Affordable, constraint-based, goal-aligned

### Research & Inspiration
- Cal Newport's "Deep Work"
- BJ Fogg's "Tiny Habits"
- Nir Eyal's "Indistractable"
- Time-boxing research (Parkinson's Law)
- Implementation intentions (Peter Gollwitzer)